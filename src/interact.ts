import { AccountUpdate, Mina, PrivateKey } from 'o1js';
import { Add } from './Add.js';
import { AddMul } from './AddMul.js';

const Local = await Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);

let tx;
let [bob] = Local.testAccounts;

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

let zkApp = new Add(zkAppAddress);
if (Local.proofsEnabled) {
  console.time('compile add');
  await Add.compile();
  console.timeEnd('compile add');
  console.time('compile addmul');
  await AddMul.compile();
  console.timeEnd('compile addmul');
}

console.time('deploy');
tx = await Mina.transaction(bob, async () => {
  AccountUpdate.fundNewAccount(bob);
  await zkApp.deploy();
})
  .prove()
  .sign([bob.key, zkAppPrivateKey])
  .send();
console.log(tx.toPretty());
console.timeEnd('deploy');

console.time('update num');
tx = await Mina.transaction(bob, async () => {
  await zkApp.update();
})
  .sign([bob.key])
  .prove()
  .send();
console.log(tx.toPretty());
console.timeEnd('update num');

console.time('upgrade zkapp');
let updated_zkApp = new AddMul(zkAppAddress);

tx = await Mina.transaction(bob, async () => {
  updated_zkApp.deploy();
})
  .prove()
  .sign([bob.key, zkAppPrivateKey])
  .send();
console.log(tx.toPretty());
console.timeEnd('upgrade zkapp');

console.time('add two to num and update');
tx = await Mina.transaction(bob, async () => {
  await updated_zkApp.add_and_update();
})
  .sign([bob.key])
  .prove()
  .send();
console.log(tx.toPretty());
console.timeEnd('add two to num and update');

console.time('multiply num with two and update');
tx = await Mina.transaction(bob, async () => {
  await updated_zkApp.multiply_and_update();
})
  .sign([bob.key])
  .prove()
  .send();
console.log(tx.toPretty());
console.timeEnd('multiply num with two and update');
