import pdfParse from 'pdf-parse';

export interface ParsedPdfResult {
  text: string;
  numpages: number;
  info: Record<string, unknown>;
  pages: Array<{
    pageNumber: number;
    text: string;
    wordCount: number;
  }>;
}

export async function parsePdfBuffer(buffer: Buffer): Promise<ParsedPdfResult> {
  try {
    const options = {
      // Custom page render to capture individual pages with page numbers
      pagerender: function (pageData: any) {
        return pageData.getTextContent().then((textContent: any) => {
          let lastY, text = '';
          for (const item of textContent.items) {
            if (lastY === item.transform[5] || !lastY) {
              text += item.str;
            } else {
              text += '\n' + item.str;
            }
            lastY = item.transform[5];
          }
          return text;
        });
      }
    };

    const data = await (pdfParse as any)(buffer, options);

    // Divide into page chunks
    const rawPages = data.text.split(/\n\s*\n/);
    const pages = rawPages
      .map((chunk: string, idx: number) => ({
        pageNumber: idx + 1,
        text: chunk.trim(),
        wordCount: chunk.trim().split(/\s+/).length
      }))
      .filter((p: { text: string }) => p.text.length > 0);

    return {
      text: data.text,
      numpages: data.numpages || pages.length || 1,
      info: data.info || {},
      pages
    };
  } catch (err: any) {
    // Robust fallback: Extract verbatim text streams directly from uncompressed PDF streams
    const bufStr = buffer.toString('utf-8');
    const tjMatches = [...bufStr.matchAll(/\((.*?)\)\s*Tj/g)].map((m) => m[1]);
    if (tjMatches.length > 0) {
      const extracted = tjMatches.join('\n');
      return {
        text: extracted,
        numpages: 1,
        info: {},
        pages: [{ pageNumber: 1, text: extracted, wordCount: extracted.split(/\s+/).length }]
      };
    }

    // Try finding readable text lines
    const printable = bufStr.replace(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g, ' ');
    const lines = printable
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 4 && !l.startsWith('%PDF') && !l.endsWith('obj') && !l.startsWith('xref') && !l.startsWith('trailer'));

    if (lines.length > 0) {
      const extracted = lines.join('\n');
      return {
        text: extracted,
        numpages: 1,
        info: {},
        pages: [{ pageNumber: 1, text: extracted, wordCount: extracted.split(/\s+/).length }]
      };
    }

    throw err;
  }
}
