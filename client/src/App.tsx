import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { KioskPage } from './pages/KioskPage';
import { DoctorLoginPage } from './pages/DoctorLoginPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Patient Kiosk Route (Default Experience) */}
        <Route path="/" element={<KioskPage />} />

        {/* Doctor Portal Routes */}
        <Route path="/doctor/login" element={<DoctorLoginPage />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
