//
// This source file is part of the current-contracts open source project
// Copyright 2018 Zerion LLC
// Licensed under Apache License v2.0
//
const BigNumber = web3.BigNumber;

function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}


/** Addresses **/
define('owner', '0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a');
define('newOwner', '0xf1f42f995046e67b79dd5ebafd224ce964740da3');
define('investor', '0xd646e8c228bfcc0ec6067ad909a34f14f45513b0');


/** Token meta information **/
define('decimals', 18);
define('name', 'Nexo');
define('symbol', 'NEXO');


/** Alocations **/

let stringDecimals = '000000000000000000';

// Initial Investors
define('investorsAllocation', '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF');
define('investorsTotal', new BigNumber('525000000' + stringDecimals));

// Overdraft Reserves
define('overdraftAllocation', '0x1111111111111111111111111111111111111111');
define('overdraftTotal', new BigNumber('250000000' + stringDecimals));
define('overdraftPeriodAmount', new BigNumber('41666666' + stringDecimals));
define('overdraftUnvested', new BigNumber('4' + stringDecimals));
define('overdraftCliff', 5 * 30 * 24 * 60 * 60);
define('overdraftPeriodLength', 30 * 24 * 60 * 60);
define('overdraftPeriodsNumber', 6);

// Founders & Team 
define('teamAllocation', '0x2222222222222222222222222222222222222222');
define('teamTotal', new BigNumber('112500000' + stringDecimals));
define('teamPeriodAmount', new BigNumber('7031250' + stringDecimals));
define('teamUnvested', new BigNumber('0'));
define('teamCliff', 0);
define('teamPeriodLength', 3 * 30 * 24 * 60 * 60);
define('teamPeriodsNumber', 16);

// Community & Aidrop
define('communityAllocation', '0x3333333333333333333333333333333333333333');
define('communityTotal', new BigNumber('60000000' + stringDecimals));
define('communityPeriodAmount', new BigNumber('8333333' + stringDecimals));
define('communityUnvested', new BigNumber('10000002' + stringDecimals));
define('communityCliff', 0);
define('communityPeriodLength', 3 * 30 * 24 * 60 * 60);
define('communityPeriodsNumber', 6);

// Advisors & Legal & PR
define('advisersAllocation', '0x4444444444444444444444444444444444444444');
define('advisersTotal', new BigNumber('52500000' + stringDecimals));
define('advisersPeriodAmount', new BigNumber('2291666' + stringDecimals));
define('advisersUnvested', new BigNumber('25000008' + stringDecimals));
define('advisersCliff', 0);
define('advisersPeriodLength', 30 * 24 * 60 * 60);
define('advisersPeriodsNumber', 12);
