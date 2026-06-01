
/**
 * Centralized validation limits for BrainBytes API
 * These should match the Mongoose schema constraints exactly
 */

export const CHARACTER_LIMITS = {
  // User Profile
  USER_NAME_MAX_LENGTH: 50,
  USER_PASSWORD_MIN_LENGTH: 6,
  
  // Subject
  SUBJECT_NAME_MAX_LENGTH: 50,
  SUBJECT_DESCRIPTION_MAX_LENGTH: 100,
  
  // Learning Material
  MATERIAL_TOPIC_MAX_LENGTH: 50,
  MATERIAL_CONTENT_MAX_LENGTH: 20000, // ~20KB
  
  // Message
  MESSAGE_TEXT_MAX_LENGTH: 5000, // ~5KB
  
};

export default CHARACTER_LIMITS;