import { getResponseFromAI } from "./ai-client-text-gen.js";
import { analyzeSentiment } from "./ai-client-sentiment-analysis.js";
import { getAnswerFromKnowledgeBase, generatePromptPrefix, getBackupResponse } from "./ai-helper.js";
import logger from "../logger.js";

const fileName = "ai-service.js";

export async function generateResponse(question, subjectCategory = 'general') {
  logger.debug("Starting generateResponse function", { file: fileName });
  logger.info("Received question from user: " + question, { file: fileName });

  const category = subjectCategory || 'general';
  logger.info("Subject context category: " + category, { file: fileName });

  logger.debug("Generating prompt prefix...", { file: fileName });
  const promptprefix = generatePromptPrefix(question, category);
  logger.debug("Prompt prefix generated", { file: fileName });

  // 1. Check knowledge base first
  logger.debug("Checking knowledge base for direct matches...", { file: fileName });
  const knowledgeBaseAnswer = getAnswerFromKnowledgeBase(question, category);
  
  if (knowledgeBaseAnswer) {
    logger.info("Found answer in knowledge base", { file: fileName });
    return knowledgeBaseAnswer;
  }

  logger.debug("No direct match in knowledge base, proceeding to call AI", { file: fileName });

  // 2. For other questions, try the API with a strict timeout
  try {
    // logger.debug("Analyzing sentiment of question...", { file: fileName });
    // const sentimentResult = await analyzeSentiment(question);
    // logger.info("Sentiment analysis complete: " + JSON.stringify(sentimentResult), { file: fileName });

    logger.debug("Constructing complete prompt...", { file: fileName });
    const completePrompt = promptprefix + ". Actual question: " + question;

    logger.debug("Calling AI API with prompt...", { file: fileName });
    const aiResponseString = await getResponseFromAI(completePrompt);
    logger.info("AI response received successfully", { file: fileName });

    if (aiResponseString) {
      logger.debug("Valid text response from AI", { file: fileName });
      return {
        category,
        response: aiResponseString
      };
    } else {
      logger.warn("Empty response from AI", { file: fileName });
      throw new Error("Empty response from AI");
    }

  } catch (error) {
    logger.error("Error calling Hugging Face API: " + error.message, { file: fileName });
    logger.debug("Falling back to backup response for category: " + category, { file: fileName });
    return {
      category,
      response: getBackupResponse(category, question)
    };
  }
}

export default generateResponse;
