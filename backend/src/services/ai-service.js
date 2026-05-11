import { get } from "mongoose";
import { getResponseFromAI } from "./inferenceClientHG.js";
import { getAnswerFromKnowledgeBase, generatePromptPrefix, getBackupResponse, detectSubjectCategory} from "./ai-helper.js";
  
// Function to get response from Hugging Face API
export async function generateResponse(question) {
  const lowerQuestion = question.toLowerCase();

  const category = detectSubjectCategory(question);
  const promptprefix = generatePromptPrefix(question);

  // 1. Check knowledge base first for direct matches to provide immediate responses without API call.
  const knowledgeBaseAnswer = getAnswerFromKnowledgeBase(question);
  if (knowledgeBaseAnswer) {
    return knowledgeBaseAnswer;
  }

  // 2. For other questions, try the API with a strict timeout
    try {
    // Call the function (it returns a string)
    const aiResponseString = await getResponseFromAI(promptprefix + question); 

    logger.info("Prompt:", promptprefix + question);

    // Check if we actually got text back
    if (aiResponseString) {
      return {
        category,
        response: aiResponseString
      };
    } else {
      throw new Error("Empty response from AI");
    }

  } catch (error) {
    logger.error("Error calling Hugging Face API:", error);
    return {
      category,
      response: getBackupResponse(category, question)
    };
  }
}

// export default generateResponse; 