/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[
		'regexParser',
		'./Transition'
	],
	function(
		regexParser,
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

		/**
		 * Concatenate two NFA.
		 *
		 * @param leftNFA
		 * @param rightNFA
		 * @returns {NFA}
		 */
		NFA.concat = function (leftNFA, rightNFA) {

			// Create an empty NFA to save the result
			var result = new NFA();

			// Set the amount of states for the resulting NFA
			result.setStates(leftNFA.getStatesCount() + rightNFA.getStatesCount());

			// Copy left NFA initial states to define the new NFA initial states array
			var newInitialStates = leftNFA.getInitialStates().slice();

			// Set the new initial states for the new NFA
			result.setInitialStates(newInitialStates);

			// Declare counter and temporal variable for storing transitions
			var currentTransitionID, newTransition;

			// Loop over left NFA's transitions
			for (currentTransitionID = 0; currentTransitionID < leftNFA.transitions.length; ++ currentTransitionID) {

				// Save the current transition for reference
				newTransition = leftNFA.transitions[currentTransitionID];

				// Add a copy of the new transition to the resulting NFA
				result.addTransition(newTransition.stateFrom, newTransition.stateTo, newTransition.character);
			}

			var leftFinalStates = leftNFA.getFinalStates();

			// Connect the left NFA with the right one
			for (var currentLeftFinalStateID = 0; currentLeftFinalStateID < leftFinalStates.length; ++ currentLeftFinalStateID) {
				var currentLeftFinalState = leftFinalStates[currentLeftFinalStateID];

				result.addTransition(currentLeftFinalState, leftNFA.getStatesCount(), "");
			}

			// Loop over right NFA's transitions
			for (currentTransitionID = 0; currentTransitionID < rightNFA.transitions.length; ++ currentTransitionID) {

				// Save the current transition for reference
				newTransition = rightNFA.transitions[currentTransitionID];

				// Add a shifted copy of the new transition to the resulting NFA
				result.addTransition(newTransition.stateFrom + leftNFA.getStatesCount(),
					newTransition.stateTo + leftNFA.getStatesCount(), newTransition.character);
			}

			// Copy the right NFA final states to define a new NFA final states array
			var newFinalStates = rightNFA.getFinalStates().slice();

			// Loop over the new final states
			for (var currentFinalStateID = 0; currentFinalStateID < newFinalStates.length; ++ currentFinalStateID) {

				// Shift each state
				newFinalStates[currentFinalStateID] += leftNFA.getStatesCount();
			}

			// Set the new final states
			result.setFinalStates(newFinalStates);

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
			for (var currentChoiceID = 0; currentChoiceID < choices.length; ++ currentChoiceID) {

				// Increase states amount accordingly
				statesCount += choices[currentChoiceID].getStatesCount();
			}

			// Set the required amount of states
			result.setStates(statesCount);

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

				// Iterate over the choice transitions
				for (var currentTransitionID = 0; currentTransitionID < currentChoice.transitions.length; ++ currentTransitionID) {

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

		NFA.fromRegExp = function (regularExpression) {

			// Create an AST for a given regular expression
			var regularExpressionAST = regexParser.parse(regularExpression);

			var result = astToNFA(regularExpressionAST);

			console.log(regularExpressionAST);

			console.log(result);

			console.log('custom tests:');

			console.log(astToNFA(regexParser.parse('a|b')));

			return result;
		};

		function astToNFA (ast) {

			var currentNodeID, currentNodeNFA, result = new NFA();

			switch (ast[0]) {
				case 'test':

					// Generate a simple test NFA
					result.setStates(2);
					result.setInitialStates([0]);
					result.setFinalStates([1]);
					result.addTransition(0, 1, ast[1]);

					break;

				case 'seq':

					// Concat first two elements
					result = NFA.concat(astToNFA(ast[1]), astToNFA(ast[2]));

					for (currentNodeID = 3; currentNodeID < ast.length; ++ currentNodeID) {
						currentNodeNFA = astToNFA(ast[currentNodeID]);

						result = NFA.concat(result, currentNodeNFA);
					}

					break;

				case 'choice':

					var choices = [];

					for (currentNodeID = 1; currentNodeID < ast.length; ++ currentNodeID) {
						currentNodeNFA = astToNFA(ast[currentNodeID]);

						choices.push(currentNodeNFA);
					}

					result = NFA.choice(choices);

					break;

				default:
					break;
			}

			return result;
		}

		return NFA;
	}
);
