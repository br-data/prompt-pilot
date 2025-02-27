import styled from 'styled-components';

export const HeaderWrapper = styled.div`
    display: flex;
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    padding: 0 16px;
    height: 100px;
    justify-content: space-between;
    align-items: center;
    z-index: 1000;
    color: #888888;
    font-size: 1.2em;

    @media (max-width: 601px) {
        font-size: 1em;
        height: 100px;
    }
`;

export const Logo = styled.a`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    height: 70px;
    width: 70px;
`;