import React, { useState } from 'react';
import { LABS } from './data/labsData';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LeftPanel } from './components/LeftPanel';
import { RightCodePanel } from './components/RightCodePanel';

export const App: React.FC = () => {
  const [activeLabId, setActiveLabId] = useState<string>(LABS[0].id);
  const [isHome, setIsHome] = useState<boolean>(true);

  const activeLab = LABS.find((l) => l.id === activeLabId) || LABS[0];

  const handleSelectLab = (labId: string) => {
    setActiveLabId(labId);
    setIsHome(false);
  };

  const handleGoHome = () => {
    setIsHome(true);
  };

  return (
    <div className="app-root">
      {/* Top Navigation Bar with Gray Background & Black Text */}
      <Navbar
        labs={LABS}
        activeLabId={activeLabId}
        onSelectLab={handleSelectLab}
        onGoHome={handleGoHome}
        isHome={isHome}
      />

      {/* Main Content Area */}
      {isHome ? (
        <LandingPage onSelectLab={handleSelectLab} />
      ) : (
        <div className="workspace-layout">
          {/* Left Side: Learning Panel with 3 Horizontal Tabs */}
          <div className="left-panel-wrapper">
            <LeftPanel lab={activeLab} />
          </div>

          {/* Right Side: Top Code Panel + Bottom Two-Column (Output & Remediation) */}
          <div className="right-panels-wrapper">
            <RightCodePanel lab={activeLab} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
