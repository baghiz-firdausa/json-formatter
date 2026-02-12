'use client';

import React, { useState } from 'react';
import { getAllSamples, getSample, type SampleKey } from '../utils/samples';

interface ToolbarProps {
    onFormat: () => void;
    onMinify: () => void;
    onValidate: () => void;
    onClear: () => void;
    onCopy: () => void;
    onDownload: () => void;
    onLoadSample: (sample: string) => void;
    onLoadUrl: (url: string) => void;
    onThemeToggle: () => void;
    theme: 'light' | 'dark';
    isValid: boolean;
}

export default function Toolbar({
    onFormat,
    onMinify,
    onValidate,
    onClear,
    onCopy,
    onDownload,
    onLoadSample,
    onLoadUrl,
    onThemeToggle,
    theme,
    isValid
}: ToolbarProps) {
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlValue, setUrlValue] = useState('');
    const [showSampleMenu, setShowSampleMenu] = useState(false);

    const samples = getAllSamples();

    const handleLoadUrl = () => {
        if (urlValue.trim()) {
            onLoadUrl(urlValue);
            setUrlValue('');
            setShowUrlInput(false);
        }
    };

    const handleLoadSample = (key: SampleKey) => {
        const sample = getSample(key);
        onLoadSample(sample);
        setShowSampleMenu(false);
    };

    return (
        <div className="toolbar" style={{ marginBottom: '20px' }}>
            <div
                className="toolbar-main"
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    alignItems: 'center',
                    padding: '16px',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)'
                }}
            >
                {/* Primary Actions */}
                <button onClick={onFormat} className="btn btn-primary btn-sm">
                    ✨ Format
                </button>
                <button onClick={onMinify} className="btn btn-secondary btn-sm">
                    📦 Minify
                </button>
                <button onClick={onValidate} className="btn btn-secondary btn-sm">
                    {isValid ? '✅' : '❌'} Validate
                </button>

                <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />

                {/* Load Actions */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowSampleMenu(!showSampleMenu)}
                        className="btn btn-ghost btn-sm"
                    >
                        📄 Sample
                    </button>
                    {showSampleMenu && (
                        <div
                            className="dropdown-menu card"
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                marginTop: '4px',
                                minWidth: '180px',
                                zIndex: 1000,
                                padding: '8px'
                            }}
                        >
                            {samples.map(({ key, name }) => (
                                <button
                                    key={key}
                                    onClick={() => handleLoadSample(key)}
                                    className="btn btn-ghost btn-sm"
                                    style={{ width: '100%', justifyContent: 'flex-start' }}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="btn btn-ghost btn-sm"
                >
                    🌐 Load URL
                </button>

                <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />

                {/* Export Actions */}
                <button onClick={onCopy} className="btn btn-ghost btn-sm">
                    📋 Copy
                </button>
                <button onClick={onDownload} className="btn btn-ghost btn-sm">
                    💾 Download
                </button>
                <button onClick={onClear} className="btn btn-ghost btn-sm">
                    🗑️ Clear
                </button>

                <div style={{ flex: 1 }} />

                {/* Theme Toggle */}
                <button onClick={onThemeToggle} className="btn btn-ghost btn-sm">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>

            {/* URL Input */}
            {showUrlInput && (
                <div
                    className="url-input-container fade-in"
                    style={{
                        marginTop: '12px',
                        padding: '16px',
                        background: 'var(--color-bg-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        gap: '8px'
                    }}
                >
                    <input
                        type="url"
                        value={urlValue}
                        onChange={(e) => setUrlValue(e.target.value)}
                        placeholder="Enter JSON URL (e.g., https://api.example.com/data.json)"
                        className="input"
                        onKeyPress={(e) => e.key === 'Enter' && handleLoadUrl()}
                        style={{ flex: 1 }}
                    />
                    <button onClick={handleLoadUrl} className="btn btn-primary btn-sm">
                        Load
                    </button>
                    <button
                        onClick={() => setShowUrlInput(false)}
                        className="btn btn-secondary btn-sm"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}
