// src/components/PlayerCard.js
import React from 'react';
import styled from 'styled-components';
import { useDrag } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faC, faV } from '@fortawesome/free-solid-svg-icons'; // Added faC and faV for Captain/Vice-Captain

// Base styling for both card and list item
const BaseCard = styled.div.withConfig({
    shouldForwardProp: (prop) => // REMOVED defaultValidatorFn from arguments
      !['isAdded'].includes(prop)
      // No defaultValidatorFn call here
  })`
    background-color: var(--card-bg); /* Use defined card background */
    border: 1px solid var(--border-color); /* Use defined border color */
    border-radius: 8px;
    padding: 10px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 0.9em;
    transition: transform 0.2s ease-in-out;
    position: relative; /* Needed for absolute positioning of C/VC indicators */

    &:hover {
        transform: translateY(-2px);
    }

    h4 {
        color: var(--dark-text); /* Use defined dark text */
        margin: 5px 0;
    }
    p {
        margin: 3px 0;
        color: var(--medium-text); /* Use defined medium text */
    }
    .cost {
        font-weight: bold;
        color: var(--danger-red); /* Use defined danger red */
    }
    .points {
        font-weight: bold;
        color: var(--success-green); /* Use defined success green */
    }
`;

// Specific styling for list item
const ListItem = styled(BaseCard).withConfig({
    shouldForwardProp: (prop) => // REMOVED defaultValidatorFn from arguments
      !['isDragging'].includes(prop)
      // No defaultValidatorFn call here
  })`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    font-size: 0.95em;
    cursor: grab;
    opacity: ${props => props.isDragging ? 0.5 : 1};

    .player-main-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 2;
    }

    .team-logo-small {
        width: 25px;
        height: 25px;
        object-fit: contain;
        flex-shrink: 0;
    }

    .player-name-and-team {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .player-name {
        font-weight: bold;
        color: var(--dark-text); /* Use defined dark text */
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .player-team-pos {
        font-size: 0.8em;
        color: var(--medium-text); /* Use defined medium text */
    }

    .player-stats {
        display: flex;
        gap: 15px;
        flex: 1.5;
        justify-content: flex-end;
        align-items: center;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.8em;
    }
    .stat-label {
        color: var(--medium-text); /* Use defined medium text */
        font-size: 0.7em;
    }
    .stat-value {
        font-weight: bold;
        color: var(--dark-text); /* Use defined dark text */
    }
    .cost .stat-value {
        color: var(--danger-red); /* Use defined danger red */
    }
    .points .stat-value {
        color: var(--success-green); /* Use defined success green */
    }

    .add-button-circle {
        background-color: ${props => props.isAdded ? 'var(--border-color)' : 'var(--primary-green)'}; /* Use defined colors */
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        font-size: 1.2em;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: ${props => props.isAdded ? 'not-allowed' : 'pointer'};
        transition: background-color 0.2s ease;
        flex-shrink: 0;

        &:hover {
            background-color: ${props => props.isAdded ? 'var(--border-color)' : 'darken(var(--primary-green), 10%)'};
        }
    }
`;

const CaptainIndicator = styled.span`
    position: absolute;
    top: 5px;
    right: 5px; /* Position at top-right */
    background-color: #FFD700; /* Gold color */
    color: #333;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.7em;
    font-weight: bold;
    z-index: 10;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
`;

const ViceCaptainIndicator = styled.span`
    position: absolute;
    top: 5px;
    right: 5px; /* Position at top-right, will be overwritten if Captain is present due to z-index */
    background-color: #C0C0C0; /* Silver color */
    color: #333;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.7em;
    font-weight: bold;
    z-index: 9; /* Lower z-index than Captain to allow Captain to appear on top */
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
`;

const PlayerActionButtons = styled.div`
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
    z-index: 10;
`;

const ActionButton = styled.button`
    background-color: var(--primary-green);
    color: white;
    border: none;
    padding: 3px 8px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.75em;
    font-weight: bold;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: darken(var(--primary-green), 10%);
    }

    &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
`;

function PlayerCard({ player, onAdd, onRemove, isAdded, isListView, allTeams, isCaptain, isViceCaptain, onSetCaptain, onSetViceCaptain, canRemove = true }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'player',
        item: { player },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [player]);

    const teamDetails = allTeams.find(team => team.id === player.team);
    const logoSrc = teamDetails ? `${process.env.PUBLIC_URL}/images/logos/${teamDetails.logo}` : '';

    if (isListView) {
        return (
            <ListItem ref={drag} isDragging={isDragging} isAdded={isAdded}>
                <div className="player-main-info">
                    {logoSrc && <img src={logoSrc} alt={teamDetails?.shortName || ''} className="team-logo-small" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/25x25/cccccc/000000?text=?" }} />}
                    <div className="player-name-and-team">
                        <span className="player-name">{player.name}</span>
                        <span className="player-team-pos">
                            {player.team} - {player.position}
                        </span>
                    </div>
                </div>
                <div className="player-stats">
                    <div className="stat-item cost">
                        <span className="stat-label">Cost</span>
                        <span className="stat-value">${player.cost}M</span>
                    </div>
                    <div className="stat-item points">
                        <span className="stat-label">Pts</span>
                        <span className="stat-value">{player.totalPoints}</span>
                    </div>
                </div>
                <button className="add-button-circle" onClick={onAdd} disabled={isAdded}>
                    {isAdded ? <FontAwesomeIcon icon={faPlus} rotation={90} /> : <FontAwesomeIcon icon={faPlus} />}
                </button>
            </ListItem>
        );
    }

    // Render for pitch/bench view (PlayerJersey context)
    return (
        <BaseCard>
            {isCaptain && <CaptainIndicator>C</CaptainIndicator>}
            {!isCaptain && isViceCaptain && <ViceCaptainIndicator>VC</ViceCaptainIndicator>} {/* Only show VC if not Captain */}

            <h4>{player.name}</h4>
            <p>Team: <strong>{player.team}</strong></p>
            <p>Pos: <strong>{player.position}</strong></p>
            <p className="cost">Cost: ${player.cost}M</p>
            <p className="points">Pts: {player.totalPoints}</p>
            
            <PlayerActionButtons>
                <ActionButton onClick={() => onSetCaptain(player)} disabled={isViceCaptain}>
                    <FontAwesomeIcon icon={faC} /> {isCaptain ? '' : ''}
                </ActionButton>
                <ActionButton onClick={() => onSetViceCaptain(player)} disabled={isCaptain}>
                    <FontAwesomeIcon icon={faV} /> {isViceCaptain ? '' : ''}
                </ActionButton>
                {canRemove && <ActionButton onClick={() => onRemove(player)}>Remove</ActionButton>}
            </PlayerActionButtons>
        </BaseCard>
    );
}

export default PlayerCard;