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
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [filters, setFilters] = useState({ search: '', position: 'All', team: 'All', cost: 'All', points: 'All' });
    const [sortOrder, setSortOrder] = useState({ key: 'totalPoints', direction: 'desc' });

    const initialBudget = 100.0;
    const maxPlayers = 15;
    const maxPlayersPerTeam = 3; // Maximum 3 players per team

    useEffect(() => {
        if (userData && allPlayers.length > 0) {
            const initialSelection = userData.players.map(playerId =>
                allPlayers.find(p => p.id === playerId)
            ).filter(Boolean);
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

        if (currentPositionCount >= maxAllowedForPosition) {
            alert(`You already have ${currentPositionCount} ${player.position}s. You can have a maximum of ${maxAllowedForPosition} ${player.position}s on the pitch.`);
            return;
        }

        // If a position filter is active (from clicking an empty slot), enforce it
        if (filters.position !== 'All' && player.position !== filters.position) {
            alert(`You can only add a ${filters.position} to this selected filter. ${player.name} is a ${player.position}.`);
            return;
        }


        const currentBudget = userData ? userData.budget : initialBudget;

        if (currentBudget < player.cost) {
            alert(`Not enough budget to add ${player.name}. You need $${(player.cost - currentBudget).toFixed(1)}M more.`);
            return;
        }

        setSelectedPlayers(prev => [...prev, player]);
        // REMOVED: Immediate setUserData call here. It will be handled by Confirm Transfers.
        // setUserData(prev => ({
        //     ...prev,
        //     players: [...prev.players, player.id],
        //     budget: parseFloat((prev.budget - player.cost).toFixed(1))
        // }));
    }, [selectedPlayers, userData, maxPlayers, initialBudget, filters.position, maxPlayersPerTeam, allTeams]); // Removed setUserData from deps

    const handleRemovePlayer = useCallback((playerToRemove) => {
        setSelectedPlayers(prev => prev.filter(p => p.id !== playerToRemove.id));
        // REMOVED: Immediate setUserData call here. It will be handled by Confirm Transfers.
        // setUserData(prev => ({
        //     ...prev,
        //     players: prev.players.filter(id => id !== playerToRemove.id),
        //     budget: parseFloat((prev.budget + playerToRemove.cost).toFixed(1))
        // }));
    }, []); // Removed setUserData from deps

    const handlePlayerDrop = useCallback((player, targetPlayer, targetPositionType) => {
        // In Transfers, we simply add if not already selected, or do nothing if already selected.
        // The image shows a fixed 15-player display, not dynamic swapping.
        if (!selectedPlayers.some(p => p.id === player.id)) {
            handleAddPlayer(player); // This will update selectedPlayers locally
        } else {
            // If the player is already in the squad, no action is needed on drop.
            // This prevents accidental re-ordering/swapping on the transfers pitch if not intended.
            console.log(`Player ${player.name} is already in the squad.`);
        }
    }, [selectedPlayers, handleAddPlayer]);


    const updateSelectedPlayersFromDisplay = useCallback((newPlayers) => {
        // This function is crucial for keeping the parent state (userData) in sync
        // with changes made within SelectedTeamDisplay (e.g., player removals via remove button).
        // It should update the local selectedPlayers state.
        setSelectedPlayers(newPlayers.filter(Boolean));
        // The actual userData (including budget) in App.js will be updated on Confirm Transfers.
    }, []); // No dependencies on budget/setUserData needed here, as it's a local sync.

    const handleResetTeam = useCallback(() => {
        setSelectedPlayers([]);
        // REMOVED: Immediate setUserData call here. It will be handled by Confirm Transfers.
        // setUserData(prev => ({
        //     ...prev,
        //     players: [],
        //     budget: initialBudget
        // }));
        alert("Your transfers have been reset locally. Click Confirm Transfers to save.");
    }, []); // Removed setUserData from deps

    // This function will now save the transfers to userData
    const handleConfirmTransfers = useCallback(() => {
        if (selectedPlayers.length !== maxPlayers) {
            alert(`Your squad must have exactly ${maxPlayers} players to confirm transfers.`);
            return;
        }

        const currentBudgetRemaining = (initialBudget - selectedPlayers.reduce((sum, p) => sum + p.cost, 0)).toFixed(1);

        // --- MODIFIED: Create the object to be sent to setUserData (updateUserDataInFirestore) ---
        const dataToSave = {
            players: selectedPlayers.map(p => p.id),
            budget: parseFloat(currentBudgetRemaining),
            // Add any other user data fields you want to explicitly save from Transfers page
            // e.g., captainId, viceCaptainId if transfers affects them, but typically not.
            // For now, these are managed in PickTeam.js for MyTeam view.
        };
        setUserData(dataToSave); // Pass the object directly to App.js's updateUserDataInFirestore
        // --- END MODIFIED ---

        alert("Transfers confirmed and saved!");
    }, [selectedPlayers, setUserData, initialBudget, maxPlayers]);

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
                        
                        newSquad.push(player);
                        currentBudget = parseFloat((currentBudget - player.cost).toFixed(1));
                        playersAddedCount[pos]++;
                        availableForPos.splice(j, 1); // Remove this player from available list
                        playerAdded = true;
                        break; // Move to the next needed slot for this position
                    }
                }
                if (!playerAdded && newSquad.length < maxPlayers) {
                    // If no more suitable players for this slot, stop trying for this position
                    // or for this combination (e.g., too expensive, team limit already hit for remaining players).
                    console.warn(`Could not find an affordable/eligible player for ${pos} slot #${i + 1}`);
                }
            }
            if (newSquad.length >= maxPlayers) break; // Break outer loop if squad is full
        }

        // Check if the squad is actually full after auto-picking
        if (newSquad.length < maxPlayers) {
            alert(`Auto Pick couldn't fill the entire squad. Filled ${newSquad.length}/${maxPlayers} slots. Please add more players manually.`);
        } else {
             alert(`Auto Pick completed! Squad filled with ${newSquad.length} players. Click Confirm Transfers to save.`);
        }
       
        // Update local state, but DO NOT call setUserData (which saves to Firebase) here.
        setSelectedPlayers(newSquad);

    }, [allPlayers, initialBudget, maxPlayers, maxPlayersPerTeam]); // Removed userData, setUserData, allTeams from deps.

    // Function to handle clicks on empty slots to filter player list
    const handlePositionFilterClick = useCallback((positionType) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            position: positionType === 'SUB' ? 'All' : positionType // Assuming 'SUB' means no specific filter
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
                        <p className="budget-display">Budget Remaining: ${userData.budget.toFixed(1)}M</p>
                    </TeamInfoBar>

                    <SelectedTeamDisplay
                        selectedPlayers={selectedPlayers}
                        onRemove={handleRemovePlayer}
                        allTeams={allTeams}
                        allFixtures={allFixtures}
                        onPlayerDrop={handlePlayerDrop}
                        budget={userData.budget}
                        isInitialPick={true}
                        onUpdateSelectedPlayers={updateSelectedPlayersFromDisplay}
                        onResetTeam={handleResetTeam}
                        canRemove={true}
                        onPositionClick={handlePositionFilterClick}
                        // No captaincy or substitution props needed for transfers as per image
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