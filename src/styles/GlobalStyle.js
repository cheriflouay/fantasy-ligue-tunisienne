// src/styles/GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    body {
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f0f2f5; /* Light grey background */
        color: #333;
    }

    h1, h2, h3, h4, h5, h6 {
        color: #222;
    }

    p {
        line-height: 1.6;
    }

    button {
        cursor: pointer;
    }
`;

export default GlobalStyle;