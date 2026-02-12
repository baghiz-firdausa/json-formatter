'use client';

import React from 'react';

interface Tab {
    id: string;
    label: string;
    icon?: string;
}

interface TabPanelProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    children: React.ReactNode;
}

export default function TabPanel({ tabs, activeTab, onTabChange, children }: TabPanelProps) {
    return (
        <div className="tab-panel">
            <div
                className="tab-header"
                style={{
                    display: 'flex',
                    gap: '4px',
                    borderBottom: '2px solid var(--color-border)',
                    marginBottom: '16px',
                    overflowX: 'auto'
                }}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            background: activeTab === tab.id
                                ? 'var(--gradient-primary)'
                                : 'transparent',
                            color: activeTab === tab.id
                                ? 'var(--color-text-inverse)'
                                : 'var(--color-text-secondary)',
                            borderRadius: '0.5rem 0.5rem 0 0',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            transition: 'all var(--transition-fast)',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        {tab.icon && <span>{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="tab-content fade-in">
                {children}
            </div>
        </div>
    );
}
