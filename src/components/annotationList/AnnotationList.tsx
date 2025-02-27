import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Form, Input, List, Modal, Radio, Select } from 'antd';
import { getBaseUrl } from '../../utils/getBaseUrl';
import { AnnotationListType } from '../../types/Types';
import { UserContext } from '../../App';

export const AnnotationList: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
    const [annotationListData, setAnnotationListData] = useState<AnnotationListType[]>([]);
    const { user, isLoading } = useContext(UserContext);

    const baseUrl = getBaseUrl();

    const fetchData = async () => {
        try {
            const response = await fetch(`${baseUrl}/annotationlist`);
            if (!response.ok) {
                throw new Error('Fehler beim Abrufen der Quellen');
            }
            const data = await response.json();

            const filteredEntries: AnnotationListType[] = data.filter((entry: AnnotationListType) => {
                return entry.createdBy?.id === user?.userId || entry.public === true;
            });

            setAnnotationListData(filteredEntries);
        } catch (error) {
            console.error('Fehler:', error);
        }
    };

    useEffect(() => {
        if (isLoading || !user) return;
        fetchData();
    }, [refreshTrigger]);

    return (
        <>
            <List
                pagination={{
                    position: 'bottom',
                    align: 'center'
                }}
                dataSource={annotationListData}
                renderItem={(item: AnnotationListType, index) => (
                    <List.Item
                        actions={[
                            <a href={`/test-details?id=${item.id}`}>Details</a>,
                            <a href={`/annotation?id=${item.id}`}>Bewerten</a>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/9.x/identicon/svg?seed=${item.id}`} />}
                            title={<a href={`/annotation?id=${item.id}`}>{item.title}</a>}
                            description={item.description}
                        />
                        <div>{item.createdAt.toString().slice(0, 10)}</div>
                    </List.Item>
                )}
            />
        </>
    );
};
