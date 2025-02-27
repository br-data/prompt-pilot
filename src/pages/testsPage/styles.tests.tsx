import styled from 'styled-components';

export const HeaderWrapper = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 480px;
    gap: 0.3rem;
`;

export const LogoWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    text-align: center;
    color: '#FF007F';

    .animatedSvg {
        fill: lightseagreen;
        background: '#FF007F';
    }
`;

export const Headline = styled.div`
    font-size: 3.8rem;
    font-weight: 600;
    @media (max-width: 490px) {
        text-align: start;
        font-size: 2.5rem;
    }
    display: inline;
    margin: 0;
`;

export const SubHeadline = styled.h2`
    font-size: 2rem;
    font-weight: 600;
`;

export const SubHeadlineH3 = styled.h3`
    font-size: 1.3rem;
    font-weight: 600;
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

export const AnnotationListWrapper = styled.div`
    margin-top: 4rem;
`;

export const AddButtonWrapper = styled.div`
    display: flex;
    justify-content: end;
    margin-top: 1.5rem;
`;