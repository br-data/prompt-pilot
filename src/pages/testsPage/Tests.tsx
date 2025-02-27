import React, { useContext, useState } from 'react';
import {
    Description,
    HeaderWrapper,
    Headline,
    LogoWrapper,
    AnnotationListWrapper,
    AddButtonWrapper
} from './styles.tests';
//@ts-ignore
import { ReactComponent as Logo } from '../../assets/paper-plane-regular.svg';
import { AnnotationList } from '../../components/annotationList/AnnotationList';
import { getBaseUrl } from '../../utils/getBaseUrl';
import { Alert, Button, Checkbox, Form, Input, Modal, Radio, RadioChangeEvent, Spin, Typography } from 'antd';
import { PromptSelection } from '../../components/testsPage/PromptSelection';
import { SourcesSelection } from '../../components/testsPage/SourcesSelection';
import { generateOutput } from '../../utils/generateOutput';
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { GenerationFeedbackProps } from './types.tests';
import { UserContext } from '../../App';

export const Tests: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGeneratingModalOpen, setIsGeneratingModalOpen] = useState(false);
    const [generatingModalContent, setGeneratingModalContent] = useState<GenerationFeedbackProps | undefined>(
        undefined
    );
    const [isGeneratingFinished, setIsGeneratingFinished] = useState(false);
    const [selectedPrompts, setSelectedPrompts] = useState<number[]>([]);
    const [selectedTestset, setSelectedTestset] = useState<number | undefined>();
    const [testsetName, setTestsetName] = useState<string>('');
    const [annotationListForm] = Form.useForm();
    const [refreshTrigger, setRefreshTrigger] = useState(1);
    const [warningMessages, setWarningMessages] = useState<string[]>([]);
    const { user } = useContext(UserContext);
    const baseUrl = getBaseUrl();

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setIsGeneratingModalOpen(false);
        setIsGeneratingFinished(false);
        setWarningMessages([]);
    };

    const submitForm = () => {
        annotationListForm
            .validateFields()
            .then((values) => {
                const payload = {
                    title: values.title,
                    description: values.description,
                    testset: values.testset,
                    testsetName: values.testsetName,
                    prompts: values.prompts,
                    public: values.public,
                    runs: values.runs,
                    createdById: user?.userId
                };

                let annotationListId: number;

                fetch(baseUrl + '/annotationlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Fehler beim Erstellen der AnnotationList');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        annotationListId = data.id;
                        annotationListForm.resetFields();
                        setIsModalOpen(false);
                        setRefreshTrigger((prev) => prev + 1);
                    })
                    .finally(() => {
                        setIsGeneratingModalOpen(true);
                        generateOutput({
                            setGeneratingModalContent,
                            setIsGeneratingFinished,
                            input: values.testset,
                            prompts: values.prompts,
                            annotationListId: annotationListId,
                            runs: values.runs,
                            setWarningMessages
                        });
                    })
                    .catch((error) => {
                        console.error('Fehler:', error);
                    });
            })
            .catch((info) => {
                console.log('Validation failed:', info);
            });
    };

    return (
        <>
            <HeaderWrapper>
                <LogoWrapper>
                    <Headline>PromptPilot</Headline>
                    <Logo
                        className="animatedSvg"
                        width="50"
                        height="50"
                        style={{ position: 'relative', top: '3px', left: '-4px' }}
                    />
                </LogoWrapper>
                <Description>Ein Tool zur Bewertung und zum Vergleich von LLM-generierten Texten.</Description>
            </HeaderWrapper>
            <AddButtonWrapper>
                <Button type="default" onClick={showModal}>
                    Hinzufügen
                </Button>
            </AddButtonWrapper>
            <AnnotationList refreshTrigger={refreshTrigger} />
            <Modal
                title="Hinzufügen"
                open={isModalOpen}
                onOk={submitForm}
                onCancel={handleCancel}
                okText={'Hinzufügen'}
                cancelText={'Abbrechen'}
                width={1000}
            >
                <Form
                    layout="vertical"
                    form={annotationListForm}
                    initialValues={{
                        title: '',
                        description: '',
                        prompts: selectedPrompts,
                        testset: selectedTestset
                    }}
                >
                    <Form.Item label="Titel" name="title" rules={[{ required: true, message: 'Titel der Quelle' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Beschreibung"
                        name="description"
                        rules={[{ required: true, message: 'Bitte geben Sie den Inhalt ein!' }]}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                        label="Prompts"
                        name="prompts"
                        rules={[{ required: true, message: 'Auswahl der Prompts' }]}
                    >
                        <PromptSelection />
                    </Form.Item>
                    <Form.Item
                        label="Quellen-Sammlung"
                        name="testset"
                        rules={[{ required: true, message: 'Wähle Quellen aus.' }]}
                    >
                        <SourcesSelection
                            setTestsetName={(name: string) => {
                                setTestsetName(name);
                                annotationListForm.setFieldsValue({ testsetName: name });
                            }}
                        />
                    </Form.Item>
                    <Form.Item name="public" valuePropName="checked">
                        <Checkbox>Öffentlich</Checkbox>
                    </Form.Item>
                    <Form.Item
                        label="Durchläufe"
                        name="runs"
                        tooltip="Anzahl der Durchläufe pro Prompt"
                        initialValue={1}
                    >
                        <Radio.Group>
                            <Radio.Button value={1}>1x</Radio.Button>
                            <Radio.Button value={2}>2x</Radio.Button>
                            <Radio.Button value={3}>3x</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="Testsetname" name="testsetName" style={{ display: 'none' }}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                open={isGeneratingModalOpen}
                onOk={handleCancel}
                cancelButtonProps={{ style: { display: 'none' } }}
                okText={'Ok'}
            >
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {isGeneratingFinished ? (
                        <CheckOutlined
                            style={{
                                fontSize: 40,
                                margin: '20px',
                                borderRadius: '100px',
                                padding: '20px',
                                color: 'white',
                                background: '#52c41a'
                            }}
                        />
                    ) : (
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 40, margin: '40px' }} spin />} />
                    )}
                </div>

                <div>
                    {`${generatingModalContent?.currentGenerations}/${generatingModalContent?.totalGenerations} Generierungen`}
                </div>
                <br />
                <div>{`✅ ${generatingModalContent?.successCount} Generierungen erfolgreich.`}</div>
                <div>{`❌ ${generatingModalContent?.failureCount} Generierungen nicht erfolgreich.`}</div>
                <div style={{ marginTop: '15px ' }}>
                    {Array.isArray(warningMessages) &&
                        warningMessages.length > 0 &&
                        warningMessages.map((msg, index) => (
                            <div key={index} style={{ marginTop: '5px' }}>
                                <Alert type="error" message={msg} />
                            </div>
                        ))}
                </div>
            </Modal>
        </>
    );
};
