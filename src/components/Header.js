// src/components/Header.js
import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
    background-color: #008000; /* Tunisian Flag Green */
    color: white;
    padding: 15px 20px;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Logo = styled.h1`
    margin: 0;
    font-size: 1.8em;
    font-family: 'Arial Black', sans-serif;
    letter-spacing: 1px;
`;

// UserInfo styled component definition
const UserInfo = styled.div`
    font-size: 1.1em;
    span {
        font-weight: bold;
    }
`;

function Header({ userRank, userOverallPoints }) {
    return (
        <HeaderContainer>
            <Logo>Fantasy Ligue Tunisienne 🇹🇳</Logo>
            {/* This block is now UNCOMMENTED to use UserInfo */}
            {userRank && userOverallPoints && (
                <UserInfo>
                    Rank: <span>#{userRank}</span> | Points: <span>{userOverallPoints}</span>
                </UserInfo>
            )}
        </HeaderContainer>
    );
}

export default Header;
