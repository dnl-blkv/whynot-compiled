/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[
		'./Transition'
	],
	function(
		Transition
	) {
		'use strict';

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

		NFA.prototype.setStates = function (statesCount) {
			for(var i = 0; i < statesCount; ++ i) {
				this.states.push(i);
			}
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

		NFA.concat = function (firstNFA, secondNFA) {

			// Create an empty NFA to save the result
			var result = new NFA();

			// Set the amount of states for the resulting NFA
			result.setStates(firstNFA.getStatesCount() + secondNFA.getStatesCount());

			// Declare counter and temporal variable for storing transitions
			var currentTransitionID, newTransition;

			// Loop over first NFA's transitions
			for (currentTransitionID = 0; currentTransitionID < firstNFA.transitions.length; ++ currentTransitionID) {

				// Save the current transition for reference
				newTransition = firstNFA.transitions[currentTransitionID];

				// Add a copy of the new transition to the resulting NFA
				result.addTransition(newTransition.stateFrom, newTransition.stateTo, newTransition.character);
			}

			// Connect the first NFA with the second one
			result.addTransition(firstNFA.getFinalStates(), firstNFA.getStatesCount(), "");

			// Loop over second NFA's transitions
			for (currentTransitionID = 0; currentTransitionID < secondNFA.transitions.length; ++ currentTransitionID) {

				// Save the current transition for reference
				newTransition = secondNFA.transitions[currentTransitionID];

				// Add a shifted copy of the new transition to the resulting NFA
				result.addTransition(newTransition.stateFrom + firstNFA.getStatesCount(),
					newTransition.stateTo + firstNFA.getStatesCount(), newTransition.character);
			}

			// Set the nwe NFA final state
			result.setFinalStates([firstNFA.getStatesCount() + secondNFA.getStatesCount() - 1]);

			// Return the result of NFA concatenation
			return result;
		};

		// TODO: Check
		NFA.choice = function (choices) {

			// Create a NFA for result
			var result = new NFA();

			// Save the total amount of states in the new NFA
			var statesCount = 2;

			// Iterate over choices
			for (var i = 0; i < choices.length; ++ i) {

				// Increase states amount accordingly
				statesCount += choices[i].getStatesCount();
			}

			// Set the required amount of states
			result.setStates(statesCount);

			// Save the state IDs shift
			var adderTrack = 1;

			// Iterate over choices
			for (i = 0; i < choices.length; ++ i) {

				// Add transition from initial state to every choice
				result.addTransition(0, adderTrack, "");

				// Save reference to a given choice
				var med = choices[i];

				// Iterate over the choice transitions
				for (var currentTransitionID = 0; currentTransitionID < med.transitions.length; ++ currentTransitionID) {

					// Save the new transition for reference
					var newTransition = med.transitions[currentTransitionID];

					// Add the shifted version of transition to the resulting NFA
					result.addTransition(newTransition.stateFrom + adderTrack, newTransition.stateTo + adderTrack, newTransition.character);
				}

				// Increase the shift
				adderTrack += med.getStatesCount();

				// Add the ending transition
				result.addTransition(adderTrack - 1, statesCount - 1, "");
			}

			// Set the final states
			result.setFinalStates([statesCount - 1]);

			// Return the parallely connected choices
			return result;
		};

		return NFA;
	}
);
