import React, { useEffect, useState } from 'react';
import { List, Avatar, Modal, Form, Input, Alert, message, Button, Breadcrumb } from 'antd';
import { getBaseUrl } from '../../utils/getBaseUrl';

interface Source {
    title: string;
    content: string;
    id: number;
}

export const SourceList: React.FC<{ refreshTrigger: number; testsetId: number }> = ({ refreshTrigger, testsetId }) => {
    const [sourceListData, setSourceListData] = useState<Source[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    const baseUrl = getBaseUrl();

    const showModal = (id: number) => {
        setSelectedId(id);
        setIsModalOpen(true);
        form.setFieldsValue({
            title: sourceListData.find((source) => source.id === id)?.title,
            content: sourceListData.find((source) => source.id === id)?.content
        });
    };

    const closeModal = () => {
        form.resetFields();
        setIsModalOpen(false);
    };

    const handleDelete = async (id: number | null) => {
        if (id === null) {
            console.log('Ungültige ID');
            messageApi.error('Ungültige ID');
            setIsModalOpen(false);
            return;
        }
        try {
            const response = await fetch(`${baseUrl}/source?id=${id}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Fehler beim Löschen');
            }
            messageApi.success(`Quellen-Sammlung mit ID ${id} erfolgreich gelöscht`);
        } catch (error) {
            console.error(error);
        }
        setSelectedId(null);
        fetchData();
        setIsModalOpen(false);
    };

    const updateValues = () => {
        form.validateFields()
            .then((values) => {
                fetch(`${baseUrl}/source`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: selectedId,
                        ...values
                    })
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Fehler beim Aktualisieren der Quelle');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        form.resetFields();
                        setIsModalOpen(false);
                        fetchData();
                    })
                    .catch((error) => {
                        console.error('Fehler:', error);
                    });
            })
            .catch((info) => {
                console.log('Validation failed:', info);
            });
    };

    const fetchData = async () => {
        try {
            const response = await fetch(`${baseUrl}/source?id=${testsetId}`);
            if (!response.ok) {
                throw new Error('Fehler beim Abrufen der Quellen');
            }
            const data = await response.json();
            setSourceListData(data);
        } catch (error) {
            console.error('Fehler:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);

    return (
        <>
            {contextHolder}
            <List
                loading={loading}
                pagination={{
                    position: 'bottom',
                    align: 'center',
                    pageSize: 10
                }}
                dataSource={sourceListData}
                renderItem={(item: any, index) => (
                    <List.Item
                        actions={[
                            <a onClick={() => showModal(item.id)} key="list-loadmore-edit">
                                Bearbeiten
                            </a>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/9.x/glass/svg?seed=${item.id}`} />}
                            title={<a onClick={() => showModal(item.id)}>{item.title}</a>}
                            description={item.content.length > 440 ? `${item.content.slice(0, 440)}...` : item.content}
                        />
                        <div>{item.createdAt.toString().slice(0, 10)}</div>
                    </List.Item>
                )}
            />
            <Modal
                title="Hinzufügen"
                open={isModalOpen}
                onOk={updateValues}
                onCancel={() => {
                    closeModal();
                    setIsModalOpen(false);
                }}
                okText={'Speichern'}
                cancelButtonProps={{ style: { display: 'none' } }}
                width={1000}
            >
                <Form layout="vertical" form={form}>
                    <Form.Item label="Titel" name="title" rules={[{ required: true, message: 'Titel der Quelle' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Inhalt"
                        name="content"
                        rules={[{ required: true, message: 'Bitte geben Sie den Inhalt ein!' }]}
                    >
                        <Input.TextArea rows={16} />
                    </Form.Item>
                </Form>
                <Button danger onClick={() => handleDelete(selectedId)}>
                    Eintrag löschen
                </Button>
            </Modal>
        </>
    );
};
