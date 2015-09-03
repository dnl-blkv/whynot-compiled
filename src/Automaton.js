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
		 * Get and buffer the next input item
		 *
		 * @param automaton
		 * @param input
		 */
		function saveNextInputItem (automaton, input) {

			// If input is not yet over
			if (!this.inputOver) {

				// Get the first input item
				var inputItem = input();

				// If next input exists
				if (inputItem !== undefined) {

					// Save input item to the buffer
					writeToInputBuffer(automaton, inputItem);
				} else {

					// State that input is over
					this.inputOver = true;
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
		function getNextInputItemForRecord (automaton, record) {

			// Get the amount of characters accepted till the current record
			var acceptedRecordsCount = record.getAcceptedCount();

			// Get the proper input item
			return getInputItemById(automaton, acceptedRecordsCount);
		}

		function getNextState (automaton, currentState, inputItem) {

			// Get transitions info array for the current state
			var currentStateTransitions = automaton.getStateTransitions(currentState);

			// Return the next state
			return currentStateTransitions[inputItem];
		}

		function tryGettingMoreInputIfRequired (automaton, input, record) {
			// Get the current input buffer length of the automaton
			var inputBufferLength = getInputBufferLength(automaton);

			// Get the current tail record accepted records count
			var currentTailRecordAcceptedCount = record.getAcceptedCount();

			// If the buffer length is less than or equal to the current tail record accepted count
			if (inputBufferLength <= currentTailRecordAcceptedCount) {

				// Grab more input
				saveNextInputItem(automaton, input);
			}
		}

		/**
		 * Execute all tail records in a single generation.
		 *
		 * @param tailRecords
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

				// Save the current state number
				var currentState = currentTailRecord.getTargetState();

				// Get the next input item for the current record
				var nextInputItem = getNextInputItemForRecord(automaton, currentTailRecord);

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
					var newAcceptRecord = createAcceptRecord(currentTailRecord, nextInputItem, nextState);

					// Add the new accept record to the new tail records
					newTailRecords.push(newAcceptRecord);

					// Try getting more input if required
					tryGettingMoreInputIfRequired(automaton, input, newAcceptRecord);

					// Add a new missing record for a missing-input transition

					// Save the position of the
					var reverseTransitionWithAcceptedComponent = currentStateReverseTransitions[nextStateAsString];

					// Save the next state index in the current reverse transition
					var nextStateIndex = reverseTransitionWithAcceptedComponent.indexOf(nextStateAsString);

					// Create the characters array for missing record
					var partiallyMissingRecordCharacters = reverseTransitionWithAcceptedComponent.slice().splice(nextStateIndex, 1);

					// Create missing record for reverse transition except for the accepted transition
					var newPartiallyMissingRecord = createMissingRecord(currentTailRecord, partiallyMissingRecordCharacters, nextState);

					// Add the new missing record to the new tail records
					newTailRecords.push(newPartiallyMissingRecord);

				}

				// Add the new missing records for all the missing transitions

				// Save reverse transition keys
				var reverseTransitionsKeys = Object.keys(currentStateReverseTransitions);

				// Save reverse transitions amount
				var reverseTransitionsCount = reverseTransitionsKeys.length;

				// Iterate over reverse transitions
				for (var j = 0; j < reverseTransitionsCount; j ++) {

					// Save current reverse transition key
					var currentReverseTransitionKey = reverseTransitionsKeys[j];

					// If we are not dealing with a previously processed reverse transition
					if (currentReverseTransitionKey !== nextStateAsString) {

						// Save reference to the current reverse transition
						var currentReverseTransition = currentStateReverseTransitions[currentReverseTransitionKey];

						// Create missing record for reverse transition
						var nextMissingRecord = createMissingRecord(currentTailRecord, currentReverseTransition, nextState);

						// Add the new missing record to the new tail records
						newTailRecords.push(nextMissingRecord);
					}
				}

				// TODO: Request more input when needed

				// TODO: If a newly-added record could be classified as final, add to final records array
				// Final means input is over while a tail is in the final state

				// TODO: Detect loops in the records chains and drop records in case of loops detected
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

			// Get the next input item
			saveNextInputItem(this, input);

			// Create an initial record
			var initialRecord = new Record(null, 0, 0, [''], false, 0, 0);

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
