import { Context } from "./contracManagers/context";
import { strictEqual, ok, notStrictEqual, rejects } from "assert";
import BigNumber from "bignumber.js";
import accounts from "./accounts/accounts";

contract("TezToTokenPayment()", function () {
  let context: Context;
  let tokenAddress: string;
  let pairAddress: string;
  const aliceAddress: string = accounts.alice.pkh;
  const bobAddress: string = accounts.bob.pkh;
  const tezAmount: number = 1000;
  const tokenAmount: number = 100000;
  const newShares: number = 100;

  before(async () => {
    context = await Context.init([], false, "alice", false);
    await context.setDexFactoryFunction(0, "initialize_exchange");
    await context.setDexFactoryFunction(1, "tez_to_token");
    await context.setDexFactoryFunction(4, "invest_liquidity");
    await context.setDexFactoryFunction(5, "divest_liquidity");
    pairAddress = await context.createPair({
      tezAmount: 100,
      tokenAmount: 100,
    });
    tokenAddress = await context.pairs[0].contract.address;
  });

  it("should exchnge tez to token and update dex state", async function () {
    // // store prev balances
    // await context.updateActor("carol");
    // let carolAddress = await tezos.signer.publicKeyHash();
    // await context.updateActor("bob");
    // let bobAddress = await tezos.signer.publicKeyHash();
    // let pairAddress = context.pairs[0].contract.address;
    // let bobInitTezBalance = await tezos.tz.getBalance(bobAddress);
    // await context.tokens[0].updateStorage({
    //   ledger: [bobAddress, carolAddress],
    // });
    // let bobInitTokenLedger = await context.tokens[0].storage.ledger[bobAddress];
    // let bobInitTokenBalance = bobInitTokenLedger
    //   ? bobInitTokenLedger.balance
    //   : new BigNumber(0);
    // let carolInitTokenLedger = await context.tokens[0].storage.ledger[
    //   carolAddress
    // ];
    // let carolInitTokenBalance = carolInitTokenLedger
    //   ? carolInitTokenLedger.balance
    //   : new BigNumber(0);

    // swap tokens liquidity
    await context.pairs[0].tezToTokenPayment(1, 10000, bobAddress);
    await context.pairs[0].updateStorage();
    console.log(await context.pairs[0].storage);
    await context.pairs[0].divestLiquidity(1, 1, 1000);

    // // checks
    // let bobFinalTezBalance = await tezos.tz.getBalance(bobAddress);
    // await context.tokens[0].updateStorage({
    //   ledger: [bobAddress, pairAddress, carolAddress],
    // });
    // let bobFinalTokenLedger = await context.tokens[0].storage.ledger[
    //   bobAddress
    // ];
    // let bobFinalTokenBalance = bobFinalTokenLedger
    //   ? bobFinalTokenLedger.balance
    //   : new BigNumber(0);
    // let carolFinalTokenBalance = await context.tokens[0].storage.ledger[
    //   carolAddress
    // ].balance;

    // let pairTokenBalance = await context.tokens[0].storage.ledger[pairAddress]
    //   .balance;
    // let pairTezBalance = await tezos.tz.getBalance(pairAddress);

    // // 1. tokens sent to Carol and not Bob
    // strictEqual(
    //   carolInitTokenBalance.toNumber() + minTokens,
    //   carolFinalTokenBalance.toNumber(),
    //   "Tokens not received"
    // );
    // strictEqual(
    //   bobInitTokenBalance.toNumber(),
    //   bobFinalTokenBalance.toNumber(),
    //   "Sender token balance should stay the same"
    // );
    // strictEqual(
    //   pairTokenBalance.toNumber(),
    //   1000000 - minTokens,
    //   "Tokens not sent"
    // );

    // // 2. tez withdrawn and sent to pair contracts
    // ok(
    //   bobInitTezBalance.toNumber() + tezAmount >= bobFinalTezBalance.toNumber(),
    //   "Tez not sent"
    // );
    // strictEqual(
    //   pairTezBalance.toNumber(),
    //   10000 + tezAmount,
    //   "Tez not received"
    // );

    // // 3. new pair state
    // await context.pairs[0].updateStorage();
    // strictEqual(
    //   context.pairs[0].storage.tez_pool.toNumber(),
    //   10000 + tezAmount,
    //   "Tez pool should increment by sent amount"
    // );
    // strictEqual(
    //   context.pairs[0].storage.token_pool.toNumber(),
    //   1000000 - minTokens,
    //   "Token pool should decrement by withdrawn amount"
    // );
    // strictEqual(
    //   context.pairs[0].storage.invariant.toNumber(),
    //   (1000000 - minTokens) * (10000 + tezAmount),
    //   "Inveriant should be calculated properly"
    // );
  });

  it("should revert in case min tokens amount is too low", async function () {
    // create new pair
    await context.flushPairs();
    await context.createPairs();

    let aliceAddress = await tezos.signer.publicKeyHash();
    await context.updateActor("bob");
    let tezAmount = 1000;
    let minTokens = 0;

    // attempt to exchange tokens
    await rejects(
      context.pairs[0].tezToTokenPayment(minTokens, tezAmount, aliceAddress),
      (err) => {
        strictEqual(err.message, "Dex/wrong-params", "Error message mismatch");
        return true;
      },
      "Swap Dex should revert"
    );
  });

  it("should revert in case min tokens amount is too high", async function () {
    let aliceAddress = await tezos.signer.publicKeyHash();
    await context.updateActor("bob");
    let tezAmount = 1000;
    let minTokens = 90663;

    // attempt to exchange tokens
    await rejects(
      context.pairs[0].tezToTokenPayment(minTokens, tezAmount, aliceAddress),
      (err) => {
        strictEqual(err.message, "Dex/high-min-out", "Error message mismatch");
        return true;
      },
      "Swap Dex should revert"
    );
  });

  it("should revert in case tez amount is too low", async function () {
    let aliceAddress = await tezos.signer.publicKeyHash();
    await context.updateActor("bob");
    let tezAmount = 0;
    let minTokens = 1000;

    // attempt to exchange tokens
    await rejects(
      context.pairs[0].tezToTokenPayment(minTokens, tezAmount, aliceAddress),
      (err) => {
        strictEqual(err.message, "Dex/wrong-params", "Error message mismatch");
        return true;
      },
      "Swap Dex should revert"
    );
  });
});
