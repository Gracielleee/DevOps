import fs from 'fs';
import yaml from 'js-yaml';

const knowledgeBasePath = process.env.KNOWLEDGE_BASE_PATH || './knowledge-base.yaml';

let knowledgeBase;

try {
  const fileContent = fs.readFileSync(knowledgeBasePath, 'utf8');
  knowledgeBase = yaml.load(fileContent);
} catch (error) {
  console.error('Error loading knowledge base:', error.message);
  knowledgeBase = {}; // Fallback to empty object
}

// --------------------------------------------------------------

function getAnswerFromKnowledgeBase(question) {
  const lowerQuestion = question.toLowerCase();
  for (const category in knowledgeBase) {
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
  const lowerQuestion = question.toLowerCase();
  
  // Definition detection
  if (lowerQuestion.includes('what is') || 
      lowerQuestion.includes('define') || 
      lowerQuestion.includes('meaning of')) {
    return 'definition';
  }
  
  // Explanation detection
  if (lowerQuestion.includes('how does') || 
      lowerQuestion.includes('why does') || 
      lowerQuestion.includes('explain')) {
    return 'explanation';
  }
  
  // Example detection
  if (lowerQuestion.includes('example') || 
      lowerQuestion.includes('show me') || 
      lowerQuestion.includes('give me')) {
    return 'example';
  }
  
  // General question
  return 'general';
}

function detectSubjectCategory(question) {
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
  if (isMath) category = 'math';
  if (isHistory) category = 'history';
  if (isScience) category = 'science';

  return category;
}

function generatePromptPrefix(question) {
  const category = detectSubjectCategory(question);
  const questionType = detectQuestionType(question);
  
  const promptSections = [];
  
  // Add system-level context
  promptSections.push('You are a helpful AI academic tutor. Please respond to the following question.');
  
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
  
  return finalPrompt;

  console.log(`Question: ${question}`);
  console.log(`Detected category: ${category}`);
  console.log(`Detected question type: ${questionType}`);
  console.log(`Generated prompt:\n${finalPrompt}`);
}

// More detailed fallback responses when the API call fails
function getBackupResponse(category, question) {
  const lowerQuestion = question.toLowerCase();
  
  // Handle science category
  if (category === 'science') {
    return "That's an interesting science question! Science helps us understand the natural world through observation and experimentation. I'd be happy to explain more about this specific scientific topic if you provide more details.";
  }
  
  // Handle math category
  if (category === 'math') {
    return "I can help with your math question. In mathematics, it's important to understand the fundamental concepts and formulas. Could you provide more details about your specific math problem?";
  }
  
  // Handle history/geography category
  if (category === 'history') {
    return "Interesting question about history or culture! I'd be happy to share more information about this topic if you provide more details.";
  }
  
  // Default response for general questions
  return "I'm not sure I understand your question completely. Could you please provide more details or rephrase it? I can help with topics related to science, math, history, and general knowledge.";
}

export { getAnswerFromKnowledgeBase, generatePromptPrefix, detectSubjectCategory, getBackupResponse };
