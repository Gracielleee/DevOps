import { InferenceClient } from '@huggingface/inference';
import logger from "../../logger.js";

const client = new InferenceClient(process.env.HF_TOKEN, {timeout: 30});

export async function getResponseFromAI(question) {
    try{
        const chatCompletion = await client.chatCompletion({
                model: "Qwen/Qwen2.5-7B-Instruct:cheapest",
                messages: [
                    {
                        role: "user",
                        content: question,
                    },
                ],
            });
            logger.info("Inference Client response:", chatCompletion.choices[0].message);
            return chatCompletion.choices[0].message.content;

    } catch (error){
        logger.error("Inference Client Error:", error.message);
        return null;
    }
}

