'use strict';

module.exports = {
	require: [
		'@babel/register',
		'regenerator-runtime/runtime',
		'ts-node/register'
	],
	reporter: 'spec',
	ui: 'bdd',
	extension: 'js,ts',
	timeout: 10000,
	bail: false,
	file: 'tests/api/teardown.js',
	spec: ['tests/api/rest-api/*.js', 'tests/api/rest-api/*.ts'],
	ignore: ['node_modules']
};
