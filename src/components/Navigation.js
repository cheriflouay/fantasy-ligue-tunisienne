// src/components/Navigation.js
import React from 'react';
import styled from 'styled-components';

const NavigationContainer = styled.nav`
    background-color: #2c3e50; /* MODIFIED: Dark purple background, matching bench container */
    padding: 10px 0;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    display: flex;
    justify-content: center; /* Changed to flex-start to allow space for logout on right */
    gap: 30px;
    flex-wrap: wrap;
    position: relative; /* Needed for active indicator positioning */
    z-index: 1; /* Ensure it's above other elements if needed */
    padding-right: 20px; /* Add some padding on the right for the logout button */
    padding-left: 20px; /* Add some padding on the left */
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

    ${props => props.$active && ` /* Changed to $active */
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

const LogoutButton = styled(NavItem)`
    margin-left: auto; /* Pushes the button to the far right */
    background-color: #e74c3c; /* Red color for logout */
    color: white;
    padding: 8px 15px;
    border-radius: 5px;
    font-size: 0.9em;
    &:hover {
        background-color: #c0392b;
        transform: translateY(-2px);
    }
`;

function Navigation({ setActivePage, activePage, isInitialTeamSaved, onLogout }) {
    return (
        <NavigationContainer>
            <NavItem
                onClick={() => setActivePage('dashboard')}
                $active={activePage === 'dashboard'} /* Changed to $active */
            >
                Dashboard
            </NavItem>
            <NavItem
                onClick={() => setActivePage('myTeam')}
                $active={activePage === 'myTeam'} /* Changed to $active */
                disabled={!isInitialTeamSaved} /* Disable if initial team not saved */
            >
                My Team
            </NavItem>
            <NavItem
                onClick={() => setActivePage('transfers')}
                $active={activePage === 'transfers'} /* Changed to $active */
                disabled={!isInitialTeamSaved} /* Disable if initial team not saved */
            >
                Transfers
            </NavItem>
            <NavItem
                onClick={() => setActivePage('fixtures')}
                $active={activePage === 'fixtures'} /* Changed to $active */
            >
                Fixtures
            </NavItem>
            <NavItem
                onClick={() => setActivePage('standings')}
                $active={activePage === 'standings'} /* Changed to $active */
            >
                Standings
            </NavItem>
            {/* <NavItem
                onClick={() => setActivePage('playerDetails')}
                $active={activePage === 'playerDetails'}
            >
                Player Details
            </NavItem> */}
            {onLogout && <LogoutButton onClick={onLogout}>Logout</LogoutButton>}
        </NavigationContainer>
    );
}

export default Navigation;
