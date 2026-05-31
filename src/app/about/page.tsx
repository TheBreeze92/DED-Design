'use client';

import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-[#E5E5E5]">
      {/* Header */}
      <header className="border-b-4 border-black bg-black text-white px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <svg width="20" height="20" viewBox="0 0 64 64" fill="none" className="md:w-6 md:h-6">
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
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-wider px-3 py-1 bg-white text-black hover:bg-gray-200 transition-colors"
          >
            ← Back
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <div className="border-brutal border-brutal-top border-brutal-bottom bg-black text-white p-4 md:p-6 mb-4 md:mb-6">
            <h1 className="font-display text-xl md:text-3xl tracking-wider" style={{ fontFamily: 'var(--font-graduate), serif' }}>
              What is design.md?
            </h1>
          </div>

          {/* Content */}
          <div className="border-brutal border-brutal-bottom bg-white p-4 md:p-6 space-y-4 md:space-y-6 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
            <p className="font-mono text-xs md:text-sm text-gray-700 leading-relaxed">
              Your project's visual identity — colors, fonts, spacing, component styles — usually lives in a Figma file, a brand PDF, or a designer's head. An AI coding agent can't read any of those. A design.md is a plain-text file that describes how your UI should look, so both humans and agents work from the same rules. Same idea as a README, but for design.
            </p>

            <div className="border-t border-gray-200 pt-4 md:pt-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-2 md:mb-3">
                Why it matters for AI-assisted development
              </h2>
              <p className="font-mono text-xs md:text-sm text-gray-700 leading-relaxed">
                Without a design.md, every screen an AI agent builds looks slightly different — wrong blue, wrong font weight, buttons that don't match anything else. With one, the agent uses your actual palette, your type scale, your component patterns. Screens start looking like they belong to the same product. You update the file as your design changes.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4 md:pt-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-2 md:mb-3">
                How it works
              </h2>
              <p className="font-mono text-xs md:text-sm text-gray-700 leading-relaxed">
                The generator screenshots the site and extracts its styleguide (colors, fonts, spacing, shadows, component styles) at the same time. Then it sends both to an AI model that looks at the visual design and writes a structured design.md — the palette, type scale, component descriptions, and a short summary of the overall aesthetic.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4 md:pt-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-2 md:mb-3">
                When to use it
              </h2>
              <ul className="font-mono text-xs md:text-sm text-gray-700 leading-relaxed space-y-2">
                <li className="flex gap-2">
                  <span className="text-red-600">•</span>
                  <span>You're starting a project and want to clone another site's visual language as a starting point</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">•</span>
                  <span>You use Cursor, Claude Code, or Copilot and want them to stop guessing your design</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">•</span>
                  <span>A client sent you a URL instead of a brand guide and you need to hand something to your dev team</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">•</span>
                  <span>You want to see how a competitor's design system is actually structured</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="border-brutal bg-white p-4 md:p-6 mt-4 md:mt-6 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
            <Link
              href="/"
              className="inline-block font-mono text-xs uppercase tracking-wider px-4 py-2 bg-red-600 text-white hover:bg-black transition-colors"
            >
              Try it now →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer - Hidden on mobile */}
      <footer className="hidden md:block border-t-4 border-black bg-black text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
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
            Emulate The Greats
          </div>
        </div>
      </footer>
    </div>
  );
}