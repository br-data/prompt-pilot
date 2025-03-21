import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GlobalStyle } from './styles/globalStyle';
import { AppHeader } from './components/Header/Header';
import { AppContent } from './Content';
import styled from 'styled-components';
import { getBaseUrl } from './utils/getBaseUrl';
import { AppFooter } from './components/Footer/Footer';
import { Layout } from 'antd';

interface UserContextType {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    isAdmin: boolean;
}

interface UserContextValue {
    user: UserContextType | null;
    isLoading: boolean;
}

export const UserContext = createContext<UserContextValue>({
    user: null,
    isLoading: true,
});

export const App: React.FC = () => {
    const baseUrl = getBaseUrl();
    const [userData, setUserData] = useState<UserContextType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { Content, Footer } = Layout;

    function extractNameFromEmail(email: string): { firstName: string; lastName: string } {
        const [localPart] = email.split('@');
        const [firstName, lastName] = localPart.split('.');
        return {
            firstName: capitalize(firstName),
            lastName: capitalize(lastName),
        };
    }

    function capitalize(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    useEffect(() => {
        async function fetchAuthUser() {
            const response = await fetch(`${baseUrl}/user/fromxauth`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }

        async function checkUserInDB(email: string) {
            const response = await fetch(`${baseUrl}/user/${email}`);
            if (response.status === 404) {
                return null;
            }
            if (!response.ok) {
                throw new Error(`Fehler beim Überprüfen des Users in der DB: ${response.status}`);
            }
            return response.json();
        }

        async function createUserInDB(email: string) {
            const response = await fetch(`${baseUrl}/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error(`Fehler beim Erstellen des Users: ${response.status}`);
            }
            return response.json();
        }

        async function initializeUser() {
            try {
                const authData = await fetchAuthUser();
                const email = authData.email;
                const { firstName, lastName } = extractNameFromEmail(email);

                const userDataDB = await checkUserInDB(email);
                if (!userDataDB) {
                    const newUserData = await createUserInDB(email);
                    setUserData({
                        userId: newUserData.id,
                        firstName,
                        lastName,
                        email,
                        isAdmin: false,
                    });
                } else {
                    setUserData({
                        userId: userDataDB.user.id,
                        firstName,
                        lastName,
                        email,
                        isAdmin: userDataDB.user.admin,
                    });
                }
            } catch (error) {
                console.error('Fehler bei der Initialisierung des Users:', error);
            } finally {
                setIsLoading(false);
            }
        }

        initializeUser();
    }, [baseUrl]);

    return (
        <UserContext.Provider value={{ user: userData, isLoading }}>
            <BrowserRouter>
                <Layout
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <AppHeader />
                    <GlobalStyle />
                    <Content style={{ padding: '0 48px', flex: 1 }}>
                        {isLoading ? <div>Loading...</div> : <AppContent />}
                    </Content>
                    <Footer>
                        <AppFooter />
                    </Footer>
                </Layout>
            </BrowserRouter>
        </UserContext.Provider>
    );
};