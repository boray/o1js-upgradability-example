import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from 'o1js';
import { AddMul } from './AddMul';

let proofsEnabled = false;

describe('AddMul', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    senderAccount: Mina.TestPublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: AddMul;

  beforeAll(async () => {
    if (proofsEnabled) await AddMul.compile();
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployerAccount, senderAccount] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    senderKey = senderAccount.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new AddMul(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the `AddMul` smart contract', async () => {
    await localDeploy();
    const num = zkApp.num.get();
    expect(num).toEqual(Field(1));
  });

  it('correctly updates the num state by adding two on the `AddMul` smart contract', async () => {
    await localDeploy();

    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.add_and_update();
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    const updatedNum = zkApp.num.get();
    expect(updatedNum).toEqual(Field(3));
  });

  it('correctly updates the num state by multiplying with two on the `AddMul` smart contract', async () => {
    await localDeploy();

    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.multiply_and_update();
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    const multipliedNum = zkApp.num.get();
    expect(multipliedNum).toEqual(Field(2));
  });
});
