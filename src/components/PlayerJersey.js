// src/components/PlayerJersey.js
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useDrag, useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faC, faV } from '@fortawesome/free-solid-svg-icons';

const JerseyContainer = styled.div.withConfig({ // Added .withConfig for prop filtering
  shouldForwardProp: (prop) =>
    !['isDragging', 'isOver', 'isEmpty', 'isBench', 'jerseyImage', 'isCaptain', 'isViceCaptain', 'isInitialPick'].includes(prop) // Added isInitialPick
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
        .player-name {
            font-size: 0.85em; /* Slightly larger text */
        }
        .player-fixtures {
            font-size: 0.7em; /* Slightly larger text */
        }
        /* Adjust badge/button sizes for larger jerseys */
        .captain-badge, .vice-captain-badge { /* Removed remove-button from this selector */
            width: 32px;
            height: 32px;
            font-size: 1.1em;
            top: -12px;
            left: -12px;
            right: -12px;
        }
        .captaincy-buttons button {
            font-size: 0.7em;
            padding: 4px 10px;
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
        top: -8px; /* MODIFIED: Adjusted top for smaller size */
        left: -8px; /* MODIFIED: Adjusted left for smaller size */
        background-color: #FF6347;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px; /* MODIFIED: Smaller width */
        height: 24px; /* MODIFIED: Smaller height */
        font-size: 0.9em; /* MODIFIED: Smaller X icon */
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        font-weight: bold;
        box-shadow:
            0 1.5px 0 rgba(178, 34, 34, 0.5), /* Adjusted shadow for smaller size */
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

    /* Styling for bench players */
    ${props => props.isBench && props.isInitialPick && ` /* Only apply smaller bench styles during initial pick */
        width: 85px;
        height: 110px;
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
        /* No specific remove button size override for bench here, default smaller size will apply */
        /* If you need a different size for bench remove button, define it here */
    `}
`;

const CaptainBadge = styled.div`
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: #FFD700; /* Gold color for Captain */
    color: #333;
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

const ViceCaptainBadge = styled(CaptainBadge)`
    background-color: #A9A9A9; /* Darker silver for Vice-Captain */
    color: white;
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


function PlayerJersey({ player, position, onRemove, onMovePlayer, allTeams, isBench = false, onPositionClick, playerFixtures, isCaptain, isViceCaptain, onSetCaptain, onSetViceCaptain, isInitialPick, canRemove }) {
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

    const displayName = useMemo(() => {
        if (!player) return '';
        const nameParts = player.name.split(' ');
        if (nameParts.length > 1) {
            return `${nameParts[0]} ${nameParts[1]}`; // First and second name
        }
        return nameParts[0];
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
                if (!player) {
                    onPositionClick(position);
                }
            }}
            isInitialPick={isInitialPick} // Pass isInitialPick to styled component
        >
            {player ? (
                <>
                    <div className="jersey-image-bg"></div>
                    <div className="jersey-content">
                        <div className="top-info">
                            <span className="team-abbr">{teamDetails?.shortName || player.team}</span>
                            <span className="player-cost">${player.cost.toFixed(1)}</span>
                        </div>
                        <span className="player-name">{displayName}</span>
                        <span className="player-fixtures">{playerFixtures}</span>
                        {canRemove && ( // Conditionally render remove button
                            <button className="remove-button" onClick={() => onRemove(player)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        )}

                        {isCaptain && <CaptainBadge><FontAwesomeIcon icon={faC} /></CaptainBadge>}
                        {isViceCaptain && <ViceCaptainBadge><FontAwesomeIcon icon={faV} /></ViceCaptainBadge>}

                        {/* Captaincy buttons only visible for non-bench players when not initial pick */}
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
