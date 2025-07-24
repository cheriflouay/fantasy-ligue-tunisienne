// src/App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import PickTeam from './pages/PickTeam'; // This will be the "My Team" view (11 + bench)
import Transfers from './pages/Transfers'; // New: This will be the "Transfers" view (all 15 on pitch)
import Fixtures from './pages/Fixtures';
import Standings from './pages/Standings';
import PlayerDetails from './pages/PlayerDetails';
import GlobalStyle from './styles/GlobalStyle';

// Import your JSON data
import mockPlayersData from './data/players.json';
import mockTeamsData from './data/clubs.json';

function App() {
    const [activePage, setActivePage] = useState('pickTeamInitial'); // Start on initial team selection
    const [userData, setUserData] = useState(null);
    const [allPlayers, setAllPlayers] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [userOverallPoints, setUserOverallPoints] = useState(0);
    const [userRank, setUserRank] = useState(0);
    // New state to track if the initial 15-player team has been saved
    const [isInitialTeamSaved, setIsInitialTeamSaved] = useState(false);

    useEffect(() => {
        setAllPlayers(mockPlayersData);
        setAllTeams(mockTeamsData);

        const mockUserData = {
            teamName: "My Tunisian XI",
            budget: 100.0,
            players: [], // Initially empty
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
    const handleInitialTeamSave = (squadPlayers) => {
        // Here you would typically save the squadPlayers to a backend
        // For now, we'll update userData and set the flag
        setUserData(prev => ({
            ...prev,
            players: squadPlayers.map(p => p.id) // Save only IDs
        }));
        setIsInitialTeamSaved(true);
        setActivePage('dashboard'); // Redirect to dashboard after initial save
    };

    const renderPage = () => {
        // If initial team is not saved, force user to PickTeamInitial
        if (!isInitialTeamSaved) {
            return (
                <PickTeam
                    userData={userData}
                    allPlayers={allPlayers}
                    allTeams={allTeams}
                    setUserData={setUserData}
                    isInitialPick={true} // Indicate this is the initial 15-player pick
                    onInitialSave={handleInitialTeamSave} // Pass the save handler
                />
            );
        }

        // After initial team is saved, allow navigation to other pages
        switch (activePage) {
            case 'dashboard':
                return <Dashboard userData={userData} />;
            case 'myTeam': // New page for viewing 11 + bench
                return (
                    <PickTeam
                        userData={userData}
                        allPlayers={allPlayers}
                        allTeams={allTeams}
                        setUserData={setUserData}
                        isInitialPick={false} // Not initial pick, so show 11 + bench
                    />
                );
            case 'transfers': // New page for managing 15 players
                return (
                    <Transfers
                        userData={userData}
                        allPlayers={allPlayers}
                        allTeams={allTeams}
                        setUserData={setUserData}
                    />
                );
            case 'fixtures':
                return <Fixtures allTeams={allTeams} />;
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
                isInitialTeamSaved={isInitialTeamSaved} // Pass to Navigation
            />
            <main>
                {renderPage()}
            </main>
        </>
    );
}

export default App;
