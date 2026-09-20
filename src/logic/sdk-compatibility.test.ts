import {describe, expect, it} from 'vitest';
import {fromBinary} from '@bufbuild/protobuf';
import {IdenaApprovedAds} from 'idena-approved-ads';
import {
    CallContractAttachment,
    contractArgumentFormat,
    hexToUint8Array,
    ProtoAdBurnKeySchema,
    ProtoAdSchema,
    ProtoProfileSchema,
    Transaction,
    transactionType,
} from 'idena-sdk-js-lite';

// Captured with the previously shipped SDK using the public scalar-one key.
const unsigned = '0x0a53080210031810221400000000000000000000000000000000000000012a0609184e72a00032080de0b6b3a764000042230a086d616b65506f737412177b226d657373616765223a227465737420706f7374227d';
const signature = 'be2863de7d75bd62ae3364d3e64ac289a3c69cce4b497d6491b1fd63276fdbdc03ab439fc45e70f7f13755d435af3debef8138400f70b9307a21b6f173f0fd6801';

describe('SDK compatibility', () => {
    it('preserves the contract-call bytes submitted to wallets', () => {
        const payload = new CallContractAttachment();
        payload.method = 'makePost';
        payload.setArgs([{
            format: contractArgumentFormat.String,
            index: 0,
            value: '{"message":"test post"}',
        }]);
        const tx = new Transaction();
        tx.type = transactionType.CallContractTx;
        tx.to = hexToUint8Array('0x0000000000000000000000000000000000000001');
        tx.amount = '10000000000000';
        tx.nonce = 2;
        tx.epoch = 3;
        tx.maxFee = '1000000000000000000';
        tx.payload = payload.toBytes();
        expect(tx.toHex()).toBe(unsigned);
        expect(new Transaction().fromHex(unsigned).toHex()).toBe(unsigned);
    });

    it('preserves deterministic signatures and sender recovery', () => {
        const tx = new Transaction().fromHex(unsigned).sign('1'.padStart(64, '0'));
        expect(tx.signature).toEqual(hexToUint8Array(signature));
        expect(tx.sender).toBe('0x7e5f4552091a69125d5dfcb7b8c2659029395bdf');
        expect(tx.toHex()).toBe(`${unsigned}1241${signature}`);
    });

    it('retains the schemas used by approved advertisements', () => {
        expect(typeof IdenaApprovedAds).toBe('function');
        const ad = fromBinary(ProtoAdSchema, hexToUint8Array('0a0754657374206164120b6465736372697074696f6e1a1368747470733a2f2f6578616d706c652e636f6d22030102032a020405'));
        expect(ad).toMatchObject({title: 'Test ad', desc: 'description', url: 'https://example.com'});
        expect(Array.from(ad.thumb)).toEqual([1, 2, 3]);
        expect(Array.from(ad.media)).toEqual([4, 5]);
        const burn = fromBinary(ProtoAdBurnKeySchema, hexToUint8Array('0a08746573742d636964120b746573742d746172676574'));
        expect(burn).toMatchObject({cid: 'test-cid', target: 'test-target'});
        expect(fromBinary(ProtoProfileSchema, new Uint8Array()).ads).toEqual([]);
    });
});
