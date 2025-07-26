// src/pages/PickTeam.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Re-added FontAwesomeIcon
import { faPlus } from '@fortawesome/free-solid-svg-icons'; // Re-added faPlus

import PlayerSearchFilter from '../components/PlayerSearchFilter';
import PlayerCard from '../components/PlayerCard';
import SelectedTeamDisplay from '../components/SelectedTeamDisplay';

import { ButtonContainer, ActionButton } from '../components/SelectedTeamDisplay';

const PickTeamContainer = styled.div`
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
    background-color: #1a002b; /* Match Transfers.js */
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3); /* Match Transfers.js */
    min-width: 300px;
    color: white; /* Match Transfers.js */

    h2 {
        color: white; /* Match Transfers.js */
        font-size: 1.8em;
        margin-bottom: 5px;
    }

    p {
        color: #cccccc; /* Match Transfers.js */
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
    gap: 5px; /* Match Transfers.js */
    margin-top: 20px;
    max-height: 700px;
    overflow-y: auto;
    overflow-x: hidden; /* Match Transfers.js */
    padding-right: 5px; /* Match Transfers.js */
    direction: ltr; /* Match Transfers.js */

    /* Custom scrollbar styling (vertical) */
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: #33004a; /* Match Transfers.js */
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #884dff; /* Match Transfers.js */
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #6a11cb; /* Match Transfers.js */
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

const TRANSFER_PITCH_LIMITS = { Goalkeeper: 2, Defender: 5, Midfielder: 5, Forward: 3 };

function PickTeam({ userData, allPlayers, allTeams, allFixtures, setUserData, onInitialSave, currentUser }) {
    // selectedPlayers will now hold full player objects, PickTeam doesn't care about onPitch initially
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [filters, setFilters] = useState({ search: '', position: 'All', team: 'All', cost: 'All', points: 'All' });
    const [sortOrder, setSortOrder] = useState({ key: 'totalPoints', direction: 'desc' });

    const initialBudget = 100.0;
    const maxPlayers = 15;
    const maxPlayersPerTeam = 3;

    const currentTeamCost = selectedPlayers.reduce((sum, player) => sum + (player ? player.cost : 0), 0);
    const currentBudgetRemaining = (initialBudget - currentTeamCost).toFixed(1);

    // Initialize selectedPlayers only if userData is available and players exist
    useEffect(() => {
        if (userData && userData.players && userData.players.length > 0 && allPlayers.length > 0) {
            // For initial pick, we just need the players, their onPitch status is determined on save.
            const initialSelection = userData.players.map(playerData =>
                allPlayers.find(p => p.id === playerData.id)
            ).filter(Boolean);
            setSelectedPlayers(initialSelection);
        } else {
            // For a brand new user, or if userData.players is empty/invalid
            setSelectedPlayers([]);
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

        const playersFromSameTeam = selectedPlayers.filter(p => p.team === player.team).length;
        if (playersFromSameTeam >= maxPlayersPerTeam) {
            const teamName = allTeams.find(t => t.id === player.team)?.name || player.team;
            alert(`You can only have a maximum of ${maxPlayersPerTeam} players from ${teamName}.`);
            return;
        }

        // Enforce position limits for the 15-player display as per Transfers page
        const currentPositionCount = selectedPlayers.filter(p => p.position === player.position).length;
        const maxAllowedForPosition = TRANSFER_PITCH_LIMITS[player.position];

        if (player.position === 'Goalkeeper' && currentPositionCount >= TRANSFER_PITCH_LIMITS.Goalkeeper) {
            alert(`You already have ${currentPositionCount} ${player.position}s. You can have a maximum of ${TRANSFER_PITCH_LIMITS.Goalkeeper} Goalkeepers.`);
            return;
        } else if (player.position !== 'Goalkeeper' && currentPositionCount >= maxAllowedForPosition) {
             alert(`You already have ${currentPositionCount} ${player.position}s. You can have a maximum of ${maxAllowedForPosition} ${player.position}s.`);
             return;
        }

        if (parseFloat(currentBudgetRemaining) < player.cost) {
            alert(`Not enough budget to add ${player.name}. You need $${(player.cost - parseFloat(currentBudgetRemaining)).toFixed(1)}M more.`);
            return;
        }

        setSelectedPlayers(prev => [...prev, player]);

    }, [selectedPlayers, currentBudgetRemaining, maxPlayers, maxPlayersPerTeam, allTeams]);


    const handleRemovePlayer = useCallback((playerToRemove) => {
        setSelectedPlayers(prev => prev.filter(p => p.id !== playerToRemove.id));
    }, []);

    const updateSelectedPlayersFromDisplay = useCallback((newPlayers) => {
        // This is called by SelectedTeamDisplay when a player is removed via its own 'x' button
        // or during a drag-and-drop within the display.
        setSelectedPlayers(newPlayers.filter(Boolean)); // Ensure nulls are filtered out
    }, []);


    const handlePlayerDrop = useCallback((player, targetPlayer, targetPosition) => {
        // This logic is for adding a player from the filter list to the squad
        // or reordering players already in the squad via drag and drop.
        if (!selectedPlayers.some(p => p.id === player.id)) {
            handleAddPlayer(player); // This function already has the squad limits
        } else {
            // This case handles reordering players within the selected squad by dropping
            // one player onto another or an empty slot on the pitch/bench.
            // The actual re-arrangement logic will be handled by SelectedTeamDisplay's onMovePlayer.
            // This parent PickTeam only cares about the final 'selectedPlayers' array.
            // SelectedTeamDisplay will call updateSelectedPlayersFromDisplay to sync.
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
        const finalBudget = (initialBudget - currentTeamCost).toFixed(1);

        // Assign onPitch status for all 15 players (all true for initial display)
        // This will be saved to Firestore by App.js
        const playersWithOnPitchStatus = selectedPlayers.map(p => ({ ...p, onPitch: true }));

        onInitialSave(playersWithOnPitchStatus, finalBudget);
    };


    const handleResetTeam = useCallback(() => {
        setSelectedPlayers([]);
        setFilters({ search: '', position: 'All', team: 'All', cost: 'All', points: 'All' });
        setSortOrder({ key: 'totalPoints', direction: 'desc' });
        alert("Team reset locally. Click 'Save Initial Team' to confirm.");
    }, []);

    // Auto Pick functionality for PickTeam page (for initial team selection)
    const handleAutoPickTeam = useCallback(() => {
        let newSquad = [];
        let currentBudget = initialBudget;
        const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
        const playersAddedCount = { Goalkeeper: 0, Defender: 0, Midfielder: 0, Forward: 0 };

        const shuffledPlayers = [...allPlayers].sort(() => 0.5 - Math.random());

        for (const pos of positions) {
            const needed = TRANSFER_PITCH_LIMITS[pos];
            if (needed <= 0) continue;

            let availableForPos = shuffledPlayers.filter(
                p => p.position === pos &&
                     !newSquad.some(sp => sp.id === p.id) &&
                     newSquad.filter(sp => sp.team === p.team).length < maxPlayersPerTeam
            );

            availableForPos.sort((a, b) => {
                if (a.cost !== b.cost) return a.cost - b.cost;
                return b.totalPoints - a.totalPoints;
            });

            for (let i = 0; i < needed; i++) {
                if (newSquad.length >= maxPlayers) break;

                let playerAdded = false;
                for (let j = 0; j < availableForPos.length; j++) {
                    const player = availableForPos[j];

                    if (currentBudget >= player.cost &&
                        newSquad.filter(sp => sp.team === player.team).length < maxPlayersPerTeam) {

                        newSquad.push(player);
                        currentBudget = parseFloat((currentBudget - player.cost).toFixed(1));
                        playersAddedCount[pos]++;
                        availableForPos.splice(j, 1);
                        playerAdded = true;
                        break;
                    }
                }
                if (!playerAdded && newSquad.length < maxPlayers) {
                    console.warn(`Could not find an affordable/eligible player for ${pos} slot #${i + 1}`);
                }
            }
            if (newSquad.length >= maxPlayers) break;
        }

        if (newSquad.length < maxPlayers) {
            alert(`Auto Pick couldn't fill the entire squad. Filled ${newSquad.length}/${maxPlayers} slots. Please add more players manually.`);
        } else {
             alert(`Auto Pick completed! Squad filled with ${newSquad.length} players. Click Save Initial Team to save.`);
        }

        setSelectedPlayers(newSquad);

    }, [allPlayers, initialBudget, maxPlayers, maxPlayersPerTeam]);


    if (!userData || allPlayers.length === 0 || allTeams.length === 0 || allFixtures.length === 0) {
        return <PickTeamContainer>Loading player data...</PickTeamContainer>;
    }

    const playersByPosition = {
        Goalkeeper: filteredPlayers.filter(p => p.position === 'Goalkeeper'),
        Defender: filteredPlayers.filter(p => p.position === 'Defender'),
        Midfielder: filteredPlayers.filter(p => p.position === 'Midfielder'),
        Forward: filteredPlayers.filter(p => p.position === 'Forward'),
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <PickTeamContainer> {/* No isInitialPick prop here, it's always initial pick */}
                <PlayerSelectionArea>
                    <h2>Select Your Squad</h2>
                    <p>Budget: ${currentBudgetRemaining}M | Players: {selectedPlayers.length}/{maxPlayers}</p>
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
                                                    key={player.id}
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
                <TeamDisplayArea> {/* No isInitialPick prop here, it's always initial pick */}
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
                        isInitialPick={true} // Always true for PickTeam
                        onPositionClick={handlePositionFilterClick}
                        allAvailablePlayers={allPlayers}
                        onUpdateSelectedPlayers={updateSelectedPlayersFromDisplay}
                        onResetTeam={handleResetTeam}
                        // Captaincy and substitution props are not passed to SelectedTeamDisplay from PickTeam
                        // as these features are only for MyTeam.
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
                        <ActionButton
                            onClick={handleSaveTeam}
                            disabled={selectedPlayers.length !== maxPlayers}
                            style={{
                                opacity: selectedPlayers.length === maxPlayers ? 1 : 0.5,
                            }}
                        >
                            Save Your Team
                        </ActionButton>
                    </ButtonContainer>
                </TeamDisplayArea>
            </PickTeamContainer>
        </DndProvider>
    );
}

export default PickTeam;
