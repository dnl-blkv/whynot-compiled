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

		/**
		 * Describes an AST to Automata compiler.
		 *
		 * @constructor
		 */
		function Compiler () {

		}

		/**
		 * Convert a regular expression to a NFA.
		 *
		 * @param compile
		 * @param ast
		 * @returns {*}
		 */
		Compiler.astToNFA = function (compile, ast) {
			// Return result of AST to NFA conversion
			return compile(ast);
		};

		/**
		 * Convert a regular expression to a DFA.
		 *
		 * @param compile
		 * @param ast
		 * @returns {Automaton}
		 */
		Compiler.astToDFA = function (compile, ast) {

			// Create an NFA from a given regular expression
			var nfa = Compiler.astToNFA(compile, ast);

			// Return determinized NFA
			return Automaton.determinize(nfa);
		};

		/**
		 * Convert a regular expression to a minimal DFA.
		 *
		 * @param compile
		 * @param ast
		 * @returns {Automaton}
		 */
		Compiler.astToMinimalDFA = function (compile, ast) {
			var dfa = Compiler.astToDFA(compile, ast);

			return Automaton.minimize(dfa);
		};

		/**
		 * Convert a regular expression to a minimal DFA in a simple notion.
		 *
		 * @param compile
		 * @param ast
		 * @returns {{initialState: number, transitions: Array, finalStates: Array.<Number>}}
		 */
		Compiler.astToBiverseDFA = function (compile, ast) {

			var minimalDFA = Compiler.astToMinimalDFA(compile, ast);

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
		};

		return Compiler;
	}
);
