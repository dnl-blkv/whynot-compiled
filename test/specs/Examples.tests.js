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

			//
			describe('regular expressions', function() {
				it('can perform simple matching', function() {
					var simpleMinimalDFA = Automaton.regExpToSimpleMinimalDFA('abc(d|e)f');
					var biverseDFA = new BiverseDFA(simpleMinimalDFA.transitions, simpleMinimalDFA.finalStates);
					var traverser = new Traverser(biverseDFA);

					// Check for fully matching result
					var fullMatchResult = traverser.execute(createInput('abcdf'));
					chai.expect(fullMatchResult.length).to.equal(1);
					chai.expect(fullMatchResult[0].getAcceptedCount()).to.equal(5);
					chai.expect(fullMatchResult[0].getMissingCount()).to.equal(0);

					// Check for partially matching result
					var partialMatchResult = traverser.execute(createInput('abcf'));
					chai.expect(partialMatchResult.length).to.equal(1);
					chai.expect(partialMatchResult[0].getAcceptedCount()).to.equal(4);
					chai.expect(partialMatchResult[0].getMissingCount()).to.equal(1);

					var missingRecord = partialMatchResult[0].getPreviousRecord();
					chai.expect(missingRecord.getAccepted()).to.equal(false);
					chai.expect(missingRecord.getCharacters()).to.deep.equal(['d', 'e']);

					// Check for entriely mismatching result
					var mismatchingResult = traverser.execute(createInput('abcdfg'));
					chai.expect(mismatchingResult.length).to.equal(0);
				});

			});
		});
	}
);
