import { Router } from 'express';
import { DataStore } from '../services/store.js';
import { SummaryService } from '../services/summaryService.js';

const router = Router();

// Generate and store summary
router.post('/:id/summary', async (req, res) => {
  const caseId = req.params.id;
  try {
    const summaryText = await SummaryService.generateSummary(caseId);
    await DataStore.saveSummary(caseId, { text: summaryText });
    res.json({ summary: summaryText });
  } catch (e) {
    console.error('Error generating summary:', e);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Retrieve stored summary
router.get('/:id/summary', async (req, res) => {
  const caseId = req.params.id;
  const summary = await DataStore.getSummary(caseId);
  if (summary) {
    res.json(summary);
  } else {
    res.status(404).json({ error: 'Summary not found' });
  }
});

// Doctor verification endpoint
router.post('/:id/verify', async (req, res) => {
  const caseId = req.params.id;
  const { verified } = req.body;
  const newStatus = verified ? 'VERIFIED' : 'REJECTED';
  await DataStore.updateCaseStatus(caseId, newStatus);
  res.json({ status: newStatus });
});

export default router;
