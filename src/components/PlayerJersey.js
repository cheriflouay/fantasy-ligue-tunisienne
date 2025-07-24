// src/components/PlayerJersey.js
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useDrag, useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

const JerseyContainer = styled.div`
    background-color: transparent;
    border-radius: 8px;
    padding: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 95px;
    height: 100px;
    cursor: ${props => props.isEmpty ? 'pointer' : 'grab'};
    position: relative;
    opacity: ${props => props.isDragging ? 0.5 : 1};
    transition: all 0.2s ease-in-out;
    font-family: 'Inter', sans-serif;
    overflow: hidden;

    /* Empty slot styling */
    ${props => props.isEmpty && `
        border: 2px dashed rgba(255,255,255,0.6);
        background-color: transparent;
        color: rgba(255,255,255,0.8);
        font-weight: bold;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-shadow: 0 0 3px rgba(0,0,0,0.8);

        &:hover {
            border-color: #fff;
            color: #fff;
            .plus-icon {
                color: #fff;
            }
        }

        .slot-position-abbr {
            font-size: 1.5em;
            margin-bottom: 5px;
        }
        .plus-icon {
            font-size: 1.8em;
            color: rgba(255,255,255,0.8);
        }
    `}

    /* Jersey image as background (for players) */
    .jersey-image-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url(${props => props.jerseyImage});
        background-size: 80%;
        background-position: center 10px;
        background-repeat: no-repeat;
        z-index: 1;
    }

    .jersey-content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 100%;
        padding: 5px;
        box-sizing: border-box;
    }

    .top-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0 5px;
        margin-bottom: auto;
    }

    .team-abbr {
        background-color: rgba(0,0,0,0.6);
        color: white;
        font-size: 0.65em;
        font-weight: bold;
        padding: 2px 5px;
        border-radius: 3px;
        text-transform: uppercase;
    }

    .player-cost {
        background-color: rgba(0,0,0,0.6);
        color: white;
        font-size: 0.65em;
        font-weight: bold;
        padding: 2px 5px;
        border-radius: 3px;
    }

    .player-name {
        font-weight: bold;
        font-size: 0.75em;
        line-height: 1.1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 90%;
        color: #ffffff;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        margin-top: auto;
    }

    .player-fixtures {
        font-size: 0.6em;
        color: #ffffff;
        margin-top: 2px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        margin-bottom: 5px;
    }

    .add-icon-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 5;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;

        &:hover {
            opacity: 1;
        }

        .add-icon {
            color: white;
            font-size: 2em;
        }
    }

    .remove-button {
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: #CC0000;
        color: white;
        border: 2px solid #ffffff;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        font-size: 0.8em;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        font-weight: bold;
        &:hover {
            background-color: #990000;
        }
    }

    /* Styling for bench players */
    ${props => props.isBench && `
        width: 85px;
        height: 90px;
        .jersey-image-bg {
            background-size: 70%;
            background-position: center 8px;
        }
        .team-abbr, .player-cost {
            font-size: 0.6em;
            padding: 1px 4px;
        }
        .player-name {
            font-size: 0.7em;
        }
        .player-fixtures {
            font-size: 0.55em;
        }
        .remove-button {
            top: -6px;
            right: -6px;
            width: 20px;
            height: 20px;
            font-size: 0.7em;
        }
    `}
`;

function PlayerJersey({ player, position, onRemove, onMovePlayer, allTeams, isBench = false, onPositionClick }) { // Added onPositionClick prop
    const itemType = 'player';

    const [{ isDragging }, drag] = useDrag(() => ({
        type: itemType,
        item: { player, currentPosition: position },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [player, position]);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: itemType,
        drop: (draggedItem) => {
            if (draggedItem.player.id === player?.id) return;

            onMovePlayer(draggedItem.player, player, position);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }), [player, position, onMovePlayer]);

    const teamDetails = player ? allTeams.find(team => team.id === player.team) : null;
    const jerseySrc = teamDetails ? `${process.env.PUBLIC_URL}/images/jerseys/${teamDetails.id.toLowerCase()}_jersey.png` : '';

    const ref = useCallback((node) => {
        drag(drop(node));
    }, [drag, drop]);

    const playerFixtures = "BUR (H)"; // Simplified for this example


    return (
        <JerseyContainer
            ref={ref}
            isDragging={isDragging}
            isOver={isOver}
            isEmpty={!player}
            isBench={isBench}
            jerseyImage={jerseySrc}
            onClick={() => onPositionClick(position)} // Added onClick to filter by position
        >
            {player ? (
                <>
                    <div className="jersey-image-bg"></div>
                    <div className="jersey-content">
                        <div className="top-info">
                            <span className="team-abbr">{teamDetails?.shortName || player.team}</span>
                            <span className="player-cost">${player.cost.toFixed(1)}</span>
                        </div>
                        <span className="player-name">{player.name}</span>
                        <span className="player-fixtures">{playerFixtures}</span>
                        <button className="remove-button" onClick={() => onRemove(player)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <div className="add-icon-overlay" onClick={() => onMovePlayer(player, null, position)}>
                            <FontAwesomeIcon icon={faPlus} className="add-icon" />
                        </div>
                    </div>
                </>
            ) : (
                // Render empty slot content directly here when player is null
                // This part is for the empty slots on the pitch
                <>
                    <span className="slot-position-abbr">{
                        position === 'Goalkeeper' ? 'GKP' :
                        position === 'Defender' ? 'DEF' :
                        position === 'Midfielder' ? 'MID' :
                        position === 'Forward' ? 'FWD' :
                        'SUB'
                    }</span>
                    <FontAwesomeIcon icon={faPlus} className="plus-icon" />
                </>
            )}
        </JerseyContainer>
    );
}

export default PlayerJersey;
