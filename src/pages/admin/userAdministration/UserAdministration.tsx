import React, { useEffect, useState } from 'react';
import { List, Avatar, Modal, Form, Input, message, Checkbox } from 'antd';
import { getBaseUrl } from '../../../utils/getBaseUrl';
import styled from 'styled-components';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

interface User {
    id: number;
    admin: boolean;
    email: string;
}

export const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
`;

export const Headline = styled.div`
    font-size: 2rem;
    font-weight: 600;
`;

export const UserAdministration: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    const baseUrl = getBaseUrl();

    useEffect(() => {
        fetchUsers();
    }, []);

    const showModal = (id: number) => {
        setSelectedUser(id);
        setIsModalOpen(true);
        form.setFieldsValue({
            email: users.find((user) => user.id === id)?.email,
            admin: users.find((user) => user.id === id)?.admin
        });
    };

    const closeModal = () => {
        form.resetFields();
        setIsModalOpen(false);
    };

    async function fetchUsers() {
        try {
            const response = await fetch(`${baseUrl}/users`);
            if (!response.ok) {
                throw new Error(`HTTP-Fehler: ${response.status}`);
            }
            const usersData: User[] = await response.json();
            setUsers(usersData);
        } catch (error: any) {
            console.error('Fehler beim Laden der Userliste:', error);
        } finally {
            setLoading(false);
        }
    }

    const updateAdminStatus = () => {
        fetch(`${baseUrl}/user/${selectedUser}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin: isAdmin })
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Fehler beim Aktualisieren des Admin-Status');
                }
                return response.json();
            })
            .then((data) => {
                fetchUsers();
                closeModal();
            })
            .catch((error) => {
                console.error('Fehler:', error);
            });
    };

    const toggleAdmin = (e: CheckboxChangeEvent) => {
        setIsAdmin(e.target.checked);
    };

    return (
        <>
            <HeaderWrapper>
                <div>
                    <Headline>User verwalten</Headline>
                </div>
            </HeaderWrapper>
            <List
                loading={loading}
                pagination={{
                    position: 'bottom',
                    align: 'center',
                    pageSize: 10
                }}
                dataSource={users}
                renderItem={(item: any, index) => (
                    <List.Item
                        actions={[
                            <a onClick={() => showModal(item.id)} key="list-loadmore-edit">
                                Bearbeiten
                            </a>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${item.id}`} />}
                            title={<a onClick={() => showModal(item.id)}>{item.email}</a>}
                        />
                    </List.Item>
                )}
            />
            <Modal
                title="Bearbeiten"
                open={isModalOpen}
                onOk={updateAdminStatus}
                onCancel={() => {
                    closeModal();
                    setIsModalOpen(false);
                }}
                okText={'Speichern'}
                cancelButtonProps={{ style: { display: 'none' } }}
                width={1000}
            >
                <Form layout="vertical" form={form}>
                    <Form.Item label="E-Mail" name="email">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="Admin" name="admin" valuePropName="checked">
                        <Checkbox onChange={toggleAdmin}>Admin</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
