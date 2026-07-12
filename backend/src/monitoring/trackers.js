import {
  questionCounter,
  learningMaterialsCounter,
  aiEmptyResponseCounter,
} from "./metrics.js";
import { getByteRange, CONTENT_TYPES } from "./monitoringConstants.js";

/**
 * AI requests
 * Tracks: questions per subject
 */
export const trackAiRequest = (subject, isSuccess = true) => {
  const status = isSuccess ? "success" : "error";
  questionCounter.inc({ subject, status });
};

/**
 * AI empty response detection
 * Tracks: empty AI responses for alerting (service degraded)
 */
export const trackAiResponse = (subject, responseText) => {
  if (!responseText || !responseText.trim()) {
    try {
      aiEmptyResponseCounter.inc({ subject });
    } catch (e) {
      console.error("Error incrementing aiEmptyResponseCounter:", e);
    }
  }
};

/**
 * Learning materials
 * Tracks: materials served by subject and byte size range
 */
export const trackMaterialCreation = (subject, content) => {
  if (!content) return;

  const byteRange = getByteRange(content, CONTENT_TYPES.MATERIAL) || "unknown";

  learningMaterialsCounter.inc({
    subject,
    byte_range: byteRange,
  });
};