// src/pages/MyTeam.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Removed unused imports: PlayerSearchFilter, PlayerCard
import SelectedTeamDisplay from '../components/SelectedTeamDisplay';

import { ButtonContainer, ActionButton } from '../components/SelectedTeamDisplay';

const MyTeamContainer = styled.div`
    display: flex;
    flex-direction: column; /* Stack content vertically for My Team view */
    gap: 20px;
    padding: 10px; /* Reduced padding for My Team view to give more space */
    max-width: 1000px; /* Increased max-width for the container in My Team view */
    margin: 20px auto;
    align-items: center; /* Center content */
    flex-wrap: wrap;

    @media (max-width: 768px) {
        padding: 10px;
        margin: 10px auto;
    }
`;

const TeamDisplayArea = styled.div`
    flex: none; /* Disable flex growth */
    width: 100%; /* Take full width */
    max-width: 900px; /* Increased max-width for pitch on larger screens */
    padding: 15px; /* Slightly reduced padding for a tighter fit */
    margin-top: 0; /* Remove top margin */
    position: static; /* Remove sticky positioning */
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);

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
    width: 100%;

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


function MyTeam({ userData, allPlayers, allTeams, allFixtures, setUserData, currentUser }) {
    // selectedPlayers will now hold objects { id: playerId, onPitch: boolean }
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [captainId, setCaptainId] = useState(userData?.captainId || null);
    const [viceCaptainId, setViceCaptainId] = useState(userData?.viceCaptainId || null);
    // substitutionMode is now implicitly handled by playerToSubstitute state
    const [playerToSubstitute, setPlayerToSubstitute] = useState(null);

    const initialBudget = 100.0; // This might be overridden by userData.budget
    const maxPlayers = 15; // Total squad size

    const currentBudgetRemaining = (userData?.budget !== undefined ? userData.budget : initialBudget).toFixed(1);


    useEffect(() => {
        if (userData && allPlayers.length > 0) {
            // Map stored player IDs to full player objects, preserving onPitch status
            const initialSelection = userData.players.map((playerData, index) => {
                const player = allPlayers.find(p => p.id === playerData.id);
                if (player) {
                    // Ensure onPitch is always a boolean. Default to true for first 11 if undefined.
                    const onPitchStatus = typeof playerData.onPitch === 'boolean' ? playerData.onPitch : (index < 11);
                    return { ...player, onPitch: onPitchStatus };
                }
                return null;
            }).filter(Boolean); // Filter out any nulls if player not found
            setSelectedPlayers(initialSelection);
            setCaptainId(userData.captainId || null);
            setViceCaptainId(userData.viceCaptainId || null);
        }
    }, [userData, allPlayers]);

    // This function is called by SelectedTeamDisplay to update selectedPlayers state
    // (e.g., when a player is removed via the 'x' button)
    const updateSelectedPlayersFromDisplay = useCallback((newPlayers) => {
        setSelectedPlayers(newPlayers.filter(Boolean)); // Filter out any nulls
        // Also update captain/vice-captain if the removed player was one
        if (captainId && !newPlayers.some(p => p && p.id === captainId)) {
            setCaptainId(null);
        }
        if (viceCaptainId && !newPlayers.some(p => p && p.id === viceCaptainId)) {
            setViceCaptainId(null);
        }
    }, [captainId, viceCaptainId]);

    // This function is for internal re-ordering/swapping within the selected squad
    const handlePlayerMoveInSquad = useCallback((draggedPlayer, targetPlayer, targetPositionType) => {
        let newSelectedPlayers = [...selectedPlayers]; // Copy current state

        // If targetPlayer is null, it means dropping onto an empty slot.
        // We need to determine if this empty slot is on pitch or bench.
        if (targetPlayer === null) {
            // Find the dragged player in the current selectedPlayers array
            const draggedPlayerIndex = newSelectedPlayers.findIndex(p => p.id === draggedPlayer.id);
            if (draggedPlayerIndex === -1) return; // Should not happen for existing players

            // Determine if the target position type implies a pitch or bench slot
            const isTargetPitch = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].includes(targetPositionType);

            // Update the onPitch status of the dragged player
            newSelectedPlayers[draggedPlayerIndex] = { ...newSelectedPlayers[draggedPlayerIndex], onPitch: isTargetPitch };

            // For visual reordering on pitch/bench, we might need to sort or re-arrange
            // This is largely handled by distributePlayersByFormation in SelectedTeamDisplay
            // but a stable sort here can help maintain order after status change.
            newSelectedPlayers.sort((a,b) => a.id - b.id); // Simple stable sort

            updateSelectedPlayersFromDisplay(newSelectedPlayers); // Call the local function
            return;
        }

        // If targetPlayer exists, it's a swap between two players
        const draggedPlayerIndex = newSelectedPlayers.findIndex(p => p.id === draggedPlayer.id);
        const targetPlayerIndex = newSelectedPlayers.findIndex(p => p.id === targetPlayer.id);

        if (draggedPlayerIndex === -1 || targetPlayerIndex === -1) return; // Should not happen

        // Swap their onPitch statuses
        const tempOnPitch = newSelectedPlayers[draggedPlayerIndex].onPitch;
        newSelectedPlayers[draggedPlayerIndex].onPitch = newSelectedPlayers[targetPlayerIndex].onPitch;
        newSelectedPlayers[targetPlayerIndex].onPitch = tempOnPitch;

        // After swapping onPitch status, update the state
        updateSelectedPlayersFromDisplay(newSelectedPlayers); // Call the local function

    }, [selectedPlayers, updateSelectedPlayersFromDisplay]);


    // Handle setting captain
    const handleSetCaptain = useCallback((player) => {
        if (!player) return;

        // Only players on the pitch can be Captain
        const isPlayerOnPitch = selectedPlayers.some(p => p.id === player.id && p.onPitch);
        if (!isPlayerOnPitch) {
            alert("Only players in the starting XI can be Captain.");
            return;
        }

        if (captainId === player.id) {
            setCaptainId(null); // Deselect if already captain
        } else {
            if (viceCaptainId === player.id) {
                setViceCaptainId(null); // If player was VC, remove VC status
            }
            setCaptainId(player.id);
        }
    }, [captainId, viceCaptainId, selectedPlayers]);

    // Handle setting vice-captain
    const handleSetViceCaptain = useCallback((player) => {
        if (!player) return;

        // Only players on the pitch can be Vice-Captain
        const isPlayerOnPitch = selectedPlayers.some(p => p.id === player.id && p.onPitch);
        if (!isPlayerOnPitch) {
            alert("Only players in the starting XI can be Vice-Captain.");
            return;
        }

        if (viceCaptainId === player.id) {
            setViceCaptainId(null); // Deselect if already vice-captain
        } else {
            if (captainId === player.id) {
                setCaptainId(null); // If player was C, remove C status
            }
            setViceCaptainId(player.id);
        }
    }, [captainId, viceCaptainId, selectedPlayers]);

    // Handle saving lineup changes to Firestore
    const handleSaveLineupChanges = useCallback(() => {
        // Ensure there are 11 players on pitch and 4 on bench
        const pitchPlayersCount = selectedPlayers.filter(p => p.onPitch).length;
        const benchPlayersCount = selectedPlayers.filter(p => !p.onPitch).length;

        if (pitchPlayersCount !== 11 || benchPlayersCount !== 4) {
            alert("Your team must have exactly 11 players on the pitch and 4 on the bench to save.");
            return;
        }

        // Check if captain and vice-captain are still valid (on pitch)
        const currentCaptain = selectedPlayers.find(p => p.id === captainId);
        const currentViceCaptain = selectedPlayers.find(p => p.id === viceCaptainId);

        if (captainId && (!currentCaptain || !currentCaptain.onPitch)) {
            alert("Captain must be on the pitch. Please re-assign or move them to the pitch.");
            return;
        }
        if (viceCaptainId && (!currentViceCaptain || !currentViceCaptain.onPitch)) {
            alert("Vice-Captain must be on the pitch. Please re-assign or move them to the pitch.");
            return;
        }

        // Ensure Captain and Vice-Captain are different players
        if (captainId && viceCaptainId && captainId === viceCaptainId) {
            alert("Captain and Vice-Captain must be different players.");
            return;
        }

        // Prepare data to save, including the onPitch status
        const playersToSave = selectedPlayers.map(p => ({ id: p.id, onPitch: p.onPitch }));

        setUserData({
            ...userData,
            players: playersToSave, // Save the updated players array with onPitch status
            captainId: captainId,
            viceCaptainId: viceCaptainId,
            // Budget is not changed on MyTeam page, it's fixed by initial pick or transfers
            // but we pass it along to ensure other fields are not lost.
            budget: userData.budget
        });
        alert("Lineup changes saved!");
    }, [selectedPlayers, captainId, viceCaptainId, userData, setUserData]);


    const handleResetTeam = useCallback(() => {
        // This reset should revert to the last saved state from userData
        if (userData && allPlayers.length > 0) {
            const initialSelection = userData.players.map(playerData => {
                const player = allPlayers.find(p => p.id === playerData.id);
                return player ? { ...player, onPitch: playerData.onPitch } : null;
            }).filter(Boolean);
            setSelectedPlayers(initialSelection);
            setCaptainId(userData.captainId || null);
            setViceCaptainId(userData.viceCaptainId || null);
            setPlayerToSubstitute(null); // Reset substitution state
            alert("Team reset to last saved state.");
        }
    }, [userData, allPlayers]);


    // Function to handle player clicks specifically for substitution
    const handlePlayerClickForSubstitution = useCallback((clickedPlayer) => {
        if (!clickedPlayer) {
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

            // NEW: Enforce same position swap
            if (playerToSubstitute.position !== clickedPlayer.position) {
                alert(`Cannot swap a ${playerToSubstitute.position} with a ${clickedPlayer.position}. Only players of the same position can be swapped.`);
                setPlayerToSubstitute(null); // Deselect
                return;
            }

            // Determine if the first player is on pitch and second on bench, or vice-versa
            const player1OnPitch = selectedPlayers.some(p => p.id === playerToSubstitute.id && p.onPitch);
            const player2OnPitch = selectedPlayers.some(p => p.id === clickedPlayer.id && p.onPitch);

            // Rule: One must be on pitch, the other on bench
            const isValidSwap = (player1OnPitch && !player2OnPitch) || (!player1OnPitch && player2OnPitch);

            if (!isValidSwap) {
                alert("Invalid substitution: One player must be on the pitch and the other on the bench.");
                setPlayerToSubstitute(null); // Reset selection
                return;
            }

            // Perform the swap by updating the 'onPitch' status
            setSelectedPlayers(prevPlayers => {
                return prevPlayers.map(p => {
                    if (p.id === playerToSubstitute.id) {
                        return { ...p, onPitch: !p.onPitch };
                    }
                    if (p.id === clickedPlayer.id) {
                        return { ...p, onPitch: !p.onPitch };
                    }
                    return p;
                });
            });

            // Reset captain/vice-captain if swapped player was one and moved to bench
            if (captainId === playerToSubstitute.id && player1OnPitch) setCaptainId(null);
            if (viceCaptainId === playerToSubstitute.id && player1OnPitch) setViceCaptainId(null);
            if (captainId === clickedPlayer.id && player2OnPitch) setCaptainId(null);
            if (viceCaptainId === clickedPlayer.id && player2OnPitch) setViceCaptainId(null);


            // Reset substitution state
            setPlayerToSubstitute(null); // Clear the first selected player
            alert(`Successfully swapped ${playerToSubstitute.name} with ${clickedPlayer.name}!`);
        }
    }, [playerToSubstitute, selectedPlayers, captainId, viceCaptainId]);


    if (!userData || allPlayers.length === 0 || allTeams.length === 0 || allFixtures.length === 0) {
        return <MyTeamContainer>Loading team data...</MyTeamContainer>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <MyTeamContainer>
                <TeamDisplayArea>
                    <TeamInfoBar>
                        <p>Your Squad ({selectedPlayers.length}/{maxPlayers})</p>
                        <p className="budget-display">Budget Remaining: ${currentBudgetRemaining}M</p>
                    </TeamInfoBar>

                    <SelectedTeamDisplay
                        selectedPlayers={selectedPlayers}
                        onRemove={updateSelectedPlayersFromDisplay} // Removal is handled by MyTeam by updating onPitch
                        allTeams={allTeams}
                        allFixtures={allFixtures}
                        onPlayerDrop={handlePlayerMoveInSquad} // Handle drag-drop for pitch/bench changes
                        budget={currentBudgetRemaining}
                        isInitialPick={false} // Always false for MyTeam
                        onPositionClick={() => {}} // No position filter from empty slots on MyTeam
                        allAvailablePlayers={allPlayers} // Not strictly needed for MyTeam, but doesn't hurt
                        onUpdateSelectedPlayers={updateSelectedPlayersFromDisplay} // For removals from SelectedTeamDisplay
                        onResetTeam={handleResetTeam}
                        captainId={captainId}
                        viceCaptainId={viceCaptainId}
                        onSetCaptain={handleSetCaptain}
                        onSetViceCaptain={handleSetViceCaptain}
                        substitutionMode={!!playerToSubstitute} // True if a player is selected for substitution
                        playerToSubstitute={playerToSubstitute}
                        onPlayerClickForSubstitution={handlePlayerClickForSubstitution}
                        onToggleSubstitutionMode={() => setPlayerToSubstitute(null)} // Clicking "Exit Substitution Mode" if needed
                    />
                    <ButtonContainer>
                        <ActionButton onClick={handleSaveLineupChanges}>
                            Save Your Team
                        </ActionButton>
                        {/* Removed the dedicated "Substitute Players" button */}
                        <ActionButton onClick={handleResetTeam}>
                            Reset Lineup
                        </ActionButton>
                    </ButtonContainer>
                </TeamDisplayArea>
            </MyTeamContainer>
        </DndProvider>
    );
}

export default MyTeam;
