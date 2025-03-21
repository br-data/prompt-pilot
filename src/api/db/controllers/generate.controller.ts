import { Request, Response } from 'express';
import { generateWithOpenAI } from '../services/generation/openai.service';
import { generateWithGoogle } from '../services/generation/google.service';
import { generateWithAiLabModel } from '../services/generation/ailab.service';
import { generateWithAnthropicModel } from '../services/generation/anthropic.service';
import { fetchAndCacheModels } from '../services/modelCache.service';


export async function generateContent(req: Request, res: Response): Promise<void> {
  const { model, prompt, variance, source } = req.body;

  if (!model || !prompt || !source || variance === undefined) {
    res.status(400).json({ error: 'Model, prompt, variance und source werden benötigt.' });
    return;
  }

  try {
    const allModels = await fetchAndCacheModels();
    const selectedModel = allModels.find((m) => m.value === model);

    if (!selectedModel) {
      res.status(400).json({ error: 'Ungültiges Modell ausgewählt.' });
      return;
    }

    let response;
    const platform = selectedModel.platform;

    if (platform === 'openai') {
      response = await generateWithOpenAI(model, prompt, variance, source);
    } else if (platform === 'google') {
      response = await generateWithGoogle(model, prompt, variance, source);
    } else if (platform === 'ailab') {
      response = await generateWithAiLabModel(model, prompt, variance, source);
    } else if (platform === 'anthropic') {
      response = await generateWithAnthropicModel(model, prompt, variance, source);
    } else {
      res.status(400).json({ error: 'Ungültige Plattform ausgewählt.' });
      return;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Fehler beim Generieren des Inhalts:', error);
    res.status(500).json({ error: 'Fehlgeschlagen den Inhalt zu generieren.' });
  }
}