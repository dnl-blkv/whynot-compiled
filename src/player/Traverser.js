/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[
		'./Record',
		'./util/arrayUtils'
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

			// Define an initial state
			this.initialState = biverseDFA.initialState;

			// Define the conventional transitions table
			this.transitions = biverseDFA.transitions;

			// Define the transported transitions table
			this.transportedTransitions = transportTransitions(biverseDFA.transitions);

			// Define the final states
			this.finalStates = biverseDFA.finalStates;

			// Define the input buffer
			this.inputBuffer = [];

			// Define the indicator of input completeness
			this.inputOver = false;

			// Define the final records
			this.finalRecords = [];
		}

		/**
		 * Create transported transition table out of a given transition table.
		 *
		 * @param transitions
		 * @returns {Array}
		 */
		function transportTransitions (transitions) {

			var transportedTransitions = [];

			var statesCount = transitions.length;

			for (var stateNumber = 0; stateNumber < statesCount; stateNumber ++) {
				transportedTransitions[stateNumber] = {};

				var stateTransitionKeys = Object.keys(transitions[stateNumber]);

				var stateTransitionKeysCount = stateTransitionKeys.length;

				for (var stateTransitionKeyId = 0; stateTransitionKeyId < stateTransitionKeysCount; stateTransitionKeyId ++) {
					var stateTransitionKey = stateTransitionKeys[stateTransitionKeyId];

					var transition = transitions[stateNumber][stateTransitionKey];

					var transitionString = transition + '';

					if (transportedTransitions[stateNumber][transitionString] === undefined) {
						transportedTransitions[stateNumber][transitionString] = [];
					}

					transportedTransitions[stateNumber][transitionString].push(stateTransitionKey);
				}
			}

			return transportedTransitions;
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
			return (-1 < traverser.finalStates.indexOf(state));
		}

		/**
		 * Creates an initial record.
		 *
		 * @param traverser
		 * @returns {Record}
		 */
		function createInitialRecord (traverser) {

			/*
				Initial record has null as its previous state declaring the recording beginning.
				At the same time, its target state is set to initial state. That is what we draw in graphs as '-->(0)'.
				It has an empty transition on it, since it doesn't have to consume any input.
				Finally, its accepting flag is set to 'true'. It is an important factor, as initial record
				takes part in cutting off the useless extensions when those are discovered at the very beginning of the input.
			 */
			return new Record(
				null,
				traverser.initialState,
				[''],
				true
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

			// Save the next state index in the current transported transition
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
		 * Get transported transitions for a state.
		 *
		 * @param traverser
		 * @param currentState
		 * @returns {*}
		 */
		function getStateTransportedTransitions (traverser, currentState) {
			return traverser.transportedTransitions[currentState];
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
			return traverser.transitions[currentState][inputItem];
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
		 * Check if a currently processed record is a useful alternative of some other record
		 *
		 * @param traverser				// Functional-style "this" reference
		 * @param tailRecords	// Array of currently processed tail records
		 * @param testedRecord
		 * @param testedRecordInsertionIndex
		 * @returns {boolean}
		 */
		function isAnAlternative (traverser, tailRecords, testedRecord, testedRecordInsertionIndex) {

			var finalRecords = getFinalRecords(traverser);

			var finalRecordsCount = finalRecords.length;

			var baseCandidate = null;

			var uselesslyExtends = false;

			// Check final records
			for (var finalRecordId = 0; finalRecordId < finalRecordsCount; ++ finalRecordId) {
				var currentFinalRecord = finalRecords[finalRecordId];

				baseCandidate = testedRecord.findBaseCandidate(currentFinalRecord);

				uselesslyExtends = ((baseCandidate !== null) && testedRecord.isExtensionOf(baseCandidate));

				if ((currentFinalRecord !== testedRecord) && uselesslyExtends) {
					// Is an alternative of an existing final record
					return false;
				}
			}

			for (var currentTailRecordId = 0; currentTailRecordId < testedRecordInsertionIndex; ++ currentTailRecordId) {
				var currentTailRecord = tailRecords[currentTailRecordId];

				baseCandidate = testedRecord.findBaseCandidate(currentTailRecord);

				uselesslyExtends = ((baseCandidate !== null) && testedRecord.isExtensionOf(baseCandidate));

				if ((currentTailRecord !== testedRecord) && uselesslyExtends) {
					// Is an alternative of an existing tail record
					return false;
				}
			}

			return true;
		}

		/**
		 * Check if a record is useful for the answer
		 *
		 * @param traverser
		 * @param tailRecords
		 * @param testedRecord
		 * @param testedRecordInsertionIndex
		 * @returns {boolean}
		 */
		function usefulRecord (traverser, tailRecords, testedRecord, testedRecordInsertionIndex) {

			// Check for loops
			var loopFree = !testedRecord.hasLoops();

			// Check if useful extension
			var usefulExtension = false;

			if (loopFree) {
				usefulExtension = isAnAlternative(traverser, tailRecords, testedRecord, testedRecordInsertionIndex);
			}

			return (loopFree && usefulExtension);
		}

		/**
		 * From original Whynot
		 * Find proper position to insert a new record
		 * @param currentTails
		 * @param missingCount
		 * @returns {number}
		 */
		function findInsertionIndex (currentTails, missingCount) {
			// Perform a binary search to find the index of the first thread with lower badness
			var low = 0,
				high = currentTails.length;

			while (low < high) {
				// Use zero-filling shift as integer division
				var mid = (low + high) >>> 1;
				// Compare to mid point, preferring right in case of equality
				if (missingCount < currentTails[mid].getMissingCount()) {
					// Thread goes in lower half
					high = mid;
				} else {
					// Thread goes in upper half
					low = mid + 1;
				}
			}

			return low;
		}

		function insertNewTailRecord (traverser, tailRecords, newTailRecord) {
			var insertionIndex = findInsertionIndex(tailRecords, newTailRecord.getMissingCount());

			var useful = usefulRecord(traverser, tailRecords, newTailRecord, insertionIndex);

			if (useful) {
				tailRecords.splice(insertionIndex, 0, newTailRecord);
			}
		}

		/**
		 * Executes a single tail, returns its derivatives.
		 *
		 * @param traverser
		 * @param input
		 * @param tailRecords
		 * @param tailRecordId
		 * @param nextTailRecords
		 */
		function processTailRecord (traverser, input, tailRecords, tailRecordId, nextTailRecords) {

			// Save the current record reference
			var tailRecord = tailRecords[tailRecordId];

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

				// Save transported transitions for current state
				var currentStateTransportedTransitions = getStateTransportedTransitions(traverser, currentState);

				// Save the next state as a string index
				var nextStateAsString = nextState + '';

				// If the next state exists
				if (nextState !== undefined) {

					// Add a new accept record for the accepted transition

					// Only if not finishing an extra expansion
					var simpleUselessExtension = false;

					// If currently processed record is failing
					if (!tailRecord.getAccepted()) {

						// Save last accept record for reference
						var lastAcceptRecord = tailRecord.getLastAcceptRecord();

						// If there was at least one accept record earlier
						if (lastAcceptRecord !== null) {

							// Calculate the possible shortcut state
							var shortcutState = getNextState(traverser, lastAcceptRecord.getTargetState(), nextInputItem);

							simpleUselessExtension = (shortcutState === nextState);
						}
					}

					// If the new record would finish a useful extension
					if (!simpleUselessExtension) {

						// Create a new accept record
						var newAcceptRecord = createAcceptRecord(tailRecord, nextInputItem, nextState);

						// Add the new accept record to the tail derivatives
						insertNewTailRecord(traverser, nextTailRecords, newAcceptRecord);
					}

					// Add a new missing record for a missing characters from accepted transported transition

					// Save the transported transition to which current input item belongs
					var transportedTransition = currentStateTransportedTransitions[nextStateAsString];

					// If there are other possibilities to get to a required state except for the saved one
					if (transportedTransition.length > 1) {

						// Create accepted record for transported transition except for the accepted transition
						var newPartiallyMissingRecord = createPartiallyMissingRecord(tailRecord,
							transportedTransition, nextInputItem, nextState);

						// Add the new partially accepted record to the tail derivatives
						insertNewTailRecord(traverser, nextTailRecords, newPartiallyMissingRecord);
					}

				}

				// Add the new accepted records for all the accepted transitions

				// Save transported transition keys
				var transportedTransitionsKeys = Object.keys(currentStateTransportedTransitions);

				// Save transported transitions amount
				var transportedTransitionsCount = transportedTransitionsKeys.length;

				// Iterate over transported transitions
				for (var j = 0; j < transportedTransitionsCount; j++) {

					// Save current transported transition key
					var currentTransportedTransitionKey = transportedTransitionsKeys[j];

					// If we are not dealing with a previously processed transported transition
					if (currentTransportedTransitionKey !== nextStateAsString) {

						// Save reference to the current transported transition
						var currentTransportedTransition = currentStateTransportedTransitions[currentTransportedTransitionKey];

						// Save the current transported transition state
						var currentTransportedTransitionState = parseInt(currentTransportedTransitionKey);

						// Create accepted record for transported transition
						var nextMissingRecord = createMissingRecord(tailRecord, currentTransportedTransition, currentTransportedTransitionState);

						// Add the next accepted record to the tail derivatives
						insertNewTailRecord(traverser, nextTailRecords, nextMissingRecord);
					}
				}
			}
		}

		/**
		 * Executes all the current tails and returns the new tails.
		 *
		 * @param traverser
		 * @param input
		 * @param latestTailRecords
		 * @returns {Array}
		 */
		function processLatestTailRecords (traverser, input, latestTailRecords) {

			// Create new tail records array
			var nextTailRecords = [];

			// Save the amount of tail records
			var tailRecordsCount = latestTailRecords.length;

			// Loop over the tail records
			for (var currentTailRecordId = 0; currentTailRecordId < tailRecordsCount; currentTailRecordId ++) {

				// Execute the current tail record and get its derivatives
				processTailRecord(traverser, input, latestTailRecords, currentTailRecordId, nextTailRecords);

			}

			//console.log(nextTailRecords);

			// Return result of current tails array execution
			return nextTailRecords;
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

			// Create an initial record
			var initialRecord = createInitialRecord(this);

			// Define the tail records
			var tailRecords = [initialRecord];

			// Loop over generations of tail records
			while (tailRecords.length > 0) {

				// Execute the tailRecords
				tailRecords = processLatestTailRecords(this, input, tailRecords);

			}

			// Return the final records
			return getFinalRecords(this);
		};

		return Traverser;
	}
);
