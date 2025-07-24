// src/pages/PickTeam.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import PlayerSearchFilter from '../components/PlayerSearchFilter';
import PlayerCard from '../components/PlayerCard';
import SelectedTeamDisplay from '../components/SelectedTeamDisplay';

const PickTeamContainer = styled.div`
    display: flex;
    gap: 20px;
    padding: 20px;
    max-width: 1200px;
    margin: 20px auto;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
        padding: 10px;
        margin: 10px auto;
    }
`;

const PlayerSelectionArea = styled.div`
    flex: 1;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    min-width: 300px;

    @media (max-width: 768px) {
        flex: auto;
        width: 100%;
        padding: 15px;
    }
`;

const PlayerList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
    max-height: 700px;
    overflow-y: auto;
    padding-right: 10px;

    @media (max-width: 768px) {
        max-height: 500px;
    }
`;

const TeamDisplayArea = styled.div`
    flex: 2;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 20px;
    align-self: flex-start;
    min-width: 400px;

    @media (max-width: 768px) {
        flex: auto;
        width: 100%;
        padding: 15px;
        position: static;
        margin-top: 20px;
    }
`;

const TeamInfoBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;

    p {
        margin: 0;
        font-size: 1.1em;
        font-weight: bold;
        color: #333;
    }

    .budget-display {
        color: #008000;
    }
`;


function PickTeam({ userData, allPlayers, allTeams, setUserData, isInitialPick, onInitialSave }) {
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [filters, setFilters] = useState({ search: '', position: 'All', team: 'All' });

    useEffect(() => {
        if (userData && allPlayers.length > 0) {
            const initialSelection = userData.players.map(playerId =>
                allPlayers.find(p => p.id === playerId)
            ).filter(Boolean);
            setSelectedPlayers(initialSelection);
        }
    }, [userData, allPlayers]);

    useEffect(() => {
        let currentPlayers = allPlayers;

        if (filters.search) {
            currentPlayers = currentPlayers.filter(p =>
                p.name.toLowerCase().includes(filters.search.toLowerCase())
            );
        }
        if (filters.position !== 'All') {
            currentPlayers = currentPlayers.filter(p => p.position === filters.position);
        }
        if (filters.team !== 'All') {
            currentPlayers = currentPlayers.filter(p => p.team === filters.team);
        }
        setFilteredPlayers(currentPlayers);
    }, [allPlayers, filters]);

    const handleAddPlayer = useCallback((player) => {
        if (selectedPlayers.some(p => p.id === player.id)) {
            console.warn(`${player.name} is already in your squad.`);
            return;
        }

        if (selectedPlayers.length >= 15) {
            console.warn('Squad is full! Maximum 15 players allowed.');
            return;
        }

        if (userData.budget < player.cost) {
            console.warn(`Not enough budget to add ${player.name}.`);
            return;
        }

        setSelectedPlayers(prev => [...prev, player]);
        setUserData(prev => ({
            ...prev,
            players: [...prev.players, player.id],
            budget: prev.budget - player.cost
        }));
    }, [selectedPlayers, userData, setUserData]);

    const handleRemovePlayer = useCallback((playerToRemove) => {
        setSelectedPlayers(prev => prev.filter(p => p.id !== playerToRemove.id));
        setUserData(prev => ({
            ...prev,
            players: prev.players.filter(id => id !== playerToRemove.id),
            budget: prev.budget + playerToRemove.cost
        }));
    }, [setUserData]);

    const handlePlayerDrop = useCallback((player, targetPlayer, targetPosition) => {
        if (!selectedPlayers.some(p => p.id === player.id)) {
            handleAddPlayer(player);
        }
    }, [selectedPlayers, handleAddPlayer]);

    const handlePositionFilterClick = useCallback((positionType) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            position: positionType === 'SUB' ? 'All' : positionType
        }));
    }, []);


    const handleSaveTeam = () => {
        if (selectedPlayers.length !== 15) {
            alert('Please select exactly 15 players to save your initial team.');
            return;
        }
        onInitialSave(selectedPlayers);
    };


    if (!userData || allPlayers.length === 0 || allTeams.length === 0) {
        return <PickTeamContainer>Loading player data...</PickTeamContainer>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <PickTeamContainer>
                <PlayerSelectionArea>
                    <h2>{isInitialPick ? "Select Your Squad" : "Your Lineup"}</h2>
                    {isInitialPick && (
                        <p>Budget: ${userData.budget.toFixed(1)}M | Players: {selectedPlayers.length}/15</p>
                    )}
                    <PlayerSearchFilter filters={filters} setFilters={setFilters} allTeams={allTeams} />
                    <PlayerList>
                        {filteredPlayers.map(player => (
                            <PlayerCard
                                key={player.id}
                                player={player}
                                onAdd={() => handleAddPlayer(player)}
                                isAdded={selectedPlayers.some(p => p.id === player.id)}
                                isListView={true}
                                allTeams={allTeams}
                            />
                        ))}
                    </PlayerList>
                </PlayerSelectionArea>
                <TeamDisplayArea>
                    <TeamInfoBar>
                        <p>Your Squad ({selectedPlayers.length}/15)</p>
                        <p className="budget-display">Budget Remaining: ${userData.budget.toFixed(1)}M</p>
                    </TeamInfoBar>

                    <SelectedTeamDisplay
                        selectedPlayers={selectedPlayers}
                        onRemove={handleRemovePlayer}
                        allTeams={allTeams}
                        onPlayerDrop={handlePlayerDrop}
                        budget={userData.budget}
                        isInitialPick={isInitialPick}
                        onPositionClick={handlePositionFilterClick} // Pass new prop
                    />
                    {isInitialPick && selectedPlayers.length === 15 && (
                        <button
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: '#008000',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                            onClick={handleSaveTeam}
                        >
                            Save Initial Team
                        </button>
                    )}
                    {!isInitialPick && (
                        <button
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: '#008000',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                            onClick={() => console.log('Save lineup changes (captain, formation, etc.)')}
                        >
                            Save Lineup Changes
                        </button>
                    )}
                </TeamDisplayArea>
            </PickTeamContainer>
        </DndProvider>
    );
}

export default PickTeam;
