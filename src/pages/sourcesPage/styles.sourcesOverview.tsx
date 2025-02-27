import styled from 'styled-components';

export const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
`;

export const Headline = styled.div`
    font-size: 2rem;
    font-weight: 600;
`;

export const Subline = styled.div`
    font-size: 1.1rem;
    font-weight: 400;
`;


export const Description = styled.div`
    font-size: 1.5rem;
    max-width: 500px;
    font-weight: 400;
    text-align: left;
    line-height: 2.1rem;
    @media (max-width: 490px) {
        font-size: 1.2rem;
    }
`;

export const TestsetListWrapper = styled.div`
    margin-top: 1rem;
`;

export const AddButtonWrapper = styled.div`
    display: flex;
    justify-content: end;
    margin-top: 1.5rem;
`;

export const ButtonWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
`;
