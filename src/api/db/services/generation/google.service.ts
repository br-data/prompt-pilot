import { Source } from '../../../../types/Types';
import { GenerateContentRequest, VertexAI } from '@google-cloud/vertexai';
import { Part } from '@google-cloud/vertexai';

const project = process.env.GOOGLE_PROJECT;

const location = 'us-central1';

const vertexAI = new VertexAI({ project: project, location: location });

export async function generateWithGoogle(modelId: string, prompt: string, variance: number, source: Source) {
    const generativeModel = vertexAI.getGenerativeModel({
        model: modelId,
        generationConfig: { temperature: variance * 0.2 }
    });

    const request: GenerateContentRequest = {
        contents: [
            { role: 'user', parts: [{ text: prompt }] },
            { role: 'user', parts: [{ text: source.content }] }
        ]
    };
    const result = await generativeModel.generateContent(request);
    const response = result.response;

    const parts: Part[] | undefined = response?.candidates?.[0]?.content?.parts;

    const text = parts?.map((part: Part) => part.text)?.join('\n\n') || '';

    return text;
}