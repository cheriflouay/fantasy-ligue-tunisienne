// src/components/Header.js
import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
    background-color: var(--primary-green); /* Use defined green */
    color: white;
    padding: 15px 20px;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
`;

const LogoGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
`;

const AppLogo = styled.h1`
    margin: 0;
    font-size: 1.8em;
    font-family: 'Arial Black', sans-serif;
    letter-spacing: 1px;
    color: white;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const OrgLogo = styled.img`
    height: 40px;
    object-fit: contain;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;

const UserInfo = styled.div`
    font-size: 1.1em;
    span {
        font-weight: bold;
    }
`;

function Header({ userRank, userOverallPoints }) {
    return (
        <HeaderContainer>
            <LogoGroup>
                <OrgLogo src={`${process.env.PUBLIC_URL}/images/flt_logo.png`} alt="Fantasy Ligue Tunisienne Logo" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x40/cccccc/000000?text=FLT" }} />
                <AppLogo>Fantasy Ligue Tunisienne 🇹🇳</AppLogo>
            </LogoGroup>

            <OrgLogo src={`${process.env.PUBLIC_URL}/images/ftf_logo.png`} alt="Tunisian Football Federation Logo" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x40/cccccc/000000?text=FTF" }} />

            {userRank && userOverallPoints && (
                <UserInfo>
                    Rank: <span>#{userRank}</span> | Points: <span>{userOverallPoints}</span>
                </UserInfo>
            )}
        </HeaderContainer>
    );
}

export default Header;
