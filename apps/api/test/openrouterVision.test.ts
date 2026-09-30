import { describe, it } from 'node:test';
import assert from 'node:assert';
import { callOpenRouterVision } from '../src/ai/openrouter.js';
import { analyzeImageContent } from '../src/ai/gemini.js';

describe('POLARWEAVE OpenRouter Vision Integration Tests', () => {
  it('Tests OpenRouter Vision live API with an authentic test image', async () => {
    // 1x1 valid transparent PNG buffer
    const testPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const buffer = Buffer.from(testPngBase64, 'base64');

    const result = await callOpenRouterVision('test_calibration_target.png', buffer, 'image/png');

    console.log('[Test Result] OpenRouter Vision output:', result);

    assert.ok(typeof result.description === 'string' && result.description.length > 0, 'Must have description');
    assert.ok(Array.isArray(result.objects), 'Must have objects array');
    assert.ok(Array.isArray(result.scientific_elements), 'Must have scientific_elements array');
    assert.ok(Array.isArray(result.location_clues), 'Must have location_clues array');
    assert.ok(typeof result.is_polar === 'boolean', 'Must have boolean is_polar');
    assert.ok(typeof result.confidence === 'number' && result.confidence >= 0 && result.confidence <= 1, 'Confidence must be between 0 and 1');

    // Confirm that a 1x1 blank image is not fabricated as Antarctic fast-ice
    assert.strictEqual(result.is_polar, false, 'Unrelated blank pixel should not be classified as polar');
  });

  it('Tests analyzeImageContent integrates OpenRouter and maps strictly into scientific record', async () => {
    const testPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const buffer = Buffer.from(testPngBase64, 'base64');

    const result = await analyzeImageContent('fundus_retina_sample.png', buffer, 'image/png');

    console.log('[Test Result] analyzeImageContent mapped result:', result);

    assert.ok(result.caption, 'Must contain caption');
    assert.ok(Array.isArray(result.detected_entities), 'Must have detected_entities');
    assert.strictEqual(result.is_polar_related, false, 'Retina sample must not be fabricated as polar');
    assert.strictEqual(result.research_domain, 'Biology & Ecology', 'Non-polar biomedical image maps to Biology & Ecology');
    assert.ok(result.raw_ai_analysis?.provider === 'openrouter', 'Provider must be OpenRouter');
  });

  it('Verifies error handling when OpenRouter API fails or key is missing', async () => {
    let threw = false;
    try {
      const testPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      const buffer = Buffer.from(testPngBase64, 'base64');
      // Pass an explicitly invalid key to test authentication failure handling
      await callOpenRouterVision('failure_test.png', buffer, 'image/png', { apiKey: 'invalid-key-sk-test' });
    } catch (err: any) {
      threw = true;
      console.log('[Test Result] Caught expected error:', err.message);
      assert.ok(
        err.message.includes('OpenRouter') || err.message.includes('401') || err.message.includes('failed'),
        'Must throw clear error message'
      );
    }
    assert.strictEqual(threw, true, 'Must throw error on invalid OpenRouter call rather than substituting demo Antarctic data');
  });
});
