import React, { useEffect, useState } from 'react';
import WordCloud, { Word, Options } from 'react-wordcloud';
import { removeStopwords, deu } from 'stopword';
import { completion } from '../../utils/generateOutput';
import ReactMarkdown from 'react-markdown';

interface FeedbackSummarizationProps {
    text: string;
}

export const FeedbackSummarization: React.FC<FeedbackSummarizationProps> = ({ text }) => {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    if (!text) {
        return <p>Kein Feedback vorhanden.</p>;
    }

    useEffect(() => {
        const prompt =
            'Du bekommst im folgenden eine Aneinanderreihung von Feedback. Bitte fasse mir die wesentlichen Punkte stichpunktartig zusammen. Das Rückgabeformat soll Markdown sein.';

        const fetchSummarization = async () => {
            setLoading(true);
            try {
                const result = await completion('gpt-4o-mini-2024-07-18', prompt, 1, text);
                if (result) {
                    setSummary(result);
                } else {
                    setSummary('Ungültiges Ergebnis erhalten.');
                }
            } catch (error) {
                console.error('Error fetching summarization:', error);
                setSummary('Fehler beim Abrufen der Zusammenfassung.');
            } finally {
                setLoading(false);
            }
        };

        fetchSummarization();
    }, [text]);

    return (
        <>
            {loading ? (
                <p>Zusammenfassung wird geladen...</p>
            ) : (
                <>
                    <ReactMarkdown>{summary}</ReactMarkdown>
                </>
            )}
        </>
    );
};
