import { createGlobalStyle } from 'styled-components';
import { mobile, big } from './variables';

export const GlobalStyle = createGlobalStyle`
  html {
    margin: 0;
  }

  body {
    margin: 0;
    padding: 0;
    height: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    background-color: #f5f5f5;
    color: #333;


    .ant-popover {
      max-width: 400px;
    }

    @media ${big} {
      font-size: 16px;
    }

    @media ${mobile} {
      font-size: 14px;
    }
  }
`;
