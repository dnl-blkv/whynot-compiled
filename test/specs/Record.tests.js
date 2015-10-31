define(
	[
		'whynot-premade-player/Record'
	],
	function(
		Record
	) {
		'use strict';

		function createMissingRecord (previousRecord, characters, targetState) {

			// Return the new accepted record
			return new Record (
				previousRecord,
				targetState,
				characters,
				false
			);
		}

		function createAcceptRecord (previousRecord, character, targetState) {

			// Return the new accept record
			return new Record (
				previousRecord,
				targetState,
				[character],
				true
			);
		}

		function createInitialRecord () {

			/*
			 Initial record has null as its previous state declaring the recording beginning.
			 At the same time, its target state is set to initial state. That is what we draw in graphs as '-->(0)'.
			 It has an empty transition on it, since it doesn't have to consume any input.
			 Finally, its accepting flag is set to 'true'. It is an important factor, as initial record
			 takes part in cutting off the useless extensions when those are discovered at the very beginning of the input.
			 */
			return new Record(
				null,
				0,
				[''],
				true
			);
		}

		describe('Records', function() {
			it('can properly detect loops in records', function () {
				var loopingRecord = createInitialRecord();

				loopingRecord = createMissingRecord(loopingRecord, ['a'], 1);
				loopingRecord = createMissingRecord(loopingRecord, ['b'], 2);
				loopingRecord = createMissingRecord(loopingRecord, ['c'], 3);
				loopingRecord = createMissingRecord(loopingRecord, ['d'], 1);

				chai.expect(loopingRecord.hasLoops()).to.equal(true);

				var nonLoopingRecord = createInitialRecord();

				nonLoopingRecord = createMissingRecord(nonLoopingRecord, ['a'], 1);
				nonLoopingRecord = createMissingRecord(nonLoopingRecord, ['b'], 2);
				nonLoopingRecord = createAcceptRecord(nonLoopingRecord, 'e', 3);
				nonLoopingRecord = createMissingRecord(nonLoopingRecord, ['d'], 1);

				chai.expect(nonLoopingRecord.hasLoops()).to.equal(false);

			});

			function restoreMergedResult (result) {
				var flatResults = [[]];

				var branchId = 0;

				var branches = [result];

				var currentBranch = branches[0];

				var currentFlatResult = flatResults[0];

				while (branchId < branches.length) {
					currentBranch = branches[branchId];

					currentFlatResult = flatResults[branchId];

					while (currentBranch.getPreviousRecord() !== null) {

						var alternativeRecords = currentBranch.getAlternativeRecords();

						var alternativeRecordsCount = alternativeRecords.length;

						for (var alternativeId = 0; alternativeId < alternativeRecordsCount; ++ alternativeId) {
							var currentAlternative = alternativeRecords[alternativeId];
							flatResults.push(currentFlatResult.slice());
							branches.push(currentAlternative);
						}

						currentFlatResult.push(currentBranch.getCharacters());

						currentBranch = currentBranch.getPreviousRecord();
					}

					++ branchId;
				}

				return flatResults;
			}

			it('can restore merged record chains', function () {
				var initialRecord = createInitialRecord();

				// Create the main branch
				var mainBranch = createMissingRecord(initialRecord, ['a'], 1);
				mainBranch = createAcceptRecord(mainBranch, 'e', 2);
				mainBranch = createMissingRecord(mainBranch, ['c'], 3);

				// Create branch 1
				var branch1 = createMissingRecord(initialRecord, ['d'], 5);
				branch1 = createAcceptRecord(branch1, 'e', 6);
				branch1 = createMissingRecord(branch1, ['f'], 3);

				// Push Branch 1
				mainBranch.addAlternativeRecord(branch1);
				mainBranch = createAcceptRecord(mainBranch, 'm', 4);

				var branch2 = createAcceptRecord(initialRecord, 'e', 7);
				branch2 = createMissingRecord(branch2, ['p'], 8);
				branch2 = createAcceptRecord(branch2, 'm', 9);
				branch2 = createMissingRecord(branch2, ['e'], 4);
				mainBranch.addAlternativeRecord(branch2);

				mainBranch = createAcceptRecord(mainBranch, 'x', 10);

				// Check
			});
		});
	}
);
