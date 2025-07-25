// src/components/PlayerCard.js
import React from 'react';
import styled from 'styled-components';
import { useDrag } from 'react-dnd';
// Removed FontAwesomeIcon and faInfoCircle as the icon is being removed
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

// Base styling for both card and list item
const BaseCard = styled.div.withConfig({
    shouldForwardProp: (prop) =>
      !['isAdded'].includes(prop)
  })`
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 0.9em;
    transition: transform 0.2s ease-in-out;
    position: relative;

    &:hover {
        transform: translateY(-2px);
    }

    h4 {
        color: var(--dark-text);
        margin: 5px 0;
    }
    p {
        margin: 3px 0;
        color: var(--medium-text);
    }
    .cost {
        font-weight: bold;
        color: var(--danger-red);
    }
    .points {
        font-weight: bold;
        color: var(--success-green);
    }
`;

// Specific styling for list item
const ListItem = styled(BaseCard).withConfig({
    shouldForwardProp: (prop) =>
      !['isDragging'].includes(prop)
  })`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 5px 10px; /* Reduced padding for smaller card */
    padding-left: 10px; /* MODIFIED: Reduced left padding */
    font-size: 0.85em;
    cursor: grab;
    opacity: ${props => props.isDragging ? 0.5 : 1};
    background-color: #2c004a; /* Matched to PlayerSelectionArea background */
    border: 1px solid #4a005c; /* Matched border color */
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    color: white;
    flex-grow: 1;
    direction: ltr;

    .player-main-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 3;
        min-width: 120px;
    }

    .team-logo-small {
        width: 25px;
        height: 25px;
        object-fit: contain;
        flex-shrink: 0;
        border-radius: 3px;
    }

    .player-name-and-team {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        flex-grow: 1;
        min-width: 0;
    }

    .player-name {
        font-weight: bold;
        color: white;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
    }

    .player-team-pos {
        font-size: 0.75em;
        color: #cccccc;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
    }

    .price-section, .points-section {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        min-width: 50px;
        flex-shrink: 0;
        text-align: right;
    }

    .stat-value {
        font-weight: bold;
        color: white;
        font-size: 0.9em;
    }
    .price-section .stat-value {
        color: #99ccff;
    }
    .points-section .stat-value {
        color: #FFD700;
    }
`;

function PlayerCard({ player, isAdded, isListView, allTeams }) {
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
                    {logoSrc && <img src={logoSrc} alt={teamDetails?.shortName || ''} className="team-logo-small" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/30x30/cccccc/000000?text=?" }} />}
                    <div className="player-name-and-team">
                        <span className="player-name">{player.name}</span>
                        <span className="player-team-pos">
                            {teamDetails?.shortName || player.team} - {player.position}
                        </span>
                    </div>
                </div>

                <div className="price-section">
                    <span className="stat-value">${player.cost.toFixed(1)}M</span>
                </div>

                <div className="points-section">
                    <span className="stat-value">{player.totalPoints}</span>
                </div>
            </ListItem>
        );
    }

    return (
        <BaseCard>
            <h4>{player.name}</h4>
            <p>{teamDetails?.name || player.team} - {player.position}</p>
            <p className="cost">Cost: ${player.cost.toFixed(1)}M</p>
            <p className="points">Total Points: {player.totalPoints}</p>
        </BaseCard>
    );
}

export default PlayerCard;
