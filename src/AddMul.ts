import { Field, SmartContract, state, State, method } from 'o1js';

export class AddMul extends SmartContract {
  @state(Field) num = State<Field>();

  init() {
    super.init();
    this.num.set(Field(1));
  }

  @method async add_and_update() {
    const currentState = this.num.getAndRequireEquals();
    const newState = currentState.add(2);
    this.num.set(newState);
  }

  @method async multiply_and_update() {
    const currentState = this.num.getAndRequireEquals();
    const newState = currentState.mul(2);
    this.num.set(newState);
  }
}
