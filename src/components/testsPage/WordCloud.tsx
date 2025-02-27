import React, { useMemo } from 'react';
import WordCloud, { Word, Options } from 'react-wordcloud';
import { removeStopwords, deu } from 'stopword';

interface WordCloudTypes {
    text: string;
}

interface WordFrequency {
    text: string;
    value: number;
}
console.log('render');
const processText = (text: string): WordFrequency[] => {
    if (!text) {
        return [];
    }

    const words = text
        .toLowerCase()
        .replace(/[^a-zäöüß\s]/g, '')
        .split(/\s+/);

    const filteredWords = removeStopwords(words, deu);

    const wordFrequencies: Record<string, number> = filteredWords.reduce(
        (acc: Record<string, number>, word: string) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        },
        {}
    );

    return Object.entries(wordFrequencies).map(([text, value]) => ({
        text,
        value
    }));
};

export const ReviewWordCloud: React.FC<WordCloudTypes> = ({ text }) => {
    const words = processText(text);

    const options: Options = useMemo(
        () => ({
            rotations: 2,
            rotationAngles: [-90, 0],
            fontSizes: [14, 50] as [number, number],
            colors: ['#4da9be', '#3c48a5', '#e25d33', '#ec9135', '#5837ab', '#87b253'],
            enableTooltip: true,
            deterministic: false,
            fontFamily: 'Helvetica Neue',
            fontStyle: 'normal',
            fontWeight: 'normal',
            padding: 1,
            scale: 'sqrt',
            spiral: 'archimedean',
            transitionDuration: 1000,
            enableOptimizations: true,
            svgAttributes: {},
            textAttributes: {},
            tooltipOptions: {}
        }),
        []
    );

    console.log(words.length);
    return (
        <div style={{ width: '50%', height: 400, alignContent: 'center' }}>
            <WordCloud words={words} size={[600, 400]} options={options} />
        </div>
    );
};
