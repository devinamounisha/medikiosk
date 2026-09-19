import { config } from '../config/env.js';
import { z } from 'zod';
import { FallbackQuestionService, FallbackQuestionResponse, ConversationTurn } from './fallbackQuestionService.js';

// Schema for structured JSON response from Groq
const aiQuestionResponseSchema = z.object({
  next_question: z.string().min(3),
  question_type: z.enum(['text', 'choice', 'severity', 'duration', 'yes_no']).default('text'),
  section: z.string().default('history_of_present_illness'),
  reason: z.string().default('Clinical clarification'),
  should_continue: z.boolean().default(true),
  options: z.array(z.string()).optional(),
  collected_fields: z.record(z.any()).optional()
});

export class GroqService {
  private static readonly SYSTEM_PROMPT = `
You are the MediKiosk Clinical Intake AI Assistant for a busy hospital Outpatient Department (OPD).
Your role is EXCLUSIVELY to assist with clinical history collection for an attending doctor.

CRITICAL MEDICAL SAFETY BOUNDARIES:
- You are assisting with clinical history collection ONLY.
- You are NOT diagnosing the patient under any circumstances.
- Do NOT prescribe or suggest medications.
- Do NOT claim certainty or conjecture about any disease or medical condition.
- Do NOT invent or assume missing patient information. If information is unavailable, use "Not provided" or "Unknown".
- Ask ONE clear question at a time. Keep questions concise and simple.
- Avoid unnecessary medical jargon; use simple, compassionate layperson language.
- Ask relevant clinical follow-up questions based on the chief complaint and answers already provided.
- Explore standard clinical history sections in a logical order:
  1. History of Present Illness (Onset, Duration, Location, Severity 1-10, Character, Associated symptoms)
  2. Past Medical History (Chronic diseases)
  3. Current Medications
  4. Known Allergies
- Stop when sufficient information has been collected (maximum 6 to 8 questions total). Set "should_continue": false when complete.
- Highlight any urgent/red flag symptoms in "reason" or "collected_fields" for doctor triage review.

You MUST reply with ONLY a single valid JSON object matching this schema:
{
  "next_question": "string (The single question to ask the patient)",
  "question_type": "text | choice | severity | duration | yes_no",
  "section": "history_of_present_illness | past_medical_history | past_surgical_history | medications | allergies | family_history | personal_history | intake_complete",
  "reason": "string (Why this clinical follow-up is needed)",
  "should_continue": boolean (true if more questions needed, false if history is sufficient),
  "options": ["string"] (Optional array of 3-5 simple touch options if question_type is choice, duration, or yes_no),
  "collected_fields": {} (Optional key-value object of extracted clinical facts so far)
}
`;

  static async generateNextQuestion(params: {
    chiefComplaint: string;
    previousResponses: ConversationTurn[];
    currentSection?: string;
    language?: string;
    patientAge?: number;
    patientGender?: string;
  }): Promise<FallbackQuestionResponse> {
    const { chiefComplaint, previousResponses, currentSection = 'chief_complaint', language = 'en', patientAge, patientGender } = params;

    // If Groq API key is not configured, immediately use deterministic fallback engine
    if (!config.groqApiKey) {
      console.log('ℹ️ Groq API key not provided; using deterministic clinical question engine.');
      return FallbackQuestionService.getNextQuestion(chiefComplaint, previousResponses, currentSection);
    }

    try {
      // Build conversation prompt context
      const contextMessages = [
        { role: 'system', content: this.SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            patient_demographics: {
              age: patientAge ?? 'Unknown',
              gender: patientGender ?? 'Unknown',
              preferred_language: language
            },
            chief_complaint: chiefComplaint,
            current_section: currentSection,
            history_collected_so_far: previousResponses.map((r, idx) => ({
              turn: idx + 1,
              section: r.section,
              question_asked: r.questionText,
              patient_answer: r.answerText
            })),
            instruction: previousResponses.length >= 7
              ? 'Sufficient information has been gathered. Conclude the interview by setting should_continue to false.'
              : 'Determine the single most relevant next clinical question to ask the patient.'
          })
        }
      ];

      // Call Groq OpenAI-compatible chat completion
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000); // 9-second timeout safeguard

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.groqApiKey}`
        },
        body: JSON.stringify({
          model: config.groqModel || 'llama-3.3-70b-versatile',
          messages: contextMessages,
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 500
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Groq API responded with status ${response.status}: ${errText}. Falling back to deterministic engine.`);
        return FallbackQuestionService.getNextQuestion(chiefComplaint, previousResponses, currentSection);
      }

      const responseData = await response.json();
      const rawContent = responseData.choices?.[0]?.message?.content;

      if (!rawContent) {
        console.warn('Groq returned empty completion content. Using fallback engine.');
        return FallbackQuestionService.getNextQuestion(chiefComplaint, previousResponses, currentSection);
      }

      // Parse and validate with Zod
      const parsed = JSON.parse(rawContent);
      const validated = aiQuestionResponseSchema.safeParse(parsed);

      if (!validated.success) {
        console.warn('Groq response failed schema validation. Falling back.', validated.error.format());
        return FallbackQuestionService.getNextQuestion(chiefComplaint, previousResponses, currentSection);
      }

      return {
        next_question: validated.data.next_question,
        question_type: validated.data.question_type,
        section: validated.data.section,
        reason: validated.data.reason,
        should_continue: validated.data.should_continue,
        options: validated.data.options,
        collected_fields: validated.data.collected_fields
      };
    } catch (error: any) {
      console.warn('Error during Groq AI call, smoothly engaging clinical fallback:', error.message || error);
      return FallbackQuestionService.getNextQuestion(chiefComplaint, previousResponses, currentSection);
    }
  }
}
