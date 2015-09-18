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
		 * @param transitions
		 * @param reverseTransitions
		 * @param finalStates
		 * @constructor
		 */
		function BiverseDFA(transitions, finalStates, reverseTransitions) {

			// Define transitions table
			this.transitions = transitions;

			if (this.transitions === undefined) {
				console.log("transitions were not set for a Traverser!");
				this.transitions = [];
			}

			// Define final states array
			this.finalStates = finalStates;

			if (this.finalStates === undefined) {
				console.log("finalStates were not set for a Traverser!");
				this.finalStates = [];
			}

			// Define reverse transitions table
			this.reverseTransitions = reverseTransitions;

			if (this.reverseTransitions === undefined) {
				console.log("reverse transitions were not set for a Traverser!");
				this.reverseTransitions = BiverseDFA.createReverseTransitions(transitions);
			}

			// Set the initial state, it's always 0 for these simplified automata
			this.initialState = BiverseDFA.INITIAL_STATE;
		}

		/**
		 * Constant describing a biverse DFA initial state.
		 *
		 * @type {number}
		 */
		BiverseDFA.INITIAL_STATE = 0;

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
		};

		/**
		 * return an initial state of a given Biverse DFA
		 *
		 * @returns {number|*}
		 */
		BiverseDFA.prototype.getInitialState = function () {
			return this.initialState;
		};

		/**
		 * Create reverse transition table out of a given transition table.
		 *
		 * @param transitions
		 * @returns {Array}
		 */
		BiverseDFA.createReverseTransitions = function (transitions) {

			var reverseTransitions = [];

			var statesCount = transitions.length;

			for (var stateNumber = 0; stateNumber < statesCount; stateNumber ++) {
				reverseTransitions[stateNumber] = {};

				var stateTransitionKeys = Object.keys(transitions[stateNumber]);

				var stateTransitionKeysCount = stateTransitionKeys.length;

				for (var stateTransitionKeyId = 0; stateTransitionKeyId < stateTransitionKeysCount; stateTransitionKeyId ++) {
					var stateTransitionKey = stateTransitionKeys[stateTransitionKeyId];

					var transition = transitions[stateNumber][stateTransitionKey];

					var transitionString = transition + '';

					if (reverseTransitions[stateNumber][transitionString] === undefined) {
						reverseTransitions[stateNumber][transitionString] = [];
					}

					reverseTransitions[stateNumber][transitionString].push(stateTransitionKey);
				}
			}

			return reverseTransitions;
		}

		return BiverseDFA;
	}
);
