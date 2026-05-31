'use client';

import { useState } from 'react';
import Link from 'next/link';

const SAMPLE_DESIGN_MD = `# Stripe Design System

## Overview
A clean, modern fintech aesthetic with deep purples,
crisp whites, and subtle gray tones. The design
emphasizes clarity, trust, and professionalism.

## Colors
- Primary: #635BFF (Electric Indigo)
- Secondary: #96F7D6 (Mint Green)
- Neutral: #0A2540 (Deep Navy)
- Surface: #FFFFFF

## Typography
- Headlines: Sohne, 32-48px, 600 weight
- Body: Sohne, 16px, 400 weight
- Mono: SF Mono, 14px, 400 weight

## Spacing
- xs: 4px  |  sm: 8px  |  md: 16px
- lg: 32px  |  xl: 64px  |  2xl: 128px

## Components
- Button Primary: indigo bg, white text, 4px radius
- Button Secondary: white bg, indigo border, 4px radius
- Card: white bg, subtle shadow, 8px radius`;

const FEATURES = [
  { label: 'Colors', desc: 'Full palette with HEX, RGB, HSL, and usage labels', color: 'bg-red-50 border-red-600 text-red-700' },
  { label: 'Typography', desc: 'Font families, weights, styles, and complete type scale', color: 'bg-gray-50 border-black text-black' },
  { label: 'Spacing', desc: 'Tokenized spacing scale from xs to 2xl', color: 'bg-yellow-50 border-yellow-600 text-yellow-700' },
  { label: 'Borders', desc: 'Border radius values and their common uses', color: 'bg-red-50 border-red-600 text-red-700' },
  { label: 'Shadows', desc: 'Elevation tokens and where they apply', color: 'bg-gray-50 border-black text-black' },
  { label: 'Components', desc: 'Button, card, input, and chip style definitions', color: 'bg-yellow-50 border-yellow-600 text-yellow-700' },
];

const STEPS = [
  { num: '01', title: 'Paste a URL', desc: 'Drop in any live website — competitor, client, or inspiration.' },
  { num: '02', title: 'Screenshot & Extract', desc: 'We capture the page and pull the real CSS tokens behind it.' },
  { num: '03', title: 'Get design.md', desc: 'Download a structured markdown file your AI agent can read.' },
];

const FAQS = [
  {
    q: 'What is a design.md file?',
    a: 'A plain-text markdown file that documents your design system — colors, fonts, spacing, component styles — so both humans and AI coding agents can follow the same visual rules. Think of it as a README for your UI.',
  },
  {
    q: 'Why not just use Figma or a brand PDF?',
    a: 'AI agents cannot read Figma files or PDFs. They can read markdown. A design.md lives in your repo, versions with git, and gives agents exact hex codes, font stacks, and spacing values.',
  },
  {
    q: 'What sites work best?',
    a: 'Any public, live URL works. The tool performs best on marketing sites, landing pages, and design systems that expose CSS. JavaScript-heavy apps may return fewer tokens.',
  },
  {
    q: 'How do I use the output with Cursor or Claude?',
    a: 'Paste the design.md into your project root or .cursorrules. When you ask the agent to "build a login screen," it will reference your exact palette and type scale instead of guessing.',
  },
];

