import { env, hasOpenRouter } from '../config/env.js';

export interface OpenRouterVisionOutput {
  description: string;
  objects: string[];
  scientific_elements: string[];
  location_clues: string[];
  is_polar: boolean;
  confidence: number;
}

const VISION_SYSTEM_PROMPT = `You are a scientific vision analysis engine for the POLARWEAVE Research Repository.
Analyze the image with utmost scientific and visual rigor.

CRITICAL RULES:
1. Do NOT invent, assume, or fabricate polar or Antarctic content if it is not present in the image.
2. If the image depicts biomedical subjects (such as retinal fundus, microscopy, eye, pathology), everyday objects, animals, or general sensors, describe EXACTLY what is visible factually and set "is_polar" to false.
3. If and only if the image visually depicts polar environments, ice sheets, glaciers, icebergs, polar wildlife (penguins, seals), research stations (Bharati, Maitri), or polar expeditions, set "is_polar" to true.
4. Output STRICT JSON conforming precisely to the following structure with no markdown formatting or extra text:
{
  "description": string,
  "objects": string[],
  "scientific_elements": string[],
  "location_clues": string[],
  "is_polar": boolean,
  "confidence": number
}`;

/**
 * Calls OpenRouter's OpenAI-compatible chat completions API with a multimodal image message.
 * Sends image as base64 data URL.
 * Returns strict structured JSON.
 */
export async function callOpenRouterVision(
  filename: string,
  buffer: Buffer,
  mimeType: string,
  options?: { apiKey?: string; model?: string }
): Promise<OpenRouterVisionOutput> {
  const apiKey = options?.apiKey || process.env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const base64Data = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Data}`;
  const model = options?.model || process.env.OPENROUTER_VISION_MODEL || env.OPENROUTER_VISION_MODEL || 'openrouter/free';

  const userPrompt = `Analyze this uploaded image: ${filename}.
Extract factual visual description, visible objects, scientific elements, and location clues. Determine whether it is polar-related.
Return STRICT JSON matching the schema.`;

  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content: VISION_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userPrompt
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUrl
            }
          }
        ]
      }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  };

  let response: Response | null = null;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': env.CLIENT_URL || 'http://localhost:5173',
        'X-Title': 'POLARWEAVE Science Repository'
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 429 && attempts < maxAttempts) {
      const delayMs = attempts * 3000;
      console.warn(`[OpenRouter Vision] Rate limit (429) hit, retrying in ${delayMs}ms (attempt ${attempts}/${maxAttempts})...`);
      await new Promise((r) => setTimeout(r, delayMs));
      continue;
    }
    break;
  }

  if (!response || !response.ok) {
    const errorText = response ? await response.text() : 'No response';
    console.error(`[OpenRouter Vision] API error ${response?.status}:`, errorText);
    throw new Error(`OpenRouter Vision API failed (${response?.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('No content returned from OpenRouter Vision API');
  }

  // Parse JSON response safely (handling markdown backtick wrap and potential thinking/safety preamble)
  let cleanJson = rawContent.trim();
  if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  // If preamble or conversational text was prepended, extract the outermost JSON object
  const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanJson = jsonMatch[0];
  }

  const parsed = JSON.parse(cleanJson);

  return {
    description: typeof parsed.description === 'string' ? parsed.description : `Visual analysis of ${filename}`,
    objects: Array.isArray(parsed.objects) ? parsed.objects : [],
    scientific_elements: Array.isArray(parsed.scientific_elements) ? parsed.scientific_elements : [],
    location_clues: Array.isArray(parsed.location_clues) ? parsed.location_clues : [],
    is_polar: Boolean(parsed.is_polar),
    confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.85
  };
}
