'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Icons } from '../Icons';
import { TUTOR_MODULES } from '../tutor/tutorModules';
import type { TutorModule, ModuleCategory } from '../tutor/types';
import TutorModuleCard from '../tutor/TutorModuleCard';
import ModuleDetailPlaceholder from '../tutor/ModuleDetailPlaceholder';
import { TutorIcons } from '../tutor/TutorIcons';

const CATEGORIES: ModuleCategory[] = [
  'All',
  'Grammar & Structure',
  'Speaking & Fluency',
  'Core Skills',
  'Practice & Games'
];

export default function TutorDashboard() {
  const { toggleTheme } = useApp();
  const [selectedModule, setSelectedModule] = useState<TutorModule | null>(null);
  const [activeCategory, setActiveCategory] = useState<ModuleCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = useMemo(() => {
    return TUTOR_MODULES.filter((mod) => {
      const matchesCategory =
        activeCategory === 'All' || mod.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        mod.title.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q) ||
        mod.category.toLowerCase().includes(q) ||
        String(mod.number).includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // If a module is selected, render the dedicated module details placeholder
  if (selectedModule) {
    return (
      <ModuleDetailPlaceholder
        module={selectedModule}
        onBack={() => setSelectedModule(null)}
      />
    );
  }

  return (
    <div className="tutor-screen">
      {/* Header */}
      <header className="tutor-header">
          <div className="tutor-header-main">
            <h1>AI English Tutor</h1>
            <p className="tutor-subtitle">Improve your English, one step at a time.</p>
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

      {/* Main Content Area */}
      <div className="tutor-content">
            {/* Intro Welcome Card */}
            <section className="tutor-hero-banner">
              <div className="tutor-hero-icon-container" aria-hidden="true">
                {TutorIcons.sparkles}
              </div>
              <div className="tutor-hero-copy">
                <span className="tutor-hero-kicker">Interactive English Curriculum</span>
                <h2>Master English with Structured AI Modules</h2>
                <p>
                  Explore 18 carefully structured learning modules designed to build grammar,
                  fluency, natural conversation, and confidence.
                </p>
              </div>
            </section>

              {/* Search & Filter Controls */}
              <div className="tutor-controls">
                <div className="tutor-search-wrap">
                  <span className="tutor-search-icon" aria-hidden="true">
                    {TutorIcons.search}
                  </span>
                  <input
                    type="text"
                    className="tutor-search-input"
                    placeholder="Search 18 learning modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search learning modules"
                  />
                  {searchQuery && (
                    <button
                      className="tutor-search-clear"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      &times;
                    </button>
                  )}
                </div>

                <div className="tutor-categories" role="tablist" aria-label="Module categories">
                  {CATEGORIES.map((cat) => {
                    const count =
                      cat === 'All'
                        ? TUTOR_MODULES.length
                        : TUTOR_MODULES.filter((m) => m.category === cat).length;
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        role="tab"
                        aria-selected={isActive}
                        className={`tutor-category-pill ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                      >
                        <span>{cat}</span>
                        <span className="tutor-pill-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modules Counter & Summary */}
              <div className="tutor-modules-header">
                <span className="tutor-modules-count">
                  Showing {filteredModules.length} of {TUTOR_MODULES.length} modules
                </span>
                {activeCategory !== 'All' && (
                  <button
                    className="tutor-reset-filter"
                    onClick={() => {
                      setActiveCategory('All');
                      setSearchQuery('');
                    }}
                  >
                    Reset filters
                  </button>
                )}
              </div>

              {/* Modules Grid */}
              {filteredModules.length > 0 ? (
                <div className="tutor-grid" aria-label="Learning modules list">
                  {filteredModules.map((mod) => (
                    <TutorModuleCard
                      key={mod.id}
                      module={mod}
                      onClick={setSelectedModule}
                    />
                  ))}
                </div>
              ) : (
                <div className="tutor-empty-search">
                  <div className="tutor-empty-icon">{TutorIcons.search}</div>
                  <h3>No modules found</h3>
                  <p>No learning modules match &quot;{searchQuery}&quot; in {activeCategory}.</p>
                  <button
                    className="btn sm ghost"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('All');
                    }}
                  >
                    Show all 18 modules
                  </button>
                </div>
              )}
            </div>
          </div>
          );
}
