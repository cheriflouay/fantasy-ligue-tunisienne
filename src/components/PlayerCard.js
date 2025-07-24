// src/components/PlayerCard.js
import React from 'react';
import styled from 'styled-components';
import { useDrag } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // For plus icon
import { faPlus } from '@fortawesome/free-solid-svg-icons'; // For plus icon

// Base styling for both card and list item
const BaseCard = styled.div`
    background-color: #f0f8ff; /* Light Blue */
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 0.9em;
    transition: transform 0.2s ease-in-out;

    &:hover {
        transform: translateY(-2px);
    }

    h4 {
        margin: 5px 0;
        color: #333;
    }
    p {
        margin: 3px 0;
        color: #555;
    }
    .cost {
        font-weight: bold;
        color: #CC0000;
    }
    .points {
        font-weight: bold;
        color: #008000;
    }
`;

// Specific styling for list item
const ListItem = styled(BaseCard)`
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
        color: #333;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .player-team-pos {
        font-size: 0.8em;
        color: #555;
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
        color: #777;
        font-size: 0.7em;
    }
    .stat-value {
        font-weight: bold;
        color: #333;
    }
    .cost .stat-value {
        color: #CC0000;
    }
    .points .stat-value {
        color: #008000;
    }

    /* Styling for the circular add button */
    .add-button-circle {
        background-color: ${props => props.isAdded ? '#ccc' : '#008000'};
        color: white;
        border: none;
        border-radius: 50%; /* Make it circular */
        width: 30px; /* Fixed width */
        height: 30px; /* Fixed height */
        font-size: 1.2em; /* Adjusted font size for plus icon */
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: ${props => props.isAdded ? 'not-allowed' : 'pointer'};
        transition: background-color 0.2s ease;
        flex-shrink: 0; /* Prevent button from shrinking */

        &:hover {
            background-color: ${props => props.isAdded ? '#ccc' : '#006600'};
        }
    }
`;

function PlayerCard({ player, onAdd, isAdded, isListView, allTeams }) {
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
                {/* Re-added the circular add button */}
                <button className="add-button-circle" onClick={onAdd} disabled={isAdded}>
                    {isAdded ? <FontAwesomeIcon icon={faPlus} rotation={90} /> : <FontAwesomeIcon icon={faPlus} />} {/* Checkmark for added, plus for not added */}
                </button>
            </ListItem>
        );
    }

    // Default card view (unchanged)
    return (
        <BaseCard isAdded={isAdded}>
            <h4>{player.name}</h4>
            <p>Team: <strong>{player.team}</strong></p>
            <p>Pos: <strong>{player.position}</strong></p>
            <p className="cost">Cost: ${player.cost}M</p>
            <p className="points">Pts: {player.totalPoints}</p>
            <button onClick={onAdd} disabled={isAdded}>
                {isAdded ? 'Added' : 'Add Player'}
            </button>
        </BaseCard>
    );
}

export default PlayerCard;
