// src/App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import PickTeam from './pages/PickTeam';
import Transfers from './pages/Transfers';
import Fixtures from './pages/Fixtures';
import Standings from './pages/Standings';
import PlayerDetails from './pages/PlayerDetails';
import GlobalStyle from './styles/GlobalStyle';

// Import your JSON data
import mockPlayersData from './data/players.json';
import mockTeamsData from './data/clubs.json';
import mockFixturesData from './data/fixtures.json'; // Assuming you'll create this file from Fixtures.js mock data

function App() {
    const [activePage, setActivePage] = useState('pickTeamInitial');
    const [userData, setUserData] = useState(null);
    const [allPlayers, setAllPlayers] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [allFixtures, setAllFixtures] = useState([]); // New state for fixtures
    const [userOverallPoints, setUserOverallPoints] = useState(0);
    const [userRank, setUserRank] = useState(0);
    const [isInitialTeamSaved, setIsInitialTeamSaved] = useState(false);

    useEffect(() => {
        setAllPlayers(mockPlayersData);
        setAllTeams(mockTeamsData);
        setAllFixtures(mockFixturesData); // Load mock fixtures

        const mockUserData = {
            teamName: "My Tunisian XI",
            budget: 100.0, // Starting budget
            players: [], // Initially empty player IDs
            captainId: null,
            viceCaptainId: null,
            gameweekPoints: 0,
            totalOverallPoints: 0,
            overallRank: 'N/A'
        };

        setUserData(mockUserData);
        setUserOverallPoints(mockUserData.totalOverallPoints);
        setUserRank(mockUserData.overallRank);
    }, []);

    // Function to handle the initial team save
    const handleInitialTeamSave = (squadPlayers, finalBudget) => {
        setUserData(prev => ({
            ...prev,
            players: squadPlayers.map(p => p.id), // Save only IDs
            budget: parseFloat(finalBudget) // Update final budget
        }));
        setIsInitialTeamSaved(true);
        setActivePage('dashboard');
    };

    const renderPage = () => {
        if (!isInitialTeamSaved) {
            return (
                <PickTeam
                    userData={userData}
                    allPlayers={allPlayers}
                    allTeams={allTeams}
                    allFixtures={allFixtures} // Pass allFixtures
                    setUserData={setUserData}
                    isInitialPick={true}
                    onInitialSave={handleInitialTeamSave}
                />
            );
        }

        switch (activePage) {
            case 'dashboard':
                return <Dashboard userData={userData} />;
            case 'myTeam':
                return (
                    <PickTeam
                        userData={userData}
                        allPlayers={allPlayers}
                        allTeams={allTeams}
                        allFixtures={allFixtures} // Pass allFixtures
                        setUserData={setUserData}
                        isInitialPick={false}
                    />
                );
            case 'transfers':
                return (
                    <Transfers
                        userData={userData}
                        allPlayers={allPlayers}
                        allTeams={allTeams}
                        allFixtures={allFixtures} // Pass allFixtures
                        setUserData={setUserData}
                    />
                );
            case 'fixtures':
                return <Fixtures allTeams={allTeams} allFixtures={allFixtures} />; // Pass allFixtures
            case 'standings':
                return <Standings allTeams={allTeams} />;
            case 'playerDetails':
                return <PlayerDetails />;
            default:
                return <Dashboard userData={userData} />;
        }
    };

    return (
        <>
            <GlobalStyle />
            <Header userRank={userRank} userOverallPoints={userOverallPoints} />
            <Navigation
                setActivePage={setActivePage}
                activePage={activePage}
                isInitialTeamSaved={isInitialTeamSaved}
            />
            <main>
                {renderPage()}
            </main>
        </>
    );
}

export default App;
