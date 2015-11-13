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
			it('can detect loops in records', function () {
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
		});
	}
);
