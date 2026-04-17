# PDF & Image OCR — OpenClaw Plugin

Extract text from scanned PDFs and images using the [PDFAPIHub](https://pdfapihub.com) API. This OpenClaw plugin provides Tesseract OCR with 100+ languages, document photo enhancement, and visual document comparison.

## What It Does

Read text from scanned documents and photos using OCR, clean up document photos into professional scans, and compare documents for visual similarity.

### Features

- **PDF OCR** — Rasterise and OCR scanned PDFs with configurable DPI (72-400)
- **Image OCR** — OCR photos of receipts, documents, signs, business cards, meter readings
- **100+ Languages** — Tesseract language packs, combine with `+` (e.g. `eng+hin+fra`)
- **Word-Level Bounding Boxes** — Per-word positions and confidence scores
- **Character Whitelisting** — Restrict to digits only for invoice amounts or meter readings
- **Image Preprocessing** — Grayscale, sharpen, threshold, resize/upscale for noisy inputs
- **Document Scan Enhancement** — Edge detection, perspective correction, brightness/contrast
- **Color Modes** — B&W (best for text), grayscale, enhanced color
- **PDF Output** — Export scanned documents as single-page PDFs
- **Document Comparison** — Visual similarity scoring with feature matching, SSIM, or phash
- **Confidence Scores** — Per-page and per-word OCR confidence percentages

## Tools

| Tool | Description |
|------|-------------|
| `ocr_pdf` | OCR scanned PDFs with multi-language Tesseract |
| `ocr_image` | OCR images with preprocessing options |
| `scan_enhance` | Clean up document photos into professional scans |
| `compare_documents` | Compare two images/PDFs for visual similarity |

## Installation

```bash
openclaw plugins install clawhub:pdf-ocr
```

## Configuration

Add your API key in `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "entries": {
      "pdf-ocr": {
        "enabled": true,
        "env": {
          "PDFAPIHUB_API_KEY": "your-api-key-here"
        }
      }
    }
  }
}
```

Get your **free API key** at [https://pdfapihub.com](https://pdfapihub.com).

## Usage Examples

Just ask your OpenClaw agent:

- *"Extract text from this scanned PDF"*
- *"OCR this document in English and Hindi at 300 DPI"*
- *"Extract only the numbers from this invoice scan"*
- *"Read the text from this receipt photo"*
- *"Clean up this document photo to look like a scan"*
- *"Scan this photo then OCR the result"*
- *"How similar are these two documents?"*

## Use Cases

- **Invoice Processing** — OCR scanned invoices to extract line items and totals
- **Receipt Scanning** — Extract text from receipt photos for expense tracking
- **Document Digitization** — Convert legacy paper documents to searchable text
- **Multi-Language Documents** — Process documents in Hindi, French, German, Arabic, etc.
- **Business Card Reading** — Extract name, phone, and email from card photos
- **Meter Reading** — Extract digits from utility meter photos with character whitelisting
- **Document Photo Cleanup** — Turn phone photos into clean, professional scans
- **Fraud Detection** — Compare documents for visual similarity
- **QA Testing** — Compare rendered documents before and after changes

## API Documentation

Full API docs: [https://pdfapihub.com/docs](https://pdfapihub.com/docs)

## License

MIT
