// src/pages/Transfers.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import PlayerSearchFilter from '../components/PlayerSearchFilter';
import PlayerCard from '../components/PlayerCard';
import SelectedTeamDisplay from '../components/SelectedTeamDisplay';

import { ButtonContainer, ActionButton } from '../components/SelectedTeamDisplay';

const TransfersContainer = styled.div`
    display: flex;
    gap: 20px;
    padding: 20px;
    max-width: 1200px; /* Default max-width for initial pick view */
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
    background-color: #1a002b;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    min-width: 300px;
    color: white;

    h2 {
        color: white;
        font-size: 1.8em;
        margin-bottom: 5px;
    }

    p {
        color: #cccccc;
        font-size: 0.9em;
        margin-top: 0;
        margin-bottom: 20px;
    }

    @media (max-width: 768px) {
        flex: auto;
        width: 100%;
        padding: 15px;
    }
`;

const PlayerList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 20px;
    max-height: 700px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 5px;
    direction: ltr;

    /* Custom scrollbar styling (vertical) */
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: #33004a;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #884dff;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #6a11cb;
    }

    @media (max-width: 768px) {
        max-height: 500px;
    }
`;

const PlayerListItemWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 10px; /* Space between player card and add button */
    padding: 5px 0;
    direction: ltr;
    width: 100%;
`;

const AddButtonCircle = styled.button`
    background-color: ${props => props.isAdded ? '#4a005c' : '#6a11cb'};
    color: white;
    border: none;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    font-size: 1.5em;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ${props => props.isAdded ? 'not-allowed' : 'pointer'};
    transition: background-color 0.2s ease;
    flex-shrink: 0;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);

    &:hover {
        background-color: ${props => props.isAdded ? '#4a005c' : '#5a009a'};
    }
    &:disabled {
        background-color: #4a005c;
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

const PositionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #1a002b;
    padding: 10px 15px;
    margin-top: 15px;
    border-radius: 5px;
    border-bottom: 1px solid #4a005c;
    direction: ltr;
    margin-right: 0;

    h3 {
        color: white;
        font-size: 1em;
        margin: 0;
        text-transform: uppercase;
    }
`;

const HeaderStats = styled.div`
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    align-items: center;

    span {
        color: #cccccc;
        font-size: 0.8em;
        font-weight: normal;
        min-width: 40px;
        text-align: right;
    }
`;

// Define fixed limits for positions on the Transfers pitch
const TRANSFER_PITCH_LIMITS = { Goalkeeper: 2, Defender: 5, Midfielder: 5, Forward: 3 };

