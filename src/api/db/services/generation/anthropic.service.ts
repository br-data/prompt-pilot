import { Source } from '../../../../types/Types';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function generateWithAnthropicModel(model: string, prompt: string, variance: number, source: Source) {
    const sourceText = source ? `${source.title}\n\n${source.content}` : '';
    const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        temperature: variance * 0.2,
        messages: [
            { role: 'user', content: prompt },
            { role: 'user', content: sourceText }
        ]
    });

    const firstContent = response.content?.[0];
    if (firstContent && 'text' in firstContent) {
        return firstContent.text;
    } else {
        return '';
    }
}