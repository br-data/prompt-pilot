import React, { useEffect, useState } from 'react';
import { Layout, Breadcrumb, Form, Input, Select, Radio, Button, Checkbox, message, Modal } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getBaseUrl } from '../../utils/getBaseUrl';
import { AnnotationListType, GeneratedOutput, Prompt, User } from '../../types/Types';
import { AddButtonWrapper, HeaderWrapper, Headline, SubHeadline, SubHeadlineH3 } from './styles.tests';
import { TinyChart } from '../../components/testsPage/TinyChart';
import { AverageEffortByVersion } from './types.tests';
import { PromptResultTabs } from '../../components/testsPage/PromptResultTabs';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useModels } from '../../hooks/useModels';

export interface UpdateFeedback {
    id: number;
    reviewEffortScale: number;
    feedbackText: string;
}

export const TestDetails: React.FC = () => {
    const [annotationData, setAnnotationData] = useState<AnnotationListType | null>(null);
    const [breadcrumbTitle, setBreadcrumbTitle] = useState('');
    const [averageReviewEffortScale, setAverageReviewEffortScale] = useState<AverageEffortByVersion | 0>(0);
    const [createdBy, setCreatedBy] = useState<User>();
    const [form] = Form.useForm();
    const [searchParams] = useSearchParams();
    const testsetIdParam = searchParams.get('id');
    const testsetId = Number(testsetIdParam);
    const baseUrl = getBaseUrl();
    const { confirm } = Modal;
    const navigate = useNavigate();
    const { models } = useModels();

    const calculateAverageReviewEffortScaleByVersion = (data: AnnotationListType) => {
        const versionData: Record<number, { totalEffort: number; count: number }> = {};

        data.generatedOutput.forEach(({ versionId, feedbacks }) => {
            if (versionId == null || !Array.isArray(feedbacks)) return;

            feedbacks.forEach(({ reviewEffortScale }) => {
                if (reviewEffortScale == null) return;

                if (!versionData[versionId]) {
                    versionData[versionId] = { totalEffort: 0, count: 0 };
                }

                versionData[versionId].totalEffort += reviewEffortScale;
                versionData[versionId].count++;
            });
        });

        interface VersionStats {
            averageEffort: number | null;
            title: string | null;
        }

        const averageEffortByVersion: Record<number, VersionStats> = {};

        data.prompts.forEach((prompt) => {
            averageEffortByVersion[prompt.versionId] = {
                averageEffort: null,
                title: prompt.title
            };
        });

        Object.entries(versionData).forEach(([id, { totalEffort, count }]) => {
            const versionId = Number(id);
            const average = totalEffort / count;

            averageEffortByVersion[versionId].averageEffort = average;
        });

        return averageEffortByVersion;
    };

    const fetchData = async () => {
        try {
            const response = await fetch(`${baseUrl}/annotationlist/${testsetId}`);
            if (!response.ok) {
                throw new Error(`Server antwortete mit Status: ${response.status}`);
            }
            const data = await response.json();
            const formattedPrompts = data.prompts.map((prompt: Prompt) => ({
                value: prompt.versionId,
                label: prompt.title
            }));

            form.setFieldsValue({
                title: data.title,
                description: data.description,
                testset: data.testsetName,
                prompts: data.prompts.map((prompt: Prompt) => prompt.versionId),
                runs: data.runs,
                public: data.public
            });
            setCreatedBy(data.createdBy);
            setBreadcrumbTitle(data.title);
            setAnnotationData(data);
            const averageEffort = calculateAverageReviewEffortScaleByVersion(data);
            setAverageReviewEffortScale(averageEffort as AverageEffortByVersion);
        } catch (error) {
            console.error('Fehler beim Abrufen der AnnotationList:', error);
        }
    };

    useEffect(() => {
        if (isNaN(testsetId)) {
            return;
        }
        fetchData();
    }, [testsetId]);

    useEffect(() => {
        if (annotationData && annotationData.id === testsetId) {
            form.setFieldsValue({
                title: annotationData.title,
                description: annotationData.description,
                testset: annotationData.sourcesName,
                prompts: annotationData.prompts.map((prompt) => prompt.versionId),
                runs: annotationData.runs,
                public: annotationData.public
            });
        }
    }, [annotationData]);

    const updateValues = () => {
        form.validateFields()
            .then((values) => {
                const payload = {
                    title: values.title,
                    description: values.description,
                    public: values.public
                };

                fetch(`${baseUrl}/annotationlist?id=${testsetId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Fehler beim Aktualisieren der AnnotationList');
                        }
                        return response.json();
                    })
                    .catch((error) => {
                        console.error('Fehler:', error);
                    });
            })
            .catch((info) => {
                console.log('Validation failed:', info);
            });
    };

    const deleteAnnotationList = async (id: number) => {
        try {
            const response = await fetch(`${baseUrl}/annotationlist/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Server antwortete mit Status: ${response.status}`);

            message.success(`Testset mit ID ${id} wurde erfolgreich gelöscht.`);
        } catch (error) {
            message.error(`Fehler beim Löschen des Tests: ${error}`);
            throw error;
        }
    };

    const showDeleteConfirm = () => {
        confirm({
            title: 'Bist du dir sicher, dass du den Test inkl. des gesammelten Feedbacks löschen möchtest?',
            icon: <ExclamationCircleOutlined />,
            okText: 'Ja',
            okType: 'danger',
            cancelText: 'Nein',
            onOk() {
                return deleteAnnotationList(testsetId).then(() => {
                    setTimeout(() => {
                        navigate('/');
                    }, 1500);
                });
            },
            onCancel() {}
        });
    };

    return (
        <>
            <Breadcrumb
                items={[
                    {
                        title: <a href="/">Tests</a>
                    },
                    {
                        title: breadcrumbTitle
                    }
                ]}
                style={{ margin: '16px 0' }}
            />
            <HeaderWrapper>
                <div>
                    <SubHeadline>Details</SubHeadline>
                </div>
            </HeaderWrapper>
            <AddButtonWrapper>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button type="default" danger onClick={() => showDeleteConfirm()}>
                        Löschen
                    </Button>
                    <Button type="default" onClick={updateValues}>
                        Speichern
                    </Button>
                </div>
            </AddButtonWrapper>
            <Form layout="vertical" form={form}>
                <Form.Item label="Titel" name="title" rules={[{ required: true, message: 'Titel' }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Beschreibung"
                    name="description"
                    rules={[{ required: true, message: 'Beschreibung' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item label="Testset" name="testset">
                    <Select placeholder="Testset" optionFilterProp="label" options={models} disabled />
                </Form.Item>
                <Form.Item label="Prompts" name="prompts">
                    <Select
                        mode="multiple"
                        options={annotationData?.prompts
                            ?.map((prompt) => ({
                                value: prompt.versionId,
                                label: `${prompt.title} (ID: ${prompt.versionId})`
                            }))
                            .sort((a, b) => a.label.localeCompare(b.label))}
                        disabled
                    />
                </Form.Item>
                <Form.Item name="public" valuePropName="checked">
                    <Checkbox>Öffentlich</Checkbox>
                </Form.Item>
                <Form.Item label="Durchläufe" name="runs" rules={[{ required: true }]}>
                    <Radio.Group disabled>
                        <Radio.Button value={1}>1x</Radio.Button>
                        <Radio.Button value={2}>2x</Radio.Button>
                        <Radio.Button value={3}>3x</Radio.Button>
                    </Radio.Group>
                </Form.Item>
                <div style={{ display: 'flex', justifyContent: 'start', color: '#a9a9a9' }}>
                    Angelegt von: {createdBy?.email}
                </div>
            </Form>
            <div
                style={{
                    padding: 27,
                    minHeight: 360,
                    marginTop: '2rem',
                    background: 'white',
                    borderRadius: '15px'
                }}
            >
                <div style={{ marginBottom: '2rem' }}>
                    <SubHeadline>Ergebnisse</SubHeadline>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <SubHeadlineH3>Durchschnittliche Bewertung</SubHeadlineH3>
                </div>
                <div style={{ marginBottom: '3rem' }}>
                    <TinyChart averageReviewEffortScale={averageReviewEffortScale}></TinyChart>
                </div>
                <div>
                    <PromptResultTabs
                        averageReviewEffortScale={averageReviewEffortScale}
                        generatedOutput={annotationData?.generatedOutput}
                    ></PromptResultTabs>
                </div>
            </div>
        </>
    );
};
