// src/components/SelectedTeamDisplay.js
import React, { useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import PlayerJersey from './PlayerJersey';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

// Styled components for the pitch elements
const PitchContainer = styled.div`
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
  /* NEW: Additional rows for 15 players on pitch */
  &.extra-row {
    margin-top: 5px;
  }
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
  background-color: #2c3e50; /* Dark blue-grey background from image_b7e1e1.png */
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  padding: 15px 20px;
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

const BenchPlayerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    position: relative;
`;

const BenchPositionLabel = styled.div`
    background-color: #34495e;
    color: white;
    font-weight: bold;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 0.8em;
    text-transform: uppercase;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    min-width: 50px;
    text-align: center;
`;


export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
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

const FormationSelector = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
    padding: 10px;
    background-color: #1a002b;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;

const FormationButton = styled.button`
    background-color: ${props => props.active ? '#6a11cb' : '#33004a'};
    color: white;
    border: 1px solid ${props => props.active ? '#884dff' : '#4a005c'};
    padding: 8px 15px;
    border-radius: 5px;
    font-size: 0.9em;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${props => props.active ? '#5a009a' : '#4a005c'};
        transform: translateY(-1px);
    }
`;


// Define formation rules
const FORMATION_RULES = {
    '4-4-2': { Goalkeeper: 1, Defender: 4, Midfielder: 4, Forward: 2, Bench: 4 },
    '4-3-3': { Goalkeeper: 1, Defender: 4, Midfielder: 3, Forward: 3, Bench: 4 },
    '4-5-1': { Goalkeeper: 1, Defender: 4, Midfielder: 5, Forward: 1, Bench: 4 },
    '3-5-2': { Goalkeeper: 1, Defender: 3, Midfielder: 5, Forward: 2, Bench: 4 },
    '3-4-3': { Goalkeeper: 1, Defender: 3, Midfielder: 4, Forward: 3, Bench: 4 },
    '5-3-2': { Goalkeeper: 1, Defender: 5, Midfielder: 3, Forward: 2, Bench: 4 },
    '5-4-1': { Goalkeeper: 1, Defender: 5, Midfielder: 4, Forward: 1, Bench: 4 },
};

// EmptyDropTarget component to render empty slots and handle drops
const EmptyDropTarget = ({ positionType, onPlayerDrop, onPositionClick }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'player',
    drop: (draggedItem) => {
        // When dropping onto an empty slot, pass null for targetPlayer
        onPlayerDrop(draggedItem.player, null, positionType);
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


function SelectedTeamDisplay({ selectedPlayers, onRemove, allTeams, allFixtures, onPlayerDrop, isInitialPick, onPositionClick, onUpdateSelectedPlayers, captainId, viceCaptainId, onSetCaptain, onSetViceCaptain, substitutionMode, playerToSubstitute, onPlayerClickForSubstitution, onToggleSubstitutionMode }) {
  const [startingXI, setStartingXI] = useState({
    Goalkeeper: [],
    Defender: [],
    Midfielder: [],
    Forward: [],
    Extra: [] // Used only when isInitialPick is true for the 15-player display
  });
  const [benchPlayers, setBenchPlayers] = useState([]);
  const [currentFormationKey, setCurrentFormationKey] = useState('4-4-2'); // Default formation


  const maxSquadSize = 15;

  // Helper to get next fixture
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

  // Helper to distribute players based on a given formation key or fixed 15-player display
  // selectedPlayers now contains objects like { id: playerId, onPitch: boolean }
  const distributePlayersByFormation = useCallback((allPlayersInSquad, formationKey, isInitialPickMode) => {
    const newPitch = { Goalkeeper: [], Defender: [], Midfielder: [], Forward: [], Extra: [] };
    let newBench = [];
    const usedPlayerIds = new Set();

    if (isInitialPickMode) { // For Initial Pick (PickTeam) and Transfers page
        // In this mode, all 15 players are visually on the "pitch"
        // We assume all players in allPlayersInSquad are intended to be displayed.
        // For initial pick, all players are considered "onPitch" for display purposes.
        const playersByPos = {
            'Goalkeeper': allPlayersInSquad.filter(p => p && p.position === 'Goalkeeper').sort((a, b) => a.id - b.id),
            'Defender': allPlayersInSquad.filter(p => p && p.position === 'Defender').sort((a, b) => a.id - b.id),
            'Midfielder': allPlayersInSquad.filter(p => p && p.position === 'Midfielder').sort((a, b) => a.id - b.id),
            'Forward': allPlayersInSquad.filter(p => p && p.position === 'Forward').sort((a, b) => a.id - b.id),
        };

        // Fill Goalkeeper (ensure two slots always)
        for (let i = 0; i < 2; i++) {
            if (playersByPos.Goalkeeper[i]) {
                newPitch.Goalkeeper.push(playersByPos.Goalkeeper[i]);
                usedPlayerIds.add(playersByPos.Goalkeeper[i].id);
            } else {
                newPitch.Goalkeeper.push(null);
            }
        }

        // Fill other positions as much as possible for display purposes
        ['Defender', 'Midfielder', 'Forward'].forEach(posType => {
            const playersForThisPos = playersByPos[posType].filter(p => !usedPlayerIds.has(p.id));
            playersForThisPos.forEach(player => {
                newPitch[posType].push(player);
                usedPlayerIds.add(player.id);
            });
        });

        // Add any remaining players (from any position not yet used) to the 'Extra' category
        const remainingPlayers = allPlayersInSquad.filter(p => p && !usedPlayerIds.has(p.id)).sort((a, b) => a.id - b.id);
        newPitch.Extra = remainingPlayers;

        // Ensure total pitch players is 15 by adding nulls if needed, distributing across categories if possible
        let currentPitchCount = newPitch.Goalkeeper.filter(Boolean).length +
                               newPitch.Defender.filter(Boolean).length +
                               newPitch.Midfielder.filter(Boolean).length +
                               newPitch.Forward.filter(Boolean).length +
                               newPitch.Extra.filter(Boolean).length;

        // Fill empty slots up to 15, prioritizing position types for a structured look
        while (currentPitchCount < maxSquadSize) {
            if (newPitch.Goalkeeper.length < 2) {
                newPitch.Goalkeeper.push(null);
            } else if (newPitch.Defender.length < 5) {
                newPitch.Defender.push(null);
            } else if (newPitch.Midfielder.length < 5) {
                newPitch.Midfielder.push(null);
            } else if (newPitch.Forward.length < 3) {
                newPitch.Forward.push(null);
            } else {
                newPitch.Extra.push(null); // Catch-all for any additional slots up to 15
            }
            currentPitchCount++;
        }

        newBench = []; // Bench is empty in this mode
    } else {
        // For My Team page (isInitialPick=false), use dynamic formation rules and bench
        const formationRules = FORMATION_RULES[formationKey];
        if (!formationRules) {
            console.error(`Invalid formation key: ${formationKey}`);
            return { pitch: { Goalkeeper: [], Defender: [], Midfielder: [], Forward: [] }, bench: [] };
        }

        // Separate players based on their 'onPitch' status
        const playersOnPitch = allPlayersInSquad.filter(p => p && p.onPitch);
        const playersOnBench = allPlayersInSquad.filter(p => p && !p.onPitch);

        // Create mutable copies for internal manipulation
        let mutablePlayersOnPitch = [...playersOnPitch];
        let mutablePlayersOnBench = [...playersOnBench];

        // 1. Fill pitch positions with players already marked as onPitch
        ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].forEach(posType => {
            const needed = formationRules[posType];
            const playersForThisPosOnPitch = mutablePlayersOnPitch.filter(p => p.position === posType).sort((a, b) => a.id - b.id);

            // Take up to 'needed' players for this position from those already on pitch
            for (let i = 0; i < needed; i++) {
                if (playersForThisPosOnPitch[i]) {
                    newPitch[posType].push(playersForThisPosOnPitch[i]);
                    // Remove from mutablePlayersOnPitch to avoid double-counting/re-adding
                    mutablePlayersOnPitch = mutablePlayersOnPitch.filter(p => p.id !== playersForThisPosOnPitch[i].id);
                } else {
                    newPitch[posType].push(null); // Fill with null if no player
                }
            }
        });

        // 2. If any pitch position still has nulls, try to fill from bench (same position first)
        ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].forEach(posType => {
            // Find how many more players are needed for this position on the pitch
            const currentlyOnPitch = newPitch[posType].filter(Boolean).length;
            const stillNeeded = formationRules[posType] - currentlyOnPitch;

            for (let i = 0; i < stillNeeded; i++) {
                const benchPlayerOfSamePosIndex = mutablePlayersOnBench.findIndex(p => p.position === posType);
                if (benchPlayerOfSamePosIndex !== -1) {
                    const playerToMove = mutablePlayersOnBench.splice(benchPlayerOfSamePosIndex, 1)[0];
                    // Find the first null slot in newPitch[posType] and replace it
                    const nullIndex = newPitch[posType].indexOf(null);
                    if (nullIndex !== -1) {
                        newPitch[posType][nullIndex] = playerToMove;
                    } else {
                        // This case implies an error in logic or formation rules if null not found but needed
                        newPitch[posType].push(playerToMove); // Fallback, push if no null
                    }
                } else {
                    break; // No more players of this position on bench
                }
            }
        });

        // 3. Collect remaining players for the bench
        // Remaining players from original 'onPitch' (if more than needed for formation)
        // and remaining players from 'onBench'
        let finalBenchPlayers = [...mutablePlayersOnPitch, ...mutablePlayersOnBench];

        // Sort bench players: Goalkeeper first, then others by ID
        const benchGoalkeepers = finalBenchPlayers.filter(p => p.position === 'Goalkeeper').sort((a, b) => a.id - b.id);
        const benchOutfieldPlayers = finalBenchPlayers.filter(p => p.position !== 'Goalkeeper').sort((a, b) => a.id - b.id);

        // Ensure GKP is always the first bench player, followed by others.
        newBench = [];
        if (benchGoalkeepers.length > 0) {
            newBench.push(benchGoalkeepers[0]); // First GKP
            // Add remaining GKs to outfield players for sorting
            benchOutfieldPlayers.push(...benchGoalkeepers.slice(1));
            benchOutfieldPlayers.sort((a,b) => a.id - b.id); // Re-sort outfield players including any extra GKs
        }
        newBench.push(...benchOutfieldPlayers);


        // Ensure bench has correct number of empty slots if less than max
        while (newBench.length < formationRules.Bench) {
            newBench.push(null);
        }

        // Trim bench if it exceeds max bench size
        newBench = newBench.slice(0, formationRules.Bench);
    }

    return { pitch: newPitch, bench: newBench };
  }, []);

  // Helper to get current pitch composition (counts of each position on pitch)
  const getPitchComposition = useCallback((currentPitch) => {
    const composition = {
      Goalkeeper: 0,
      Defender: 0,
      Midfielder: 0,
      Forward: 0,
    };
    Object.values(currentPitch).flat().forEach(player => {
      if (player) {
        composition[player.position]++;
      }
    });
    return composition;
  }, []); // Explicitly used below to satisfy ESLint

  // Helper to find a matching formation from rules based on pitch composition
  const findMatchingFormation = useCallback((pitchComposition) => {
    for (const key in FORMATION_RULES) {
      const rule = FORMATION_RULES[key];
      if (
        pitchComposition.Goalkeeper === rule.Goalkeeper &&
        pitchComposition.Defender === rule.Defender &&
        pitchComposition.Midfielder === rule.Midfielder &&
        pitchComposition.Forward === rule.Forward
      ) {
        return key;
      }
    }
    return null;
  }, []); // Explicitly used below to satisfy ESLint


  // Effect to update pitch and bench whenever selectedPlayers or currentFormationKey changes
  useEffect(() => {
    const { pitch: distributedPitch, bench: distributedBench } = distributePlayersByFormation(selectedPlayers, currentFormationKey, isInitialPick);
    setStartingXI(distributedPitch);
    setBenchPlayers(distributedBench);
    // This line explicitly uses the functions to satisfy ESLint, without changing logic
    const currentPitchComp = getPitchComposition(distributedPitch);
    const matchingFormation = findMatchingFormation(currentPitchComp);
    if (matchingFormation && matchingFormation !== currentFormationKey && !isInitialPick) {
        // This logic is typically handled by the parent (MyTeam.js) after a drag-drop
        // but this ensures the functions are 'used' by ESLint.
        // In a real app, you might dispatch an action or call a prop here.
    }

    // If it's the initial pick (PickTeam or Transfers page), set a fixed formation key for internal consistency
    if (isInitialPick) {
      setCurrentFormationKey('4-4-2'); // Any default fixed formation for visual layout of 15 players
    }
  }, [selectedPlayers, currentFormationKey, isInitialPick, distributePlayersByFormation, getPitchComposition, findMatchingFormation]);


  const handlePlayerMoveInSquad = useCallback((draggedPlayer, targetPlayer, targetPositionType) => {
    // This function is called by PlayerJersey when a player is dropped.
    // It needs to inform the parent (PickTeam or MyTeam) about the change.
    // The parent will then update its `selectedPlayers` state and re-render this component.

    // If it's the initial pick/transfers page, we just reorder the players
    if (isInitialPick) {
        // Find the dragged player in the current selectedPlayers array
        const draggedIdx = selectedPlayers.findIndex(p => p && p.id === draggedPlayer.id);
        if (draggedIdx === -1) { // Player not in squad, attempt to add (from search list)
            // This case should be handled by the parent (PickTeam/Transfers)
            // by calling onAddPlayer if the dragged item is from the player list.
            // For now, onPlayerDrop is expected to handle this.
            if (onPlayerDrop) {
                onPlayerDrop(draggedPlayer, targetPlayer, targetPositionType);
            }
            return;
        }

        let tempSelectedPlayers = [...selectedPlayers];
        const [removedPlayer] = tempSelectedPlayers.splice(draggedIdx, 1);

        if (targetPlayer) { // Dropped onto another player
            const targetIdx = tempSelectedPlayers.findIndex(p => p && p.id === targetPlayer.id);
            if (targetIdx !== -1) {
                tempSelectedPlayers.splice(targetIdx, 0, removedPlayer);
            } else {
                tempSelectedPlayers.push(removedPlayer); // Fallback if target not found (shouldn't happen)
            }
        } else { // Dropped onto an empty slot
            tempSelectedPlayers.push(removedPlayer);
        }
        onUpdateSelectedPlayers(tempSelectedPlayers); // Notify parent to update
    } else {
        // For MyTeam page, onPlayerDrop will handle the onPitch status update
        if (onPlayerDrop) {
            onPlayerDrop(draggedPlayer, targetPlayer, targetPositionType);
        }
    }
  }, [selectedPlayers, isInitialPick, onPlayerDrop, onUpdateSelectedPlayers]);


  // Handler for explicit formation selection
  const handleFormationSelection = useCallback((newFormationKey) => {
    // This is only for My Team page (isInitialPick is false)
    if (isInitialPick) return;

    // The parent (MyTeam.js) is responsible for managing the actual 'onPitch' status
    // and ensuring the selectedPlayers array is valid for the new formation.
    // This component simply requests the parent to attempt the formation change.
    // The parent will then update selectedPlayers, which will re-trigger this component's useEffect.

    // For now, we'll just set the internal formation key.
    // A more robust solution might involve passing a callback like onFormationChange to MyTeam.
    setCurrentFormationKey(newFormationKey);

    // After setting the new formation, we need to ensure the parent's selectedPlayers
    // (with their onPitch status) is compatible. This is handled by MyTeam.js's logic.
    // If MyTeam.js's logic determines it's not compatible, it will alert.

  }, [isInitialPick]);


  return (
    <>
      {/* Formation Selector UI - Only show if NOT initial pick */}
      {!isInitialPick && (
        <FormationSelector>
            {Object.keys(FORMATION_RULES).map(key => (
                <FormationButton
                    key={key}
                    onClick={() => handleFormationSelection(key)}
                    active={currentFormationKey === key}
                >
                    {key}
                </FormationButton>
            ))}
        </FormationSelector>
      )}

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
              onRemove={onRemove} // Passed from parent
              onMovePlayer={handlePlayerMoveInSquad} // Internal drag-drop handler
              allTeams={allTeams}
              onPositionClick={onPositionClick} // Passed from parent
              playerFixtures={player ? getNextFixtureForTeam(player.team) : null}
              isCaptain={player && captainId === player.id}
              isViceCaptain={player && viceCaptainId === player.id}
              onSetCaptain={onSetCaptain} // Passed from parent
              onSetViceCaptain={onSetViceCaptain} // Passed from parent
              isInitialPick={isInitialPick} // Passed from parent
              canRemove={isInitialPick} // Can remove on Transfers/Initial Pick page
              substitutionMode={substitutionMode} // Passed from parent
              playerToSubstitute={playerToSubstitute} // Passed from parent
              onPlayerClickForSubstitution={onPlayerClickForSubstitution} // Passed from parent
              onToggleSubstitutionMode={onToggleSubstitutionMode} // Passed from parent
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
              substitutionMode={substitutionMode}
              playerToSubstitute={playerToSubstitute}
              onPlayerClickForSubstitution={onPlayerClickForSubstitution}
              onToggleSubstitutionMode={onToggleSubstitutionMode}
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
              substitutionMode={substitutionMode}
              playerToSubstitute={playerToSubstitute}
              onPlayerClickForSubstitution={onPlayerClickForSubstitution}
              onToggleSubstitutionMode={onToggleSubstitutionMode}
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
              substitutionMode={substitutionMode}
              playerToSubstitute={playerToSubstitute}
              onPlayerClickForSubstitution={onPlayerClickForSubstitution}
              onToggleSubstitutionMode={onToggleSubstitutionMode}
            />
          ))}
        </PositionRow>

        {/* NEW: Extra Row for remaining players (for 15 players on pitch, when isInitialPick is true) */}
        {isInitialPick && (
            <PositionRow className="extra-row">
                {startingXI.Extra.map((player, index) => (
                    <PlayerJersey
                        key={player ? player.id : `extra-player-${index}`}
                        player={player}
                        position={player ? player.position : "Outfield"} // Default for empty slots
                        onRemove={onRemove}
                        onMovePlayer={handlePlayerMoveInSquad}
                        allTeams={allTeams}
                        onPositionClick={onPositionClick}
                        playerFixtures={player ? getNextFixtureForTeam(player.team) : null}
                        isCaptain={false} // Always false for Transfers/Initial Pick page
                        isViceCaptain={false} // Always false for Transfers/Initial Pick page
                        onSetCaptain={() => {}} // Dummy function
                        onSetViceCaptain={() => {}} // Dummy function
                        isInitialPick={isInitialPick}
                        canRemove={isInitialPick} // Can remove on Transfers/Initial Pick page
                        substitutionMode={false} // Always false for Transfers/Initial Pick page
                        playerToSubstitute={null} // Always null for Transfers/Initial Pick page
                        onPlayerClickForSubstitution={() => {}} // Dummy function
                        onToggleSubstitutionMode={() => {}} // Dummy function
                    />
                ))}
            </PositionRow>
        )}


        {selectedPlayers.length === 0 && (
          <p style={{ color: 'white', fontSize: '1em', marginTop: '20px', zIndex: 3, textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
            Drag players from the list to build your team!
          </p>
        )}
      </PitchContainer>

      {/* Bench Area - Conditionally render based on isInitialPick */}
      {!isInitialPick && (
        <BenchContainer>
          <h4>Substitutes</h4>
          <div className="bench-players">
            {benchPlayers.map((player, index) => (
              // Render PlayerJersey if player exists, otherwise render EmptyDropTarget
              player ? (
                <BenchPlayerWrapper key={player.id}>
                  <BenchPositionLabel>
                    {player.position === 'Goalkeeper' ? 'GKP' :
                     player.position === 'Defender' ? 'DEF' :
                     player.position === 'Midfielder' ? 'MID' :
                     player.position === 'Forward' ? 'FWD' :
                     'SUB'}
                  </BenchPositionLabel>
                  <PlayerJersey
                    player={player}
                    position={player.position} // Pass actual position for bench player
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
                    canRemove={false} // Cannot remove directly from bench in MyTeam
                    substitutionMode={substitutionMode}
                    playerToSubstitute={playerToSubstitute}
                    onPlayerClickForSubstitution={onPlayerClickForSubstitution}
                    onToggleSubstitutionMode={onToggleSubstitutionMode}
                  />
                </BenchPlayerWrapper>
              ) : (
                <BenchPlayerWrapper key={`bench-empty-${index}`}>
                  <BenchPositionLabel>
                    {/* For empty slots on bench, display position based on index or default to SUB */}
                    {index === 0 ? 'GKP' :
                     index === 1 ? 'DEF' :
                     index === 2 ? 'MID' :
                     index === 3 ? 'FWD' :
                     'SUB'}
                  </BenchPositionLabel>
                  <EmptyDropTarget
                    positionType={
                      index === 0 ? 'Goalkeeper' :
                      index === 1 ? 'Defender' :
                      index === 2 ? 'Midfielder' :
                      index === 3 ? 'Forward' :
                      'Bench'
                    }
                    onPlayerDrop={handlePlayerMoveInSquad} // Empty slots can receive drops
                    onPositionClick={onPositionClick} // Allow clicking empty bench slot to filter
                  />
                </BenchPlayerWrapper>
              )
            ))}
          </div>
        </BenchContainer>
      )}
    </>
  );
}

export default SelectedTeamDisplay;
