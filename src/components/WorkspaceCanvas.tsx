'use client';

interface WorkspaceCanvasProps {
  screenshot?: string;
}

export default function WorkspaceCanvas({ screenshot }: WorkspaceCanvasProps) {
  if (!screenshot) {
    return (
      <div className="border-brutal bg-gray-50 h-full flex items-center justify-center p-6 md:p-8">
        <div className="text-center max-w-xs">
          <svg width="56" height="56" viewBox="0 0 64 64" fill="none" className="mx-auto mb-4 opacity-25">
            <rect x="4" y="28" width="56" height="32" fill="#0A0A0A" />
            <rect x="4" y="4" width="12" height="28" fill="#0A0A0A" />
            <rect x="20" y="4" width="12" height="22" fill="#0A0A0A" />
            <rect x="36" y="4" width="12" height="28" fill="#0A0A0A" />
          </svg>
          <p className="font-mono text-xs md:text-sm text-gray-400 uppercase tracking-widest mb-2">
            Screenshot Preview
          </p>
          <p className="font-mono text-xs text-gray-300">
            Extract a URL to see a live preview of its design system
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-brutal bg-white h-full flex flex-col">
      {/* Header */}
      <div className="border-brutal-bottom bg-black text-white px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="font-mono text-xs uppercase tracking-widest">
            Screenshot
          </span>
        </div>
        <span className="font-mono text-xs text-gray-500 hidden md:inline">
          Scroll to explore
        </span>
      </div>

      {/* Screenshot Content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <img
          src={screenshot}
          alt="Website screenshot"
          className="w-full h-auto block"
        />
      </div>
    </div>
  );
}