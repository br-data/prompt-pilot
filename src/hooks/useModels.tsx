import { useState, useEffect } from 'react';
import { getBaseUrl } from '../utils/getBaseUrl';

export function useModels() {
    const [models, setModels] = useState<{ value: string; label: string; platform: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const baseUrl = getBaseUrl();
        async function fetchModels() {
            try {
                const response = await fetch(`${baseUrl}/models`);
                if (!response.ok) {
                    throw new Error('Fehler beim Abrufen der Modelle');
                }
                const data = await response.json();
                setModels(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }

        fetchModels();
    }, []);

    return { models, loading, error };
}
