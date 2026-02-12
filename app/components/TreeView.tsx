'use client';

import React, { useState } from 'react';

type JsonValue = string | number | boolean | null | JsonObject | Array<JsonValue>;
interface JsonObject { [key: string]: JsonValue; }

// interface TreeNode {
//     key: string;
//     value: JsonValue;
//     type: string;
//     isExpanded?: boolean;
// }

interface TreeViewProps {
    data: JsonValue | null;
    theme?: 'light' | 'dark';
}

export default function TreeView({ data, theme = 'light' }: TreeViewProps) {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    const toggleNode = (path: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedNodes(newExpanded);
    };

    const getValueType = (value: JsonValue): string => {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    };

    const getTypeColor = (type: string): string => {
        const colors: Record<string, string> = {
            string: '#ce9178',
            number: '#b5cea8',
            boolean: '#569cd6',
            null: '#569cd6',
            object: '#4ec9b0',
            array: '#4ec9b0',
        };
        return colors[type] || '#d4d4d4';
    };

    const renderValue = (value: JsonValue, path: string, key: string = ''): React.ReactNode => {
        const type = getValueType(value);
        const isExpanded = expandedNodes.has(path);
        const hasChildren = type === 'object' || type === 'array';

        if (!hasChildren) {
            return (
                <div className="tree-leaf" style={{ marginLeft: '20px', padding: '2px 0' }}>
                    <span style={{ color: '#9cdcfe' }}>{key}: </span>
                    <span style={{ color: getTypeColor(type) }}>
                        {type === 'string' ? `"${value}"` : String(value)}
                    </span>
                </div>
            );
        }

        const children = type === 'array'
            ? (value as Array<JsonValue>).map((item: JsonValue, index: number) => ({ key: String(index), value: item }))
            : Object.entries(value as JsonObject).map(([k, v]: [string, JsonValue]) => ({ key: k, value: v }));

        return (
            <div className="tree-node" style={{ marginLeft: key ? '20px' : '0' }}>
                <div
                    className="tree-node-header"
                    onClick={() => toggleNode(path)}
                    style={{
                        cursor: 'pointer',
                        padding: '2px 0',
                        userSelect: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span style={{ fontSize: '12px', color: '#888' }}>
                        {isExpanded ? '▼' : '▶'}
                    </span>
                    {key && <span style={{ color: '#9cdcfe' }}>{key}: </span>}
                    <span style={{ color: getTypeColor(type) }}>
                        {type === 'array' ? `Array[${Array.isArray(value) ? value.length : 0}]` : 'Object'}
                    </span>
                </div>
                {isExpanded && (
                    <div className="tree-node-children">
                        {children.map(({ key: childKey, value: childValue }: { key: string; value: JsonValue }) => (
                            <div key={childKey}>
                                {renderValue(childValue, `${path}.${childKey}`, childKey)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (!data) {
        return (
            <div style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--color-text-secondary)'
            }}>
                No data to display
            </div>
        );
    }

    return (
        <div
            className="tree-view"
            style={{
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '14px',
                padding: '16px',
                background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                color: theme === 'dark' ? '#d4d4d4' : '#1a1a1a',
                borderRadius: '0.5rem',
                height: '500px',
                overflowY: 'auto',
                border: `1px solid var(--color-border)`
            }}
        >
            {renderValue(data, 'root', '')}
        </div>
    );
}
