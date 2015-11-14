/**
 * Created by danek_000 on 30.8.2015.
 *
 *   .::::::::..          ..::::::::.
 *	:::::::::::::        :::::::::::::
 * :::::::::::' .\      /. `:::::::::::
 * `::::::::::_,__o    o__,_::::::::::'
 */
define(
	['./util/arrayUtils'],
	function() {
		'use strict';

		function Record (previousRecord, targetState, characters, accepted) {

			// Define previous record pointer
			this.previousRecord = previousRecord;

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
			if (this.getPreviousRecord() !== null) {

				// Copy the accepted count
				this.missingCount = this.getPreviousRecord().getMissingCount();

				// Copy the accepted count
				this.acceptedCount = this.getPreviousRecord().getAcceptedCount();

				// Increase the corresponding counter
				this.accepted ? ++ this.acceptedCount : ++ this.missingCount;
			}
		}

		Record.prototype.getPreviousRecord = function () {
			return this.previousRecord;
		};

		Record.prototype.getCharacters = function () {
			return this.characters;
		};

		// Perform check going back from the checked record and similarly back from candidateRecord
		// A "missing" character in candidate record means the extension is not useless
		Record.prototype.isExtensionOf = function (baseCandidate) {

			var baseCandidateAncestor = baseCandidate;

			var extensionCandidateAncestor = this;

			// Loop until a common ancestor discovered
			while (baseCandidateAncestor !== extensionCandidateAncestor) {

				if ((baseCandidateAncestor === null) ||
					(extensionCandidateAncestor === null) ||
					(extensionCandidateAncestor.getTotalCount() < baseCandidateAncestor.getTotalCount())) {

					if (baseCandidateAncestor === null) {

						// Extension was discovered
						return true;
					}

					// Alternative was discovered
					return false;
				}

				if (extensionCandidateAncestor.isPartialOf(baseCandidateAncestor)) {
					baseCandidateAncestor = baseCandidateAncestor.getPreviousRecord();
				}

				extensionCandidateAncestor = extensionCandidateAncestor.getPreviousRecord();
			}

			// Extension was discovered
			return true;
		};

		Record.prototype.isPartialOf = function (anotherRecord) {
			var characters = this.getCharacters();

			var charactersCount = characters.length;

			var anotherCharacters = anotherRecord.getCharacters();

			var anotherCharactersCount = anotherCharacters.length;

			// A record could be a partial only if it has less or equal amount of characters
			if (charactersCount > anotherCharactersCount) {
				return false;
			}

			var missesCount = 0;

			for (var characterId = 0; characterId < charactersCount; ++ characterId) {
				if (characters[characterId] !== anotherCharacters[characterId + missesCount]) {
					++missesCount;
					if ((missesCount === 1) && (charactersCount === 1) || (missesCount > 1)) {
						return false;
					}
				}
			}

			return true;
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
			return this.getPreviousRecord() === null;
		};

		return Record;
	}
);
