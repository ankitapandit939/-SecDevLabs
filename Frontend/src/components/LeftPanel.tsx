
import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Bug,
  GitFork,
  AlertTriangle
} from 'lucide-react';
import type { Lab } from '../data/labsData';

interface LeftPanelProps {
  lab: Lab;
}

type TabType = 'definition' | 'payload' | 'flow';

export const LeftPanel: React.FC<LeftPanelProps> = ({ lab }) => {
  const [activeTab, setActiveTab] = useState<TabType>('definition');

  // Reset to 'definition' whenever active lab changes
  useEffect(() => {
    setActiveTab('definition');
  }, [lab.id]);

  return (
      <aside className="left-panel">
        {/* Header Info - Main Lab Heading */}
        <div className="left-panel-header">
          <h2 className="lab-title">{lab.name}</h2>

          {/* Horizontal Tab Navigation Bar */}
          <div className="horizontal-tab-bar">
            <button
                onClick={() => setActiveTab('definition')}
                className={`horiz-tab-btn ${activeTab === 'definition' ? 'active' : ''}`}
            >
              <BookOpen size={14} className="horiz-tab-icon" />
              <span>Vulnerability Definition</span>
              {activeTab === 'definition' && <span className="tab-blue-underline" />}
            </button>

            <button
                onClick={() => setActiveTab('payload')}
                className={`horiz-tab-btn ${activeTab === 'payload' ? 'active' : ''}`}
            >
              <Bug size={14} className="horiz-tab-icon" />
              <span>Payload Mechanics</span>
              {activeTab === 'payload' && <span className="tab-blue-underline" />}
            </button>

            <button
                onClick={() => setActiveTab('flow')}
                className={`horiz-tab-btn ${activeTab === 'flow' ? 'active' : ''}`}
            >
              <GitFork size={14} className="horiz-tab-icon" />
              <span>Request Execution Flow</span>
              {activeTab === 'flow' && <span className="tab-blue-underline" />}
            </button>
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="left-panel-content">
          {/* Tab 1: Vulnerability Definition */}
          {activeTab === 'definition' && (
              <div className="definition-detailed-container">

                {/* 1. What It Is */}
                <section className="theory-card">
                  <div className="card-header">
                    <BookOpen size={16} className="card-header-icon blue" />
                    <h3> What It Is (OWASP Overview)</h3>
                  </div>
                  <div className="card-body">
                    <p className="theory-text">
                      {lab.definitionDetails.whatItIs}
                    </p>
                  </div>
                </section>



                {/* 2. Potential Impact & Security Risks */}
                <section className="theory-card">
                  <div className="card-header">
                    <AlertTriangle size={16} className="card-header-icon red" />
                    <h3> Potential Impact & Security Risks</h3>
                  </div>
                  <div className="card-body">
                    <ul
                        className="definition-bullet-list theory-text"
                        style={{ paddingLeft: '1.1rem' }}
                    >
                      {lab.definitionDetails.impact.map((item, idx) => (
                          <li
                              key={idx}
                              className="definition-bullet-item"
                              style={{
                                display: 'list-item',
                                listStyleType: 'disc',
                                fontSize: 'inherit',
                                lineHeight: 'inherit',
                                color: 'inherit'
                              }}
                          >
                            {item}
                          </li>
                      ))}
                    </ul>
                  </div>
                </section>



              </div>
          )}

          {/* Tab 2: Payload Mechanics */}
          {activeTab === 'payload' && (
              <section className="theory-card">
                <div className="card-header">
                  <Bug size={16} className="card-header-icon blue" />
                  <h3>Payload Mechanics & Processing</h3>
                </div>
                <div className="card-body">
                  <p className="theory-text">{lab.payloadExplanation}</p>
                </div>
              </section>
          )}

          {/* Tab 3: Request Execution Flow */}
          {activeTab === 'flow' && (
              <section className="theory-card">
                <div className="card-header">
                  <GitFork size={16} className="card-header-icon blue" />
                  <h3>Request Execution Flow</h3>
                </div>
                <div className="card-body">
                  <div className="flow-timeline">
                    {lab.flowSteps.map((s, idx) => (
                        <div key={idx} className="flow-step-item">
                          <div className="step-number-badge">{s.step}</div>
                          <div className="step-details">
                            <span className="step-title">{s.title}</span>
                            <span className="step-desc">{s.desc}</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </section>
          )}
        </div>
      </aside>
  );
};
