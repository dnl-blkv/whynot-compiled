/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[
		'whynot-premade-compiler',
		'whynot-premade-player'
	],
	function(
		whynotPremadeCompiler,
		whynotPremadePlayer
	) {
		'use strict';

		var Automaton = whynotPremadeCompiler.Automaton;
		var BiverseDFA = whynotPremadeCompiler.BiverseDFA;
		var Traverser = whynotPremadePlayer.Traverser;

		function createInput (array) {
			var i = 0;
			return function () {
				return array[i++] || null;
			};
		}

		function testAutomaton () {

			// REGEXP TO DFA CONVERSION PART

			var regexp = '(a|(bc))d(e|f)';

			console.log("Regexp: " + regexp);

			console.time('compilation');

			var biverseDFA = Automaton.regExpToBiverseDFA(regexp);

			console.timeEnd('compilation');

			console.log("DFA (below):");

			console.log(biverseDFA);

			var traverser = new Traverser(biverseDFA);

			var inputString = "ad";

			console.log("Input: " + inputString);
			console.log("");

			console.time('execution');

			for (var i = 0; i < 99999; i ++) {
				traverser.execute(createInput(inputString));
			}

			var results = traverser.execute(createInput(inputString));

			console.timeEnd('execution');

			printResults(results);
		}

		/**
		 * Prints the results of an automaton execution.
		 *
		 * @param results
		 */
		function printResults (results) {
			var resultsCount = results.length;

			console.log("\nResults are below.");
			console.log("==================");

			for (var resultId = 0; resultId < resultsCount; resultId ++) {

				console.log("Result #" + resultId + ":");

				var currentRecord = results[resultId];

				console.log("Accepted: " + currentRecord.getAcceptedCount());

				console.log("Missing: " + currentRecord.getMissingCount());

				var reverseResults = [];

				while (currentRecord !== null) {

					if(currentRecord.getPreviousRecord() === null) {
						break;
					}

					var addPosition = currentRecord.getAcceptedCount() + currentRecord.getMissingCount() - 1;

					reverseResults.unshift([currentRecord.getAccepted(), currentRecord.getCharacters(), addPosition]);

					currentRecord = currentRecord.getPreviousRecord();
				}

				var reverseResultsCount = reverseResults.length;

				for (var reverseResultId = 0; reverseResultId < reverseResultsCount; reverseResultId ++) {
					var charStatus = reverseResults[reverseResultId][0] ? "Accepted" : "Missing";

					var missingPosition = !reverseResults[reverseResultId][0] ?
					" to be added at position " + reverseResults[reverseResultId][2] : "";

					console.log(charStatus, reverseResults[reverseResultId][1], missingPosition);
				}

				console.log("");
			}
		}

		testAutomaton();
	}
);
