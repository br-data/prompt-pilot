import React, { useContext, useEffect, useState } from 'react';
import { Breadcrumb, Button, Checkbox, Form, Input, message, Typography, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { TestsetListWrapper, HeaderWrapper, AddButtonWrapper, ButtonWrapper } from './styles.sourcesOverview';
import { getBaseUrl } from '../../utils/getBaseUrl';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SourceList } from '../../components/sourceList/SourceList';
import { UpdateTestsetParams } from './types.testset';
import TextArea from 'antd/es/input/TextArea';
import { User } from '../../types/Types';
import { UserContext } from '../../App';

interface TestsetListData {
    title: string;
    sources: number[] | null;
    id: number;
    createdAt: Date;
    description: string;
}

export const SourcePage: React.FC = () => {
    const userData = useContext(UserContext);
    const [searchParams] = useSearchParams();
    const testsetIdParam = searchParams.get('id');
    const testsetId = parseInt(testsetIdParam || '');
    const [title, setTitle] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(1);
    const [sourcesForm] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const baseUrl = getBaseUrl();
    const navigate = useNavigate();
    const [sourcesMetaForm] = Form.useForm();
    const [createdBy, setCreatedBy] = useState<User>();
    const { confirm } = Modal;


    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const submitMetaForm = () => {
        sourcesMetaForm
            .validateFields()
            .then((values) => {
                if (!testsetId) {
                    console.error('Ungültige Testset-ID');
                    messageApi.error('Ungültige Testset-ID');
                    return;
                }
                const payload = { ...values, testsetId: testsetId };

                fetch(baseUrl + '/source', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Fehler beim Erstellen der Quelle');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        sourcesForm.resetFields();
                        setIsModalOpen(false);
                        setRefreshTrigger((prev) => prev + 1);
                    })
                    .catch((error) => {
                        console.error('Fehler:', error);
                    });
            })
            .catch((info) => {
                console.log('Validation failed:', info);
            });
    };

    const submitForm = () => {
        sourcesForm
            .validateFields()
            .then((values) => {
                if (!testsetId) {
                    console.error('Ungültige Testset-ID');
                    messageApi.error('Ungültige Testset-ID');
                    return;
                }
                const payload = { ...values, testsetId: testsetId };

                fetch(baseUrl + '/source', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Fehler beim Erstellen der Quelle');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        sourcesForm.resetFields();
                        setIsModalOpen(false);
                        setRefreshTrigger((prev) => prev + 1);
                    })
                    .catch((error) => {
                        console.error('Fehler:', error);
                    });
            })
            .catch((info) => {
                console.log('Validation failed:', info);
            });
    };

    const updateTestset = async ({ id, title, description, public: publicAvailable }: UpdateTestsetParams) => {
        if (!id || (title === undefined && description === undefined && publicAvailable === undefined)) {
            console.error('Keine gültigen Werte übergeben');
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/testset`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id,
                    ...(title !== undefined && { title }),
                    ...(description !== undefined && { description }),
                    ...(publicAvailable !== undefined && { public: publicAvailable })
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Fehler beim Aktualisieren:', errorData);
                return;
            }

            const updatedTestset = await response.json();
            messageApi.success('Quellen-Sammlung erfolgreich aktualisiert');
            return updatedTestset;
        } catch (error) {
            console.error('Fehler beim Senden der Anfrage:', error);
        }
    };

    const deleteTestset = async (id: number) => {
        if (!id) {
            console.error('Keine gültige ID übergeben');
            return;
        }
    
        try {
            const response = await fetch(`${baseUrl}/testset?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Fehler beim Löschen:', errorData);
                return;
            }
    
            messageApi.success('Quellen-Sammlung und zugehörige Quellen erfolgreich gelöscht');
            return true;
        } catch (error) {
            console.error('Fehler beim Senden der Anfrage:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${baseUrl}/testset?id=${testsetId}`);
                if (!response.ok) {
                    throw new Error('Fehler beim Abrufen des Testsets');
                }
                const data = await response.json();
                setCreatedBy(data[0].createdBy);
                setTitle(data[0].title);


                sourcesMetaForm.setFieldsValue({
                    title: data[0].title,
                    description: data[0].description,
                    public: data[0].public
                });
            } catch (error) {
                console.error('Fehler:', error);
            }
        };

        fetchData();
    }, []);

    const showDeleteConfirm = () => {
        confirm({
          title: 'Bist du dir sicher, dass du die Quellen-Sammlung inkl. aller zugehörigen Quellen löschen möchtest?',
          icon: <ExclamationCircleOutlined />,
          okText: 'Ja',
          okType: 'danger',
          cancelText: 'Nein',
          onOk() {
            deleteTestset(testsetId).then(() => {
                navigate('/sources-overview');
            });
          },
          onCancel() {
          },
        });
      };

    return (
        <>
            {contextHolder}
            <Breadcrumb
                items={[
                    {
                        title: <a href="/sources-overview">Quellen-Sammlung</a>
                    },
                    {
                        title: title
                    }
                ]}
                style={{ margin: '16px 0' }}
            />
            <ButtonWrapper>
                <Button onClick={() => navigate('/sources-overview')}>Zurück</Button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                <Button
                    type='default'
                    danger
                    onClick={showDeleteConfirm}
                >
                    Löschen
                </Button>
                <Button
                    type="primary"
                    onClick={() => {
                        sourcesMetaForm.validateFields().then(async (values) => {
                            await updateTestset({
                                id: testsetId,
                                title: values.title,
                                description: values.description,
                                public: values.public
                            });
                        });
                    }}
                >
                    Speichern
                </Button>
                </div>
            </ButtonWrapper>
            <HeaderWrapper>
                <div style={{ width: '100%', marginTop: '2rem' }}>
                    <Form layout="vertical" form={sourcesMetaForm}>
                        <Form.Item label="Titel" name="title">
                            <Input />
                        </Form.Item>
                        <Form.Item label="Beschreibung" name="description">
                            <Input.TextArea rows={2} />
                        </Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'end', color: '#a9a9a9' }}>
                            Angelegt von: {createdBy?.email}
                        </div>
                        <Form.Item name="public" valuePropName="checked">
                            <Checkbox>Öffentlich</Checkbox>
                        </Form.Item>
                    </Form>
                </div>
            </HeaderWrapper>
            <AddButtonWrapper>
                <Button type="default" onClick={showModal}>
                    Hinzufügen
                </Button>
            </AddButtonWrapper>
            <TestsetListWrapper>
                <SourceList testsetId={testsetId} refreshTrigger={refreshTrigger} />
            </TestsetListWrapper>
            <Modal
                title="Hinzufügen"
                open={isModalOpen}
                onOk={submitForm}
                onCancel={handleCancel}
                okText={'Hinzufügen'}
                cancelText={'Abbrechen'}
                width={1000}
            >
                <Form layout="vertical" form={sourcesForm}>
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
            </Modal>
        </>
    );
};
