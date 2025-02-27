import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { GeneratedOutput } from '../../types/Types';
import { AverageEffortByVersion } from '../../pages/testsPage/types.tests';
import { PromptResultTab } from './PromptResultTab';

interface PromptResultsTabsType {
    generatedOutput: GeneratedOutput[] | undefined;
    averageReviewEffortScale: AverageEffortByVersion | 0;
}

export const PromptResultTabs: React.FC<PromptResultsTabsType> = ({ averageReviewEffortScale, generatedOutput }) => {
    const tabData = Object.entries(averageReviewEffortScale).map(([versionId, data]) => ({
        key: versionId,
        label: `${data.title} (ID ${versionId})`,
        children: <PromptResultTab versionId={versionId} generatedOutput={generatedOutput} />
    }));

    return <Tabs defaultActiveKey="1" items={tabData} destroyInactiveTabPane={false} />;
};
