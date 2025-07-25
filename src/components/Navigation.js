// src/components/Navigation.js
import React from 'react';
import styled from 'styled-components';

const NavigationContainer = styled.nav`
    background-color: #2c3e50; /* MODIFIED: Dark purple background, matching bench container */
    padding: 10px 0;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
    position: relative; /* Needed for active indicator positioning */
    z-index: 1; /* Ensure it's above other elements if needed */
`;

const NavItem = styled.button`
    background: none;
    border: none;
    color: white;
    font-size: 1.1em;
    font-weight: bold;
    padding: 10px 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
        color: #f0f2f5; /* Light grey on hover */
        transform: translateY(-2px);
    }

    ${props => props.active && `
        color: #FFD700; /* Gold color for active link */
        &::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            height: 3px;
            background-color: #FFD700; /* Gold underline */
            border-radius: 2px;
        }
    `}

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

function Navigation({ setActivePage, activePage, isInitialTeamSaved }) {
    return (
        <NavigationContainer>
            <NavItem
                onClick={() => setActivePage('dashboard')}
                active={activePage === 'dashboard'}
            >
                Dashboard
            </NavItem>
            <NavItem
                onClick={() => setActivePage('myTeam')}
                active={activePage === 'myTeam'}
                disabled={!isInitialTeamSaved} /* Disable if initial team not saved */
            >
                My Team
            </NavItem>
            <NavItem
                onClick={() => setActivePage('transfers')}
                active={activePage === 'transfers'}
                disabled={!isInitialTeamSaved} /* Disable if initial team not saved */
            >
                Transfers
            </NavItem>
            <NavItem
                onClick={() => setActivePage('fixtures')}
                active={activePage === 'fixtures'}
            >
                Fixtures
            </NavItem>
            <NavItem
                onClick={() => setActivePage('standings')}
                active={activePage === 'standings'}
            >
                Standings
            </NavItem>
            {/* <NavItem
                onClick={() => setActivePage('playerDetails')}
                active={activePage === 'playerDetails'}
            >
                Player Details
            </NavItem> */}
        </NavigationContainer>
    );
}

export default Navigation;
