// src/pages/Login.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faGoogle } from '@fortawesome/free-brands-svg-icons'; // Import Google icon

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
        display: flex; /* For icon and text alignment */
        align-items: center;
        justify-content: center;
        gap: 10px; /* Space between icon and text */

        &:hover {
            background-color: #b30000;
        }
        &:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }

        &.google-button {
            background-color: #DB4437; /* Google Red */
            margin-top: 10px; /* Space from email login button */
            &:hover {
                background-color: #c23321;
            }
        }
    }

    .link-button {
        background: none;
        border: none;
        color: var(--primary-green);
        font-size: 1em;
        font-weight: bold;
        cursor: pointer;
        text-decoration: none;
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
        a {
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

function Login({ onLogin, setActivePage, onGoogleLogin }) { // Added onGoogleLogin prop
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

    const handleGoogleSubmit = async () => {
        setError('');
        setLoading(true);
        const result = await onGoogleLogin(); // Call the new Google login handler
        if (!result.success) {
            setError(result.message || 'Google login failed.');
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
                        {loading ? 'Logging In...' : 'Login with Email'}
                    </button>
                </form>

                <button className="google-button" onClick={handleGoogleSubmit} disabled={loading}>
                    <FontAwesomeIcon icon={faGoogle} />
                    {loading ? 'Signing In...' : 'Sign in with Google'}
                </button>

                {error && <p className="error-message">{error}</p>}
                <p>
                    Don't have an account?{' '}
                    <button type="button" className="link-button" onClick={() => setActivePage('signup')}>
                        Sign Up
                    </button>
                </p>
            </AuthBox>
        </AuthContainer>
    );
}

export default Login;