function Transfers({ userData, allPlayers, allTeams, allFixtures, setUserData }) {
    // selectedPlayers will now hold objects { id: playerId, onPitch: boolean }
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [filters, setFilters] = useState({ search: '', position: 'All', team: 'All', cost: 'All', points: 'All' });
    const [sortOrder, setSortOrder] = useState({ key: 'totalPoints', direction: 'desc' });

    const initialBudget = 100.0; // This is the starting budget, not necessarily current
    const maxPlayers = 15;
    const maxPlayersPerTeam = 3;

    // Removed currentTeamCost as it's not directly used
    const currentBudgetRemaining = (userData?.budget !== undefined ? userData.budget : initialBudget).toFixed(1);


    useEffect(() => {
        if (userData && allPlayers.length > 0) {
            // Map stored player IDs to full player objects, preserving onPitch status
            // For Transfers, we treat all existing players as "onPitch" for display purposes
            // as the Transfers page shows a full 15-player pitch.
            const initialSelection = userData.players.map(playerData => {
                const player = allPlayers.find(p => p.id === playerData.id);
                return player ? { ...player, onPitch: true } : null; // Set onPitch to true for display
            }).filter(Boolean);
            setSelectedPlayers(initialSelection);
        }
    }, [userData, allPlayers]);

    useEffect(() => {
        let currentPlayers = [...allPlayers];

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
        if (filters.cost !== 'All') {
            const [min, max] = filters.cost.split('-').map(Number);
            currentPlayers = currentPlayers.filter(p => p.cost >= min && p.cost <= max);
        }
        if (filters.points === 'Top 100') {
            currentPlayers.sort((a, b) => b.totalPoints - a.totalPoints);
            currentPlayers = currentPlayers.slice(0, 100);
        }

        currentPlayers.sort((a, b) => {
            const aValue = a[sortOrder.key];
            const bValue = b[sortOrder.key];

            if (sortOrder.direction === 'asc') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        });

        setFilteredPlayers(currentPlayers);
    }, [allPlayers, filters, sortOrder]);

    const handleAddPlayer = useCallback((player) => {
        if (selectedPlayers.some(p => p.id === player.id)) {
            alert(`${player.name} is already in your squad.`);
            return;
        }

        if (selectedPlayers.length >= maxPlayers) {
            alert('Squad is full! Maximum 15 players allowed.');
            return;
        }

        // Check for maximum 3 players from the same team
        const playersFromSameTeam = selectedPlayers.filter(p => p.team === player.team).length;
        if (playersFromSameTeam >= maxPlayersPerTeam) {
            const teamName = allTeams.find(t => t.id === player.team)?.name || player.team;
            alert(`You can only have a maximum of ${maxPlayersPerTeam} players from ${teamName}.`);
            return;
        }

        const currentPositionCount = selectedPlayers.filter(p => p.position === player.position).length;
        const maxAllowedForPosition = TRANSFER_PITCH_LIMITS[player.position];

        if (player.position === 'Goalkeeper' && currentPositionCount >= TRANSFER_PITCH_LIMITS.Goalkeeper) {
            alert(`You already have ${currentPositionCount} ${player.position}s. You can have a maximum of ${TRANSFER_PITCH_LIMITS.Goalkeeper} Goalkeepers.`);
            return;
        } else if (player.position !== 'Goalkeeper' && currentPositionCount >= maxAllowedForPosition) {
             alert(`You already have ${currentPositionCount} ${player.position}s. You can have a maximum of ${maxAllowedForPosition} ${player.position}s.`);
             return;
        }


        // Use userData.budget for current budget check
        if (parseFloat(currentBudgetRemaining) < player.cost) {
            alert(`Not enough budget to add ${player.name}. You need $${(player.cost - parseFloat(currentBudgetRemaining)).toFixed(1)}M more.`);
            return;
        }

        // Add player with onPitch: true for display on the transfers pitch
        setSelectedPlayers(prev => [...prev, { ...player, onPitch: true }]);

    }, [selectedPlayers, currentBudgetRemaining, maxPlayers, maxPlayersPerTeam, allTeams]);

    const handleRemovePlayer = useCallback((playerToRemove) => {
        setSelectedPlayers(prev => prev.filter(p => p.id !== playerToRemove.id));
    }, []);

    const handlePlayerDrop = useCallback((player, targetPlayer, targetPositionType) => {
        // In Transfers, we simply add if not already selected, or do nothing if already selected.
        // The image shows a fixed 15-player display, not dynamic swapping.
        if (!selectedPlayers.some(p => p.id === player.id)) {
            handleAddPlayer(player); // This will update selectedPlayers locally
        } else {
            // If the player is already in the squad, allow re-ordering on the pitch
            const draggedIdx = selectedPlayers.findIndex(p => p && p.id === player.id);
            if (draggedIdx === -1) return;

            let tempSelectedPlayers = [...selectedPlayers];
            const [removedPlayer] = tempSelectedPlayers.splice(draggedIdx, 1);

            if (targetPlayer) {
                const targetIdx = tempSelectedPlayers.findIndex(p => p && p.id === targetPlayer.id);
                if (targetIdx !== -1) {
                    tempSelectedPlayers.splice(targetIdx, 0, removedPlayer);
                } else {
                    tempSelectedPlayers.push(removedPlayer);
                }
            } else {
                tempSelectedPlayers.push(removedPlayer);
            }
            setSelectedPlayers(tempSelectedPlayers);
        }
    }, [selectedPlayers, handleAddPlayer]);


    const updateSelectedPlayersFromDisplay = useCallback((newPlayers) => {
        setSelectedPlayers(newPlayers.filter(Boolean));
    }, []);

    const handleResetTeam = useCallback(() => {
        // Reset to the original userData state
        if (userData && allPlayers.length > 0) {
            const initialSelection = userData.players.map(playerData => {
                const player = allPlayers.find(p => p.id === playerData.id);
                return player ? { ...player, onPitch: true } : null; // Treat all as onPitch for display
            }).filter(Boolean);
            setSelectedPlayers(initialSelection);
            setFilters({ search: '', position: 'All', team: 'All', cost: 'All', points: 'All' });
            setSortOrder({ key: 'totalPoints', direction: 'desc' });
            alert("Your transfers have been reset locally to your last saved team.");
        }
    }, [userData, allPlayers]);

    // This function will now save the transfers to userData
    const handleConfirmTransfers = useCallback(() => {
        if (selectedPlayers.length !== maxPlayers) {
            alert(`Your squad must have exactly ${maxPlayers} players to confirm transfers.`);
            return;
        }

        // When confirming transfers, we need to decide which 11 are on pitch and 4 on bench.
        // For simplicity, let's assume the first 11 players in selectedPlayers array are on pitch,
        // and the remaining 4 are on bench. You might want a more sophisticated logic here.
        const playersToSave = selectedPlayers.map((player, index) => ({
            id: player.id,
            onPitch: index < 11 // First 11 are on pitch, rest are bench
        }));

        // Calculate the new budget based on the selected players' costs
        const newBudget = initialBudget - selectedPlayers.reduce((sum, p) => sum + p.cost, 0);

        setUserData({
            ...userData,
            players: playersToSave, // Save the updated players array with onPitch status
            budget: newBudget // Update budget
            // Captain/Vice-Captain are not managed on this page.
        });

        alert("Transfers confirmed and saved!");
    }, [selectedPlayers, setUserData, userData, initialBudget, maxPlayers]);

    // NEW: Auto Pick functionality for Transfers page
    const handleAutoPickTeam = useCallback(() => {
        let newSquad = []; // Start with an empty squad for auto-pick
        let currentBudget = initialBudget; // Start with initial budget
        const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
        const playersAddedCount = { Goalkeeper: 0, Defender: 0, Midfielder: 0, Forward: 0 };

        // Shuffle all players to ensure randomness for picks
        const shuffledPlayers = [...allPlayers].sort(() => 0.5 - Math.random());

        // Fill each position based on its limit
        for (const pos of positions) {
            const needed = TRANSFER_PITCH_LIMITS[pos];
            if (needed <= 0) continue;

            // Filter players for this position, not already in newSquad, and respecting team limit
            let availableForPos = shuffledPlayers.filter(
                p => p.position === pos &&
                     !newSquad.some(sp => sp.id === p.id) &&
                     newSquad.filter(sp => sp.team === p.team).length < maxPlayersPerTeam
            );

            // Sort available players by cost (cheapest first) to help with budget constraints,
            // then by totalPoints (highest first) as a secondary tie-breaker for quality.
            availableForPos.sort((a, b) => {
                if (a.cost !== b.cost) return a.cost - b.cost;
                return b.totalPoints - a.totalPoints;
            });

            for (let i = 0; i < needed; i++) {
                if (newSquad.length >= maxPlayers) break; // Stop if squad is full

                let playerAdded = false;
                for (let j = 0; j < availableForPos.length; j++) {
                    const player = availableForPos[j];

                    // Check if player can be afforded and adding them won't exceed team limit for the newSquad
                    if (currentBudget >= player.cost &&
                        newSquad.filter(sp => sp.team === player.team).length < maxPlayersPerTeam) {

                        newSquad.push({ ...player, onPitch: true }); // Add with onPitch true for display
                        currentBudget = parseFloat((currentBudget - player.cost).toFixed(1));
                        playersAddedCount[pos]++;
                        availableForPos.splice(j, 1); // Remove this player from available list
                        playerAdded = true;
                        break; // Move to the next needed slot for this position
                    }
                }
                if (!playerAdded && newSquad.length < maxPlayers) {
                    console.warn(`Could not find an affordable/eligible player for ${pos} slot #${i + 1}`);
                }
            }
            if (newSquad.length >= maxPlayers) break; // Break outer loop if squad is full
        }

        if (newSquad.length < maxPlayers) {
            alert(`Auto Pick couldn't fill the entire squad. Filled ${newSquad.length}/${maxPlayers} slots. Please add more players manually.`);
        } else {
             alert(`Auto Pick completed! Squad filled with ${newSquad.length} players. Click Confirm Transfers to save.`);
        }

        setSelectedPlayers(newSquad);

    }, [allPlayers, initialBudget, maxPlayers, maxPlayersPerTeam]);

    // Function to handle clicks on empty slots to filter player list
    const handlePositionFilterClick = useCallback((positionType) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            position: positionType === 'SUB' ? 'All' : positionType
        }));
    }, []);


    if (!userData || allPlayers.length === 0 || allTeams.length === 0 || allFixtures.length === 0) {
        return <TransfersContainer>Loading transfer data...</TransfersContainer>;
    }

    const playersByPosition = {
        Goalkeeper: filteredPlayers.filter(p => p.position === 'Goalkeeper'),
        Defender: filteredPlayers.filter(p => p.position === 'Defender'),
        Midfielder: filteredPlayers.filter(p => p.position === 'Midfielder'),
        Forward: filteredPlayers.filter(p => p.position === 'Forward'),
    };


    return (
        <DndProvider backend={HTML5Backend}>
            <TransfersContainer>
                <PlayerSelectionArea>
                    <h2>Player Selection</h2>
                    <p>Select a maximum of 3 players from a single team or 'Auto Pick' if you're short of time.</p>
                    <PlayerSearchFilter
                        filters={filters}
                        setFilters={setFilters}
                        allTeams={allTeams}
                        setSortOrder={setSortOrder}
                        sortOrder={sortOrder}
                        numPlayersShown={filteredPlayers.length}
                    />
                    <PlayerList>
                        {Object.keys(playersByPosition).map(positionType => (
                            <div key={positionType}>
                                {playersByPosition[positionType].length > 0 && (
                                    <>
                                        <PositionHeader>
                                            <h3>{positionType}s</h3>
                                            <HeaderStats>
                                                <span>Price</span>
                                                <span>Total p...</span>
                                            </HeaderStats>
                                        </PositionHeader>
                                        {playersByPosition[positionType].map(player => (
                                            <PlayerListItemWrapper key={player.id}>
                                                <PlayerCard
                                                    player={player}
                                                    isAdded={selectedPlayers.some(p => p.id === player.id)}
                                                    isListView={true}
                                                    allTeams={allTeams}
                                                />
                                                <AddButtonCircle
                                                    onClick={() => handleAddPlayer(player)}
                                                    isAdded={selectedPlayers.some(p => p.id === player.id)}
                                                    disabled={selectedPlayers.some(p => p.id === player.id)}
                                                >
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </AddButtonCircle>
                                            </PlayerListItemWrapper>
                                        ))}
                                    </>
                                )}
                            </div>
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
                        budget={currentBudgetRemaining}
                        isInitialPick={true} // Always true for Transfers
                        onUpdateSelectedPlayers={updateSelectedPlayersFromDisplay}
                        onResetTeam={handleResetTeam}
                        canRemove={true}
                        onPositionClick={handlePositionFilterClick}
                        // No captaincy or substitution props needed for transfers as per image
                        captainId={null}
                        viceCaptainId={null}
                        onSetCaptain={() => {}}
                        onSetViceCaptain={() => {}}
                        substitutionMode={false}
                        playerToSubstitute={null}
                        onPlayerClickForSubstitution={() => {}}
                        onToggleSubstitutionMode={() => {}}
                    />
                    <ButtonContainer>
                        <ActionButton onClick={handleAutoPickTeam}>Auto Pick</ActionButton>
                        <ActionButton onClick={handleResetTeam}>Reset</ActionButton>
                        <ActionButton onClick={handleConfirmTransfers}>Confirm Transfers</ActionButton>
                    </ButtonContainer>
                </TeamDisplayArea>
            </TransfersContainer>
        </DndProvider>
    );
}

export default Transfers;
