// src/components/SelectedTeamDisplay.js
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import PlayerJersey from './PlayerJersey';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

// Styled components for the pitch elements
const PitchContainer = styled.div`
  /* MODIFIED: Pitch background and border to match image */
  background-color: #005d00; /* Darker green for the pitch */
  border-radius: 10px;
  padding: 10px;
  margin-top: 0;
  position: relative;
  aspect-ratio: 4 / 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 280px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  border: 4px solid #004d00; /* Darker border to blend with background */
  box-sizing: border-box; /* Include padding/border in total width/height */


  @media (max-width: 768px) {
    min-height: 250px;
    padding: 8px;
  }
`;

const PitchLine = styled.div.withConfig({
  shouldForwardProp: (prop) =>
    !['top', 'bottom'].includes(prop)
})`
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
  height: 80px;
  border: 2px solid white;
  background-color: transparent;
  left: 50%;
  transform: translateX(-50%);
  ${props => props.top && 'top: 0;'}
  ${props => props.bottom && 'bottom: 0;'}
`;

const GoalArea = styled(PitchLine)`
  width: 40%;
  height: 20px;
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
  ${props => props.top && 'top: 50px;'}
  ${props => props.bottom && 'bottom: 50px;'}
`;

const Goal = styled(PitchLine)`
  width: 20%;
  height: 10px;
  background-color: #333;
  left: 50%;
  transform: translateX(-50%);
  ${props => props.top && 'top: -10px;'}
  ${props => props.bottom && 'bottom: -10px;'}
  border-radius: 2px;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
`;


const PositionRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  width: 100%;
  padding: 5px 0;
  z-index: 2;

  &.goalkeeper-row { margin-top: 5px; }
  &.defender-row { margin-top: 5px; }
  &.midfielder-row { margin-top: 5px; }
  &.forward-row { margin-top: 5px; }
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
  /* NEW STYLING FOR BENCH CONTAINER */
  background-color: #2c3e50; /* Dark blue-grey background from image_b7e1e1.png */
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  padding: 15px 20px; /* Adjusted padding to match image more closely */
  width: 96%;
  max-width: 900px;
  text-align: center;
  border: 4px solid white;

  h4 {
    color: white;
    margin-top: 5px; 
    margin-bottom: 15px;
    font-size: 1.5em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .bench-players {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
  }
`;

// NEW: Styled component for the wrapper around each bench player to add position label
const BenchPlayerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px; /* Space between label and jersey */
    position: relative; /* For absolute positioning of position label if needed */
`;

// NEW: Styled component for the position label on the bench
const BenchPositionLabel = styled.div`
    background-color: #34495e; /* Dark background, same as player name/fixture boxes */
    color: white;
    font-weight: bold;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 0.8em; /* Slightly smaller than player name box */
    text-transform: uppercase;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    min-width: 50px; /* Ensure consistent width */
    text-align: center;
`;


export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center; /* Ensures buttons are centered horizontally */
  gap: 20px;
  margin-top: 20px;
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

export const ActionButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 25px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  flex: 1;
  max-width: 200px;

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
        console.warn(`Cannot place a ${draggedItem.position} in a ${positionType} slot.`);
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


function SelectedTeamDisplay({ selectedPlayers, onRemove, allTeams, allFixtures, onPlayerDrop, isInitialPick, onPositionClick, allAvailablePlayers, onUpdateSelectedPlayers, onResetTeam, captainId, viceCaptainId, onSetCaptain, onSetViceCaptain, substitutionMode, playerToSubstitute, onPlayerClickForSubstitution, onToggleSubstitutionMode }) {
  const [startingXI, setStartingXI] = useState({
    Goalkeeper: [],
    Defender: [],
    Midfielder: [],
    Forward: []
  });
  const [benchPlayers, setBenchPlayers] = useState([]);

  const initialFormationSlots = useMemo(() => ({
    Goalkeeper: 2,
    Defender: 5,
    Midfielder: 5,
    Forward: 3
  }), []);

  const regularFormationSlots = useMemo(() => ({
    Goalkeeper: 1,
    Defender: 4,
    Midfielder: 4,
    Forward: 2,
    Bench: 4
  }), []);

  const maxSquadSize = 15;

  const getNextFixtureForTeam = useCallback((teamId) => {
    if (!allFixtures || allFixtures.length === 0) return 'N/A';

    const now = new Date();

    const teamFixtures = allFixtures.filter(fixture =>
        (fixture.homeTeam === teamId || fixture.awayTeam === teamId) &&
        new Date(fixture.kickOffTime) > now
    );

    teamFixtures.sort((a, b) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime());

    const nextFixture = teamFixtures[0];

    if (nextFixture) {
        const opponentId = nextFixture.homeTeam === teamId ? nextFixture.awayTeam : nextFixture.homeTeam;
        const opponentTeam = allTeams.find(team => team.id === opponentId);
        const homeAway = nextFixture.homeTeam === teamId ? '(H)' : '(A)';
        return `${opponentTeam?.shortName || opponentId} ${homeAway}`;
    }

    return 'N/A';
  }, [allFixtures, allTeams]);


  useEffect(() => {
    const newStartingXI = {
      Goalkeeper: [],
      Defender: [],
      Midfielder: [],
      Forward: []
    };
    let newBenchPlayers = [];

    const mutableSelectedPlayers = [...selectedPlayers];

    const currentFormationLimits = isInitialPick ? initialFormationSlots : regularFormationSlots;

    const playersByPosition = {
      Goalkeeper: mutableSelectedPlayers.filter(p => p && p.position === 'Goalkeeper'),
      Defender: mutableSelectedPlayers.filter(p => p && p.position === 'Defender'),
      Midfielder: mutableSelectedPlayers.filter(p => p && p.position === 'Midfielder'),
      Forward: mutableSelectedPlayers.filter(p => p && p.position === 'Forward')
    };

    for (const posType in currentFormationLimits) {
        if (posType === 'Bench') continue;

        const limit = currentFormationLimits[posType];
        const playersForThisPosition = playersByPosition[posType].slice(0, limit);
        newStartingXI[posType] = Array.from({ length: limit }, (_, i) => playersForThisPosition[i] || null);
    }

    if (!isInitialPick) {
        const remainingPlayers = [
            ...playersByPosition.Goalkeeper.slice(currentFormationLimits.Goalkeeper),
            ...playersByPosition.Defender.slice(currentFormationLimits.Defender),
            ...playersByPosition.Midfielder.slice(currentFormationLimits.Midfielder),
            ...playersByPosition.Forward.slice(currentFormationLimits.Forward)
        ];
        newBenchPlayers = remainingPlayers.slice(0, currentFormationLimits.Bench);

        while (newBenchPlayers.length < currentFormationLimits.Bench) {
            newBenchPlayers.push(null);
        }
    }

    setStartingXI(newStartingXI);
    setBenchPlayers(newBenchPlayers);

  }, [selectedPlayers, isInitialPick, initialFormationSlots, regularFormationSlots]);


  const handlePlayerMoveInSquad = useCallback((draggedPlayer, targetPlayer, targetPositionType) => {
    let newSelectedPlayers = [...selectedPlayers];

    if (!newSelectedPlayers.some(p => p.id === draggedPlayer.id)) {
        if (newSelectedPlayers.length < maxSquadSize) {
            if (isInitialPick || draggedPlayer.position === targetPositionType || targetPositionType === "Bench") {
                onPlayerDrop(draggedPlayer, null, targetPositionType);
            } else {
                console.warn(`Cannot place a ${draggedPlayer.position} in a ${targetPositionType} slot.`);
            }
        } else {
            console.warn("Squad is full! Cannot add more players directly by drop.");
        }
        return;
    }

    const draggedIdx = newSelectedPlayers.findIndex(p => p && p.id === draggedPlayer.id);

    if (targetPlayer) {
        const targetIdx = newSelectedPlayers.findIndex(p => p && p.id === targetPlayer.id);

        if (draggedIdx !== -1 && targetIdx !== -1) {
            if (isInitialPick || draggedPlayer.position === targetPlayer.position ||
                targetPositionType === "Bench" || draggedPlayer.position === "Goalkeeper") {
                 [newSelectedPlayers[draggedIdx], newSelectedPlayers[targetIdx]] =
                 [newSelectedPlayers[targetIdx], newSelectedPlayers[draggedIdx]];
                 onUpdateSelectedPlayers(newSelectedPlayers);
            } else {
                console.warn(`Cannot swap ${draggedPlayer.position} with ${targetPlayer.position} directly on pitch.`);
            }
        }
    } else {
        if (draggedIdx !== -1) {
            const filteredPlayers = newSelectedPlayers.filter(p => p.id !== draggedPlayer.id);
            if (isInitialPick || draggedPlayer.position === targetPositionType || targetPositionType === "Bench") {
                onUpdateSelectedPlayers([...filteredPlayers, draggedPlayer]);
            } else {
                console.warn(`Cannot place a ${draggedPlayer.position} in a ${targetPositionType} slot.`);
            }
        }
    }

  }, [selectedPlayers, isInitialPick, onPlayerDrop, onUpdateSelectedPlayers, maxSquadSize]);


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
              key={player ? player.id : `gk-player-${index}`}
              player={player}
              position="Goalkeeper"
              onRemove={onRemove}
              onMovePlayer={handlePlayerMoveInSquad}
              allTeams={allTeams}
              onPositionClick={onPositionClick}
              playerFixtures={player ? getNextFixtureForTeam(player.team) : null}
              isCaptain={player && captainId === player.id}
              isViceCaptain={player && viceCaptainId === player.id}
              onSetCaptain={onSetCaptain}
              onSetViceCaptain={onSetViceCaptain}
              isInitialPick={isInitialPick}
              canRemove={isInitialPick}
              // NEW: Pass substitution related props
              substitutionMode={substitutionMode}
              playerToSubstitute={playerToSubstitute}
              onPlayerClickForSubstitution={onPlayerClickForSubstitution}
              onToggleSubstitutionMode={onToggleSubstitutionMode} // Pass the toggle function
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
              playerFixtures={player ? getNextFixtureForTeam(player.team) : null}
              isCaptain={player && captainId === player.id}
              isViceCaptain={player && viceCaptainId === player.id}
              onSetCaptain={onSetCaptain}
              onSetViceCaptain={onSetViceCaptain}
              isInitialPick={isInitialPick}
              canRemove={isInitialPick}
              // NEW: Pass substitution related props
              substitutionMode={substitutionMode}
              playerToSubstitute={playerToSubstitute}
              onPlayerClickForSubstitution={onPlayerClickForSubstitution}
              onToggleSubstitutionMode={onToggleSubstitutionMode} // Pass the toggle function
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
              playerFixtures={player ? getNextFixtureForTeam(player.team) : null}
              isCaptain={player && captainId === player.id}
              isViceCaptain={player && viceCaptainId === player.id}
              onSetCaptain={onSetCaptain}
              onSetViceCaptain={onSetViceCaptain}
              isInitialPick={isInitialPick}
              canRemove={isInitialPick}
              // NEW: Pass substitution related props
              substitutionMode={substitutionMode}
              playerToSubstitute={playerToSubstitute}
              onPlayerClickForSubstitution={onPlayerClickForSubstitution}
              onToggleSubstitutionMode={onToggleSubstitutionMode} // Pass the toggle function
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
              playerFixtures={player ? getNextFixtureForTeam(player.team) : null}
              isCaptain={player && captainId === player.id}
              isViceCaptain={player && viceCaptainId === player.id}
              onSetCaptain={onSetCaptain}
              onSetViceCaptain={onSetViceCaptain}
              isInitialPick={isInitialPick}
              canRemove={isInitialPick}
              // NEW: Pass substitution related props
              substitutionMode={substitutionMode}
              playerToSubstitute={playerToSubstitute}
              onPlayerClickForSubstitution={onPlayerClickForSubstitution}
              onToggleSubstitutionMode={onToggleSubstitutionMode} // Pass the toggle function
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
          <h4>Substitutes</h4> {/* Changed title to "Substitutes" */}
          <div className="bench-players">
            {benchPlayers.map((player, index) => (
              <BenchPlayerWrapper key={player ? player.id : `bench-player-empty-${index}`}>
                {/* Determine position abbreviation for the label */}
                <BenchPositionLabel>
                  {player ? (
                    player.position === 'Goalkeeper' ? 'GKP' :
                    player.position === 'Defender' ? 'DEF' :
                    player.position === 'Midfielder' ? 'MID' :
                    player.position === 'Forward' ? 'FWD' :
                    'SUB' // Fallback for bench players
                  ) : (
                    ['GKP', 'DEF', 'MID', 'FWD'][index] || 'SUB' // For empty slots, show a generic position or based on index
                  )}
                </BenchPositionLabel>
                <PlayerJersey
                  player={player}
                  position={player ? player.position : "Bench"}
                  onRemove={onRemove}
                  onMovePlayer={handlePlayerMoveInSquad}
                  allTeams={allTeams}
                  isBench={true}
                  onPositionClick={onPositionClick}
                  playerFixtures={player ? getNextFixtureForTeam(player.team) : null}
                  isCaptain={player && captainId === player.id}
                  isViceCaptain={player && viceCaptainId === player.id}
                  onSetCaptain={onSetCaptain}
                  onSetViceCaptain={onSetViceCaptain}
                  isInitialPick={isInitialPick}
                  canRemove={isInitialPick}
                  // NEW: Pass substitution related props
                  substitutionMode={substitutionMode}
                  playerToSubstitute={playerToSubstitute}
                  onPlayerClickForSubstitution={onPlayerClickForSubstitution}
                  onToggleSubstitutionMode={onToggleSubstitutionMode} // Pass the toggle function
                />
              </BenchPlayerWrapper>
            ))}
          </div>
        </BenchContainer>
      )}

      {/* REMOVED: Auto Pick and Reset Buttons from here. They are now handled by parent components (PickTeam, Transfers). */}
    </>
  );
}

export default SelectedTeamDisplay;
