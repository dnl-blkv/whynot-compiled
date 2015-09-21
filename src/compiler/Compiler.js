/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[
		'./Automaton'
	],
	function(
		Automaton
	) {
		'use strict';
		
		return {
			/**
			 * Convert a regular expression to a minimal DFA in a simple notion.
			 *
			 * @param compile
			 * @param ast
			 * @returns {{initialState: number, transitions: Array, finalStates: Array.<Number>}}
			 */

			compileBiverseDFA: function (compile, ast) {

				// Get an NFA from a given AST using given compile function
				var nfa = compile(ast);

				// Minimize the NFA
				var minimalDFA = Automaton.minimize(nfa);

				// Define a variable for the transitions
				var transitions = [];

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
					transitions.push(currentStateTransitions);
				}

				// Save the final states
				var finalStates = minimalDFA.getFinalStates();

				// Return the simple minimal notion of a given DFA
				return {
					'initialState': Automaton.DFA_INITIAL_STATE,
					'transitions': transitions,
					'finalStates': finalStates
				};
			}
		};
	}
);
