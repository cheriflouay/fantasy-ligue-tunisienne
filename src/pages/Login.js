// src/pages/Login.js
import React, { useState } from 'react';
import styled from 'styled-components';

const AuthContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    background-color: var(--primary-green);
    color: white;
`;

const AuthBox = styled.div`
    background-color: var(--card-bg);
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    text-align: center;
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;

    h2 {
        color: var(--dark-text);
        margin-bottom: 25px;
        font-size: 2em;
    }

    input {
        width: calc(100% - 20px);
        padding: 12px;
        margin-bottom: 15px;
        border: 1px solid var(--border-color);
        border-radius: 5px;
        font-size: 1em;
        background-color: #f8f8f8;
        color: var(--dark-text);
    }

    button {
        width: 100%;
        padding: 12px;
        background-color: var(--secondary-red);
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 1.1em;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
            background-color: #b30000;
        }
        &:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
    }

    .link-button { /* New style for button acting as a link */
        background: none;
        border: none;
        color: var(--primary-green);
        font-size: 1em;
        font-weight: bold;
        cursor: pointer;
        text-decoration: none; /* Remove default underline */
        padding: 0;
        margin: 0;
        transition: text-decoration 0.3s ease;

        &:hover {
            text-decoration: underline;
        }
    }

    p {
        margin-top: 20px;
        color: var(--medium-text);
        a { /* Keep existing a style for external links if any, but use button for internal navigation */
            color: var(--primary-green);
            text-decoration: none;
            font-weight: bold;
            &:hover {
                text-decoration: underline;
            }
        }
    }

    .error-message {
        color: var(--danger-red);
        margin-top: 10px;
        font-weight: bold;
    }
`;

function Login({ onLogin, setActivePage }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await onLogin(email, password);
        if (!result.success) {
            setError(result.message || 'Login failed. Please check your credentials.');
        }
        setLoading(false);
    };

    return (
        <AuthContainer>
            <AuthBox>
                <h2>Login to FLT</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging In...' : 'Login'}
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <p>
                    Don't have an account?{' '}
                    <button type="button" className="link-button" onClick={() => setActivePage('signup')}> {/* Changed to button */}
                        Sign Up
                    </button>
                </p>
            </AuthBox>
        </AuthContainer>
    );
}

export default Login;
