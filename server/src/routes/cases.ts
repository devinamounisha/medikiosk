import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { DataStore } from '../services/store.js';

export const casesRouter = Router();

const createCaseSchema = z.object({
  patientId: z.string().uuid(),
  chiefComplaint: z.string().min(3, 'Chief complaint must be provided'),
  triagePriority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).optional().default('ROUTINE')
});

casesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validated = createCaseSchema.parse(req.body);
    const newCase = await DataStore.createCase(
      validated.patientId,
      validated.chiefComplaint,
      validated.triagePriority
    );

    return res.status(201).json({
      success: true,
      case: newCase
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

casesRouter.get('/queue', async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || undefined;
    const cases = await DataStore.getQueue(status);

    return res.json({
      success: true,
      count: cases.length,
      cases
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch queue'
    });
  }
});

casesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const patientCase = await DataStore.getCaseById(req.params.id);
    if (!patientCase) {
      return res.status(404).json({
        success: false,
        error: 'Patient case not found'
      });
    }

    return res.json({
      success: true,
      case: patientCase
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch case details'
    });
  }
});

// Save interview response
casesRouter.post('/:id/responses', async (req: Request, res: Response) => {
  const caseId = req.params.id;
  const { questionText, answerText, section, inputModality, confidenceScore } = req.body;
  try {
    await DataStore.saveResponse(caseId, {
      questionText,
      answerText,
      section,
      inputModality,
      confidenceScore,
      createdAt: new Date().toISOString()
    });
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Save response error:', err);
    return res.status(500).json({ success: false, error: err.message ?? 'Failed to save response' });
  }
});

// Get interview transcript
casesRouter.get('/:id/responses', async (req: Request, res: Response) => {
  const caseId = req.params.id;
  try {
    const responses = await DataStore.getResponses(caseId);
    return res.json({ success: true, responses });
  } catch (err: any) {
    console.error('Get responses error:', err);
    return res.status(500).json({ success: false, error: err.message ?? 'Failed to fetch responses' });
  }
});
casesRouter.post('/:id/complete-intake', async (req: Request, res: Response) => {
  const caseId = req.params.id;
  try {
    await DataStore.updateCaseStatus(caseId, 'REVIEW_PENDING');
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Complete intake error:', err);
    return res.status(500).json({ success: false, error: err.message ?? 'Failed to complete intake' });
  }
});
