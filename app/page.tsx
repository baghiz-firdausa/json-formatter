'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Toolbar from './components/Toolbar';
import TabPanel from './components/TabPanel';
import TreeView from './components/TreeView';
import { formatJson, validateJson, minifyJson, parseJson } from './utils/jsonFormatter';
import { jsonToXml, jsonToCsv, jsonToYaml } from './utils/converters';
import { copyToClipboard, downloadFile } from './utils/clipboard';

// Dynamic import for Monaco Editor to avoid SSR issues
const JsonEditor = dynamic(() => import('./components/JsonEditor'), { ssr: false });

export default function Home() {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [activeTab, setActiveTab] = useState('formatted');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [validationResult, setValidationResult] = useState({ valid: true, error: '' });
  const [notification, setNotification] = useState('');
  const [isOutputMinimized, setIsOutputMinimized] = useState(false);
  const [isInputMinimized, setIsInputMinimized] = useState(false);
  const [isWideMode, setIsWideMode] = useState(false);
  const [fullscreenPanel, setFullscreenPanel] = useState<'input' | 'output' | null>(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle ESC key for fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenPanel(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleInputMinimize = () => {
    setIsInputMinimized(!isInputMinimized);
    if (!isInputMinimized) setIsOutputMinimized(false);
  };

  const toggleOutputMinimize = () => {
    setIsOutputMinimized(!isOutputMinimized);
    if (!isOutputMinimized) setIsInputMinimized(false);
  };

  // Auto-validate on input change
  useEffect(() => {
    if (inputJson.trim()) {
      const result = validateJson(inputJson);
      setValidationResult({
        valid: result.valid,
        error: result.error || ''
      });
    } else {
      setValidationResult({ valid: true, error: '' });
    }
  }, [inputJson]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleFormat = () => {
    const result = formatJson(inputJson);
    if (result.error) {
      showNotification(`❌ ${result.error}`);
      setOutputJson('');
    } else {
      setOutputJson(result.formatted);
      setActiveTab('formatted');
      showNotification('✅ JSON formatted successfully!');
    }
  };

  const handleMinify = () => {
    const result = minifyJson(inputJson);
    if (result.error) {
      showNotification(`❌ ${result.error}`);
      setOutputJson('');
    } else {
      setOutputJson(result.formatted);
      setActiveTab('formatted');
      showNotification('✅ JSON minified successfully!');
    }
  };

  const handleValidate = () => {
    const result = validateJson(inputJson);
    if (result.valid) {
      showNotification('✅ JSON is valid!');
    } else {
      const errorMsg = result.line
        ? `Line ${result.line}, Column ${result.column}: ${result.error}`
        : result.error;
      showNotification(`❌ ${errorMsg}`);
    }
  };

  const handleClear = () => {
    setInputJson('');
    setOutputJson('');
    showNotification('🗑️ Cleared!');
  };

  const handleCopy = async () => {
    const textToCopy = outputJson || inputJson;
    if (!textToCopy) {
      showNotification('⚠️ Nothing to copy!');
      return;
    }

    const success = await copyToClipboard(textToCopy);
    if (success) {
      showNotification('📋 Copied to clipboard!');
    } else {
      showNotification('❌ Failed to copy!');
    }
  };

  const handleDownload = () => {
    const textToDownload = outputJson || inputJson;
    if (!textToDownload) {
      showNotification('⚠️ Nothing to download!');
      return;
    }

    const extension = activeTab === 'xml' ? 'xml'
      : activeTab === 'csv' ? 'csv'
        : activeTab === 'yaml' ? 'yaml'
          : 'json';

    downloadFile(textToDownload, `formatted.${extension}`, 'text/plain');
    showNotification('💾 Downloaded!');
  };

  const handleLoadSample = (sample: string) => {
    setInputJson(sample);
    showNotification('📄 Sample loaded!');
  };

  const handleLoadUrl = async (url: string) => {
    try {
      showNotification('🌐 Loading from URL...');
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setInputJson(JSON.stringify(data, null, 2));
      showNotification('✅ Loaded from URL!');
    } catch (error) {
      showNotification(`❌ Failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getOutputContent = () => {
    const parsed = parseJson(inputJson);
    if (!parsed) return '';

    try {
      switch (activeTab) {
        case 'formatted':
          return outputJson || formatJson(inputJson).formatted;
        case 'tree':
          return ''; // Tree view handles its own rendering
        case 'xml':
          return jsonToXml(parsed);
        case 'csv':
          return jsonToCsv(parsed);
        case 'yaml':
          return jsonToYaml(parsed);
        default:
          return outputJson;
      }
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : 'Conversion failed'}`;
    }
  };

  const tabs = [
    { id: 'formatted', label: 'Formatted', icon: '✨' },
    { id: 'tree', label: 'Tree View', icon: '🌳' },
    { id: 'xml', label: 'XML', icon: '📄' },
    { id: 'csv', label: 'CSV', icon: '📊' },
    { id: 'yaml', label: 'YAML', icon: '📝' },
  ];

  return (
    <div className={`container ${isWideMode ? 'wide-mode' : ''}`} style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      {/* Header */}
      <header style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '8px'
        }}>
          JSON Formatter
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px' }}>
          Format, validate, and convert JSON with ease • 100% client-side • Your data never leaves your browser 🔒
        </p>
      </header>

      {/* Toolbar */}
      <Toolbar
        onFormat={handleFormat}
        onMinify={handleMinify}
        onValidate={handleValidate}
        onClear={handleClear}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onLoadSample={handleLoadSample}
        onLoadUrl={handleLoadUrl}
        onThemeToggle={handleThemeToggle}
        isWideMode={isWideMode}
        onWideModeToggle={() => setIsWideMode(!isWideMode)}
        theme={theme}
        isValid={validationResult.valid}
      />

      {/* Validation Error */}
      {!validationResult.valid && validationResult.error && (
        <div
          className="card fade-in"
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            background: 'var(--gradient-error)',
            color: 'white',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <strong>❌ Validation Error:</strong> {validationResult.error}
        </div>
      )}

      {/* Main Content - Split Panel */}
      <div className={`main-content ${isOutputMinimized ? 'output-minimized' : isInputMinimized ? 'input-minimized' : ''}`}>
        {/* Input Panel */}
        <div className={`input-panel card ${isInputMinimized ? 'minimized' : ''}`}>
          <div className="panel-header">
            {!isInputMinimized && (
              <h3 style={{ margin: 0, fontSize: '18px' }}>
                📝 Input JSON
              </h3>
            )}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setFullscreenPanel('input')}
                className="minimize-btn"
                title="Fullscreen Input"
              >
                ⛶
              </button>
              <button
                onClick={toggleInputMinimize}
                className="minimize-btn"
                title={isInputMinimized ? "Expand Panel" : "Minimize Panel"}
              >
                {isInputMinimized ? '▶️' : '◀️'}
              </button>
            </div>
          </div>

          {isInputMinimized ? (
            <div className="minimized-label" onClick={() => setIsInputMinimized(false)}>
              INPUT PANEL
            </div>
          ) : (
            <JsonEditor
              value={inputJson}
              onChange={setInputJson}
              theme={theme}
              height="500px"
            />
          )}
        </div>

        {/* Output Panel */}
        <div className={`output-panel card ${isOutputMinimized ? 'minimized' : ''}`}>
          <div className="panel-header">
            {!isOutputMinimized && (
              <h3 style={{ margin: 0, fontSize: '18px' }}>
                📤 Output
              </h3>
            )}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setFullscreenPanel('output')}
                className="minimize-btn"
                title="Fullscreen Output"
              >
                ⛶
              </button>
              <button
                onClick={toggleOutputMinimize}
                className="minimize-btn"
                title={isOutputMinimized ? "Expand Panel" : "Minimize Panel"}
              >
                {isOutputMinimized ? '◀️' : '▶️'}
              </button>
            </div>
          </div>

          {isOutputMinimized ? (
            <div className="minimized-label" onClick={() => setIsOutputMinimized(false)}>
              OUTPUT PANEL
            </div>
          ) : (
            <TabPanel tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
              {activeTab === 'tree' ? (
                <TreeView data={parseJson(inputJson)} theme={theme} />
              ) : (
                <JsonEditor
                  value={getOutputContent()}
                  onChange={() => { }}
                  readOnly
                  theme={theme}
                  height="500px"
                />
              )}
            </TabPanel>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className="notification fade-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 24px',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '14px',
            fontWeight: 500,
            zIndex: 1000
          }}
        >
          {notification}
        </div>
      )}

      {/* Fullscreen Overlay */}
      {fullscreenPanel && (
        <div className="fullscreen-overlay fade-in">
          <div className="fullscreen-header">
            <h3 style={{ margin: 0 }}>
              {fullscreenPanel === 'input' ? '📝 Input JSON (Fullscreen)' : '📤 Output (Fullscreen)'}
            </h3>
            <button
              onClick={() => setFullscreenPanel(null)}
              className="btn btn-secondary btn-sm"
            >
              Close (ESC)
            </button>
          </div>
          <div className="fullscreen-content">
            {fullscreenPanel === 'input' ? (
              <JsonEditor
                value={inputJson}
                onChange={setInputJson}
                theme={theme}
                height="100%"
              />
            ) : (
              <TabPanel tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                {activeTab === 'tree' ? (
                  <TreeView data={parseJson(inputJson)} theme={theme} />
                ) : (
                  <JsonEditor
                    value={getOutputContent()}
                    onChange={() => { }}
                    readOnly
                    theme={theme}
                    height="100%"
                  />
                )}
              </TabPanel>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        marginTop: '48px',
        paddingTop: '24px',
        borderTop: '1px solid var(--color-border)',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: '14px'
      }}>
        <p>
          <strong>🔒 Privacy First:</strong> All processing happens in your browser. No data is sent to any server.
        </p>
        <p style={{ marginTop: '8px' }}>
          Built with Next.js • Monaco Editor • TypeScript
        </p>
      </footer>
    </div>
  );
}

