import fs from 'fs';
import yaml from 'js-yaml';
import logger from '../logger.js';

const knowledgeBasePath = process.env.KNOWLEDGE_BASE_PATH || './knowledge-base.yaml';

let knowledgeBase;

const fileName = "ai-helper.js";

try {
  logger.debug(`Attempting to load knowledge base from: ${knowledgeBasePath}, file: ${fileName}`);
  const fileContent = fs.readFileSync(knowledgeBasePath, 'utf8');
  knowledgeBase = yaml.load(fileContent);
  logger.debug(`Knowledge base loaded successfully with ${Object.keys(knowledgeBase || {}).length} categories`, { file: fileName });
} catch (error) {
  logger.error('Error loading knowledge base:', error.message, { file: fileName });
  knowledgeBase = {}; // Fallback to empty object
}

// --------------------------------------------------------------

function subjectNameToCategory(subjectName) {
  const name = (subjectName || '').toLowerCase();
  const mapping = {
    general: 'general',
    math: 'math',
    mathematics: 'math',
    history: 'history',
    science: 'science',
  };
  return mapping[name] || 'general';
}

function getAnswerFromKnowledgeBase(question, subjectCategory = null) {

  logger.debug(`[getAnswerFromKnowledgeBase] Starting search for question: "${question}"`, { file: fileName });
  const lowerQuestion = question.toLowerCase();
  const categoriesToSearch = subjectCategory && knowledgeBase[subjectCategory]
    ? [subjectCategory]
    : Object.keys(knowledgeBase);

  for (const category of categoriesToSearch) {
    for (const item of knowledgeBase[category]) {
      if (lowerQuestion.includes(item.question.toLowerCase())) {
        return {
          category,
          response: item.answer
        };
      }
    }
  }
  return null;
}

function detectQuestionType(question) {
  logger.debug(`[detectQuestionType] Analyzing question type for: "${question}"`, { file: fileName });
  const lowerQuestion = question.toLowerCase();
  
  // Definition detection
  if (lowerQuestion.includes('what is') || 
      lowerQuestion.includes('define') || 
      lowerQuestion.includes('meaning of')) {
    logger.info(`[detectQuestionType] Detected type: "definition"`, { file: fileName });
    return 'definition';
  }
  
  // Explanation detection
  if (lowerQuestion.includes('how does') || 
      lowerQuestion.includes('why does') || 
      lowerQuestion.includes('explain')) {
    logger.info(`[detectQuestionType] Detected type: "explanation"`, { file: fileName });
    return 'explanation';
  }
  
  // Example detection
  if (lowerQuestion.includes('example') || 
      lowerQuestion.includes('show me') || 
      lowerQuestion.includes('give me')) {
    logger.info(`[detectQuestionType] Detected type: "example"`, { file: fileName });
    return 'example';
  }
  
  // General question
  return 'general';
}

function detectSubjectCategory(question) {
  logger.debug(`[detectSubjectCategory] Analyzing subject category for: "${question}"`, { file: fileName });
  const lowerQuestion = question.toLowerCase();

    // Determine the category based on keyword matching
  const isMath = lowerQuestion.includes('calculate') || 
                 lowerQuestion.includes('math') ||
                 lowerQuestion.includes('1+1') ||
                 /[+\-*\/=]/.test(lowerQuestion) ||
                 /\d+/.test(lowerQuestion);
  
  const isHistory = lowerQuestion.includes('history') ||
                    lowerQuestion.includes('capital') ||
                    lowerQuestion.includes('philippines') ||
                    lowerQuestion.includes('president');

  const isScience = lowerQuestion.includes('science') ||
                    lowerQuestion.includes('evaporation') ||
                    lowerQuestion.includes('precipitation') ||
                    lowerQuestion.includes('water') ||
                    lowerQuestion.includes('chemical');
                    lowerQuestion.includes('atom');

  let category = 'general';
  if (isMath) {
    logger.info(`[detectSubjectCategory] Math keywords detected: ${isMath}`, { file: fileName });
    category = 'math';
  }
  if (isHistory) {
    logger.info(`[detectSubjectCategory] History keywords detected: ${isHistory}`, { file: fileName });
    category = 'history';
  }
  if (isScience) {
    logger.info(`[detectSubjectCategory] Science keywords detected: ${isScience}`, { file: fileName });
    category = 'science';
  }
  logger.info(`[detectSubjectCategory] Final category: "${category}"`, { file: fileName });
  return category;

  return category;
}

