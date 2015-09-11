// Require.js config
require.config({
	"baseUrl": "test",

	"paths": {
		"regexParser": "util/regexParser"
	},

	"packages": [
		{
			"name": "whynotPremadePlayer",
			"location": "../src"
		}
	],

	"shim": {
		"regexParser": {
			"exports": "regexParser"
		}
	}
});
