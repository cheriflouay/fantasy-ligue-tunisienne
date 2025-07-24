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


function PickTeam({ userData, allPlayers, allTeams, allFixtures, setUserData, isInitialPick, onInitialSave, currentUser }) {
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [filters, setFilters] = useState({ search: '', position: 'All', team: 'All' });

    const initialBudget = 100.0; // Base budget for calculations
    const maxPlayers = 15;

    // Calculate current budget based on locally selected players
    const currentTeamCost = selectedPlayers.reduce((sum, player) => sum + (player ? player.cost : 0), 0);
    const currentBudgetRemaining = (initialBudget - currentTeamCost).toFixed(1);


    useEffect(() => {
        // This effect runs once on mount or when userData/allPlayers changes
        // It initializes the local selectedPlayers state from the userData prop (from Firestore)
        if (userData && allPlayers.length > 0) {
            const initialSelection = userData.players.map(playerId =>
                allPlayers.find(p => p.id === playerId)
            ).filter(Boolean);
            setSelectedPlayers(initialSelection);
        } else if (!userData && allPlayers.length > 0 && isInitialPick) {
            // For a brand new user/session before any data is loaded
            setSelectedPlayers([]);
        }
    }, [userData, allPlayers, isInitialPick]); // Depend on userData and allPlayers for initial sync

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
            alert(`${player.name} is already in your squad.`);
            return;
        }

        if (selectedPlayers.length >= maxPlayers) {
            alert('Squad is full! Maximum 15 players allowed.');
            return;
        }

        // Use the locally calculated budget for checks, not userData.budget directly
        if (parseFloat(currentBudgetRemaining) < player.cost) { // Parse to float for comparison
            alert(`Not enough budget to add ${player.name}. You need $${(player.cost - parseFloat(currentBudgetRemaining)).toFixed(1)}M more.`);
            return;
        }

        // Only update local state, DO NOT call setUserData here
        setSelectedPlayers(prev => [...prev, player]);

    }, [selectedPlayers, currentBudgetRemaining, maxPlayers]);


    const handleRemovePlayer = useCallback((playerToRemove) => {
        // Only update local state, DO NOT call setUserData here
        setSelectedPlayers(prev => prev.filter(p => p.id !== playerToRemove.id));
    }, []); // Removed selectedPlayers from dependencies as it's used in functional update


    // This function is called by SelectedTeamDisplay's AutoPick/Reset
    const updateSelectedPlayersFromDisplay = useCallback((newPlayers) => {
        // Only update local state, DO NOT call setUserData here
        setSelectedPlayers(newPlayers.filter(Boolean)); // Filter out nulls from auto-pick
    }, []); // No dependencies related to userData here

    const handlePlayerDrop = useCallback((player, targetPlayer, targetPosition) => {
        if (!selectedPlayers.some(p => p.id === player.id)) {
            handleAddPlayer(player);
        } else {
            console.log(`Player ${player.name} moved within squad to position ${targetPosition}.`);
            // For actual swaps/repositions, you'd implement logic here that updates selectedPlayers
            // based on the targetPlayer or targetPosition.
            // Example for simple reposition (removes then re-adds, useEffect re-sorts):
            const filtered = selectedPlayers.filter(p => p.id !== player.id);
            setSelectedPlayers([...filtered, player]);
        }
    }, [selectedPlayers, handleAddPlayer]); // Depend on selectedPlayers and handleAddPlayer


    const handlePositionFilterClick = useCallback((positionType) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            position: positionType === 'SUB' ? 'All' : positionType
        }));
    }, []);

    const handleSaveTeam = () => {
        if (selectedPlayers.length !== maxPlayers) {
            alert(`Please select exactly ${maxPlayers} players to save your initial team.`);
            return;
        }
        // Calculate the final budget based on the current local selectedPlayers
        const finalBudget = (initialBudget - currentTeamCost).toFixed(1);

        // Call the parent's onInitialSave, which will trigger Firestore update in App.js
        onInitialSave(selectedPlayers, finalBudget);
    };

    const handleResetTeam = useCallback(() => {
        // Only update local state, DO NOT call setUserData here
        setSelectedPlayers([]);
    }, []); // No dependencies needed as it sets to empty array


    if (!userData || allPlayers.length === 0 || allTeams.length === 0 || allFixtures.length === 0) {
        return <PickTeamContainer>Loading player data...</PickTeamContainer>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <PickTeamContainer>
                <PlayerSelectionArea>
                    <h2>{isInitialPick ? "Select Your Squad" : "Your Lineup"}</h2>
                    {/* Display current local budget and player count */}
                    <p>Budget: ${currentBudgetRemaining}M | Players: {selectedPlayers.length}/{maxPlayers}</p>
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
                        <p>Your Squad ({selectedPlayers.length}/{maxPlayers})</p>
                        <p className="budget-display">Budget Remaining: ${currentBudgetRemaining}M</p>
                    </TeamInfoBar>

                    <SelectedTeamDisplay
                        selectedPlayers={selectedPlayers}
                        onRemove={handleRemovePlayer}
                        allTeams={allTeams}
                        allFixtures={allFixtures}
                        onPlayerDrop={handlePlayerDrop}
                        budget={currentBudgetRemaining} // Pass the locally calculated budget
                        isInitialPick={isInitialPick}
                        onPositionClick={handlePositionFilterClick}
                        allAvailablePlayers={allPlayers}
                        onUpdateSelectedPlayers={updateSelectedPlayersFromDisplay}
                        onResetTeam={handleResetTeam}
                    />
                    {isInitialPick && (
                        <button
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: 'var(--primary-green)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                // Removed duplicate cursor property
                                cursor: selectedPlayers.length === maxPlayers ? 'pointer' : 'not-allowed',
                                opacity: selectedPlayers.length === maxPlayers ? 1 : 0.5, // Visual feedback for button
                            }}
                            onClick={handleSaveTeam}
                            disabled={selectedPlayers.length !== maxPlayers} // Disable if not 15 players
                        >
                            Save Initial Team
                        </button>
                    )}
                    {!isInitialPick && (
                        <button
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: 'var(--primary-green)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px;',
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
