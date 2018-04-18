//
// This source file is part of the current-contracts open source project
// Copyright 2018 Zerion LLC
// Licensed under Apache License v2.0
//
const Token = artifacts.require('./NexoToken.sol');
const constants = require('./constants.js');

contract('Owned.', function (accounts) {

	it('Should verify initial owner', function (done) {
		var contract;

		Token.new().then(function (instance) {
			contract = instance;
			return contract.owner.call();
		}).then(function (address) {
			assert.equal(address, constants.owner, 'Owners do not match');
		}).then(done);
	});

	it('No one but owner should be able to call setOwner() function', function (done) {
		var contract;

		Token.new().then(function (instance) {
			contract = instance;
			return contract.setOwner(constants.newOwner, {
				from: constants.investor
			});
		}).then(function (tx) {
			throw new Error('investor should not be able to call setOwner() function');
		}).catch(function (err) {
			assert.equal(err.message, 'VM Exception while processing transaction: revert');
		}).then(done);
	});

	describe('Change Owner', function () {
		let contact;

		it('Should set potential owner', async function () {
			contract = await Token.new();
			await contract.setOwner(constants.newOwner, {
				from: constants.owner
			}).then(function (tx) {
				return contract.potentialOwner.call();
			}).then(function (address) {
				assert.equal(address, constants.newOwner, 'Potential owner was not set');
			});
		});

		it('No one but potential owner should be able to confirm the ownership', async function () {
			await contract.confirmOwnership({
				from: constants.investor
			}).then(function (tx) {
				throw new Error('investor should not be able to confirm ownership');
			}).catch(function (err) {
				assert.equal(err.message, 'VM Exception while processing transaction: revert');
			});
		});

		it('Should confirm ownership', async function () {
			await contract.confirmOwnership({
				from: constants.newOwner
			}).then(function (tx) {
				return contract.owner.call();
			}).then(function (address) {
				assert.equal(address, constants.newOwner, 'Owner was not changed');
				return contract.potentialOwner.call();
			}).then(function (address) {
				assert.equal(address, 0, 'Potential owner was not deleted');
			});
		});
	});
});