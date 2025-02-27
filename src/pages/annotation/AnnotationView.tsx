import React, { useContext, useEffect, useState } from 'react';
import { Layout, Card, Button, Spin, Alert, Breadcrumb, Pagination, Modal, Rate, Input, Space, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { getBaseUrl } from '../../utils/getBaseUrl';
import { Feedback, GeneratedOutput } from '../../types/Types';
import styled from 'styled-components';
import TextArea from 'antd/es/input/TextArea';
import { UserContext } from '../../App';
const { Content } = Layout;

export interface UpdateFeedback {
    id: number;
    reviewEffortScale: number;
    feedbackText: string;
}

export const CardWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 1rem;
    max-width: 1400px;
    width: 100%;
`;
export const PaginationWrapper = styled.div`
    width: 100%;
    justify-content: center;
    display: flex;
    margin-top: 20px;
`;

export const AnnotationView: React.FC = () => {
    const [annotationData, setAnnotationData] = useState<GeneratedOutput[]>([]);
    const [shuffledAnnotationData, setShuffledAnnotationData] = useState<GeneratedOutput[]>([]);
    const [searchParams] = useSearchParams();
    const testsetIdParam = searchParams.get('id');
    const testsetId = Number(testsetIdParam);
    const userData = useContext(UserContext);
    const baseUrl = getBaseUrl();

    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);

    const showModal = () => {
        getFeedback(currentItem.id);

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setCurrentFeedback(null);
        setIsModalOpen(false);
    };

    const onOk = () => {
        sendFeedback();
        closeModal();
    };

    const getFeedback = async (id: number) => {
        const url = `${baseUrl}/feedback?id=${id}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Fehler beim Abrufen der Feedback-Daten');
            }

            const feedbacks = await response.json();

            const userFeedback = feedbacks.find((feedback: any) => feedback.userId === userData?.user?.userId);

            if (userFeedback) {
                setCurrentFeedback(userFeedback);
            } else {
                setCurrentFeedback(null);
            }
        } catch (error: any) {
            console.error('Fetch-Error:', error.message);
            throw error;
        }
    };

    const sendFeedback = async () => {
        const url = `${baseUrl}/feedback`;

        if (currentFeedback?.id == undefined) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        reviewEffortScale: currentFeedback?.reviewEffortScale ?? 0,
                        feedbackTextPositive: currentFeedback?.feedbackTextPositive,
                        feedbackTextNegative: currentFeedback?.feedbackTextNegative,
                        userId: userData?.user?.userId,
                        generatedOutputId: currentItem.id
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Fehler beim Erstellen des Feedbacks');
                }

                const data = await response.json();
                return data;
            } catch (error: any) {
                console.error('Fetch-Error:', error.message);
                throw error;
            }
        } else {
            updateFeedback();
        }
    };

    const updateFeedback = async () => {
        const url = `${baseUrl}/feedback/${currentFeedback?.id}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reviewEffortScale: currentFeedback?.reviewEffortScale,
                    feedbackTextPositive: currentFeedback?.feedbackTextPositive,
                    feedbackTextNegative: currentFeedback?.feedbackTextNegative
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Fehler beim Aktualisieren des Feedbacks');
            }

            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Fetch-Error:', error.message);
            throw error;
        }
    };

    const getAnnotationData = async (id: number): Promise<GeneratedOutput[] | undefined> => {
        let url = `${baseUrl}/generatedOutput`;

        if (!isNaN(id)) {
            url += `?id=${encodeURIComponent(id)}`;
        } else {
            setError('Keine gültige Testset-ID gefunden.');
            return;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Server antwortete mit Status: ${response.status}`);
            }

            const data: GeneratedOutput[] = await response.json();
            return data;
        } catch (error) {
            console.error('Fehler beim Abrufen des generierten Outputs:', error);
            setError('Fehler beim Laden der Daten.');
        }
    };

    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    useEffect(() => {
        if (isNaN(testsetId)) {
            setError('Keine gültige Testset-ID gefunden.');
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            const data = await getAnnotationData(testsetId);
            if (data) {
                setAnnotationData(data);
            }
            setLoading(false);
        };
        fetchData();
    }, [testsetId]);

    useEffect(() => {
        if (annotationData.length === 0) return;

        const groupedBySource: { [key: string]: GeneratedOutput[] } = {};
        for (const entry of annotationData) {
            const source = entry.source;
            if (!groupedBySource[source]) {
                groupedBySource[source] = [];
            }
            groupedBySource[source].push(entry);
        }

        Object.keys(groupedBySource).forEach((source) => {
            groupedBySource[source] = shuffleArray(groupedBySource[source]);
        });

        const combinedShuffledData = Object.keys(groupedBySource).reduce((acc: GeneratedOutput[], source) => {
            return acc.concat(groupedBySource[source]);
        }, []);

        setShuffledAnnotationData(combinedShuffledData);
    }, [annotationData]);

    const currentItem = shuffledAnnotationData[currentIndex];

    return (
        <>
            <Breadcrumb
                items={[
                    {
                        title: <a href="/">Tests</a>
                    },
                    {
                        title: 'Bewerten'
                    }
                ]}
                style={{ margin: '16px 0' }}
            />

            <Content>
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                        <Spin tip="Daten werden geladen..." size="large" />
                    </div>
                )}
                {error && (
                    <Alert message="Fehler" description={error} type="error" showIcon style={{ margin: '20px' }} />
                )}

                {!loading && !error && currentItem && (
                    <CardWrapper>
                        <Card title="Quelle" bordered={false} style={{ width: '50%' }}>
                            {currentItem.source}
                        </Card>
                        <Card
                            title="Generierter Inhalt"
                            bordered={false}
                            style={{ width: '50%', height: '100%', whiteSpace: 'pre-wrap' }}
                            actions={[
                                <p>{currentItem.content.length} Zeichen</p>,
                                <p>{Math.ceil(currentItem.content.length / 60)} Zeilen</p>,
                                <p>{Math.ceil(currentItem.content.length / 60) * 4} Sekunden</p>
                            ]}
                            extra={<Button onClick={() => showModal()}>Bewerten</Button>}
                        >
                            {currentItem.content}
                        </Card>
                    </CardWrapper>
                )}

                {!loading && !error && shuffledAnnotationData.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>
                        <p>Keine Daten gefunden.</p>
                    </div>
                )}
            </Content>

            {shuffledAnnotationData.length > 0 && (
                <PaginationWrapper>
                    <Pagination
                        simple
                        current={currentIndex + 1}
                        total={shuffledAnnotationData.length}
                        pageSize={1}
                        onChange={(page) => setCurrentIndex(page - 1)}
                    />
                </PaginationWrapper>
            )}
            <Modal
                title="Feedback"
                open={isModalOpen}
                onOk={() => onOk()}
                okText={'Speichern'}
                onCancel={() => {
                    closeModal();
                    setIsModalOpen(false);
                }}
                cancelButtonProps={{ style: { display: 'none' } }}
            >
                <Rate
                    value={currentFeedback?.reviewEffortScale ?? 0}
                    onChange={(value) => {
                        setCurrentFeedback((prev) => ({
                            ...prev,
                            reviewEffortScale: value,
                            id: prev?.id
                        }));
                    }}
                />
                <Typography.Title level={5}>Was ist dir positiv aufgefallen?</Typography.Title>
                <TextArea
                    aria-label="Positives Feedback"
                    style={{ marginTop: '10px' }}
                    rows={5}
                    value={currentFeedback?.feedbackTextPositive || ''}
                    onChange={(e) => {
                        const newText = e.target.value;
                        setCurrentFeedback((prev) => ({
                            ...prev,
                            feedbackTextPositive: newText
                        }));
                    }}
                />
                <Typography.Title level={5}>Was ist dir negativ aufgefallen?</Typography.Title>
                <TextArea
                    aria-label="Negatives Feedback"
                    style={{ marginTop: '10px' }}
                    rows={5}
                    value={currentFeedback?.feedbackTextNegative || ''}
                    onChange={(e) => {
                        const newText = e.target.value;
                        setCurrentFeedback((prev) => ({
                            ...prev,
                            feedbackTextNegative: newText
                        }));
                    }}
                />
            </Modal>
        </>
    );
};
