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
		 * Describes an automaton representing a regular rule.
		 *
		 * @param initialState
		 * @param transitions
		 * @param reverseTransitions
		 * @param finalStates
		 * @constructor
		 */
		function Automaton (initialState, transitions, reverseTransitions, finalStates) {

			// Define initial state variable
			this.initialState = initialState;

			if (this.initialState === undefined) {
				console.log("initialState was not set for an Automaton!");
				this.initialState = 0;
			}

			// Define transitions table
			this.transitions = transitions;

			if (this.transitions === undefined) {
				console.log("transitions were not set for an Automaton!");
				this.transitions = [];
			}

			// Define reverse transitions table
			this.reverseTransitions = reverseTransitions;

			if (this.reverseTransitions === undefined) {
				console.log("reverse transitions were not set for an Automaton!");
				this.reverseTransitions = [];
			}

			// Define final states array
			this.finalStates = finalStates;

			if (this.finalStates === undefined) {
				console.log("finalStates were not set for an Automaton!");
				this.finalStates = [];
			}

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
		 * @param automaton
		 * @param input
		 */
		function saveNextInputItem (automaton, input) {

			// If input is not yet over
			if (!isInputOver(automaton)) {

				// Get the first input item
				var inputItem = input();

				// If next input exists
				if (inputItem !== null) {

					// Save input item to the buffer
					automaton.inputBuffer.push(inputItem);
				} else {

					// State that input is over
					automaton.inputOver = true;
				}
			}
		}

		/**
		 * Checks whether or not the input is over.
		 *
		 * @param automaton
		 * @returns {boolean|*}
		 */
		function isInputOver (automaton) {
			return automaton.inputOver;
		}

		/**
		 * Get an input item by its order in the buffer.
		 *
		 * @param automaton
		 * @param id
		 * @returns {*}
		 */
		function getInputItemById (automaton, id) {
			return automaton.inputBuffer[id];
		}

		/**
		 * Returns current size of the input buffer.
		 *
		 * @param automaton
		 * @returns {Number}
		 */
		function getInputBufferSize (automaton) {
			return automaton.inputBuffer.length;
		}

		/**
		 * Reset the input buffer.
		 *
		 * @param automaton
		 */
		function resetInputBuffer (automaton) {
			automaton.inputBuffer = [];
		}

		/**
		 * Reset the final records
		 *
		 * @param automaton
		 */
		function resetFinalRecords (automaton) {
			automaton.finalRecords = [];
		}

		/**
		 * Get the list of final records.
		 *
		 * @param automaton
		 */
		function getFinalRecords (automaton) {
			return automaton.finalRecords;
		}

		/**
		 * Reset tail records to re-run the automaton.
		 *
		 * @param automaton
		 */
		function resetTailRecords (automaton) {

			// Create an initial record
			var initialRecord = createInitialRecord(automaton);

			// Update tail records
			updateTailRecords(automaton, [initialRecord]);
		}

		/**
		 * Replace old tail records with new tail records.
		 *
		 * @param automaton
		 * @param newTailRecords
		 */
		function updateTailRecords (automaton, newTailRecords) {
			automaton.tailRecords = newTailRecords;
		}

		/**
		 * Get the tail records array.
		 *
		 * @param automaton
		 * @returns {Array|*}
		 */
		function getTailRecords (automaton) {
			return automaton.tailRecords;
		}

		/**
		 * Get the current amount of tail records.
		 *
		 * @param automaton
		 * @returns {Number}
		 */
		function getTailRecordsCount (automaton) {
			return automaton.tailRecords.length;
		}

		/**
		 * Reset the automaton.
		 *
		 * @param automaton
		 */
		function reset (automaton) {

			// Reset the input buffer
			resetInputBuffer(automaton);

			// Reset the final records
			resetFinalRecords(automaton);

			// Reset the tail records
			resetTailRecords(automaton);
		}

		/**
		 * Check whether a given state is final.
		 *
		 * @param automaton
		 * @param state
		 * @returns {boolean}
		 */
		function isStateFinal (automaton, state) {
			return  (-1 < automaton.finalStates.indexOf(state));
		}

		/**
		 * Creates an initial record.
		 *
		 * @param automaton
		 * @returns {Record}
		 */
		function createInitialRecord (automaton) {

			// Return a new initial record
			return new Record(
				null,
				automaton.initialState,
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
		 * Get transitions for a state.
		 *
		 * @param currentState
		 * @returns {*}
		 */
		Automaton.prototype.getStateTransitions = function (currentState) {
			return this.transitions[currentState];
		};

		/**
		 * Get reverse transitions for a state.
		 *
		 * @param currentState
		 * @returns {*}
		 */
		Automaton.prototype.getStateReverseTransitions = function (currentState) {
			return this.reverseTransitions[currentState];
		};

		/**
		 * Get a next input item taking a given record's accepted characters history.
		 *
		 * @param automaton
		 * @param input
		 * @param record
		 * @returns {*}
		 */
		function getNextInputItemForRecord (automaton, input, record) {

			// Get the current input buffer length of the automaton
			var inputBufferLength = getInputBufferSize(automaton);

			// Get the amount of characters accepted till the current record
			var acceptedRecordsCount = record.getAcceptedCount();

			// If the buffer length is less than or equal to the current tail record accepted count
			if (inputBufferLength <= acceptedRecordsCount) {

				// Grab more input
				saveNextInputItem(automaton, input);
			}

			// Get the proper input item
			return getInputItemById(automaton, acceptedRecordsCount);
		}

		/**
		 * Get the next state for a given state and input.
		 *
		 * @param automaton
		 * @param currentState
		 * @param inputItem
		 * @returns {*}
		 */
		function getNextState (automaton, currentState, inputItem) {

			// Get transitions info array for the current state
			var currentStateTransitions = automaton.getStateTransitions(currentState);

			// Return the next state
			return currentStateTransitions[inputItem];
		}

		/**
		 * Check whether or not a record is final.
		 *
		 * @param automaton
		 * @param input
		 * @param record
		 * @returns {boolean|*}
		 */
		function isRecordFinal (automaton, input, record) {

			// Indicator of record finality
			var recordFinal = false;

			// Is record's target state final?
			var targetStateFinal = isStateFinal(automaton, record.targetState);

			// Save record's accepted count
			var recordAcceptedCount = record.getAcceptedCount();

			// Save the input size
			var inputBufferSize = getInputBufferSize(automaton);

			// If the record's target state is final and all the input has been accepted by it
			if (targetStateFinal && (recordAcceptedCount === inputBufferSize)) {

				// Try getting more input
				saveNextInputItem(automaton, input);

				// If the preceding attempt confirms the input being over
				if (isInputOver(automaton)) {

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
		 * @param automaton
		 * @param record
		 */
		function saveFinalRecord (automaton, record) {
			automaton.finalRecords.push(record);
		}

		/**
		 * Executes a single tail, returns its derivatives.
		 *
		 * @param automaton
		 * @param input
		 * @param tailRecord
		 */
		function processTailRecord (automaton, input, tailRecord) {

			// Create new tail records array
			var tailDerivatives = [];

			// Check for loops
			var loopFree = !tailRecord.hasLoops(automaton.initialState);

			// If no loops detected in the record
			if (loopFree) {

				// If the record appears final
				if (isRecordFinal(automaton, input, tailRecord)) {

					// Save it as final
					saveFinalRecord(automaton, tailRecord);
				} else {

					// Save the current state number
					var currentState = tailRecord.getTargetState();

					// Get the next input item for the current record
					var nextInputItem = getNextInputItemForRecord(automaton, input, tailRecord);

					// Get the next state for the record
					var nextState = getNextState(automaton, currentState, nextInputItem);

					// Save reverse transitions for current state
					var currentStateReverseTransitions = automaton.getStateReverseTransitions(currentState);

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
							var newPartiallyMissingRecord = createPartiallyMissingRecord(tailRecord, reverseTransition, nextInputItem, nextState);

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
		 * @param automaton
		 * @param input
		 * @returns {Array}
		 */
		function processLatestTailRecords (automaton, input) {

			// Create new tail records array
			var newTailRecords = [];

			// Create reference to tail records
			var tailRecords = getTailRecords(automaton);

			// Save the amount of tail records
			var tailRecordsCount = getTailRecordsCount(automaton);

			// Loop over the tail records
			for (var currentTailRecordId = 0; currentTailRecordId < tailRecordsCount; currentTailRecordId ++) {

				// Save the current record reference
				var currentTailRecord = tailRecords[currentTailRecordId];

				// Execute the current tail record and get its derivatives
				var currentTailDerivatives = processTailRecord(automaton, input, currentTailRecord);

				// Add current tail derivatives to the new tail records array
				newTailRecords = newTailRecords.concat(currentTailDerivatives);
			}

			// Return result of current tails array execution
			return newTailRecords;
		}

		/**
		 * Execute the automaton to get all the possible additions without loop repetitions.
		 *
		 * @param input
		 * @returns {Array}
		 */
		Automaton.prototype.execute = function (input) {

			// Reset the automaton to initial state
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

		return Automaton;
	}
);
