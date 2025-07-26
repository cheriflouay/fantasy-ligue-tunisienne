// src/pages/MyTeam.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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
    // selectedPlayers will now hold full player objects (with onPitch property)
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [captainId, setCaptainId] = useState(userData?.captainId || null);
    const [viceCaptainId, setViceCaptainId] = useState(userData?.viceCaptainId || null);
    const [substitutionMode, setSubstitutionMode] = useState(false);
    const [playerToSubstitute, setPlayerToSubstitute] = useState(null);


    const initialBudget = 100.0;
    const maxPlayers = 15;

    const currentBudgetRemaining = (userData?.budget !== undefined ? userData.budget : initialBudget).toFixed(1);


    useEffect(() => {
        if (userData && allPlayers.length > 0) {
            let loadedPlayers = userData.players.map(playerData => { // userData.players now stores {id, onPitch}
                const player = allPlayers.find(p => p.id === playerData.id);
                // Ensure player object has necessary properties, and use stored onPitch or default
                return player ? { ...player, onPitch: typeof playerData.onPitch === 'boolean' ? playerData.onPitch : false } : null;
            }).filter(Boolean); // Filter out any nulls if player not found

            // --- Robust onPitch assignment for 11 on pitch, 4 on bench ---
            // This logic ensures a consistent 11/4 split, overriding potentially inconsistent saved data
            let pitchCandidates = [];
            let benchCandidates = [];

            // Prioritize players already marked 'onPitch: true' for the pitch
            loadedPlayers.forEach(p => {
                if (p.onPitch && pitchCandidates.length < 11) {
                    pitchCandidates.push({ ...p, onPitch: true });
                } else {
                    benchCandidates.push({ ...p, onPitch: false });
                }
            });

            // If not enough pitch players, pull from bench candidates
            while (pitchCandidates.length < 11 && benchCandidates.length > 0) {
                const playerToMoveToPitch = benchCandidates.shift(); // Take from the start of bench candidates
                pitchCandidates.push({ ...playerToMoveToPitch, onPitch: true });
            }

            // If too many pitch players, move extras to bench
            while (pitchCandidates.length > 11 && pitchCandidates.length > 0) {
                const playerToMoveToBench = pitchCandidates.pop(); // Take from the end of pitch candidates
                benchCandidates.unshift({ ...playerToMoveToBench, onPitch: false }); // Add to start of bench candidates
            }

            // Ensure bench has exactly 4 players (if possible)
            if (benchCandidates.length > 4) {
                benchCandidates = benchCandidates.slice(0, 4);
            } else {
                while (benchCandidates.length < 4 && pitchCandidates.length > 11) {
                    const playerToMoveToBench = pitchCandidates.pop();
                    benchCandidates.push({ ...playerToMoveToBench, onPitch: false });
                }
            }

            // Final check to ensure exactly 11 on pitch and 4 on bench
            // This might still leave some edge cases if total players are < 15 or > 15
            // But assuming 15 players are always loaded:
            const finalPitch = pitchCandidates.slice(0, 11).map(p => ({ ...p, onPitch: true }));
            const finalBench = benchCandidates.slice(0, 4).map(p => ({ ...p, onPitch: false }));

            setSelectedPlayers([...finalPitch, ...finalBench]);


            // eslint-disable-next-line no-shadow
            setSelectedPlayers(currentSelectedPlayers => {
                console.log("--- Initial selectedPlayers state after load ---");
                currentSelectedPlayers.forEach(p => console.log(`Player: ${p ? p.name : 'Empty'}, onPitch: ${p ? p.onPitch : 'N/A'}`));
                console.log("------------------------------------------------");
                return currentSelectedPlayers; // Return the state unchanged after logging
            });


            setCaptainId(userData.captainId || null);
            setViceCaptainId(userData.viceCaptainId || null);

        }
    }, [userData, allPlayers]);

    const updateSelectedPlayersFromDisplay = useCallback((newPlayers) => {
        setSelectedPlayers(newPlayers.filter(Boolean)); // Ensure nulls are filtered out
        // Also update captain/vice-captain if the removed player was one
        if (captainId && !newPlayers.some(p => p && p.id === captainId)) {
            setCaptainId(null);
        }
        if (viceCaptainId && !newPlayers.some(p => p && p.id === viceCaptainId)) {
            setViceCaptainId(null);
        }
    }, [captainId, viceCaptainId]);

    const handlePlayerMoveInSquad = useCallback((draggedPlayer, targetPlayer, targetPositionType) => {
        let currentPlayers = [...selectedPlayers];

        const actualDraggedPlayer = currentPlayers.find(p => p.id === draggedPlayer.id);
        if (!actualDraggedPlayer) return; // Should not happen if player exists in squad

        // Determine if the target is a pitch slot based on targetPositionType (for empty slots)
        const targetIsPitchSlotType = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].includes(targetPositionType);

        // Case 1: Dragging to an empty slot (pitch or bench)
        if (targetPlayer === null) {
            const newPlayers = currentPlayers.map(p => {
                if (p.id === draggedPlayer.id) {
                    return { ...p, onPitch: targetIsPitchSlotType };
                }
                return p;
            });
            setSelectedPlayers(newPlayers);
            return;
        }

        // Case 2: Dragging one player onto another (swap or reorder)
        const draggedPlayerIndex = currentPlayers.findIndex(p => p && p.id === draggedPlayer.id);
        const targetPlayerIndex = currentPlayers.findIndex(p => p && p.id === targetPlayer.id);

        if (draggedPlayerIndex === -1 || targetPlayerIndex === -1) return;

        const actualTargetPlayer = currentPlayers[targetPlayerIndex];

        // Determine if both are on pitch, both on bench, or one of each
        const draggedIsOnPitch = actualDraggedPlayer.onPitch;
        const actualTargetIsOnPitch = actualTargetPlayer.onPitch; 

        if (draggedIsOnPitch && actualTargetIsOnPitch) {
            // Both on pitch: Apply Rule 1 (same position swap)
            if (actualDraggedPlayer.position !== actualTargetPlayer.position) {
                alert(`Rule 1 violation: Cannot swap ${actualDraggedPlayer.name} (${actualDraggedPlayer.position}) with ${actualTargetPlayer.name} (${actualTargetPlayer.position}). Players on the pitch must be swapped with players of the same position.`);
                return;
            }
            // If positions match, perform a simple swap of player objects (onPitch status remains true for both)
            const updatedPlayers = currentPlayers.map(p => {
                if (p.id === draggedPlayer.id) return { ...targetPlayer, onPitch: true };
                if (p.id === targetPlayer.id) return { ...draggedPlayer, onPitch: true };
                return p;
            });
            setSelectedPlayers(updatedPlayers);
        } else if (!draggedIsOnPitch && !actualTargetIsOnPitch) {
            // Both on bench: Reorder bench players (Rule 2 applies for GKP fix)
            // This is a reorder within the bench.
            const newBenchOrder = [...currentPlayers];
            const [removed] = newBenchOrder.splice(draggedPlayerIndex, 1);
            newBenchOrder.splice(targetPlayerIndex, 0, removed);

            // Now, apply Rule 2: GKP always fixed at the start of the bench
            const gkpOnBench = newBenchOrder.find(p => p && p.position === 'Goalkeeper' && !p.onPitch);
            if (gkpOnBench && newBenchOrder.indexOf(gkpOnBench) !== 0) {
                // If GKP exists on bench and is not at index 0, move it to index 0
                const gkpIndex = newBenchOrder.indexOf(gkpOnBench);
                const [gkp] = newBenchOrder.splice(gkpIndex, 1);
                newBenchOrder.unshift(gkp);
            }
            setSelectedPlayers(newBenchOrder); // Update state with reordered bench
        } else {
            // One on pitch, one on bench: This is a direct pitch-bench swap.
            // This is what the click-based substitution also does.
            // The `onPitch` status needs to be toggled for both.
            const updatedPlayers = currentPlayers.map(p => {
                if (p.id === draggedPlayer.id) return { ...p, onPitch: !p.onPitch };
                if (p.id === targetPlayer.id) return { ...p, onPitch: !p.onPitch };
                return p;
            });
            setSelectedPlayers(updatedPlayers);
        }

        // Update captain/vice-captain if their IDs changed positions (this logic is general and fine)
        if (captainId === draggedPlayer.id) {
            setCaptainId(targetPlayer.id);
        } else if (captainId === targetPlayer.id) {
            setCaptainId(draggedPlayer.id);
        }

        if (viceCaptainId === draggedPlayer.id) {
            setViceCaptainId(targetPlayer.id);
        } else if (viceCaptainId === targetPlayer.id) {
            setViceCaptainId(draggedPlayer.id);
        }

    }, [selectedPlayers, captainId, viceCaptainId]);

    const handleSetCaptain = useCallback((player) => {
        if (!player) return;

        const isPlayerOnPitch = selectedPlayers.slice(0, 11).some(p => p && p.id === player.id); // Check if in first 11
        if (!isPlayerOnPitch) {
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
    }, [captainId, viceCaptainId, selectedPlayers]);

    const handleSetViceCaptain = useCallback((player) => {
        if (!player) return;

        const isPlayerOnPitch = selectedPlayers.slice(0, 11).some(p => p && p.id === player.id); // Check if in first 11
        if (!isPlayerOnPitch) {
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
    }, [captainId, viceCaptainId, selectedPlayers]);

    // New function to handle the "Substitution Mode" button toggle
    const handleToggleSubstitutionMode = useCallback(() => {
        setSubstitutionMode(prevMode => !prevMode);
        setPlayerToSubstitute(null); // Always clear selected player when toggling mode
    }, []);

    // New function to handle clicks on players when in substitution mode
    const handlePlayerClick = useCallback((clickedPlayer) => {
        if (!substitutionMode) return; // Only process if in substitution mode

        if (clickedPlayer === null) {
            // Clicking an empty slot while in substitution mode does nothing.
            return;
        }

        if (!playerToSubstitute) {
            // First player selected for substitution (must be on pitch)
            if (!clickedPlayer.onPitch) {
                // If not on pitch, do nothing (no alert, just don't select it)
                return;
            }
            setPlayerToSubstitute(clickedPlayer);
        } else {
            // Second player selected for substitution (playerToSubstitute is already set)
            if (clickedPlayer.id === playerToSubstitute.id) {
                // Clicking the same player again cancels selection
                setPlayerToSubstitute(null);
                return;
            }

            // Validate swap (pitch <-> bench only)
            if (playerToSubstitute.onPitch === clickedPlayer.onPitch) {
                // Both are on pitch or both are on bench, invalid swap for click mode
                // Do nothing, visual feedback (no swap) is sufficient
                return;
            }

            // Perform the swap
            const updatedPlayers = selectedPlayers.map(p => {
                if (p.id === playerToSubstitute.id) {
                    return { ...p, onPitch: !p.onPitch };
                }
                if (p.id === clickedPlayer.id) {
                    return { ...p, onPitch: !p.onPitch };
                }
                return p;
            });

            setSelectedPlayers(updatedPlayers);

            // Update captain/vice-captain if involved in swap
            if (captainId === playerToSubstitute.id) {
                setCaptainId(clickedPlayer.id);
            } else if (captainId === clickedPlayer.id) {
                setCaptainId(playerToSubstitute.id);
            }

            if (viceCaptainId === playerToSubstitute.id) {
                setViceCaptainId(clickedPlayer.id);
            } else if (viceCaptainId === clickedPlayer.id) {
                setViceCaptainId(playerToSubstitute.id);
            }

            // Reset substitution mode after successful swap
            setSubstitutionMode(false);
            setPlayerToSubstitute(null);
        }
    }, [substitutionMode, playerToSubstitute, selectedPlayers, captainId, viceCaptainId]);

    const handleSaveLineupChanges = useCallback(() => {
        const pitchPlayersCount = selectedPlayers.filter(p => p && p.onPitch).length;
        const benchPlayersCount = selectedPlayers.filter(p => p && !p.onPitch).length;

        if (pitchPlayersCount !== 11 || benchPlayersCount !== 4) {
            alert("Your team must have exactly 11 players on the pitch and 4 on the bench to save.");
            return;
        }

        // Check if captain and vice-captain are still valid (on the pitch)
        const isCaptainOnPitch = selectedPlayers.some(p => p && p.id === captainId && p.onPitch);
        const isViceCaptainOnPitch = selectedPlayers.some(p => p && p.id === viceCaptainId && p.onPitch);

        if (captainId && !isCaptainOnPitch) {
            alert("Captain must be on the pitch. Please re-assign or move them to the pitch.");
            return;
        }
        if (viceCaptainId && !isViceCaptainOnPitch) {
            alert("Vice-Captain must be on the pitch. Please re-assign or move them to the pitch.");
            return;
        }

        if (captainId && viceCaptainId && captainId === viceCaptainId) {
            alert("Captain and Vice-Captain must be different players.");
            return;
        }

        // Save players with their onPitch status
        const playersToSave = selectedPlayers.filter(Boolean).map(p => ({ id: p.id, onPitch: p.onPitch }));

        setUserData({
            ...userData,
            players: playersToSave, // Save the updated players array (with onPitch)
            captainId: captainId,
            viceCaptainId: viceCaptainId,
            budget: userData.budget
        });
        alert("Lineup changes saved!");
    }, [selectedPlayers, captainId, viceCaptainId, userData, setUserData]);


    const handleResetTeam = useCallback(() => {
        if (userData && allPlayers.length > 0) {
            const initialSelection = userData.players.map(playerData => { // userData.players now stores {id, onPitch}
                const player = allPlayers.find(p => p.id === playerData.id);
                return player ? { ...player, onPitch: playerData.onPitch } : null; // Re-add onPitch from loaded data
            }).filter(Boolean);
            setSelectedPlayers(initialSelection);
            setSubstitutionMode(false);
            setPlayerToSubstitute(null);
            alert("Team reset to last saved state.");
        }
    }, [userData, allPlayers]);


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
                        onRemove={updateSelectedPlayersFromDisplay}
                        allTeams={allTeams}
                        allFixtures={allFixtures}
                        onPlayerDrop={handlePlayerMoveInSquad}
                        budget={currentBudgetRemaining}
                        isInitialPick={false}
                        onPositionClick={() => {}}
                        allAvailablePlayers={allPlayers}
                        onUpdateSelectedPlayers={updateSelectedPlayersFromDisplay}
                        onResetTeam={handleResetTeam}
                        captainId={captainId}
                        viceCaptainId={viceCaptainId}
                        onSetCaptain={handleSetCaptain}
                        onSetViceCaptain={handleSetViceCaptain}
                        substitutionMode={substitutionMode}
                        playerToSubstitute={playerToSubstitute}
                        onPlayerClick={handlePlayerClick}
                    />
                    <ButtonContainer>
                        <ActionButton
                            onClick={handleToggleSubstitutionMode}
                            style={{
                                backgroundColor: substitutionMode ? '#e74c3c' : '#007bff', // Red when active, blue when inactive
                            }}
                        >
                            {substitutionMode ? 'Exit Substitution Mode' : 'Enter Substitution Mode'}
                        </ActionButton>
                        <ActionButton onClick={handleSaveLineupChanges}>
                            Save Your Team
                        </ActionButton>
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
