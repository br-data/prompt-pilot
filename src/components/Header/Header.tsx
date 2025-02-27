import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import LabLogo from '../../assets/lab-logo.svg';
import { Link, useLocation } from 'react-router-dom';

const { Header } = Layout;

export const AppHeader: React.FC = () => {
    const [current, setCurrent] = useState<string>('/');

    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        switch (true) {
            case path === '/':
                setCurrent('1');
                break;
            case path === '/sources-overview':
                setCurrent('2');
                break;
            case path === '/prompts-overview':
                setCurrent('3');
                break;
            case path === '/sources-edit':
                setCurrent('2');
                break;
            case path === '/annotation':
                setCurrent('1');
                break;
            case path === '/test-details':
                setCurrent('1');
                break;
            default:
                setCurrent('');
                break;
        }
    }, [location.pathname, location.search]);

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: <Link to="/">Tests</Link>
        },
        {
            key: '2',
            label: <Link to="/sources-overview">Quellen-Sammlung</Link>
        },
        {
            key: '3',
            label: <Link to="/prompts-overview">Prompts</Link>
        }
    ];

    const onClick: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
    };

    return (
        <Header style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5' }}>
            <div>
                <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={LabLogo}
                        alt="Ai + Automation Lab"
                        style={{
                            height: 50,
                            marginRight: 16
                        }}
                    />
                </a>
            </div>
            <Menu
                mode="horizontal"
                selectedKeys={[current]}
                items={items}
                style={{ flex: 1, minWidth: 0, background: '#f5f5f5' }}
            />
        </Header>
    );
};
