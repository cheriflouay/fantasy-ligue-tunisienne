// src/pages/Dashboard.js
import React from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
    padding: 20px;
    max-width: 900px;
    margin: 20px auto;
    background-color: var(--card-bg); /* Use defined card background */
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    text-align: center;
`;

const SectionTitle = styled.h2`
    color: var(--primary-green); /* Use defined green */
    border-bottom: 2px solid var(--border-color); /* Use defined border color */
    padding-bottom: 10px;
    margin-top: 30px;
    font-size: 1.8em;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
    margin-bottom: 40px;
`;

const StatCard = styled.div`
    background-color: #f9f9f9; /* Slightly off-white for stat cards */
    padding: 20px;
    border-radius: 5px;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);

    h3 {
        color: var(--dark-text); /* Use defined dark text */
        margin-bottom: 10px;
        font-size: 1.2em;
    }
    p {
        font-size: 2.5em;
        font-weight: bold;
        color: var(--secondary-red); /* Use defined red */
        margin: 0;
    }
`;

const CallToAction = styled.div`
    background-color: #e6ffe6; /* Light green background */
    padding: 25px;
    border-radius: 8px;
    border: 1px dashed var(--primary-green); /* Dashed border with primary green */
    margin-top: 30px;
    font-size: 1.2em;
    color: var(--dark-text);
    font-weight: 500;

    a {
        color: var(--secondary-red); /* Link color */
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
                Go to <a href="#pickTeam" onClick={() => window.location.hash = 'pickTeam'}>Pick Team</a> to get started!
            </CallToAction>
        </DashboardContainer>
    );
}

export default Dashboard;
