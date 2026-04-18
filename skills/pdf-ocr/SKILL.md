---
name: pdf-ocr
description: "OCR text extraction from scanned PDFs and images. Tesseract with 100+ languages, word-level bounding boxes, image preprocessing, document scan enhancement, and visual document comparison. Powered by PDFAPIHub."
---

# PDF & Image OCR

Extract text from scanned PDFs and images, enhance document photos, and compare documents visually.

## Tools

| Tool | Description |
|------|-------------|
| `ocr_pdf` | OCR scanned PDFs with multi-language Tesseract, DPI control, word bounding boxes |
| `ocr_image` | OCR images with preprocessing (grayscale, sharpen, threshold, resize) |
| `scan_enhance` | Clean up document photos with edge detection, perspective correction, enhancement |
| `compare_documents` | Compare two images/PDFs for visual similarity (feature matching, SSIM, phash) |

## Setup

Get your **free API key** at [https://pdfapihub.com](https://pdfapihub.com).

Configure in `~/.openclaw/openclaw.json`:

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

**Privacy note:** Files you process are uploaded to PDFAPIHub's cloud service. Files are auto-deleted after 30 days.

## Usage Examples

**OCR a scanned PDF:**
> Extract text from this scanned invoice: https://pdfapihub.com/sample-pdfinvoice-with-image.pdf

**OCR in multiple languages:**
> OCR this document in English and Hindi at 300 DPI

**Extract digits only:**
> Extract only the numbers from this invoice scan

**OCR a photo:**
> Extract text from this receipt photo: https://pdfapihub.com/sample-invoicepage.png

**Clean up a document photo:**
> Clean up this photo of a contract and make it look like a proper scan

**Scan then OCR:**
> Scan and enhance this document photo, then OCR the result

**Compare documents:**
> How similar are these two documents?

## Documentation

Full API docs: [https://pdfapihub.com/docs](https://pdfapihub.com/docs)
