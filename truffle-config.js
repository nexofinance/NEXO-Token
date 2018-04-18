require('babel-register');
require('babel-polyfill');


module.exports = {
	networks: {
		development: {
			host: '127.0.0.1',
			port: 8545,
			network_id: '*', // eslint-disable-line camelcase
		},
		coverage: {
			host: 'localhost',
			network_id: '*', // eslint-disable-line camelcase
			port: 8555,
			gas: 0xfffffffffff,
			gasPrice: 0x01,
		},
	},
};
