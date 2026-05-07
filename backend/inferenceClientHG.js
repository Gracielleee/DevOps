import { InferenceClient  } from '@huggingface/inference';

const client = new InferenceClient(process.env.HF_TOKEN, {timeout: 30});

export async function getResponseFromAI(question) {
    try{
        const chatCompletion = await client.chatCompletion({
                model: "Qwen/Qwen2.5-7B-Instruct:cheapest",
                messages: [
                    {
                        role: "user",
                        content: "You are a helpful tutor. Use LaTeX for math. Use DOUBLE dollar signs $$ for centered equations and SINGLE dollar signs $ for inline variables. Example: $$E=mc^2$$ and $x$. Answer this : " + question,
                    },
                ],
            });
            console.log("Inference Client response:", chatCompletion.choices[0].message);
            return chatCompletion.choices[0].message.content;

    } catch (error){
        console.error("Inference Client Error:", error.message);
        return null;
    }
}

