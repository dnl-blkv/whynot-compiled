/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[],
	function() {
		'use strict';

		/**
		 * Describes a Non-deterministic Finite Automaton.
		 *
		 * @constructor
		 */
		function Automaton () {

			// Save the initial state
			this.initialState = [];

			// Save the states array
			this.statesCount = 0;

			// Save the array for transitions
			this.transitions = [];

			// Save the final state
			this.finalStates = [];
		}

		/**
		 * Constant describing a biverse DFA initial state.
		 *
		 * @type {number}
		 */
		Automaton.DFA_INITIAL_STATE = 0;

		/**
		 * Set initial states of an automaton.
		 *
		 * @param initialState
		 */
		Automaton.prototype.setInitialStates = function (initialState) {
			this.initialState = initialState;
		};

		/**
		 * Get copy of initial states of an automaton.
		 *
		 * @returns {Array.<T>}
		 */
		Automaton.prototype.getInitialStates = function () {
			return this.initialState.slice();
		};

		/**
		 * Get amount of states in an automaton.
		 *
		 * @returns {Number}
		 */
		Automaton.prototype.getStatesCount = function () {
			return this.statesCount;
		};

		/**
		 * Get amount of transitions in an automaton.
		 *
		 * @returns {Number}
		 */
		Automaton.prototype.getTransitionsCount = function () {
			return this.transitions.length;
		};

		/**
		 * Set amount of states in an automaton.
		 *
		 * @param statesCount
		 */
		Automaton.prototype.setStatesCount = function (statesCount) {
			this.statesCount = statesCount;
		};

		/**
		 *
		 *
		 * @param stateFrom
		 * @param stateTo
		 * @param character
		 */
		Automaton.prototype.addTransition = function (stateFrom, stateTo, character) {
			this.transitions.push({
				'stateFrom': stateFrom,
				'stateTo': stateTo,
				'character': character
			});
		};

		/**
		 * Set final states of an automaton.
		 *
		 * @param finalState
		 */
		Automaton.prototype.setFinalStates = function (finalState) {
			this.finalStates = finalState;
		};

		/**
		 * Get a copy of final states of an automaton.
		 *
		 * @returns {Array.<T>}
		 */
		Automaton.prototype.getFinalStates = function () {
			return this.finalStates.slice();
		};

		/**
		 * Concatenate two automata.
		 *
		 * @param leftAutomaton
		 * @param rightAutomaton
		 * @returns {Automaton}
		 */
		Automaton.concat = function (leftAutomaton, rightAutomaton) {

			// Create an empty NFA to save the result
			var result = new Automaton();

			// Set the amount of states for the resulting NFA
			result.setStatesCount(leftAutomaton.getStatesCount() + rightAutomaton.getStatesCount());

			// Set the new initial states for the new NFA
			result.setInitialStates(leftAutomaton.getInitialStates());

			// Declare counter and temporal variable for storing transitions
			var currentTransitionID, newTransition;

			var leftTransitionsCount = leftAutomaton.getTransitionsCount();

			// Loop over left NFA's transitions
			for (currentTransitionID = 0; currentTransitionID < leftTransitionsCount; ++ currentTransitionID) {

				// Save the current transition for reference
				newTransition = leftAutomaton.transitions[currentTransitionID];

				// Add a copy of the new transition to the resulting NFA
				result.addTransition(newTransition.stateFrom, newTransition.stateTo, newTransition.character);
			}

			var leftFinalStates = leftAutomaton.getFinalStates();

			// Connect the left NFA with the right one
			for (var currentLeftFinalStateID = 0; currentLeftFinalStateID < leftFinalStates.length; ++ currentLeftFinalStateID) {
				var currentLeftFinalState = leftFinalStates[currentLeftFinalStateID];

				result.addTransition(currentLeftFinalState, leftAutomaton.getStatesCount(), "");
			}

			var rightTransitionsCount = rightAutomaton.getTransitionsCount();

			// Loop over right NFA's transitions
			for (currentTransitionID = 0; currentTransitionID < rightTransitionsCount; ++ currentTransitionID) {

				// Save the current transition for reference
				newTransition = rightAutomaton.transitions[currentTransitionID];

				// Add a shifted copy of the new transition to the resulting NFA
				result.addTransition(newTransition.stateFrom + leftAutomaton.getStatesCount(),
					newTransition.stateTo + leftAutomaton.getStatesCount(), newTransition.character);
			}

			// Copy the right NFA final states to define a new NFA final states array
			var newFinalStates = rightAutomaton.getFinalStates();

			// Loop over the new final states
			for (var currentFinalStateID = 0; currentFinalStateID < newFinalStates.length; ++ currentFinalStateID) {

				// Shift each state
				newFinalStates[currentFinalStateID] += leftAutomaton.getStatesCount();
			}

			// Set the new final states
			result.setFinalStates(newFinalStates);

			// Return the result of NFA concatenation
			return result;
		};

		/**
		 * Parallelize given automata.
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

		/**
		 * Apply kleene star operation to an automaton.
		 *
		 * @param automaton
		 * @returns {Automaton}
		 */
		Automaton.repetition = function (automaton) {

			var result = new Automaton();

			result.setStatesCount(automaton.getStatesCount() + 2);

			result.setInitialStates([0]);

			result.addTransition(0, automaton.getStatesCount() + 1, '');
			result.addTransition(0, 1, '');

			var transitionsCount = automaton.getTransitionsCount();

			for (var currentTransitionID = 0; currentTransitionID < transitionsCount; ++ currentTransitionID) {
				var currentTransition = automaton.transitions[currentTransitionID];

				result.addTransition(currentTransition.stateFrom + 1, currentTransition.stateTo + 1, currentTransition.character);
			}

			result.addTransition(automaton.getStatesCount(), 1, '');
			result.addTransition(automaton.getStatesCount(), automaton.getStatesCount() + 1, '');

			result.setFinalStates([automaton.getStatesCount() + 1]);

			return result;
		};

		return Automaton;
	}
);
