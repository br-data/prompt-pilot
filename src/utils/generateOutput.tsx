import React, { useState } from 'react';
import { Prompt } from '../types/Types';
import { getBaseUrl } from './getBaseUrl';
import { GenerationFeedbackProps } from '../pages/testsPage/types.tests';

interface GenerateOutputProps {
    setGeneratingModalContent: React.Dispatch<React.SetStateAction<GenerationFeedbackProps | undefined>>;
    setIsGeneratingFinished: React.Dispatch<React.SetStateAction<boolean>>;
    setWarningMessages: React.Dispatch<React.SetStateAction<string[]>>;
    input: string[];
    prompts: Prompt[];
    annotationListId: number;
    runs: number;
}

interface LogEntry {
    msg: string;
    status: string;
    start?: number | null;
    end?: number | null;
    attempt?: number | null;
    response?: string | null;
    call?: string | null;
}

export const generateOutput = async ({
    setGeneratingModalContent,
    setIsGeneratingFinished,
    setWarningMessages,
    input,
    prompts,
    annotationListId,
    runs
}: GenerateOutputProps) => {
    const baseUrl = getBaseUrl();

    let successCount = 0;
    let failureCount = 0;

    const totalGenerations = input.length * prompts.length * runs;
    let completedGenerations = 0;

    setGeneratingModalContent({
        successCount: 0,
        failureCount: 0,
        totalGenerations: totalGenerations,
        currentGenerations: 0
    });

    for (let runIndex = 0; runIndex < runs; runIndex++) {
        for (const [i, source] of input.entries()) {
            for (const [j, prompt] of prompts.entries()) {
                try {
                    const generatedContent = await completion(prompt.model, prompt.content, prompt.variance, source);

                    let content;

                    if (generatedContent?.debug !== undefined) {
                        content = generatedContent?.response;
                    } else {
                        content = generatedContent;
                    }

                    const ignoreErrorsAndResumeMessage =
                        generatedContent?.debug
                            ?.filter((item: any) => item.status === 'ignore_errors_and_resume')
                            .map((item: any) => item.msg) || [];

                    if (ignoreErrorsAndResumeMessage.length > 0) {
                        setWarningMessages((prevMessages) => [...prevMessages, ...ignoreErrorsAndResumeMessage]);
                    }

                    const debugEntries: LogEntry[] = generatedContent?.debug || [];
                    console.log(debugEntries);

                    const logs: LogEntry[] = debugEntries.map(
                        ({ msg, status, start, end, attempt, response, call }: any): LogEntry => {
                            let extractedResponse: string | null = null;

                            if (typeof response === 'string') {
                                extractedResponse = response;
                            } else if (
                                response &&
                                typeof response === 'object' &&
                                Array.isArray(response.choices) &&
                                response.choices.length > 0
                            ) {
                                extractedResponse = response.choices[0]?.message?.content || null;
                            }

                            let extractedCall: string | null = typeof call === 'string' ? call : null;


                            return {
                                msg,
                                status,
                                start: start ?? null,
                                end: end ?? null,
                                attempt: attempt ?? null,
                                response: extractedResponse,
                                call: extractedCall ?? null
                            };
                        }
                    );

                    const payload = {
                        content: content,
                        source: source,
                        versionId: prompt.versionId,
                        annotationListId: annotationListId,
                        logs
                    };

                    const response = await fetch(`${baseUrl}/generatedOutput`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        throw new Error(`Fehler beim Erstellen für Testset "${source}" und Prompt "${prompt.title}".`);
                    }

                    successCount++;
                } catch (error) {
                    console.error('Fehler beim Speichern:', error);
                    failureCount++;
                } finally {
                    completedGenerations++;
                    setGeneratingModalContent({
                        successCount: successCount,
                        failureCount: failureCount,
                        totalGenerations: totalGenerations,
                        currentGenerations: completedGenerations
                    });
                }
            }
        }
    }

    setGeneratingModalContent({
        successCount: successCount,
        failureCount: failureCount,
        totalGenerations: totalGenerations,
        currentGenerations: successCount + failureCount
    });
    setIsGeneratingFinished(true);
    return;
};

export const completion = async (model: string, prompt: string, variance: number, source: string) => {
    const baseUrl = getBaseUrl();

    try {
        const response = await fetch(`${baseUrl}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                variance: variance,
                source
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to generate content for source: "${source}" and prompt: "${prompt}".`);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error generating output:', error);
    }
};
