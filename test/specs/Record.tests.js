define(
	[
		'whynot-premade-player/Record'
	],
	function(
		Record
	) {
		'use strict';

		function createMissingRecord (previousRecords, characters, targetState) {

			// Return the new accepted record
			return new Record (
				previousRecords,
				targetState,
				characters,
				false
			);
		}

		function createAcceptRecord (previousRecords, character, targetState) {

			// Return the new accept record
			return new Record (
				previousRecords,
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
				[],
				0,
				[''],
				true
			);
		}

		describe('Records', function() {
			it('can detect loops in records without alternatives', function () {
				var initialRecord = createInitialRecord();

				var loopingBranch = createMissingRecord([initialRecord], ['a'], 1);
				loopingBranch = createMissingRecord([loopingBranch], ['b'], 2);
				loopingBranch = createMissingRecord([loopingBranch], ['c'], 3);
				loopingBranch = createMissingRecord([loopingBranch], ['d'], 1);

				chai.expect(loopingBranch.hasLoops()).to.equal(true);

				var nonLoopingBranch = createMissingRecord([initialRecord], ['a'], 1);
				nonLoopingBranch = createMissingRecord([nonLoopingBranch], ['b'], 2);
				nonLoopingBranch = createAcceptRecord([nonLoopingBranch], 'e', 3);
				nonLoopingBranch = createMissingRecord([nonLoopingBranch], ['d'], 1);

				chai.expect(nonLoopingBranch.hasLoops()).to.equal(false);
			});

			it('can detect loops in records with alternatives', function () {
				var initialRecord = createInitialRecord();

				var leftBranch = createAcceptRecord([initialRecord], 'a', 1);
				leftBranch = createMissingRecord([leftBranch], ['b'], 2);
				leftBranch = createMissingRecord([leftBranch], ['c'], 3);

				var rightBranch = createMissingRecord([initialRecord], ['b'], 6);
				rightBranch = createAcceptRecord([rightBranch], 'a', 7);
				rightBranch = createMissingRecord([rightBranch], ['g'], 3);

				var mainBranch = createMissingRecord([leftBranch, rightBranch], ['e'], 4);

				var loopingBranch = createMissingRecord([mainBranch], ['f'], 7);

				mainBranch = createMissingRecord([mainBranch], ['x'], 5);

				chai.expect(mainBranch.hasLoops()).to.equal(false);
				chai.expect(loopingBranch.hasLoops()).to.equal(true);
			});

			it('can find base candidates in alternatives', function () {
				var initialRecord = createInitialRecord();

				// Create the main branch
				var mainBranch = createMissingRecord([initialRecord], ['a'], 1);

				// Create the short side branch
				var shortSideBranch = createMissingRecord([mainBranch], ['b'], 2);
				shortSideBranch = createAcceptRecord([shortSideBranch], 'd', 5);

				// Create the long side branch
				var longSideBranch = createMissingRecord([mainBranch], ['e'], 4);
				longSideBranch = createAcceptRecord([longSideBranch], 'd', 6);
				longSideBranch = createMissingRecord([longSideBranch], ['c'], 3);

				// Continue the main branch
				mainBranch = createAcceptRecord([mainBranch], 'd', 3);

				var expectedLongSideBranchBase = mainBranch;

				// Continue the main branch
				mainBranch = createMissingRecord([mainBranch], ['b'], 5);

				// Finish the main branch and merge the side branch into it
				mainBranch = createMissingRecord([mainBranch, shortSideBranch], 'f', 7);

				// Check
				chai.expect(longSideBranch.findBaseCandidate(mainBranch)).to.deep.equal(expectedLongSideBranchBase);
			});

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

			it('can restore merged record chains', function () {
				var initialRecord = createInitialRecord();

				// Create the main branch
				var mainBranch = createMissingRecord([initialRecord], ['a'], 1);
				mainBranch = createAcceptRecord([mainBranch], 'e', 2);
				mainBranch = createMissingRecord([mainBranch], ['c'], 3);

				// Create branch 1
				var branch1 = createMissingRecord([initialRecord], ['d'], 5);
				branch1 = createAcceptRecord([branch1], 'e', 6);
				branch1 = createMissingRecord([branch1], ['f'], 3);

				// Continue main branch
				mainBranch = createAcceptRecord([mainBranch, branch1], 'm', 4);

				// Create branch 2
				var branch2 = createAcceptRecord([initialRecord], 'e', 7);
				branch2 = createMissingRecord([branch2], ['p'], 8);
				branch2 = createAcceptRecord([branch2], 'm', 9);
				branch2 = createMissingRecord([branch2], ['e'], 4);

				// Continue main branch
				mainBranch = createAcceptRecord([mainBranch, branch2], 'x', 10);

				// Check
				console.log('restoredMergedChain: ', restoreMergedResult((mainBranch)));
			});

			it('can find extensions and alternatives in records with alternatives', function () {
				var initialRecord = createInitialRecord();

				var leftSubBranch1 = createAcceptRecord([initialRecord], 'a', 1);
				leftSubBranch1 = createMissingRecord([leftSubBranch1], ['b'], 5);

				var leftSubBranch2 = createMissingRecord([initialRecord], ['b'], 2);
				leftSubBranch2 = createAcceptRecord([leftSubBranch2], 'a', 5);

				var leftBranch = createMissingRecord([leftSubBranch1, leftSubBranch2], ['c'], 8);

				var rightSubBranch1 = createMissingRecord([initialRecord], ['d'], 3);
				rightSubBranch1 = createAcceptRecord([rightSubBranch1], 'a', 6);
				rightSubBranch1 = createMissingRecord([rightSubBranch1], ['f'], 9);

				var rightSubBranch2 = createMissingRecord([initialRecord], ['e'], 4);
				rightSubBranch2 = createMissingRecord([rightSubBranch2], ['b'], 7);
				rightSubBranch2 = createAcceptRecord([rightSubBranch2], 'a', 10);
				rightSubBranch2 = createMissingRecord([rightSubBranch2], ['c'], 9);

				var rightBranch = createMissingRecord([rightSubBranch1, rightSubBranch2], ['g'], 12);
				rightBranch = createMissingRecord([rightBranch], ['h'], 8);

				//var mainBranch = createMissingRecord([leftBranch, rightBranch], ['t'], 11);

				// Check if the right branch extends the left branch
				console.log('this:', rightBranch.isExtensionOf(leftBranch));
			});
		});
	}
);