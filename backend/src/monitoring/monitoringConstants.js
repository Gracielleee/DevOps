import { Buffer } from "node:buffer";

const MONITORING_CONSTANTS = {
  MATERIAL_BYTE_RANGES: [ //Same max in src/config
    "1-499",
    "500-2999", 
    "3000-4999", 
    "5000-9999", 
    "10000-19999",
    "20000+",
  ],
  
  MESSAGE_BYTE_RANGES: [
    "1-199",
    "200-799",
    "800-1999",
    "2000-3999",
    "4000+",
  ],
};

const CONTENT_TYPES = {
  MESSAGE: "message",
  MATERIAL: "material",
};

/**
 * Get the byte range bucket for a given string
 * @param {string} text - The text to measure
 * @param {string} contentType - Either "message" or "material"
 * @returns {string} The byte range bucket (e.g., "1000-4999")
 */
function getByteRange(text, contentType = CONTENT_TYPES.MATERIAL) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const byteLength = Buffer.byteLength(text.trim(), 'utf8');

  const ranges = contentType === CONTENT_TYPES.MATERIAL
    ? MONITORING_CONSTANTS.MATERIAL_BYTE_RANGES
    : MONITORING_CONSTANTS.MESSAGE_BYTE_RANGES;

  for (const range of ranges) {
    if (range.endsWith('+')) {
      const min = parseInt(range.replace(/\D/g, ''));
      if (byteLength >= min) return range;
      continue;
    }

    const [min, max] = range.split('-').map(Number);
    if (byteLength >= min && byteLength <= max) {
      return range;
    }
  }

  return ranges[ranges.length - 1];
}

export {
  CONTENT_TYPES,
  MONITORING_CONSTANTS,
  getByteRange
};