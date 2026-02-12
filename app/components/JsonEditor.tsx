'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface JsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    height?: string;
    theme?: 'light' | 'dark';
    showLineNumbers?: boolean;
    error?: { line?: number; column?: number };
}

export default function JsonEditor({
    value,
    onChange,
    readOnly = false,
    height = '500px',
    theme = 'light',
    showLineNumbers = true }: JsonEditorProps) {
    const handleEditorChange = (value: string | undefined) => {
        onChange(value || '');
    };

    const editorOptions = {
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: showLineNumbers ? ('on' as const) : ('off' as const),
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on' as const,
        formatOnPaste: true,
        formatOnType: true,
    };

    return (
        <div className="editor-wrapper" style={{ height, borderRadius: '0.5rem', overflow: 'hidden' }}>
            <Editor
                height={height}
                defaultLanguage="json"
                value={value}
                onChange={handleEditorChange}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                options={editorOptions}
                loading={
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        background: theme === 'dark' ? '#1e1e1e' : '#ffffff'
                    }}>
                        <div className="pulse" style={{ fontSize: '14px', color: '#888' }}>
                            Loading editor...
                        </div>
                    </div>
                }
            />
        </div>
    );
}
