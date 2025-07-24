// src/pages/SignUp.js
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
        background-color: var(--primary-green);
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 1.1em;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
            background-color: #004d00;
        }
        &:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
    }

    .link-button { /* Style for button acting as a link */
        background: none;
        border: none;
        color: var(--secondary-red);
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
        a { /* Keep existing a style for external links if any */
            color: var(--secondary-red);
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

function SignUp({ onSignUp, setActivePage }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [teamName, setTeamName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const result = await onSignUp(email, password, teamName);
        if (!result.success) {
            setError(result.message || 'Sign up failed.');
        } else {
            // Sign up successful, Firebase onAuthStateChanged will handle navigation
        }
        setLoading(false);
    };

    return (
        <AuthContainer>
            <AuthBox>
                <h2>Sign Up for FLT</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Team Name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                    />
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
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <p>
                    Already have an account?{' '}
                    <button type="button" className="link-button" onClick={() => setActivePage('login')}>
                        Login
                    </button>
                </p>
            </AuthBox>
        </AuthContainer>
    );
}

export default SignUp;
