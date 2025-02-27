import React from 'react';
import { GeneratedOutput } from '../../types/Types';
import styled from 'styled-components';
import { PromptResultTable } from './PromptRestultTable';
import { FeedbackSummarization } from './FeedbackSummarization';

interface PromptResultsTabType {
    versionId: string;
    generatedOutput: GeneratedOutput[] | undefined;
}

export const SubHeadline = styled.h3`
    font-size: 1.3rem;
    font-weight: 600;
`;

export const PromptResultTab: React.FC<PromptResultsTabType> = ({ generatedOutput, versionId }) => {
    const collectFeedback = (data: GeneratedOutput[], versionId: number, type: 'positive' | 'negative'): string => {
        const relevantItem = data.find((item) => item.versionId === versionId);
        if (!relevantItem) {
            return '';
        }

        const feedbackTexts = relevantItem.feedbacks
            .map((feedback) => (type === 'positive' ? feedback.feedbackTextPositive : feedback.feedbackTextNegative))
            .filter((text) => text !== null)
            .join(' ');

        return feedbackTexts;
    };

    const positiveFeedback = collectFeedback(generatedOutput ?? [], Number(versionId), 'positive');
    const negativeFeedback = collectFeedback(generatedOutput ?? [], Number(versionId), 'negative');

    return (
        <>
            <div>
                <SubHeadline>Feedback Zusammenfassung*</SubHeadline>
            </div>
            <div
                style={{
                    marginBottom: '4rem',
                    marginTop: '2rem',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: '4rem'
                    }}
                >
                    <div>
                        <div style={{fontWeight: 600}}>Positives Feedback</div>
                        <FeedbackSummarization text={positiveFeedback} />
                    </div>
                    <div>
                        <div style={{fontWeight: 600}}>Negatives Feedback</div>
                        <FeedbackSummarization text={negativeFeedback} />
                    </div>
                </div>
                <div style={{ color: '#a9a9a9' }}>*KI-generiert aus Feedback-Text.</div>
            </div>
            <div style={{ marginBottom: '4rem' }}>
                <SubHeadline>Gesammeltes Feedback</SubHeadline>
                <PromptResultTable versionId={Number(versionId)} generatedOutput={generatedOutput} />
            </div>
        </>
    );
};
