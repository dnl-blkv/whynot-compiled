/**
 * Created by danek_000 on 15.9.2015.
 *
 * Generic VM-based formal language matching framework.
 * This module provides an API object which exposes the usual entry points for this library.
 *
 * @module whynotPremadeCompiler
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
			Automaton: Automaton,

			/**
			 * Compile a simple minimal dfa from a given AST using a custom compile function.
			 *
			 * @param compile
			 * @param ast
			 * @returns {{initialState: number, transitions: Array, finalStates: Array.<Number>}}
			 */
			compileSimpleDFA: function (compile, ast) {

				// Get an NFA from a given AST using given compile function
				var nfa = compile(ast);

				// Return a simplified
				return Automaton.toSimpleDFA(nfa);
			}
		};
	}
);
