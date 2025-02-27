import React, { ReactNode } from 'react';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { GeneratedOutput } from '../../types/Types';

interface PromptResultTableProps {
    generatedOutput: GeneratedOutput[] | undefined;
    versionId: number;
}

const statusColors: Record<string, string> = {
    warning: 'orange',
    ok: 'green',
    ignore_errors_and_resume: 'red',
    retry: 'orange'
};

interface TableDataType {
    key: React.Key;
    id: number;
    source: string;
    content: string;
    feedbackPositive: ReactNode;
    feedbackNegative: ReactNode;
    logs: ReactNode;
}

export const PromptResultTable: React.FC<PromptResultTableProps> = ({ generatedOutput, versionId }) => {
    const filteredData = (generatedOutput || []).filter((item) => item.versionId === versionId);

    const tableData: TableDataType[] = filteredData.map((item) => {
        const feedbackPositive = item.feedbacks
            ?.map((f) => f.feedbackTextPositive)
            .filter(Boolean)
            .map((text, index) => (
                <div key={index} style={{ marginBottom: '1rem' }}>
                    {text}
                </div>
            ));

        const feedbackNegative = item.feedbacks
            ?.map((f) => f.feedbackTextNegative)
            .filter(Boolean)
            .map((text, index) => (
                <div key={index} style={{ marginBottom: '1rem' }}>
                    {text}
                </div>
            ));

        const logs = item.logs?.map((f, index) => (
            <>
                <div key={`msg:${index}`} style={{ color: statusColors[f.status] || 'inherit', marginBottom: '1rem' }}>
                    {f.msg}
                </div>
                <div key={`response:${index}`} style={{ marginBottom: '1rem' }}>
                    {f.response}
                </div>
                <div key={`call:${index}`} style={{ marginBottom: '1rem' }}>
                    {f.call}
                </div>
            </>
        ));

        return {
            key: item.id,
            id: item.id,
            source: item.source,
            content: item.content,
            feedbackPositive: feedbackPositive || '',
            feedbackNegative: feedbackNegative || '',
            logs: logs || ''
        };
    });

    const columns: TableColumnsType<TableDataType> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['ascend', 'descend']
        },
        {
            title: 'Quelle',
            dataIndex: 'source',
            key: 'source',
            sorter: (a, b) => a.source.localeCompare(b.source),
            sortDirections: ['ascend', 'descend']
        },
        {
            title: 'Generierter Text',
            dataIndex: 'content',
            key: 'content',
            sorter: (a, b) => a.content.length - b.content.length,
            sortDirections: ['ascend', 'descend']
        },
        {
            title: 'Feedback Positiv',
            dataIndex: 'feedbackPositive',
            key: 'feedbackPositive'
        },
        {
            title: 'Feedback Negativ',
            dataIndex: 'feedbackNegative',
            key: 'feedbackNegative'
        },
        { title: 'Logs', dataIndex: 'logs', key: 'logs' }
    ];

    return (
        <Table<TableDataType>
            columns={columns}
            dataSource={tableData}
            pagination={{ pageSize: 10 }}
            scroll={{ y: 250 * 5 }}
        />
    );
};
