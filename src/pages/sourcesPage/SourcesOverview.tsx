import React, { useContext, useEffect, useState } from 'react';
import { SourcesList } from '../../components/sourcesList/SourcesList';
import { Button, Checkbox, Form, Input } from 'antd';
import { Headline, TestsetListWrapper, HeaderWrapper, AddButtonWrapper } from './styles.sourcesOverview';
import Modal from 'antd/es/modal/Modal';
import { getBaseUrl } from '../../utils/getBaseUrl';
import { UserContext } from '../../App';

export const SourcesOverview: React.FC = () => {
    const { user } = useContext(UserContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(1);
    const [form] = Form.useForm();
    const baseUrl = getBaseUrl();

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const submitForm = () => {
        form.validateFields()
            .then((values) => {
                fetch(baseUrl + '/testset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                });
                setIsModalOpen(false);
                setRefreshTrigger((prev) => prev + 1);
                form.resetFields();
            })
            .catch((info) => {
                console.log('Validation failed:', info);
            });
    };

    return (
        <>
            <>
                <HeaderWrapper>
                    <div>
                        <Headline>Quellen-Sammlung</Headline>
                    </div>
                </HeaderWrapper>
                <AddButtonWrapper>
                    <Button onClick={showModal}>Hinzufügen</Button>
                </AddButtonWrapper>
                <TestsetListWrapper>
                    <SourcesList refreshTrigger={refreshTrigger} />
                </TestsetListWrapper>
                <Modal
                    title="Hinzufügen"
                    open={isModalOpen}
                    onOk={submitForm}
                    onCancel={handleCancel}
                    okText={'Hinzufügen'}
                    cancelText={'Abbrechen'}
                    width={800}
                >
                    <Form
                        layout="vertical"
                        form={form}
                        initialValues={{
                            public: true
                        }}
                    >
                        <Form.Item label="Titel" name="title">
                            <Input />
                        </Form.Item>
                        <Form.Item label="Beschreibung" name="description">
                            <Input.TextArea rows={2} />
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
