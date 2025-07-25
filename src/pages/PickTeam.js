// src/pages/PickTeam.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import PlayerSearchFilter from '../components/PlayerSearchFilter';
import PlayerCard from '../components/PlayerCard';
import SelectedTeamDisplay from '../components/SelectedTeamDisplay';

// Import the styled components from SelectedTeamDisplay
import { ButtonContainer, ActionButton } from '../components/SelectedTeamDisplay';

const PickTeamContainer = styled.div`
    display: flex;
    gap: 20px;
    padding: 20px;
    max-width: 1200px; /* Default max-width for initial pick view */
    margin: 20px auto;
    flex-wrap: wrap;

    /* MODIFIED: Adjust flex-direction and width based on isInitialPick for "My Team" view */
    ${props => !props.isInitialPick && `
        flex-direction: column; /* Stack content vertically for My Team view */
        max-width: 1000px; /* MODIFIED: Increased max-width for the container in My Team view */
        align-items: center; /* Center content */
        padding: 10px; /* Reduced padding for My Team view to give more space */
    `}

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
    padding: 20px; /* Default padding */
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 20px;
    align-self: flex-start;
    min-width: 400px;
    /* REMOVED: display: flex; flex-direction: column; align-items: center; from here */


    /* MODIFIED: Make it full width when isInitialPick is false */
    ${props => !props.isInitialPick && `
        flex: none; /* Disable flex growth */
        width: 100%; /* Take full width */
        max-width: 900px; /* MODIFIED: Increased max-width for pitch on larger screens */
        padding: 15px; /* Slightly reduced padding for a tighter fit */
        margin-top: 0; /* Remove top margin */
        position: static; /* Remove sticky positioning */
    `}

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
    width: 100%; /* Ensure it spans full width of its parent */


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
    const [captainId, setCaptainId] = useState(userData?.captainId || null);
    const [viceCaptainId, setViceCaptainId] = useState(userData?.viceCaptainId || null);
    const [substitutionMode, setSubstitutionMode] = useState(false); // NEW: State for substitution mode
    const [playerToSubstitute, setPlayerToSubstitute] = useState(null); // NEW: State for the first player selected for substitution


    const initialBudget = 100.0;
    const maxPlayers = 15;
    const maxPlayersPerTeam = 3;

    const currentTeamCost = selectedPlayers.reduce((sum, player) => sum + (player ? player.cost : 0), 0);
    const currentBudgetRemaining = (initialBudget - currentTeamCost).toFixed(1);


    useEffect(() => {
        if (userData && allPlayers.length > 0) {
            const initialSelection = userData.players.map(playerId =>
                allPlayers.find(p => p.id === playerId)
            ).filter(Boolean);
            setSelectedPlayers(initialSelection);
            setCaptainId(userData.captainId || null);
            setViceCaptainId(userData.viceCaptainId || null);
        } else if (!userData && allPlayers.length > 0 && isInitialPick) {
            setSelectedPlayers([]);
            setCaptainId(null);
            setViceCaptainId(null);
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

        if (selectedPlayers.length >= maxPlayers) {
            alert('Squad is full! Maximum 15 players allowed.');
            return;
        }

        const playersFromSameTeam = selectedPlayers.filter(p => p.team === player.team).length;
        if (playersFromSameTeam >= maxPlayersPerTeam) {
            alert(`You can only have a maximum of ${maxPlayersPerTeam} players from ${player.team}.`);
            return;
        }

        if (parseFloat(currentBudgetRemaining) < player.cost) {
            alert(`Not enough budget to add ${player.name}. You need $${(player.cost - parseFloat(currentBudgetRemaining)).toFixed(1)}M more.`);
            return;
        }

        setSelectedPlayers(prev => [...prev, player]);

    }, [selectedPlayers, currentBudgetRemaining, maxPlayers, maxPlayersPerTeam]);


    const handleRemovePlayer = useCallback((playerToRemove) => {
        if (captainId === playerToRemove.id) {
            setCaptainId(null);
        }
        if (viceCaptainId === playerToRemove.id) {
            setViceCaptainId(null);
        }
        setSelectedPlayers(prev => prev.filter(p => p.id !== playerToRemove.id));
    }, [captainId, viceCaptainId]);


    const updateSelectedPlayersFromDisplay = useCallback((newPlayers) => {
        setSelectedPlayers(newPlayers.filter(Boolean));
        if (captainId && !newPlayers.some(p => p && p.id === captainId)) {
            setCaptainId(null);
        }
        if (viceCaptainId && !newPlayers.some(p => p && p.id === viceCaptainId)) {
            setViceCaptainId(null);
        }
    }, [captainId, viceCaptainId]);


    const handlePlayerDrop = useCallback((player, targetPlayer, targetPosition) => {
        if (!selectedPlayers.some(p => p.id === player.id)) {
            handleAddPlayer(player);
        } else {
            console.log(`Player ${player.name} moved within squad to position ${targetPosition}.`);
            const filtered = selectedPlayers.filter(p => p.id !== player.id);
            setSelectedPlayers([...filtered, player]);
        }
    }, [selectedPlayers, handleAddPlayer]);


    const handlePositionFilterClick = useCallback((positionType) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            position: positionType === 'SUB' ? 'All' : positionType
        }));
    }, []);

    // Handle setting captain
    const handleSetCaptain = useCallback((player) => {
        if (!player) return;

        // Determine if player is in the starting XI (first 11 players in selectedPlayers array)
        const isPlayerInStartingXI = selectedPlayers.slice(0, 11).some(p => p && p.id === player.id);

        if (!isPlayerInStartingXI && !isInitialPick) {
            alert("Only players in the starting XI can be Captain.");
            return;
        }

        if (captainId === player.id) {
            setCaptainId(null);
        } else {
            if (viceCaptainId === player.id) {
                setViceCaptainId(null);
            }
            setCaptainId(player.id);
        }
    }, [captainId, viceCaptainId, selectedPlayers, isInitialPick]);

    // Handle setting vice-captain
    const handleSetViceCaptain = useCallback((player) => {
        if (!player) return;

        // Determine if player is in the starting XI
        const isPlayerInStartingXI = selectedPlayers.slice(0, 11).some(p => p && p.id === player.id);

        if (!isPlayerInStartingXI && !isInitialPick) {
            alert("Only players in the starting XI can be Vice-Captain.");
            return;
        }

        if (viceCaptainId === player.id) {
            setViceCaptainId(null);
        } else {
            if (captainId === player.id) {
                setCaptainId(null);
            }
            setViceCaptainId(player.id);
        }
    }, [captainId, viceCaptainId, selectedPlayers, isInitialPick]);


    const handleSaveTeam = () => {
        if (selectedPlayers.length !== maxPlayers) {
            alert(`Please select exactly ${maxPlayers} players to save your initial team.`);
            return;
        }
        const finalBudget = (initialBudget - currentTeamCost).toFixed(1);

        onInitialSave(selectedPlayers, finalBudget);
    };

    const handleSaveLineupChanges = () => {
        setUserData({
            ...userData,
            players: selectedPlayers.map(p => p.id),
            captainId: captainId,
            viceCaptainId: viceCaptainId,
            budget: parseFloat(currentBudgetRemaining)
        });
        alert("Lineup changes saved!");
    };


    const handleResetTeam = useCallback(() => {
        setSelectedPlayers([]);
        setCaptainId(null);
        setViceCaptainId(null);
    }, []);

    // Dummy for Auto Pick specific to PickTeam if it's not the initial pick
    const handleAutoPickTeam = useCallback(() => {
        alert("Auto Pick for My Team functionality (e.g., suggesting optimal lineup) would go here.");
        // This function would typically re-arrange the selectedPlayers into an optimal formation
        // based on some criteria (e.g., highest points, best form).
    }, []);

    // NEW: Function to toggle substitution mode
    const handleSubstitutionClick = useCallback(() => {
        setSubstitutionMode(prevMode => !prevMode);
        setPlayerToSubstitute(null); // Reset selected player when toggling mode
        alert(substitutionMode ? "Substitution mode OFF" : "Substitution mode ON. Select the first player to swap.");
    }, [substitutionMode]);


    // NEW: Function to handle player clicks specifically for substitution
    const handlePlayerClickForSubstitution = useCallback((clickedPlayer, isBenchPlayer) => {
        if (!substitutionMode) {
            // If not in substitution mode, allow normal captaincy selection
            // This part is handled by PlayerJersey's internal logic for captaincy buttons
            return;
        }

        if (!clickedPlayer) { // Cannot substitute an empty slot
            alert("Please select a player to substitute.");
            return;
        }

        if (!playerToSubstitute) {
            // First player selected for substitution
            setPlayerToSubstitute(clickedPlayer);
            alert(`Selected ${clickedPlayer.name} for substitution. Now select the player to swap with.`);
        } else {
            // Second player selected for substitution (perform the swap)
            if (playerToSubstitute.id === clickedPlayer.id) {
                alert("Cannot swap a player with themselves. Select a different player.");
                setPlayerToSubstitute(null); // Deselect
                return;
            }

            // Determine if the first player is on pitch and second on bench, or vice-versa
            const player1OnPitch = selectedPlayers.slice(0, 11).some(p => p && p.id === playerToSubstitute.id);
            const player2OnPitch = selectedPlayers.slice(0, 11).some(p => p && p.id === clickedPlayer.id);

            const player1OnBench = !player1OnPitch && selectedPlayers.some(p => p && p.id === playerToSubstitute.id);
            const player2OnBench = !player2OnPitch && selectedPlayers.some(p => p && p.id === clickedPlayer.id);

            // Rule: One must be on pitch, the other on bench
            const isValidSwap = (player1OnPitch && player2OnBench) || (player1OnBench && player2OnPitch);

            if (!isValidSwap) {
                alert("Invalid substitution: One player must be on the pitch and the other on the bench.");
                setPlayerToSubstitute(null); // Reset selection
                return;
            }

            // Perform the swap
            setSelectedPlayers(prevPlayers => {
                const newPlayers = [...prevPlayers];
                const idx1 = newPlayers.findIndex(p => p && p.id === playerToSubstitute.id);
                const idx2 = newPlayers.findIndex(p => p && p.id === clickedPlayer.id);

                if (idx1 !== -1 && idx2 !== -1) {
                    // Simple swap of players in the array
                    [newPlayers[idx1], newPlayers[idx2]] = [newPlayers[idx2], newPlayers[idx1]];
                }
                return newPlayers;
            });

            // Reset substitution state
            setSubstitutionMode(false);
            setPlayerToSubstitute(null);
            alert(`Successfully swapped ${playerToSubstitute.name} with ${clickedPlayer.name}!`);
        }
    }, [substitutionMode, playerToSubstitute, selectedPlayers]);


    if (!userData || allPlayers.length === 0 || allTeams.length === 0 || allFixtures.length === 0) {
        return <PickTeamContainer>Loading player data...</PickTeamContainer>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <PickTeamContainer isInitialPick={isInitialPick}>
                {isInitialPick && ( // Conditionally render PlayerSelectionArea
                    <PlayerSelectionArea>
                        <h2>Select Your Squad</h2>
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
                )}
                <TeamDisplayArea isInitialPick={isInitialPick}>
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
                        budget={currentBudgetRemaining}
                        isInitialPick={isInitialPick}
                        onPositionClick={handlePositionFilterClick}
                        allAvailablePlayers={allPlayers}
                        onUpdateSelectedPlayers={updateSelectedPlayersFromDisplay}
                        onResetTeam={handleResetTeam}
                        captainId={captainId}
                        viceCaptainId={viceCaptainId}
                        onSetCaptain={handleSetCaptain}
                        onSetViceCaptain={handleSetViceCaptain}
                        // NEW: Pass substitution related props
                        substitutionMode={substitutionMode}
                        playerToSubstitute={playerToSubstitute}
                        onPlayerClickForSubstitution={handlePlayerClickForSubstitution}
                        onToggleSubstitutionMode={handleSubstitutionClick} // Pass the toggle function
                    />
                    {/* All buttons are now controlled here for both initial pick and "My Team" */}
                    {isInitialPick ? (
                        <ButtonContainer>
                            <ActionButton onClick={handleAutoPickTeam}>Auto Pick</ActionButton>
                            <ActionButton onClick={handleResetTeam}>Reset</ActionButton>
                            <ActionButton
                                onClick={handleSaveTeam}
                                disabled={selectedPlayers.length !== maxPlayers}
                                style={{
                                    opacity: selectedPlayers.length === maxPlayers ? 1 : 0.5,
                                }}
                            >
                                Save Initial Team
                            </ActionButton>
                        </ButtonContainer>
                    ) : (
                        // MODIFIED: Only "Save Lineup Changes" button here
                        <ButtonContainer>
                            <ActionButton onClick={handleSaveLineupChanges}>
                            Save Your Team
                            </ActionButton>
                            {/* REMOVED: Substitution button from here. It's now on PlayerJersey. */}
                        </ButtonContainer>
                    )}
                </TeamDisplayArea>
            </PickTeamContainer>
        </DndProvider>
    );
}

export default PickTeam;
