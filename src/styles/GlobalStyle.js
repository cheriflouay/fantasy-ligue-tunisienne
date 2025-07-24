// src/styles/GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');

    :root {
        /* Define a color palette */
        --primary-green: #006400; /* Darker, richer green */
        --secondary-red: #CC0000; /* Vibrant red */
        --light-grey-bg: #f0f2f5; /* Clean light grey */
        --dark-text: #2c3e50; /* Dark blue-grey for text */
        --medium-text: #7f8c8d; /* Medium grey for secondary text */
        --card-bg: #ffffff; /* White for cards */
        --border-color: #e0e0e0; /* Light border */
        --success-green: #28a745; /* Standard success green */
        --danger-red: #dc3545; /* Standard danger red */
    }

    body {
        margin: 0;
        font-family: 'Inter', sans-serif;
        background-color: var(--primary-green); /* Solid green background matching header */
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        color: var(--dark-text);
    }

    #root {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    main {
        flex-grow: 1;
        padding: 20px;
        box-sizing: border-box;
    }

    h1, h2, h3, h4, h5, h6 {
        color: var(--dark-text);
    }

    p {
        line-height: 1.6;
    }

    button {
        cursor: pointer;
    }

    .card-style {
        background-color: var(--card-bg);
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    /* Styles for auth forms */
    input[type="email"],
    input[type="password"],
    input[type="text"] {
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 100%;
        box-sizing: border-box;
    }
`;

export default GlobalStyle;
