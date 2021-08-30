const anchor = require("@project-serum/anchor");
const assert = require('assert');
const {
  TOKEN_PROGRAM_ID,
  getTokenAccount,
  createMint,
  createTokenAccount,
  mintToAccount,
} = require("./utils");

describe("dog-money", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);

  let programSigner;

  it("Is initialized!", async () => {
    const program = anchor.workspace.DogMoney;

    // Add your test here.
    // dataAccount = await anchor.web3.Keypair.generate();
    // console.log(dataAccount._keypair);

    // Create USDC mint
    const usdcMint = await createMint(provider);
    // console.log(provider.wallet.publicKey);

    // program signer PDA - sign transactions for the program
    const [_programSigner, nonce] =
      await anchor.web3.PublicKey.findProgramAddress(
        [usdcMint.toBuffer()],
        program.programId
      );
    programSigner = _programSigner;

    // Associated account PDA - store user data
    const userData = await program.account.userData.associatedAddress(
      provider.wallet.publicKey,
      usdcMint
    );

    const amount = new anchor.BN(5 * 10 ** 6);

    // console.log(provider.wallet.publicKey);
    userUsdc = await createTokenAccount(
      provider,
      usdcMint,
      provider.wallet.publicKey
    );
    await mintToAccount(
      provider,
      usdcMint,
      userUsdc,
      amount,
      provider.wallet.publicKey
    );
    programVault = await createTokenAccount(
      provider,
      usdcMint,
      program.programId
    );

    dogMoneyMint = await createMint(program.provider, programSigner);
    userDogMoney = await createTokenAccount(
      program.provider,
      dogMoneyMint,
      provider.wallet.publicKey
    );

    // You have to switch from snake case to camel case from switching between two
    await program.rpc.initializeUser(amount, nonce, {
      accounts: {
        programSigner,
        userData,
        authority: provider.wallet.publicKey,
        usdcMint,
        userUsdc,
        programVault,
        dogMoneyMint,
        userDogMoney,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      },
    });
    // console.log("Your transaction signature", tx);
    userUsdcData = await getTokenAccount(provider, userUsdc);
    assert.ok(userUsdcData.amount.eq(new anchor.BN(0)));

    userDogMoneyData = await getTokenAccount(provider, userDogMoney);
    // console.log(userDogMoneyData);
    assert.ok(userDogMoneyData.amount.eq(amount.mul(new anchor.BN(1000))));
  });
});
