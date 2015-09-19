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

		var Compiler = whynotPremadeCompiler.Compiler;

		var Traverser = whynotPremadePlayer.Traverser;

		// Showcase examples of Whynot Premade System
		describe('Whynot Premade System Examples', function() {

			// Mimicking Whynot, the Whynot Premade System expects to receive input char-by-char.
			// Here's a simple helper which creates this iterator based on a string or array:
			function createInput (array) {
				var i = 0;
				return function() {
					return array[i++] || null;
				};
			}

			// Convert records chain to an array of vertical choices
			function recordsChainToVerticalChoicesArray (chainTail) {

				var verticalChoicesArray = [];

				var currentRecord = chainTail;

				// Iterate over the records chain
				// Converting the list to the reverse array
				while (!currentRecord.isHead()) {

					// Add each record to the array beginning
					verticalChoicesArray.unshift(currentRecord.characters);

					// Go to the previous record
					currentRecord = currentRecord.getPreviousRecord();
				}

				// Return the resulting array of char choices for each step
				return verticalChoicesArray;
			}

			function transportVerticalChoicesArray (verticalChoicesArray) {

				var horizontalChoices = [];

				var oldHorizontalChoicesCount = 0;

				for (var currentStepID = 0; currentStepID < verticalChoicesArray.length; ++ currentStepID) {

					var currentStepChoices = verticalChoicesArray[currentStepID];

					var currentStepChoicesCount = currentStepChoices.length;

					for (var currentChoiceID = 0; currentChoiceID < currentStepChoicesCount; ++ currentChoiceID) {

						var currentChoiceCharacter = currentStepChoices[currentChoiceID];

						if (currentStepID === 0) {

							horizontalChoices.push([currentChoiceCharacter]);

						} else {

							var shiftedCurrentChoiceID = ((currentChoiceID + 1) % currentStepChoicesCount);

							for (var currentOldChoiceID = 0; currentOldChoiceID < oldHorizontalChoicesCount; ++ currentOldChoiceID) {

								var currentOldChoice = horizontalChoices[currentOldChoiceID];

								if (shiftedCurrentChoiceID === 0) {

									currentOldChoice.push(currentChoiceCharacter);

								} else {

									var newChoice = currentOldChoice.slice();

									newChoice.push(currentChoiceCharacter);

									horizontalChoices.push(newChoice);
								}
							}
						}
					}

					oldHorizontalChoicesCount = horizontalChoices.length;
				}

				return horizontalChoices;
			}

			function flattenResults (results) {
				var resultsCount = results.length;

				var flatResults = [];

				for (var resultId = 0; resultId < resultsCount; ++ resultId) {

					var currentRecord = results[resultId];

					var currentRecordVerticalChoices = recordsChainToVerticalChoicesArray(currentRecord);

					var currentRecordFlatChoices = transportVerticalChoicesArray(currentRecordVerticalChoices);

					flatResults = flatResults.concat(currentRecordFlatChoices);
				}

				return flatResults;
			}

			function processResults (results) {

				var resultsCount = results.length;

				var processedResults = [];

				for (var resultId = 0; resultId < resultsCount; ++ resultId) {

					var currentRecord = results[resultId];

					var currentFlatRecord = recordsChainToVerticalChoicesArray(currentRecord);

					processedResults.push(currentFlatRecord);
				}

				return processedResults;
			}

			// Testing with regular expressions
			// Currently regular expressions converter supports the following elements:
			// '(' and ')' for grouping
			// '|' for alternation
			// '*' for zero-or-more repetition (kleene star)
			// + plain concatentaion
			describe('regular expressions', function() {
				it('can perform simple regex matching', function () {
					var biverseDFA = Compiler.regExpToBiverseDFA('abc(d|e)f');
					var traverser = new Traverser(biverseDFA);

					// Check for fully matching result
					var fullMatchResult = traverser.execute(createInput('abcdf'));
					chai.expect(fullMatchResult.length).to.equal(1);
					chai.expect(fullMatchResult[0].getAcceptedCount()).to.equal(5);
					chai.expect(fullMatchResult[0].getMissingCount()).to.equal(0);
				});

				it('can complete a string based on a regex', function () {
					// Check for partially matching result
					var biverseDFA = Compiler.regExpToBiverseDFA('(a|(bc))d(e|f)');
					var traverser = new Traverser(biverseDFA);

					chai.expect(processResults(traverser.execute(createInput('ad')))).to.deep.equal([
						[['a'], ['d'], ['e', 'f']]
					]);

					chai.expect(processResults(traverser.execute(createInput('bf')))).to.deep.equal([
						[['b'], ['c'], ['d'], ['f']]
					]);

					chai.expect(processResults(traverser.execute(createInput('d')))).to.deep.equal([
						[['a'], ['d'], ['e', 'f']],
						[['b'], ['c'], ['d'], ['e', 'f']]
					]);

					chai.expect(processResults(traverser.execute(createInput('abc')))).to.deep.equal([]);
				});
			});
		});
	}
);
