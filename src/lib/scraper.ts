import * as cheerio from 'cheerio';

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
      lineHeight: string;
      fontWeight: number;
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
  const result = /^#?([a-fd]{2})([a-fd]{2})([a-fd]{2})$/i.exec(hex);
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
    let usage = 'unknown';
    if (hsl.s < 10 && hsl.l > 85) usage = 'background';
    else if (hsl.s < 10 && hsl.l < 20) usage = 'text';
    else if (hsl.s > 60 && hsl.l > 40) usage = 'accent';
    else if (hsl.s > 30 && hsl.l > 50) usage = 'primary';
    else if (hsl.s > 20 && hsl.l > 30) usage = 'secondary';

    tokens.push({ hex, rgb, hsl, usage });
  }

  return tokens;
}

function extractFonts(css: string): Array<{ family: string; weights: number[]; styles: string[] }> {
  const fonts: Array<{ family: string; weights: number[]; styles: string[] }> = [];
  const seen = new Set<string>();
  const fontFamilyRegex = /font-family:\b[^;]+/gi;
  let match;

  while ((match = fontFamilyRegex.exec(css)) !== null) {
    const family = match[0].replace(/font-family:\b/, '').replace(/['"]/g, '').trim();
    const primaryFamily = family.split(',')[0].trim().replace(/['"]/g, '');
    
    if (primaryFamily && !seen.has(primaryFamily.toLowerCase())) {
      seen.add(primaryFamily.toLowerCase());
      fonts.push({ family: primaryFamily, weights: [400, 700], styles: ['normal', 'italic'] });
    }
  }

  return fonts;
}

function extractTypographyScale($: cheerio.CheerioAPI): Array<{ name: string; element: string; fontSize: string; lineHeight: string; fontWeight: number }> {
  const scale: Array<{ name: string; element: string; fontSize: string; lineHeight: string; fontWeight: number }> = [];

  $('h1, h2, h3, h4, h5, h6').each((_: number, elem) => {
    const tag = (elem as any).tagName?.toLowerCase() || 'span';
    const style = $(elem).attr('style') || '';
    const fsMatch = style.match(/font-size:\b([^;]+)/);
    const lhMatch = style.match(/line-height:\b([^;]+)/);
    const fwMatch = style.match(/font-weight:\b([^;]+)/);

    const fontSize = fsMatch ? fsMatch[1].trim() : $(elem).css('font-size') || '16px';
    const lineHeight = lhMatch ? lhMatch[1].trim() : $(elem).css('line-height') || '1.2';
    const fontWeight = fwMatch ? parseInt(fwMatch[1]) || 400 : parseInt($(elem).css('font-weight') || '400') || 400;

    if (!scale.find(s => s.element === tag)) {
      scale.push({ name: `Heading ${tag.toUpperCase()}`, element: tag, fontSize, lineHeight, fontWeight });
    }
  });

  scale.push({
    name: 'Body',
    element: 'p, body',
    fontSize: $('body').css('font-size') || '16px',
    lineHeight: $('body').css('line-height') || '1.5',
    fontWeight: 400,
  });

  return scale;
}

function extractSpacing(css: string): Array<{ name: string; value: string; px: number }> {
  const spacingRegex = /(?:padding|margin|gap|top|right|bottom|left)\b[^;]*?([0-9.]+)(px|rem|em|vh|vw|%)/gi;
  const matches: Array<{ name: string; value: string; px: number }> = [];
  const seen = new Set<string>();

  css.replace(spacingRegex, (_, __, unit) => {
    const fullMatch = _ + unit;
    if (!seen.has(fullMatch)) {
      seen.add(fullMatch);
      const num = parseFloat(__);
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
  const radiusRegex = /border-radius:\b[^;]*?([0-9.]+)(px|rem|em|%)/gi;
  const borders: Array<{ radius: string; px: number; usage: string }> = [];
  const seen = new Set<string>();

  let match;
  while ((match = radiusRegex.exec(css)) !== null) {
    const full = match[0].replace(/border-radius:\b[^;]*?/i, '').trim();
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
        const h = heading as any;
        const name = headingMap[key] || `Heading ${key.toUpperCase()}`;
        
        tokens.typography.scale.push({
          name,
          element: key,
          fontSize: h.fontSize || '16px',
          lineHeight: h.lineHeight || '1.2',
          fontWeight: h.fontWeight || 400,
        });
        
        // Extract font family
        if (h.fontFamily && !tokens.typography.fonts.find(f => f.family === h.fontFamily)) {
          tokens.typography.fonts.push({
            family: h.fontFamily,
            weights: [h.fontWeight || 400],
            styles: ['normal'],
          });
        }
      }
      onLog?.(createLog(`Extracted ${tokens.typography.fonts.length} fonts and ${tokens.typography.scale.length} type scale entries`, 'success'));
    }

    // Parse spacing: { xs, sm, md, lg, xl }
    if (sg.elementSpacing) {
      const spacingOrder = ['xs', 'sm', 'md', 'lg', 'xl'];
      spacingOrder.forEach((key, idx) => {
        if (sg.elementSpacing[key]) {
          tokens.spacing.push({
            name: key,
            value: sg.elementSpacing[key],
            px: parseFloat(sg.elementSpacing[key]) || 16,
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
            borderRadius: btn.borderRadius || '0px',
            padding: btn.padding || '',
            fontSize: btn.fontSize || '14px',
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
  const { default: puppeteer } = await import('puppeteer');
  let page: any = null;
  const logs: ExtractionLog[] = [];

  const addLog = (message: string, type: ExtractionLog['type']) => {
    const log = createLog(message, type);
    logs.push(log);
    onLog?.(log);
  };

  try {
    addLog('Initializing Chromium browser (fallback)...', 'info');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-web-security',
      ],
    });
    page = await browser.newPage();

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
            const rules = sheet.cssRules || (sheet as any).rules;
            if (rules) {
              for (const rule of Array.from(rules)) {
                if ((rule as CSSStyleRule).cssText) {
                  cssStrings.push((rule as CSSStyleRule).cssText);
                }
              }
            }
          } catch (e) { /* CORS restrictions */ }
        }
      } catch (e) { /* Ignore */ }
      return cssStrings.join('\n');
    });

    const styleTags = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('style')).map((tag: HTMLStyleElement) => tag.textContent || '');
    });

    const fullCSS = allCSS + '\n' + styleTags.join('\n') + '\n' + inlineStyles.join('\n');

    addLog('Parsing color palette...', 'info');
    const $ = cheerio.load(html);
    const colors = extractColors(fullCSS);
    addLog(`Found ${colors.length} unique colors`, 'success');

    addLog('Extracting typography...', 'info');
    const fonts = extractFonts(fullCSS);
    const scale = extractTypographyScale($);
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
      userMessage = 'Browser not available — Puppeteer cannot find Chrome/Chromium on this system.';
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
    if (page) await page.close();
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

  // Try context.dev API first if API key is valid (non-empty)
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

  // Fallback to local Puppeteer extraction
  return extractDesignSystemLocal(url, onLog);
}

export function generateDesignMarkdown(tokens: DesignTokens, url: string): string {
  // Extract name from URL hostname
  const urlObj = new URL(url);
  const siteName = urlObj.hostname.replace(/^www\./, '').split('.')[0];
  const formattedName = siteName.charAt(0).toUpperCase() + siteName.slice(1).replace(/-/g, ' ');
  
  // Build color map from palette
  const colorMap: Record<string, string> = {};
  
  const usageToColorKey: Record<string, string> = {
    primary: 'primary',
    secondary: 'secondary',
    accent: 'tertiary',
    text: 'on-surface',
    background: 'surface',
    border: 'border',
  };

  tokens.colors.palette.forEach(c => {
    const key = usageToColorKey[c.usage] || c.usage;
    if (!colorMap[key]) {
      colorMap[key] = c.hex;
    }
  });

  // Build typography entries with proper naming from template
  const fontFamilies = tokens.typography.fonts.map(f => f.family);
  const primaryFont = fontFamilies[0] || 'Inter';
  const fontFallbacks = [primaryFont, 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'];
  
  const typographyEntries: Record<string, any> = {};
  const typeNameMap: Record<string, string> = {
    'heading h1': 'headline-display',
    'heading h2': 'headline-lg',
    'heading h3': 'headline-md',
    'heading h4': 'headline-sm',
    'heading h5': 'headline-sm',
    'heading h6': 'headline-sm',
    'body': 'body-lg',
  };

  tokens.typography.scale.forEach((item, idx) => {
    const mappedName = typeNameMap[item.name.toLowerCase()] || `body-${idx === 0 ? 'lg' : 'md'}`;
    if (!typographyEntries[mappedName]) {
      typographyEntries[mappedName] = {
        fontFamily: primaryFont,
        fontSize: item.fontSize,
        fontWeight: item.fontWeight,
        lineHeight: item.lineHeight,
        letterSpacing: item.fontSize ? `${(parseFloat(item.fontSize) * -0.02).toFixed(3)}px` : '0px',
        fontFallbacks,
      };
    }
  });

  // Ensure we have the standard typography entries
  const requiredTypes = ['headline-display', 'headline-lg', 'headline-md', 'headline-sm', 'body-lg', 'body-md', 'body-sm', 'label-lg', 'label-md', 'label-sm', 'caption'];
  requiredTypes.forEach((type, idx) => {
    if (!typographyEntries[type]) {
      const defaults: Record<string, any> = {
        'headline-display': { fontSize: '56px', fontWeight: 510, lineHeight: '61.6px', letterSpacing: '-1.232px' },
        'headline-lg': { fontSize: '40px', fontWeight: 510, lineHeight: '44px', letterSpacing: '-0.88px' },
        'headline-md': { fontSize: '20px', fontWeight: 510, lineHeight: '26.6px', letterSpacing: '-0.24px' },
        'headline-sm': { fontSize: '16px', fontWeight: 510, lineHeight: '24px', letterSpacing: '0px' },
        'body-lg': { fontSize: '16px', fontWeight: 400, lineHeight: '24px', letterSpacing: '-0.16px' },
        'body-md': { fontSize: '15px', fontWeight: 400, lineHeight: '24px', letterSpacing: '-0.165px' },
        'body-sm': { fontSize: '14px', fontWeight: 400, lineHeight: '20px', letterSpacing: '-0.14px' },
        'label-lg': { fontSize: '16px', fontWeight: 510, lineHeight: '24px', letterSpacing: '0px' },
        'label-md': { fontSize: '15px', fontWeight: 510, lineHeight: '20px', letterSpacing: '0px' },
        'label-sm': { fontSize: '12px', fontWeight: 510, lineHeight: '16px', letterSpacing: '0.02em' },
        'caption': { fontSize: '12px', fontWeight: 400, lineHeight: '16px', letterSpacing: '0px' },
      };
      typographyEntries[type] = {
        fontFamily: primaryFont,
        fontFallbacks,
        ...defaults[type],
      };
    }
  });

  // Build spacing entries with template defaults
  const spacingDefaults: Record<string, string> = {
    xs: '8px',
    sm: '16px',
    md: '28px',
    lg: '60px',
    xl: '128px',
  };
  const spacingEntries: Record<string, string> = { ...spacingDefaults };
  tokens.spacing.slice(0, 5).forEach((s, i) => {
    const names = ['xs', 'sm', 'md', 'lg', 'xl'];
    if (names[i]) {
      spacingEntries[names[i]] = s.value;
    }
  });

  // Build rounded entries with template defaults
  const roundedDefaults: Record<string, string> = {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  };
  const roundedEntries: Record<string, string> = { ...roundedDefaults };
  tokens.borders.slice(0, 5).forEach((b, i) => {
    const names = ['none', 'sm', 'md', 'lg', 'xl'];
    if (names[i]) {
      roundedEntries[names[i]] = b.radius;
    }
  });

  // Build component entries using template variable reference format
  const componentEntries: Record<string, any> = {};
  
  // Button primary - use variable references as per template
  componentEntries['button-primary'] = {
    backgroundColor: '"{colors.secondary}"',
    textColor: '"{colors.neutral}"',
    typography: '"{typography.label-lg}"',
    rounded: '"{rounded.full}"',
    padding: '"14px 20px"',
    height: '"44px"',
  };

  // Button secondary
  componentEntries['button-secondary'] = {
    backgroundColor: '"transparent"',
    textColor: '"{colors.on-surface}"',
    typography: '"{typography.label-lg}"',
    rounded: '"{rounded.full}"',
    padding: '"14px 20px"',
    height: '"44px"',
  };

  // Button link
  componentEntries['button-link'] = {
    backgroundColor: '"transparent"',
    textColor: '"{colors.on-surface}"',
    typography: '"{typography.body-lg}"',
    rounded: '"{rounded.none}"',
    padding: '"0px"',
  };

  // Card component
  componentEntries['card'] = {
    backgroundColor: '"{colors.surface}"',
    textColor: '"{colors.on-surface}"',
    rounded: '"{rounded.md}"',
    padding: '"0px 24px 28px"',
  };

  // Input component
  componentEntries['input'] = {
    backgroundColor: '"{colors.surface}"',
    textColor: '"{colors.on-surface}"',
    typography: '"{typography.body-md}"',
    rounded: '"{rounded.sm}"',
    padding: '"12px 14px"',
  };

  // Chip component
  componentEntries['chip'] = {
    backgroundColor: '"#171819"',
    textColor: '"{colors.on-surface}"',
    typography: '"{typography.label-sm}"',
    rounded: '"{rounded.full}"',
    padding: '"6px 10px"',
  };

  // Generate YAML frontmatter
  const frontmatter: string[] = [];
  frontmatter.push('---');
  frontmatter.push('version: alpha');
  frontmatter.push(`name: ${formattedName}`);
  frontmatter.push(`description: A design system extracted from ${url} — capturing colors, typography, spacing, and components.`);
  
  // Colors - use extracted or template defaults
  const colorDefaults: Record<string, string> = {
    'primary': '#7170ff',
    'secondary': '#e5e5e6',
    'tertiary': '#8d9199',
    'neutral': '#08090a',
    'surface': '#0f1011',
    'on-surface': '#f7f8f8',
    'text-muted': '#8d9199',
    'border': '#ffffff0d',
    'error': '#ff5c5c',
  };
  
  frontmatter.push('colors:');
  const colorKeys = ['primary', 'secondary', 'tertiary', 'neutral', 'surface', 'on-surface', 'text-muted', 'border', 'error'];
  colorKeys.forEach(key => {
    const hex = colorMap[key] || colorDefaults[key];
    frontmatter.push(`  ${key}: "${hex}"`);
  });

  // Typography
  frontmatter.push('typography:');
  Object.entries(typographyEntries).forEach(([key, val]) => {
    frontmatter.push(`  ${key}:`);
    frontmatter.push(`    fontFamily: "${val.fontFamily}"`);
    frontmatter.push(`    fontSize: "${val.fontSize}"`);
    frontmatter.push(`    fontWeight: ${val.fontWeight}`);
    frontmatter.push(`    lineHeight: "${val.lineHeight}"`);
    frontmatter.push(`    letterSpacing: "${val.letterSpacing}"`);
    if (val.fontFallbacks) {
      frontmatter.push(`    fontFallbacks: [${val.fontFallbacks.map((f: string) => `"${f}"`).join(', ')}]`);
    }
  });

  // Rounded
  frontmatter.push('rounded:');
  Object.entries(roundedEntries).forEach(([key, val]) => {
    frontmatter.push(`  ${key}: "${val}"`);
  });

  // Spacing
  frontmatter.push('spacing:');
  Object.entries(spacingEntries).forEach(([key, val]) => {
    frontmatter.push(`  ${key}: "${val}"`);
  });

  // Components
  frontmatter.push('components:');
  Object.entries(componentEntries).forEach(([key, val]) => {
    frontmatter.push(`  ${key}:`);
    Object.entries(val).forEach(([prop, value]) => {
      frontmatter.push(`    ${prop}: ${value}`);
    });
  });

  frontmatter.push('---');
  frontmatter.push('');

  // Generate markdown content
  const content: string[] = [];
  content.push(`# ${formattedName}`);
  content.push('');
  content.push('## Overview');
  content.push(`Design system extracted from ${url}. This document captures the visual language including colors, typography, spacing, and components for implementation consistency.`);
  content.push('');

  // Colors section
  content.push('## Colors');
  const primaryHex = colorMap['primary'] || '#7170ff';
  const secondaryHex = colorMap['secondary'] || '#e5e5e6';
  const tertiaryHex = colorMap['tertiary'] || colorMap['accent'] || '#8d9199';
  const neutralHex = colorMap['neutral'] || '#08090a';
  const surfaceHex = colorMap['surface'] || colorMap['background'] || '#0f1011';
  const onSurfaceHex = colorMap['on-surface'] || colorMap['text'] || '#f7f8f8';
  const textMutedHex = colorMap['text-muted'] || colorMap['text'] || '#8d9199';
  const borderHex = colorMap['border'] || '#ffffff0d';
  const errorHex = colorMap['error'] || '#ff5c5c';

  content.push(`- **Primary (${primaryHex}):** The dominant brand color for emphasis and primary actions.`);
  content.push(`- **Secondary (${secondaryHex}):** Supporting color for secondary elements and surfaces.`);
  content.push(`- **Tertiary (${tertiaryHex}):** Muted tone for secondary text and less important elements.`);
  content.push(`- **Neutral (${neutralHex}):** Dark canvas color anchoring the visual system.`);
  content.push(`- **Surface (${surfaceHex}):** Elevated panel color for cards and inset content.`);
  content.push(`- **On-surface (${onSurfaceHex}):** Primary text color for high contrast readability.`);
  content.push(`- **Text-muted (${textMutedHex}):** Supporting text tone for labels and metadata.`);
  content.push(`- **Border (${borderHex}):** Faint translucent edge for subtle structure.`);
  content.push(`- **Error (${errorHex}):** Bright red for destructive states and alerts.`);
  content.push('');

  // Typography section
  content.push('## Typography');
  const font = tokens.typography.fonts[0];
  content.push(`The system is built on ${font?.family || 'Inter'} with a clean sans-serif fallback stack. Headings use restrained weights for a modern feel; body copy is lighter and more open.`);
  content.push('');

  // Layout & Spacing
  content.push('## Layout & Spacing');
  if (tokens.spacing.length > 0) {
    content.push('Spacing follows a deliberate ladder from compact to expansive:');
    content.push(`- **xs** — ${spacingEntries['xs'] || tokens.spacing[0]?.value || '8px'} for tight internal rhythm`);
    content.push(`- **sm** — ${spacingEntries['sm'] || tokens.spacing[1]?.value || '16px'} for standard separation`);
    content.push(`- **md** — ${spacingEntries['md'] || tokens.spacing[2]?.value || '24px'} for section composition`);
    content.push(`- **lg** — ${spacingEntries['lg'] || tokens.spacing[3]?.value || '40px'} for breathing room`);
    content.push(`- **xl** — ${spacingEntries['xl'] || tokens.spacing[4]?.value || '64px'} for major section gaps`);
  }
  content.push('');

  // Elevation & Depth
  content.push('## Elevation & Depth');
  if (tokens.shadows.length > 0) {
    content.push('Depth is created through tonal layering and borders rather than heavy shadows:');
    tokens.shadows.slice(0, 3).forEach(s => {
      content.push(`- **${s.usage}** — ${s.value}`);
    });
  } else {
    content.push('Depth is extremely restrained. The system uses tonal layering, subtle borders, and contrast to create hierarchy without relying on large shadows.');
  }
  content.push('');

  // Shapes
  content.push('## Shapes');
  if (tokens.borders.length > 0) {
    const radii = tokens.borders.slice(0, 4).map(b => b.radius);
    content.push(`Corner radii range from ${radii.join(' to ')}: buttons use full pill shapes while panels and cards use small to medium radii.`);
  } else {
    content.push('The shape language is soft but disciplined: buttons are fully pill-shaped, while panels and cards use small to medium radii.');
  }
  content.push('');

  // Components
  content.push('## Components');
  content.push('Buttons are the clearest expressive component. `button-primary` is a filled pill for the main action. `button-secondary` is a transparent companion button that preserves the pill geometry. `button-link` is minimal, text-only for inline actions.');
  content.push('');
  content.push('Cards use the surface color with a subtle border and small radius. They should feel like quiet containers rather than raised objects.');
  content.push('');

  // Do's and Don'ts
  content.push('## Do\'s and Don\'ts');
  content.push('- Do use the exact hex codes provided — do not approximate colors');
  content.push('- Do apply the typography scale exactly — do not invent new font sizes');
  content.push('- Do use spacing tokens from the scale — avoid arbitrary pixel values');
  content.push('- Do follow border radius values for consistent corner rounding');
  content.push('- Do keep the design cohesive with the established color palette');
  content.push("- Don't introduce colors outside the defined system without justification");
  content.push("- Don't use border radii larger than the defined tokens allow");
  content.push("- Don't make secondary text too bright or too large — hierarchy will flatten");
  content.push('');
  content.push('---');
  content.push('');
  content.push(`*Generated by [DED Design](https://sprint.dogeatdogstudio.com) — Extract • Generate • Export.*`);

  return frontmatter.join('\n') + content.join('\n');
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