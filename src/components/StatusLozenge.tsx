import React from 'react';
import { ApplicationStatus } from '../types';

interface StatusLozengeProps {
  status: ApplicationStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusLozenge: React.FC<StatusLozengeProps> = ({ status, size = 'sm' }) => {
  const getStyle = () => {
    switch (status) {
      case 'READY_TO_APPLY':
      case 'READY':
        return 'bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]';
      case 'TAILORED':
        return 'bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]';
      case 'ANALYZED':
        return 'bg-[#EAE6FF] text-[#403294] border-[#C0B6F2]';
      case 'APPLIED':
        return 'bg-[#E6FCFF] text-[#008DA6] border-[#B2F5EA]';
      case 'RECRUITER_CONTACTED':
        return 'bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]';
      case 'INTERVIEW':
        return 'bg-[#DEEBFF] text-[#0052CC] border-[#4C9AFF] font-bold';
      case 'OFFER':
        return 'bg-[#E3FCEF] text-[#006644] border-[#36B37E] font-bold ring-2 ring-[#36B37E]/30';
      case 'REJECTED':
        return 'bg-[#FFEBE6] text-[#BF2600] border-[#FFBDAD]';
      case 'must-have':
      case 'MUST-HAVE':
      case 'HIGH':
        return 'bg-[#FFEBE6] text-[#BF2600] border-[#FFBDAD]';
      case 'preferred':
      case 'PREFERRED':
      case 'MEDIUM':
        return 'bg-[#E6FCFF] text-[#008DA6] border-[#B2F5EA]';
      case 'nice-to-have':
      case 'LOW':
        return 'bg-[#F4F5F7] text-[#42526E] border-[#DFE1E6]';
      case 'strong':
      case 'STRONG':
        return 'bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]';
      case 'moderate':
      case 'MODERATE':
        return 'bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]';
      case 'gap':
      case 'GAP':
        return 'bg-[#FFEBE6] text-[#BF2600] border-[#FFBDAD]';
      default:
        return 'bg-[#F4F5F7] text-[#42526E] border-[#DFE1E6]';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toUpperCase();
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-bold uppercase tracking-wider',
    md: 'text-xs px-2.5 py-1 font-bold uppercase tracking-wider',
    lg: 'text-sm px-3 py-1.5 font-bold uppercase tracking-wider'
  };

  return (
    <span
      id={`lozenge-${status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={`inline-flex items-center rounded-[3px] border ${getStyle()} ${sizeClasses[size]} select-none whitespace-nowrap transition-colors`}
    >
      {formatText(status)}
    </span>
  );
};
