'use client';

import { useState } from 'react';

interface ExportActionsProps {
  markdown: string;
  disabled: boolean;
}

export default function ExportActions({ markdown, disabled }: ExportActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!markdown) return;
    
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!markdown) return;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border-brutal bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">
            Export
          </span>
          <span className="font-mono text-xs text-gray-300">
            |
          </span>
          <span className="font-mono text-xs text-gray-400">
            {markdown ? `${markdown.length} characters` : 'No content'}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={disabled || !markdown}
            className={`btn-brutal text-xs ${
              copied ? 'bg-green-600 border-green-600 text-white' : ''
            } ${disabled || !markdown ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {copied ? (
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Spec
              </span>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={disabled || !markdown}
            className={`btn-brutal-primary btn-brutal text-xs ${
              disabled || !markdown ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download .md
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}