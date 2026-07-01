const MONITORING_CONSTANTS = {
  // Message character ranges (0-5000) - exponential buckets
  MESSAGE_CHARACTER_RANGES: ["1-19", "20-49", "50-199", "200-799", "800-1799", "1800-3199", "3200-5000"],

  // Material character ranges (0-20000) - exponential buckets
  MATERIAL_CHARACTER_RANGES: ["1-19", "20-49", "50-799", "800-3199", "3200-7199", "7200-12799", "12800-20000"],
};

const CONTENT_TYPES = {
  MESSAGE: "message",
  MATERIAL: "material",
};

/**
 * Get the character range bucket for a given string
 * @param {string} text - The text to measure
 * @param {string} contentType - Either "message" or "material"
 * @returns {string} The range bucket (e.g., "0-19")
 */
function getCharacterRange(text, contentType) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const length = text.trim().length;

  const ranges = contentType === CONTENT_TYPES.MESSAGE
    ? MONITORING_CONSTANTS.MESSAGE_CHARACTER_RANGES
    : MONITORING_CONSTANTS.MATERIAL_CHARACTER_RANGES;

  for (const range of ranges) {
    const [min, max] = range.split("-").map(Number);
    if (length >= min && length <= max) {
      return range;
    }
  }

  return null; // Length exceeds all ranges
}

export {
  CONTENT_TYPES,
  MONITORING_CONSTANTS,
  getCharacterRange
}