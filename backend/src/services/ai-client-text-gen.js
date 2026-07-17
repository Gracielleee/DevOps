import { InferenceClient } from '@huggingface/inference';
import logger from "../config/logger.js";

const client = new InferenceClient(process.env.HF_TOKEN, { timeout: 30 });

const NODE_ENV = process.env.NODE_ENV;

const fileName = "ai-client-text-gen.js";

export async function getResponseFromAI(question, conversationHistory = []) {
    try {
        // Cheaper model for dev work; Better quality model for production
        const activeModel = NODE_ENV === 'production' 
            ? "aisingapore/Qwen-SEA-LION-v4-32B-IT:cheapest" 
            : "Qwen/Qwen2.5-7B-Instruct";

        const chatCompletion = await client.chatCompletion({
            model: activeModel, 
            messages: [
                ...conversationHistory,
                {
                    role: "user",
                    content: question,
                },
            ],
        });
        
        logger.debug("question:", question, { file: fileName });
        logger.info("Inference Client response:", chatCompletion.choices[0].message, { file: fileName });
        return chatCompletion.choices[0].message.content;

    } catch (error) {
        logger.error("Inference Client Error:", error.message, { file: fileName });
        return null;
    }
}