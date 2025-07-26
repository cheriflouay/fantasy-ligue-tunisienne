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
    background-color: ${props => props.$active ? '#6a11cb' : '#33004a'}; /* Changed to $active */
    color: white;
    border: 1px solid ${props => props.$active ? '#884dff' : '#4a005c'}; /* Changed to $active */
    padding: 8px 15px;
    border-radius: 5px;
    font-size: 0.9em;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${props => props.$active ? '#5a009a' : '#4a005c'}; /* Changed to $active */
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


function SelectedTeamDisplay({ selectedPlayers, onRemove, allTeams, allFixtures, onPlayerDrop, isInitialPick, onPositionClick, onUpdateSelectedPlayers, captainId, viceCaptainId, onSetCaptain, onSetViceCaptain, substitutionMode, playerToSubstitute, onPlayerClick }) {
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
    const newPitch = { Goalkeeper: [], Defender: [], Midfielder: [], Forward: [] };
    let newBench = [];
    const formationRules = FORMATION_RULES[formationKey];

    if (!formationRules) {
        console.error(`Invalid formation key: ${formationKey}`);
        return { pitch: { Goalkeeper: [], Defender: [], Midfielder: [], Forward: [] }, bench: [] };
    }

    // For initial pick mode (PickTeam/Transfers), override the pitch/bench logic
    // to show all 15 players on the pitch.
    if (isInitialPickMode) {
        const allPlayersSorted = [...allPlayersInSquad].sort((a, b) => a.id - b.id); // Sort for consistent display
        const initialPitch = { Goalkeeper: [], Defender: [], Midfielder: [], Forward: [], Extra: [] };

        // Distribute to pitch categories for visual grouping
        allPlayersSorted.forEach(p => {
            if (p.position === 'Goalkeeper' && initialPitch.Goalkeeper.length < 2) {
                initialPitch.Goalkeeper.push(p);
            } else if (p.position === 'Defender' && initialPitch.Defender.length < 5) {
                initialPitch.Defender.push(p);
            } else if (p.position === 'Midfielder' && initialPitch.Midfielder.length < 5) {
                initialPitch.Midfielder.push(p);
            } else if (p.position === 'Forward' && initialPitch.Forward.length < 3) {
                initialPitch.Forward.push(p);
            } else {
                initialPitch.Extra.push(p);
            }
        });

        // Fill remaining slots with nulls to reach 15 total
        let currentTotal = Object.values(initialPitch).flat().filter(Boolean).length;
        while (currentTotal < maxSquadSize) {
            if (initialPitch.Goalkeeper.length < 2) initialPitch.Goalkeeper.push(null);
            else if (initialPitch.Defender.length < 5) initialPitch.Defender.push(null);
            else if (initialPitch.Midfielder.length < 5) initialPitch.Midfielder.push(null);
            else if (initialPitch.Forward.length < 3) initialPitch.Forward.push(null);
            else initialPitch.Extra.push(null);
            currentTotal++;
        }

        return { pitch: initialPitch, bench: [] }; // No bench in initial pick mode
    } else {
        // For My Team page (isInitialPick=false), use dynamic formation rules and bench

        // 1. Separate players based on their 'onPitch' status from the incoming selectedPlayers prop
        let onPitchPlayers = allPlayersInSquad.filter(p => p && p.onPitch);
        let onBenchPlayers = allPlayersInSquad.filter(p => p && !p.onPitch);

        // Sort players within their groups for consistent display
        onPitchPlayers.sort((a, b) => a.id - b.id);
        // onBenchPlayers.sort((a, b) => a.id - b.id); // REMOVED: This line caused bench reordering issues

        // Initialize pitch positions with nulls based on formation rules
        for (const posType in formationRules) {
            if (posType !== 'Bench') { // Exclude 'Bench' from pitch positions
                newPitch[posType] = Array(formationRules[posType]).fill(null);
            }
        }

        // 2. Fill pitch positions with players who are already marked as onPitch
        // Prioritize filling the correct position slots first
        ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].forEach(posType => {
            const playersForThisPos = onPitchPlayers.filter(p => p.position === posType);
            for (let i = 0; i < playersForThisPos.length && i < newPitch[posType].length; i++) {
                newPitch[posType][i] = playersForThisPos[i];
            }
        });

        // 3. Identify any 'onPitch' players who couldn't fit the current formation's pitch slots
        // (e.g., too many defenders for a 3-defender formation). These become bench candidates.
        let excessPitchPlayers = [];
        ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].forEach(posType => {
            const currentPitchCount = newPitch[posType].filter(Boolean).length;
            const playersOriginallyOnPitchForThisPos = onPitchPlayers.filter(p => p.position === posType);
            for (let i = currentPitchCount; i < playersOriginallyOnPitchForThisPos.length; i++) {
                excessPitchPlayers.push(playersOriginallyOnPitchForThisPos[i]);
            }
        });

        // Combine all candidates for the bench: players originally on bench + excess from pitch
        // Preserve original order of onBenchPlayers, then add excessPitchPlayers
        let combinedBenchCandidates = [...onBenchPlayers, ...excessPitchPlayers];

        // 4. Fill any remaining null slots on the pitch from the combined bench candidates, prioritizing by position
        ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].forEach(posType => {
            for (let i = 0; i < newPitch[posType].length; i++) {
                if (newPitch[posType][i] === null) {
                    const indexInBench = combinedBenchCandidates.findIndex(p => p && p.position === posType);
                    if (indexInBench !== -1) {
                        newPitch[posType][i] = combinedBenchCandidates.splice(indexInBench, 1)[0];
                    }
                }
            }
        });

        // 5. Construct the final bench from any remaining players in combinedBenchCandidates
        // This is the crucial part for Rule 2: GKP first, then user-defined order for others.

        let finalBenchOrdered = [];
        // Extract Goalkeepers from combinedBenchCandidates
        const goalkeepers = combinedBenchCandidates.filter(p => p && p.position === 'Goalkeeper');
        // Extract outfield players from combinedBenchCandidates, maintaining their relative order
        const outfieldPlayers = combinedBenchCandidates.filter(p => p && p.position !== 'Goalkeeper');

        // Add the first Goalkeeper to the bench if available
        if (goalkeepers.length > 0) {
            finalBenchOrdered.push({ ...goalkeepers[0], onPitch: false });
        }

        // Add the rest of the outfield players, maintaining their order
        finalBenchOrdered.push(...outfieldPlayers.map(p => ({ ...p, onPitch: false })));

        // If there are more goalkeepers, add them at the end of the outfield players
        // (after the first GKP, the rest are treated as regular outfield players for sorting purposes)
        if (goalkeepers.length > 1) {
            finalBenchOrdered.push(...goalkeepers.slice(1).map(p => ({ ...p, onPitch: false })));
        }

        newBench = finalBenchOrdered; // Assign the newly ordered bench

        // Ensure bench has exactly 4 players (fill with nulls if needed, or truncate)
        newBench = newBench.slice(0, formationRules.Bench);
        while (newBench.length < formationRules.Bench) {
            newBench.push(null);
        }

    }

    // --- DEBUGGING LOGS ---
    console.log("--- distributePlayersByFormation Output ---");
    console.log("Formation Key:", formationKey);
    console.log("Is Initial Pick Mode:", isInitialPickMode);
    console.log("Input selectedPlayers (onPitch status):", allPlayersInSquad.map(p => ({ id: p.id, onPitch: p.onPitch })));
    console.log("Output Pitch:", newPitch);
    console.log("Output Bench:", newBench);
    console.log("-----------------------------------------");
    // --- END DEBUGGING LOGS ---

    return { pitch: newPitch, bench: newBench };
  }, [maxSquadSize]);


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
                    $active={currentFormationKey === key} /* Changed to $active */
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
              substitutionMode={substitutionMode}
              playerToSubstitute={playerToSubstitute}
              onPlayerClick={onPlayerClick} // Changed to new handlePlayerClick
              isPlayerToSubstitute={player && playerToSubstitute && player.id === playerToSubstitute.id}
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
              canRemove={isInitialPick} // Can remove on Transfers/Initial Pick page
              substitutionMode={substitutionMode}
              playerToSubstitute={playerToSubstitute}
              onPlayerClick={onPlayerClick} // Changed to new handlePlayerClick
              isPlayerToSubstitute={player && playerToSubstitute && player.id === playerToSubstitute.id}
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
              canRemove={isInitialPick} // Can remove on Transfers/Initial Pick page
              substitutionMode={substitutionMode}
              playerToSubstitute={playerToSubstitute}
              onPlayerClick={onPlayerClick} // Changed to new handlePlayerClick
              isPlayerToSubstitute={player && playerToSubstitute && player.id === playerToSubstitute.id}
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
              canRemove={isInitialPick} // Can remove on Transfers/Initial Pick page
              substitutionMode={substitutionMode}
              playerToSubstitute={playerToSubstitute}
              onPlayerClick={onPlayerClick} // Changed to new handlePlayerClick
              isPlayerToSubstitute={player && playerToSubstitute && player.id === playerToSubstitute.id}
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
                        substitutionMode={substitutionMode}
                        playerToSubstitute={playerToSubstitute}
                        onPlayerClick={onPlayerClick} // Changed to new handlePlayerClick
                        isPlayerToSubstitute={player && playerToSubstitute && player.id === playerToSubstitute.id}
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
                    key={player.id} /* Ensure key is player.id for consistent rendering */
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
                    onPlayerClick={onPlayerClick} // Changed to new handlePlayerClick
                    isPlayerToSubstitute={player && playerToSubstitute && player.id === playerToSubstitute.id}
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
