/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[],
	function() {
		'use strict';

		function Record (previousRecord, targetState, characters, missing) {

			// Define previous record pointer
			this.previousRecord = previousRecord || null;

			// Define target state
			this.targetState = targetState || 0;

			// Define characters
			this.characters = characters || '';

			// Define missing indicator
			this.missing = missing || false;

			// Define starting state
			this.startingState = 0;

			// Define missing characters counter
			this.missingCount = 0;

			// Define accepted characters counter
			this.acceptedCount = 0;

			// If the previous record is defined
			if (this.previousRecord !== null) {

				// Set starting state to the target state of previous record
				this.startingState = this.previousRecord.getTargetState();

				// Set missing and accepted counts according to the missing flag
				// If a character is missing
				if (this.missing) {

					// Increment the missing count
					this.missingCount = this.previousRecord.getMissingCount() + 1;

					// Copy the accepted count
					this.acceptedCount = this.previousRecord.getAcceptedCount();

				// Else
				} else {

					// Copy the accepted count
					this.missingCount = this.previousRecord.getAcceptedCount();

					// Increment the missing count
					this.acceptedCount = this.previousRecord.getAcceptedCount() + 1;
				}
			}

			// TODO: implement loop detection
		}

		Record.prototype.getTargetState = function () {
			return this.targetState;
		};

		Record.prototype.getStartingState = function () {
			return this.startingState;
		}

		Record.prototype.getMissingCount = function () {
			return this.missingCount;
		};

		Record.prototype.getAcceptedCount = function () {
			return this.acceptedCount;
		};

		return Record;
	}
);
