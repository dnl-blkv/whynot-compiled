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

			function processResults (results) {

				var resultsCount = results.length;

				var processedResults = [];

				for (var resultId = 0; resultId < resultsCount; ++ resultId) {

					var currentRecord = results[resultId];

					var currentResult = [];

					while (currentRecord !== null) {

						if (currentRecord.getPreviousRecord() === null) {
							break;
						}

						currentResult.unshift(currentRecord.getCharacters());

						currentRecord = currentRecord.getPreviousRecord();
					}

					processedResults.push(currentResult);
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
					var biverseDFA = Automaton.regExpToBiverseDFA('abc(d|e)f');
					var traverser = new Traverser(biverseDFA);

					// Check for fully matching result
					var fullMatchResult = traverser.execute(createInput('abcdf'));
					chai.expect(fullMatchResult.length).to.equal(1);
					chai.expect(fullMatchResult[0].getAcceptedCount()).to.equal(5);
					chai.expect(fullMatchResult[0].getMissingCount()).to.equal(0);
				});

				it('can complete a string based on a regex', function () {
					// Check for partially matching result
					var biverseDFA = Automaton.regExpToBiverseDFA('(a|(bc))d(e|f)');
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
