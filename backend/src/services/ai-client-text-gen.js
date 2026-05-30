import { InferenceClient } from '@huggingface/inference';
import logger from "../logger.js";

const client = new InferenceClient(process.env.HF_TOKEN, {timeout: 30});

const fileName = "ai-client-text-gen.js";

export async function getResponseFromAI(question, conversationHistory = []) {
    try{
        const chatCompletion = await client.chatCompletion({
                model: "Qwen/Qwen2.5-7B-Instruct:cheapest",
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

    } catch (error){
        logger.error("Inference Client Error:", error.message, { file: fileName });
        return null;
    }
}

