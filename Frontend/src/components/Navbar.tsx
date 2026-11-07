import React from 'react';
import { Home } from 'lucide-react';
import type { Lab } from '../data/labsData';

interface NavbarProps {
  labs: Lab[];
  activeLabId: string | null;
  onSelectLab: (labId: string) => void;
  onGoHome: () => void;
  isHome: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ labs, activeLabId, onSelectLab, onGoHome, isHome }) => {
  return (
    <header className="navbar-container">
      {/* Brand: SecDevLab only (OWASP Top 10 removed) */}
      <div className="navbar-brand" onClick={onGoHome} style={{ cursor: 'pointer' }}>
        <span className="brand-title">SecDevLab</span>
      </div>

      {/* Navigation tabs with black text */}
      <nav className="navbar-tabs">
        <button
          onClick={onGoHome}
          className={`nav-tab-btn ${isHome ? 'active' : ''}`}
          title="Return to Landing Page"
        >
          <Home size={14} className="tab-home-icon" />
          <span>Home</span>
          {isHome && <span className="tab-indicator" />}
        </button>

        <div className="tab-separator" />

        {labs.map((lab) => {
          const isActive = !isHome && lab.id === activeLabId;
          return (
            <button
              key={lab.id}
              onClick={() => onSelectLab(lab.id)}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
            >
              <span>{lab.name}</span>
              {isActive && <span className="tab-indicator" />}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
