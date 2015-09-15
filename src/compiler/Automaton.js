/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[
		'./arrayUtils',
		'regexParser',
		'./Transition'
	],
	function(
		arrayUtils,
		regexParser,
		Transition
	) {
		'use strict';

		/**
		 * Describes a Non-deterministic Finite Automaton.
		 *
		 * @constructor
		 */
		function Automaton () {

			// Save the initial state
			this.initialStates = [];

			// Save the states array
			this.statesCount = [];

			// Save the array for transitions
			this.transitions = [];

			// Save the final state
			this.finalStates = [];
		}

		Automaton.prototype.setInitialStates = function (initialState) {
			this.initialStates = initialState;
		};

		Automaton.prototype.getInitialStates = function () {
			return this.initialStates.slice();
		};

		Automaton.prototype.getStatesCount = function () {
			return this.statesCount;
		};

		Automaton.prototype.getTransitionsCount = function () {
			return this.transitions.length;
		};

		Automaton.prototype.setStatesCount = function (statesCount) {
			this.statesCount = statesCount;
		};

		Automaton.prototype.addTransition = function (stateFrom, stateTo, character) {

			var newTransition = new Transition(stateFrom, stateTo, character);

			this.transitions.push(newTransition);
		};

		Automaton.prototype.setFinalStates = function (finalState) {
			this.finalStates = finalState;
		};

		Automaton.prototype.getFinalStates = function () {
			return this.finalStates.slice();
		};

		/**
		 * Concatenate two NFA.
		 *
		 * @param leftNFA
		 * @param rightNFA
		 * @returns {Automaton}
		 */
		Automaton.concat = function (leftNFA, rightNFA) {

			// Create an empty NFA to save the result
			var result = new Automaton();

			// Set the amount of states for the resulting NFA
			result.setStatesCount(leftNFA.getStatesCount() + rightNFA.getStatesCount());

			// Set the new initial states for the new NFA
			result.setInitialStates(leftNFA.getInitialStates());

			// Declare counter and temporal variable for storing transitions
			var currentTransitionID, newTransition;

			var leftTransitionsCount = leftNFA.getTransitionsCount();

			// Loop over left NFA's transitions
			for (currentTransitionID = 0; currentTransitionID < leftTransitionsCount; ++ currentTransitionID) {

				// Save the current transition for reference
				newTransition = leftNFA.transitions[currentTransitionID];

				// Add a copy of the new transition to the resulting NFA
				result.addTransition(newTransition.stateFrom, newTransition.stateTo, newTransition.character);
			}

			var leftFinalStates = leftNFA.getFinalStates();

			// Connect the left NFA with the right one
			for (var currentLeftFinalStateID = 0; currentLeftFinalStateID < leftFinalStates.length; ++ currentLeftFinalStateID) {
				var currentLeftFinalState = leftFinalStates[currentLeftFinalStateID];

				result.addTransition(currentLeftFinalState, leftNFA.getStatesCount(), "");
			}

			var rightTransitionsCount = rightNFA.getTransitionsCount();

			// Loop over right NFA's transitions
			for (currentTransitionID = 0; currentTransitionID < rightTransitionsCount; ++ currentTransitionID) {

				// Save the current transition for reference
				newTransition = rightNFA.transitions[currentTransitionID];

				// Add a shifted copy of the new transition to the resulting NFA
				result.addTransition(newTransition.stateFrom + leftNFA.getStatesCount(),
					newTransition.stateTo + leftNFA.getStatesCount(), newTransition.character);
			}

			// Copy the right NFA final states to define a new NFA final states array
			var newFinalStates = rightNFA.getFinalStates();

			// Loop over the new final states
			for (var currentFinalStateID = 0; currentFinalStateID < newFinalStates.length; ++ currentFinalStateID) {

				// Shift each state
				newFinalStates[currentFinalStateID] += leftNFA.getStatesCount();
			}

			// Set the new final states
			result.setFinalStates(newFinalStates);

			// Return the result of NFA concatenation
			return result;
		};

		/**
		 * Parallelize given NFA.
		 *
		 * @param choices
		 * @returns {Automaton}
		 */
		Automaton.choice = function (choices) {

			// Create a NFA for result
			var result = new Automaton();

			// Save the total amount of states in the new NFA
			var statesCount = 2;

			// Iterate over choices
			for (var currentChoiceID = 0; currentChoiceID < choices.length; ++ currentChoiceID) {

				// Increase states amount accordingly
				statesCount += choices[currentChoiceID].getStatesCount();
			}

			// Set the required amount of states
			result.setStatesCount(statesCount);

			// Set the single initial state for the resulting NFA
			result.setInitialStates([0]);

			// Save the state IDs shift
			var adderTrack = 1;

			// Iterate over choices
			for (currentChoiceID = 0; currentChoiceID < choices.length; ++ currentChoiceID) {

				// Add transition from initial state to every choice
				result.addTransition(0, adderTrack, "");

				// Save reference to a current choice
				var currentChoice = choices[currentChoiceID];

				// Save amount of transitions in the current choice for reference
				var currentChoiceTransitionsCount = currentChoice.getTransitionsCount();

				// Iterate over the choice transitions
				for (var currentTransitionID = 0; currentTransitionID < currentChoiceTransitionsCount; ++ currentTransitionID) {

					// Save the new transition for reference
					var newTransition = currentChoice.transitions[currentTransitionID];

					// Add the shifted version of transition to the resulting NFA
					result.addTransition(newTransition.stateFrom + adderTrack, newTransition.stateTo + adderTrack, newTransition.character);
				}

				var currentChoiceFinalStates = currentChoice.getFinalStates();

				for (var currentFinalStateID = 0; currentFinalStateID < currentChoiceFinalStates.length; ++ currentFinalStateID) {

					var currentFinalState = currentChoiceFinalStates[currentFinalStateID];

					// Add the ending transition
					result.addTransition(currentFinalState + adderTrack, statesCount - 1, "");
				}

				// Increase the shift
				adderTrack += currentChoice.getStatesCount();

			}

			// Set the final states
			result.setFinalStates([statesCount - 1]);

			// Return the parallely connected choices
			return result;
		};

		Automaton.fromRegExp = function (regularExpression) {

			// Create an AST for a given regular expression
			var regularExpressionAST = regexParser.parse(regularExpression);

			// Return result of AST to NFA conversion
			return astToNFA(regularExpressionAST);
		};

		Automaton.toDFA = function(nfa) {

			// Return determinized NFA
			return determinize(nfa);
		}
		
		Automaton.regExpToDFA = function (regularExpression) {

			// Create an NFA from a given regular expression
			var nfa = Automaton.fromRegExp(regularExpression);

			// Return determinized NFA
			return Automaton.toDFA(nfa);
		};

		Automaton.minimNFAize = function (nfa) {
			return determinize(reverse(determinize(reverse(determinize(nfa)))));
		};

		Automaton.regExpToMinimalDFA = function (regularExpression) {
			var dfa = Automaton.regExpToDFA(regularExpression);

			return Automaton.minimNFAize(dfa);
		};

		Automaton.regExpToSimpleMinimalDFA = function (regularExpression) {
			var minimalDFA = Automaton.regExpToMinimalDFA(regularExpression);

			return getSimpleNotionOfAMinimalDFA(minimalDFA);
		};

		/**
		 * Convert a given Abstract Syntax Tree made by the embedded regex parser to a NFA.
		 *
		 * @param ast
		 * @returns {Automaton}
		 */
		function astToNFA (ast) {

			var result = new Automaton();

			var currentNodeID, currentNodeNFA;

			switch (ast[0]) {
				case 'test':

					// Generate a simple test NFA
					result.setStatesCount(2);
					result.setInitialStates([0]);
					result.setFinalStates([1]);
					result.addTransition(0, 1, ast[1]);

					break;

				case 'seq':

					// Concat first two elements
					result = Automaton.concat(astToNFA(ast[1]), astToNFA(ast[2]));

					for (currentNodeID = 3; currentNodeID < ast.length; ++ currentNodeID) {
						currentNodeNFA = astToNFA(ast[currentNodeID]);

						result = Automaton.concat(result, currentNodeNFA);
					}

					break;

				case 'choice':

					var choices = [];

					for (currentNodeID = 1; currentNodeID < ast.length; ++ currentNodeID) {
						currentNodeNFA = astToNFA(ast[currentNodeID]);

						choices.push(currentNodeNFA);
					}

					result = Automaton.choice(choices);

					break;

				default:
					break;
			}

			return result;
		}

		/**
		 * Get epsilon-closure of a given state of a given NFA.
		 *
		 * @param nfa
		 * @param state
		 * @returns {*[]}
		 */
		function eclose (nfa, state) {

			// Define the eclosure array
			var eclosure = [state];

			// Save transitions count for reference
			var transitionsCount = nfa.getTransitionsCount();

			// Iterate over transitions
			for (var transitionID = 0; transitionID < transitionsCount; ++ transitionID) {

				// Save current transition reference
				var currentTransition = nfa.transitions[transitionID];

				// If current transition leads to a directly connected states
				if ((currentTransition.stateFrom === state) && (currentTransition.character === '')
					&& (currentTransition.stateTo !== state)) {

					// Save eclose of the state
					var epsilonConnectedStateEclosure = eclose(nfa, currentTransition.stateTo);

					// Add its eclosure to the requested state eclosure
					eclosure = eclosure.concat(epsilonConnectedStateEclosure);
				}
			}

			// Return eclosure of a given state of the NFA
			return eclosure;
		}

		/**
		 * Get an epsilon closure of a combo state of an NFA
		 *
		 * @param nfa
		 * @param comboState
		 * @returns {Array}
		 */
		function comboEclose(nfa, comboState) {

			// Declare an array for initial states eclosure
			var comboEclose = [];

			// Iterate over NFA initial states
			for (var comboStateElementID = 0; comboStateElementID < comboState.length; ++ comboStateElementID) {

				// Save current initial state
				var currentComboStateElement = comboState[comboStateElementID];

				// Save epsilon closure of current initial state
				var currentComboStateEclose = eclose(nfa, currentComboStateElement);

				// Add current initial state epsilon closure to the initial epsilon closure
				comboEclose = comboEclose.concat(currentComboStateEclose);
			}

			// Sort the result
			comboEclose.sort();

			return comboEclose;
		}

		/**
		 * Get an initial combo-state eclosure of an NFA.
		 *
		 * @param nfa
		 * @returns {Array}
		 */
		function getInitialEclose (nfa) {
			return comboEclose(nfa, nfa.getInitialStates());
		}

		/**
		 * Checks if a given combo state is final.
		 *
		 * @param originalNFA
		 * @param comboState
		 * @returns {boolean}
		 */
		function isComboStateFinal (originalNFA, comboState) {

			// Save the indicator of the combo state being final
			var comboStateFinal = false;

			// Save a reference to old final states
			var oldFinalStates = originalNFA.getFinalStates();

			// Add the state to final states, if required
			for (var currentOldFinalStateID = 0; currentOldFinalStateID < oldFinalStates.length; ++ currentOldFinalStateID) {

				var currentOldFinalState = oldFinalStates[currentOldFinalStateID];

				if (-1 < comboState.indexOf(currentOldFinalState)) {

					// Set the combo state final indicator to true
					comboStateFinal = true;

					// Break
					break;
				}
			}

			// Return the combo state final indicator
			return comboStateFinal;
		}

		/**
		 * Get all the transitions of a given combo state.
		 *
		 * @param originalNFA
		 * @param comboState
		 * @returns {{}}
		 */
		function getComboStateTransitions (originalNFA, comboState) {

			// Save the current combo state transitions array
			var currentComboStateTransitions = {};

			// Save old nfa transitions count for reference
			var oldTransitionsCount = originalNFA.getTransitionsCount();

			// Loop over the NFA transitions
			for (var currentTransitionID = 0; currentTransitionID < oldTransitionsCount; ++ currentTransitionID) {

				// Save current transition for reference
				var currentTransition = originalNFA.transitions[currentTransitionID];

				var currentTransitionIsFromCurrentComboState =
					(-1 < comboState.indexOf(currentTransition.stateFrom));

				var currentTransitionIsNonEpsilon = (currentTransition.character != '');

				// If a transition for one of the current combo states found
				if (currentTransitionIsFromCurrentComboState && currentTransitionIsNonEpsilon) {

					// If there is no transition for this character from current combo state yet
					if (currentComboStateTransitions[currentTransition.character] === undefined) {

						// Create an empty array for the character and this combo state
						currentComboStateTransitions[currentTransition.character] = [];
					}

					// Add a new transition there
					currentComboStateTransitions[currentTransition.character].push(currentTransition.stateTo);
				}
			}

			return currentComboStateTransitions;
		}

		/**
		 * Determinize an NFA.
		 *
		 * @param originalNFA
		 * @returns {Automaton}
		 */
		function determinize (originalNFA) {

			// Define a new NFA (which will be a de-facto DFA) for the result
			var determinizedNFA = new Automaton();

			// Create an array for final states
			var newFinalStates = [];

			// Get initial eclosure
			var initialEclose = getInitialEclose(originalNFA);

			// Save the new DFA combo states
			var comboStates = [initialEclose];

			// Save the pointer to currently processed combo state
			var currentComboStateID = 0;

			// As long as new combo states appear
			while (currentComboStateID < comboStates.length) {

				// Save current combo state for reference
				var currentComboState = comboStates[currentComboStateID];

				// If current combo state is final for the original NFA
				if (isComboStateFinal(originalNFA, currentComboState)) {

					// Save current state as final state
					newFinalStates.push(currentComboStateID);
				}

				// Get current combo state transitions
				var currentComboStateTransitions = getComboStateTransitions(originalNFA, currentComboState);

				// Save for reference keys of the current combo state transitions object
				var currentComboStateTransitionsKeys = Object.keys(currentComboStateTransitions);

				// Add the newly received transitions to the determinized automaton

				// Loop over current combo state transitions
				for (var cstID = 0; cstID < currentComboStateTransitionsKeys.length; ++ cstID) {

					// Save the current combo state transition key for reference
					var cstKey = currentComboStateTransitionsKeys[cstID];

					// Save the eclosure of a combo state discovered
					var currentComboStateTransitionTargetEclose = comboEclose(originalNFA, currentComboStateTransitions[cstKey]);

					// Check if the target state is in the comboStates array or not

					// Define current combo state ID to the last + 1 element of combo states array by default
					var currentTargetComboStateID = comboStates.length;

					// Loop over existing combo states
					for (var currentlyCheckedComboStateID = 0; currentlyCheckedComboStateID < comboStates.length;
						++ currentlyCheckedComboStateID) {

						// If a new state is already in the combo states array
						if (comboStates[currentlyCheckedComboStateID].equals(currentComboStateTransitionTargetEclose)) {

							// Save its ID
							currentTargetComboStateID = currentlyCheckedComboStateID;

							// Break
							break;
						}
					}

					// Add the new combo state to the combo states array, if still missing
					if (currentlyCheckedComboStateID === comboStates.length) {
						comboStates.push(currentComboStateTransitionTargetEclose);
					}

					// Add transitions for the new combo state to the result
					determinizedNFA.addTransition(currentComboStateID, currentTargetComboStateID, cstKey);
				}

				// Go to the next combo state
				++ currentComboStateID;
			}

			// Set the initial states
			determinizedNFA.setInitialStates([0]);

			// Set the final states
			determinizedNFA.setFinalStates(newFinalStates);

			// Set states for result
			determinizedNFA.setStatesCount(comboStates.length);

			// Return the determinized NFA
			return determinizedNFA;
		}

		/**
		 * Reverse a given automaton.
		 *
		 * @param originalAutomaton
		 * @returns {Automaton}
		 */
		function reverse (originalAutomaton) {

			// Create a new NFA for result
			var reverseAutomaton = new Automaton();

			// Set old initial states as new final states
			reverseAutomaton.setFinalStates(originalAutomaton.getInitialStates());

			// Set old final states as new initial states
			reverseAutomaton.setInitialStates(originalAutomaton.getFinalStates());

			// Save the amount of transitions for reference
			var transitionsCount = originalAutomaton.getTransitionsCount();

			// Loop over transitions
			for (var currentTransitonID = 0; currentTransitonID < transitionsCount; ++ currentTransitonID) {

				// Save current transition for reference
				var currentTransition = originalAutomaton.transitions[currentTransitonID];

				// Add a reversed analog of the currently processed transition to the result
				reverseAutomaton.addTransition(currentTransition.stateTo, currentTransition.stateFrom, currentTransition.character);
			}

			// Return the result
			return reverseAutomaton;
		}

		function getSimpleNotionOfAMinimalDFA (minimalDFA) {

			// Define a variable for the result
			var simpleNotion = {
				'transitions': [],
				'finalStates': []
			};

			// Save the DFA states for reference
			var statesCount = minimalDFA.getStatesCount();

			// Loop over states
			for (var currentStateID = 0; currentStateID < statesCount; ++ currentStateID) {

				// Initialize object for storing current state transitions
				var currentStateTransitions = {};

				// Find all the transitions for current state
				for (var currentTransitionID = 0; currentTransitionID < minimalDFA.transitions.length; ++ currentTransitionID) {

					// Save current transition for reference
					var currentTransition = minimalDFA.transitions[currentTransitionID];

					// If current transition is from current state
					if (currentTransition.stateFrom === currentStateID) {
						// Save the transition in the right place
						currentStateTransitions[currentTransition.character] = currentTransition.stateTo;
					}
				}

				// Add the newly made transitions
				simpleNotion['transitions'].push(currentStateTransitions);
			}

			// Set the final states
			simpleNotion['finalStates'] = minimalDFA.getFinalStates();

			// Return the simple minimal notion of a given DFA
			return simpleNotion;
		}

		return Automaton;
	}
);
