import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { DataStore } from '../services/store.js';

export const consentsRouter = Router();

const consentSchema = z.object({
  patientId: z.string().uuid(),
  caseId: z.string().uuid().optional(),
  consentType: z.string().default('AI_ASSISTED_HISTORY_COLLECTION'),
  agreed: z.boolean(),
  ipOrKioskId: z.string().default('KIOSK_OPD_01')
});

consentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validated = consentSchema.parse(req.body);
    if (!validated.agreed) {
      return res.status(400).json({
        success: false,
        error: 'Patient consent must be granted to proceed with AI-assisted intake.'
      });
    }

    const consent = await DataStore.saveConsent(validated);

    return res.status(201).json({
      success: true,
      consent
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: err.errors
      });
    }
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to record consent'
    });
  }
});
