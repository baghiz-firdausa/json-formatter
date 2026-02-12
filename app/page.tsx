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

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
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
      <div
        className="main-content"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}
      >
        {/* Input Panel */}
        <div className="input-panel">
          <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>
            📝 Input JSON
          </h3>
          <JsonEditor
            value={inputJson}
            onChange={setInputJson}
            theme={theme}
            height="500px"
          />
        </div>

        {/* Output Panel */}
        <div className="output-panel">
          <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>
            📤 Output
          </h3>
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

