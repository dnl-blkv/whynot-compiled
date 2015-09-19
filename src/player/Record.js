/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[],
	function() {
		'use strict';

		function Record (previousRecord, targetState, characters, accepted) {

			// Define previous record pointer
			this.previousRecord = previousRecord || null;

			// Define target state
			this.targetState = targetState || 0;

			// Define characters
			this.characters = characters || '';

			// Define accepted indicator
			this.accepted = accepted || false;

			// Define accepted characters counter
			this.missingCount = 0;

			// Define accepted characters counter
			this.acceptedCount = 0;

			// If the previous record is defined
			if (this.previousRecord !== null) {

				// Copy the accepted count
				this.missingCount = this.previousRecord.getMissingCount();

				// Copy the accepted count
				this.acceptedCount = this.previousRecord.getAcceptedCount();

				// Increase the corresponding counter
				this.accepted ? ++ this.acceptedCount: ++ this.missingCount;
			}

			// TODO: implement loop detection
		}

		Record.prototype.getPreviousRecord = function () {
			return this.previousRecord;
		};

		Record.prototype.getCharacters = function () {
			return this.characters;
		};

		Record.prototype.getAccepted = function () {
			return this.accepted;
		};

		Record.prototype.getTargetState = function () {
			return this.targetState;
		};

		Record.prototype.getMissingCount = function () {
			return this.missingCount;
		};

		Record.prototype.getAcceptedCount = function () {
			return this.acceptedCount;
		};

		Record.prototype.isHead = function () {
			return this.previousRecord === null;
		};

		Record.prototype.hasLoops = function () {

			// Define a loops presence flag
			var hasLoops = false;

			// Save the current state
			var currentState = this.getTargetState();

			// Save the earlier state reference
			var earlierRecord = this.getPreviousRecord();

			// If earlier record exists
			if(!this.getAccepted()) {
				while (earlierRecord !== null) {
					var earlierState = earlierRecord.getTargetState();

					if (earlierState === currentState) {

						hasLoops = true;

						break;
					}

					if (earlierRecord.getAccepted()) {
						break;
					}

					earlierRecord = earlierRecord.getPreviousRecord();
				}
			}

			// Return the flag determining the loops presence
			return hasLoops;
		}

		return Record;
	}
);
