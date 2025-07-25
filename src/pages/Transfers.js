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
    max-width: 1200px;
    margin: 20px 0;
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
    gap: 10px;
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
    gap: 30px;
    justify-content: flex-end;
    align-items: center;
    margin-right: 30px;

    span {
        color: #cccccc;
        font-size: 0.8em;
        font-weight: normal;
        min-width: 40px; /* MODIFIED: Reduced min-width for Price and Total p... headers */
        text-align: right;
    }
`;


function Transfers({ userData, allPlayers, allTeams, allFixtures, setUserData }) {
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [filters, setFilters] = useState({ search: '', position: 'All', team: 'All', cost: 'All', points: 'All' });
    const [sortOrder, setSortOrder] = useState({ key: 'totalPoints', direction: 'desc' });

    const initialBudget = 100.0;
    const maxPlayers = 15;


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

        const currentBudget = userData ? userData.budget : initialBudget;

        if (currentBudget < player.cost) {
            alert(`Not enough budget to add ${player.name}. You need $${(player.cost - currentBudget).toFixed(1)}M more.`);
            return;
        }

        setSelectedPlayers(prev => [...prev, player]);
        setUserData(prev => ({
            ...prev,
            players: [...prev.players, player.id],
            budget: parseFloat((prev.budget - player.cost).toFixed(1))
        }));
    }, [selectedPlayers, userData, setUserData, maxPlayers, initialBudget]);


    const handleRemovePlayer = useCallback((playerToRemove) => {
        setSelectedPlayers(prev => prev.filter(p => p.id !== playerToRemove.id));
        setUserData(prev => ({
            ...prev,
            players: prev.players.filter(id => id !== playerToRemove.id),
            budget: parseFloat((prev.budget + playerToRemove.cost).toFixed(1))
        }));
    }, [setUserData]);

    const handlePlayerDrop = useCallback((player, targetPlayer, targetPositionType) => {
        if (!selectedPlayers.some(p => p.id === player.id)) {
            handleAddPlayer(player);
        } else {
            console.log(`Transfer: Attempted to move or swap ${player.name}.`);
        }
    }, [selectedPlayers, handleAddPlayer]);


    const updateSelectedPlayersFromDisplay = useCallback((newPlayers) => {
        const totalCost = newPlayers.reduce((sum, player) => sum + (player ? player.cost : 0), 0);
        const newBudget = (initialBudget - totalCost).toFixed(1);

        setSelectedPlayers(newPlayers.filter(Boolean));
        setUserData(prev => ({
            ...prev,
            players: newPlayers.filter(Boolean).map(p => p.id),
            budget: parseFloat(newBudget)
        }));
    }, [initialBudget, setUserData]);

    const handleResetTeam = useCallback(() => {
        setSelectedPlayers([]);
        setUserData(prev => ({
            ...prev,
            players: [],
            budget: initialBudget
        }));
    }, [setUserData, initialBudget]);

    const handleConfirmTransfers = useCallback(() => {
        alert("Confirm Transfers clicked! (Implement actual transfer saving logic here)");
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
                                                <span>Points</span>
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
                    />
                    <ButtonContainer>
                        <ActionButton onClick={handleConfirmTransfers}>Confirm Transfers</ActionButton>
                    </ButtonContainer>
                </TeamDisplayArea>
            </TransfersContainer>
        </DndProvider>
    );
}

export default Transfers;