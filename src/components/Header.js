// src/components/Header.js
import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
    /* MODIFIED: Background to a gradient matching the image */
    background: linear-gradient(to right, #4a00e0, #8e2de2); /* Blue to purple gradient */
    color: white;
    padding: 10px 20px; /* Reduced padding for a more compact header */
    text-align: center;
    /* MODIFIED: Softer shadow and rounded corners */
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    border-radius: 10px; /* Rounded corners for the header container */
    margin: 10px; /* Add some margin around the header */
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden; /* Hide overflow for the gradient edge effect */

    /* Optional: Add a subtle wavy effect if desired, similar to the image edge */
    &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 50px; /* Width of the wavy effect */
        background: linear-gradient(to right, rgba(142, 45, 226, 0.5), rgba(142, 45, 226, 0.8)),
                    url('/images/wavy-texture.png'); /* Placeholder for a wavy texture image */
        background-size: cover;
        transform: skewX(-15deg); /* Create a slanted edge */
        transform-origin: 100% 0;
        z-index: 1;
        /* Fallback for texture: simple color blend */
        background: linear-gradient(to left, #8e2de2, transparent);
    }
`;

const LogoGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    z-index: 2; /* Ensure content is above the pseudo-element */
`;

const AppLogo = styled.h1`
    margin: 0;
    /* MODIFIED: Font styling to match "Fantasy" text in the image */
    font-size: 2.5em; /* Larger font size */
    font-family: 'Inter', sans-serif; /* Use Inter font */
    font-weight: 800; /* Extra bold */
    letter-spacing: -1px; /* Tighter letter spacing */
    color: white; /* White text */
    text-shadow: 3px 3px 6px rgba(0,0,0,0.4); /* Stronger shadow */
`;

const OrgLogo = styled.img`
    height: 50px; /* Slightly larger logo */
    object-fit: contain;
    border-radius: 8px; /* More rounded corners */
    box-shadow: 0 2px 8px rgba(0,0,0,0.3); /* Stronger shadow */
    z-index: 2; /* Ensure content is above the pseudo-element */
`;

// REMOVED: UserInfo and LogoutButton styled components as they are not in the reference image
/*
const UserInfo = styled.div`
    font-size: 1.1em;
    span {
        font-weight: bold;
    }
`;

const LogoutButton = styled.button`
    background-color: var(--secondary-red);
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
    font-weight: bold;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #b30000;
    }
`;
*/

function Header({ userRank, userOverallPoints, onLogout }) { // Kept props for potential future use, but not rendered
    return (
        <HeaderContainer>
            <LogoGroup>
                {/* Using a placeholder for the Fantasy logo as it's not provided */}
                <OrgLogo src={`${process.env.PUBLIC_URL}/images/flt_logo.png`} alt="Fantasy Ligue Tunisienne Logo" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/50x50/000000/FFFFFF?text=F" }} />
                <AppLogo>Fantasy Ligue Tunisienne 🇹🇳</AppLogo>
            </LogoGroup>

            {/* Removed the second OrgLogo (FTF logo) as it's not in the reference image */}
            {/* <OrgLogo src={`${process.env.PUBLIC_URL}/images/ftf_logo.png`} alt="Tunisian Football Federation Logo" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x40/cccccc/000000?text=FTF" }} /> */}

            {/* Removed UserInfo and LogoutButton as they are not in the reference image */}
            {/* {userRank && userOverallPoints && (
                <UserInfo>
                    Rank: <span>#{userRank}</span> | Points: <span>{userOverallPoints}</span>
                </UserInfo>
            )}
            {onLogout && <LogoutButton onClick={onLogout}>Logout</LogoutButton>} */}
        </HeaderContainer>
    );
}

export default Header;
