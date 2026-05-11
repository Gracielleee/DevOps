import { InferenceClient } from '@huggingface/inference';

const client = new InferenceClient(process.env.HF_TOKEN, { timeout: 30 });

const SENTIMENT_MODEL = {
  'sentiment-analysis': 'distilbert-base-uncased-finetuned-sst-2-english:cheapest',
};

export async function analyzeSentiment(question) {
    try {
        const result = await client.textClassification({
            model: SENTIMENT_MODEL['sentiment-analysis'],
            inputs: question,
        });
        
        logger.info("Sentiment analysis result:", result);
        return result;
    } catch (error) {
        logger.error("Sentiment Analysis Error:", error.message);
        return null;
    }
}