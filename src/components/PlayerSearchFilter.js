// src/components/PlayerSearchFilter.js
import React from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;

    input, select {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
`;

function PlayerSearchFilter({ filters, setFilters, allTeams }) {
    return (
        <FilterContainer>
            <input
                type="text"
                placeholder="Search player name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select
                value={filters.position}
                onChange={(e) => setFilters({ ...filters, position: e.target.value })}
            >
                <option value="All">All Positions</option>
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Defender">Defender</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Forward">Forward</option>
            </select>
            <select
                value={filters.team}
                onChange={(e) => setFilters({ ...filters, team: e.target.value })}
            >
                <option value="All">All Teams</option>
                {allTeams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                ))}
            </select>
        </FilterContainer>
    );
}

export default PlayerSearchFilter;