function generatePromptPrefix(question, subjectCategory = 'general') {
  logger.info(`[generatePromptPrefix] Starting prompt generation for question: "${question}"`, { file: fileName });
  const category = subjectCategory || 'general';
  const questionType = detectQuestionType(question);
  
  logger.debug(`[generatePromptPrefix] Category: ${category}, Question Type: ${questionType}`, { file: fileName });

  const promptSections = [];
  
  // Add system-level context
  promptSections.push(`You are a helpful AI academic tutor specializing in ${category}. Please respond to the following question.`);
  
  // Add category-specific instructions
  const categoryInstructions = {
    'math': 'Focus on accuracy and show your work when applicable.',
    'history': 'Provide factual, well-sourced information.',
    'science': 'Use scientific terminology and explain concepts clearly.',
    'general': 'Provide a helpful, informative response.'
  };
  
  promptSections.push(categoryInstructions[category] || 'Provide a helpful response.');
  
  // Add type-specific instructions
  const typeInstructions = {
    'definition': 'Give a clear, concise definition with key terms highlighted.',
    'explanation': 'Explain thoroughly with examples where helpful.',
    'example': 'Provide a practical, real-world example.',
    'general': 'Answer the question directly and helpfully.'
  };
  
  promptSections.push(typeInstructions[questionType] || 'Answer the question helpfully.');
  
  // Add the actual question
  promptSections.push(`\n\nQuestion: `);
  
  // Combine sections with clear delimiters
  const finalPrompt = promptSections.join('\n\n');
  
  logger.debug(`Question: ${question}`, { file: fileName });
  logger.debug(`Detected category: ${category}`, { file: fileName });
  logger.debug(`Detected question type: ${questionType}`, { file: fileName });

  logger.debug(`[generatePromptPrefix] Generated prompt:\n${finalPrompt}`, { file: fileName });
  logger.info(`[generatePromptPrefix] Prompt generation complete`, { file: fileName });

  return finalPrompt;
}

// More detailed fallback responses when the API call fails
function getBackupResponse(category, question) {
  logger.info(`[getBackupResponse] Generating backup response for category: "${category}", question: "${question}"`, { file: fileName });
  const lowerQuestion = question.toLowerCase();
  
  // Handle science category
  if (category === 'science') {
    logger.info(`[getBackupResponse] Returning science backup response`, { file: fileName });
    return "That's an interesting science question! Science helps us understand the natural world through observation and experimentation. I'd be happy to explain more about this specific scientific topic if you provide more details.";
  }
  
  // Handle math category
  if (category === 'math') {
    logger.info(`[getBackupResponse] Returning math backup response`, { file: fileName });
    return "I can help with your math question. In mathematics, it's important to understand the fundamental concepts and formulas. Could you provide more details about your specific math problem?";
  }
  
  // Handle history/geography category
  if (category === 'history') {
    logger.info(`[getBackupResponse] Returning history backup response`, { file: fileName });
    return "Interesting question about history or culture! I'd be happy to share more information about this topic if you provide more details.";
  }
  
  // Default response for general questions
  logger.info(`[getBackupResponse] Returning general backup response`, { file: fileName });
  return "I'm not sure I understand your question completely. Could you please provide more details or rephrase it? I can help with topics related to science, math, history, and general knowledge.";
}

export { getAnswerFromKnowledgeBase, generatePromptPrefix, detectSubjectCategory, getBackupResponse, subjectNameToCategory };
