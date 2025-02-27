import React, { SetStateAction, useContext, useEffect, useState } from 'react';
import { Select } from 'antd';
import { getBaseUrl } from '../../utils/getBaseUrl';
import { Sources } from '../../types/Types';
import { UserContext } from '../../App';

interface TestsetSelectionProps {
    value?: number;
    onChange?: (value: string[]) => void;
    setTestsetName: (name: string) => void;
}

export const SourcesSelection: React.FC<TestsetSelectionProps> = ({ value, onChange, setTestsetName }) => {
    const [testsetList, setTestsetList] = useState<{ value: number; label: string; testset: Sources }[]>([]);
    const baseUrl = getBaseUrl();
    const { user, isLoading } = useContext(UserContext);


    useEffect(() => {
        if (isLoading || !user) return;
        const fetchTestsets = async () => {
            try {
                const response = await fetch(`${baseUrl}/testset`);
                const data: Sources[] = await response.json();

                const filteredEntries: Sources[] = data.filter((entry: Sources) => {
                    return entry.createdBy?.id === user?.userId || entry.public === true;
                });

                const formattedTestsets = filteredEntries.map((testset) => ({
                    value: testset.id,
                    label: testset.title,
                    testset: testset
                }));

                setTestsetList(formattedTestsets);
            } catch (error) {
                console.error('Fehler beim Abrufen der Testsets:', error);
            }
        };

        fetchTestsets();
    }, []);

    const handleChange = (selectedValue: number) => {
        const selectedTestset = testsetList.find((option) => option.value === selectedValue)?.testset;

        if (selectedTestset) {
            const sourceContents = selectedTestset.sources.map((source) => `${source.title}\n${source.content}`);
            onChange?.(sourceContents);
        }
        setTestsetName(selectedTestset?.title ?? '');
    };

    return (
        <Select
            style={{ width: '100%' }}
            options={testsetList}
            value={testsetList.find((option) => option.testset.description === value)?.value}
            onChange={handleChange}
            placeholder="Bitte wähle ein Testset aus"
        />
    );
};
