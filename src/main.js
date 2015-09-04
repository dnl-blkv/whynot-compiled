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

		function createInput(array) {
			var i = 0;
			return function () {
				return array[i++] || null;
			};
		}

		function testAutomaton () {

			var initialState = 0;

			var transitions = [
				{"a": 1, "b": 1, "c": 2, "d": 2},
				{"a": 3, "e": 3},
				{"f": 3},
				{}
			];

			var reverseTransitions = [
				{"1": ["a", "b"], "2": ["c", "d"]},
				{"3": ["a", "e"]},
				{"3": ["f"]},
				{}
			];

			var finalStates = [3];

			var automaton = new Automaton(initialState, transitions, reverseTransitions, finalStates);

			console.log("Result:", automaton.execute(createInput("a")));
		}

		testAutomaton();

		return {
			Automaton: Automaton
		};
	}
);
