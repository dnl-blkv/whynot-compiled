/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[
		'arrayUtils',
		'regexParser',
		'./Transition'
	],
	function(
		arrayUtils,
		regexParser,
		Transition
	) {
		'use strict';

		// TODO: A tiny array extension; move this.

		/**
		 * Describes a Non-deterministic Finite Automaton.
		 *
		 * @constructor
		 */
		function NFA () {

			// Save the initial state
			this.initialStates = [];

			// Save the states array
			this.states = [];

			// Save the array for transitions
			this.transitions = [];

			// Save the final state
			this.finalStates = [];
		}

		NFA.prototype.setInitialStates = function (initialState) {
			this.initialStates = initialState;
		};

		NFA.prototype.getInitialStates = function () {
			return this.initialStates;
		};

		NFA.prototype.getStatesCount = function () {
			return this.states.length;
		};

		NFA.prototype.getTransitionsCount = function () {
			return this.transitions.length;
		};

		NFA.prototype.setStates = function (statesCount) {
			for(var i = 0; i < statesCount; ++ i) {
				this.states.push(i);
			}
		};

		NFA.prototype.getStates = function () {
			return this.states;
		};

		NFA.prototype.addTransition = function (stateFrom, stateTo, character) {

			var newTransition = new Transition(stateFrom, stateTo, character);

			this.transitions.push(newTransition);
		};

		NFA.prototype.setFinalStates = function (finalState) {
			this.finalStates = finalState;
		};

		NFA.prototype.getFinalStates = function () {
			return this.finalStates;
		};

		/**
		 * Concatenate two NFA.
		 *
		 * @param leftNFA
		 * @param rightNFA
		 * @returns {NFA}
		 */
		NFA.concat = function (leftNFA, rightNFA) {

			// Create an empty NFA to save the result
			var result = new NFA();

			// Set the amount of states for the resulting NFA
			result.setStates(leftNFA.getStatesCount() + rightNFA.getStatesCount());

			// Copy left NFA initial states to define the new NFA initial states array
			var newInitialStates = leftNFA.getInitialStates().slice();

			// Set the new initial states for the new NFA
			result.setInitialStates(newInitialStates);

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
			var newFinalStates = rightNFA.getFinalStates().slice();

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
		 * @returns {NFA}
		 */
		NFA.choice = function (choices) {

			// Create a NFA for result
			var result = new NFA();

			// Save the total amount of states in the new NFA
			var statesCount = 2;

			// Iterate over choices
			for (var currentChoiceID = 0; currentChoiceID < choices.length; ++ currentChoiceID) {

				// Increase states amount accordingly
				statesCount += choices[currentChoiceID].getStatesCount();
			}

			// Set the required amount of states
			result.setStates(statesCount);

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

		NFA.fromRegExp = function (regularExpression) {

			// Create an AST for a given regular expression
			var regularExpressionAST = regexParser.parse(regularExpression);

			// Return result of AST to NFA conversion
			return astToNFA(regularExpressionAST);
		};

		NFA.toDFA = function(nfa) {

			// Return determinized NFA
			return determinize(nfa);
		}
		
		NFA.regExpToDFA = function (regularExpression) {

			// Create an NFA from a given regular expression
			var nfa = NFA.fromRegExp(regularExpression);

			// Return determinized NFA
			return NFA.toDFA(nfa);
		};

		NFA.minimize = function (nfa) {
			return determinize(reverse(determinize(reverse(determinize(nfa)))));
		};

		NFA.regExpToMinimalDFA = function (regularExpression) {
			var dfa = NFA.regExpToDFA(regularExpression);

			return NFA.minimize(dfa);
		};

		NFA.regExpToSimpleMinimalDFA = function (regularExpression) {
			var minimalDFA = NFA.regExpToMinimalDFA(regularExpression);

			return getSimpleNotionOfAMinimalDFA(minimalDFA);
		};

		/**
		 * Convert a given Abstract Syntax Tree made by the embedded regex parser to a NFA.
		 *
		 * @param ast
		 * @returns {NFA}
		 */
		function astToNFA (ast) {

			var currentNodeID, currentNodeNFA, result = new NFA();

			switch (ast[0]) {
				case 'test':

					// Generate a simple test NFA
					result.setStates(2);
					result.setInitialStates([0]);
					result.setFinalStates([1]);
					result.addTransition(0, 1, ast[1]);

					break;

				case 'seq':

					// Concat first two elements
					result = NFA.concat(astToNFA(ast[1]), astToNFA(ast[2]));

					for (currentNodeID = 3; currentNodeID < ast.length; ++ currentNodeID) {
						currentNodeNFA = astToNFA(ast[currentNodeID]);

						result = NFA.concat(result, currentNodeNFA);
					}

					break;

				case 'choice':

					var choices = [];

					for (currentNodeID = 1; currentNodeID < ast.length; ++ currentNodeID) {
						currentNodeNFA = astToNFA(ast[currentNodeID]);

						choices.push(currentNodeNFA);
					}

					result = NFA.choice(choices);

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
		 * Determinize an NFA.
		 *
		 * @param nfa
		 * @returns {NFA}
		 */
		function determinize (nfa) {

			// Define a new NFA (which will be a de-facto DFA) for the result
			var result = new NFA();

			// Get initial eclosure
			var initialEclose = getInitialEclose(nfa);

			// Save the new DFA combo states
			var comboStates = [initialEclose];

			// Set the initial state for the resulting DFA
			result.setInitialStates([0]);

			// Save the pointer to currently processed combo state
			var currentComboStateID = 0;

			// Create an array for final states
			var newFinalStates = [];

			// Save a reference to old final states
			var oldFinalStates = nfa.getFinalStates();

			// As long as new combo states appear
			while (currentComboStateID < comboStates.length) {

				// Add the state to final states, if required
				for (var currentOldFinalStateID = 0; currentOldFinalStateID < oldFinalStates.length; ++ currentOldFinalStateID) {

					var currentOldFinalState = oldFinalStates[currentOldFinalStateID];

					if (-1 < comboStates[currentComboStateID].indexOf(currentOldFinalState)) {

						// Save current state as final state
						newFinalStates.push(currentComboStateID);

						// Break
						break;
					}
				}

				// Save the current combo state transitions array
				var currentComboStateTransitions = {};

				// Save old nfa transitions count for reference
				var oldTransitionsCount = nfa.getTransitionsCount();

				// Loop over the NFA transitions
				for (var currentTransitionID = 0; currentTransitionID < oldTransitionsCount; ++ currentTransitionID) {

					// Save current transition for reference
					var currentTransition = nfa.transitions[currentTransitionID];

					var currentTransitionIsFromCurrentComboState =
						(-1 < comboStates[currentComboStateID].indexOf(currentTransition.stateFrom));

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

				// Save for reference keys of the current combo state transitions object
				var currentComboStateTransitionsKeys = Object.keys(currentComboStateTransitions);

				// Loop over current combo state transitions
				for (var cstID = 0; cstID < currentComboStateTransitionsKeys.length; ++ cstID) {

					// Save the current combo state transition key for reference
					var cstKey = currentComboStateTransitionsKeys[cstID];

					// Save the eclosure of a combo state discovered
					var currentComboStateTransitionTargetEclose = comboEclose(nfa, currentComboStateTransitions[cstKey]);

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
					result.addTransition(currentComboStateID, currentTargetComboStateID, cstKey);
				}

				// Go to the next combo state
				++ currentComboStateID;
			}

			// Set the final states
			result.setFinalStates(newFinalStates);

			// Set states for result
			result.setStates(comboStates.length);

			// Return the determinized NFA
			return result;
		}

		/**
		 * Reverse a given NFA
		 *
		 * @param nfa
		 * @returns {NFA}
		 */
		function reverse (nfa) {

			// Create a new NFA for result
			var result = new NFA();

			// Set old initial states as new final states
			result.setFinalStates(nfa.getInitialStates());

			// Set old final states as new initial states
			result.setInitialStates(nfa.getFinalStates());

			// Save the amount of transitions for reference
			var transitionsCount = nfa.getTransitionsCount();

			// Loop over transitions
			for (var currentTransitonID = 0; currentTransitonID < transitionsCount; ++ currentTransitonID) {

				// Save current transition for reference
				var currentTransition = nfa.transitions[currentTransitonID];

				// Add a reversed analog of the currently processed transition to the result
				result.addTransition(currentTransition.stateTo, currentTransition.stateFrom, currentTransition.character);
			}

			// Return the result
			return result;
		}

		function getSimpleNotionOfAMinimalDFA (dfa) {

			// TODO: Separate the whole DFA concept along with its methods from NFA
			// TODO: Guarantee: initial state equals 0, epsilon-transitions are eliminated

			// Define a variable for the result
			var simpleNotion = {
				'transitions': [],
				'finalStates': []
			};

			// Save the DFA states for reference
			var states = dfa.getStates();

			// Save the DFA states count for reference
			var statesCount = states.length;

			// Loop over states
			for (var currentStateID = 0; currentStateID < statesCount; ++ currentStateID) {

				// Initialize object for storing current state transitions
				var currentStateTransitions = {};

				// Find all the transitions for current state
				for (var currentTransitionID = 0; currentTransitionID < dfa.transitions.length; ++ currentTransitionID) {

					// Save current transition for reference
					var currentTransition = dfa.transitions[currentTransitionID];

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
			simpleNotion['finalStates'] = dfa.getFinalStates();

			// Return the simple minimal notion of a given DFA
			return simpleNotion;
		}

		return NFA;
	}
);
