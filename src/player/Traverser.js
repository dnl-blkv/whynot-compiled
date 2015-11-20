/**
 * Created by danek_000 on 30.8.2015.
 *
 *   .::::::::..          ..::::::::.
 * 	:::::::::::::        :::::::::::::
 * :::::::::::' .\      /. `:::::::::::
 * `::::::::::_,__o    o__,_::::::::::'
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
		 * Save record as final.
		 *
		 * @param traverser
		 * @param record
		 */
		function saveFinalRecord (traverser, record) {
			traverser.finalRecords.push(record);
		}

		/**
		 * From original Whynot
		 * Find proper position to insert a new record
		 *
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

		/**
		 * Insert a newly generated tail record to the latest tail records level
		 *
		 * @param tailRecords
		 * @param newTailRecord
		 */
		function insertNewTailRecord (tailRecords, newTailRecord) {

			var insertionIndex = findInsertionIndex(tailRecords, newTailRecord.getMissingCount());

			tailRecords.splice(insertionIndex, 0, newTailRecord);
		}

		function insertNewRecord (records, recordsIndex, newRecord) {

			var isAlternative = true;

			var recordsIndexLine = recordsIndex[newRecord.getTargetState()];

			for (var currentRecordId = 0; currentRecordId < recordsIndexLine.length; ++ currentRecordId) {
				var currentRecord = recordsIndexLine[currentRecordId];

				if (newRecord.isExtensionOf(currentRecord)) {
					// Is an extension of an existing tail record
					isAlternative = false;

					break;
				}
			}

			if ((isAlternative) && (!newRecord.hasLoops())) {
				records.push(newRecord);
				recordsIndexLine.push(newRecord);
			}
		}

		/**
		 * Executes all the current tails and returns the new tails.
		 *
		 * @param traverser
		 * @param inputItem
		 * @param tailRecords
		 * @returns {Array}
		 */
		function processTailRecords (traverser, inputItem, tailRecords) {

			// Create new tail records array
			var nextTailRecords = [];

			// Create the array for this generation's records
			var records = tailRecords.slice();

			// Create the records index
			var recordsIndex = [];

			for (var currentRecordsIndexLine = 0; currentRecordsIndexLine < traverser.transitions.length; ++ currentRecordsIndexLine) {
				recordsIndex[currentRecordsIndexLine] = [];
			}

			for (var currentTailRecordId = 0; currentTailRecordId < tailRecords.length; ++ currentTailRecordId) {

				var currentTailRecord = tailRecords[currentTailRecordId];

				recordsIndex[currentTailRecord.getTargetState()].push(currentTailRecord);
			}

			// Create the counter to iterate the missing tails array
			var currentRecordId = 0;

			do {
				// Save the current record reference
				var currentRecord = records[currentRecordId];

				// If a record is accepted and the input item is null, then the record is final if it ends up in a final state
				if ((inputItem === null) && isStateFinal(traverser, currentRecord.getTargetState())) {
					saveFinalRecord(traverser, currentRecord);

				} else {

					// Save the current state number
					var currentState = currentRecord.getTargetState();

					// Get the next state for the record
					var nextState = getNextState(traverser, currentState, inputItem);

					// Save transported transitions for current state
					var currentStateTransportedTransitions = getStateTransportedTransitions(traverser, currentState);

					// Save the next state as a string index
					var nextStateAsString = nextState + '';

					// If the next state exists
					if (nextState !== undefined) {
						// Add a new accept record for the accepted transition

						// Create a new accept record
						var newAcceptRecord = createAcceptRecord(currentRecord, inputItem, nextState);

						// Add the new accept record to the tail derivatives
						insertNewTailRecord(nextTailRecords, newAcceptRecord);

						// Add a new missing record for a missing characters from accepted transported transition

						// Save the transported transition to which current input item belongs
						var transportedTransitions = currentStateTransportedTransitions[nextStateAsString];

						// If there are other possibilities to get to a required state except for the saved one
						if (transportedTransitions.length > 1) {

							// Create accepted record for transported transition except for the accepted transition
							var newPartiallyMissingRecord = createPartiallyMissingRecord(currentRecord,
								transportedTransitions, inputItem, nextState);

							// Add the new partially accepted record to the missing records array, only check for loops
							insertNewRecord(records, recordsIndex, newPartiallyMissingRecord);
						}
					}

					// Add the new missing records for all the other missing transitions

					// Save transported transition keys
					var transportedTransitionsKeys = Object.keys(currentStateTransportedTransitions);

					// Save transported transitions amount
					var transportedTransitionsCount = transportedTransitionsKeys.length;

					// Iterate over transported transitions
					for (var transportedTransitionId = 0; transportedTransitionId < transportedTransitionsCount; ++transportedTransitionId) {

						// Save current transported transition key
						var currentTransportedTransitionKey = transportedTransitionsKeys[transportedTransitionId];

						// If we are not dealing with a previously processed transported transition
						if (currentTransportedTransitionKey !== nextStateAsString) {

							// Save reference to the current transported transition
							var currentTransportedTransition = currentStateTransportedTransitions[currentTransportedTransitionKey];

							// Save the current transported transition state
							var currentTransportedTransitionState = parseInt(currentTransportedTransitionKey);

							// Create accepted record for transported transition
							var nextMissingRecord = createMissingRecord(currentRecord, currentTransportedTransition, currentTransportedTransitionState);

							// Add the new partially accepted record to the missing records array, only check for loops
							insertNewRecord(records, recordsIndex, nextMissingRecord);
						}
					}
				}

				++ currentRecordId;

				currentRecord = records[currentRecordId];

			} while (currentRecordId < records.length);


			// Return result of current tails array execution
			return nextTailRecords;
		}

		/**
		 * Execute the traverser to get all the possible unique minimal input completions without loop repetitions.
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

			// Loop over all the possible strings accepted by the language
			do {

				var inputItem = input();

				// Execute the tailRecords
				tailRecords = processTailRecords(this, inputItem, tailRecords);

			} while ((inputItem !== null) && (tailRecords.length > 0));

			// Return the final records
			return getFinalRecords(this);
		};

		return Traverser;
	}
);
