import React, { useContext, useEffect, useState } from 'react';
import { Button, Form, Input, Select, Slider } from 'antd';
import {
    Headline,
    TestsetListWrapper,
    HeaderWrapper,
    AddButtonWrapper,
} from '../sourcesPage/styles.sourcesOverview';
import Modal from 'antd/es/modal/Modal';
import { getBaseUrl } from '../../utils/getBaseUrl';
import { useSearchParams } from 'react-router-dom';
import { PromptList } from '../../components/promptList/PromptList';
import { submitForm } from '../../components/promptList/promptFunctions';
import { UserContext } from '../../App';
import Checkbox from 'antd/es/checkbox/Checkbox';
import { useModels } from '../../hooks/useModels';


export const PromptsOverview: React.FC = () => {
    const { user } = useContext(UserContext);
    const [refreshTrigger, setRefreshTrigger] = useState(1);
    const [searchParams] = useSearchParams();
    const testsetIdParam = searchParams.get('id');
    const testsetId = parseInt(testsetIdParam || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [promptsForm] = Form.useForm();
    const baseUrl = getBaseUrl();
    const [publicVisible, setPublicVisible] = useState<boolean>(true);
    const { models } = useModels();


    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        promptsForm.resetFields();
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleSubmit = () => {
        submitForm(promptsForm, setRefreshTrigger)
            .then(() => {
                promptsForm.resetFields();
                setIsModalOpen(false);
            })
            .catch((error: Error) => {
                console.error('Fehler beim Submit:', error);
            });
    };

    return (
        <>
            <>
                <HeaderWrapper>
                    <div>
                        <Headline>Prompts verwalten</Headline>
                    </div>
                </HeaderWrapper>
                <AddButtonWrapper>
                    <Button type="default" onClick={showModal}>
                        Hinzufügen
                    </Button>
                </AddButtonWrapper>
                <TestsetListWrapper>
                    <PromptList refreshTrigger={refreshTrigger} setRefreshTrigger={setRefreshTrigger} />
                </TestsetListWrapper>
                <Modal
                    title="Hinzufügen"
                    open={isModalOpen}
                    onOk={() => handleSubmit()}
                    onCancel={handleClose}
                    okText={'Hinzufügen'}
                    cancelText={'Abbrechen'}
                    width={1000}
                >
                    <Form
                        layout="vertical"
                        form={promptsForm}
                        initialValues={{
                            variance: 0.5,
                            public: true
                        }}
                    >
                        <Form.Item
                            label="Titel"
                            name="title"
                            rules={[{ required: true, message: 'Titel des Prompts' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Beschreibung"
                            name="description"
                            rules={[{ required: true, message: 'Beschreibung des Prompts' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item label="Model" name="model" rules={[{ required: true, message: 'Model' }]}>
                            <Select placeholder="Model" optionFilterProp="label" options={models} />
                        </Form.Item>
                        <Form.Item label="Varianz" name="variance" rules={[{ required: true, message: 'Varianz' }]}>
                            <Slider min={0} max={1.0} step={0.1} />
                        </Form.Item>
                        <Form.Item
                            label="Prompt"
                            name="content"
                            rules={[{ required: true, message: 'Prompt darf nicht leer sein.' }]}
                        >
                            <Input.TextArea rows={16} />
                        </Form.Item>
                        <Form.Item name="public" valuePropName="checked">
                            <Checkbox>Öffentlich</Checkbox>
                        </Form.Item>
                        <Form.Item name="createdById" initialValue={user?.userId} hidden={true}>
                            <Input type="hidden" />
                        </Form.Item>
                    </Form>
                </Modal>
            </>
        </>
    );
};
