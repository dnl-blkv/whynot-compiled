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

		/**
		 * Create reverse transition table out of a given transition table.
		 *
		 * @param transitions
		 * @returns {Array}
		 */
		function createReverseTransitions (transitions) {

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

		function testAutomaton () {

			var initialState = 0;

			var transitions = [
				{"a": 1, "b": 1, "c": 2, "d": 2},
				{"a": 3, "e": 3},
				{"f": 3},
				{}
			];

			var reverseTransitions = createReverseTransitions(transitions);

			var finalStates = [3];

			var automaton = new Automaton(initialState, transitions, reverseTransitions, finalStates);

			console.log("Result:", automaton.execute(createInput("aa")));
		}

		testAutomaton();

		return {
			Automaton: Automaton
		};
	}
);
