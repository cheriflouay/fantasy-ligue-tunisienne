// src/components/Navigation.js
import React from 'react';
import styled from 'styled-components';

const NavContainer = styled.nav`
    background-color: #CC0000; /* Tunisian Flag Red */
    padding: 10px 0;
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        justify-content: space-around;
    }
    li {
        margin: 0 10px;
    }
    button {
        background: none;
        border: none;
        color: white;
        font-size: 1.1em;
        padding: 8px 15px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        border-radius: 5px;

        &:hover {
            background-color: rgba(255,255,255,0.2);
        }
        &.active {
            background-color: rgba(255,255,255,0.3);
            font-weight: bold;
        }
    }
`;

function Navigation({ setActivePage, activePage, isInitialTeamSaved }) {
    return (
        <NavContainer>
            <ul>
                <li><button className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>Dashboard</button></li>
                {/* Conditional rendering for team management */}
                {!isInitialTeamSaved ? (
                    // Initial pick phase
                    <li><button className={activePage === 'pickTeamInitial' ? 'active' : ''} onClick={() => setActivePage('pickTeamInitial')}>Pick Team</button></li>
                ) : (
                    // After initial pick, show My Team and Transfers
                    <>
                        <li><button className={activePage === 'myTeam' ? 'active' : ''} onClick={() => setActivePage('myTeam')}>My Team</button></li>
                        <li><button className={activePage === 'transfers' ? 'active' : ''} onClick={() => setActivePage('transfers')}>Transfers</button></li>
                    </>
                )}
                <li><button className={activePage === 'fixtures' ? 'active' : ''} onClick={() => setActivePage('fixtures')}>Fixtures</button></li>
                <li><button className={activePage === 'standings' ? 'active' : ''} onClick={() => setActivePage('standings')}>Standings</button></li>
            </ul>
        </NavContainer>
    );
}

export default Navigation;
