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

		function Record (previousRecords, targetState, characters, accepted) {

			// Define previous record pointer
			this.previousRecords = previousRecords;

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
			if (this.getPreviousRecords().length > 0) {

				var firstPreviousRecord = this.getFirstPreviousRecord();

				// Copy the accepted count
				this.missingCount = firstPreviousRecord.getMissingCount();

				// Copy the accepted count
				this.acceptedCount = firstPreviousRecord.getAcceptedCount();

				// Increase the corresponding counter
				this.accepted ? ++ this.acceptedCount : ++ this.missingCount;
			}
		}

		Record.prototype.getFirstPreviousRecord = function () {
			return this.previousRecords[0];
		};

		Record.prototype.setPreviousRecords = function (previousRecords) {
			this.previousRecords = previousRecords;
		};

		Record.prototype.getPreviousRecords = function () {
			return this.previousRecords;
		};

		Record.prototype.addPreviousRecord = function (alternative) {
			this.previousRecords.push(alternative);
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

		Record.prototype.getTotalCount = function () {
			return this.getAcceptedCount() + this.getMissingCount();
		};

		Record.prototype.isHead = function () {
			return (this.getPreviousRecords().length === 0);
		};

		/**
		 * Find a possible base for which this records serves an extension in ancestors chain of another record.
		 *
		 * @param olderRecord
		 * @returns {*}
		 */
		Record.prototype.findBaseCandidate = function (olderRecord) {

			var baseCandidate = olderRecord;

			var baseCandidatesQueue = [olderRecord];

			var baseCandidateId = 0;

			while (baseCandidateId < baseCandidatesQueue.length) {

				baseCandidate = baseCandidatesQueue[baseCandidateId];

				while ((baseCandidate) &&
				(this.getAcceptedCount() <= baseCandidate.getAcceptedCount())) {

					if ((baseCandidate.getAcceptedCount() === this.getAcceptedCount()) &&
						(baseCandidate.getTargetState() === this.getTargetState())) {
							return baseCandidate;
					}

					var previousRecords = baseCandidate.getPreviousRecords();

					var previousRecordsCount = previousRecords.length;

					for (var previousRecordId = 1; previousRecordId < previousRecordsCount; ++ previousRecordId) {
						var previousRecord = previousRecords[previousRecordId];

						baseCandidatesQueue.splice(baseCandidateId + previousRecordId + 1, 0, previousRecord.getFirstPreviousRecord());
					}

					baseCandidate = previousRecords[0];

				}

				++ baseCandidateId;
			}

			return null;
		};

		Record.prototype.hasLoops = function () {

			// Save the current state
			var currentState = this.getTargetState();

			// Save the earlier state reference
			var earlierRecord = this.getFirstPreviousRecord();

			// Create the earlier records queue
			var earlierRecordsQueue = [earlierRecord];

			// Define the Id of the next item to get from the queue
			var earlierRecordId = 0;

			// If earlier record exists
			if (!this.getAccepted()) {

				while (earlierRecordId < earlierRecordsQueue.length) {

					earlierRecord = earlierRecordsQueue[earlierRecordId];

					while (earlierRecord) {

						var earlierState = earlierRecord.getTargetState();

						if (earlierState === currentState) {
							return true;
						}

						if ((earlierRecord.getAccepted()) &&
							(earlierRecordId === (earlierRecordsQueue.length - 1))) {
							return false;
						}

						var previousRecords = earlierRecord.getPreviousRecords();

						// Add other previous records to the queue
						var previousRecordsCount = previousRecords.length;

						if (1 < previousRecordsCount) {
							for (var previousRecordId = 0; previousRecordId < previousRecordsCount; ++ previousRecordId) {
								var previousRecord = previousRecords[previousRecordId];

								// TODO: Replace with more efficient method
								earlierRecordsQueue.splice(earlierRecordId + previousRecordId + 1, 0, previousRecord);
							}

							++ earlierRecordId;
						}


						// Go to the previous record
						earlierRecord = previousRecords[0];
					}

					// Go to the next record in queue
					++ earlierRecordId;
				}
			}
		};

		// Perform check going back from the checked record and similarly back from candidateRecord
		// A "missing" character in candidate record means the extension is not useless
		Record.prototype.getExtensionsProfiles = function (baseRecord) {

			// Extension candidates managment
			var extensionCandidatesProfilesQueue = [
				{
					'descendant': null,
					'head': this,
					'isExtension': true
				}
			];

			var extensionCandidatesProfileId = 0;

			var currentExtensionCandidate = this;

			// Base candidates management
			var baseRecordsQueue = [
				{
					'base': baseRecord,
					'extensionCandidate': this
				}];

			var baseRecordId = 0;

			var currentBaseRecord = baseRecord;

			// Go through all the extensions present
			while (extensionCandidatesProfileId < extensionCandidatesProfilesQueue.length) {

				currentExtensionCandidate = extensionCandidatesProfilesQueue[extensionCandidatesProfileId].head;

				// Loop until a common ancestor discovered
				while (currentBaseRecord !== currentExtensionCandidate) {

					if ((currentBaseRecord === null) ||
						(currentExtensionCandidate === null) ||
						(currentExtensionCandidate.getTotalCount() < currentBaseRecord.getTotalCount())) {

						if (currentBaseRecord === null) {

							// Extension was discovered
							break;
						}

						// Alternative was discovered
						if (baseRecordId === (baseRecordsQueue.length - 1)) {
							extensionCandidatesProfilesQueue[extensionCandidatesProfileId].isExtension = false;
							break;
						} else {

							// Go to the next base record from the queue
							++ baseRecordId;
							currentBaseRecord = baseRecordsQueue[baseRecordId].base;

							// Go to the corresponding extension
							currentExtensionCandidate = baseRecordsQueue[baseRecordId].extensionCandidate;
							continue;
						}
					}

					if (currentExtensionCandidate.isPartialOf(currentBaseRecord)) {

						var previousBaseRecords = currentBaseRecord.getPreviousRecords();

						var previousBaseRecordsCount = previousBaseRecords.length;

						if (1 < previousBaseRecordsCount) {
							for (var previousBaseRecordId = 0; previousBaseRecordId < previousBaseRecordsCount; ++ previousBaseRecordId ) {
								var previousBaseRecord = previousBaseRecords[previousBaseRecordId];

								baseRecordsQueue.splice(
									baseRecordId + previousBaseRecordId + 1,
									0,
									{
										'base': previousBaseRecord,
										'extensionCandidate': currentExtensionCandidate
									}
								);
							}

							++ baseRecordId;
						}

						// Go to the next base record
						currentBaseRecord = previousBaseRecords[0];
					}

					var previousExtensionCandidates = currentExtensionCandidate.getPreviousRecords();

					// Add other previous records to the queue
					var previousExtensionCandidatesCount = previousExtensionCandidates.length;

					if (1 < previousExtensionCandidatesCount) {
						for (var previousExtensionCandidateId = 0; previousExtensionCandidateId < previousExtensionCandidatesCount; ++ previousExtensionCandidateId) {
							var previousExtensionCandidate = previousExtensionCandidates[previousExtensionCandidateId];

							extensionCandidatesProfilesQueue.splice(
								extensionCandidatesProfileId + previousExtensionCandidateId + 1,
								0,
								{
									'descendant': currentExtensionCandidate,
									'head': previousExtensionCandidate,
									'isExtension': true
								}
							);
						}

						++ extensionCandidatesProfileId;
					}

					currentExtensionCandidate = previousExtensionCandidates[0];
				}

				++ extensionCandidatesProfileId;
			}

			// Extension was discovered
			return extensionCandidatesProfilesQueue;
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
					++ missesCount;
					if ((missesCount === 1) && (charactersCount === 1) || (missesCount > 1)) {
						return false;
					}
				}
			}

			return true;
		};

		return Record;
	}
);
