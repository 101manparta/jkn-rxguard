/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TerminalProvider } from './context/TerminalContext';
import { AnalystLayout } from './components/layout/AnalystLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AnalystOverviewPage } from './pages/AnalystOverviewPage';
import { AlertsPage } from './pages/AlertsPage';
import { NetworkPage } from './pages/NetworkPage';
import { ParticipantsPage } from './pages/ParticipantsPage';
import { MedicationsPage } from './pages/MedicationsPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { AuditPage } from './pages/AuditPage';
import { AdminOverviewPage } from './pages/AdminOverviewPage';

export default function App() {
  return (
    <TerminalProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Secure Restricted Access Login */}
          <Route path="/access" element={<LoginPage />} />

          {/* Analyst Intelligence Terminal */}
          <Route path="/terminal" element={<AnalystLayout />}>
            <Route index element={<Navigate to="/terminal/overview" replace />} />
            <Route path="overview" element={<AnalystOverviewPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="network" element={<NetworkPage />} />
            <Route path="participants" element={<ParticipantsPage />} />
            <Route path="medications" element={<MedicationsPage />} />
            <Route path="facilities" element={<FacilitiesPage />} />
            <Route path="investigations" element={<InvestigationPage />} />
            <Route path="audit" element={<AuditPage />} />
          </Route>

          {/* Admin Control Center */}
          <Route path="/admin/overview" element={<AdminOverviewPage />} />
          <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TerminalProvider>
  );
}
