import styled from 'styled-components';

export const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    width: 90%;
    margin: 30px auto 60px auto;
    color: #888888;
    font-size: 0.9em;

    @media screen and (max-width: 601px) {
        margin: auto auto 10px auto;
    }
`;
