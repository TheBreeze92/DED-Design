'use client';

import { useEffect, useRef } from 'react';

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ProcessingLogsProps {
  logs: LogEntry[];
  isProcessing: boolean;
}

export default function ProcessingLogs({ logs, isProcessing }: ProcessingLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getTypeStyles = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="border-brutal bg-white h-full flex flex-col">
      {/* Header */}
      <div className="border-brutal-bottom bg-black text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span 
            className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}
          />
          <span className="font-mono text-xs uppercase tracking-widest">
            {isProcessing ? 'Processing' : 'Complete'}
          </span>
        </div>
        <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">
          Logs
        </span>
      </div>

      {/* Log Entries */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
        {logs.length === 0 && (
          <div className="text-gray-400 italic py-8 text-center">
            No logs yet. Enter a URL to begin extraction.
          </div>
        )}
        
        {logs.map((log, index) => (
          <div key={index} className="flex items-start gap-3 py-1">
            <span className={`w-4 text-center flex-shrink-0 ${getTypeStyles(log.type)}`}>
              {getTypeIcon(log.type)}
            </span>
            <span className="text-gray-400 flex-shrink-0 w-20">
              {formatTimestamp(log.timestamp)}
            </span>
            <span className={getTypeStyles(log.type)}>
              {log.message}
            </span>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex items-start gap-3 py-1 animate-pulse-slow">
            <span className="w-4 text-center text-gray-400">⋯</span>
            <span className="text-gray-400">Waiting for next step...</span>
          </div>
        )}
        
        <div ref={logsEndRef} />
      </div>

      {/* Footer Stats */}
      {logs.length > 0 && (
        <div className="border-brutal-top bg-gray-100 px-4 py-2 font-mono text-xs text-gray-500">
          <span>{logs.filter(l => l.type === 'success').length} successful operations</span>
          {logs.filter(l => l.type === 'error').length > 0 && (
            <span className="text-red-600 ml-4">
              {logs.filter(l => l.type === 'error').length} errors
            </span>
          )}
        </div>
      )}
    </div>
  );
}