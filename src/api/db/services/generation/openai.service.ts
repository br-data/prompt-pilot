import OpenAI from 'openai';
import { Source } from '../../../../types/Types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateWithOpenAI(
  model: string,
  prompt: string,
  variance: number,
  source: Source
): Promise<string> {
  const sourceText = source ? `${source.title}\n\n${source.content}` : '';
  const response = await openai.chat.completions.create({
    model,
    temperature: variance * 0.2,
    messages: [
      { role: 'user', content: prompt },
      { role: 'user', content: sourceText }
    ]
  });

  return response.choices[0]?.message?.content || '';
}