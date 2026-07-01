import { 
  questionCounter, 
  learningMaterialsCounter 
} from './metrics.js';
import { getCharacterRange, CONTENT_TYPES } from './monitoringConstants.js'; 

/**
 * AI requests
 */
export const trackAiRequest = (subject, startTime, responseText, isSuccess = true) => {
  const status = isSuccess ? 'success' : 'error';
  
  questionCounter.inc({ subject, status });

  const range = getCharacterRange(responseText, CONTENT_TYPES.MESSAGE) || "unknown";

  startTime({ subject, status, character_range: range });
};

/**
 * Learning materials
 */
export const trackMaterialCreation = (subject, content) => {
  if (!content) return;
  
  const range = getCharacterRange(content, CONTENT_TYPES.MATERIAL) || "unknown";
  
  learningMaterialsCounter.inc({
    subject,
    character_range: range
  });
};