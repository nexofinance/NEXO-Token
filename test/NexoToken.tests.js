//
// This source file is part of the current-contracts open source project
// Copyright 2018 Zerion LLC
// Licensed under Apache License v2.0
//
let assertRevert = require('./helpers/AssertRevert');
let increaseTime = require('./helpers/TimeTravel');

const constants = require('./constants.js');
const token = artifacts.require('../contracts/NexoToken.sol');
const BigNumber = web3.BigNumber;

require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should();


contract('NexoToken', function (accounts) {

	describe('Check constant field values', function () {
		let contact;

		it('Should check allocation addresses', async function () {
			contract = await token.new();

			constants.investorsAllocation.should.be.bignumber.equal(await contract.investorsAllocation.call());
			constants.overdraftAllocation.should.be.bignumber.equal(await contract.overdraftAllocation.call());
			constants.teamAllocation.should.be.bignumber.equal(await contract.teamAllocation.call());
			constants.communityAllocation.should.be.bignumber.equal(await contract.communityAllocation.call());
			constants.advisersAllocation.should.be.bignumber.equal(await contract.advisersAllocation.call());
		});

		it('Should check total numbers', async function () {
			constants.investorsTotal.should.be.bignumber.equal(await contract.investorsTotal.call());
			constants.overdraftTotal.should.be.bignumber.equal(await contract.overdraftTotal.call());
			constants.teamTotal.should.be.bignumber.equal(await contract.teamTotal.call());
			constants.communityTotal.should.be.bignumber.equal(await contract.communityTotal.call());
			constants.advisersTotal.should.be.bignumber.equal(await contract.advisersTotal.call());
		});

		it('Should check period amounts', async function () {
			constants.overdraftPeriodAmount.should.be.bignumber.equal(await contract.overdraftPeriodAmount.call());
			constants.teamPeriodAmount.should.be.bignumber.equal(await contract.teamPeriodAmount.call());
			constants.communityPeriodAmount.should.be.bignumber.equal(await contract.communityPeriodAmount.call());
			constants.advisersPeriodAmount.should.be.bignumber.equal(await contract.advisersPeriodAmount.call());
		});

		it('Should check unvested numbers', async function () {
			constants.overdraftUnvested.should.be.bignumber.equal(await contract.overdraftUnvested.call());
			constants.teamUnvested.should.be.bignumber.equal(await contract.teamUnvested.call());
			constants.communityUnvested.should.be.bignumber.equal(await contract.communityUnvested.call());
			constants.advisersUnvested.should.be.bignumber.equal(await contract.advisersUnvested.call());
		});

		it('Should check cliffs', async function () {
			constants.overdraftCliff.should.be.bignumber.equal(await contract.overdraftCliff.call());
			constants.teamCliff.should.be.bignumber.equal(await contract.teamCliff.call());
			constants.communityCliff.should.be.bignumber.equal(await contract.communityCliff.call());
			constants.advisersCliff.should.be.bignumber.equal(await contract.advisersCliff.call());
		});

		it('Should check period lengths', async function () {
			constants.overdraftPeriodLength.should.be.bignumber.equal(await contract.overdraftPeriodLength.call());
			constants.teamPeriodLength.should.be.bignumber.equal(await contract.teamPeriodLength.call());
			constants.communityPeriodLength.should.be.bignumber.equal(await contract.communityPeriodLength.call());
			constants.advisersPeriodLength.should.be.bignumber.equal(await contract.advisersPeriodLength.call());
		});

		it('Should check periods number', async function () {
			constants.overdraftPeriodsNumber.should.be.bignumber.equal(await contract.overdraftPeriodsNumber.call());
			constants.teamPeriodsNumber.should.be.bignumber.equal(await contract.teamPeriodsNumber.call());
			constants.communityPeriodsNumber.should.be.bignumber.equal(await contract.communityPeriodsNumber.call());
			constants.advisersPeriodsNumber.should.be.bignumber.equal(await contract.advisersPeriodsNumber.call());
		});
	});

	it('Should check allocation balances', async function () {
		let contract = await token.new();

		constants.investorsTotal.should.be.bignumber.equal(await contract.balanceOf.call(constants.investorsAllocation));
		constants.overdraftTotal.should.be.bignumber.equal(await contract.balanceOf.call(constants.overdraftAllocation));
		constants.teamTotal.should.be.bignumber.equal(await contract.balanceOf.call(constants.teamAllocation));
		constants.communityTotal.should.be.bignumber.equal(await contract.balanceOf.call(constants.communityAllocation));
		constants.advisersTotal.should.be.bignumber.equal(await contract.balanceOf.call(constants.advisersAllocation));
	});

	it('Should check unvested token numbers', async function () {
		let contract = await token.new();

		constants.investorsTotal.should.be.bignumber.equal(await contract.allowance.call(constants.investorsAllocation, constants.owner));
		constants.overdraftUnvested.should.be.bignumber.equal(await contract.allowance.call(constants.overdraftAllocation, constants.owner));
		constants.teamUnvested.should.be.bignumber.equal(await contract.allowance.call(constants.teamAllocation, constants.owner));
		constants.communityUnvested.should.be.bignumber.equal(await contract.allowance.call(constants.communityAllocation, constants.owner));
		constants.advisersUnvested.should.be.bignumber.equal(await contract.allowance.call(constants.advisersAllocation, constants.owner));
	});

	it('Should check that a random address can not distribute tokens allocated for investors', async function () {
		let contract = await token.new();

		await assertRevert(
			contract.transferFrom(constants.investorsAllocation, constants.investor, constants.investorsTotal, { from: constants.investor })
		);
	});

	it('Should check that owner can distribute tokens allocated for investors', async function () {
		let contract = await token.new();

		let investorBalance = await contract.balanceOf.call(constants.investor);
		investorBalance.should.be.bignumber.equal(0);
		await contract.transferFrom(constants.investorsAllocation, constants.investor, constants.investorsTotal, { from: constants.owner });
		let investorNewBalance = await contract.balanceOf.call(constants.investor);
		investorNewBalance.should.be.bignumber.equal(constants.investorsTotal);
		let investorsAllocationBalance = await contract.balanceOf.call(constants.investorsAllocation);
		investorsAllocationBalance.should.be.bignumber.equal(0);
	});

	describe('Test vesting', function () {

		let month = 30 * 24 * 60 * 60 * 1000; // milliseconds

		async function setTime(date) {
			let block = await web3.eth.getBlock(web3.eth.blockNumber);
			let nodeTime = block.timestamp * 1000;

			await increaseTime((date - nodeTime) / 1000);

			block = await web3.eth.getBlock(web3.eth.blockNumber);
			nodeTime = block.timestamp * 1000;

			date.should.be.bignumber.closeTo(nodeTime, date, 5000);  // +/- 5 seconds
		}

		it('Should test overdraft reserve vesting', async function () {
			console.log('Test overdraft reserve vesting...');
			let contract = await token.new();
			let creationTime = await contract.creationTime.call() * 1000;
			let cliff = constants.overdraftCliff * 1000;

			for (let i = 0; i < 12; ++i) {
				let newTime = creationTime + month * i;
				await setTime(newTime);
				let available = await contract.allowance.call(constants.overdraftAllocation, constants.owner);
				console.log('' + (i + 1) + "'th month:", available.toNumber() / Math.pow(10, constants.decimals));
				if (newTime < creationTime + cliff) {
					available.should.be.bignumber.equal(constants.overdraftUnvested);
				} else {
					available.should.be.bignumber.equal(constants.overdraftUnvested.plus(constants.overdraftPeriodAmount.times(i - 5)));
				}
			}
		});

		it('Should test founders & team reserve vesting', async function () {
			console.log('Test founders & team reserve vesting...');
			let contract = await token.new();
			let creationTime = await contract.creationTime.call() * 1000;

			for (let i = 0; i <= 48; ++i) {
				let newTime = creationTime + month * i;
				await setTime(newTime);
				let available = await contract.allowance.call(constants.teamAllocation, constants.owner);
				console.log('' + (i + 1) + "'th month:", available.toNumber() / Math.pow(10, constants.decimals));
				available.should.be.bignumber.equal(constants.teamUnvested.plus(constants.teamPeriodAmount.times(Math.floor(i / 3))));
			}
		});

		it('Should test community & airdrop reserve vesting', async function () {
			console.log('Test community & airdrop reserve vesting...');
			let contract = await token.new();
			let creationTime = await contract.creationTime.call() * 1000;

			for (let i = 0; i <= 18; ++i) {
				let newTime = creationTime + month * i;
				await setTime(newTime);
				let available = await contract.allowance.call(constants.communityAllocation, constants.owner);
				console.log('' + (i + 1) + "'th month:", available.toNumber() / Math.pow(10, constants.decimals));
				available.should.be.bignumber.equal(constants.communityUnvested.plus(constants.communityPeriodAmount.times(Math.floor(i / 3))));
			}
		});

		it('Should test advisers & legal reserve vesting', async function () {
			console.log('Test advisers & legal reserve vesting...');
			let contract = await token.new();
			let creationTime = await contract.creationTime.call() * 1000;

			for (let i = 0; i <= 12; ++i) {
				let newTime = creationTime + month * i;
				await setTime(newTime);
				let available = await contract.allowance.call(constants.advisersAllocation, constants.owner);
				console.log('' + (i + 1) + "'th month:", available.toNumber() / Math.pow(10, constants.decimals));
				available.should.be.bignumber.equal(constants.advisersUnvested.plus(constants.advisersPeriodAmount.times(i)));
			}
		});

	});
});
