import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle, TerminalSquare, Info, CheckCircle } from 'lucide-react';
import type { Lab } from '../data/labsData';
import { executePayload, type ExecutionResult } from '../services/api';

interface RightCodePanelProps {
  lab: Lab;
}

export const RightCodePanel: React.FC<RightCodePanelProps> = ({ lab }) => {
  const [codeMode, setCodeMode] = useState<'vulnerable' | 'secure'>('vulnerable');
  const [payload, setPayload] = useState<string>(lab.defaultPayload);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // When active lab changes, reset to vulnerable code and default payload
  useEffect(() => {
    setCodeMode('vulnerable');
    setPayload(lab.defaultPayload);
    setOutput(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [lab.id]);

  // Control 1: Reset - restores vulnerable code and default payload
  const handleReset = () => {
    setCodeMode('vulnerable');
    setPayload(lab.defaultPayload);
    setOutput(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Control 2: Run Payload - executes payload against backend
  const handleRun = async () => {
    setLoading(true);
    const result = await executePayload(lab, payload);
    setOutput(result);
    setLoading(false);
  };

  // Control 3: Secure Code - switches code panel to secure implementation
  const handleToggleSecureCode = () => {
    setCodeMode((prev) => (prev === 'vulnerable' ? 'secure' : 'vulnerable'));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRun();
    }
  };

  return (
    <div className="right-workspace-container">
      {/* 1. TOP CODE PANEL */}
      <div className="code-panel-top">
        {/* Code Header Bar with window dots & Controls */}
        <div className="editor-top-bar">
          <div className="window-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
            <span className="editor-tab-label">
              {codeMode === 'vulnerable' ? 'VulnerableController.java' : 'SecureController.java'}
            </span>
          </div>

          {/* Exactly 3 primary controls: Reset, Run Payload, Secure Code */}
          <div className="editor-actions">
            <button
              onClick={handleReset}
              className="action-btn secondary"
              title="Reset code view and payload field"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>

            <button
              onClick={handleRun}
              disabled={loading}
              className="action-btn primary"
              title="Execute payload"
            >
              <Play size={13} fill="currentColor" />
              <span>{loading ? 'Executing...' : 'Run Payload'}</span>
            </button>

            <button
              onClick={handleToggleSecureCode}
              className={`action-btn secure-toggle-btn ${codeMode === 'secure' ? 'active-secure' : ''}`}
              title="Switch between vulnerable and secure code view"
            >
              <ShieldCheck size={14} />
              <span>{codeMode === 'secure' ? 'Vulnerable Code' : 'Secure Code'}</span>
            </button>
          </div>
        </div>

        {/* Code Viewing Area */}
        <div className="code-display-area">
          {codeMode === 'vulnerable' ? (
            <div className="code-container">
              <pre className="code-pre readonly-text">
                {lab.vulnerableCodeBeforeInput}
              </pre>

              {/* Designated Editable Payload Input Point */}
              <span className="inline-injection-wrapper">
                <span className="injection-tooltip">
                  <Info size={11} />
                  Inject payload here ({lab.variableName})
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="inline-payload-input"
                  placeholder={`Enter ${lab.variableName} payload...`}
                  spellCheck={false}
                  autoComplete="off"
                />
              </span>

              <pre className="code-pre readonly-text">
                {lab.vulnerableCodeAfterInput}
              </pre>
            </div>
          ) : (
            <div className="code-container">
              <pre className="secure-code-pre">
                <code>{lab.secureCode}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 2. TWO-COLUMN BOTTOM SECTION (Directly Beneath Code Panel) */}
      <div className="two-column-bottom-section">
        {/* Left Column: Execution Output & Exploit Impact */}
        <div className="output-column">
          <div className="column-header">
            <div className="column-title">
              <TerminalSquare size={14} className="console-icon" />
              <span> Output </span>
            </div>
            {output?.isSimulated && (
              <span className="simulation-badge">Simulated Response</span>
            )}
          </div>

          <div className="column-body">
            {!output ? (
              <div className="console-empty-state">

              </div>
            ) : (
              <div className="console-result">
                <div className="result-status-row">
                  {output.success ? (
                    <span className="status-badge success">
                      <CheckCircle2 size={13} /> HTTP {output.status || 200} OK
                    </span>
                  ) : (
                    <span className="status-badge error">
                      <AlertTriangle size={13} /> HTTP {output.status} Error
                    </span>
                  )}
                </div>

                <div className="result-data-box">
                  <pre className="result-pre">
                    {typeof output.data === 'object'
                      ? JSON.stringify(output.data, null, 2)
                      : String(output.data)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Why This Neutralizes the Exploit */}
        <div className="remediation-column">
          <div className="column-header">
            <div className="column-title">
              <ShieldCheck size={14} className="secure-shield-icon" />
              <span>Why This Neutralizes the Exploit</span>
            </div>
          </div>

          <div className="column-body remediation-body">
            <p className="remediation-desc">{lab.secureExplanation}</p>

            <div className="core-defense-box">
              <span className="defense-header">Core Defense Details:</span>
              <ul className="defense-list">
                {lab.secureKeyPoints.map((point, idx) => (
                  <li key={idx} className="defense-item">
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
