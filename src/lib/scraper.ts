import type { Browser } from 'puppeteer-core';

export interface ExtractionLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ExtractionResult {
  success: boolean;
  html: string;
  css: string;
  screenshot?: string;
  logs: ExtractionLog[];
  error?: string;
}

export interface DesignTokens {
  colors: {
    palette: Array<{
      hex: string;
      rgb: { r: number; g: number; b: number };
      hsl: { h: number; s: number; l: number };
      usage: string;
    }>;
    cssVariables: Record<string, string>;
  };
  typography: {
    fonts: Array<{
      family: string;
      weights: number[];
      styles: string[];
    }>;
    scale: Array<{
      name: string;
      element: string;
      fontSize: string;
      lineHeight?: string;
      fontWeight?: number;
    }>;
  };
  spacing: Array<{ name: string; value: string; px: number }>;
  borders: Array<{ radius: string; px: number; usage: string }>;
  shadows: Array<{ value: string; usage: string }>;
  buttons: Array<{
    name: string;
    background: string;
    color: string;
    border: string;
    borderRadius: string;
    padding: string;
    fontSize: string;
  }>;
  cssVariables: Record<string, string>;
}

function createLog(message: string, type: ExtractionLog['type']): ExtractionLog {
  return {
    timestamp: new Date().toISOString(),
    message,
    type,
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function normalizeHex(hex: string): string {
  hex = hex.trim().toLowerCase();
  if (!hex.startsWith('#')) hex = '#' + hex;
  if (hex.length === 4) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
}

function extractColors(css: string): Array<{ hex: string; rgb: { r: number; g: number; b: number }; hsl: { h: number; s: number; l: number }; usage: string }> {
  const colorRegex = /#[0-9a-f]{3,8}|rgba?\b[^)]+\b|hsla?\b[^)]+\b/g;
  const rawColors = css.match(colorRegex) || [];
  const seen = new Set<string>();
  const tokens: Array<{ hex: string; rgb: { r: number; g: number; b: number }; hsl: { h: number; s: number; l: number }; usage: string }> = [];

  for (const colorStr of rawColors) {
    let hex = colorStr;
    
    if (colorStr.toLowerCase().startsWith('rgb')) {
      const match = colorStr.match(/rgba?.*?([0-9.]+)[,\/]?([0-9.]+)[,\/]?([0-9.]+)/);
      if (match) {
        const r = Math.round(parseFloat(match[1]));
        const g = Math.round(parseFloat(match[2]));
        const b = Math.round(parseFloat(match[3]));
        hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      } else continue;
    }

    hex = normalizeHex(hex);
    if (!/^#[0-9a-f]{6}$/i.test(hex) || seen.has(hex)) continue;
    seen.add(hex);

    const rgb = hexToRgb(hex);
    if (!rgb) continue;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    // A colour appearing in the CSS says nothing about its role; roles come from computed styles.
    tokens.push({ hex, rgb, hsl, usage: 'unknown' });
  }

  return tokens;
}

function extractFonts(css: string): Array<{ family: string; weights: number[]; styles: string[] }> {
  const fonts: Array<{ family: string; weights: number[]; styles: string[] }> = [];
  const seen = new Set<string>();
  const fontFamilyRegex = /font-family:\s*[^;]+/gi;
  let match;

  while ((match = fontFamilyRegex.exec(css)) !== null) {
    const family = match[0].replace(/font-family:\s*/, '').replace(/['"]/g, '').trim();
    const primaryFamily = family.split(',')[0].trim().replace(/['"]/g, '');
    
    if (primaryFamily && !seen.has(primaryFamily.toLowerCase())) {
      seen.add(primaryFamily.toLowerCase());
      fonts.push({ family: primaryFamily, weights: [], styles: [] });
    }
  }

  return fonts;
}

function extractSpacing(css: string): Array<{ name: string; value: string; px: number }> {
  const spacingRegex = /(?:padding|margin|gap)\b[^;]*?([0-9.]+)(px|rem|em)/gi;
  const matches: Array<{ name: string; value: string; px: number }> = [];
  const seen = new Set<string>();

  css.replace(spacingRegex, (_, rawNum, unit) => {
    const num = parseFloat(rawNum);
    const fullMatch = `${num}${unit}`;
    if (!seen.has(fullMatch)) {
      seen.add(fullMatch);
      let px = num;
      if (unit === 'rem' || unit === 'em') px = num * 16;
      else if (unit === 'vh') px = num * 9.6;
      else if (unit === 'vw') px = num * 19.2;
      matches.push({ name: `space-${matches.length + 1}`, value: fullMatch, px });
    }
    return '';
  });

  return matches.sort((a, b) => a.px - b.px);
}

function extractBorders(css: string): Array<{ radius: string; px: number; usage: string }> {
  const radiusRegex = /border-radius:\s*[^;]*?([0-9.]+)(px|rem|em|%)/gi;
  const borders: Array<{ radius: string; px: number; usage: string }> = [];
  const seen = new Set<string>();

  let match;
  while ((match = radiusRegex.exec(css)) !== null) {
    const full = match[0].replace(/border-radius:\s*/i, '').trim();
    if (!seen.has(full)) {
      seen.add(full);
      const num = parseFloat(match[1]);
      let px = num;
      if (match[2] === 'rem' || match[2] === 'em') px = num * 16;
      borders.push({ radius: full, px, usage: borders.length === 0 ? 'sm' : borders.length === 1 ? 'md' : 'lg' });
    }
  }

  return borders;
}

// ─── Context.dev API Integration ─────────────────────────────────────

const CONTEXT_API_BASE = 'https://api.context.dev/v1';

/**
 * Fetch screenshot from context.dev Screenshot API
 * Endpoint: GET /web/screenshot?domain=example.com&fullScreenshot=true
 * Response: { status, domain, screenshot: "url", screenshotType, width, height }
 */
async function fetchContextScreenshot(
  url: string,
  apiKey: string,
  onLog?: (log: ExtractionLog) => void
): Promise<string | null> {
  onLog?.(createLog('Fetching screenshot via context.dev API...', 'info'));
  
  try {
    const urlObj = new URL(url);
    const apiUrl = `${CONTEXT_API_BASE}/web/screenshot?domain=${encodeURIComponent(urlObj.hostname)}&fullScreenshot=true`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || errorData.error_code || response.statusText;
      onLog?.(createLog(`Screenshot API error ${response.status}: ${errorMsg}`, 'warning'));
      return null;
    }

    const data = await response.json();
    
    // Context.dev returns { screenshot: "https://cdn.example.com/..." }
    if (data.screenshot) {
      onLog?.(createLog(`Screenshot captured: ${data.width}x${data.height} ${data.screenshotType}`, 'success'));
      return data.screenshot as string;
    }
    
    onLog?.(createLog('Screenshot response missing screenshot URL', 'warning'));
    return null;
  } catch (error) {
    onLog?.(createLog(`Screenshot API failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error'));
    return null;
  }
}

/**
 * Fetch style guide from context.dev Styleguide API
 * Endpoint: GET /web/styleguide?domain=example.com
 * Response: { status, domain, styleguide: { mode, colors, typography, elementSpacing, shadows, fontLinks, components } }
 */
async function fetchContextStyleGuide(
  url: string,
  apiKey: string,
  onLog?: (log: ExtractionLog) => void
): Promise<DesignTokens | null> {
  onLog?.(createLog('Fetching style guide via context.dev Styleguide API...', 'info'));
  
  try {
    const urlObj = new URL(url);
    const apiUrl = `${CONTEXT_API_BASE}/web/styleguide?domain=${encodeURIComponent(urlObj.hostname)}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || errorData.error_code || response.statusText;
      onLog?.(createLog(`Styleguide API error ${response.status}: ${errorMsg}`, 'warning'));
      return null;
    }

    const data = await response.json();
    
    if (!data.styleguide) {
      onLog?.(createLog('Styleguide response missing styleguide object', 'warning'));
      return null;
    }

    onLog?.(createLog('Styleguide data received, transforming to design tokens...', 'success'));

    const sg = data.styleguide;
    const tokens: DesignTokens = {
      colors: {
        palette: [],
        cssVariables: {},
      },
      typography: {
        fonts: [],
        scale: [],
      },
      spacing: [],
      borders: [],
      shadows: [],
      buttons: [],
      cssVariables: {},
    };

    // Parse colors: { accent, background, text }
    if (sg.colors) {
      const { accent, background, text } = sg.colors;
      
      const addColor = (hex: string, usage: string) => {
        if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return;
        const rgb = hexToRgb(hex);
        if (!rgb) return;
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        if (!tokens.colors.palette.find(c => c.hex === hex)) {
          tokens.colors.palette.push({ hex, rgb, hsl, usage });
        }
      };
      
      if (accent) addColor(accent, 'accent');
      if (background) addColor(background, 'background');
      if (text) addColor(text, 'text');
      
      onLog?.(createLog(`Extracted ${tokens.colors.palette.length} colors from styleguide`, 'success'));
    }

    // Parse typography: { headings: { h1, h2, h3, h4, p } }
    if (sg.typography?.headings) {
      const headingMap: Record<string, string> = {
        h1: 'Heading H1', h2: 'Heading H2', h3: 'Heading H3', h4: 'Heading H4', p: 'Body'
      };
      
      for (const [key, heading] of Object.entries(sg.typography.headings)) {
        const h = heading as { fontSize?: string; lineHeight?: string; fontWeight?: number; fontFamily?: string };
        const name = headingMap[key] || `Heading ${key.toUpperCase()}`;
        
        tokens.typography.scale.push({
          name,
          element: key,
          fontSize: h.fontSize || '',
          lineHeight: h.lineHeight || undefined,
          fontWeight: h.fontWeight || undefined,
        });
        
        // Extract font family
        if (h.fontFamily && !tokens.typography.fonts.find(f => f.family === h.fontFamily)) {
          tokens.typography.fonts.push({
            family: h.fontFamily,
            weights: h.fontWeight ? [h.fontWeight] : [],
            styles: ['normal'],
          });
        }
      }
      onLog?.(createLog(`Extracted ${tokens.typography.fonts.length} fonts and ${tokens.typography.scale.length} type scale entries`, 'success'));
    }

    // Parse spacing: { xs, sm, md, lg, xl }
    if (sg.elementSpacing) {
      const spacingOrder = ['xs', 'sm', 'md', 'lg', 'xl'];
      spacingOrder.forEach(key => {
        if (sg.elementSpacing[key]) {
          tokens.spacing.push({
            name: key,
            value: sg.elementSpacing[key],
            px: parseFloat(sg.elementSpacing[key]) || 0,
          });
        }
      });
      onLog?.(createLog(`Extracted ${tokens.spacing.length} spacing values from styleguide`, 'success'));
    }

    // Parse shadows: { sm, md, lg, xl, inner }
    if (sg.shadows) {
      for (const [key, value] of Object.entries(sg.shadows)) {
        if (value && typeof value === 'string') {
          tokens.shadows.push({
            value,
            usage: key,
          });
        }
      }
    }

    // Parse components (buttons)
    if (sg.components?.button) {
      const buttonStyles = ['primary', 'secondary', 'link'] as const;
      for (const style of buttonStyles) {
        const btn = sg.components.button[style];
        if (btn) {
          tokens.buttons.push({
            name: style,
            background: btn.backgroundColor || '',
            color: btn.color || '',
            border: btn.borderColor || '',
            borderRadius: btn.borderRadius || '',
            padding: btn.padding || '',
            fontSize: btn.fontSize || '',
          });
        }
      }
      onLog?.(createLog(`Extracted ${tokens.buttons.length} button styles from styleguide`, 'success'));
    }

    onLog?.(createLog('Styleguide transformation complete', 'success'));
    return tokens;
  } catch (error) {
    onLog?.(createLog(`Styleguide API failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error'));
    return null;
  }
}

// ─── Fallback Local Extraction (if context.dev fails) ───────────────

async function extractDesignSystemLocal(
  url: string,
  onLog?: (log: ExtractionLog) => void
): Promise<ExtractionResult & { tokens?: DesignTokens }> {
  // Import puppeteer dynamically only when needed (fallback)
  const { default: puppeteer } = await import('puppeteer-core');
  let browser: Browser | null = null;
  const logs: ExtractionLog[] = [];

  const addLog = (message: string, type: ExtractionLog['type']) => {
    const log = createLog(message, type);
    logs.push(log);
    onLog?.(log);
  };

  try {
    addLog('Initializing Chromium browser (fallback)...', 'info');
    // On Vercel use the bundled serverless Chromium; locally use installed Chrome.
    const chromium = process.env.VERCEL ? (await import('@sparticuz/chromium')).default : null;
    browser = await puppeteer.launch({
      headless: true,
      executablePath: chromium
        ? await chromium.executablePath()
        : process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        ...(chromium?.args ?? []),
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-web-security',
      ],
    });
    const page = await browser.newPage();

    addLog(`Navigating to ${url}...`, 'info');
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    addLog('Capturing page screenshot...', 'info');
    const screenshot = await page.screenshot({ encoding: 'base64', fullPage: false }) as string;

    addLog('Extracting HTML content...', 'info');
    const html = await page.content();

    addLog('Analyzing inline styles...', 'info');
    const inlineStyles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[style]')).map((el: Element) => el.getAttribute('style') || '');
    });

    addLog('Extracting stylesheets...', 'info');
    const allCSS = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      const cssStrings: string[] = [];
      try {
        for (const sheet of sheets) {
          try {
            const rules = sheet.cssRules;
            if (rules) {
              for (const rule of Array.from(rules)) {
                if ((rule as CSSStyleRule).cssText) {
                  cssStrings.push((rule as CSSStyleRule).cssText);
                }
              }
            }
          } catch { /* CORS restrictions */ }
        }
      } catch { /* Ignore */ }
      return cssStrings.join('\n');
    });

    const styleTags = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('style')).map((tag: HTMLStyleElement) => tag.textContent || '');
    });

    const fullCSS = allCSS + '\n' + styleTags.join('\n') + '\n' + inlineStyles.join('\n');

    addLog('Measuring computed styles...', 'info');
    const measured = await page.evaluate(() => {
      // Chrome may report lab()/oklch()/color(); a 1px canvas read gives plain sRGB.
      const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      const toRgb = (c: string): string | null => {
        if (!ctx) return null;
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = '#000';
        ctx.fillStyle = c;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return a === 0 ? null : `rgb(${r}, ${g}, ${b})`;
      };
      const bgOf = (start: Element | null) => {
        for (let el = start; el; el = el.parentElement) {
          const c = toRgb(getComputedStyle(el).backgroundColor);
          if (c) return c;
        }
        return 'rgb(255, 255, 255)'; // browser canvas default
      };
      const first = (sel: string) => document.querySelector(sel);
      const scale = ['h1', 'h2', 'h3', 'h4', 'p'].flatMap(tag => {
        const el = first(tag);
        if (!el) return [];
        const cs = getComputedStyle(el);
        return [{ name: tag === 'p' ? 'Body' : `Heading ${tag.toUpperCase()}`, element: tag, fontSize: cs.fontSize, lineHeight: cs.lineHeight, fontWeight: parseInt(cs.fontWeight) || undefined, family: cs.fontFamily }];
      });
      // Accent: the most common saturated button background, else the most common saturated link colour.
      const sat = (c: string) => {
        const m = c.match(/[\d.]+/g)?.map(Number);
        if (!m || m.length < 3 || (m.length > 3 && m[3] === 0)) return false;
        return Math.max(m[0], m[1], m[2]) - Math.min(m[0], m[1], m[2]) > 40;
      };
      const tally = (pairs: string[]) => {
        const counts: Record<string, number> = {};
        pairs.filter(sat).forEach(c => { counts[c] = (counts[c] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      };
      const buttons = Array.from(document.querySelectorAll('button, a[class*="btn" i], a[class*="button" i], [role="button"]'));
      const links = Array.from(document.querySelectorAll('a'));
      return {
        background: bgOf(document.body),
        text: toRgb(getComputedStyle(document.body).color),
        accent: tally(buttons.map(e => toRgb(getComputedStyle(e).backgroundColor) ?? '')) ?? tally(links.map(e => toRgb(getComputedStyle(e).color) ?? '')),
        scale: scale.map(x => ({ name: x.name, element: x.element, fontSize: x.fontSize, lineHeight: x.lineHeight, fontWeight: x.fontWeight })),
        fonts: scale.length > 0 ? [{ family: scale[0].family.split(',')[0].replace(/['"]/g, '').trim(), weights: [] as number[], styles: [] as string[] }] : [],
      };
    });

    addLog('Parsing color palette...', 'info');
    const colors = extractColors(fullCSS);
    const roleColors: DesignTokens['colors']['palette'] = [];
    for (const [usage, value] of [['background', measured.background], ['text', measured.text], ['accent', measured.accent]] as const) {
      const hex = parseCssColor(value ?? undefined);
      const rgb = hex && hexToRgb(hex);
      if (hex && rgb) roleColors.push({ hex, rgb, hsl: rgbToHsl(rgb.r, rgb.g, rgb.b), usage });
    }
    colors.unshift(...roleColors);
    addLog(`Found ${colors.length} unique colors`, 'success');

    addLog('Extracting typography...', 'info');
    const fonts = measured.fonts.length > 0 ? measured.fonts : extractFonts(fullCSS);
    const scale = measured.scale;
    addLog(`Detected ${fonts.length} fonts and ${scale.length} type scale entries`, 'success');

    addLog('Analyzing spacing patterns...', 'info');
    const spacing = extractSpacing(fullCSS);
    addLog(`Found ${spacing.length} spacing values`, 'success');

    addLog('Extracting border radii...', 'info');
    const borders = extractBorders(fullCSS);
    addLog(`Found ${borders.length} border radius patterns`, 'success');

    addLog('Design system extraction complete!', 'success');

    const tokens: DesignTokens = {
      colors: { palette: colors, cssVariables: {} },
      typography: { fonts, scale },
      spacing,
      borders,
      shadows: [],
      buttons: [],
      cssVariables: {},
    };

    await browser.close();

    return {
      success: true,
      html,
      css: fullCSS,
      screenshot: screenshot ? `data:image/png;base64,${screenshot}` : undefined,
      logs,
      tokens,
    };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'Unknown error';
    let userMessage = rawMessage;

    // Categorize common Puppeteer failures into friendly messages
    if (rawMessage.includes('Could not find Chrome') || rawMessage.includes('Could not find Chromium') || rawMessage.includes('browser was not found')) {
      userMessage = 'Browser not available — Puppeteer cannot find Chrome/Chromium on this system. Set PUPPETEER_EXECUTABLE_PATH to a Chrome install';
    } else if (rawMessage.includes('Timeout')) {
      userMessage = 'The page took too long to load (timeout). The site may be slow or unreachable.';
    } else if (rawMessage.includes('net::ERR_NAME_NOT_RESOLVED') || rawMessage.includes('getaddrinfo')) {
      userMessage = 'Could not resolve the domain name. Please check the URL spelling.';
    } else if (rawMessage.includes('net::ERR_CONNECTION_REFUSED')) {
      userMessage = 'Connection refused by the server. The site may be down or blocking requests.';
    } else if (rawMessage.includes('net::ERR_SSL_PROTOCOL_ERROR') || rawMessage.includes('SSL')) {
      userMessage = 'SSL/TLS error. The site has a certificate issue or uses an unsupported protocol.';
    } else if (rawMessage.includes('net::ERR_ABORTED') || rawMessage.includes('Navigation failed')) {
      userMessage = 'Navigation failed. The site may have redirected to an invalid URL or blocked the request.';
    } else if (rawMessage.includes('Protocol error') || rawMessage.includes('Target closed')) {
      userMessage = 'Browser crashed or closed unexpectedly during extraction.';
    }

    addLog(`Error: ${userMessage}`, 'error');
    if (browser) await browser.close().catch(() => {});
    return {
      success: false,
      html: '',
      css: '',
      logs,
      error: userMessage,
    };
  }
}

// ─── Main Export Functions ───────────────────────────────────────────

export async function extractDesignSystem(
  url: string,
  onLog?: (log: ExtractionLog) => void,
  apiKey?: string
): Promise<ExtractionResult & { tokens?: DesignTokens }> {
  const addLog = (message: string, type: ExtractionLog['type']) => {
    const log = createLog(message, type);
    onLog?.(log);
  };

  // Measure the page ourselves first: it is the only path where every value is read from the page.
  const measured = await extractDesignSystemLocal(url, onLog);
  if (measured.success || !(apiKey && apiKey.trim().length > 0)) return measured;
  addLog('Browser measurement failed, trying context.dev instead...', 'warning');

  if (apiKey && apiKey.trim().length > 0) {
    try {
      // Fetch screenshot from context.dev
      const screenshotUrl = await fetchContextScreenshot(url, apiKey, onLog);
      
      // Fetch style guide from context.dev
      const brandTokens = await fetchContextStyleGuide(url, apiKey, onLog);
      
      // Use partial results if available - combine what we got
      if (brandTokens || screenshotUrl) {
        // If we have brand tokens, use them; otherwise use defaults
        const tokens = brandTokens || {
          colors: { palette: [], cssVariables: {} },
          typography: { fonts: [], scale: [] },
          spacing: [],
          borders: [],
          shadows: [],
          buttons: [],
          cssVariables: {},
        };
        
        // Warn if we only got partial data
        if (!brandTokens && screenshotUrl) {
          addLog('Warning: Styleguide extraction failed, only screenshot captured', 'warning');
        } else if (brandTokens && !screenshotUrl) {
          addLog('Warning: Screenshot capture failed, only styleguide data extracted', 'warning');
        }
        
        addLog('Design system extraction complete via context.dev!', 'success');
        return {
          success: true,
          html: '',
          css: '',
          screenshot: screenshotUrl || undefined,
          logs: [],
          tokens,
        };
      }
    } catch (error) {
      addLog(`context.dev API unavailable, falling back to local extraction: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warning');
    }
  }

  return measured;
}

// ─── Measured-only markdown generation ───────────────────────────────
// Every value written below was read from the page. Anything we could not
// read is left out and listed under "Not measured", never filled with a guess.

const MIN_CONTRAST = 4.5;

function parseCssColor(value: string | undefined): string | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3,8})$/.exec(v);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
    if (h.length === 8) {
      if (parseInt(h.slice(6), 16) === 0) return null;
      h = h.slice(0, 6);
    }
    return h.length === 6 ? '#' + h : null;
  }
  const fn = /^rgba?\(([^)]+)\)$/.exec(v);
  if (fn) {
    const parts = fn[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null;
    if (parts.length > 3 && parts[3] === 0) return null;
    return '#' + parts.slice(0, 3).map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
  }
  return null;
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function evenSample<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  return Array.from({ length: max }, (_, i) => items[Math.round((i * (items.length - 1)) / (max - 1))]);
}

export function generateDesignMarkdown(tokens: DesignTokens, url: string): string {
  const urlObj = new URL(url);
  const siteName = urlObj.hostname.replace(/^www\./, '').split('.')[0];
  const formattedName = siteName.charAt(0).toUpperCase() + siteName.slice(1).replace(/-/g, ' ');
  const notMeasured: string[] = [];

  // Colors: only roles the extractor actually measured.
  const roleOf = (usage: string) => tokens.colors.palette.find(c => c.usage === usage)?.hex;
  const colors: Record<string, string> = {};
  const accent = roleOf('accent');
  const surface = roleOf('background');
  let onSurface = roleOf('text');
  if (accent) colors['primary'] = accent;
  if (surface) colors['surface'] = surface;
  if (onSurface && surface) {
    const ratio = contrastRatio(onSurface, surface);
    if (ratio < MIN_CONTRAST) {
      notMeasured.push(`on-surface: measured text ${onSurface} on surface ${surface} is only ${ratio.toFixed(2)}:1, below ${MIN_CONTRAST}:1, so it is left out`);
      onSurface = undefined;
    }
  }
  if (onSurface) colors['on-surface'] = onSurface;
  for (const key of ['primary', 'surface', 'on-surface']) {
    if (!colors[key] && !notMeasured.some(n => n.startsWith(key))) notMeasured.push(`colors.${key}`);
  }

  // Typography: only fields present in the measured scale.
  const typeNames: Record<string, string> = {
    h1: 'headline-display', h2: 'headline-lg', h3: 'headline-md', h4: 'headline-sm', p: 'body-lg', body: 'body-lg',
  };
  const fontFamily = tokens.typography.fonts[0]?.family;
  const typography: Record<string, Record<string, string | number>> = {};
  tokens.typography.scale.forEach(item => {
    const key = typeNames[item.element.split(',')[0].trim()];
    if (!key || typography[key] || !item.fontSize) return;
    const entry: Record<string, string | number> = {};
    if (fontFamily) entry.fontFamily = `"${fontFamily}"`;
    entry.fontSize = `"${item.fontSize}"`;
    if (item.fontWeight) entry.fontWeight = item.fontWeight;
    if (item.lineHeight) entry.lineHeight = `"${item.lineHeight}"`;
    typography[key] = entry;
  });
  if (Object.keys(typography).length === 0) notMeasured.push('typography');

  // Spacing and radii: measured values only, in ascending order.
  const spacingNames = ['xs', 'sm', 'md', 'lg', 'xl'];
  const spacing: Record<string, string> = {};
  if (tokens.spacing.length > 0 && tokens.spacing.every(s => spacingNames.includes(s.name))) {
    tokens.spacing.forEach(s => { spacing[s.name] = s.value; });
  } else {
    const uniq = [...new Map(tokens.spacing.filter(s => s.px >= 2 && s.px <= 200).map(s => [s.value, s])).values()].sort((a, b) => a.px - b.px);
    evenSample(uniq, 5).forEach((s, i) => { spacing[spacingNames[i]] = s.value; });
  }
  if (Object.keys(spacing).length === 0) notMeasured.push('spacing');

  const roundedNames = ['sm', 'md', 'lg', 'xl', '2xl'];
  const rounded: Record<string, string> = {};
  const radii = [...new Map(tokens.borders.filter(b => b.px > 0).map(b => [b.radius, b])).values()].sort((a, b) => a.px - b.px);
  evenSample(radii, 5).forEach((b, i) => { rounded[roundedNames[i]] = b.radius; });
  if (Object.keys(rounded).length === 0) notMeasured.push('rounded');

  // Components: buttons the page actually exposed, never invented ones.
  const components: Record<string, Record<string, string>> = {};
  tokens.buttons.forEach(btn => {
    const bg = parseCssColor(btn.background);
    let text = parseCssColor(btn.color);
    const effectiveBg = bg || surface;
    if (text && effectiveBg && contrastRatio(text, effectiveBg) < MIN_CONTRAST) {
      notMeasured.push(`button-${btn.name}.textColor: ${text} on ${effectiveBg} fails ${MIN_CONTRAST}:1 contrast, so it is left out`);
      text = null;
    }
    const entry: Record<string, string> = {};
    if (bg) entry.backgroundColor = `"${bg}"`;
    if (text) entry.textColor = `"${text}"`;
    if (btn.borderRadius) entry.rounded = `"${btn.borderRadius}"`;
    if (btn.padding) entry.padding = `"${btn.padding}"`;
    if (Object.keys(entry).length > 0) components[`button-${btn.name}`] = entry;
  });
  if (Object.keys(components).length === 0) notMeasured.push('components');

  const fm: string[] = ['---', 'version: alpha', `name: ${formattedName}`,
    `description: Design values measured from ${url}. Values that could not be measured are omitted.`];
  const block = (name: string, obj: Record<string, unknown>) => {
    if (Object.keys(obj).length === 0) return;
    fm.push(`${name}:`);
    Object.entries(obj).forEach(([k, v]) => {
      if (v && typeof v === 'object') {
        fm.push(`  ${k}:`);
        Object.entries(v as Record<string, unknown>).forEach(([p, pv]) => fm.push(`    ${p}: ${pv}`));
      } else {
        fm.push(`  ${k}: "${v}"`);
      }
    });
  };
  block('colors', colors);
  block('typography', typography);
  block('rounded', rounded);
  block('spacing', spacing);
  block('components', components);
  fm.push('---', '');

  const md: string[] = [`# ${formattedName}`, '', '## Provenance',
    `Every value in this file was measured from ${url}. Nothing is filled in from a template. Anything that could not be measured is left out so you do not build on a guess.`, ''];
  if (notMeasured.length > 0) {
    md.push('Not measured:');
    notMeasured.forEach(n => md.push(`- ${n}`));
    md.push('');
  }

  if (Object.keys(colors).length > 0) {
    md.push('## Colors');
    if (colors['primary']) md.push(`- **Primary (${colors['primary']}):** accent colour measured on the page.`);
    if (colors['surface']) md.push(`- **Surface (${colors['surface']}):** page background.`);
    if (colors['on-surface']) md.push(`- **On-surface (${colors['on-surface']}):** body text colour${surface ? `, ${contrastRatio(colors['on-surface'], surface).toFixed(1)}:1 contrast on the surface` : ''}.`);
    md.push('');
  }
  if (Object.keys(typography).length > 0) {
    md.push('## Typography');
    md.push(fontFamily ? `Primary font family: ${fontFamily}. Sizes, weights and line heights are in the frontmatter.` : 'Sizes, weights and line heights are in the frontmatter.');
    md.push('');
  }
  if (Object.keys(spacing).length > 0) {
    md.push('## Layout & Spacing');
    Object.entries(spacing).forEach(([k, v]) => md.push(`- **${k}**: ${v}`));
    md.push('');
  }
  if (tokens.shadows.length > 0) {
    md.push('## Elevation & Depth');
    tokens.shadows.slice(0, 3).forEach(s => md.push(`- **${s.usage}**: ${s.value}`));
    md.push('');
  }
  if (Object.keys(rounded).length > 0) {
    md.push('## Shapes');
    md.push(`Measured corner radii, smallest to largest: ${Object.values(rounded).join(', ')}.`);
    md.push('');
  }
  if (Object.keys(components).length > 0) {
    md.push('## Components');
    md.push(`Buttons measured on the page: ${Object.keys(components).join(', ')}.`);
    md.push('');
  }

  md.push("## Do's and Don'ts");
  md.push('- Do use the exact values in this file, and ask before inventing any that are missing');
  md.push("- Don't fill gaps with defaults from another brand; check the Not measured list first");
  md.push('');
  md.push('---', '');
  md.push('*Generated by [DED Design](https://ded-design.vercel.app). Extract, generate, export.*');

  return fm.join('\n') + md.join('\n');
}


export async function extractAndGenerate(
  url: string,
  onLog?: (log: ExtractionLog) => void,
  apiKey?: string
): Promise<{ tokens: DesignTokens; markdown: string; screenshot?: string }> {
  const result = await extractDesignSystem(url, onLog, apiKey);
  
  if (!result.success || !result.tokens) {
    throw new Error(result.error || 'Extraction failed');
  }

  const markdown = generateDesignMarkdown(result.tokens, url);

  return {
    tokens: result.tokens,
    markdown,
    screenshot: result.screenshot,
  };
}