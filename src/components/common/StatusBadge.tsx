import React from 'react';
import { AlertSeverity, AlertStatus, RiskLevel } from '../../types';

interface SeverityBadgeProps {
  severity: AlertSeverity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]';

  switch (severity) {
    case 'CRITICAL':
      return (
        <span className={`inline-flex items-center gap-1 font-mono font-semibold bg-red-950/70 text-red-400 border border-red-700/80 rounded-[2px] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className={`inline-flex items-center gap-1 font-mono font-medium bg-orange-950/60 text-orange-400 border border-orange-700/70 rounded-[2px] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center gap-1 font-mono font-medium bg-amber-950/50 text-amber-400 border border-amber-700/60 rounded-[2px] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          MEDIUM
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-mono font-normal bg-emerald-950/40 text-emerald-400 border border-emerald-700/50 rounded-[2px] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          LOW
        </span>
      );
  }
};

export const StatusBadge: React.FC<{ status: AlertStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]';

  const styles: Record<AlertStatus, string> = {
    'OPEN': 'bg-blue-950/60 text-blue-400 border-blue-700/60',
    'UNDER REVIEW': 'bg-cyan-950/60 text-cyan-300 border-cyan-600/60',
    'ESCALATED': 'bg-red-950/60 text-red-400 border-red-700/60 font-semibold',
    'FALSE POSITIVE': 'bg-gray-800/80 text-gray-400 border-gray-700/60',
    'RESOLVED': 'bg-emerald-950/60 text-emerald-400 border-emerald-700/60',
  };

  return (
    <span className={`inline-block font-mono border rounded-[2px] ${styles[status] || styles['OPEN']} ${sizeClasses}`}>
      {status}
    </span>
  );
};

export const RiskScoreBadge: React.FC<{ score: number; level?: RiskLevel }> = ({ score, level }) => {
  let color = 'text-emerald-400 border-emerald-800/80 bg-emerald-950/30';
  if (score >= 85) {
    color = 'text-red-400 border-red-800/80 bg-red-950/40';
  } else if (score >= 70) {
    color = 'text-orange-400 border-orange-800/80 bg-orange-950/40';
  } else if (score >= 50) {
    color = 'text-amber-400 border-amber-800/80 bg-amber-950/30';
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`font-mono font-bold px-2 py-0.5 border rounded-[2px] text-xs ${color}`}>
        {score}
      </span>
      {level && (
        <span className="text-[11px] font-mono text-gray-400 uppercase">
          {level}
        </span>
      )}
    </div>
  );
};
