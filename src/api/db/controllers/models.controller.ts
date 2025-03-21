import { Request, Response } from 'express';
import { fetchAndCacheModels } from '../services/modelCache.service';

export async function getModels(req: Request, res: Response): Promise<void> {
  try {
    const allModels = await fetchAndCacheModels();
    res.json(allModels);
  } catch (error) {
    console.error('Fehler beim Abrufen der Modelle:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Modelle' });
  }
}