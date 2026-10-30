'use client';
import type { KeyboardEvent } from 'react';
import type { TutorModule } from './types';
import { getModuleIcon } from './getModuleIcon';
import { TutorIcons } from './TutorIcons';

interface TutorModuleCardProps {
  module: TutorModule;
  onClick: (module: TutorModule) => void;
}

export default function TutorModuleCard({ module, onClick }: TutorModuleCardProps) {
  const icon = getModuleIcon(module.id);
  const formattedNumber = String(module.number).padStart(2, '0');

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(module);
    }
  };

  return (
    <div
      className="tutor-card"
      onClick={() => onClick(module)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Open module ${module.number}: ${module.title}`}
    >
      <div className="tutor-card-top">
        <div className="tutor-card-icon-wrap" aria-hidden="true">
          {icon}
        </div>
        <div className="tutor-card-meta">
          <span className="tutor-card-num">#{formattedNumber}</span>
          <span className="tutor-card-level">{module.level}</span>
        </div>
      </div>

      <div className="tutor-card-body">
        <h3 className="tutor-card-title">{module.title}</h3>
        <p className="tutor-card-desc">{module.description}</p>
      </div>

      <div className="tutor-card-footer">
        <span className="tutor-card-time">
          {TutorIcons.clock}
          <span>{module.estimatedTime}</span>
        </span>
        <span className="tutor-card-action">
          <span>Explore</span>
          <span className="tutor-card-arrow" aria-hidden="true">
            {TutorIcons.chevronRight}
          </span>
        </span>
      </div>
    </div>
  );
}

