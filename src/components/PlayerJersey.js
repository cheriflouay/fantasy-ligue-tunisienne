// src/components/PlayerJersey.js
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useDrag, useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

const JerseyContainer = styled.div.withConfig({
    shouldForwardProp: (prop) => // REMOVED defaultValidatorFn from arguments
      !['isDragging', 'isOver', 'isEmpty', 'isBench', 'jerseyImage'].includes(prop)
      // No defaultValidatorFn call here
  })`
    background-color: transparent;
    border-radius: 8px;
    padding: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 95px; /* Keep width consistent */
    height: 120px; /* Increased height to accommodate text below jersey */
    cursor: ${props => props.isEmpty ? 'pointer' : 'grab'};
    position: relative;
    opacity: ${props => props.isDragging ? 0.5 : 1};
    transition: all 0.2s ease-in-out;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
    box-sizing: border-box; /* Include padding in width/height */


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
        height: 70%; /* Occupy top 70% for jersey image */
        background-image: url(${props => props.jerseyImage});
        background-size: 80%; /* Adjust size to fit */
        background-position: center top; /* Position at the top */
        background-repeat: no-repeat;
        z-index: 1;
    }

    .jersey-content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
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
        margin-bottom: auto; /* Pushes content below to the bottom */
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
        margin-top: auto; /* Pushes name to the bottom of the jersey content area */
        margin-bottom: 2px; /* Space between name and fixtures */
    }

    .player-fixtures {
        font-size: 0.6em;
        color: #ffffff;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        margin-bottom: 5px; /* Space from bottom of container */
    }

    .remove-button {
        position: absolute;
        top: -10px; /* Adjust to move further outside */
        left: -10px; /* Adjust to move further outside */
        background-color: var(--danger-red); /* Use defined danger red */
        color: white;
        border: 2px solid #ffffff; /* White border for clarity */
        border-radius: 50%; /* Make it a circle */
        width: 28px; /* Increased size */
        height: 28px; /* Increased size */
        font-size: 1em; /* Adjust icon size */
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10; /* Ensure it's on top */
        font-weight: bold;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3); /* Add a subtle shadow */
        transition: background-color 0.2s ease, transform 0.2s ease;

        &:hover {
            background-color: #a00000; /* Darker red on hover */
            transform: scale(1.1); /* Slightly enlarge on hover */
        }
    }

    /* Styling for bench players */
    ${props => props.isBench && `
        width: 85px;
        height: 110px; /* Adjusted height for bench players too */
        .jersey-image-bg {
            background-size: 70%;
            background-position: center top;
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
            top: -8px;
            left: -8px; /* Adjusted for bench */
            width: 24px;
            height: 24px;
            font-size: 0.7em;
        }
    `}
`;

function PlayerJersey({ player, position, onRemove, onMovePlayer, allTeams, isBench = false, onPositionClick, playerFixtures }) {
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
            if (draggedItem.player.id === player?.id) return; // Prevent dropping player onto themselves

            // When dropping onto an existing player, it's a swap intent.
            // When dropping onto an empty slot (player is null), it's a move to that slot.
            onMovePlayer(draggedItem.player, player, position); // Pass target player (or null) and position
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

    // Extract first name and optionally the last name
    const displayName = useMemo(() => {
        if (!player) return '';
        const nameParts = player.name.split(' ');
        if (nameParts.length > 1) {
            // Take first name and last name. If there are middle names, they are omitted.
            return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
        }
        return nameParts[0]; // Only one name part, use it directly
    }, [player]);


    return (
        <JerseyContainer
            ref={ref}
            isDragging={isDragging}
            isOver={isOver}
            isEmpty={!player}
            isBench={isBench}
            jerseyImage={jerseySrc}
            onClick={() => {
                // Only trigger onPositionClick if it's an empty slot
                if (!player) {
                    onPositionClick(position);
                }
            }}
        >
            {player ? (
                <>
                    <div className="jersey-image-bg"></div>
                    <div className="jersey-content">
                        <div className="top-info">
                            <span className="team-abbr">{teamDetails?.shortName || player.team}</span>
                            <span className="player-cost">${player.cost.toFixed(1)}</span>
                        </div>
                        {/* Player name and fixtures are now below the jersey image area */}
                        <span className="player-name">{displayName}</span>
                        <span className="player-fixtures">{playerFixtures}</span>
                        <button className="remove-button" onClick={() => onRemove(player)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                </>
            ) : (
                // Empty slot content
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
