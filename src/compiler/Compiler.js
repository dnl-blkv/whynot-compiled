/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[
		'./Automaton',
		'./util/arrayUtils',
		'regexParser'
	],
	function(
		Automaton,
		arrayUtils,
		regexParser
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
		 * @param regularExpression
		 * @returns {Automaton}
		 */
		Compiler.regExpToNFA = function (regularExpression) {

			// Create an AST for a given regular expression
			var regularExpressionAST = regexParser.parse(regularExpression);

			// Return result of AST to NFA conversion
			return astToNFA(regularExpressionAST);
		};

		/**
		 * Convert a regular expression to a DFA.
		 * @param regularExpression
		 * @returns {Automaton}
		 */
		Compiler.regExpToDFA = function (regularExpression) {

			// Create an NFA from a given regular expression
			var nfa = Compiler.regExpToNFA(regularExpression);

			// Return determinized NFA
			return Automaton.determinize(nfa);
		};

		/**
		 * Convert a regular expression to a minimal DFA.
		 *
		 * @param regularExpression
		 * @returns {Automaton}
		 */
		Compiler.regExpToMinimalDFA = function (regularExpression) {
			var dfa = Compiler.regExpToDFA(regularExpression);

			return Automaton.minimize(dfa);
		};

		/**
		 * Convert a regular expression to a minimal DFA in a simple notion.
		 *
		 * @param regularExpression
		 * @returns {*}
		 */
		Compiler.regExpToBiverseDFA = function (regularExpression) {

			var minimalDFA = Compiler.regExpToMinimalDFA(regularExpression);

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

		/**
		 * Convert a given Abstract Syntax Tree made by the embedded regex parser to a NFA.
		 *
		 * @param ast
		 * @returns {Automaton}
		 */
		function astToNFA (ast) {

			var nfa = new Automaton();

			var currentNodeID, currentNodeNFA;

			switch (ast[0]) {
				case 'test':

					// Generate a simple test NFA
					nfa.setStatesCount(2);
					nfa.setInitialStates([0]);
					nfa.setFinalStates([1]);
					nfa.addTransition(0, 1, ast[1]);

					break;

				case 'seq':

					// Concat first two elements
					nfa = Automaton.concat(astToNFA(ast[1]), astToNFA(ast[2]));

					for (currentNodeID = 3; currentNodeID < ast.length; ++ currentNodeID) {
						currentNodeNFA = astToNFA(ast[currentNodeID]);

						nfa = Automaton.concat(nfa, currentNodeNFA);
					}

					break;

				case 'choice':

					var choices = [];

					for (currentNodeID = 1; currentNodeID < ast.length; ++ currentNodeID) {
						currentNodeNFA = astToNFA(ast[currentNodeID]);

						choices.push(currentNodeNFA);
					}

					nfa = Automaton.choice(choices);

					break;

				case 'repetition':

					var argumentNFA = astToNFA(ast[1]);

					nfa = Automaton.repetition(argumentNFA);

					break;

				default:
					break;
			}

			return nfa;
		}

		return Compiler;
	}
);
