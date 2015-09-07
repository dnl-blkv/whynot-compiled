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

			// Define missing characters counter
			this.missingCount = 0;

			// Define accepted characters counter
			this.acceptedCount = 0;

			// If the previous record is defined
			if (this.previousRecord !== null) {

				// Copy the missing count
				this.missingCount = this.previousRecord.getMissingCount();

				// Copy the accepted count
				this.acceptedCount = this.previousRecord.getAcceptedCount();

				// Increase the corresponding counter
				this.missing ? ++ this.missingCount : ++ this.acceptedCount;
			}

			// TODO: implement loop detection
		}

		Record.prototype.getPreviousRecord = function () {
			return this.previousRecord;
		}

		Record.prototype.getCharacters = function () {
			return this.characters;
		}

		Record.prototype.getMissing = function () {
			return this.missing;
		}

		Record.prototype.getTargetState = function () {
			return this.targetState;
		};

		Record.prototype.getMissingCount = function () {
			return this.missingCount;
		};

		Record.prototype.getAcceptedCount = function () {
			return this.acceptedCount;
		};

		return Record;
	}
);
