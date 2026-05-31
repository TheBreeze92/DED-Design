import { NextRequest, NextResponse } from 'next/server';
import { extractAndGenerate, type ExtractionLog } from '@/lib/scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    // Get API key from environment or request header
    const apiKey = process.env.CONTEXT_API_KEY || request.headers.get('x-context-api-key') || undefined;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Check if using context.dev
          if (apiKey) {
            sendEvent({ type: 'log', data: { timestamp: new Date().toISOString(), message: 'Using context.dev API for extraction...', type: 'info' } });
          } else {
            sendEvent({ type: 'log', data: { timestamp: new Date().toISOString(), message: 'No API key found, using local Puppeteer extraction...', type: 'info' } });
          }

          // Extract with logging callback (passes API key to context.dev)
          const result = await extractAndGenerate(url, (log: ExtractionLog) => {
            sendEvent({ type: 'log', data: log });
          }, apiKey);

          // Send completion
          sendEvent({
            type: 'complete',
            data: {
              success: true,
              markdown: result.markdown,
              screenshot: result.screenshot,
              tokens: result.tokens,
            },
          });

          controller.close();
        } catch (error) {
          sendEvent({
            type: 'error',
            data: { error: error instanceof Error ? error.message : 'Extraction failed' },
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST with a URL in the body.' },
    { status: 405 }
  );
}