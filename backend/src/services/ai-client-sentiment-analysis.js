import { InferenceClient } from '@huggingface/inference';
import logger from "../../logger.js";

const client = new InferenceClient(process.env.HF_TOKEN, { timeout: 30 });

const fileName = "ai-client-sentiment-analysis.js";

const SENTIMENT_MODEL = {
  'sentiment-analysis': 'distilbert-base-uncased-finetuned-sst-2-english:cheapest',
};

export async function analyzeSentiment(question) {
    try {
        const result = await client.textClassification({
            model: SENTIMENT_MODEL['sentiment-analysis'],
            inputs: question,
        });
        
        logger.info("Sentiment analysis result:", result, { file: fileName });
        return result;
    } catch (error) {
        logger.error("Sentiment Analysis Error:", error.message, { file: fileName });
        return null;
    }
}