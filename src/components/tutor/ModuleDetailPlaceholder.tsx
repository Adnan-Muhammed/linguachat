'use client';
import { useApp } from '@/context/AppContext';
import { Icons } from '../Icons';
import type { TutorModule } from './types';
import { getModuleIcon } from './getModuleIcon';
import { TutorIcons } from './TutorIcons';

interface ModuleDetailPlaceholderProps {
  module: TutorModule;
  onBack: () => void;
}

export default function ModuleDetailPlaceholder({ module, onBack }: ModuleDetailPlaceholderProps) {
  const { toggleTheme } = useApp();
  const icon = getModuleIcon(module.id);
  const formattedNumber = String(module.number).padStart(2, '0');

  return (
    <div className="tutor-screen">
      {/* Header */}
      <header className="tutor-header tutor-header-detail">
        <button
          className="iconbtn tutor-back-btn"
          onClick={onBack}
          aria-label="Back to module list"
          title="Back to module list"
        >
          {TutorIcons.arrowLeft}
        </button>

        <div className="tutor-header-title-wrap">
          <span className="tutor-header-kicker">Module {formattedNumber}</span>
          <h1 className="tutor-header-title">{module.title}</h1>
        </div>

        <button
          className="iconbtn tutor-theme"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {Icons.moon}
        </button>
      </header>

      {/* Detail Content */}
      <div className="tutor-content">
        {/* Breadcrumb / Back Link */}
        <div className="tutor-breadcrumb-bar">
          <button className="tutor-breadcrumb-btn" onClick={onBack}>
            {TutorIcons.arrowLeft}
            <span>All 18 Modules</span>
          </button>
          <span className="tutor-pill-category">{module.category}</span>
        </div>

        {/* Hero Card */}
        <section className="tutor-detail-hero">
          <div className="tutor-detail-hero-icon" aria-hidden="true">
            {icon}
          </div>
          <div className="tutor-detail-hero-body">
            <div className="tutor-detail-badges">
              <span className="tutor-badge-number">Module {formattedNumber}</span>
              <span className="tutor-badge-level">{module.level}</span>
              <span className="tutor-badge-time">
                {TutorIcons.clock}
                <span>{module.estimatedTime}</span>
              </span>
            </div>
            <h2>{module.title}</h2>
            <p className="tutor-detail-desc">{module.description}</p>
          </div>
        </section>

        {/* Phase 2 Coming Soon Notice */}
        <div className="tutor-placeholder-notice">
          <div className="tutor-notice-icon">
            {TutorIcons.sparkles}
          </div>
          <div className="tutor-notice-copy">
            <h3>Future AI Learning Experience</h3>
            <p>
              This module UI is ready for upcoming AI integration. Interactive AI dialogue,
              pronunciation feedback, and personalized exercises for this module will be activated
              in subsequent phases.
            </p>
          </div>
          <span className="tutor-notice-pill">Phase 2 Planned</span>
        </div>

        {/* Learning Focus Areas */}
        <section className="tutor-detail-section">
          <div className="tutor-section-header">
            <span className="tutor-section-icon">{TutorIcons.layers}</span>
            <h3>What You Will Learn</h3>
          </div>
          <div className="tutor-topics-grid">
            {module.keyTopics.map((topic, idx) => (
              <div className="tutor-topic-card" key={idx}>
                <span className="tutor-topic-check">{TutorIcons.checkCircle}</span>
                <span className="tutor-topic-text">{topic}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Planned Interactive Features */}
        <section className="tutor-detail-section">
          <div className="tutor-section-header">
            <span className="tutor-section-icon">{TutorIcons.award}</span>
            <h3>Planned Interactive Features</h3>
          </div>
          <div className="tutor-features-preview-grid">
            {module.features.map((feat, idx) => (
              <div className="tutor-feature-preview-card" key={idx}>
                <div className="tutor-feature-preview-dot" />
                <div className="tutor-feature-preview-content">
                  <h4>{feat}</h4>
                  <p>Custom tailored exercises designed specifically for {module.title}.</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Canvas Placeholder */}
        <section className="tutor-canvas-placeholder">
          <div className="tutor-canvas-header">
            <div className="tutor-canvas-title">
              {TutorIcons.sparkles}
              <span>Interactive Learning Canvas Preview</span>
            </div>
            <span className="tutor-canvas-tag">Placeholder UI</span>
          </div>

          <div className="tutor-canvas-body">
            <div className="tutor-canvas-bubble-ai">
              <div className="tutor-canvas-avatar">
                {TutorIcons.sparkles}
              </div>
              <div className="tutor-canvas-bubble-text">
                <strong>AI English Tutor Workspace</strong>
                <p>
                  Welcome to <em>{module.title}</em>. When AI features are connected,
                  your personal tutor will guide you through step-by-step interactive sessions,
                  practice prompts, and real-time corrections right here.
                </p>
              </div>
            </div>

            <div className="tutor-canvas-actions">
              <button
                type="button"
                className="btn btn-tutor-placeholder"
                disabled
                title="AI integration is scheduled for future phases"
              >
                <span>AI Practice Session (Coming in Phase 2)</span>
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={onBack}
              >
                <span>Browse Other Modules</span>
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Back Button */}
        <div className="tutor-bottom-nav-action">
          <button className="btn ghost" onClick={onBack}>
            {TutorIcons.arrowLeft}
            <span>Back to All 18 Learning Modules</span>
          </button>
        </div>
      </div>
    </div>
  );
}

