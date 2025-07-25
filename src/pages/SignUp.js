// src/pages/SignUp.js
import React, { useState } from 'react';
import styled from 'styled-components';

const AuthContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh; /* Ensure it takes full viewport height */
    background: linear-gradient(to bottom right, #4a00e0, #8e2de2); /* Blue to purple gradient from header */
    color: white;
    padding: 20px;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif; /* Apply Inter font */
`;

const AuthBox = styled.div`
    background-color: rgba(255, 255, 255, 0.95); /* Slightly transparent white for a modern feel */
    padding: 45px; /* Increased padding */
    border-radius: 18px; /* More rounded corners */
    box-shadow: 0 12px 40px rgba(0,0,0,0.3); /* Softer, more pronounced shadow */
    text-align: center;
    width: 100%;
    max-width: 600px; /* MODIFIED: Increased width */
    box-sizing: border-box;
    border: 1px solid rgba(255,255,255,0.2); /* Subtle white border for depth */
    backdrop-filter: blur(8px); /* Increased blur effect */
    -webkit-backdrop-filter: blur(8px);

    h2 {
        color: #2c3e50; /* Dark blue-grey for headings */
        margin-bottom: 35px; /* Increased margin */
        font-size: 2.4em; /* Larger font */
        font-weight: 800; /* Extra bold */
        letter-spacing: -0.5px; /* Tighter letter spacing */
    }

    input {
        width: calc(100% - 24px); /* Account for padding */
        padding: 14px; /* Increased padding */
        margin-bottom: 20px; /* Increased margin */
        border: 1px solid #e0e0e0; /* Light grey border */
        border-radius: 10px; /* More rounded input fields */
        font-size: 1.05em; /* Slightly larger font */
        background-color: #fcfcfc; /* Very light background */
        color: #333; /* Darker text for input */
        outline: none;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
        font-family: 'Inter', sans-serif; /* Apply Inter font */

        &:focus {
            border-color: #6a11cb; /* Purple highlight on focus */
            box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.2); /* Subtle purple glow */
        }

        &::placeholder {
            color: #95a5a6; /* Medium grey placeholder text */
        }
    }

    button {
        width: 100%;
        padding: 16px; /* Increased padding */
        background-color: #6a11cb; /* MODIFIED: Purple for main action */
        color: white;
        border: none;
        border-radius: 10px; /* More rounded buttons */
        font-size: 1.2em; /* Larger font */
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
        box-shadow: 0 6px 15px rgba(0,0,0,0.2); /* More prominent shadow */

        &:hover {
            background-color: #5a009a; /* MODIFIED: Darker purple on hover */
            transform: translateY(-3px); /* More pronounced lift */
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }
        &:active {
            transform: translateY(0);
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        &:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
            box-shadow: none;
            transform: none;
        }
    }

    .link-button { /* Style for button acting as a link */
        background: none;
        border: none;
        color: #884dff; /* MODIFIED: Lighter purple for links */
        font-size: 1.05em; /* Slightly larger font */
        font-weight: 600; /* Semi-bold */
        cursor: pointer;
        text-decoration: none;
        padding: 0;
        margin: 0;
        transition: text-decoration 0.3s ease, color 0.3s ease;

        &:hover {
            text-decoration: underline;
            color: #a381ff; /* MODIFIED: Brighter purple on hover */
        }
    }

    p {
        margin-top: 30px; /* Increased margin */
        color: #7f8c8d; /* Medium grey for secondary text */
        font-size: 0.98em;
    }

    .error-message {
        color: #dc3545; /* Standard danger red - kept for error messages */
        margin-top: 18px; /* Increased margin */
        font-weight: bold;
        font-size: 0.95em;
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
