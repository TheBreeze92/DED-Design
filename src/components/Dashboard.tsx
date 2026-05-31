'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DashboardProps {
  onExtract: (url: string) => void;
  isExtracting: boolean;
  markdown?: string;
  onCopy?: () => void;
  onDownload?: () => void;
}

export default function Dashboard({ onExtract, isExtracting, markdown, onCopy, onDownload }: DashboardProps) {
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState(false);
  const [copied, setCopied] = useState(false);

  const isValidUrl = (value: string) => /^https?:\/\//i.test(value.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isExtracting) {
      onExtract(url.trim());
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
      {/* Header - Compact on mobile */}
      <div className="border-brutal border-brutal-top border-brutal-bottom bg-black text-white p-3 md:p-6">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Logo Mark - Smaller on mobile */}
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none" className="flex-shrink-0 md:w-12 md:h-12">
            <rect x="4" y="28" width="56" height="32" fill="#8A0303" />
            <rect x="4" y="4" width="12" height="28" fill="#8A0303" />
            <rect x="20" y="4" width="12" height="22" fill="#8A0303" />
            <rect x="36" y="4" width="12" height="28" fill="#8A0303" />
            <rect x="16" y="4" width="4" height="28" fill="#E5E5E5" />
            <rect x="32" y="4" width="4" height="28" fill="#E5E5E5" />
            <rect x="48" y="4" width="12" height="22" fill="#8A0303" />
          </svg>
          
          <div>
            <h1 className="font-display text-lg md:text-2xl tracking-wider" style={{ fontFamily: 'var(--font-graduate), serif' }}>
              DED Design
            </h1>
            <p className="font-mono text-xs text-gray-400 uppercase tracking-widest mt-0 md:mt-1">
              Emulate The Greats
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="border-brutal border-brutal-bottom bg-white p-3 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-gray-600 block mb-2">
              Target URL
            </label>
            <div className="flex gap-0">
              <input
                type="text"
                value={url}
                placeholder="https://example.com"
                className={`input-brutal flex-1 text-sm md:text-base ${urlError ? '!border-red-600' : ''}`}
                disabled={isExtracting}
                autoFocus
                onChange={(e) => {
                  const value = e.target.value;
                  setUrl(value);
                  setUrlError(value.trim() ? !isValidUrl(value) : false);
                }}
              />
              <button
                type="submit"
                className={`btn-brutal border-l-0 text-xs md:text-sm ${isExtracting ? 'opacity-50 cursor-not-allowed' : 'btn-brutal-primary'}`}
                disabled={isExtracting || !url.trim() || urlError}
              >
                {isExtracting ? (
                  <span className="flex items-center gap-1 md:gap-2">
                    <span className="animate-spin inline-block w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span className="hidden sm:inline">Extracting</span>
                    <span className="sm:hidden">...</span>
                  </span>
                ) : (
                  'Extract'
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="hidden sm:inline">
              {urlError ? (
                <span className="text-red-600 font-mono">URL must start with http:// or https://</span>
              ) : (
                'Enter a live URL to extract its design system'
              )}
            </span>
            <span className="sm:hidden">
              {urlError ? (
                <span className="text-red-600 font-mono">Invalid URL</span>
              ) : (
                'Extract design system from URL'
              )}
            </span>
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="font-mono uppercase tracking-wider hover:text-red-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Quick Examples */}
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">
              Try these:
            </span>
            {markdown && (
              <span className="font-mono text-xs text-gray-400">
                Ready to export
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {[
              { url: 'https://stripe.com', label: 'Stripe' },
              { url: 'https://vercel.com', label: 'Vercel' },
              { url: 'https://linear.app', label: 'Linear' },
              { url: 'https://tailwindui.com', label: 'Tailwind UI' },
            ].map((example) => (
              <button
                key={example.url}
                onClick={() => {
                  setUrl(example.url);
                  setUrlError(false);
                  if (!isExtracting) {
                    onExtract(example.url);
                  }
                }}
                className="tag-brutal text-gray-600 hover:text-red-600 hover:border-red-600 text-xs"
                disabled={isExtracting}
              >
                {example.label}
              </button>
            ))}
            <div className="flex-1 hidden md:block" />
            {markdown ? (
              <button
                onClick={() => {
                  onCopy?.();
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`tag-brutal transition-colors text-xs ${copied ? 'text-green-600 border-green-600 bg-green-50' : 'text-gray-600 hover:text-red-600 hover:border-red-600'}`}
                disabled={isExtracting}
              >
                {copied ? '✓ Copied!' : 'Copy MD'}
              </button>
            ) : null}
            {markdown ? (
              <button
                onClick={onDownload}
                className="tag-brutal text-gray-600 hover:text-red-600 hover:border-red-600 text-xs"
                disabled={isExtracting}
              >
                Download MD
              </button>
            ) : null}
            <Link
              href="/about"
              className={`btn-brutal btn-brutal-primary text-xs ${isExtracting ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Learn Design.md →
            </Link>
          </div>
        </div>
      </div>

      {/* Status Bar - Hidden on mobile */}
      <div className="border-brutal border-brutal-bottom bg-gray-100 px-4 md:px-6 py-2 md:py-3 hidden md:block">
        <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider">
          <span className="text-gray-500">
            {isExtracting ? 'Processing...' : 'Ready'}
          </span>
          <span className="text-gray-400">
            v1.0.0
          </span>
        </div>
      </div>
    </div>
  );
}