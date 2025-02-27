import React, { useContext, useEffect, useState } from 'react';
import { Select } from 'antd';
import { getBaseUrl } from '../../utils/getBaseUrl';
import { Prompt } from '../../types/Types';
import { UserContext } from '../../App';

interface PromptSelectionProps {
    value?: Prompt[];
    onChange?: (value: Prompt[]) => void;
}

export const PromptSelection: React.FC<PromptSelectionProps> = ({ value, onChange }) => {
    const [promptOptions, setPromptOptions] = useState<{ value: number; label: string; prompt: Prompt }[]>([]);
    const baseUrl = getBaseUrl();
    const userData = useContext(UserContext);
    const { user, isLoading } = useContext(UserContext);

    useEffect(() => {
        if (isLoading || !user) return;

        const fetchPrompts = async () => {
            try {
                const response = await fetch(`${baseUrl}/prompt`);
                const data: Prompt[] = await response.json();

                const filteredEntries: Prompt[] = data.filter((entry: Prompt) => {
                    return entry.createdBy?.id === user?.userId || entry.public === true;
                });

                const formattedPrompts = filteredEntries
                    .map((prompt) => ({
                        value: prompt.versionId,
                        label: `${prompt.title} (ID: ${prompt.versionId})`,
                        prompt
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));

                setPromptOptions(formattedPrompts);
            } catch (error) {
                console.error('Fehler beim Abrufen der Prompts:', error);
            }
        };

        fetchPrompts();
    }, []);

    const handleChange = (selectedValues: number[]) => {
        const selectedPrompts = selectedValues
            .map((id) => promptOptions.find((option) => option.value === id)?.prompt)
            .filter(Boolean) as Prompt[];

        onChange?.(selectedPrompts);
    };

    return (
        <Select
            mode="multiple"
            style={{ width: '100%' }}
            options={promptOptions}
            value={value?.map((prompt) => prompt.versionId)}
            onChange={handleChange}
            placeholder="Bitte wähle Prompts aus"
        />
    );
};
