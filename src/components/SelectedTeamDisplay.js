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


// eslint-disable-next-line no-unused-vars
const EmptyDropTarget = ({ positionType, onPlayerDrop, onPositionClick }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'player',
    drop: (draggedItem) => {
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


// Define formation rules (these are for pitch players, bench is handled separately for 15-player display)
const FORMATION_RULES = {
    '4-4-2': { Goalkeeper: 1, Defender: 4, Midfielder: 4, Forward: 2, Bench: 4 },
    '4-3-3': { Goalkeeper: 1, Defender: 4, Midfielder: 3, Forward: 3, Bench: 4 },
    '4-5-1': { Goalkeeper: 1, Defender: 4, Midfielder: 5, Forward: 1, Bench: 4 },
    '3-5-2': { Goalkeeper: 1, Defender: 3, Midfielder: 5, Forward: 2, Bench: 4 },
    '3-4-3': { Goalkeeper: 1, Defender: 3, Midfielder: 4, Forward: 3, Bench: 4 },
    '5-3-2': { Goalkeeper: 1, Defender: 5, Midfielder: 3, Forward: 2, Bench: 4 },
    '5-4-1': { Goalkeeper: 1, Defender: 5, Midfielder: 4, Forward: 1, Bench: 4 },
};


function SelectedTeamDisplay({ selectedPlayers, onRemove, allTeams, allFixtures, onPlayerDrop, isInitialPick, onPositionClick, onUpdateSelectedPlayers, captainId, viceCaptainId, onSetCaptain, onSetViceCaptain }) {
  const [startingXI, setStartingXI] = useState({
    Goalkeeper: [],
    Defender: [],
    Midfielder: [],
    Forward: [],
    Extra: [] // Used only when isInitialPick is true for the 15-player display
  });
  const [benchPlayers, setBenchPlayers] = useState([]);
  const [currentFormationKey, setCurrentFormationKey] = useState('4-4-2'); // Default formation
  // Removed substitution-related states as they are not controlled here anymore for My Team.
  // For Transfers, they are explicitly not used.


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
  const distributePlayersByFormation = useCallback((allPlayersInSquad, formationKey, isInitialPickMode) => {
    const newPitch = { Goalkeeper: [], Defender: [], Midfielder: [], Forward: [], Extra: [] };
    let newBench = [];
    const usedPlayerIds = new Set();

    if (isInitialPickMode) {
        // For Transfers page (isInitialPick=true), display all 15 players on the pitch
        // Prioritize GKP, then DEF, MID, FWD, then put remaining in 'Extra'
        const playersByPos = {
            'Goalkeeper': allPlayersInSquad.filter(p => p && p.position === 'Goalkeeper').sort((a, b) => a.id - b.id), // Stable sort for consistent display
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
        let totalPitchPlayers = newPitch.Goalkeeper.filter(Boolean).length +
                               newPitch.Defender.filter(Boolean).length +
                               newPitch.Midfielder.filter(Boolean).length +
                               newPitch.Forward.filter(Boolean).length +
                               newPitch.Extra.filter(Boolean).length;

        // Fill empty slots up to 15, prioritizing position types if they have few players
        // This is a simplified approach for visual layout for 15 players
        while (totalPitchPlayers < maxSquadSize) {
            if (newPitch.Goalkeeper.length < 2) { // Ensure up to 2 GK slots filled with nulls if needed
                newPitch.Goalkeeper.push(null);
            } else if (newPitch.Defender.length < 5) { // Arbitrary limit for visual spread
                newPitch.Defender.push(null);
            } else if (newPitch.Midfielder.length < 5) {
                newPitch.Midfielder.push(null);
            } else if (newPitch.Forward.length < 3) {
                newPitch.Forward.push(null);
            } else {
                newPitch.Extra.push(null);
            }
            totalPitchPlayers++;
        }

        newBench = []; // Bench is empty in this mode
    } else {
        // For My Team page (isInitialPick=false), use dynamic formation rules and bench
        const formationRules = FORMATION_RULES[formationKey];
        if (!formationRules) {
            console.error(`Invalid formation key: ${formationKey}`);
            return { pitch: { Goalkeeper: [], Defender: [], Midfielder: [], Forward: [] }, bench: [] };
        }

        // Prioritize Goalkeeper for pitch
        const gkp = allPlayersInSquad.find(p => p && p.position === 'Goalkeeper');
        if (gkp && newPitch.Goalkeeper.length < formationRules.Goalkeeper) {
            newPitch.Goalkeeper.push(gkp);
            usedPlayerIds.add(gkp.id);
        }

        // Fill pitch positions for Defenders, Midfielders, Forwards
        ['Defender', 'Midfielder', 'Forward'].forEach(posType => {
            const playersOfPos = allPlayersInSquad.filter(p => p && p.position === posType && !usedPlayerIds.has(p.id));
            for (let i = 0; i < formationRules[posType]; i++) {
                if (playersOfPos[i]) {
                    newPitch[posType].push(playersOfPos[i]);
                    usedPlayerIds.add(playersOfPos[i].id);
                } else {
                    newPitch[posType].push(null); // Fill with null for empty slots
                }
            }
        });

        // Separate goalkeepers and outfield players for bench
        let benchGoalkeepers = [];
        let benchOutfieldPlayers = [];

        allPlayersInSquad.forEach(player => {
            if (player && !usedPlayerIds.has(player.id)) {
                if (player.position === 'Goalkeeper') {
                    benchGoalkeepers.push(player);
                } else {
                    benchOutfieldPlayers.push(player);
                }
            }
        });

        // Place bench goalkeeper first, then other bench players
        newBench = [...benchGoalkeepers, ...benchOutfieldPlayers];

        // Fill remaining pitch slots with nulls if not enough players for the 11
        ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].forEach(posType => {
            while (newPitch[posType].length < formationRules[posType]) {
                newPitch[posType].push(null);
            }
        });

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
  }, []);

  // Helper to find a matching formation from rules based on pitch composition
  const findMatchingFormation = useCallback((pitchComposition) => {
    for (const key in FORMATION_RULES) {
      const rule = FORMATION_RULES[key];
      // Check if the number of players for each position matches the rule
      if (
        pitchComposition.Goalkeeper === rule.Goalkeeper &&
        pitchComposition.Defender === rule.Defender &&
        pitchComposition.Midfielder === rule.Midfielder &&
        pitchComposition.Forward === rule.Forward
      ) {
        return key; // Found a matching formation
      }
    }
    return null; // No matching formation found
  }, []);


  // Effect to update pitch and bench whenever selectedPlayers or currentFormationKey changes
  useEffect(() => {
    // MODIFIED: Pass isInitialPickMode to distributePlayersByFormation
    const { pitch: distributedPitch, bench: distributedBench } = distributePlayersByFormation(selectedPlayers, currentFormationKey, isInitialPick);
    setStartingXI(distributedPitch);
    setBenchPlayers(distributedBench);
    // If it's the initial pick (Transfers page), set a fixed formation key for internal consistency
    if (isInitialPick) {
      setCurrentFormationKey('4-4-2'); // Or any other default fixed formation for visual layout
    }
  }, [selectedPlayers, currentFormationKey, isInitialPick, distributePlayersByFormation]);


  const handlePlayerMoveInSquad = useCallback((draggedPlayer, targetPlayer, targetPositionType) => {
    let newSelectedPlayers = [...selectedPlayers];
    const draggedPlayerCurrentIndex = newSelectedPlayers.findIndex(p => p && p.id === draggedPlayer.id);

    // Case 1: Player dragged from outside (player list) into pitch/bench
    if (draggedPlayerCurrentIndex === -1) {
      if (newSelectedPlayers.length < maxSquadSize) {
        // Add player to the squad, then re-distribute
        newSelectedPlayers = [...newSelectedPlayers, draggedPlayer];
        onUpdateSelectedPlayers(newSelectedPlayers); // Let parent handle budget/player list update
      } else {
        alert("Squad is full! Cannot add more players.");
      }
      return;
    }

    // --- Drag-and-Drop Logic for existing players (only for My Team or simplified for Transfers) ---
    let tempSelectedPlayers = [...newSelectedPlayers];

    if (isInitialPick) {
        // For Transfers page, just allow simple re-ordering on the 15-player pitch
        // Find the index of the dragged player
        const draggedIdx = tempSelectedPlayers.findIndex(p => p && p.id === draggedPlayer.id);
        if (draggedIdx === -1) return; // Should not happen if already in squad

        // Remove the dragged player from its current position
        const [removedPlayer] = tempSelectedPlayers.splice(draggedIdx, 1);

        if (targetPlayer) {
            // If dropping onto another player, insert before that player
            const targetIdx = tempSelectedPlayers.findIndex(p => p && p.id === targetPlayer.id);
            if (targetIdx !== -1) {
                tempSelectedPlayers.splice(targetIdx, 0, removedPlayer);
            } else {
                // If target player not found (e.g., target was removed), just add to end
                tempSelectedPlayers.push(removedPlayer);
            }
        } else {
            // If dropping onto an empty slot (implicitly, by dropping on the pitch background), add to end
            tempSelectedPlayers.push(removedPlayer);
        }

        onUpdateSelectedPlayers(tempSelectedPlayers); // Update parent state
        return; // Exit for isInitialPick scenario
    }


    // Logic for My Team page (existing formation and bench rules)
    if (targetPlayer) { // Swapping players (drag-and-drop)
      const targetPlayerCurrentIndex = tempSelectedPlayers.findIndex(p => p && p.id === targetPlayer.id);

      if (draggedPlayerCurrentIndex !== -1 && targetPlayerCurrentIndex !== -1) {
        // Goalkeeper restriction for normal drag-and-drop
        if (draggedPlayer.position === 'Goalkeeper' || targetPlayer.position === 'Goalkeeper') {
            if (draggedPlayer.position !== 'Goalkeeper' || targetPlayer.position !== 'Goalkeeper') {
                alert('Goalkeepers can only be swapped with other goalkeepers.');
                return;
            }
        }

        // Allow any swap on bench (including Goalkeeper with Goalkeeper on bench)
        if (draggedPlayer.isBench && targetPlayer.isBench) {
            [tempSelectedPlayers[draggedPlayerCurrentIndex], tempSelectedPlayers[targetPlayerCurrentIndex]] =
            [tempSelectedPlayers[targetPlayerCurrentIndex], tempSelectedPlayers[draggedPlayerCurrentIndex]];
        }
        // Allow pitch players to swap only with same position players on pitch
        else if (!draggedPlayer.isBench && !targetPlayer.isBench && draggedPlayer.position === targetPlayer.position) {
            [tempSelectedPlayers[draggedPlayerCurrentIndex], tempSelectedPlayers[targetPlayerCurrentIndex]] =
            [tempSelectedPlayers[targetPlayerCurrentIndex], tempSelectedPlayers[draggedPlayerCurrentIndex]];
        }
        // Allow pitch player to bench player swap, and vice versa
        else if (draggedPlayer.isBench !== targetPlayer.isBench) {
            // This is a pitch-bench swap. The formation logic will re-distribute.
            [tempSelectedPlayers[draggedPlayerCurrentIndex], tempSelectedPlayers[targetPlayerCurrentIndex]] =
            [tempSelectedPlayers[targetPlayerCurrentIndex], tempSelectedPlayers[draggedPlayerCurrentIndex]];
        }
        else {
            alert(`Cannot swap a ${draggedPlayer.position} with a ${targetPlayer.position} directly.`);
            return;
        }
      }
    } else { // Moving to an empty slot (drag-and-drop)
        // This handles dropping a player onto an empty slot on pitch or bench
        // Remove the dragged player from its current position
        tempSelectedPlayers = tempSelectedPlayers.filter(p => p.id !== draggedPlayer.id);

        // Add the dragged player to the end of the array.
        // The distributePlayersByFormation will then place it correctly.
        tempSelectedPlayers.push(draggedPlayer);
    }

    // Now, try to distribute these temp players into the *current* formation
    // MODIFIED: Pass isInitialPickMode to distributePlayersByFormation for validation
    const { pitch: potentialPitch } = distributePlayersByFormation(tempSelectedPlayers, currentFormationKey, isInitialPick);

    // Check if the potential pitch is valid for the current formation
    const currentFormationRules = FORMATION_RULES[currentFormationKey];
    const potentialPitchComposition = getPitchComposition(potentialPitch);

    let isValidMoveForCurrentFormation = true;
    // Only validate against formation rules if NOT in initial pick mode (Transfers page)
    if (!isInitialPick && (
        potentialPitchComposition.Goalkeeper > currentFormationRules.Goalkeeper ||
        potentialPitchComposition.Defender > currentFormationRules.Defender ||
        potentialPitchComposition.Midfielder > currentFormationRules.Midfielder ||
        potentialPitchComposition.Forward > currentFormationRules.Forward)) {
        isValidMoveForCurrentFormation = false;
    }

    if (!isValidMoveForCurrentFormation) {
        alert(`Cannot make this move in a ${currentFormationKey} formation. Please select a different formation or adjust your squad.`);
        return; // Prevent the invalid move
    }

    // If the move is valid for the current formation, update selectedPlayers
    onUpdateSelectedPlayers(tempSelectedPlayers);

    // Now, check if this valid move results in a new valid formation
    const newPitchComposition = getPitchComposition(potentialPitch);
    const newMatchingFormationKey = findMatchingFormation(newPitchComposition);

    // Only update formation key dynamically if NOT in initial pick mode
    if (!isInitialPick && newMatchingFormationKey && newMatchingFormationKey !== currentFormationKey) {
        // If a new formation is detected, update the currentFormationKey
        setCurrentFormationKey(newMatchingFormationKey);
        console.log(`Formation automatically changed to: ${newMatchingFormationKey}`);
        // Optionally, show a subtle message to the user about the formation change
    }

  }, [selectedPlayers, maxSquadSize, onUpdateSelectedPlayers, distributePlayersByFormation, currentFormationKey, getPitchComposition, findMatchingFormation, isInitialPick]);


  // Handler for explicit formation selection
  const handleFormationSelection = useCallback((newFormationKey) => {
    // Attempt to distribute current players into the new formation
    const { pitch: testPitch } = distributePlayersByFormation(selectedPlayers, newFormationKey, isInitialPick);
    const testPitchComposition = getPitchComposition(testPitch);
    const rulesForNewFormation = FORMATION_RULES[newFormationKey];

    // Check if the new formation can be formed with the current players
    const canFormNewFormation =
        testPitchComposition.Goalkeeper === rulesForNewFormation.Goalkeeper &&
        testPitchComposition.Defender === rulesForNewFormation.Defender &&
        testPitchComposition.Midfielder === rulesForNewFormation.Midfielder &&
        testPitchComposition.Forward === rulesForNewFormation.Forward &&
        (testPitchComposition.Goalkeeper + testPitchComposition.Defender + testPitchComposition.Midfielder + testPitchComposition.Forward) === 11;

    if (canFormNewFormation) {
      setCurrentFormationKey(newFormationKey);
    } else {
      // Provide specific feedback
      let feedback = `Cannot switch to ${newFormationKey} with your current squad. `;
      if (testPitchComposition.Goalkeeper !== rulesForNewFormation.Goalkeeper) feedback += `You need ${rulesForNewFormation.Goalkeeper} GKP. `;
      if (testPitchComposition.Defender !== rulesForNewFormation.Defender) feedback += `You need ${rulesForNewFormation.Defender} DEF. `;
      if (testPitchComposition.Midfielder !== rulesForNewFormation.Midfielder) feedback += `You need ${rulesForNewFormation.Midfielder} MID. `;
      if (testPitchComposition.Forward !== rulesForNewFormation.Forward) feedback += `You need ${rulesForNewFormation.Forward} FWD. `;
      feedback += "Please adjust your players on the pitch to match the formation requirements.";
      alert(feedback);
    }
  }, [selectedPlayers, distributePlayersByFormation, getPitchComposition, isInitialPick]);

  // Removed handleToggleSubstitutionMode as it's no longer used within this component for rendering.
  // The onToggleSubstitutionMode prop is merely passed down to PlayerJersey, which then handles
  // calling it.

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
              onRemove={onRemove}
              onMovePlayer={handlePlayerMoveInSquad}
              allTeams={allTeams}
              onPositionClick={onPositionClick}
              playerFixtures={player ? getNextFixtureForTeam(player.team) : null}
              isCaptain={false} // Always false for Transfers page
              isViceCaptain={false} // Always false for Transfers page
              onSetCaptain={() => {}} // Dummy function
              onSetViceCaptain={() => {}} // Dummy function
              isInitialPick={isInitialPick}
              canRemove={isInitialPick} // Can remove on Transfers page
              substitutionMode={false} // Always false for Transfers page
              playerToSubstitute={null} // Always null for Transfers page
              onToggleSubstitutionMode={() => {}} // Dummy function as it's not used here for Transfers
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
              isCaptain={false} // Always false for Transfers page
              isViceCaptain={false} // Always false for Transfers page
              onSetCaptain={() => {}} // Dummy function
              onSetViceCaptain={() => {}} // Dummy function
              isInitialPick={isInitialPick}
              canRemove={isInitialPick} // Can remove on Transfers page
              substitutionMode={false} // Always false for Transfers page
              playerToSubstitute={null} // Always null for Transfers page
              onToggleSubstitutionMode={() => {}} // Dummy function as it's not used here for Transfers
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
              isCaptain={false} // Always false for Transfers page
              isViceCaptain={false} // Always false for Transfers page
              onSetCaptain={() => {}} // Dummy function
              onSetViceCaptain={() => {}} // Dummy function
              isInitialPick={isInitialPick}
              canRemove={isInitialPick} // Can remove on Transfers page
              substitutionMode={false} // Always false for Transfers page
              playerToSubstitute={null} // Always null for Transfers page
              onToggleSubstitutionMode={() => {}} // Dummy function as it's not used here for Transfers
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
              isCaptain={false} // Always false for Transfers page
              isViceCaptain={false} // Always false for Transfers page
              onSetCaptain={() => {}} // Dummy function
              onSetViceCaptain={() => {}} // Dummy function
              isInitialPick={isInitialPick}
              canRemove={isInitialPick} // Can remove on Transfers page
              substitutionMode={false} // Always false for Transfers page
              playerToSubstitute={null} // Always null for Transfers page
              onToggleSubstitutionMode={() => {}} // Dummy function as it's not used here for Transfers
            />
          ))}
        </PositionRow>

        {/* NEW: Extra Row for remaining players (for 15 players on pitch) */}
        {isInitialPick && (
            <PositionRow className="extra-row">
                {startingXI.Extra.map((player, index) => (
                    <PlayerJersey
                        key={player ? player.id : `extra-player-${index}`}
                        player={player}
                        // Assign a generic position like 'Outfield' or 'Extra'
                        position={player ? player.position : "Outfield"}
                        onRemove={onRemove}
                        onMovePlayer={handlePlayerMoveInSquad}
                        allTeams={allTeams}
                        onPositionClick={onPositionClick}
                        playerFixtures={player ? getNextFixtureForTeam(player.team) : null}
                        isCaptain={false} // Always false for Transfers page
                        isViceCaptain={false} // Always false for Transfers page
                        onSetCaptain={() => {}} // Dummy function
                        onSetViceCaptain={() => {}} // Dummy function
                        isInitialPick={isInitialPick}
                        canRemove={isInitialPick} // Can remove on Transfers page
                        substitutionMode={false} // Always false for Transfers page
                        playerToSubstitute={null} // Always null for Transfers page
                        onToggleSubstitutionMode={() => {}} // Dummy function as it's not used here for Transfers
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
      {/* MODIFIED: Bench is NOT shown if isInitialPick is true */}
      {!isInitialPick && (
        <BenchContainer>
          <h4>Substitutes</h4>
          <div className="bench-players">
            {benchPlayers.map((player, index) => (
              <BenchPlayerWrapper key={player ? player.id : `bench-player-empty-${index}`}>
                <BenchPositionLabel>
                  {player ? (
                    player.position === 'Goalkeeper' ? 'GKP' :
                    player.position === 'Defender' ? 'DEF' :
                    player.position === 'Midfielder' ? 'MID' :
                    player.position === 'Forward' ? 'FWD' :
                    'SUB'
                  ) : (
                    // For empty slots on bench, display position based on index or default to SUB
                    index === 0 ? 'GKP' :
                    index === 1 ? 'DEF' :
                    index === 2 ? 'MID' :
                    index === 3 ? 'FWD' :
                    'SUB'
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
                  substitutionMode={false} // Always false for Transfers page
                  playerToSubstitute={null} // Always null for Transfers page
                  onToggleSubstitutionMode={() => {}} // Dummy function as it's not used here for Transfers
                />
              </BenchPlayerWrapper>
            ))}
          </div>
        </BenchContainer>
      )}
    </>
  );
}

export default SelectedTeamDisplay;