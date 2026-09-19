import { Router, Request, Response } from 'express';
import { requireDoctorAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/doctor-login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Prototype Doctor Credentials
  if ((email === 'doctor@medikiosk.in' || email === 'doctor') && (password === 'doctor123' || password === 'admin')) {
    return res.json({
      success: true,
      token: 'doctor-demo-token-sih2026',
      user: {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'doctor@medikiosk.in',
        role: 'DOCTOR',
        fullName: 'Dr. Arvind Sharma',
        department: 'General Medicine',
        roomNumber: 'OPD Room 402'
      }
    });
  }

  // Also accept any valid format for fast hackathon testing
  if (email && password && password.length >= 4) {
    return res.json({
      success: true,
      token: 'doctor-demo-token-sih2026',
      user: {
        id: '11111111-1111-1111-1111-111111111111',
        email,
        role: 'DOCTOR',
        fullName: 'Dr. Arvind Sharma (Verified)',
        department: 'OPD Medicine',
        roomNumber: 'OPD Room 402'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid credentials. Use doctor@medikiosk.in / doctor123'
  });
});

authRouter.get('/me', requireDoctorAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});
