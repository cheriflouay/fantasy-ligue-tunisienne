// src/pages/Dashboard.js
import React from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
    padding: 20px;
    max-width: 900px;
    margin: 20px auto;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    text-align: center; /* Center align content */
`;

const SectionTitle = styled.h2`
    color: #008000; /* Tunisian Flag Green */
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
    margin-top: 30px;
    font-size: 1.8em; /* Larger title */
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
    margin-bottom: 40px; /* More space below stats */
`;

const StatCard = styled.div`
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 5px;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);

    h3 {
        color: #333;
        margin-bottom: 10px;
        font-size: 1.2em;
    }
    p {
        font-size: 2.5em; /* Even larger font for numbers */
        font-weight: bold;
        color: #CC0000; /* Tunisian Flag Red */
        margin: 0;
    }
`;

const CallToAction = styled.div`
    background-color: #e6ffe6; /* Light green background */
    padding: 25px;
    border-radius: 8px;
    border: 1px dashed #008000; /* Dashed border to highlight */
    margin-top: 30px;
    font-size: 1.2em;
    color: #333;
    font-weight: 500;

    a {
        color: #CC0000; /* Link color */
        text-decoration: none;
        font-weight: bold;
        &:hover {
            text-decoration: underline;
        }
    }
`;

function Dashboard({ userData }) {
    if (!userData) {
        return <DashboardContainer>Loading user data...</DashboardContainer>;
    }

    return (
        <DashboardContainer>
            <SectionTitle>Welcome, {userData.teamName}! 👋</SectionTitle>
            <StatsGrid>
                <StatCard>
                    <h3>Gameweek Points</h3>
                    <p>{userData.gameweekPoints}</p>
                </StatCard>
                <StatCard>
                    <h3>Total Points</h3>
                    <p>{userData.totalOverallPoints}</p>
                </StatCard>
                <StatCard>
                    <h3>Remaining Budget</h3>
                    <p>${userData.budget.toFixed(1)}M</p>
                </StatCard>
            </StatsGrid>

            <CallToAction>
                The season hasn't started yet! Build your dream team for the new season.
                <br />
                {/* Corrected href to point to a valid fragment identifier */}
                Go to <a href="#pickTeam" onClick={() => window.location.hash = 'pickTeam'}>Pick Team</a> to get started!
            </CallToAction>
        </DashboardContainer>
    );
}

export default Dashboard;
