// Require.js config
require.config({
	"baseUrl": "test",

	"paths": {
		"regexParser": "../src/compiler/util/regexParser"
	},

	"packages": [
		{
			"name": "whynotPremadePlayer",
			"location": "../src/player"
		},
		{
			"name": "whynotPremadeCompiler",
			"location": "../src/compiler"
		}
	],

	"shim": {
		"regexParser": {
			"exports": "regexParser"
		}
	}
});
