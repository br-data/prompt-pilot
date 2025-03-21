import { defaultModels } from '../../../data/models';

interface Model {
    value: string;
    label: string;
    platform: string;
    id: string;
}

let cachedModels: Model[] = [];
let lastFetchTime = 0;

export async function fetchAndCacheModels() {
    const baseURL = `${process.env.AILAB_MODEL_BASE_URL}openai/models`;

    const now = Date.now();
    if (now - lastFetchTime > 60000 || cachedModels.length === 0) {
        try {
            const response = await fetch(baseURL, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${process.env.AILAB_MODEL_KEY}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            });
            const data = await response.json();

            if (!data || !data.data) {
                throw new Error('Ungültige API-Antwort');
            }

            const apiModels = data.data.map((model: Model) => ({
                value: model.id,
                label: model.id,
                platform: 'ailab'
            }));

            cachedModels = [...defaultModels, ...apiModels];
            lastFetchTime = now;
        } catch (error) {
            console.error('Fehler beim Abrufen der Modelle:', error);
        }
    }
    return cachedModels;
}