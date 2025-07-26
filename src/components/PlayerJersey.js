// src/components/PlayerJersey.js
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useDrag, useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'; // Removed faExchangeAlt

const JerseyContainer = styled.div.withConfig({
  shouldForwardProp: (prop) =>
    !['isDragging', 'isOver', 'isEmpty', 'isBench', 'jerseyImage', 'isCaptain', 'isViceCaptain', 'isInitialPick', 'isPlayerToSubstitute'].includes(prop) // Added isPlayerToSubstitute
})`
    background-color: transparent;
    border-radius: 8px;
    padding: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 95px; /* Default width for initial pick */
    height: 120px; /* Default height for initial pick */
    cursor: ${props => props.isEmpty ? 'pointer' : 'grab'};
    position: relative;
    opacity: ${props => props.isDragging ? 0.5 : 1};
    transition: all 0.2s ease-in-out;
    font-family: 'Inter', sans-serif;
    overflow: visible; /* Set overflow to visible to prevent clipping */
    box-sizing: border-box; /* Include padding in width/height */

    /* MODIFIED: Larger size for My Team page (when isInitialPick is false) */
    ${props => !props.isInitialPick && `
        width: 110px; /* Increased width for My Team view */
        height: 140px; /* Increased height for My Team view */

        .jersey-image-bg {
            background-size: 90%; /* Make jersey image slightly bigger */
        }
        .team-abbr, .player-cost {
            font-size: 0.75em; /* Slightly larger text */
            padding: 3px 6px;
        }
        .player-name-box { /* NEW: Apply to new boxes */
            font-size: 0.85em; /* Slightly larger text */
        }
    `}


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
            .slot-position-abbr, .plus-icon {
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

    /* Styling for player selected for substitution */
    ${props => props.isPlayerToSubstitute && `
        border: 3px solid #007bff; /* Highlight blue for selected player */
        box-shadow: 0 0 10px rgba(0, 123, 255, 0.8);
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

    /* MODIFIED: Styling for team-abbr and player-cost to match image */
    .team-abbr {
        background-color: #34495e; /* Darker background */
        color: white;
        font-size: 0.65em;
        font-weight: bold;
        padding: 2px 5px;
        border-radius: 5px; /* Rounded corners */
        text-transform: uppercase;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        margin-right: auto; /* Push to left */
    }

    .player-cost {
        background-color: #34495e; /* Darker background */
        color: white;
        font-size: 0.65em;
        font-weight: bold;
        padding: 2px 5px;
        border-radius: 5px; /* Rounded corners */
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        margin-left: auto; /* Push to right */
    }

    /* NEW: Player Name and Fixtures boxes */
    .player-name-box {
        background-color: #34495e; /* Dark background */
        color: #ffffff;
        font-weight: bold;
        font-size: 0.75em;
        line-height: 1.1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 90%;
        padding: 4px 8px;
        border-radius: 5px;
        margin-top: auto; /* Pushes name to the bottom of the jersey content area */
        margin-bottom: 2px; /* Space between name and fixture/badges */
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }

    /* NEW: Container for fixture and C/VC badges */
    .fixture-and-badges-container {
        background-color: #34495e; /* Dark background, same as name box */
        color: #ffffff; /* White text */
        font-size: 0.6em;
        padding: 3px 6px;
        border-radius: 5px;
        margin-bottom: 5px; /* Space from bottom of container */
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        display: flex; /* For inline display */
        align-items: center; /* Vertically align items */
        justify-content: center; /* Center content */
        gap: 4px; /* Space between items */
        white-space: nowrap; /* Prevent wrapping */
    }


    .remove-button {
        position: absolute;
        top: -8px;
        left: -8px;
        background-color: #FF6347;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        font-size: 0.9em;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        font-weight: bold;
        box-shadow:
            0 1.5px 0 rgba(178, 34, 34, 0.5),
            0 3px 6px rgba(0, 0, 0, 0.2),
            inset 0 0.5px 0 rgba(255, 255, 255, 0.5),
            inset 0 -1.5px 0 rgba(178, 34, 34, 0.8);
        transition: all 0.1s ease-out;

        &:hover {
            background-color: #E05637;
            transform: scale(1.05);
        }
        &:active {
            transform: translateY(1px);
            box-shadow:
                0 0.5px 0 rgba(178, 34, 34, 0.5),
                0 1px 2px rgba(0, 0, 0, 0.1),
                inset 0 0px 0 rgba(255, 255, 255, 0.5),
                inset 0 -0.5px 0 rgba(178, 34, 34, 0.8);
        }
    }

    /* Removed Substitution button styling */
`;

/* NEW: Inline Captain/Vice-Captain Badges - MODIFIED STYLING AND ORDER */
const InlineCaptainBadge = styled.span`
    background-color: #FFD700; /* Gold color for Captain */
    color: #333;
    padding: 2px 5px; /* Smaller padding */
    border-radius: 3px; /* Smaller border-radius */
    font-size: 0.6em; /* Smaller font size */
    font-weight: bold;
    display: inline-flex; /* Use inline-flex for side-by-side */
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    order: 2; /* NEW: Order to place after fixture */
`;

const InlineViceCaptainBadge = styled(InlineCaptainBadge)`
    background-color: #A9A9A9; /* Darker silver for Vice-Captain */
    color: white;
    order: 1; /* NEW: Order to place before fixture */
