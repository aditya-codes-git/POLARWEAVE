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
  const options = {
    // Custom page render to capture individual pages with page numbers
    pagerender: function (pageData: any) {
      return pageData.getTextContent().then((textContent: any) => {
        let lastY, text = '';
        for (let item of textContent.items) {
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
  const pages = rawPages.map((chunk: string, idx: number) => ({
    pageNumber: idx + 1,
    text: chunk.trim(),
    wordCount: chunk.trim().split(/\s+/).length
  })).filter((p: { text: string }) => p.text.length > 0);

  return {
    text: data.text,
    numpages: data.numpages || pages.length || 1,
    info: data.info || {},
    pages
  };
}
