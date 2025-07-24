// src/components/SelectedTeamDisplay.js
import React, { useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import PlayerJersey from './PlayerJersey';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const PitchContainer = styled.div`
    /* Use the provided stadium image as background */
    background-image: url('${process.env.PUBLIC_URL}/images/stade2.jpg'); /* Using stade2.jpg as per previous context */
    background-size: cover; /* Cover the entire container */
    background-position: center; /* Center the image */
    background-repeat: no-repeat;
    background-color: #008000; /* Fallback color if image fails */

    border-radius: 10px;
    padding: 15px;
    margin-top: 0;
    position: relative;
    aspect-ratio: 3 / 4;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    min-height: 500px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    border: 1px solid #4CAF50; /* Keep a subtle outer border */

    /* All internal pitch lines and elements are now part of the background image.
       No CSS styling for them here. */

    @media (max-width: 768px) {
        min-height: 400px;
        padding: 10px;
    }
`;

const PositionRow = styled.div`
    display: flex;
    justify-content: center;
    gap: 15px;
    width: 100%;
    padding: 5px 0;
    z-index: 2; /* Players above background image */

    &.goalkeeper-row { margin-bottom: 20px; }
    &.defender-row { margin-bottom: 15px; }
    &.midfielder-row { margin-bottom: 15px; }
    &.forward-row { margin-top: 20px; }
`;

const EmptySlot = styled.div`
    width: 95px;
    height: 100px;
    border: 2px dashed rgba(255,255,255,0.6); /* Dashed border for empty slots */
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    position: relative;

    .slot-position-abbr {
        font-size: 1.5em;
        font-weight: bold;
        color: rgba(255,255,255,0.8);
        margin-bottom: 5px;
        text-shadow: 0 0 3px rgba(0,0,0,0.8);
    }

    .plus-icon {
        color: rgba(255,255,255,0.8);
        font-size: 1.8em;
    }

    &:hover {
        border-color: #fff;
        .slot-position-abbr, .plus-icon {
            color: #fff;
        }
    }
`;

const BenchContainer = styled.div`
    background-color: #f0f2f5;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    padding: 15px;
    margin-top: 20px;
    width: 100%;
    text-align: center;
    border: 1px solid #ddd;

    h4 {
        color: #333;
        margin-bottom: 10px;
        font-size: 1.1em;
    }

    .bench-players {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
    }
`;

const EmptyDropTarget = ({ positionType, onPlayerDrop, onPositionClick }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'player',
        drop: (draggedItem) => {
            if (positionType === "Bench" || draggedItem.player.position === positionType) {
                onPlayerDrop(draggedItem.player, null, positionType);
            } else {
                console.warn(`Cannot place a ${draggedItem.player.position} in a ${positionType} slot.`);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }), [positionType, onPlayerDrop]);

    const positionAbbr = {
        Goalkeeper: 'GKP',
        Defender: 'DEF',
        Midfielder: 'MID',
        Forward: 'FWD',
        Bench: 'SUB'
    };

    return (
        <EmptySlot ref={drop} isOver={isOver} onClick={() => onPositionClick(positionType)}>
            <span className="slot-position-abbr">{positionAbbr[positionType]}</span>
            <FontAwesomeIcon icon={faPlus} className="plus-icon" />
        </EmptySlot>
    );
};