`;


const CaptaincyButtons = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 5px;
    padding-bottom: 5px;
    z-index: 10;
    background-color: rgba(0,0,0,0.6); /* Semi-transparent background */
    border-radius: 0 0 8px 8px;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;

    ${JerseyContainer}:hover & {
        opacity: 1;
    }

    button {
        background-color: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.4);
        border-radius: 4px;
        padding: 3px 8px;
        font-size: 0.6em;
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: rgba(255,255,255,0.4);
        }
        &.active {
            background-color: #FFD700;
            color: #333;
            font-weight: bold;
        }
        &.vc-active {
            background-color: #A9A9A9;
            color: white;
            font-weight: bold;
        }
    }
`;

// NEW: Styled component for "SUB" badge on bench players
const SubBadge = styled.div`
    position: absolute;
    top: -10px; /* Position similar to captain badge */
    left: -10px; /* Position on the left side */
    background-color: #f39c12; /* Orange color for "SUB" */
    color: white;
    border: 2px solid #ffffff;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 0.8em;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
`;


function PlayerJersey({ player, position, onRemove, onMovePlayer, allTeams, isBench = false, onPositionClick, playerFixtures, isCaptain, isViceCaptain, onSetCaptain, onSetViceCaptain, isInitialPick, canRemove, substitutionMode, playerToSubstitute, onPlayerClick, isPlayerToSubstitute }) {
    const itemType = 'player';

    const [{ isDragging }, drag] = useDrag(() => ({
        type: itemType,
        item: { player, currentPosition: position, isBench: isBench }, // Pass isBench status with dragged item
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [player, position, isBench]);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: itemType,
        drop: (draggedItem) => {
            // When dropping, call onMovePlayer with draggedItem.player and the current player (target)
            // If dropping on an empty slot, 'player' will be null, and 'position' will be the slot type.
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

    const displayName = useMemo(() => {
        if (!player) return '';
        const nameParts = player.name.split(' ');
        if (nameParts.length > 1) {
            return `${nameParts[0]} ${nameParts[1]}`; // First and second name
        }
        return nameParts[0];
    }, [player]);

    // Removed isPlayerSelectedForSubstitution
    const displayFixture = playerFixtures ? playerFixtures : 'N/A';

    return (
        <JerseyContainer
            ref={ref}
            isDragging={isDragging}
            isOver={isOver}
            isEmpty={!player}
            isBench={isBench}
            jerseyImage={jerseySrc}
            onClick={(e) => {
                e.stopPropagation(); // Prevent clicks from bubbling up to parent containers

                if (substitutionMode && player) { // If in substitution mode and clicked on a player (not empty slot)
                    onPlayerClick(player); // Use the new onPlayerClick for substitution logic
                } else if (!player) { // Clicked an empty slot, not in substitution mode
                    onPositionClick(position); // This is typically for filtering the player list
                }
            }}
            isInitialPick={isInitialPick}
            isPlayerToSubstitute={isPlayerToSubstitute}
        >
            {player ? (
                <>
                    <div className="jersey-image-bg"></div>
                    <div className="jersey-content">
                        <div className="top-info">
                            <span className="team-abbr">{teamDetails?.shortName || player.team}</span>
                            <span className="player-cost">${player.cost.toFixed(1)}M</span>
                        </div>
                        {/* Player Name Box */}
                        <div className="player-name-box">{displayName}</div>
                        {/* NEW: Container for fixture and C/VC badges */}
                        <div className="fixture-and-badges-container">
                            {/* Only show C/VC badges if NOT initial pick (My Team page) */}
                            {!isInitialPick && isViceCaptain && <InlineViceCaptainBadge>VC</InlineViceCaptainBadge>}
                            <span className="fixture-item">
                                {displayFixture}
                            </span>
                            {!isInitialPick && isCaptain && <InlineCaptainBadge>C</InlineCaptainBadge>}
                        </div>

                        {/* Conditionally render Remove button - always show on Transfers/Initial Pick, only if canRemove on MyTeam */}
                        {canRemove && ( // canRemove is true for Transfers/Initial Pick, controlled by parent for MyTeam
                            <button className="remove-button" onClick={(e) => { e.stopPropagation(); onRemove(player); }}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        )}

                        {/* Removed Substitution button on PlayerJersey */}

                        {isBench && !isInitialPick && <SubBadge>SUB</SubBadge>}

                        {/* Captaincy buttons (hidden, as badges are now inline) - Only show if NOT initial pick */}
                        {player && !isBench && !isInitialPick && (
                            <CaptaincyButtons>
                                <button
                                    className={isCaptain ? 'active' : ''}
                                    onClick={(e) => { e.stopPropagation(); onSetCaptain(player); }}
                                >
                                    C
                                </button>
                                <button
                                    className={isViceCaptain ? 'vc-active' : ''}
                                    onClick={(e) => { e.stopPropagation(); onSetViceCaptain(player); }}
                                >
                                    VC
                                </button>
                            </CaptaincyButtons>
                        )}
                    </div>
                </>
            ) : (
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
