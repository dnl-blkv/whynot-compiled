/**
 * Created by danek_000 on 30.8.2015.
 *
 * Generic VM-based formal language matching framework.
 * This module provides an API object which exposes the usual entry points for this library.
 *
 * @module whynotPremadePlayer
 */
define(
	[
		'./Traverser'
	],
	function(
		Traverser
	) {
		'use strict';

		return {
			Traverser: Traverser
		};
	}
);
