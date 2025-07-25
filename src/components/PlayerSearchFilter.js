// src/components/PlayerSearchFilter.js
import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'; // Removed faSearch

const FilterContainer = styled.div`
    background-color: #1a002b;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 20px;
    color: white;
`;

const SearchBar = styled.div`
    position: relative;
    margin-bottom: 15px;

    input {
        width: 100%;
        padding: 10px; /* MODIFIED: Removed left padding for icon */
        border: 1px solid #4a005c;
        border-radius: 5px;
        background-color: #33004a;
        color: white;
        font-size: 1em;

        &::placeholder {
            color: #ccc;
        }
    }

    /* REMOVED: .search-icon styling as the icon is removed */
    /*
    .search-icon {
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: #ccc;
    }
    */
`;

const FilterButtons = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
    margin-bottom: 15px;

    button, select {
        background-color: #33004a;
        color: white;
        border: 1px solid #4a005c;
        padding: 8px 12px;
        border-radius: 5px;
        font-size: 0.9em;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 5px;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: #4a005c;
        }

        option {
            background-color: #33004a;
            color: white;
        }
    }
`;


const PlayersShownBar = styled.div`
    background-color: #6a11cb; /* Solid purple/blue color */
    color: white; /* Text color */
    padding: 10px;
    border-radius: 5px;
    text-align: center;
    font-weight: bold;
    margin-bottom: 15px;
`;

const SortButton = styled.button`
    background-color: #33004a;
    color: white;
    border: 1px solid #4a005c;
    padding: 8px 12px;
    border-radius: 5px;
    font-size: 0.9em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5px;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #4a005c;
    }
`;


function PlayerSearchFilter({ filters, setFilters, allTeams, setSortOrder, sortOrder, numPlayersShown }) {
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSortChange = (key) => {
        setSortOrder(prev => ({
            key: key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const getSortIcon = (key) => {
        if (sortOrder.key === key) {
            return sortOrder.direction === 'asc' ? faArrowUp : faArrowDown;
        }
        return null;
    };

    return (
        <FilterContainer>
            <SearchBar>
                {/* REMOVED: FontAwesomeIcon for search icon */}
                <input
                    type="text"
                    name="search"
                    placeholder="Search by name"
                    value={filters.search}
                    onChange={handleFilterChange}
                />
            </SearchBar>

            <FilterButtons>
                <select name="position" value={filters.position} onChange={handleFilterChange}>
                    <option value="All">All Players</option>
                    <option value="Goalkeeper">Goalkeepers</option>
                    <option value="Defender">Defenders</option>
                    <option value="Midfielder">Midfielders</option>
                    <option value="Forward">Forwards</option>
                </select>

                <select name="cost" value={filters.cost} onChange={handleFilterChange}>
                    <option value="All">All Cost</option>
                    <option value="0-5">£0-5m</option>
                    <option value="5.1-10">£5.1-10m</option>
                    <option value="10.1-15">£10.1-15m</option>
                </select>

                <select name="team" value={filters.team} onChange={handleFilterChange}>
                    <option value="All">All Teams</option>
                    {allTeams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>

                <SortButton onClick={() => handleSortChange('totalPoints')}>
                    Total points <FontAwesomeIcon icon={getSortIcon('totalPoints') || faChevronDown} />
                </SortButton>
                <SortButton onClick={() => handleSortChange('cost')}>
                    Price <FontAwesomeIcon icon={getSortIcon('cost') || faChevronDown} />
                </SortButton>
            </FilterButtons>

            <PlayersShownBar>
                {numPlayersShown} players shown
            </PlayersShownBar>
        </FilterContainer>
    );
}

export default PlayerSearchFilter;