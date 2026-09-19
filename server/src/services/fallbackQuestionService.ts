export interface FallbackQuestionResponse {
  next_question: string;
  question_type: 'choice' | 'severity' | 'duration' | 'text' | 'yes_no';
  section: string;
  reason: string;
  should_continue: boolean;
  options?: string[];
  collected_fields?: Record<string, any>;
}

export interface ConversationTurn {
  questionText: string;
  answerText: string;
  section: string;
}

export class FallbackQuestionService {
  /**
   * Deterministic clinical inquiry tree based on standard OPD history-taking protocols:
   * 1. Chief Complaint
   * 2. History of Present Illness (Onset, Duration, Location, Severity, Character, Aggravating/Relieving)
   * 3. Past Medical History
   * 4. Surgical History
   * 5. Medications
   * 6. Allergies
   */
  static getNextQuestion(
    chiefComplaint: string,
    previousResponses: ConversationTurn[],
    currentSection: string = 'chief_complaint'
  ): FallbackQuestionResponse {
    const totalAnswered = previousResponses.length;

    // Step 1: Onset & Duration
    if (totalAnswered === 0) {
      return {
        next_question: 'When did this symptom or discomfort first begin?',
        question_type: 'duration',
        section: 'history_of_present_illness',
        reason: 'Establishing temporal onset of primary complaint',
        should_continue: true,
        options: ['Just today (< 24 hours)', '1 to 3 days ago', '1 to 2 weeks ago', 'More than a month ago']
      };
    }

    // Step 2: Severity Scale
    if (totalAnswered === 1) {
      return {
        next_question: 'On a scale from 1 (mild) to 10 (unbearable), how severe is your discomfort right now?',
        question_type: 'severity',
        section: 'history_of_present_illness',
        reason: 'Quantifying severity for triage prioritization',
        should_continue: true,
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
      };
    }

    // Step 3: Pain / Symptom Character
    if (totalAnswered === 2) {
      return {
        next_question: 'How would you describe the feeling or pain?',
        question_type: 'choice',
        section: 'history_of_present_illness',
        reason: 'Characterizing symptom quality',
        should_continue: true,
        options: ['Sharp / Stabbing', 'Dull ache / Heavy', 'Burning sensation', 'Throbbing / Pulsing', 'Cramping']
      };
    }

    // Step 4: Associated Red-Flag Symptoms
    if (totalAnswered === 3) {
      return {
        next_question: 'Are you experiencing any other symptoms such as fever, vomiting, dizziness, or shortness of breath?',
        question_type: 'choice',
        section: 'history_of_present_illness',
        reason: 'Screening for constitutional or systemic warning signs',
        should_continue: true,
        options: ['Fever or chills', 'Nausea or vomiting', 'Dizziness or fainting', 'Shortness of breath', 'None of these']
      };
    }

    // Step 5: Past Medical History
    if (totalAnswered === 4) {
      return {
        next_question: 'Do you have any ongoing medical conditions diagnosed by a doctor?',
        question_type: 'choice',
        section: 'past_medical_history',
        reason: 'Identifying chronic pre-existing morbidities',
        should_continue: true,
        options: ['Diabetes (High Sugar)', 'Hypertension (High BP)', 'Asthma / Respiratory issues', 'Heart disease', 'None / No chronic conditions']
      };
    }

    // Step 6: Current Medications
    if (totalAnswered === 5) {
      return {
        next_question: 'Are you currently taking any regular prescription medicines or painkillers?',
        question_type: 'yes_no',
        section: 'medications',
        reason: 'Reconciling drug regimen and potential interactions',
        should_continue: true,
        options: ['Yes, taking regular medicines', 'No regular medicines', 'Only occasional over-the-counter painkillers']
      };
    }

    // Step 7: Allergies
    if (totalAnswered === 6) {
      return {
        next_question: 'Do you have any known allergies to medicines (such as penicillin or paracetamol) or foods?',
        question_type: 'choice',
        section: 'allergies',
        reason: 'Recording drug allergy safeguards before prescription',
        should_continue: true,
        options: ['No known allergies (NKDA)', 'Allergic to Penicillin / Antibiotics', 'Allergic to Painkillers (NSAIDs)', 'Other medicine allergy', 'Food allergy']
      };
    }

    // Completion State
    return {
      next_question: 'Thank you. Sufficient clinical intake information has been gathered for your attending doctor.',
      question_type: 'text',
      section: 'intake_complete',
      reason: 'Intake protocol completed',
      should_continue: false,
      collected_fields: {
        intake_status: 'COMPLETE'
      }
    };
  }
}
