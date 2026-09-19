import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { DataStore } from '../services/store.js';

export const patientsRouter = Router();

const patientIdentifySchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().int().min(0).max(130),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  abhaId: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  preferredLanguage: z.string().optional().default('en')
});

patientsRouter.post('/identify', async (req: Request, res: Response) => {
  try {
    const validated = patientIdentifySchema.parse(req.body);
    const patient = await DataStore.findOrCreatePatient(validated);

    return res.status(200).json({
      success: true,
      patient
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
      error: err.message || 'Internal server error'
    });
  }
});
