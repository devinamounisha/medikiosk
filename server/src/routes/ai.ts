import { Router, Request, Response } from 'express';
import { GroqService } from '../services/groqService.js';

export const aiRouter = Router();

aiRouter.post('/next-question', async (req: Request, res: Response) => {
  try {
    const {
      chiefComplaint,
      previousResponses,
      currentSection,
      language,
      patientAge,
      patientGender
    } = req.body;

    // Validate required data
    if (!chiefComplaint || typeof chiefComplaint !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'chiefComplaint is required'
      });
    }

    const next = await GroqService.generateNextQuestion({
      chiefComplaint,
      previousResponses: previousResponses ?? [],
      currentSection,
      language,
      patientAge,
      patientGender
    });

    return res.json({
      success: true,
      nextQuestion: next
    });

  } catch (err: any) {
    console.error('AI next-question error:', err);

    return res.status(500).json({
      success: false,
      error: err?.message ?? 'Failed to generate question'
    });
  }
});