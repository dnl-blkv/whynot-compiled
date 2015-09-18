// Require.js config
require.config({
	"baseUrl": "/test",

	"paths": {
		"regexParser": "../src/compiler/util/regexParser"
	},

	"packages": [
		{
			"name": "whynot-premade-player",
			"location": "../src/player"
		},
		{
			"name": "whynot-premade-compiler",
			"location": "../src/compiler"
		}
	],

	"shim": {
		"regexParser": {
			"exports": "regexParser"
		}
	}
});
