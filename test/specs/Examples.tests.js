define(
	[
		'regexParser',
		'whynot-premade-compiler',
		'whynot-premade-player'
	],
	function(
		regexParser,
		whynotPremadeCompiler,
		whynotPremadePlayer
		) {
		'use strict';

		var Automaton = whynotPremadeCompiler.Automaton;
		var compileSimpleDFA = whynotPremadeCompiler.compileSimpleDFA;

		var Traverser = whynotPremadePlayer.Traverser;

		// Showcase examples of Whynot Premade System
		describe('Examples', function() {

			// Mimicking Whynot, the Whynot Premade System expects to receive input char-by-char.
			// Here's a simple helper which creates this iterator based on a string or array:
			function createInput (array) {
				var i = 0;
				return function() {
					return array[i++] || null;
				};
			}

			/**
			 * Convert a given Abstract Syntax Tree made by the embedded regex parser to a NFA.
			 *
			 * @param ast
			 * @returns {Automaton}
			 */
			function compile (ast) {

				var nfa = new Automaton();

				var currentNodeID, currentNodeNFA;

				switch (ast[0]) {
					case 'test':

						// Generate a simple test NFA
						nfa = Automaton.char(ast[1]);

						break;

					case 'seq':

						// Concat first two elements
						nfa = Automaton.concat(compile(ast[1]), compile(ast[2]));

						for (currentNodeID = 3; currentNodeID < ast.length; ++ currentNodeID) {
							currentNodeNFA = compile(ast[currentNodeID]);

							nfa = Automaton.concat(nfa, currentNodeNFA);
						}

						break;

					case 'choice':

						var choices = [];

						for (currentNodeID = 1; currentNodeID < ast.length; ++ currentNodeID) {
							currentNodeNFA = compile(ast[currentNodeID]);

							choices.push(currentNodeNFA);
						}

						nfa = Automaton.choice(choices);

						break;

					case 'repetition':

						var argumentNFA = compile(ast[1]);

						nfa = Automaton.repetition(argumentNFA);

						break;

					default:
						break;
				}

				return nfa;
			}

			function compileRegexTraverser (regex) {
				var ast = regexParser.parse(regex);
				var simpleDFA = compileSimpleDFA(compile, ast);
				return new Traverser(simpleDFA);
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

					while (!currentRecord.isHead()) {

						var addPosition = currentRecord.getAcceptedCount() + currentRecord.getMissingCount() - 1;

						reverseResults.unshift([currentRecord.getAccepted(), currentRecord.getCharacters(), addPosition]);

						currentRecord = currentRecord.getFirstPreviousRecord();
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
					currentRecord = currentRecord.getFirstPreviousRecord();
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

				var stringFlatResults = [];

				for (var resultId = 0; resultId < resultsCount; ++ resultId) {

					var currentRecord = results[resultId];

					var currentRecordVerticalChoices = recordsChainToVerticalChoicesArray(currentRecord);

					var currentRecordFlatChoices = transportVerticalChoicesArray(currentRecordVerticalChoices);

					flatResults = flatResults.concat(currentRecordFlatChoices);
				}

				for (var flatResultId = 0; flatResultId < flatResults.length; ++ flatResultId) {
					stringFlatResults.push(flatResults[flatResultId].join(''));
				}

				return stringFlatResults;
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

			function restoreMergedResult (result) {
				var flatResults = [[]];

				var currentFlatResult = flatResults[0];

				var branchId = 0;

				var branches = [result];

				var currentBranch = result;

				while (branchId < branches.length) {
					currentBranch = branches[branchId];

					currentFlatResult = flatResults[branchId];

					while (currentBranch.getPreviousRecords().length > 0) {

						var previousRecords = currentBranch.getPreviousRecords();

						currentFlatResult.push(currentBranch.getCharacters());

						currentBranch = previousRecords[0];

						var previousRecordsCount = previousRecords.length;

						for (var previousRecordId = 1; previousRecordId < previousRecordsCount; ++ previousRecordId) {
							var previousRecord = previousRecords[previousRecordId];
							flatResults.push(currentFlatResult.slice());
							branches.push(previousRecord);
						}
					}

					++ branchId;
				}

				return flatResults;
			}

			// Testing with regular expressions
			// Currently regular expressions converter supports the following elements:
			// '(' and ')' for grouping
			// '|' for alternation
			// '*' for zero-or-more repetition (kleene star)
			// + plain concatentaion
			describe('regular expressions', function() {
				//it('can perform simple regex matching', function () {
				//	var traverser = compileRegexTraverser('abc(d|e)f');
				//
				//	// Check for fully matching result
				//	var fullMatchResult = traverser.execute(createInput('abcdf'));
				//
				//	chai.expect(fullMatchResult.length).to.equal(1);
				//	chai.expect(fullMatchResult[0].getAcceptedCount()).to.equal(5);
				//	chai.expect(fullMatchResult[0].getMissingCount()).to.equal(0);
				//});

				it('can complete a string based on a regex', function () {
					// Check for partially matching result
					var traverser = compileRegexTraverser('(a|(bc)|(pbcx))d(e|f)');

					console.log(traverser.execute(createInput('d')));

					//chai.expect(processResults(traverser.execute(createInput('ad')))).to.deep.equal([
					//	[['a'], ['d'], ['e', 'f']]
					//]);
					//
					//chai.expect(processResults(traverser.execute(createInput('bf')))).to.deep.equal([
					//	[['b'], ['c'], ['d'], ['f']]
					//]);
					//
					////console.log("BEGIN (a|(bc))d(e|f) / 'd'");
					//
					//chai.expect(processResults(traverser.execute(createInput('d')))).to.deep.equal([
					//	[['a'], ['d'], ['e', 'f']],
					//	[['b'], ['c'], ['d'], ['e', 'f']]
					//]);
					//
					//
					////console.log("END (a|(bc))d(e|f) / 'd'");
					//
					//chai.expect(processResults(traverser.execute(createInput('abc')))).to.deep.equal([]);
				});

				////it('can run faster than wind with a simple regex', function() {
				////
				////	var regex = '(a|(bc))d(e|f)';
				////
				////	console.log('Regular Expression: ' + regex);
				////
				////	console.time('compilation');
				////
				////	var traverser = compileRegexTraverser(regex);
				////
				////	console.timeEnd('compilation');
				////
				////	var inputString = 'ad';
				////
				////	console.log('Input: ' + inputString);
				////	console.log('Compiled DFA info (below):');
				////	console.log('Initial state: ' + traverser.initialState);
				////	console.log('Transitions:', traverser.transitions);
				////	console.log('Final states: ', traverser.finalStates);
				////
				////	console.time('simple-regex');
				////
				////	for (var i = 0; i < 100000; i ++) {
				////		traverser.execute(createInput(inputString));
				////	}
				////
				////	console.timeEnd('simple-regex');
				////
				////	var result = traverser.execute(createInput(inputString));
				////
				////	printResults(result);
				////});
				//
				//
				//it('can complete a string based on a regex with star-height of 1', function() {
				//	var traverser = compileRegexTraverser('(c|a|b)*ab');
				//
				//	var results = traverser.execute(createInput('abab'));
				//
				//	chai.expect(flattenResults(results)).to.deep.equal(['abab']);
				//});
				//
				it('can complete a real-life-like case with star-height of 2', function () {
					// Check for partially matching result
					var traverser = compileRegexTraverser('a((e(b|c|d)*)|(g(b|c|f)*))*h');

					var inputString = 'cbcbfcbcbecbcbfcbcbe';

					console.log(traverser);

					console.time('star-height-2-single');
					var results = traverser.execute(createInput(inputString));
					console.timeEnd('star-height-2-single');

					//console.log(restoreMergedResult(results[0]));
					console.log(results);

					console.log('Regex: a((e(b|c|d)*)|(g(b|c|f)*))*h');
					console.log('Input: ' + inputString);
					console.log(flattenResults(results));
				});

				//it('can run faster than wind with a real-life-like case with star-height of 2', function () {
				//	// Check for partially matching result
				//	var traverser = compileRegexTraverser('a((e(b|c|d)*)|(g(b|c|f)*))*h');
				//
				//	console.time('star-height-2-x-100');
				//	for (var j = 0; j < 100; ++ j) {
				//		traverser.execute(createInput('cbcbfcbcbecbcbfcbcbe'));
				//	}
				//	console.timeEnd('star-height-2-x-100');
				//
				//	//var results = traverser.execute(createInput('cbcbfcbcbecbcbfcbcbe'));
				//	//
				//	//console.log(flattenResults(results));
				//});
				//
				//it('can complete a string based on a regex with star-height of 3', function () {
				//	// Check for partially matching result
				//	var traverser = compileRegexTraverser('(a|(bc))d(e|f)(((abcde)*fghij)*((fghij)*klmno)(klmno(pqrst)*)*)*klmno');
				//
				//	var results = traverser.execute(createInput('dabcdefghijklmnopqrstpqrstpqrstfghijfghijpqrst'));
				//
				//	console.log('Regex: (a|(bc))d(e|f)(((abcde)*fghij)*((fghij)*klmno)(klmno(pqrst)*)*)*klmno');
				//	console.log(flattenResults(results));
				//	//chai.expect(flattenResults(results)).to.deep.equal(['abccdddbbccdc']);
				//});
				//
				////it('can run faster than wind with a kleene-star regular expression of height 3', function () {
				////	var kleeneTraverser = compileRegexTraverser('(a|(bc))d(e|f)(((abcde)*fghij)*((fghij)*klmno)(klmno(pqrst)*)*)*klmno');
				////
				////	console.time('star-height-3');
				////	for (var j = 0; j < 1000; ++ j) {
				////		kleeneTraverser.execute(createInput('dabcdefghijklmnopqrstpqrstpqrstfghijfghijpqrst'));
				////	}
				////	console.timeEnd('star-height-3');
				////});

			});
		});
	}
);
