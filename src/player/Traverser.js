/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[
		'./Record'
	],
	function(
		Record
	) {
		'use strict';

		/**
		 * Describes a traverser to execute a DFA suggesting input expansion if required.
		 *
		 * @param biverseDFA
		 * @constructor
		 */
		function Traverser (biverseDFA) {

			// Define an automaton to execute
			this.biverseDFA = biverseDFA;

			// Define the input buffer
			this.inputBuffer = [];

			// Define the indicator of input completeness
			this.inputOver = false;

			// Define the final records
			this.finalRecords = [];

			// Create an initial record
			var initialRecord = createInitialRecord(this);

			// Define the tail records
			this.tailRecords = [initialRecord];
		}

		/**
		 * Get and buffer the next input item
		 *
		 * @param traverser
		 * @param input
		 */
		function saveNextInputItem (traverser, input) {

			// If input is not yet over
			if (!isInputOver(traverser)) {

				// Get the first input item
				var inputItem = input();

				// If next input exists
				if (inputItem !== null) {

					// Save input item to the buffer
					traverser.inputBuffer.push(inputItem);
				} else {

					// State that input is over
					traverser.inputOver = true;
				}
			}
		}

		/**
		 * Checks whether or not the input is over.
		 *
		 * @param traverser
		 * @returns {boolean|*}
		 */
		function isInputOver (traverser) {
			return traverser.inputOver;
		}

		/**
		 * Get an input item by its order in the buffer.
		 *
		 * @param traverser
		 * @param id
		 * @returns {*}
		 */
		function getInputItemById (traverser, id) {
			return traverser.inputBuffer[id];
		}

		/**
		 * Returns current size of the input buffer.
		 *
		 * @param traverser
		 * @returns {Number}
		 */
		function getInputBufferSize (traverser) {
			return traverser.inputBuffer.length;
		}

		/**
		 * Reset the input buffer.
		 *
		 * @param traverser
		 */
		function resetInputBuffer (traverser) {
			// Reset the input buffer
			traverser.inputBuffer = [];

			// Reset the input over indicator
			traverser.inputOver = false;
		}

		/**
		 * Reset the final records
		 *
		 * @param traverser
		 */
		function resetFinalRecords (traverser) {
			traverser.finalRecords = [];
		}

		/**
		 * Get the list of final records.
		 *
		 * @param traverser
		 */
		function getFinalRecords (traverser) {
			return traverser.finalRecords;
		}

		/**
		 * Reset tail records to re-run the traverser.
		 *
		 * @param traverser
		 */
		function resetTailRecords (traverser) {

			// Create an initial record
			var initialRecord = createInitialRecord(traverser);

			// Update tail records
			updateTailRecords(traverser, [initialRecord]);
		}

		/**
		 * Replace old tail records with new tail records.
		 *
		 * @param traverser
		 * @param newTailRecords
		 */
		function updateTailRecords (traverser, newTailRecords) {
			traverser.tailRecords = newTailRecords;
		}

		/**
		 * Get the tail records array.
		 *
		 * @param traverser
		 * @returns {Array|*}
		 */
		function getTailRecords (traverser) {
			return traverser.tailRecords;
		}

		/**
		 * Get the current amount of tail records.
		 *
		 * @param traverser
		 * @returns {Number}
		 */
		function getTailRecordsCount (traverser) {
			return traverser.tailRecords.length;
		}

		/**
		 * Reset the traverser.
		 *
		 * @param traverser
		 */
		function reset (traverser) {

			// Reset the input buffer
			resetInputBuffer(traverser);

			// Reset the final records
			resetFinalRecords(traverser);

			// Reset the tail records
			resetTailRecords(traverser);
		}

		/**
		 * Check whether a given state is final.
		 *
		 * @param traverser
		 * @param state
		 * @returns {boolean}
		 */
		function isStateFinal (traverser, state) {
			return  traverser.biverseDFA.isStateFinal(state);
		}

		/**
		 * Creates an initial record.
		 *
		 * @param traverser
		 * @returns {Record}
		 */
		function createInitialRecord (traverser) {

			var biverseDFA = traverser.biverseDFA;

			// Return a new initial record
			return new Record(
				null,
				biverseDFA.getInitialState(),
				[''],
				false
			);
		}

		/**
		 * Create and return a new accept record.
		 *
		 * @param previousRecord
		 * @param character
		 * @param targetState
		 * @returns {Record}
		 */
		function createAcceptRecord (previousRecord, character, targetState) {

			// Return the new accept record
			return new Record (
				previousRecord,
				targetState,
				[character],
				true
			);
		}

		/**
		 * Create and return a new accepted record.
		 *
		 * @param previousRecord
		 * @param characters
		 * @param targetState
		 * @returns {Record}
		 */
		function createMissingRecord (previousRecord, characters, targetState) {

			// Return the new accepted record
			return new Record (
				previousRecord,
				targetState,
				characters,
				false
			);

		}

		/**
		 * Create a partially accepted record.
		 *
		 * @param previousRecord
		 * @param characters
		 * @param excludedCharacter
		 * @param targetState
		 * @returns {Record}
		 */
		function createPartiallyMissingRecord (previousRecord, characters, excludedCharacter, targetState) {

			// Save the next state index in the current reverse transition
			var excludedCharacterIndex = characters.indexOf(excludedCharacter);

			// Create array of accepted characters
			var partialCharacters = characters.slice();

			// Cut off the accepted character
			partialCharacters.splice(excludedCharacterIndex, 1);

			// Return the new accepted record
			return createMissingRecord(
				previousRecord,
				partialCharacters,
				targetState
			);

		}

		/**
		 * Get reverse transitions for a state.
		 *
		 * @param traverser
		 * @param currentState
		 * @returns {*}
		 */
		function getStateReverseTransitions (traverser, currentState) {
			return traverser.biverseDFA.getStateReverseTransitions(currentState);
		}

		/**
		 * Get a next input item taking a given record's accepted characters history.
		 *
		 * @param traverser
		 * @param input
		 * @param record
		 * @returns {*}
		 */
		function getNextInputItemForRecord (traverser, input, record) {

			// Get the current input buffer length of the traverser
			var inputBufferLength = getInputBufferSize(traverser);

			// Get the amount of characters accepted till the current record
			var acceptedRecordsCount = record.getAcceptedCount();

			// If the buffer length is less than or equal to the current tail record accepted count
			if (inputBufferLength <= acceptedRecordsCount) {

				// Grab more input
				saveNextInputItem(traverser, input);
			}

			// Get the proper input item
			return getInputItemById(traverser, acceptedRecordsCount);
		}

		/**
		 * Get the next state for a given state and input.
		 *
		 * @param traverser
		 * @param currentState
		 * @param inputItem
		 * @returns {*}
		 */
		function getNextState (traverser, currentState, inputItem) {
			return traverser.biverseDFA.getNextState(currentState, inputItem);
		}

		/**
		 * Check whether or not a record is final.
		 *
		 * @param traverser
		 * @param input
		 * @param record
		 * @returns {boolean|*}
		 */
		function isRecordFinal (traverser, input, record) {

			// Indicator of record finality
			var recordFinal = false;

			// Is record's target state final?
			var targetStateFinal = isStateFinal(traverser, record.targetState);

			// Save record's accepted count
			var recordAcceptedCount = record.getAcceptedCount();

			// Save the input size
			var inputBufferSize = getInputBufferSize(traverser);

			// If the record's target state is final and all the input has been accepted by it
			if (targetStateFinal && (recordAcceptedCount === inputBufferSize)) {

				// Try getting more input
				saveNextInputItem(traverser, input);

				// If the preceding attempt confirms the input being over
				if (isInputOver(traverser)) {

					// Record is final
					recordFinal = true;
				}
			}

			// Return whether or not a record is final
			return recordFinal;
		}

		/**
		 * Save record as final.
		 *
		 * @param traverser
		 * @param record
		 */
		function saveFinalRecord (traverser, record) {
			traverser.finalRecords.push(record);
		}

		/**
		 * Executes a single tail, returns its derivatives.
		 *
		 * @param traverser
		 * @param input
		 * @param tailRecord
		 */
		function processTailRecord (traverser, input, tailRecord) {

			// Create new tail records array
			var tailDerivatives = [];

			// Check for loops
			var loopFree = !tailRecord.hasLoops(0);

			// If no loops detected in the record
			if (loopFree) {

				// If the record appears final
				if (isRecordFinal(traverser, input, tailRecord)) {

					// Save it as final
					saveFinalRecord(traverser, tailRecord);
				} else {

					// Save the current state number
					var currentState = tailRecord.getTargetState();

					// Get the next input item for the current record
					var nextInputItem = getNextInputItemForRecord(traverser, input, tailRecord);

					// Get the next state for the record
					var nextState = getNextState(traverser, currentState, nextInputItem);

					// Save reverse transitions for current state
					var currentStateReverseTransitions = getStateReverseTransitions(traverser, currentState);

					// Save the next state as a string index
					var nextStateAsString = nextState + '';

					// If the next state exists
					if (nextState !== undefined) {

						// Add a new accept record for the accepted transition

						// Create a new accept record
						var newAcceptRecord = createAcceptRecord(tailRecord, nextInputItem, nextState);

						// Add the new accept record to the tail derivatives
						tailDerivatives.push(newAcceptRecord);

						// Add a new missing record for a missing characters from accepted reverse transition

						// Save the reverse transition to which current input item belongs
						var reverseTransition = currentStateReverseTransitions[nextStateAsString];

						// If there are other possibilities to get to a required state except for the saved one
						if (reverseTransition.length > 1) {

							// Create accepted record for reverse transition except for the accepted transition
							var newPartiallyMissingRecord = createPartiallyMissingRecord(tailRecord,
								reverseTransition, nextInputItem, nextState);

							// Add the new partially accepted record to the tail derivatives
							tailDerivatives.push(newPartiallyMissingRecord);
						}

					}

					// Add the new accepted records for all the accepted transitions

					// Save reverse transition keys
					var reverseTransitionsKeys = Object.keys(currentStateReverseTransitions);

					// Save reverse transitions amount
					var reverseTransitionsCount = reverseTransitionsKeys.length;

					// Iterate over reverse transitions
					for (var j = 0; j < reverseTransitionsCount; j++) {

						// Save current reverse transition key
						var currentReverseTransitionKey = reverseTransitionsKeys[j];

						// If we are not dealing with a previously processed reverse transition
						if (currentReverseTransitionKey !== nextStateAsString) {

							// Save reference to the current reverse transition
							var currentReverseTransition = currentStateReverseTransitions[currentReverseTransitionKey];

							// Save the current reverse transition state
							var currentReverseTransitionState = parseInt(currentReverseTransitionKey);

							// Create accepted record for reverse transition
							var nextMissingRecord = createMissingRecord(tailRecord, currentReverseTransition, currentReverseTransitionState);

							// Add the next accepted record to the tail derivatives
							tailDerivatives.push(nextMissingRecord);
						}
					}
				}
			}

			return tailDerivatives;
		}

		/**
		 * Executes all the current tails and returns the new tails.
		 *
		 * @param traverser
		 * @param input
		 * @returns {Array}
		 */
		function processLatestTailRecords (traverser, input) {

			// Create new tail records array
			var newTailRecords = [];

			// Create reference to tail records
			var tailRecords = getTailRecords(traverser);

			// Save the amount of tail records
			var tailRecordsCount = getTailRecordsCount(traverser);

			// Loop over the tail records
			for (var currentTailRecordId = 0; currentTailRecordId < tailRecordsCount; currentTailRecordId ++) {

				// Save the current record reference
				var currentTailRecord = tailRecords[currentTailRecordId];

				// Execute the current tail record and get its derivatives
				var currentTailDerivatives = processTailRecord(traverser, input, currentTailRecord);

				// Add current tail derivatives to the new tail records array
				newTailRecords = newTailRecords.concat(currentTailDerivatives);
			}

			// Return result of current tails array execution
			return newTailRecords;
		}

		/**
		 * Execute the traverser to get all the possible additions without loop repetitions.
		 *
		 * @param input
		 * @returns {Array}
		 */
		Traverser.prototype.execute = function (input) {

			// Reset the traverser to initial state
			reset(this);

			// Loop over generations of tail records
			while (getTailRecordsCount(this) > 0) {

				// Execute the tailRecords
				var newTailRecords = processLatestTailRecords(this, input);

				// Update the tail records array
				updateTailRecords(this, newTailRecords);
			}

			// Return the final records
			return getFinalRecords(this);
		};

		return Traverser;
	}
);
