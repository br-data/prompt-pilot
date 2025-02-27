import React, { useContext, useEffect, useState } from 'react';
import { List, Avatar } from 'antd';
import { getBaseUrl } from '../../utils/getBaseUrl';
import { UserContext } from '../../App';
import { Sources } from '../../types/Types';

export const SourcesList: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
    const [sourcesListData, setSourcesListListData] = useState<unknown[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { user, isLoading } = useContext(UserContext);

    const baseUrl = getBaseUrl();

    useEffect(() => {
        if (isLoading || !user) return;

        const fetchData = async () => {
            try {
                const response = await fetch(baseUrl + '/testset');
                if (!response.ok) {
                    throw new Error('Fehler beim Abrufen der Quellen-Sammlung');
                }
                const data = await response.json();

                const filteredEntries: Sources[] = data.filter((entry: Sources) => {
                    return entry.createdBy?.id === user?.userId || entry.public === true;
                });
                setSourcesListListData(filteredEntries);
            } catch (error) {
                console.error('Fehler:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refreshTrigger]);

    return (
        <>
            <List
                loading={loading}
                pagination={{
                    position: 'bottom',
                    align: 'center'
                }}
                dataSource={sourcesListData}
                renderItem={(item: any, index) => (
                    <List.Item
                        actions={[
                            <a key="list-loadmore-edit" href={`/sources-edit?id=${item.id}`}>
                                Bearbeiten
                            </a>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/9.x/identicon/svg?seed=${item.id}`} />}
                            title={<a href={`/sources-edit?id=${item.id}`}>{item.title}</a>}
                            description={item.description}
                        />
                        <div>{item.createdAt.toString().slice(0, 10)}</div>
                    </List.Item>
                )}
            />
        </>
    );
};
