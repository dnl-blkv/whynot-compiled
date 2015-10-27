/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	['./util/arrayUtils'],
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

			// Define the last accepted counter
			this.lastAcceptedRecord = this;

			// If the previous record is defined
			if (this.previousRecord !== null) {

				// Copy the accepted count
				this.missingCount = this.previousRecord.getMissingCount();

				// Copy the accepted count
				this.acceptedCount = this.previousRecord.getAcceptedCount();

				// Increase the corresponding counter
				if (this.accepted) {
					++ this.acceptedCount;
				} else {
					++ this.missingCount;
					this.lastAcceptedRecord = this.previousRecord.lastAcceptedRecord;
				}

			}

			this.alternatives = [];
		}

		Record.prototype.getPreviousRecord = function () {
			return this.previousRecord;
		};

		Record.prototype.getLastAcceptRecord = function () {
			return this.lastAcceptedRecord;
		};

		Record.prototype.getCharacters = function () {
			return this.characters;
		};

		/**
		 * Find a possible base for which this records serves an extension in ancestors chain of another record.
		 *
		 * @param olderRecord
		 * @returns {*}
		 */
		Record.prototype.findBaseCandidate = function (olderRecord) {
			var baseCandidate = olderRecord;

			var baseCandidateFound = false;

			while ((baseCandidate !== null) &&
			(this.getAcceptedCount() <= baseCandidate.getAcceptedCount())) {

				if ((baseCandidate.getAcceptedCount() === this.getAcceptedCount()) &&
					(baseCandidate.getTargetState() === this.getTargetState())) {
					baseCandidateFound = true;
					break;
				}

				baseCandidate = baseCandidate.getPreviousRecord();
			}

			if (!baseCandidateFound) {
				baseCandidate = null;
			}

			return baseCandidate;
		};

		Record.prototype.isExtensionOf = function (baseCandidate) {
			// Perform check going back from the checked record and similarly back from candidateRecord
			// A "missing" character in candidate record means the extension is not useless
			var extension = true;

			var baseCandidateAncestor = baseCandidate;

			var newerRecordAncestor = this;

			while (baseCandidateAncestor !== newerRecordAncestor) {

				if ((baseCandidateAncestor === null) ||
					(newerRecordAncestor === null) ||
					(newerRecordAncestor.getTotalCount() < baseCandidateAncestor.getTotalCount())) {

					if (baseCandidateAncestor === null) {
						break;
					}

					extension = false;

					break;
				}

				if (newerRecordAncestor.isPartialOf(baseCandidateAncestor)) {
					baseCandidateAncestor = baseCandidateAncestor.getPreviousRecord();
				}

				newerRecordAncestor = newerRecordAncestor.getPreviousRecord();
			}

			return extension;
		};

		Record.prototype.isPartialOf = function (anotherRecord) {
			var characters = this.getCharacters();

			var charactersCount = characters.length;

			var anotherCharacters = anotherRecord.getCharacters();

			var anotherCharactersCount = anotherCharacters.length;

			var isPartial = true;

			if ((charactersCount < (anotherCharactersCount - 1)) ||
				(charactersCount > anotherCharactersCount)) {
				isPartial = false;
			}

			var missesCount = 0;

			if (isPartial) {
				for (var characterId = 0; characterId < charactersCount; ++ characterId) {
					if (characters[characterId] !== anotherCharacters[characterId + missesCount]) {
						++ missesCount;
						if ((missesCount === 1) && (charactersCount === 1) || (missesCount > 1)) {
							isPartial = false;
						}
					}
				}
			}

			return isPartial;
		};

		Record.prototype.charactersEqual = function (anotherRecord) {
			return this.getCharacters().equals(anotherRecord.getCharacters());
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

		Record.prototype.getTotalCount = function () {
			return this.getAcceptedCount() + this.getMissingCount();
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
			if (!this.getAccepted()) {
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
		};

		Record.prototype.addAlternative = function (alternative) {
			this.alternatives.push(alternative);
		};

		Record.prototype.getAlternatives = function () {
			return this.alternatives;
		};

		return Record;
	}
);
