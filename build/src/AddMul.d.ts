import { SmartContract, State } from 'o1js';
export declare class AddMul extends SmartContract {
    num: State<import("o1js/dist/node/lib/provable/field").Field>;
    init(): void;
    add_and_update(): Promise<void>;
    multiply_and_update(): Promise<void>;
}
