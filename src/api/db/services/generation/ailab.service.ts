import OpenAI from 'openai';
import { Source } from '../../../../types/Types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateWithAiLabModel(model: string, prompt: string, variance: number, source: Source) {
    // for DEBUG
    // const baseURL = `https://aiditor-as-a-agent.brdata-dev.de/exceptions/retry_exception`;
    const sourceText = source ? `${source.title}\n\n${source.content}` : '';
    const baseURL = `${process.env.AILAB_MODEL_BASE_URL}openai/deployments/${model}/chat/completions`;

    try {
        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.AILAB_MODEL_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                debug: true,
                stream: false,
                messages: [
                    { role: 'user', content: sourceText }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Fehler: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        let responseObject = {
            response: data.choices[0]?.message?.content || '',
            debug: data.debug || []
        };
        return responseObject;
    } catch (error) {
        console.error('Fehler beim Generieren der Antwort:', error);
        throw error;
    }
}