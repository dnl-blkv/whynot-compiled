/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[],
	function() {
		'use strict';

		/**
		 * Describes an automaton representing a regular rule.
		 *
		 * @param initialState
		 * @param transitions
		 * @param reverseTransitions
		 * @param finalStates
		 * @constructor
		 */
		function BiverseDFA(transitions, reverseTransitions, finalStates) {

			// Define transitions table
			this.transitions = transitions;

			if (this.transitions === undefined) {
				console.log("transitions were not set for an Traverser!");
				this.transitions = [];
			}

			// Define reverse transitions table
			this.reverseTransitions = reverseTransitions;

			if (this.reverseTransitions === undefined) {
				console.log("reverse transitions were not set for an Traverser!");
				this.reverseTransitions = [];
			}

			// Define final states array
			this.finalStates = finalStates;

			if (this.finalStates === undefined) {
				console.log("finalStates were not set for an Traverser!");
				this.finalStates = [];
			}

			// Set the initial state, it's always 0 for these simplified automata
			this.initialStates = 0;
		}

		/**
		 * Check whether a given state is final.
		 *
		 * @param state
		 * @returns {boolean}
		 */
		BiverseDFA.prototype.isStateFinal = function(state) {
			return (-1 < this.finalStates.indexOf(state));
		}

		/**
		 * Get transitions for a state.
		 *
		 * @param currentState
		 * @returns {*}
		 */
		BiverseDFA.prototype.getStateTransitions = function (currentState) {
			return this.transitions[currentState];
		};

		/**
		 * Get reverse transitions for a state.
		 *
		 * @param currentState
		 * @returns {*}
		 */
		BiverseDFA.prototype.getStateReverseTransitions = function (currentState) {
			return this.reverseTransitions[currentState];
		};

		/**
		 * Get the next state for a given state and input.
		 *
		 * @param currentState
		 * @param inputItem
		 * @returns {*}
		 */
		BiverseDFA.prototype.getNextState = function (currentState, inputItem) {

			// Get transitions info array for the current state
			var currentStateTransitions = this.getStateTransitions(currentState);

			// Return the next state
			return currentStateTransitions[inputItem];
		}

		return BiverseDFA;
	}
);
