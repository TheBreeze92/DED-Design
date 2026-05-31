'use client';

import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import WorkspaceCanvas from '@/components/WorkspaceCanvas';

interface ExtractionResult {
  success: boolean;
  markdown: string;
  screenshot?: string;
  tokens?: {
    colors: { palette: Array<{ hex: string; rgb: { r: number; g: number; b: number }; hsl: { h: number; s: number; l: number }; usage: string }> };
    typography: { fonts: Array<{ family: string; weights: number[]; styles: string[] }>; scale: Array<{ name: string; element: string; fontSize: string; lineHeight: string; fontWeight: number }> };
    spacing: Array<{ name: string; value: string; px: number }>;
    borders: Array<{ radius: string; px: number; usage: string }>;
    shadows: Array<{ value: string; usage: string }>;
    buttons: Array<{ name: string; background: string; color: string; border: string; borderRadius: string; padding: string; fontSize: string }>;
    cssVariables: Record<string, string>;
  };
  error?: string;
}

export default function Home() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [screenshot, setScreenshot] = useState<string | undefined>();
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

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
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExtract = async (url: string) => {
    setIsExtracting(true);
    setMarkdown('');
    setScreenshot(undefined);
    setError('');

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Extraction failed');
        setIsExtracting(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setError('No response stream available');
        setIsExtracting(false);
        return;
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === 'log') {
                // Update status message with current task
                setStatusMessage(event.data?.message || 'Processing...');
              } else if (event.type === 'error') {
                setError(event.data?.error || 'Extraction failed');
                setStatusMessage('');
              } else if (event.type === 'complete') {
                const result: ExtractionResult = event.data;
                setMarkdown(result.markdown);
                setScreenshot(result.screenshot);
                setStatusMessage('');
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsExtracting(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#E5E5E5]">
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto w-full p-3 md:p-6">
          {/* Dashboard stays at top - doesn't scroll */}
          <div className="mb-4 md:mb-6">
            <Dashboard onExtract={handleExtract} isExtracting={isExtracting} markdown={markdown} onCopy={handleCopy} onDownload={handleDownload} />
          </div>

          {/* Scrollable container for panels - this scrolls, Dashboard stays fixed */}
          <div
            className="flex-1 min-h-0 overflow-auto"
            style={{ maxHeight: 'calc(100vh - 180px)' }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
              {/* Left: Markdown Output with Download */}
              <div className="flex flex-col min-h-[200px] sm:min-h-[250px] lg:min-h-0">
                <div className="border-brutal bg-white flex-1 flex flex-col shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] relative">
                  {/* Header - stays sticky while scrolling */}
                  <div className="border-brutal-bottom bg-black text-white px-3 md:px-4 py-2 md:py-3 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className={`w-2 h-2 rounded-full ${isExtracting ? 'bg-yellow-500 animate-pulse' : (markdown ? 'bg-green-500' : 'bg-gray-500')}`}
                      />
                      <span className="font-mono text-xs uppercase tracking-widest">
                        {isExtracting ? (
                          <span className="flex items-center gap-1">
                            <span className="hidden sm:inline">Processing</span>
                            <span className="sm:hidden">...</span>
                            <span className="flex">
                              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                            </span>
                          </span>
                        ) : (markdown ? 'Generated' : 'Output')}
                      </span>
                      {isExtracting && statusMessage && (
                        <span className="text-gray-400 hidden md:inline text-xs truncate max-w-[200px] lg:max-w-[300px]">| {statusMessage}</span>
                      )}
                    </div>
                    {markdown && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopy}
                          className="font-mono text-xs uppercase tracking-wider px-2 md:px-3 py-1 bg-white text-black hover:bg-gray-200 transition-colors"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={handleDownload}
                          className="font-mono text-xs uppercase tracking-wider px-2 md:px-3 py-1 bg-white text-black hover:bg-gray-200 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Markdown Content */}
                  <div className="flex-1 overflow-auto relative">
                    {error ? (
                      <div className="h-full flex items-center justify-center p-4">
                        <div className="text-center max-w-sm">
                          <div className="inline-flex items-center justify-center w-10 h-10 mb-3 bg-red-600 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="15" y1="9" x2="9" y2="15" />
                              <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                          </div>
                          <p className="font-mono text-sm uppercase tracking-wider mb-2 text-red-600">Extraction Failed</p>
                          <p className="font-mono text-xs text-gray-600">{error}</p>
                        </div>
                      </div>
                    ) : markdown ? (
                      <pre className="code-block m-0 rounded-none border-0 p-2 md:p-4">
                        <code className="font-mono text-xs">{markdown}</code>
                      </pre>
                    ) : isExtracting ? (
                      /* Loading skeleton for markdown output */
                      <div className="p-4 md:p-6 space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-4 h-4 bg-gray-200 animate-pulse" />
                          <div className="h-3 w-32 bg-gray-200 animate-pulse" />
                        </div>
                        <div className="h-2 w-full bg-gray-100 animate-pulse" />
                        <div className="h-2 w-5/6 bg-gray-100 animate-pulse" />
                        <div className="h-2 w-4/6 bg-gray-100 animate-pulse" />
                        <div className="h-2 w-full bg-gray-100 animate-pulse" />
                        <div className="h-2 w-3/4 bg-gray-100 animate-pulse" />
                        <div className="space-y-2 pt-2">
                          <div className="h-2 w-full bg-gray-100 animate-pulse" />
                          <div className="h-2 w-5/6 bg-gray-100 animate-pulse" />
                          <div className="h-2 w-4/6 bg-gray-100 animate-pulse" />
                        </div>
                        <div className="space-y-2 pt-2">
                          <div className="h-2 w-full bg-gray-100 animate-pulse" />
                          <div className="h-2 w-3/4 bg-gray-100 animate-pulse" />
                          <div className="h-2 w-2/3 bg-gray-100 animate-pulse" />
                          <div className="h-2 w-5/6 bg-gray-100 animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <div className="h-6 w-16 bg-gray-200 animate-pulse" />
                          <div className="h-6 w-16 bg-gray-200 animate-pulse" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 p-4">
                        <div className="text-center">
                          <p className="font-mono text-xs md:text-sm uppercase tracking-wider mb-2">No output yet</p>
                          <p className="font-mono text-xs">Enter a URL to generate design.md</p>
                        </div>
                      </div>
                    )}


                  </div>
                </div>
              </div>

              {/* Right: Screenshot Preview */}
              <div className="flex flex-col min-h-[200px] sm:min-h-[250px] lg:min-h-0">
                <WorkspaceCanvas screenshot={screenshot} isExtracting={isExtracting} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Hidden on mobile, shown on tablet+ */}
      <footer className="hidden md:block border-t-4 border-black bg-black text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
              <rect x="4" y="28" width="56" height="32" fill="#8A0303" />
              <rect x="4" y="4" width="12" height="28" fill="#8A0303" />
              <rect x="20" y="4" width="12" height="22" fill="#8A0303" />
              <rect x="36" y="4" width="12" height="28" fill="#8A0303" />
              <rect x="16" y="4" width="4" height="28" fill="#E5E5E5" />
              <rect x="32" y="4" width="4" height="28" fill="#E5E5E5" />
              <rect x="48" y="4" width="12" height="22" fill="#8A0303" />
            </svg>
            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
              DED Design
            </span>
          </div>
          <div className="font-mono text-xs text-gray-500 uppercase tracking-wider">
            Extract • Generate • Export.
          </div>
        </div>
      </footer>
    </div>
  );
}
