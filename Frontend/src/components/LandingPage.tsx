import React from 'react';
import { ArrowRight, Database, Server, UserX, Code, Lock, Bug } from 'lucide-react';
import { LABS, type Lab } from '../data/labsData';

interface LandingPageProps {
  onSelectLab: (labId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectLab }) => {
  const getLabIcon = (id: string) => {
    switch (id) {
      case 'sqli': return <Database className="lab-card-icon red" size={24} />;
      case 'cmdi': return <Server className="lab-card-icon orange" size={24} />;
      case 'idor': return <UserX className="lab-card-icon purple" size={24} />;
      case 'xss': return <Code className="lab-card-icon blue" size={24} />;
      case 'csrf': return <Lock className="lab-card-icon green" size={24} />;
      default: return <Bug className="lab-card-icon red" size={24} />;
    }
  };

  return (
    <div className="landing-page-container">
      {/* Hero Section: 80px White SecDevLab branding + exact description */}
      <section className="landing-hero">
        <h1 className="hero-brand-title">SecDevLab</h1>
        <p className="hero-description-text">
          Explore and Inspect vulnerable backend code and learn production grade remediations
        </p>
      </section>

      {/* Labs Section: Balanced Cards without classification badges or sample previews */}
      <section className="landing-labs-section">
        <div className="section-header">
          <h2 className="section-title">Select a Vulnerability Lab</h2>
          <p className="section-desc">Choose a lab below to launch its dedicated interactive learning workbench.</p>
        </div>

        <div className="labs-grid">
          {LABS.map((lab: Lab) => (
            <div
              key={lab.id}
              className="lab-card"
              onClick={() => onSelectLab(lab.id)}
            >
              <div className="lab-card-header">
                <div className="lab-icon-box">
                  {getLabIcon(lab.id)}
                </div>
              </div>

              <div className="lab-card-body">
                <h3 className="lab-card-title">{lab.name}</h3>
                <p className="lab-card-description">{lab.definition}</p>
              </div>

              <div className="lab-card-footer">
                <button
                  className="launch-lab-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLab(lab.id);
                  }}
                >
                  <span>Launch Lab</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
