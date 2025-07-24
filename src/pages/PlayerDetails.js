// src/pages/PlayerDetails.js
import React from 'react';
import styled from 'styled-components';

const PlayerDetailsContainer = styled.div`
    padding: 20px;
    max-width: 800px;
    margin: 20px auto;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    text-align: center;
`;

const PlayerName = styled.h2`
    color: #008000;
    margin-bottom: 10px;
`;

const PlayerInfo = styled.p`
    font-size: 1.1em;
    color: #555;
    margin: 5px 0;
`;

function PlayerDetails() {
    // In a real application, you'd typically fetch player data
    // based on an ID passed via URL parameters or props.
    // For now, this is a placeholder.

    return (
        <PlayerDetailsContainer>
            <PlayerName>Player Details (Placeholder)</PlayerName>
            <PlayerInfo>This page would display detailed statistics, form, fixtures, and news for a specific player.</PlayerInfo>
            <PlayerInfo>You can navigate to this page from player cards or lists to see more information.</PlayerInfo>
            {/* Example of displaying static/mock data */}
            {/* <PlayerInfo>Name: Taha Yassine Khenissi</PlayerInfo>
            <PlayerInfo>Team: EST</PlayerInfo>
            <PlayerInfo>Position: Forward</PlayerInfo>
            <PlayerInfo>Cost: $8.0M</PlayerInfo>
            <PlayerInfo>Total Points: 90</PlayerInfo> */}
        </PlayerDetailsContainer>
    );
}

export default PlayerDetails;