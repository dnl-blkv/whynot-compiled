/**
 * Created by danek_000 on 30.8.2015.
 */
define(
	[],
	function() {
		'use strict';

		function Transition (stateFrom, stateTo, character) {

			// Save the initial state
			this.stateFrom = stateFrom;

			// Set the resulting state
			this.stateTo = stateTo;

			// Set the character
			this.character = character;
		}

		return Transition;
	}
);
