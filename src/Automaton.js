/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[
		'Record'
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

			// Define the final records
			this.finalRecords = [];

			// Define the indicator of input completeness
			this.inputOver = false;
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
					writeToInputBuffer(automaton, inputItem);
				} else {

					// State that input is over
					automaton.inputOver = true;
				}
			}
		}

		/**
		 * Add an input item to the input buffer.
		 *
		 * @param automaton
		 * @param inputItem
		 */
		function writeToInputBuffer (automaton, inputItem) {
			automaton.inputBuffer.push(inputItem);
		}

		/**
		 * Get an input item by its order in the buffer.
		 *
		 * @param automaton
		 * @param id
		 * @returns {*}
		 */
		function getInputItemById (automaton, id) {
			// Return the input item
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
		 * Add a record to final records array.
		 *
		 * @param automaton
		 * @param finalRecord
		 */
		function addFinalRecord (automaton, finalRecord) {
			automaton.finalRecords.push(finalRecord);
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
		 * Returns the current input buffer length.
		 *
		 * @param automaton
		 */
		function getInputBufferLength (automaton) {
			return automaton.inputBuffer.length;
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
		 * Reset the automaton.
		 *
		 * @param automaton
		 */
		function reset (automaton) {

			// Reset the input buffer
			resetInputBuffer(automaton);

			// Reset the final records
			resetFinalRecords(automaton);
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
				false
			);
		}

		/**
		 * Create and return a new missing record.
		 *
		 * @param previousRecord
		 * @param characters
		 * @param targetState
		 * @returns {Record}
		 */
		function createMissingRecord (previousRecord, characters, targetState) {

			// Return the new missing record
			return new Record (
				previousRecord,
				targetState,
				characters,
				true
			);

		}

		/**
		 * Create a partially missing record.
		 *
		 * @param previousRecord
		 * @param characters
		 * @param targetState
		 * @param excludedCharacter
		 * @returns {Record}
		 */
		function createPartiallyMissingRecord (previousRecord, characters, targetState, excludedCharacter) {

			// Save the next state index in the current reverse transition
			var excludedCharacterIndex = characters.indexOf(excludedCharacter);

			// Create array of missing characters
			var partialCharacters = characters.slice();

			// Cut off the accepted character
			partialCharacters.splice(excludedCharacterIndex, 1);

			// Return the new missing record
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
		 * @param record
		 * @returns {*}
		 */
		function getNextInputItemForRecord (automaton, input, record) {

			// Get the current input buffer length of the automaton
			var inputBufferLength = getInputBufferLength(automaton);

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

				// Is input over?
				var inputOver = isInputOver(automaton);

				// If input is over
				if (inputOver) {

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
		 * @param tailRecord
		 * @param input
		 */
		function executeTail (automaton, tailRecord, input) {

			// Create new tail records array
			var tailDerivatives = [];

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

				// Save an indicator if there is a next state for current input item
				var nextStateExists = (nextState !== undefined);

				// Save reverse transitions for current state
				var currentStateReverseTransitions = automaton.getStateReverseTransitions(currentState);

				// Save the next state as a string index
				var nextStateAsString = nextState + '';

				// If the next state exists
				if (nextStateExists) {

					// Add a new accept record for the accepted transition

					// Create a new accept record
					var newAcceptRecord = createAcceptRecord(tailRecord, nextInputItem, nextState);

					// Add the new accept record to the tail derivatives
					tailDerivatives.push(newAcceptRecord);

					// Add a new missing record for a missing-input transition

					// Save the reverse transition to which current input item belongs
					var reverseTransition = currentStateReverseTransitions[nextStateAsString];

					// Create missing record for reverse transition except for the accepted transition
					var newPartiallyMissingRecord = createPartiallyMissingRecord(tailRecord, reverseTransition, nextState, nextInputItem);

					// Add the new partially missing record to the tail derivatives
					tailDerivatives.push(newPartiallyMissingRecord);

				}

				// Add the new missing records for all the missing transitions

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

						// Create missing record for reverse transition
						var nextMissingRecord = createMissingRecord(tailRecord, currentReverseTransition, currentReverseTransitionState);

						// Add the next missing record to the tail derivatives
						tailDerivatives.push(nextMissingRecord);
					}
				}
			}

			// TODO: Detect loops in the records chains and drop records in case of loops detected

			return tailDerivatives;
		}

		/**
		 * Execute all tail records in a single generation.
		 *
		 * @param automaton
		 * @param tailRecords
		 * @param input
		 * @returns {Array}
		 */
		function executeTails (automaton, tailRecords, input) {

			// Create new tail records array
			var newTailRecords = [];

			// Save the amount of tail records
			var tailRecordsCount = tailRecords.length;

			// Loop over the tail records
			for (var currentTailRecordId = 0; currentTailRecordId < tailRecordsCount; currentTailRecordId ++) {

				// Save the current record reference
				var currentTailRecord = tailRecords[currentTailRecordId];

				// Execute the current tail record and get its derivatives
				var currentTailDerivatives = executeTail(automaton, currentTailRecord, input);

				// Concat tail derivatives to the new tail records
				newTailRecords = newTailRecords.concat(currentTailDerivatives);
			}

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

			// Create an initial record
			var initialRecord = new Record(null, 0, [''], false);

			// Create array for tailing records
			var tailRecords = [initialRecord];

			// Loop over generations of tail records
			while (tailRecords.length > 0) {

				// Update the tailRecords
				tailRecords = executeTails(this, tailRecords, input);
			}

			// Return the final records
			return this.finalRecords;
		};

		return Automaton;
	}
);
