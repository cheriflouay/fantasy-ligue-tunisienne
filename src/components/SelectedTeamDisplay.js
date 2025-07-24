import React, { useCallback, useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import PlayerJersey from './PlayerJersey';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

// Styled components for the pitch elements (no changes needed here from previous)
const PitchContainer = styled.div`
  background-color: #008000; /* Dark green for the pitch */
  border-radius: 10px;
  padding: 15px;
  margin-top: 0;
  position: relative;
  aspect-ratio: 3 / 4;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 600px; /* Increased height */
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  border: 4px solid white; /* Outer pitch lines */

  @media (max-width: 768px) {
    min-height: 500px;
    padding: 10px;
  }
`;

const PitchLine = styled.div`
  background-color: white;
  position: absolute;
`;

const HalfwayLine = styled(PitchLine)`
  width: 100%;
  height: 2px;
  top: 50%;
  transform: translateY(-50%);
`;

const CenterCircle = styled(PitchLine)`
  width: 100px;
  height: 100px;
  border: 2px solid white;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: transparent;
`;

const CenterSpot = styled(PitchLine)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const PenaltyArea = styled(PitchLine)`
  width: 80%;
  height: 160px; /* Adjusted height for better proportion */
  border: 2px solid white;
  background-color: transparent;
  left: 50%;
  transform: translateX(-50%);
  ${props => props.top && 'top: 0;'}
  ${props => props.bottom && 'bottom: 0;'}
`;

const GoalArea = styled(PitchLine)`
  width: 40%;
  height: 60px; /* Adjusted height */
  border: 2px solid white;
  background-color: transparent;
  left: 50%;
  transform: translateX(-50%);
  ${props => props.top && 'top: 0;'}
  ${props => props.bottom && 'bottom: 0;'}
`;

const PenaltySpot = styled(PitchLine)`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  left: 50%;
  transform: translateX(-50%);
  ${props => props.top && 'top: 100px;'} /* Position relative to top of pitch */
  ${props => props.bottom && 'bottom: 100px;'} /* Position relative to bottom of pitch */
`;

const Goal = styled(PitchLine)`
  width: 20%;
  height: 10px; /* Represents the depth of the goal */
  background-color: #333; /* Dark color for goal post */
  left: 50%;
  transform: translateX(-50%);
  ${props => props.top && 'top: -10px;'} /* Place just outside the top edge */
  ${props => props.bottom && 'bottom: -10px;'} /* Place just outside the bottom edge */
  border-radius: 2px;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
`;


const PositionRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  width: 100%;
  padding: 5px 0;
  z-index: 2; /* Ensure players are above pitch lines */

  /* Adjusted margins for the new "upside down" visual order */
  &.goalkeeper-row { margin-top: 50px; } /* Goalkeeper at the very top of the display, inside goal area */
  &.defender-row { margin-top: 60px; } /* Defenders below Goalkeepers */
  &.midfielder-row { margin-top: 60px; } /* Midfielders below Defenders */
  &.forward-row { margin-top: 60px; } /* Forwards at the bottom of the display */
`;

const EmptySlot = styled.div`
  width: 95px;
  height: 100px;
  border: 2px dashed rgba(255,255,255,0.6);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;

  .slot-position-abbr {
    font-size: 1.5em;
    font-weight: bold;
    color: rgba(255,255,255,0.8);
    margin-bottom: 5px;
    text-shadow: 0 0 3px rgba(0,0,0,0.8);
  }

  .plus-icon {
    color: rgba(255,255,255,0.8);
    font-size: 1.8em;
  }

  &:hover {
    border-color: #fff;
    .slot-position-abbr, .plus-icon {
      color: #fff;
    }
  }
`;

const BenchContainer = styled.div`
  background-color: #f0f2f5;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  padding: 15px;
  margin-top: 20px;
  width: 100%;
  text-align: center;
  border: 1px solid #ddd;

  h4 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.1em;
  }

  .bench-players {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center; /* Ensures buttons are centered horizontally */
  gap: 20px;
  margin-top: 30px; /* Space from the team display or bench */
  width: 100%;
  max-width: 600px; /* Limit width for better appearance */
  margin-left: auto; /* Center the container */
  margin-right: auto; /* Center the container */
`;

const ActionButton = styled.button`
  background-color: #4CAF50; /* Green background */
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 25px; /* Rounded corners */
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  flex: 1; /* Allow buttons to grow and fill space */
  max-width: 200px; /* Max width for individual buttons */

  &:hover {
    background-color: #45a049;
    transform: translateY(-2px);
  }

  &:active {
    background-color: #3e8e41;
    transform: translateY(0);
  }
`;


// eslint-disable-next-line no-unused-vars
const EmptyDropTarget = ({ positionType, onPlayerDrop, onPositionClick }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'player',
    drop: (draggedItem) => {
      // Allow dropping any player type into Bench, or correct position type onto pitch slot
      if (positionType === "Bench" || draggedItem.player.position === positionType) {
        onPlayerDrop(draggedItem.player, null, positionType);
      } else {
        console.warn(`Cannot place a ${draggedItem.player.position} in a ${positionType} slot.`);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [positionType, onPlayerDrop]);

  const positionAbbr = {
    Goalkeeper: 'GKP',
    Defender: 'DEF',
    Midfielder: 'MID',
    Forward: 'FWD',
    Bench: 'SUB'
  };

  return (
    <EmptySlot ref={drop} isOver={isOver} onClick={() => onPositionClick(positionType)}>
      <span className="slot-position-abbr">{positionAbbr[positionType]}</span>
      <FontAwesomeIcon icon={faPlus} className="plus-icon" />
    </EmptySlot>
  );
};

// Helper function to shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};


function SelectedTeamDisplay({ selectedPlayers, onRemove, allTeams, allFixtures, onPlayerDrop, isInitialPick, onPositionClick, allAvailablePlayers, onUpdateSelectedPlayers, onResetTeam }) {
  const [startingXI, setStartingXI] = useState({
    Goalkeeper: [],
    Defender: [],
    Midfielder: [],
    Forward: []
  });
  // benchPlayers is only relevant when !isInitialPick
  const [benchPlayers, setBenchPlayers] = useState([]);

  // Define the exact formation slots for initial pick and regular play using useMemo
  const initialFormationSlots = useMemo(() => ({
    Goalkeeper: 2,
    Defender: 5,
    Midfielder: 5,
    Forward: 3
  }), []); // Empty dependency array means it's created once

  const regularFormationSlots = useMemo(() => ({
    Goalkeeper: 1,
    Defender: 4,
    Midfielder: 4,
    Forward: 2,
    Bench: 4 // This is for the actual bench outside the pitch
  }), []); // Empty dependency array means it's created once

  const maxSquadSize = 15; // Total players allowed

  // Helper to get the next fixture for a given team
  const getNextFixtureForTeam = useCallback((teamId) => {
    if (!allFixtures || allFixtures.length === 0) return 'N/A';

    const now = new Date(); // Get current date and time

    // Filter for fixtures involving the team and are in the future or current gameweek
    const teamFixtures = allFixtures.filter(fixture =>
        (fixture.homeTeam === teamId || fixture.awayTeam === teamId) &&
        new Date(fixture.kickOffTime) > now // Only future fixtures
    );

    // Sort by kickOffTime to find the very next one
    teamFixtures.sort((a, b) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime());

    const nextFixture = teamFixtures[0];

    if (nextFixture) {
        const opponentId = nextFixture.homeTeam === teamId ? nextFixture.awayTeam : nextFixture.homeTeam;
        const opponentTeam = allTeams.find(team => team.id === opponentId);
        const homeAway = nextFixture.homeTeam === teamId ? '(H)' : '(A)';
        return `${opponentTeam?.shortName || opponentId} ${homeAway}`;
    }

    return 'N/A'; // No upcoming fixture found
  }, [allFixtures, allTeams]); // Dependencies for useCallback


  // This useEffect synchronizes the internal startingXI and benchPlayers state
  // with the 'selectedPlayers' prop received from the parent.
  useEffect(() => {
    const newStartingXI = {
      Goalkeeper: [],
      Defender: [],
      Midfielder: [],
      Forward: []
    };
    let newBenchPlayers = []; // Only used if !isInitialPick

    // Make a copy to avoid mutating prop directly
    const mutableSelectedPlayers = [...selectedPlayers];

    // Determine current formation limits based on isInitialPick
    const currentFormationLimits = isInitialPick ? initialFormationSlots : regularFormationSlots;

    // Separate players by their actual position
    const playersByPosition = {
      Goalkeeper: mutableSelectedPlayers.filter(p => p && p.position === 'Goalkeeper'),
      Defender: mutableSelectedPlayers.filter(p => p && p.position === 'Defender'),
      Midfielder: mutableSelectedPlayers.filter(p => p && p.position === 'Midfielder'),
      Forward: mutableSelectedPlayers.filter(p => p && p.position === 'Forward')
    };

    // Fill starting XI positions first based on currentFormationLimits
    for (const posType in currentFormationLimits) {
        if (posType === 'Bench') continue; // Skip bench for pitch placement

        const limit = currentFormationLimits[posType];
        // Take players for the primary formation display
        // Ensure we don't take more players than the limit, and fill with nulls if fewer
        const playersForThisPosition = playersByPosition[posType].slice(0, limit);
        newStartingXI[posType] = Array.from({ length: limit }, (_, i) => playersForThisPosition[i] || null);
    }

    // For the initial pick, there is no separate bench; all 15 are placed on pitch conceptually.
    if (!isInitialPick) {
        // Collect all remaining players (those not in starting XI)
        const remainingPlayers = [
            ...playersByPosition.Goalkeeper.slice(currentFormationLimits.Goalkeeper), // Players beyond starting XI limit
            ...playersByPosition.Defender.slice(currentFormationLimits.Defender),
            ...playersByPosition.Midfielder.slice(currentFormationLimits.Midfielder),
            ...playersByPosition.Forward.slice(currentFormationLimits.Forward)
        ];
        newBenchPlayers = remainingPlayers.slice(0, currentFormationLimits.Bench); // Take up to 4 for bench

        // Fill remaining bench slots with null if less than 4
        while (newBenchPlayers.length < currentFormationLimits.Bench) {
            newBenchPlayers.push(null);
        }
    }

    setStartingXI(newStartingXI);
    setBenchPlayers(newBenchPlayers);

  }, [selectedPlayers, isInitialPick, initialFormationSlots, regularFormationSlots]);


  const handlePlayerMoveInSquad = useCallback((draggedPlayer, targetPlayer, targetPositionType) => {
    let newSelectedPlayers = [...selectedPlayers];

    // Scenario 1: Dragging a player from the list (not already in squad)
    if (!newSelectedPlayers.some(p => p.id === draggedPlayer.id)) {
        if (newSelectedPlayers.length < maxSquadSize) { // Max 15 players total
            // Before adding, check if adding to a specific pitch position matches player's actual position
            // or if it's the initial pick (where positions are more flexible for adding)
            if (isInitialPick || draggedPlayer.position === targetPositionType || targetPositionType === "Bench") {
                onPlayerDrop(draggedPlayer, null, targetPositionType); // Delegate to parent's handleAddPlayer
            } else {
                console.warn(`Cannot place a ${draggedPlayer.position} in a ${targetPositionType} slot.`);
            }
        } else {
            console.warn("Squad is full! Cannot add more players directly by drop.");
        }
        return;
    }

    // Scenario 2: Swapping players within the squad or moving to an empty slot
    const draggedIdx = newSelectedPlayers.findIndex(p => p && p.id === draggedPlayer.id);

    if (targetPlayer) { // Swapping with another player already in squad
        const targetIdx = newSelectedPlayers.findIndex(p => p && p.id === targetPlayer.id);

        if (draggedIdx !== -1 && targetIdx !== -1) {
            // Check if positions are compatible for a swap, or if it's a bench move
            // For initial pick, the pitch is flexible, so simple swap is ok.
            // For regular mode, need stricter rules for pitch positions.
            if (isInitialPick || draggedPlayer.position === targetPlayer.position ||
                targetPositionType === "Bench" || draggedPlayer.position === "Goalkeeper") { // Example: GK can only swap with GK
                 [newSelectedPlayers[draggedIdx], newSelectedPlayers[targetIdx]] =
                 [newSelectedPlayers[targetIdx], newSelectedPlayers[draggedIdx]];
                 onUpdateSelectedPlayers(newSelectedPlayers);
            } else {
                console.warn(`Cannot swap ${draggedPlayer.position} with ${targetPlayer.position} directly on pitch.`);
            }
        }
    } else { // Moving to an empty slot
        if (draggedIdx !== -1) {
            // For simplicity, for moves within the squad to an empty slot,
            // we remove the player and then the useEffect re-distributes.
            // A more precise solution would put the player in the exact target empty slot.
            const filteredPlayers = newSelectedPlayers.filter(p => p.id !== draggedPlayer.id);
            if (isInitialPick || draggedPlayer.position === targetPositionType || targetPositionType === "Bench") {
                onUpdateSelectedPlayers([...filteredPlayers, draggedPlayer]);
            } else {
                console.warn(`Cannot place a ${draggedPlayer.position} in a ${targetPositionType} slot.`);
            }
        }
    }

  }, [selectedPlayers, isInitialPick, onPlayerDrop, onUpdateSelectedPlayers, maxSquadSize]);


  const handleAutoPick = useCallback(() => {
    if (!allAvailablePlayers || allAvailablePlayers.length === 0) {
      console.warn("No available players to auto-pick.");
      return;
    }

    let teamToBuild = [];
    // Filter out players already selected by the user to avoid duplicates in auto-pick
    let availablePool = shuffleArray(
        allAvailablePlayers.filter(p => !selectedPlayers.some(sp => sp && sp.id === p.id))
    );

    // Use the specific formation for auto-pick based on isInitialPick
    const targetFormation = isInitialPick ? initialFormationSlots : regularFormationSlots;

    // Prioritize filling required positions
    for (const posType of ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']) {
        const requiredCount = targetFormation[posType];
        let playersInPosition = teamToBuild.filter(p => p && p.position === posType).length;

        while (playersInPosition < requiredCount && teamToBuild.length < maxSquadSize) {
            const potentialPlayerIndex = availablePool.findIndex(p => p && p.position === posType);
            if (potentialPlayerIndex !== -1) {
                const playerToAdd = availablePool[potentialPlayerIndex];
                teamToBuild.push(playerToAdd);
                availablePool.splice(potentialPlayerIndex, 1); // Remove from available pool
                playersInPosition++;
            } else {
                // If not enough players for this specific position, break and move to next position
                break;
            }
        }
    }

    // For non-initial pick, also fill the bench (if not already full)
    if (!isInitialPick) {
        const benchLimit = targetFormation.Bench;
        let playersOnBench = teamToBuild.length - (targetFormation.Goalkeeper + targetFormation.Defender + targetFormation.Midfielder + targetFormation.Forward);
        while (playersOnBench < benchLimit && teamToBuild.length < maxSquadSize && availablePool.length > 0) {
            const playerToAdd = availablePool.shift(); // Take any available player for bench
            if (playerToAdd) {
                teamToBuild.push(playerToAdd);
            }
        }
    } else { // If isInitialPick, ensure exactly 15 players are selected overall
        while (teamToBuild.length < maxSquadSize && availablePool.length > 0) {
            const playerToAdd = availablePool.shift(); // Take any available player to fill up to 15
            if (playerToAdd) {
                teamToBuild.push(playerToAdd);
            }
        }
    }


    // Ensure unique players in the final teamToBuild array (though filtering above should handle most cases)
    const finalTeamSet = new Set();
    const uniqueTeam = [];
    for(const player of teamToBuild) {
        if(player && !finalTeamSet.has(player.id)) {
            finalTeamSet.add(player.id);
            uniqueTeam.push(player);
        }
    }

    if (onUpdateSelectedPlayers) {
        onUpdateSelectedPlayers(uniqueTeam);
    }
  }, [allAvailablePlayers, selectedPlayers, isInitialPick, onUpdateSelectedPlayers, initialFormationSlots, regularFormationSlots, maxSquadSize]);


  const handleReset = useCallback(() => {
    if (onResetTeam) {
      onResetTeam(); // Call the prop to reset the team (e.g., set selectedPlayers to [])
    }
  }, [onResetTeam]);


  return (
    <>
      <PitchContainer>
        {/* CSS-drawn pitch elements */}
        <HalfwayLine />
        <CenterCircle />
        <CenterSpot />
        <PenaltyArea top />
        <GoalArea top />
        <PenaltySpot top />
        <PenaltyArea bottom />
        <GoalArea bottom />
        <PenaltySpot bottom />
        <Goal top />
        <Goal bottom />

        {/* Goalkeeper Row */}
        <PositionRow className="goalkeeper-row">
          {startingXI.Goalkeeper.map((player, index) => (
            <PlayerJersey
              key={player ? player.id : `gk-player-${index}`} // Use a distinct key for actual players
              player={player}
              position="Goalkeeper"
              onRemove={onRemove}
              onMovePlayer={handlePlayerMoveInSquad}
              allTeams={allTeams}
              onPositionClick={onPositionClick}
              playerFixtures={player ? getNextFixtureForTeam(player.team) : null} // Pass fixture
            />
          ))}
        </PositionRow>

        {/* Defenders Row */}
        <PositionRow className="defender-row">
          {startingXI.Defender.map((player, index) => (
            <PlayerJersey
              key={player ? player.id : `def-player-${index}`}
              player={player}
              position="Defender"
              onRemove={onRemove}
              onMovePlayer={handlePlayerMoveInSquad}
              allTeams={allTeams}
              onPositionClick={onPositionClick}
              playerFixtures={player ? getNextFixtureForTeam(player.team) : null} // Pass fixture
            />
          ))}
        </PositionRow>

        {/* Midfielders Row */}
        <PositionRow className="midfielder-row">
          {startingXI.Midfielder.map((player, index) => (
            <PlayerJersey
              key={player ? player.id : `mid-player-${index}`}
              player={player}
              position="Midfielder"
              onRemove={onRemove}
              onMovePlayer={handlePlayerMoveInSquad}
              allTeams={allTeams}
              onPositionClick={onPositionClick}
              playerFixtures={player ? getNextFixtureForTeam(player.team) : null} // Pass fixture
            />
          ))}
        </PositionRow>

        {/* Forwards Row */}
        <PositionRow className="forward-row">
          {startingXI.Forward.map((player, index) => (
            <PlayerJersey
              key={player ? player.id : `fwd-player-${index}`}
              player={player}
              position="Forward"
              onRemove={onRemove}
              onMovePlayer={handlePlayerMoveInSquad}
              allTeams={allTeams}
              onPositionClick={onPositionClick}
              playerFixtures={player ? getNextFixtureForTeam(player.team) : null} // Pass fixture
            />
          ))}
        </PositionRow>

        {selectedPlayers.length === 0 && (
          <p style={{ color: 'white', fontSize: '1em', marginTop: '20px', zIndex: 3, textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
            Drag players from the list to build your team!
          </p>
        )}
      </PitchContainer>

      {/* Bench Area - Conditionally render based on isInitialPick */}
      {!isInitialPick && (
        <BenchContainer>
          <h4>Bench ({benchPlayers.filter(Boolean).length}/4)</h4>
          <div className="bench-players">
            {benchPlayers.map((player, index) => (
              <PlayerJersey
                key={player ? player.id : `bench-player-empty-${index}`}
                player={player}
                position={player ? player.position : "Bench"}
                onRemove={onRemove}
                onMovePlayer={handlePlayerMoveInSquad}
                allTeams={allTeams}
                isBench={true}
                onPositionClick={onPositionClick}
                playerFixtures={player ? getNextFixtureForTeam(player.team) : null} // Pass fixture
              />
            ))}
          </div>
        </BenchContainer>
      )}


      {/* Auto Pick and Reset Buttons */}
      <ButtonContainer>
        <ActionButton onClick={handleAutoPick}>Auto Pick</ActionButton>
        <ActionButton onClick={handleReset}>Reset</ActionButton>
      </ButtonContainer>
    </>
  );
}

export default SelectedTeamDisplay;
