import React from 'react';
import { ShieldCheck, CheckCircle, Lock } from 'lucide-react';
import type { Lab } from '../data/labsData';

interface LowerPanelProps {
  lab: Lab;
}

export const LowerPanel: React.FC<LowerPanelProps> = ({ lab }) => {
  return (
    <div className="lower-panel">
      {/* Lower Panel Header */}
      <div className="lower-panel-header">
        <div className="lower-header-title">
          <ShieldCheck size={16} className="secure-shield-icon" />
          <h3>Remediation: Secure Code Implementation</h3>
          <span className="secure-badge">
            <Lock size={11} />
            Defended
          </span>
        </div>
        <span className="readonly-indicator">[READ-ONLY FIX REFERENCE]</span>
      </div>

      {/* Lower Panel Grid: Secure Code Snippet + Defense Highlights */}
      <div className="lower-panel-content">
        {/* Left Sub-column: Syntax-Highlighted Secure Code */}
        <div className="secure-code-col">
          <div className="sub-panel-bar">
            <span>SecureController.java</span>
          </div>
          <pre className="secure-code-pre">
            <code>{lab.secureCode}</code>
          </pre>
        </div>

        {/* Right Sub-column: Defense Explanation & Key Rules */}
        <div className="secure-explanation-col">
          <div className="sub-panel-bar">
            <span>Why This Neutralizes The Exploit</span>
          </div>
          <div className="explanation-body">
            <p className="explanation-paragraph">{lab.secureExplanation}</p>

            <div className="key-takeaways-box">
              <span className="takeaways-header">Core Defense Mechanism:</span>
              <ul className="takeaways-list">
                {lab.secureKeyPoints.map((point, idx) => (
                  <li key={idx} className="takeaway-item">
                    <CheckCircle size={14} className="check-icon" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
