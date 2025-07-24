// src/pages/Fixtures.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const FixturesContainer = styled.div`
    padding: 20px;
    max-width: 900px;
    margin: 20px auto;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
`;

const GameweekSelector = styled.select`
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    border-radius: 5px;
    border: 1px solid #ddd;
    font-size: 1.1em;
`;

const MatchCard = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin-bottom: 10px;
    border: 1px solid #eee;
    border-radius: 5px;
    background-color: #fdfdfd;

    div {
        text-align: center;
        flex: 1;
        display: flex; /* Enable flex for alignment of logo and text */
        align-items: center; /* Vertically center logo and text */
        justify-content: center; /* Horizontally center logo and text */
        gap: 8px; /* Space between logo and text */
    }

    .team-logo {
        width: 30px; /* Adjust size as needed */
        height: 30px; /* Adjust size as needed */
        object-fit: contain; /* Ensures the image scales correctly */
    }

    .team-name-text {
        font-weight: bold;
        font-size: 1.1em;
        color: #333;
    }

    .score {
        font-size: 1.3em;
        font-weight: bold;
        color: #CC0000;
        margin: 0 15px;
    }

    .time {
        font-size: 0.9em;
        color: #777;
    }
`;

function Fixtures({ allTeams }) {
    const [gameweeks, setGameweeks] = useState([]);
    const [fixtures, setFixtures] = useState([]);
    const [selectedGameweek, setSelectedGameweek] = useState('');

    useEffect(() => {
        const allGameweeks = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            name: `Gameweek ${i + 1}`
        }));

        // Simulate fixtures for the 25/26 season (pre-season, so no scores yet)
        // Based on the newly provided image
        const mockFixtures = [
            // Gameweek 1 (01ère Journée)
            { id: 1, gameweek: 1, homeTeam: 'USM', awayTeam: 'ST', score: null, kickOffTime: '2025-08-10T17:00:00Z' },
            { id: 2, gameweek: 1, homeTeam: 'CA', awayTeam: 'ASM', score: null, kickOffTime: '2025-08-10T17:00:00Z' },
            { id: 3, gameweek: 1, homeTeam: 'ASG', awayTeam: 'EST', score: null, kickOffTime: '2025-08-10T17:00:00Z' },
            { id: 4, gameweek: 1, homeTeam: 'USBG', awayTeam: 'OB', score: null, kickOffTime: '2025-08-10T17:00:00Z' },
            { id: 5, gameweek: 1, homeTeam: 'EM', awayTeam: 'CAB', score: null, kickOffTime: '2025-08-10T17:00:00Z' },
            { id: 6, gameweek: 1, homeTeam: 'JSK', awayTeam: 'ASZ', score: null, kickOffTime: '2025-08-10T17:00:00Z' }, // ASZ for Soliman
            { id: 7, gameweek: 1, homeTeam: 'CSS', awayTeam: 'ESZ', score: null, kickOffTime: '2025-08-10T17:00:00Z' }, // ESZ for Zarzis
            { id: 8, gameweek: 1, homeTeam: 'JSO', awayTeam: 'ESS', score: null, kickOffTime: '2025-08-10T17:00:00Z' },

            // Gameweek 2 (02ème Journée)
            { id: 9, gameweek: 2, homeTeam: 'ESZ', awayTeam: 'JSO', score: null, kickOffTime: '2025-08-17T17:00:00Z' }, // ESZ for Zarzis
            { id: 10, gameweek: 2, homeTeam: 'ASM', awayTeam: 'ESS', score: null, kickOffTime: '2025-08-17T17:00:00Z' },
            { id: 11, gameweek: 2, homeTeam: 'CAB', awayTeam: 'CSS', score: null, kickOffTime: '2025-08-17T17:00:00Z' },
            { id: 12, gameweek: 2, homeTeam: 'OB', awayTeam: 'ASG', score: null, kickOffTime: '2025-08-17T17:00:00Z' },
            { id: 13, gameweek: 2, homeTeam: 'ASM', awayTeam: 'USBG', score: null, kickOffTime: '2025-08-17T17:00:00Z' }, // Note: ASM appears twice, assuming it's a typo in the image or a placeholder
            { id: 14, gameweek: 2, homeTeam: 'ST', awayTeam: 'JSK', score: null, kickOffTime: '2025-08-17T17:00:00Z' },
            { id: 15, gameweek: 2, homeTeam: 'EST', awayTeam: 'USM', score: null, kickOffTime: '2025-08-17T17:00:00Z' },
            { id: 16, gameweek: 2, homeTeam: 'ESS', awayTeam: 'CA', score: null, kickOffTime: '2025-08-17T17:00:00Z' },

            // Gameweek 3 (03ème Journée)
            { id: 17, gameweek: 3, homeTeam: 'USBG', awayTeam: 'ESS', score: null, kickOffTime: '2025-08-24T17:00:00Z' },
            { id: 18, gameweek: 3, homeTeam: 'ASG', awayTeam: 'ASM', score: null, kickOffTime: '2025-08-24T17:00:00Z' },
            { id: 19, gameweek: 3, homeTeam: 'EM', awayTeam: 'CSS', score: null, kickOffTime: '2025-08-24T17:00:00Z' },
            { id: 20, gameweek: 3, homeTeam: 'JSO', awayTeam: 'CAB', score: null, kickOffTime: '2025-08-24T17:00:00Z' },
            { id: 21, gameweek: 3, homeTeam: 'USM', awayTeam: 'OB', score: null, kickOffTime: '2025-08-24T17:00:00Z' },
            { id: 22, gameweek: 3, homeTeam: 'JSK', awayTeam: 'EST', score: null, kickOffTime: '2025-08-24T17:00:00Z' },
            { id: 23, gameweek: 3, homeTeam: 'ASZ', awayTeam: 'ST', score: null, kickOffTime: '2025-08-24T17:00:00Z' }, // ASZ for Soliman
            { id: 24, gameweek: 3, homeTeam: 'CA', awayTeam: 'ESZ', score: null, kickOffTime: '2025-08-24T17:00:00Z' }, // ESZ for Zarzis

            // Gameweek 4 (04ème Journée)
            { id: 25, gameweek: 4, homeTeam: 'ASM', awayTeam: 'USM', score: null, kickOffTime: '2025-08-31T17:00:00Z' },
            { id: 26, gameweek: 4, homeTeam: 'EST', awayTeam: 'ESS', score: null, kickOffTime: '2025-08-31T17:00:00Z' },
            { id: 27, gameweek: 4, homeTeam: 'ESZ', awayTeam: 'USBG', score: null, kickOffTime: '2025-08-31T17:00:00Z' }, // ESZ for Zarzis
            { id: 28, gameweek: 4, homeTeam: 'CAB', awayTeam: 'CA', score: null, kickOffTime: '2025-08-31T17:00:00Z' },
            { id: 29, gameweek: 4, homeTeam: 'CSS', awayTeam: 'JSO', score: null, kickOffTime: '2025-08-31T17:00:00Z' },
            { id: 30, gameweek: 4, homeTeam: 'ESS', awayTeam: 'ASG', score: null, kickOffTime: '2025-08-31T17:00:00Z' },
            { id: 31, gameweek: 4, homeTeam: 'OB', awayTeam: 'JSK', score: null, kickOffTime: '2025-08-31T17:00:00Z' },
            { id: 32, gameweek: 4, homeTeam: 'ST', awayTeam: 'EM', score: null, kickOffTime: '2025-08-31T17:00:00Z' },

            // Gameweek 5 (05ème Journée)
            { id: 33, gameweek: 5, homeTeam: 'ST', awayTeam: 'EST', score: null, kickOffTime: '2025-09-07T17:00:00Z' },
            { id: 34, gameweek: 5, homeTeam: 'ASG', awayTeam: 'ESZ', score: null, kickOffTime: '2025-09-07T17:00:00Z' }, // ESZ for Zarzis
            { id: 35, gameweek: 5, homeTeam: 'JSK', awayTeam: 'ASM', score: null, kickOffTime: '2025-09-07T17:00:00Z' },
            { id: 36, gameweek: 5, homeTeam: 'EM', awayTeam: 'JSO', score: null, kickOffTime: '2025-09-07T17:00:00Z' },
            { id: 37, gameweek: 5, homeTeam: 'USBG', awayTeam: 'CAB', score: null, kickOffTime: '2025-09-07T17:00:00Z' },
            { id: 38, gameweek: 5, homeTeam: 'ASZ', awayTeam: 'OB', score: null, kickOffTime: '2025-09-07T17:00:00Z' }, // ASZ for Soliman
            { id: 39, gameweek: 5, homeTeam: 'CA', awayTeam: 'CSS', score: null, kickOffTime: '2025-09-07T17:00:00Z' },
            { id: 40, gameweek: 5, homeTeam: 'USM', awayTeam: 'ESS', score: null, kickOffTime: '2025-09-07T17:00:00Z' },

            // Gameweek 6 (06ème Journée)
            { id: 41, gameweek: 6, homeTeam: 'ESS', awayTeam: 'JSK', score: null, kickOffTime: '2025-09-14T17:00:00Z' },
            { id: 42, gameweek: 6, homeTeam: 'JSO', awayTeam: 'CA', score: null, kickOffTime: '2025-09-14T17:00:00Z' },
            { id: 43, gameweek: 6, homeTeam: 'EST', awayTeam: 'EM', score: null, kickOffTime: '2025-09-14T17:00:00Z' },
            { id: 44, gameweek: 6, homeTeam: 'OB', awayTeam: 'ST', score: null, kickOffTime: '2025-09-14T17:00:00Z' },
            { id: 45, gameweek: 6, homeTeam: 'CAB', awayTeam: 'ASG', score: null, kickOffTime: '2025-09-14T17:00:00Z' },
            { id: 46, gameweek: 6, homeTeam: 'ESZ', awayTeam: 'CSS', score: null, kickOffTime: '2025-09-14T17:00:00Z' }, // ESZ for Zarzis
            { id: 47, gameweek: 6, homeTeam: 'USM', awayTeam: 'USBG', score: null, kickOffTime: '2025-09-14T17:00:00Z' },
            { id: 48, gameweek: 6, homeTeam: 'ASM', awayTeam: 'ASZ', score: null, kickOffTime: '2025-09-14T17:00:00Z' }, // ASZ for Soliman

            // Gameweek 7 (07ème Journée)
            { id: 49, gameweek: 7, homeTeam: 'ESM', awayTeam: 'CA', score: null, kickOffTime: '2025-09-21T17:00:00Z' }, // Assuming ESM is EM (Metlaoui)
            { id: 50, gameweek: 7, homeTeam: 'JSK', awayTeam: 'ESZ', score: null, kickOffTime: '2025-09-21T17:00:00Z' }, // ESZ for Zarzis
            { id: 51, gameweek: 7, homeTeam: 'ST', awayTeam: 'ASM', score: null, kickOffTime: '2025-09-21T17:00:00Z' },
            { id: 52, gameweek: 7, homeTeam: 'USBG', awayTeam: 'JSO', score: null, kickOffTime: '2025-09-21T17:00:00Z' },
            { id: 53, gameweek: 7, homeTeam: 'USM', awayTeam: 'CAB', score: null, kickOffTime: '2025-09-21T17:00:00Z' },
            { id: 54, gameweek: 7, homeTeam: 'EST', awayTeam: 'OB', score: null, kickOffTime: '2025-09-21T17:00:00Z' },
            { id: 55, gameweek: 7, homeTeam: 'ASG', awayTeam: 'CSS', score: null, kickOffTime: '2025-09-21T17:00:00Z' },
            { id: 56, gameweek: 7, homeTeam: 'ASZ', awayTeam: 'ESS', score: null, kickOffTime: '2025-09-21T17:00:00Z' }, // ASZ for Soliman

            // Gameweek 8 (08ème Journée)
            { id: 57, gameweek: 8, homeTeam: 'CAB', awayTeam: 'JSK', score: null, kickOffTime: '2025-09-28T17:00:00Z' },
            { id: 58, gameweek: 8, homeTeam: 'ASM', awayTeam: 'EST', score: null, kickOffTime: '2025-09-28T17:00:00Z' },
            { id: 59, gameweek: 8, homeTeam: 'OB', awayTeam: 'EM', score: null, kickOffTime: '2025-09-28T17:00:00Z' },
            { id: 60, gameweek: 8, homeTeam: 'ST', awayTeam: 'ESS', score: null, kickOffTime: '2025-09-28T17:00:00Z' },
            { id: 61, gameweek: 8, homeTeam: 'JSO', awayTeam: 'ASG', score: null, kickOffTime: '2025-09-28T17:00:00Z' },
            { id: 62, gameweek: 8, homeTeam: 'CSS', awayTeam: 'USM', score: null, kickOffTime: '2025-09-28T17:00:00Z' },
            { id: 63, gameweek: 8, homeTeam: 'CA', awayTeam: 'USBG', score: null, kickOffTime: '2025-09-28T17:00:00Z' },
            { id: 64, gameweek: 8, homeTeam: 'ESZ', awayTeam: 'ASZ', score: null, kickOffTime: '2025-09-28T17:00:00Z' }, // ESZ for Zarzis, ASZ for Soliman

            // Gameweek 9 (09ème Journée)
            { id: 65, gameweek: 9, homeTeam: 'ASG', awayTeam: 'CA', score: null, kickOffTime: '2025-10-05T17:00:00Z' },
            { id: 66, gameweek: 9, homeTeam: 'ST', awayTeam: 'ESZ', score: null, kickOffTime: '2025-10-05T17:00:00Z' }, // ESZ for Zarzis
            { id: 67, gameweek: 9, homeTeam: 'OB', awayTeam: 'ASM', score: null, kickOffTime: '2025-10-05T17:00:00Z' },
            { id: 68, gameweek: 9, homeTeam: 'USM', awayTeam: 'JSO', score: null, kickOffTime: '2025-10-05T17:00:00Z' },
            { id: 69, gameweek: 9, homeTeam: 'ASZ', awayTeam: 'CAB', score: null, kickOffTime: '2025-10-05T17:00:00Z' }, // ASZ for Soliman
            { id: 70, gameweek: 9, homeTeam: 'JSK', awayTeam: 'CSS', score: null, kickOffTime: '2025-10-05T17:00:00Z' },
            { id: 71, gameweek: 9, homeTeam: 'EM', awayTeam: 'USBG', score: null, kickOffTime: '2025-10-05T17:00:00Z' },
            { id: 72, gameweek: 9, homeTeam: 'EST', awayTeam: 'ESS', score: null, kickOffTime: '2025-10-05T17:00:00Z' },

            // Gameweek 10 (10ème Journée)
            { id: 73, gameweek: 10, homeTeam: 'JSO', awayTeam: 'JSK', score: null, kickOffTime: '2025-10-12T17:00:00Z' },
            { id: 74, gameweek: 10, homeTeam: 'ESZ', awayTeam: 'EST', score: null, kickOffTime: '2025-10-12T17:00:00Z' }, // ESZ for Zarzis
            { id: 75, gameweek: 10, homeTeam: 'ASM', awayTeam: 'EM', score: null, kickOffTime: '2025-10-12T17:00:00Z' },
            { id: 76, gameweek: 10, homeTeam: 'CAB', awayTeam: 'ST', score: null, kickOffTime: '2025-10-12T17:00:00Z' },
            { id: 77, gameweek: 10, homeTeam: 'USBG', awayTeam: 'ASG', score: null, kickOffTime: '2025-10-12T17:00:00Z' },
            { id: 78, gameweek: 10, homeTeam: 'CA', awayTeam: 'USM', score: null, kickOffTime: '2025-10-12T17:00:00Z' },
            { id: 79, gameweek: 10, homeTeam: 'ASZ', awayTeam: 'OB', score: null, kickOffTime: '2025-10-12T17:00:00Z' }, // ASZ for Soliman
            { id: 80, gameweek: 10, homeTeam: 'CSS', awayTeam: 'ESS', score: null, kickOffTime: '2025-10-12T17:00:00Z' },

            // Gameweek 11 (11ème Journée)
            { id: 81, gameweek: 11, homeTeam: 'JSK', awayTeam: 'CA', score: null, kickOffTime: '2025-10-19T17:00:00Z' },
            { id: 82, gameweek: 11, homeTeam: 'OB', awayTeam: 'ESZ', score: null, kickOffTime: '2025-10-19T17:00:00Z' }, // ESZ for Zarzis
            { id: 83, gameweek: 11, homeTeam: 'ASM', awayTeam: 'JSO', score: null, kickOffTime: '2025-10-19T17:00:00Z' },
            { id: 84, gameweek: 11, homeTeam: 'EM', awayTeam: 'ASG', score: null, kickOffTime: '2025-10-19T17:00:00Z' },
            { id: 85, gameweek: 11, homeTeam: 'EST', awayTeam: 'CAB', score: null, kickOffTime: '2025-10-19T17:00:00Z' },
            { id: 86, gameweek: 11, homeTeam: 'ST', awayTeam: 'CSS', score: null, kickOffTime: '2025-10-19T17:00:00Z' },
            { id: 87, gameweek: 11, homeTeam: 'USM', awayTeam: 'USBG', score: null, kickOffTime: '2025-10-19T17:00:00Z' },
            { id: 88, gameweek: 11, homeTeam: 'ASZ', awayTeam: 'ESS', score: null, kickOffTime: '2025-10-19T17:00:00Z' }, // ASZ for Soliman

            // Gameweek 12 (12ème Journée)
            { id: 89, gameweek: 12, homeTeam: 'USBG', awayTeam: 'JSK', score: null, kickOffTime: '2025-10-26T17:00:00Z' },
            { id: 90, gameweek: 12, homeTeam: 'CSS', awayTeam: 'EST', score: null, kickOffTime: '2025-10-26T17:00:00Z' },
            { id: 91, gameweek: 12, homeTeam: 'ESS', awayTeam: 'EM', score: null, kickOffTime: '2025-10-26T17:00:00Z' },
            { id: 92, gameweek: 12, homeTeam: 'JSO', awayTeam: 'ST', score: null, kickOffTime: '2025-10-26T17:00:00Z' },
            { id: 93, gameweek: 12, homeTeam: 'ESZ', awayTeam: 'ASM', score: null, kickOffTime: '2025-10-26T17:00:00Z' }, // ESZ for Zarzis
            { id: 94, gameweek: 12, homeTeam: 'ASG', awayTeam: 'USM', score: null, kickOffTime: '2025-10-26T17:00:00Z' },
            { id: 95, gameweek: 12, homeTeam: 'CAB', awayTeam: 'OB', score: null, kickOffTime: '2025-10-26T17:00:00Z' },
            { id: 96, gameweek: 12, homeTeam: 'CA', awayTeam: 'ASZ', score: null, kickOffTime: '2025-10-26T17:00:00Z' }, // ASZ for Soliman

            // Gameweek 13 (13ème Journée)
            { id: 97, gameweek: 13, homeTeam: 'ST', awayTeam: 'CA', score: null, kickOffTime: '2025-11-02T17:00:00Z' },
            { id: 98, gameweek: 13, homeTeam: 'ESS', awayTeam: 'ESZ', score: null, kickOffTime: '2025-11-02T17:00:00Z' }, // ESZ for Zarzis
            { id: 99, gameweek: 13, homeTeam: 'EST', awayTeam: 'JSO', score: null, kickOffTime: '2025-11-02T17:00:00Z' },
            { id: 100, gameweek: 13, homeTeam: 'JSK', awayTeam: 'ASG', score: null, kickOffTime: '2025-11-02T17:00:00Z' },
            { id: 101, gameweek: 13, homeTeam: 'EM', awayTeam: 'USM', score: null, kickOffTime: '2025-11-02T17:00:00Z' },
            { id: 102, gameweek: 13, homeTeam: 'ASM', awayTeam: 'CAB', score: null, kickOffTime: '2025-11-02T17:00:00Z' },
            { id: 103, gameweek: 13, homeTeam: 'OB', awayTeam: 'CSS', score: null, kickOffTime: '2025-11-02T17:00:00Z' },
            { id: 104, gameweek: 13, homeTeam: 'ASZ', awayTeam: 'USBG', score: null, kickOffTime: '2025-11-02T17:00:00Z' }, // ASZ for Soliman

            // Gameweek 14 (14ème Journée)
            { id: 105, gameweek: 14, homeTeam: 'USM', awayTeam: 'JSK', score: null, kickOffTime: '2025-11-09T17:00:00Z' },
            { id: 106, gameweek: 14, homeTeam: 'CA', awayTeam: 'EST', score: null, kickOffTime: '2025-11-09T17:00:00Z' },
            { id: 107, gameweek: 14, homeTeam: 'EM', awayTeam: 'ESZ', score: null, kickOffTime: '2025-11-09T17:00:00Z' }, // ESZ for Zarzis
            { id: 108, gameweek: 14, homeTeam: 'USBG', awayTeam: 'ST', score: null, kickOffTime: '2025-11-09T17:00:00Z' },
            { id: 109, gameweek: 14, homeTeam: 'CSS', awayTeam: 'ASZ', score: null, kickOffTime: '2025-11-09T17:00:00Z' }, // ASZ for Soliman
            { id: 110, gameweek: 14, homeTeam: 'JSO', awayTeam: 'OB', score: null, kickOffTime: '2025-11-09T17:00:00Z' },
            { id: 111, gameweek: 14, homeTeam: 'CAB', awayTeam: 'ESS', score: null, kickOffTime: '2025-11-09T17:00:00Z' },
            { id: 112, gameweek: 14, homeTeam: 'ASG', awayTeam: 'ASM', score: null, kickOffTime: '2025-11-09T17:00:00Z' },

            // Gameweek 15 (15ème Journée)
            { id: 113, gameweek: 15, homeTeam: 'OB', awayTeam: 'CA', score: null, kickOffTime: '2025-11-16T17:00:00Z' },
            { id: 114, gameweek: 15, homeTeam: 'JSK', awayTeam: 'EM', score: null, kickOffTime: '2025-11-16T17:00:00Z' },
            { id: 115, gameweek: 15, homeTeam: 'ASM', awayTeam: 'JSO', score: null, kickOffTime: '2025-11-16T17:00:00Z' },
            { id: 116, gameweek: 15, homeTeam: 'ST', awayTeam: 'ASZ', score: null, kickOffTime: '2025-11-16T17:00:00Z' }, // ASZ for Soliman
            { id: 117, gameweek: 15, homeTeam: 'ASZ', awayTeam: 'USM', score: null, kickOffTime: '2025-11-16T17:00:00Z' }, // ASZ for Soliman
            { id: 118, gameweek: 15, homeTeam: 'ESZ', awayTeam: 'CAB', score: null, kickOffTime: '2025-11-16T17:00:00Z' }, // ESZ for Zarzis
            { id: 119, gameweek: 15, homeTeam: 'ESS', awayTeam: 'CSS', score: null, kickOffTime: '2025-11-16T17:00:00Z' },
            { id: 120, gameweek: 15, homeTeam: 'EST', awayTeam: 'ASG', score: null, kickOffTime: '2025-11-16T17:00:00Z' },
        ];

        setGameweeks(allGameweeks);
        setFixtures(mockFixtures);
        setSelectedGameweek(allGameweeks[0]?.id || '');
    }, []);

    const getTeamDetails = (teamId) => {
        return allTeams.find(team => team.id === teamId);
    };

    const filteredFixtures = fixtures.filter(f => f.gameweek === selectedGameweek);

    return (
        <FixturesContainer>
            <h2>Ligue Tunisienne Fixtures (25/26 Season)</h2>
            <GameweekSelector
                value={selectedGameweek}
                onChange={(e) => setSelectedGameweek(parseInt(e.target.value))}
            >
                {gameweeks.map(gw => (
                    <option key={gw.id} value={gw.id}>{gw.name}</option>
                ))}
            </GameweekSelector>

            {filteredFixtures.length > 0 ? (
                filteredFixtures.map(match => {
                    const homeTeam = getTeamDetails(match.homeTeam);
                    const awayTeam = getTeamDetails(match.awayTeam);

                    return (
                        <MatchCard key={match.id}>
                            <div>
                                {homeTeam && <img src={`${process.env.PUBLIC_URL}/images/logos/${homeTeam.logo}`} alt={homeTeam.shortName} className="team-logo" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/30x30/cccccc/000000?text=?" }} />}
                                <span className="team-name-text">{homeTeam ? homeTeam.shortName : match.homeTeam}</span>
                            </div>
                            <div className="score">
                                {match.score ? match.score : 'vs'}
                            </div>
                            <div>
                                <span className="team-name-text">{awayTeam ? awayTeam.shortName : match.awayTeam}</span>
                                {awayTeam && <img src={`${process.env.PUBLIC_URL}/images/logos/${awayTeam.logo}`} alt={awayTeam.shortName} className="team-logo" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/30x30/cccccc/000000?text=?" }} />}
                            </div>
                            <div className="time">
                                {match.score ? 'FT' : new Date(match.kickOffTime).toLocaleString()}
                            </div>
                        </MatchCard>
                    );
                })
            ) : (
                <p>No fixtures found for this gameweek.</p>
            )}
        </FixturesContainer>
    );
}

export default Fixtures;
