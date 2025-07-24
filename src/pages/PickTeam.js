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

    const initialBudget = 100.0;
    const maxPlayers = 15;

    useEffect(() => {
        if (userData && allPlayers.length > 0) {
            const initialSelection = userData.players.map(playerId =>
                allPlayers.find(p => p.id === playerId)
            ).filter(Boolean);
            setSelectedPlayers(initialSelection);
        } else if (!userData && allPlayers.length > 0 && isInitialPick) {
            setSelectedPlayers([]);
        }
    }, [userData, allPlayers, isInitialPick]);

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

        if (isInitialPick && selectedPlayers.length >= maxPlayers) {
            alert('Squad is full! Maximum 15 players allowed for initial selection.');
            return;
        }

        if (!isInitialPick && selectedPlayers.length >= maxPlayers) {
             alert('Squad is full! Maximum 15 players allowed in total squad.');
             return;
        }

        const currentBudget = userData ? userData.budget : initialBudget;

        if (currentBudget < player.cost) {
            alert(`Not enough budget to add ${player.name}. You need $${(player.cost - currentBudget).toFixed(1)}M more.`);
            return;
        }

        const newPlayers = [...selectedPlayers, player];
        setSelectedPlayers(newPlayers);
        setUserData({ // Call the parent's setUserData (which updates Firestore)
            ...userData,
            players: newPlayers.map(p => p.id),
            budget: parseFloat((userData.budget - player.cost).toFixed(1))
        });
    }, [selectedPlayers, userData, setUserData, isInitialPick, maxPlayers, initialBudget]);


    const handleRemovePlayer = useCallback((playerToRemove) => {
        const newPlayers = selectedPlayers.filter(p => p.id !== playerToRemove.id);
        setSelectedPlayers(newPlayers);
        setUserData({ // Call the parent's setUserData (which updates Firestore)
            ...userData,
            players: newPlayers.map(p => p.id),
            budget: parseFloat((userData.budget + playerToRemove.cost).toFixed(1))
        });
    }, [selectedPlayers, userData, setUserData]);

    const updateSelectedPlayersFromDisplay = useCallback((newPlayers) => {
        const totalCost = newPlayers.reduce((sum, player) => sum + (player ? player.cost : 0), 0);
        const newBudget = (initialBudget - totalCost).toFixed(1);

        setSelectedPlayers(newPlayers.filter(Boolean));
        setUserData({ // Call the parent's setUserData (which updates Firestore)
            ...userData,
            players: newPlayers.filter(Boolean).map(p => p.id),
            budget: parseFloat(newBudget)
        });
    }, [initialBudget, setUserData, userData]);


    const handlePlayerDrop = useCallback((player, targetPlayer, targetPosition) => {
        if (!selectedPlayers.some(p => p.id === player.id)) {
            handleAddPlayer(player);
        } else {
            console.log(`Player ${player.name} moved within squad to position ${targetPosition}.`);
            // To implement actual swaps, you'd need to find `player` and `targetPlayer` in `selectedPlayers`
            // and update their positions/swap them. This is out of scope for a quick fix for now.
        }
    }, [selectedPlayers, handleAddPlayer]);

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
        const finalBudget = userData ? userData.budget : initialBudget - selectedPlayers.reduce((sum, p) => sum + p.cost, 0);

        onInitialSave(selectedPlayers, finalBudget); // This function is now responsible for saving to Firestore
    };

    const handleResetTeam = useCallback(() => {
        setSelectedPlayers([]);
        setUserData({ // Call the parent's setUserData (which updates Firestore)
            ...userData,
            players: [],
            budget: initialBudget
        });
    }, [setUserData, initialBudget, userData]);


    if (!userData || allPlayers.length === 0 || allTeams.length === 0 || allFixtures.length === 0) {
        return <PickTeamContainer>Loading player data...</PickTeamContainer>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <PickTeamContainer>
                <PlayerSelectionArea>
                    <h2>{isInitialPick ? "Select Your Squad" : "Your Lineup"}</h2>
                    <p>Budget: ${userData.budget.toFixed(1)}M | Players: {selectedPlayers.length}/{maxPlayers}</p>
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
                        <p className="budget-display">Budget Remaining: ${userData.budget.toFixed(1)}M</p>
                    </TeamInfoBar>

                    <SelectedTeamDisplay
                        selectedPlayers={selectedPlayers}
                        onRemove={handleRemovePlayer}
                        allTeams={allTeams}
                        allFixtures={allFixtures}
                        onPlayerDrop={handlePlayerDrop}
                        budget={userData.budget}
                        isInitialPick={isInitialPick}
                        onPositionClick={handlePositionFilterClick}
                        allAvailablePlayers={allPlayers}
                        onUpdateSelectedPlayers={updateSelectedPlayersFromDisplay}
                        onResetTeam={handleResetTeam}
                    />
                    {isInitialPick && selectedPlayers.length === maxPlayers && (
                        <button
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: 'var(--primary-green)',
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
                                backgroundColor: 'var(--primary-green)',
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
