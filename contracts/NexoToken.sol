pragma solidity 0.4.21;

//
// This source file is part of the nexo-contracts open source project
// Copyright 2018 Zerion LLC <inbox@zerion.io>
// Licensed under Apache License v2.0
//

import './utils/Token.sol';


// @title Token contract - Implements Standard ERC20 Token for NEXO project.
/// @author Zerion - <inbox@zerion.io>
contract NexoToken is Token {

	/// TOKEN META DATA
	string constant public name = 'Nexo';
	string constant public symbol = 'NEXO';
	uint8  constant public decimals = 18;


	/// ALOCATIONS
	// To calculate vesting periods we assume that 1 month is always equal to 30 days 


	/*** Initial Investors' tokens ***/

	// 525,000,000 (52.50%) tokens are distributed among initial investors
	// These tokens will be distributed without vesting

	address public investorsAllocation = address(0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF);
	uint256 public investorsTotal = 525000000e18;


	/*** Overdraft Reserves ***/

	// 250,000,000 (25%) tokens will be eventually available for overdraft
	// These tokens will be distributed monthly with a 6 month cliff within a year
	// 41,666,666 tokens will be unlocked every month after the cliff
	// 4 tokens will be unlocked without vesting to ensure that total amount sums up to 250,000,000.

	address public overdraftAllocation = address(0x1111111111111111111111111111111111111111);
	uint256 public overdraftTotal = 250000000e18;
	uint256 public overdraftPeriodAmount = 41666666e18;
	uint256 public overdraftUnvested = 4e18;
	uint256 public overdraftCliff = 5 * 30 days;
	uint256 public overdraftPeriodLength = 30 days;
	uint8   public overdraftPeriodsNumber = 6;


	/*** Tokens reserved for Founders and Team ***/

	// 112,500,000 (11.25%) tokens will be eventually available for the team
	// These tokens will be distributed every 3 month without a cliff within 4 years
	// 7,031,250 tokens will be unlocked every 3 month

	address public teamAllocation  = address(0x2222222222222222222222222222222222222222);
	uint256 public teamTotal = 112500000e18;
	uint256 public teamPeriodAmount = 7031250e18;
	uint256 public teamUnvested = 0;
	uint256 public teamCliff = 0;
	uint256 public teamPeriodLength = 3 * 30 days;
	uint8   public teamPeriodsNumber = 16;



	/*** Tokens reserved for Community Building and Airdrop Campaigns ***/

	// 60,000,000 (6%) tokens will be eventually available for the community
	// 10,000,002 tokens will be available instantly without vesting
	// 49,999,998 tokens will be distributed every 3 month without a cliff within 18 months
	// 8,333,333 tokens will be unlocked every 3 month


	address public communityAllocation  = address(0x3333333333333333333333333333333333333333);
	uint256 public communityTotal = 60000000e18;
	uint256 public communityPeriodAmount = 8333333e18;
	uint256 public communityUnvested = 10000002e18;
	uint256 public communityCliff = 0;
	uint256 public communityPeriodLength = 3 * 30 days;
	uint8   public communityPeriodsNumber = 6;



	/*** Tokens reserved for Advisors, Legal and PR ***/

	// 52,500,000 (5.25%) tokens will be eventually available for advisers
	// 25,000,008 tokens will be available instantly without vesting
	// 27 499 992 tokens will be distributed monthly without a cliff within 12 months
	// 2,291,666 tokens will be unlocked every month

	address public advisersAllocation  = address(0x4444444444444444444444444444444444444444);
	uint256 public advisersTotal = 52500000e18;
	uint256 public advisersPeriodAmount = 2291666e18;
	uint256 public advisersUnvested = 25000008e18;
	uint256 public advisersCliff = 0;
	uint256 public advisersPeriodLength = 30 days;
	uint8   public advisersPeriodsNumber = 12;


	/// CONSTRUCTOR

	function NexoToken() public {
		//  Overall, 1,000,000,000 tokens exist
		totalSupply = 1000000000e18;

		balances[investorsAllocation] = investorsTotal;
		balances[overdraftAllocation] = overdraftTotal;
		balances[teamAllocation] = teamTotal;
		balances[communityAllocation] = communityTotal;
		balances[advisersAllocation] = advisersTotal;

		// Unlock some tokens without vesting
		allowed[investorsAllocation][msg.sender] = investorsTotal;
		allowed[overdraftAllocation][msg.sender] = overdraftUnvested;
		allowed[communityAllocation][msg.sender] = communityUnvested;
		allowed[advisersAllocation][msg.sender] = advisersUnvested;
	}

	/// DISTRIBUTION

	function distributeInvestorsTokens(address _to, uint256 _amountWithDecimals)
		public
		onlyOwner
	{
		require(transferFrom(investorsAllocation, _to, _amountWithDecimals));
	}

	/// VESTING

	function withdrawOverdraftTokens(address _to, uint256 _amountWithDecimals)
		public
		onlyOwner
	{
		uint256 unlockedTokens = _calculateUnlockedTokens(
			overdraftCliff,
			overdraftPeriodLength,
			overdraftPeriodAmount,
			overdraftPeriodsNumber,
			overdraftUnvested
		);

		uint256 spentTokens = sub(overdraftTotal, balanceOf(overdraftAllocation));

		allowed[overdraftAllocation][msg.sender] = sub(unlockedTokens, spentTokens);

		require(transferFrom(overdraftAllocation, _to, _amountWithDecimals));
	}

	function withdrawTeamTokens(address _to, uint256 _amountWithDecimals)
		public
		onlyOwner 
	{
		uint256 unlockedTokens = _calculateUnlockedTokens(
			teamCliff,
			teamPeriodLength,
			teamPeriodAmount,
			teamPeriodsNumber,
			teamUnvested
		);

		uint256 spentTokens = sub(teamTotal, balanceOf(teamAllocation));

		allowed[teamAllocation][msg.sender] = sub(unlockedTokens, spentTokens);

		require(transferFrom(teamAllocation, _to, _amountWithDecimals));
	}

	function withdrawCommunityTokens(address _to, uint256 _amountWithDecimals)
		public
		onlyOwner 
	{
		uint256 unlockedTokens = _calculateUnlockedTokens(
			communityCliff,
			communityPeriodLength,
			communityPeriodAmount,
			communityPeriodsNumber,
			communityUnvested
		);

		uint256 spentTokens = sub(communityTotal, balanceOf(communityAllocation));

		allowed[communityAllocation][msg.sender] = sub(unlockedTokens, spentTokens);

		require(transferFrom(communityAllocation, _to, _amountWithDecimals));
	}

	function withdrawAdvisersTokens(address _to, uint256 _amountWithDecimals)
		public
		onlyOwner 
	{
		uint256 unlockedTokens = _calculateUnlockedTokens(
			advisersCliff,
			advisersPeriodLength,
			advisersPeriodAmount,
			advisersPeriodsNumber,
			advisersUnvested
		);

		uint256 spentTokens = sub(advisersTotal, balanceOf(advisersAllocation));

		allowed[advisersAllocation][msg.sender] = sub(unlockedTokens, spentTokens);

		require(transferFrom(advisersAllocation, _to, _amountWithDecimals));
	}

	/// @dev Overrides StandardToken.sol function
	function allowance(address _owner, address _spender)
		public
		view
		returns (uint256 remaining)
	{   
		if (_spender != owner) {
			return allowed[_owner][_spender];
		}

		uint256 unlockedTokens;
		uint256 spentTokens;

		if (_owner == overdraftAllocation) {
			unlockedTokens = _calculateUnlockedTokens(
				overdraftCliff,
				overdraftPeriodLength,
				overdraftPeriodAmount,
				overdraftPeriodsNumber,
				overdraftUnvested
			);
			spentTokens = sub(overdraftTotal, balanceOf(overdraftAllocation));
		} else if (_owner == teamAllocation) {
			unlockedTokens = _calculateUnlockedTokens(
				teamCliff,
				teamPeriodLength,
				teamPeriodAmount,
				teamPeriodsNumber,
				teamUnvested
			);
			spentTokens = sub(teamTotal, balanceOf(teamAllocation));
		} else if (_owner == communityAllocation) {
			unlockedTokens = _calculateUnlockedTokens(
				communityCliff,
				communityPeriodLength,
				communityPeriodAmount,
				communityPeriodsNumber,
				communityUnvested
			);
			spentTokens = sub(communityTotal, balanceOf(communityAllocation));
		} else if (_owner == advisersAllocation) {
			unlockedTokens = _calculateUnlockedTokens(
				advisersCliff,
				advisersPeriodLength,
				advisersPeriodAmount,
				advisersPeriodsNumber,
				advisersUnvested
			);
			spentTokens = sub(advisersTotal, balanceOf(advisersAllocation));
		} else {
			return allowed[_owner][_spender];
		}

		return sub(unlockedTokens, spentTokens);
	}

	/// @dev Overrides Owned.sol function
	function confirmOwnership()
		public
		onlyPotentialOwner
	{   
		// Forbid the old owner to distribute investors' tokens
		allowed[investorsAllocation][owner] = 0;

		// Allow the new owner to distribute investors' tokens
		allowed[investorsAllocation][msg.sender] = balanceOf(investorsAllocation);

		// Forbid the old owner to withdraw any tokens from the reserves
		allowed[overdraftAllocation][owner] = 0;
		allowed[teamAllocation][owner] = 0;
		allowed[communityAllocation][owner] = 0;
		allowed[advisersAllocation][owner] = 0;

		super.confirmOwnership();
	}

	function _calculateUnlockedTokens(
		uint256 _cliff,
		uint256 _periodLength,
		uint256 _periodAmount,
		uint8 _periodsNumber,
		uint256 _unvestedAmount
	)
		private
		view
		returns (uint256) 
	{
		/* solium-disable-next-line security/no-block-members */
		if (now < add(creationTime, _cliff)) {
			return _unvestedAmount;
		}
		/* solium-disable-next-line security/no-block-members */
		uint256 periods = div(sub(now, add(creationTime, _cliff)), _periodLength);
		periods = periods > _periodsNumber ? _periodsNumber : periods;
		return add(_unvestedAmount, mul(periods, _periodAmount));
	}
}