export default function About() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#E5E5E5]">
      {/* Header — matches main page exactly */}
      <header className="border-b-4 border-black bg-black text-white px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none" className="md:w-8 md:h-8">
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
            <p className="font-mono text-xs text-gray-400 uppercase tracking-widest mt-2 md:mt-3">
              A README for your UI — readable by humans and AI agents
            </p>
          </div>

          {/* Intro + Sample Output side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            {/* Explanation */}
            <div className="border-brutal bg-white p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
              <p className="font-mono text-xs md:text-sm text-gray-700 leading-relaxed">
                Your project's visual identity — colors, fonts, spacing, component styles — usually lives in a Figma file, a brand PDF, or a designer's head. An AI coding agent can't read any of those.
              </p>
              <p className="font-mono text-xs md:text-sm text-gray-700 leading-relaxed mt-3">
                A <strong className="text-black">design.md</strong> is a plain-text file that describes how your UI should look, so both humans and agents work from the same rules. Same idea as a README, but for design.
              </p>
            </div>

            {/* Sample Output */}
            <div className="border-brutal bg-black p-1 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
              <div className="border-b-2 border-gray-800 px-3 py-2 flex items-center justify-between">
                <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">design.md</span>
                <span className="font-mono text-xs text-gray-600">example output</span>
              </div>
              <pre className="code-block m-0 rounded-none border-0 p-3 md:p-4 max-h-64 overflow-auto">
                <code className="font-mono text-[10px] md:text-xs">{SAMPLE_DESIGN_MD}</code>
              </pre>
            </div>
          </div>

          {/* What gets extracted */}
          <div className="border-brutal bg-white p-4 md:p-6 mb-4 md:mb-6 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
            <h2 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-3 md:mb-4">
              What gets extracted
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  className={`border-2 p-3 ${f.color}`}
                >
                  <span className="font-mono text-xs uppercase tracking-wider font-bold block mb-1">
                    {f.label}
                  </span>
                  <span className="font-mono text-[10px] md:text-xs opacity-80 leading-snug block">
                    {f.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* How it works — step by step */}
          <div className="border-brutal bg-white p-4 md:p-6 mb-4 md:mb-6 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
            <h2 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-3 md:mb-4">
              How it works
            </h2>
            <div className="space-y-4">
              {STEPS.map((step) => (
                <div key={step.num} className="flex items-start gap-3 md:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-black text-white flex items-center justify-center font-mono text-xs md:text-sm font-bold border-2 border-black">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="font-mono text-xs md:text-sm font-bold uppercase tracking-wider mb-1">
                      {step.title}
                    </h3>
                    <p className="font-mono text-xs text-gray-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* When to use it */}
          <div className="border-brutal bg-white p-4 md:p-6 mb-4 md:mb-6 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
            <h2 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-3 md:mb-4">
              When to use it
            </h2>
            <ul className="space-y-3">
              {[
                "You're starting a project and want to clone another site's visual language as a starting point",
                'You use Cursor, Claude Code, or Copilot and want them to stop guessing your design',
                "A client sent you a URL instead of a brand guide and you need to hand something to your dev team",
                "You want to see how a competitor's design system is actually structured",
              ].map((text, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-5 h-5 bg-red-600 text-white flex items-center justify-center font-mono text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="font-mono text-xs md:text-sm text-gray-700 leading-relaxed">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* FAQ Accordion */}
          <div className="border-brutal bg-white p-4 md:p-6 mb-4 md:mb-6 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
            <h2 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-3 md:mb-4">
              Common questions
            </h2>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="border-2 border-black">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    className="w-full flex items-center justify-between px-3 py-2 md:px-4 md:py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-mono text-xs md:text-sm font-bold uppercase tracking-wider text-left">
                      {faq.q}
                    </span>
                    <span className="font-mono text-sm md:text-base ml-2 flex-shrink-0">
                      {openFaq === i ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-3 py-3 md:px-4 md:py-4 border-t-2 border-black">
                      <p className="font-mono text-xs md:text-sm text-gray-700 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="border-brutal bg-black text-white p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="font-display text-lg md:text-xl tracking-wider mb-1" style={{ fontFamily: 'var(--font-graduate), serif' }}>
                  Ready to extract?
                </p>
                <p className="font-mono text-xs text-gray-400">
                  Try Stripe, Vercel, or any URL you want to learn from.
                </p>
              </div>
              <Link
                href="/"
                className="inline-block font-mono text-xs uppercase tracking-wider px-4 py-2 bg-red-600 text-white hover:bg-white hover:text-black transition-colors border-4 border-red-600 hover:border-white text-center"
              >
                Try it now →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer — matches main page */}
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
