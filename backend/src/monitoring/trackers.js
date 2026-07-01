import {
  questionCounter,
  learningMaterialsCounter,
  aiResponseLength,
  aiEmptyResponseCounter,
} from "./metrics.js";
import { getCharacterRange, CONTENT_TYPES } from "./monitoringConstants.js";

/**
 * AI requests
 */
export const trackAiRequest = (
  subject,
  endTimer,
  inputText,
  isSuccess = true,
) => {
  const status = isSuccess ? "success" : "error";

  questionCounter.inc({ subject, status });

  const range =
    getCharacterRange(inputText, CONTENT_TYPES.MESSAGE) || "unknown";

  if (typeof endTimer === "function") {
    endTimer({ subject, status, character_range: range });
  }
};

export const trackAiResponseLength = (
  subject,
  responseText,
  isSuccess = true,
) => {
  const status = isSuccess ? "success" : "error";

  if (responseText) {
    const length = String(responseText).trim().length;
    aiResponseLength.observe({ subject, status }, length);
  } else {
    aiResponseLength.observe({ subject, status }, 0);
    try {
      aiEmptyResponseCounter.inc({ subject });
    } catch (e) {
      console.error("Error incrementing aiEmptyResponseCounter:", e);
    }
  }
};

/**
 * Learning materials
 */
export const trackMaterialCreation = (subject, content) => {
  if (!content) return;

  const range = getCharacterRange(content, CONTENT_TYPES.MATERIAL) || "unknown";

  learningMaterialsCounter.inc({
    subject,
    character_range: range,
  });
};
