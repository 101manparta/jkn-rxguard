import React from 'react';
import { Outlet } from 'react-router-dom';
import { TerminalNavbar } from '../common/TerminalNavbar';
import { TerminalCommandBar } from '../common/TerminalCommandBar';
import { TransactionTicker } from '../common/TransactionTicker';
import { CommandPaletteModal } from '../common/CommandPaletteModal';
import { DataDisclaimerBanner } from '../common/DataDisclaimerBanner';

export const AnalystLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#06090e] text-gray-200 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navbar */}
      <TerminalNavbar />

      {/* Terminal Command Signature Bar */}
      <TerminalCommandBar />

      {/* Simulated Data Disclaimer */}
      <DataDisclaimerBanner compact={true} />

      {/* Central Intelligence Content */}
      <main className="flex-1 overflow-y-auto bg-[#06090e]">
        <Outlet />
      </main>

      {/* Bottom Live Transaction Ticker Feed */}
      <TransactionTicker />

      {/* Ctrl+K Command Palette Overlay */}
      <CommandPaletteModal />
    </div>
  );
};
