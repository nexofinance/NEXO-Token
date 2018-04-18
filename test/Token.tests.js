const Token = artifacts.require('./mocks/TokenMock.sol');

const assertRevert = require('./helpers/AssertRevert');

contract('Token', function ([owner, recipient, anotherAccount]) {
	const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

	beforeEach(async function () {
		this.sut = await Token.new(owner, 100);
	});

	describe('total supply', function () {
		it('returns the total amount of tokens', async function () {
			const totalSupply = await this.sut.totalSupply();

			assert.equal(totalSupply, 100);
		});
	});

	describe('balanceOf', function () {
		describe('when the requested account has no tokens', function () {
			it('returns zero', async function () {
				const balance = await this.sut.balanceOf.call(anotherAccount);

				assert.equal(balance, 0);
			});
		});

		describe('when the requested account has some tokens', function () {
			it('returns the total amount of tokens', async function () {
				const balance = await this.sut.balanceOf.call(owner);

				assert.equal(balance, 100);
			});
		});
	});

	describe('transfer', function () {
		describe('when the recipient is not the zero address', function () {
			const to = recipient;

			describe('when the sender does not have enough balance', function () {
				const amount = 101;

				it('reverts', async function () {
					await assertRevert(this.sut.transfer(to, amount, { from: owner }));
				});
			});

			describe('when the sender has enough balance', function () {
				const amount = 100;

				it('transfers the requested amount', async function () {
					await this.sut.transfer(to, amount, { from: owner });

					const senderBalance = await this.sut.balanceOf(owner);
					assert.equal(senderBalance, 0);

					const recipientBalance = await this.sut.balanceOf(to);
					assert.equal(recipientBalance, amount);
				});

				it('emits a transfer event', async function () {
					const { logs } = await this.sut.transfer(to, amount, { from: owner });

					assert.equal(logs.length, 1);
					assert.equal(logs[0].event, 'Transfer');
					assert.equal(logs[0].args.from, owner);
					assert.equal(logs[0].args.to, to);
					assert(logs[0].args.value.eq(amount));
				});
			});
		});

		describe('when the recipient is the zero address', function () {
			const to = ZERO_ADDRESS;

			it('reverts', async function () {
				await assertRevert(this.sut.transfer(to, 100, { from: owner }));
			});
		});
	});

	describe('transferERC20Token', function () {
		it('withdraw mistakenly sent tokens from the contract', async function () {
			let balance = await this.sut.balanceOf(this.sut.address);
			assert.equal(balance.toNumber(), 0, 'Inititally the contract should not have any tokens');
			await this.sut.transfer(this.sut.address, 10, { from: owner });

			balance = await this.sut.balanceOf(this.sut.address);
			assert.equal(balance.toNumber(), 10, 'Contract was supposed to receive 10 tokens');

			let recipientBalance = await this.sut.balanceOf(recipient);
			assert.equal(recipientBalance.toNumber(), 0, 'Inititally the recipient should not have any tokens');

			await this.sut.transferERC20Token(this.sut.address, recipient, 10);
			recipientBalance = await this.sut.balanceOf(recipient);
			assert.equal(recipientBalance.toNumber(), 10, 'The recipient was supposed to receive 10 tokens');

			balance = await this.sut.balanceOf(this.sut.address);
			assert.equal(balance.toNumber(), 0, 'The contract should not have any tokens anymore');
		});
	});

	describe('approve', function () {
		describe('when the spender is not the zero address', function () {
			const spender = recipient;

			describe('when the sender has enough balance', function () {
				const amount = 100;

				it('emits an approval event', async function () {
					const { logs } = await this.sut.approve(spender, amount, { from: owner });

					assert.equal(logs.length, 1);
					assert.equal(logs[0].event, 'Approval');
					assert.equal(logs[0].args.owner, owner);
					assert.equal(logs[0].args.spender, spender);
					assert(logs[0].args.value.eq(amount));
				});

				describe('when there was no approved amount before', function () {
					it('approves the requested amount', async function () {
						await this.sut.approve(spender, amount, { from: owner });

						const allowance = await this.sut.allowance(owner, spender);
						assert.equal(allowance, amount);
					});
				});

				describe('when the spender had an approved amount', function () {
					beforeEach(async function () {
						await this.sut.approve(spender, 1, { from: owner });
					});

					it('approves the requested amount and replaces the previous one', async function () {
						await this.sut.approve(spender, amount, { from: owner });

						const allowance = await this.sut.allowance(owner, spender);
						assert.equal(allowance, amount);
					});
				});
			});

			describe('when the sender does not have enough balance', function () {
				const amount = 101;

				it('emits an approval event', async function () {
					const { logs } = await this.sut.approve(spender, amount, { from: owner });

					assert.equal(logs.length, 1);
					assert.equal(logs[0].event, 'Approval');
					assert.equal(logs[0].args.owner, owner);
					assert.equal(logs[0].args.spender, spender);
					assert(logs[0].args.value.eq(amount));
				});

				describe('when there was no approved amount before', function () {
					it('approves the requested amount', async function () {
						await this.sut.approve(spender, amount, { from: owner });

						const allowance = await this.sut.allowance(owner, spender);
						assert.equal(allowance, amount);
					});
				});

				describe('when the spender had an approved amount', function () {
					beforeEach(async function () {
						await this.sut.approve(spender, 1, { from: owner });
					});

					it('approves the requested amount and replaces the previous one', async function () {
						await this.sut.approve(spender, amount, { from: owner });

						const allowance = await this.sut.allowance(owner, spender);
						assert.equal(allowance, amount);
					});
				});
			});
		});

		describe('when the spender is the zero address', function () {
			const amount = 100;
			const spender = ZERO_ADDRESS;

			it('approves the requested amount', async function () {
				await this.sut.approve(spender, amount, { from: owner });

				const allowance = await this.sut.allowance(owner, spender);
				assert.equal(allowance, amount);
			});

			it('emits an approval event', async function () {
				const { logs } = await this.sut.approve(spender, amount, { from: owner });

				assert.equal(logs.length, 1);
				assert.equal(logs[0].event, 'Approval');
				assert.equal(logs[0].args.owner, owner);
				assert.equal(logs[0].args.spender, spender);
				assert(logs[0].args.value.eq(amount));
			});
		});
	});

	describe('transfer from', function () {
		const spender = recipient;

		describe('when the recipient is not the zero address', function () {
			const to = anotherAccount;

			describe('when the spender has enough approved balance', function () {
				beforeEach(async function () {
					await this.sut.approve(spender, 100, { from: owner });
				});

				describe('when the owner has enough balance', function () {
					const amount = 100;

					it('transfers the requested amount', async function () {
						await this.sut.transferFrom(owner, to, amount, { from: spender });

						const senderBalance = await this.sut.balanceOf(owner);
						assert.equal(senderBalance, 0);

						const recipientBalance = await this.sut.balanceOf(to);
						assert.equal(recipientBalance, amount);
					});

					it('decreases the spender allowance', async function () {
						await this.sut.transferFrom(owner, to, amount, { from: spender });

						const allowance = await this.sut.allowance(owner, spender);
						assert(allowance.eq(0));
					});

					it('emits a transfer event', async function () {
						const { logs } = await this.sut.transferFrom(owner, to, amount, { from: spender });

						assert.equal(logs.length, 1);
						assert.equal(logs[0].event, 'Transfer');
						assert.equal(logs[0].args.from, owner);
						assert.equal(logs[0].args.to, to);
						assert(logs[0].args.value.eq(amount));
					});
				});

				describe('when the owner does not have enough balance', function () {
					const amount = 101;

					it('reverts', async function () {
						await assertRevert(this.sut.transferFrom(owner, to, amount, { from: spender }));
					});
				});
			});

			describe('when the spender does not have enough approved balance', function () {
				beforeEach(async function () {
					await this.sut.approve(spender, 99, { from: owner });
				});

				describe('when the owner has enough balance', function () {
					const amount = 100;

					it('reverts', async function () {
						await assertRevert(this.sut.transferFrom(owner, to, amount, { from: spender }));
					});
				});

				describe('when the owner does not have enough balance', function () {
					const amount = 101;

					it('reverts', async function () {
						await assertRevert(this.sut.transferFrom(owner, to, amount, { from: spender }));
					});
				});
			});
		});

		describe('when the recipient is the zero address', function () {
			const amount = 100;
			const to = ZERO_ADDRESS;

			beforeEach(async function () {
				await this.sut.approve(spender, amount, { from: owner });
			});

			it('reverts', async function () {
				await assertRevert(this.sut.transferFrom(owner, to, amount, { from: spender }));
			});
		});
	});

	describe('decrease approval', function () {
		describe('when the spender is not the zero address', function () {
			const spender = recipient;

			describe('when the sender has enough balance', function () {
				const amount = 100;

				it('emits an approval event', async function () {
					const { logs } = await this.sut.decreaseApproval(spender, amount, { from: owner });

					assert.equal(logs.length, 1);
					assert.equal(logs[0].event, 'Approval');
					assert.equal(logs[0].args.owner, owner);
					assert.equal(logs[0].args.spender, spender);
					assert(logs[0].args.value.eq(0));
				});

				describe('when there was no approved amount before', function () {
					it('keeps the allowance to zero', async function () {
						await this.sut.decreaseApproval(spender, amount, { from: owner });

						const allowance = await this.sut.allowance(owner, spender);
						assert.equal(allowance, 0);
					});
				});

				describe('when the spender had an approved amount', function () {
					beforeEach(async function () {
						await this.sut.approve(spender, amount + 1, { from: owner });
					});

					it('decreases the spender allowance subtracting the requested amount', async function () {
						await this.sut.decreaseApproval(spender, amount, { from: owner });

						const allowance = await this.sut.allowance(owner, spender);
						assert.equal(allowance, 1);
					});
				});
			});

			describe('when the sender does not have enough balance', function () {
				const amount = 101;

				it('emits an approval event', async function () {
					const { logs } = await this.sut.decreaseApproval(spender, amount, { from: owner });

					assert.equal(logs.length, 1);
					assert.equal(logs[0].event, 'Approval');
					assert.equal(logs[0].args.owner, owner);
					assert.equal(logs[0].args.spender, spender);
					assert(logs[0].args.value.eq(0));
				});

				describe('when there was no approved amount before', function () {
					it('keeps the allowance to zero', async function () {
						await this.sut.decreaseApproval(spender, amount, { from: owner });

						const allowance = await this.sut.allowance(owner, spender);
						assert.equal(allowance, 0);
					});
				});

				describe('when the spender had an approved amount', function () {
					beforeEach(async function () {
						await this.sut.approve(spender, amount + 1, { from: owner });
					});

					it('decreases the spender allowance subtracting the requested amount', async function () {
						await this.sut.decreaseApproval(spender, amount, { from: owner });

						const allowance = await this.sut.allowance(owner, spender);
						assert.equal(allowance, 1);
					});
				});
			});
		});

		describe('when the spender is the zero address', function () {
			const amount = 100;
			const spender = ZERO_ADDRESS;

			it('decreases the requested amount', async function () {
				await this.sut.decreaseApproval(spender, amount, { from: owner });

				const allowance = await this.sut.allowance(owner, spender);
				assert.equal(allowance, 0);
			});

			it('emits an approval event', async function () {
				const { logs } = await this.sut.decreaseApproval(spender, amount, { from: owner });

				assert.equal(logs.length, 1);
				assert.equal(logs[0].event, 'Approval');
				assert.equal(logs[0].args.owner, owner);
				assert.equal(logs[0].args.spender, spender);
				assert(logs[0].args.value.eq(0));
			});
		});
	});

	describe('increase approval', function () {
		const amount = 100;

		describe('when the spender is not the zero address', function () {
			const spender = recipient;

			describe('when the sender has enough balance', function () {
				it('emits an approval event', async function () {
					const { logs } = await this.sut.increaseApproval(spender, amount, { from: owner });

					assert.equal(logs.length, 1);
					assert.equal(logs[0].event, 'Approval');
					assert.equal(logs[0].args.owner, owner);
					assert.equal(logs[0].args.spender, spender);
					assert(logs[0].args.value.eq(amount));
				});

				describe('when there was no approved amount before', function () {
					it('approves the requested amount', async function () {
						await this.sut.increaseApproval(spender, amount, { from: owner });

						const allowance = await this.sut.allowance(owner, spender);
						assert.equal(allowance, amount);
					});
				});

				describe('when the spender had an approved amount', function () {
					beforeEach(async function () {
						await this.sut.approve(spender, 1, { from: owner });
					});

					it('increases the spender allowance adding the requested amount', async function () {
						await this.sut.increaseApproval(spender, amount, { from: owner });

						const allowance = await this.sut.allowance(owner, spender);
						assert.equal(allowance, amount + 1);
					});
				});
			});

			describe('when the sender does not have enough balance', function () {
				const amount = 101;

				it('emits an approval event', async function () {
					const { logs } = await this.sut.increaseApproval(spender, amount, { from: owner });

					assert.equal(logs.length, 1);
					assert.equal(logs[0].event, 'Approval');
					assert.equal(logs[0].args.owner, owner);
					assert.equal(logs[0].args.spender, spender);
					assert(logs[0].args.value.eq(amount));
				});

				describe('when there was no approved amount before', function () {
					it('approves the requested amount', async function () {
						await this.sut.increaseApproval(spender, amount, { from: owner });

						const allowance = await this.sut.allowance(owner, spender);
						assert.equal(allowance, amount);
					});
				});

				describe('when the spender had an approved amount', function () {
					beforeEach(async function () {
						await this.sut.approve(spender, 1, { from: owner });
					});

					it('increases the spender allowance adding the requested amount', async function () {
						await this.sut.increaseApproval(spender, amount, { from: owner });

						const allowance = await this.sut.allowance(owner, spender);
						assert.equal(allowance, amount + 1);
					});
				});
			});
		});

		describe('when the spender is the zero address', function () {
			const spender = ZERO_ADDRESS;

			it('approves the requested amount', async function () {
				await this.sut.increaseApproval(spender, amount, { from: owner });

				const allowance = await this.sut.allowance(owner, spender);
				assert.equal(allowance, amount);
			});

			it('emits an approval event', async function () {
				const { logs } = await this.sut.increaseApproval(spender, amount, { from: owner });

				assert.equal(logs.length, 1);
				assert.equal(logs[0].event, 'Approval');
				assert.equal(logs[0].args.owner, owner);
				assert.equal(logs[0].args.spender, spender);
				assert(logs[0].args.value.eq(amount));
			});
		});
	});
});