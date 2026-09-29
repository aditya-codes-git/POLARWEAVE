import mammoth from 'mammoth';

export interface ParsedDocxResult {
  text: string;
  html: string;
  messages: string[];
  paragraphs: string[];
}

export async function parseDocxBuffer(buffer: Buffer): Promise<ParsedDocxResult> {
  const textResult = await mammoth.extractRawText({ buffer });
  const htmlResult = await mammoth.convertToHtml({ buffer });

  const paragraphs = textResult.value
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return {
    text: textResult.value,
    html: htmlResult.value,
    messages: textResult.messages.map((m) => m.message),
    paragraphs
  };
}
