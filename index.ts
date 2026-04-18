import type { PluginEntry } from "@anthropic/openclaw-plugin-sdk";

const API_BASE = "https://pdfapihub.com/api";

async function callApi(
  endpoint: string,
  body: Record<string, unknown>,
  apiKey: string
): Promise<unknown> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CLIENT-API-KEY": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`PDFAPIHub API error (${res.status}): ${text}`);
    }
    throw new Error(
      `PDFAPIHub API error (${res.status}): ${(parsed as any).error || text}`
    );
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  if (contentType.includes("text/plain")) {
    return { success: true, text: await res.text() };
  }
  return { success: true, message: "Binary file returned", content_type: contentType };
}

function getApiKey(config: Record<string, unknown>): string {
  const key = (config.apiKey as string) || "";
  if (!key) {
    throw new Error(
      "PDFAPIHub API key not configured. Set it under plugins.entries.pdf-ocr-scan in your openclaw.json: either as apiKey (string) or via env.PDFAPIHUB_API_KEY. Get a free key at https://pdfapihub.com"
    );
  }
  return key;
}

function buildBody(params: Record<string, unknown>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      body[key] = value;
    }
  }
  return body;
}

const plugin: PluginEntry = {
  id: "pdf-ocr-scan",
  name: "PDF & Image OCR",
  register(api) {
    // ─── OCR PDF ─────────────────────────────────────────────
    api.registerTool({
      name: "ocr_pdf",
      description:
        "Extract text from a scanned PDF using Tesseract OCR. Rasterises each page at configurable DPI (72-400), then runs OCR. Supports 100+ languages (combine with '+': 'eng+hin', 'eng+fra+deu'). Returns per-page text with confidence scores. Use 'detail: words' for word-level bounding boxes with positions. Supports character whitelisting to restrict OCR to specific characters (e.g. digits only for invoices).",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to a scanned PDF." },
          base64_pdf: { type: "string", description: "Base64-encoded scanned PDF." },
          pages: { type: "string", description: "Page selection: 'all' (default), '1-5', '1,3,5-8'." },
          lang: { type: "string", description: "Tesseract language(s), '+' separated. E.g. 'eng', 'eng+hin', 'eng+fra+deu'. Default: 'eng'." },
          dpi: { type: "number", description: "Rasterisation DPI (72-400). Higher = better quality but slower. Default: 200." },
          psm: { type: "number", description: "Page segmentation mode (0-13). Default: 3 (fully automatic)." },
          oem: { type: "number", description: "OCR engine mode (0=legacy, 1=LSTM, 3=default). Default: 3." },
          detail: {
            type: "string",
            enum: ["text", "words"],
            description: "'text' = plain text + confidence (default). 'words' = per-word bounding boxes with positions.",
          },
          char_whitelist: { type: "string", description: "Restrict OCR to these characters only. E.g. '0123456789.$,' for invoice amounts." },
          output_format: {
            type: "string",
            enum: ["json", "text"],
            description: "'json' = full structured response (default). 'text' = plain text only.",
          },
        },
      },
      async execute(params, context) {
        const apiKey = getApiKey(context.config);
        return callApi("/v1/pdf/ocr/parse", buildBody(params), apiKey);
      },
    });

    // ─── OCR Image ───────────────────────────────────────────
    api.registerTool({
      name: "ocr_image",
      description:
        "Extract text from a single image using Tesseract OCR. Supports optional image preprocessing to improve OCR quality: grayscale conversion, sharpening, binarization threshold, and resize/upscale. Great for receipts, business cards, photos of documents, meter readings, and product labels.",
      parameters: {
        type: "object",
        properties: {
          image_url: { type: "string", description: "URL to an image." },
          base64_image: { type: "string", description: "Base64-encoded image (raw or data-URL)." },
          lang: { type: "string", description: "Tesseract language(s). Default: 'eng'." },
          psm: { type: "number", description: "Page segmentation mode (0-13). Default: 3." },
          oem: { type: "number", description: "OCR engine mode (0-3). Default: 3." },
          detail: {
            type: "string",
            enum: ["text", "words"],
            description: "'text' = plain text + confidence (default). 'words' = per-word bounding boxes.",
          },
          char_whitelist: { type: "string", description: "Restrict OCR to specific characters." },
          grayscale: { type: "boolean", description: "Convert to grayscale before OCR. Helps with colored backgrounds." },
          sharpen: { type: "boolean", description: "Apply sharpening filter. Helps with blurry images." },
          threshold: { type: "number", description: "Binarization threshold (1-255). Converts to pure black/white. 0 = disabled." },
          resize: { type: "number", description: "Scale factor (e.g. 2.0 = 2x upscale). Max 4x. Helps with small text. 0 = disabled." },
          output_format: {
            type: "string",
            enum: ["json", "text"],
            description: "'json' (default) or 'text' (plain text only).",
          },
        },
      },
      async execute(params, context) {
        const apiKey = getApiKey(context.config);
        return callApi("/v1/image/ocr/parse", buildBody(params), apiKey);
      },
    });

    // ─── Scan & Enhance ──────────────────────────────────────
    api.registerTool({
      name: "scan_enhance",
      description:
        "Turn a document photo into a clean, scanned-looking image. Auto-detects document boundaries using edge detection, applies perspective correction for a top-down view, and enhances with brightness/contrast/sharpening. Color modes: 'bw' (clean black-and-white, best for text), 'grayscale', 'color' (enhanced). Output as PNG, JPG, or single-page PDF. Use this before ocr_image for best OCR accuracy.",
      parameters: {
        type: "object",
        properties: {
          image_url: { type: "string", description: "URL to a document photo." },
          url: { type: "string", description: "Alias for image_url." },
          base64_image: { type: "string", description: "Base64-encoded image." },
          color_mode: {
            type: "string",
            enum: ["bw", "grayscale", "color"],
            description: "'bw' = black-and-white (default, best for text). 'grayscale' = enhanced gray. 'color' = enhanced color.",
          },
          auto_detect: { type: "boolean", description: "Auto-detect document boundary. Default: true." },
          sharpen: { type: "boolean", description: "Apply sharpening. Default: true." },
          brightness: { type: "number", description: "Manual brightness adjustment." },
          contrast: { type: "number", description: "Manual contrast adjustment." },
          dpi: { type: "number", description: "Output DPI (72-600). Default: 200." },
          image_format: {
            type: "string",
            enum: ["png", "jpg"],
            description: "Output image format. Default: 'png'.",
          },
          output_format: {
            type: "string",
            enum: ["file", "url", "base64", "both", "pdf"],
            description: "Output mode. 'pdf' outputs a single-page PDF. Default: 'url'.",
          },
          output_filename: { type: "string", description: "Custom output filename." },
        },
      },
      async execute(params, context) {
        const apiKey = getApiKey(context.config);
        return callApi("/v1/scan-enhance", buildBody(params), apiKey);
      },
    });

    // ─── Document Similarity ─────────────────────────────────
    api.registerTool({
      name: "compare_documents",
      description:
        "Compare two images or PDFs and return a visual similarity score (0-1) with confidence level. Methods: 'auto' (best method auto-selected), 'feature_match' (OpenCV), 'ssim' (structural similarity), 'phash' (perceptual hash). Supports image+image, PDF+PDF, and image+PDF combinations.",
      parameters: {
        type: "object",
        properties: {
          url1: { type: "string", description: "URL to the first image or PDF." },
          url2: { type: "string", description: "URL to the second image or PDF." },
          image1_base64: { type: "string", description: "Base64 for the first file." },
          image2_base64: { type: "string", description: "Base64 for the second file." },
          method: {
            type: "string",
            enum: ["auto", "feature_match", "ssim", "phash"],
            description: "Comparison method. 'auto' selects the best method (default).",
          },
        },
      },
      async execute(params, context) {
        const apiKey = getApiKey(context.config);
        return callApi("/v1/document/similarity", buildBody(params), apiKey);
      },
    });
  },
};

export default plugin;
