import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { assert } from "chai";
import { Shaker } from "../target/types/shaker";

describe("shaker", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Shaker as Program<Shaker>;

  it("Initializes an expense!", async () => {
    const id = new BN(1);
    const merchantName = "Coffee Shop";
    const amount = new BN(500);

    // Find the program address
    const [expenseAccount, bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("expense"),
        provider.wallet.publicKey.toBuffer(),
        id.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    // Call the initialize_expense function
    await program.rpc.initializeExpense(id, merchantName, amount, {
      accounts: {
        expenseAccount,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });

    // Fetch the account and verify
    const account = await program.account.expenseAccount.fetch(expenseAccount);
    assert.equal(account.id.toString(), id.toString());
    assert.equal(account.merchantName, merchantName);
    assert.equal(account.amount.toString(), amount.toString());
    assert.equal(
      account.owner.toString(),
      provider.wallet.publicKey.toString()
    );
  });
});