function SelectedTeamDisplay({ selectedPlayers, onRemove, allTeams, onPlayerDrop, isInitialPick, onPositionClick }) {
    const [startingXI, setStartingXI] = useState({
        Goalkeeper: [],
        Defender: [],
        Midfielder: [],
        Forward: []
    });
    const [benchPlayers, setBenchPlayers] = useState([]);

    useEffect(() => {
        const newStartingXI = {
            Goalkeeper: [],
            Defender: [],
            Midfielder: [],
            Forward: []
        };
        const newBenchPlayers = [];

        const mutableSelectedPlayers = [...selectedPlayers];

        const playersByPosition = {
            Goalkeeper: mutableSelectedPlayers.filter(p => p.position === 'Goalkeeper'),
            Defender: mutableSelectedPlayers.filter(p => p.position === 'Defender'),
            Midfielder: mutableSelectedPlayers.filter(p => p.position === 'Midfielder'),
            Forward: mutableSelectedPlayers.filter(p => p.position === 'Forward')
        };

        const formationLimits = isInitialPick ? {
            Goalkeeper: 2,
            Defender: 5,
            Midfielder: 5,
            Forward: 3
        } : {
            Goalkeeper: 1,
            Defender: 4,
            Midfielder: 4,
            Forward: 2
        };

        while (newStartingXI.Goalkeeper.length < formationLimits.Goalkeeper && playersByPosition.Goalkeeper.length > 0) {
            newStartingXI.Goalkeeper.push(playersByPosition.Goalkeeper.shift());
        }

        while (newStartingXI.Defender.length < formationLimits.Defender && playersByPosition.Defender.length > 0) {
            newStartingXI.Defender.push(playersByPosition.Defender.shift());
        }

        while (newStartingXI.Midfielder.length < formationLimits.Midfielder && playersByPosition.Midfielder.length > 0) {
            newStartingXI.Midfielder.push(playersByPosition.Midfielder.shift());
        }

        while (newStartingXI.Forward.length < formationLimits.Forward && playersByPosition.Forward.length > 0) {
            newStartingXI.Forward.push(playersByPosition.Forward.shift());
        }

        if (!isInitialPick) {
            newBenchPlayers.push(
                ...playersByPosition.Goalkeeper,
                ...playersByPosition.Defender,
                ...playersByPosition.Midfielder,
                ...playersByPosition.Forward
            );
        }

        for (const pos in newStartingXI) {
            const currentPlayersInPos = newStartingXI[pos].length;
            const requiredSlots = formationLimits[pos];
            for (let i = currentPlayersInPos; i < requiredSlots; i++) {
                newStartingXI[pos].push(null);
            }
        }

        setStartingXI(newStartingXI);
        setBenchPlayers(newBenchPlayers);

    }, [selectedPlayers, isInitialPick]);


    const handlePlayerMoveInSquad = useCallback((draggedPlayer, targetPlayer, targetPositionType) => {
        const isAlreadySelected = selectedPlayers.some(p => p.id === draggedPlayer.id);

        if (!targetPlayer) {
            if (isAlreadySelected && targetPositionType !== "Bench") {
                console.log(`Repositioning ${draggedPlayer.name} on pitch. This requires finding its current slot and setting it to null, then adding to new slot. Full logic not implemented.`);
                return;
            }
            if (isAlreadySelected && targetPositionType === "Bench") {
                console.log(`Substituting out ${draggedPlayer.name} to bench. Full logic not implemented.`);
                return;
            }
            if (!isAlreadySelected) {
                if (selectedPlayers.length >= 15) {
                    alert('Squad is full! Maximum 15 players allowed.');
                    return;
                }
                if (targetPositionType === "Bench" || draggedPlayer.position === targetPositionType) {
                    onPlayerDrop(draggedPlayer, null, targetPositionType);
                } else {
                    alert(`Cannot place a ${draggedPlayer.position} in a ${targetPositionType} slot.`);
                }
            }
            return;
        }

        console.log(`Attempted to swap ${draggedPlayer.name} with ${targetPlayer.name}. Full swap logic requires more complex state management.`);

    }, [selectedPlayers, onPlayerDrop]);


    return (
        <>
            <PitchContainer>
                {/* No CSS-drawn pitch lines or elements here. The image provides them. */}

                {/* Forwards Row */}
                <PositionRow className="forward-row">
                    {startingXI.Forward.map((player, index) => (
                        <PlayerJersey
                            key={player ? player.id : `fwd-empty-${index}`}
                            player={player}
                            position="Forward"
                            onRemove={onRemove}
                            onMovePlayer={handlePlayerMoveInSquad}
                            allTeams={allTeams}
                            onPositionClick={onPositionClick}
                        />
                    ))}
                </PositionRow>

                {/* Midfielders Row */}
                <PositionRow className="midfielder-row">
                    {startingXI.Midfielder.map((player, index) => (
                        <PlayerJersey
                            key={player ? player.id : `mid-empty-${index}`}
                            player={player}
                            position="Midfielder"
                            onRemove={onRemove}
                            onMovePlayer={handlePlayerMoveInSquad}
                            allTeams={allTeams}
                            onPositionClick={onPositionClick}
                        />
                    ))}
                </PositionRow>

                {/* Defenders Row */}
                <PositionRow className="defender-row">
                    {startingXI.Defender.map((player, index) => (
                        <PlayerJersey
                            key={player ? player.id : `def-empty-${index}`}
                            player={player}
                            position="Defender"
                            onRemove={onRemove}
                            onMovePlayer={handlePlayerMoveInSquad}
                            allTeams={allTeams}
                            onPositionClick={onPositionClick}
                        />
                    ))}
                </PositionRow>

                {/* Goalkeeper Row */}
                <PositionRow className="goalkeeper-row">
                    {startingXI.Goalkeeper.map((player, index) => (
                        <PlayerJersey
                            key={player ? player.id : `gk-empty-${index}`}
                            player={player}
                            position="Goalkeeper"
                            onRemove={onRemove}
                            onMovePlayer={handlePlayerMoveInSquad}
                            allTeams={allTeams}
                            onPositionClick={onPositionClick}
                        />
                    ))}
                </PositionRow>

                {selectedPlayers.length === 0 && (
                    <p style={{ color: 'white', fontSize: '1em', marginTop: '20px', zIndex: 3, textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                        Drag players from the list to build your team!
                    </p>
                )}
            </PitchContainer>

            {/* Bench Area - Conditionally render based on isInitialPick */}
            {!isInitialPick && (
                <BenchContainer>
                    <h4>Bench ({benchPlayers.length}/4)</h4>
                    <div className="bench-players">
                        {benchPlayers.map((player, index) => (
                            <PlayerJersey
                                key={player ? player.id : `bench-player-empty-${index}`}
                                player={player}
                                position={player.position}
                                onRemove={onRemove}
                                onMovePlayer={handlePlayerMoveInSquad}
                                allTeams={allTeams}
                                isBench={true}
                                onPositionClick={onPositionClick}
                            />
                        ))}
                        {Array.from({ length: 4 - benchPlayers.length }).map((_, index) => (
                            <EmptyDropTarget
                                key={`bench-empty-${index}`}
                                positionType="Bench"
                                onPlayerDrop={onPlayerDrop}
                                onPositionClick={onPositionClick}
                            />
                        ))}
                    </div>
                </BenchContainer>
            )}
        </>
    );
}

export default SelectedTeamDisplay;
