// src/pages/Standings.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const StandingsContainer = styled.div`
    padding: 20px;
    max-width: 800px;
    margin: 20px auto;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
`;

const StandingsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;

    th, td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: left;
    }

    th {
        background-color: #f2f2f2;
        font-weight: bold;
        color: #333;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    .rank {
        width: 40px;
        text-align: center;
    }
    .team-name-cell {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
    }
    .team-logo {
        width: 25px;
        height: 25px;
        object-fit: contain;
    }
`;

function Standings({ allTeams }) {
    const [leagueStandings, setLeagueStandings] = useState([]);

    useEffect(() => {
        const mockStandings = [
            { rank: 1, team: 'ESS', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
            { rank: 2, team: 'CA', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
            { rank: 3, team: 'ASM', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
            { rank: 4, team: 'CAB', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
            { rank: 5, team: 'CSS', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
            { rank: 6, team: 'EST', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
            { rank: 7, team: 'OB', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
            { rank: 8, team: 'ST', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
            { rank: 9, team: 'USM', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
            { rank: 10, team: 'JSK', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
            { rank: 11, team: 'ESZ', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 }, // ESZ for Zarzis
            { rank: 12, team: 'ASG', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
            { rank: 13, team: 'ASZ', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 }, // ASZ for Soliman
            { rank: 14, team: 'USBG', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
            { rank: 15, team: 'JSO', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
            { rank: 16, team: 'EM', played: 0, wins: 0, draws: 0, losses: 0, gd: 0, points: 0 },
        ];
        setLeagueStandings(mockStandings);
    }, []);

    const getTeamDetails = (teamId) => {
        return allTeams.find(team => team.id === teamId);
    };

    return (
        <StandingsContainer>
            <h2>Ligue Professionnelle 1 Standings (25/26 Season - Pre-Season)</h2>
            <StandingsTable>
                <thead>
                    <tr>
                        <th className="rank">#</th>
                        <th>Team</th>
                        <th>P</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th>GD</th>
                        <th>Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {leagueStandings.map(team => {
                        const teamDetails = getTeamDetails(team.team);
                        return (
                            <tr key={team.rank}>
                                <td className="rank">{team.rank}</td>
                                <td className="team-name-cell">
                                    {teamDetails && <img src={`${process.env.PUBLIC_URL}/images/logos/${teamDetails.logo}`} alt={teamDetails.shortName} className="team-logo" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/25x25/cccccc/000000?text=?" }} />}
                                    {teamDetails ? teamDetails.name : team.team}
                                </td>
                                <td>{team.played}</td>
                                <td>{team.wins}</td>
                                <td>{team.draws}</td>
                                <td>{team.losses}</td>
                                <td>{team.gd}</td>
                                <td>{team.points}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </StandingsTable>

            {/* Optionally, add Mini-League standings here */}
            {/* <h3>My Mini-Leagues</h3> */}
        </StandingsContainer>
    );
}

export default Standings;
