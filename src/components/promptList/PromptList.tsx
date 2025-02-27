import React, { useContext, useEffect, useState } from 'react';
import { List, Avatar, Modal, Form, Input, message, Button, Select, Slider, Checkbox, Space } from 'antd';
import { getBaseUrl } from '../../utils/getBaseUrl';
import { Prompt, User } from '../../types/Types';
import { SelectionWrapper } from './styles.PromptList';
import { submitForm } from './promptFunctions';
import { UserContext } from '../../App';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { error } from 'console';
import { useModels } from '../../hooks/useModels';

interface PromptListProps {
    refreshTrigger: number;
    setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export const PromptList: React.FC<PromptListProps> = ({ refreshTrigger, setRefreshTrigger }) => {
    const [promptForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVersionId, setSelectedVersionId] = useState<number>();
    const [selectedPromptId, setSelectedPromptId] = useState<string>();
    const [promptVersions, setPromptVersions] = useState<Prompt[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [isCreating, setIsCreating] = useState(false);
    const baseUrl = getBaseUrl();
    const [publicVisible, setPublicVisible] = useState<boolean | undefined>(true);
    const { user, isLoading } = useContext(UserContext);
    const { confirm } = Modal;
    const navigate = useNavigate();

    const [promptListData, setPromptListData] = useState<Prompt[]>([]);
    const [displayedPromptListData, setDisplayedPromptListData] = useState<Prompt[]>([]);
    const [createdBy, setCreatedBy] = useState<User>();
    const { models } = useModels();

    useEffect(() => {
        if (isLoading || !user) return;

        const fetchData = async () => {
            try {
                const response = await fetch(`${baseUrl}/prompt`);
                if (!response.ok) {
                    throw new Error('Fehler beim Abrufen der Prompts');
                }
                const data = (await response.json()) as Prompt[];
                setPromptListData(data);

                const filteredData = Object.values(
                    data.reduce((acc: Record<string, Prompt>, curr: Prompt) => {
                        if (curr.createdBy?.id === user?.userId || curr.public === true) {
                            acc[curr.promptId] = curr;
                        }
                        return acc;
                    }, {})
                );
                setDisplayedPromptListData(filteredData);
            } catch (error) {
                console.error('Fehler:', error);
            }
        };

        const fetchModels = async () => {
            try {
                const response = await fetch(`${baseUrl}/models`);
                if (!response.ok) {
                    throw new Error('Fehler beim Abrufen der Prompts');
                }
                const data = (await response.json()) as Prompt[];
                setPromptListData(data);

                const filteredData = Object.values(
                    data.reduce((acc: Record<string, Prompt>, curr: Prompt) => {
                        if (curr.createdBy?.id === user?.userId || curr.public === true) {
                            acc[curr.promptId] = curr;
                        }
                        return acc;
                    }, {})
                );
                setDisplayedPromptListData(filteredData);
            } catch (error) {
                console.error('Fehler:', error);
            }
        };

        fetchData();
    }, [refreshTrigger]);

    const showModal = (versionId: number) => {
        setSelectedVersionId(versionId);
        const promptId = promptListData.find((prompt) => prompt.versionId === versionId)?.promptId;
        setSelectedPromptId(promptId);

        if (promptId) {
            findPromptVersions(promptId);
        }
        updateInputFieldValues(versionId);

        setIsModalOpen(true);
    };

    const findPromptVersions = (id: string) => {
        const filteredPrompts = promptListData.filter((prompt) => prompt.promptId === id);
        setPromptVersions(filteredPrompts.reverse());
    };

    const updateInputFieldValues = (versionId: number) => {
        const prompt = promptListData.find((prompt) => prompt.versionId === versionId);
        if (!prompt) {
            console.warn(`Prompt mit versionId ${versionId} nicht gefunden.`);
            return;
        }
        setCreatedBy(prompt.createdBy);
        setPublicVisible(prompt.public);
        promptForm.setFieldsValue({
            title: prompt.title,
            description: prompt.description,
            content: prompt.content,
            variance: prompt.variance / 10,
            model: prompt.model,
            public: prompt.public
        });
    };

    const closeModal = () => {
        setRefreshTrigger((prev) => prev + 1);
        promptForm.resetFields();
        setIsCreating(false);
        setIsModalOpen(false);
    };

    const versionSelectOptions = promptVersions.map((prompt: Prompt, index: number) => ({
        label: `${(index + 1).toString()} (ID: ${prompt.versionId})`,
        value: prompt.versionId
    }));

    const handleVersionSelectionChange = (value: number) => {
        setSelectedVersionId(value);
        updateInputFieldValues(value);
    };

    const handleCreateVersion = () => {
        setIsCreating(true);
    };

    const handleUpdate = async () => {
        if (!selectedVersionId) {
            return;
        }

        try {
            const newPublicValue = promptForm.getFieldValue('public');

            const response = await fetch(`${baseUrl}/prompt/${selectedVersionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ public: newPublicValue })
            });

            if (!response.ok) {
                throw new Error('Fehler beim Aktualisieren des Prompts');
            }

            const updatedPrompt = await response.json();
            console.log('Erfolgreich aktualisiert:', updatedPrompt);
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Prompts:', error);
        }
    };

    const handleDelete = async (): Promise<void> => {
        closeModal();
        if (!selectedVersionId) {
            const errorMessage = 'Keine gültige Version ID ausgewählt';
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        try {
            const response = await fetch(`${baseUrl}/prompt/${selectedVersionId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || 'Fehler beim Löschen des Prompts';
                throw new Error(errorMessage);
            }

            messageApi.success(`Prompt mit ID ${selectedVersionId} erfolgreich gelöscht`);
        } catch (error: any) {
            console.error('Fehler beim Löschen des Prompts:', error.message || error);
            throw error;
        }
    };

    const showDeleteConfirm = () => {
        confirm({
            title: 'Bist du dir sicher, dass du den Prompt löschen möchtest?',
            icon: <ExclamationCircleOutlined />,
            okText: 'Ja',
            okType: 'danger',
            cancelText: 'Nein',
            async onOk() {
                try {
                    await handleDelete();
                    closeModal();
                } catch (error: any) {
                    messageApi.error(error?.message || 'Fehler beim Löschen des Prompts', 15);
                }
            },
            onCancel() {
                console.log('Löschen abgebrochen');
            }
        });
    };

    return (
        <>
            {contextHolder}
            <List
                pagination={{
                    position: 'bottom',
                    align: 'center',
                    pageSize: 10
                }}
                dataSource={displayedPromptListData}
                renderItem={(item: Prompt, index) => (
                    <List.Item
                        actions={[
                            <a onClick={() => showModal(item.versionId)} key="list-loadmore-edit">
                                Info
                            </a>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/9.x/shapes/svg?seed=${item.promptId}`} />}
                            title={
                                <a onClick={() => showModal(item.versionId)} key="list-loadmore-edit">
                                    {item.title}
                                </a>
                            }
                            description={
                                <span>
                                    {item.content.length > 440 ? `${item.content.slice(0, 440)}...` : item.content}
                                </span>
                            }
                        />
                    </List.Item>
                )}
            />
            <Modal
                title="Prompt Historie"
                open={isModalOpen}
                onOk={
                    isCreating
                        ? () => submitForm(promptForm, setRefreshTrigger, selectedPromptId, closeModal)
                        : handleCreateVersion
                }
                okText={isCreating ? 'Speichern' : 'Neu'}
                cancelText={isCreating ? 'Abbrechen' : 'Löschen'}
                cancelButtonProps={{ style: { display: 'none' } }}
                onCancel={() => {
                    closeModal();
                    setIsModalOpen(false);
                }}
                width={1000}
            >
                <SelectionWrapper>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {isCreating ? (
                            ''
                        ) : (
                            <Button type="default" danger onClick={showDeleteConfirm}>
                                Löschen
                            </Button>
                        )}

                        <Select
                            value={!isCreating ? selectedVersionId : undefined}
                            style={{ width: 120 }}
                            onChange={handleVersionSelectionChange}
                            options={versionSelectOptions}
                            disabled={isCreating}
                        />
                    </div>
                </SelectionWrapper>
                <Form
                    layout="vertical"
                    form={promptForm}
                    initialValues={{ title: '', content: '', variance: 0.5, model: '' }}
                    onFinish={(values) => {
                        submitForm(values, setRefreshTrigger, selectedPromptId);
                    }}
                >
                    <Form.Item label="Titel" name="title" rules={[{ required: true, message: 'Titel des Prompts' }]}>
                        <Input disabled={!isCreating} />
                    </Form.Item>
                    <Form.Item
                        label="Beschreibung"
                        name="description"
                        rules={[{ required: true, message: 'Beschreibung des Prompts' }]}
                    >
                        <Input disabled={!isCreating} />
                    </Form.Item>
                    <Form.Item label="Model" name="model" rules={[{ required: true, message: 'Model' }]}>
                        <Select placeholder="Model" optionFilterProp="label" options={models} disabled={!isCreating} />
                    </Form.Item>
                    <Form.Item label="Varianz" name="variance" rules={[{ required: true, message: 'Varianz' }]}>
                        <Slider min={0} max={1.0} step={0.1} disabled={!isCreating} />
                    </Form.Item>
                    <Form.Item
                        label="Prompt"
                        name="content"
                        rules={[{ required: true, message: 'Bitte geben Sie den Prompt ein!' }]}
                    >
                        <Input.TextArea rows={16} disabled={!isCreating} />
                    </Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'end', color: '#a9a9a9' }}>
                        Angelegt von: {createdBy?.email}
                    </div>
                    <Form.Item name="public" valuePropName="checked">
                        <Checkbox onChange={() => handleUpdate()}>Öffentlich</Checkbox>
                    </Form.Item>
                    <Form.Item name="createdById" initialValue={user?.userId} hidden={true}>
                        <Input type="hidden" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
