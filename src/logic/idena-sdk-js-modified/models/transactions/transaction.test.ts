import { BN } from 'bn.js';
import { transactionType } from '..';
import { hexToUint8Array } from '../..';
import { StoreToIpfsAttachment } from './attachments/storeToIpfsAttachment';
import { Transaction } from './transaction';

const __ADDRESS__ = '0x834cbf0eb6ff61d0b929af89b140ccd4e4f230fd';
const __PRIVATE_KEY__ = 'd28778329bdd4d8a9b6addaed6ad5ecfc8aa9b40cdd4b09bbb409b976b026ca2';

describe('transaction', () => {
    it('can be encoded and decoded', () => {
        const tx = new Transaction({
            epoch: 5,
            nonce: 11,
            type: transactionType.ActivationTx,
            to: '0x010203',
            amount: new BN(10),
            maxFee: new BN(11),
            tips: new BN(12),
            payload: new Uint8Array([1, 2, 3]),
        });

        const parsed = new Transaction().fromBytes(tx.toBytes());

        expect(parsed.epoch).toBe(tx.epoch);
        expect(parsed.nonce).toBe(tx.nonce);
        expect(parsed.type).toBe(tx.type);
        expect(parsed.to).toBe(tx.to);
        expect(parsed.amount?.toString()).toBe(tx.amount?.toString());
        expect(parsed.maxFee?.toString()).toBe(tx.maxFee?.toString());
        expect(parsed.tips?.toString()).toBe(tx.tips?.toString());
        expect(parsed.payload).toStrictEqual(tx.payload);
    });

    it('signature test', () => {
        const tx = new Transaction({
            epoch: 101,
            nonce: 55,
            type: transactionType.SubmitFlipTx,
            to: '0x01351c321aa2a8832c32c00745e352eb8a6782bc',
            amount: new BN(999),
            maxFee: new BN(555),
            tips: new BN(111),
            payload: new Uint8Array([0x11, 0x12, 0x13]),
        }).sign(__PRIVATE_KEY__);

        const nodeSignature =
      'e8bb5eafb5bc6928b687e8f775044ee5c55a2d060c5287bc94ffcc8900a4819b3108e811c57377b7658f5d45f2051302e94b1df44cbf0fad98337abea67fae9701';

        expect(tx.signature).toStrictEqual(hexToUint8Array(nodeSignature));
        expect(tx.sender).toBe(__ADDRESS__);
    });

    it.only('signature test 2', () => {
        const tx = new Transaction({
            epoch: 55,
            nonce: 10,
            amount: new BN(500),
            payload: new Uint8Array([1, 2, 3]),
        }).sign(__PRIVATE_KEY__);

        const nodeSignature =
      '1de3487dbb3cf41bb5d25553877fa2d57bdf6c3079da73690f8cac10941f5e5a50ccbd2690fce9f81f6a08c7c1eeef37871a731a9cea33483d9b8203cef21afe01';

        expect(tx.signature).toStrictEqual(hexToUint8Array(nodeSignature));
        expect(tx.sender).toBe(__ADDRESS__);
    });

    it.only('signature test 3', () => {
        const tx = new Transaction().fromHex(
            '0a290801100c180f2a09056bc75e2d6310000032082676179a205d70a03a010042090a0105120101120101',
        );

        tx.sign(__PRIVATE_KEY__);

        const nodeSignature =
      'af1e2c0a79d56fee2ca90af0a45706f48a163e2db29f72bbed93c2404265cd913917d884643c42c49e3b6c45ff295971d99f9dbecf7ab23cf52de370c8fee3c001';

        expect(tx.signature).toStrictEqual(hexToUint8Array(nodeSignature));
        expect(tx.sender).toBe(__ADDRESS__);
    });

    it('calculate gas', () => {
        const tx = new Transaction({
            nonce: 100,
            epoch: 50,
            amount: '100000000',
            payload: [1, 2, 3, 4, 5],
        });

        expect(tx.gas).toBe(860);

        const tx2 = new Transaction({
            nonce: 100,
            epoch: 50,
            type: transactionType.DeleteFlipTx,
            amount: '100000000',
            payload: [1, 2, 3, 4, 5],
        });

        expect(tx2.gas).toBe(1229680);

        const attachment = new StoreToIpfsAttachment({ size: 5 });

        const tx3 = new Transaction({
            nonce: 1,
            epoch: 1,
            type: transactionType.StoreToIpfsTx,
            payload: attachment.toBytes(),
        });

        expect(tx3.gas).toBe(2770);
    });
});
