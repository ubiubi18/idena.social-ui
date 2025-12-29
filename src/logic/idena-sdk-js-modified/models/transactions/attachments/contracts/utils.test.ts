import { contractArgumentFormat } from './types';
import { argumentFromBytes, argumentToBytes } from './utils';

describe('convert args to bytes', () => {
    it('byte to bytes', () => {
        expect(
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.Byte,
                value: 10,
            }),
        ).toEqual(new Uint8Array([10]));

        expect(
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.Byte,
                value: 255,
            }),
        ).toStrictEqual(new Uint8Array([255]));

        expect(() =>
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.Byte,
                value: 500,
            }),
        ).toThrow(/cannot parse byte at index 0/);
    });

    it('int8 to bytes', () => {
        expect(
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.Int8,
                value: 0,
            }),
        ).toStrictEqual(new Uint8Array([0]));

        expect(
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.Int8,
                value: 17,
            }),
        ).toStrictEqual(new Uint8Array([17]));

        expect(() =>
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.Int8,
                value: 1231,
            }),
        ).toThrow(/cannot parse int8 at index 0/);
    });

    it('string to bytes', () => {
        expect(
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.String,
                value: 'qwe-+!123',
            }),
        ).toStrictEqual(new Uint8Array([113, 119, 101, 45, 43, 33, 49, 50, 51]));

        expect(
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.String,
                value: '',
            }),
        ).toStrictEqual(new Uint8Array());
    });

    it('hex to bytes', () => {
        expect(
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.Hex,
                value: '0x1212ff',
            }),
        ).toStrictEqual(new Uint8Array([18, 18, 255]));
    });

    it('dna to bytes', () => {
        expect(
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.Dna,
                value: '1.123',
            }),
        ).toStrictEqual(new Uint8Array([15, 149, 178, 140, 210, 195, 128, 0]));

        expect(
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.Dna,
                value: '0.123456789123456789',
            }),
        ).toStrictEqual(new Uint8Array([1, 182, 155, 75, 172, 208, 95, 21]));
    });

    it('uint64 to bytes', () => {
        expect(
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.Uint64,
                value: '9223372036854775807',
            }),
        ).toStrictEqual(new Uint8Array([255, 255, 255, 255, 255, 255, 255, 127]));

        expect(() =>
            argumentToBytes({
                index: 1,
                format: contractArgumentFormat.Uint64,
                value: -1231,
            }),
        ).toThrow(/cannot parse uint64 at index 1/);
    });

    it('int64 to bytes', () => {
        expect(
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.Int64,
                value: '9223372036854775807',
            }),
        ).toStrictEqual(new Uint8Array([255, 255, 255, 255, 255, 255, 255, 127]));

        expect(
            argumentToBytes({
                index: 0,
                format: contractArgumentFormat.Int64,
                value: '-9223372036854775808',
            }),
        ).toStrictEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 128]));
    });
});

describe('convert bytes to args', () => {
    it('bytes to byte', () => {
        const value = 15;
        expect(
            argumentFromBytes(
                contractArgumentFormat.Byte,
                0,
                argumentToBytes({
                    index: 0,
                    format: contractArgumentFormat.Byte,
                    value: value,
                }),
            ).value,
        ).toStrictEqual(value);

        const value2 = 300;

        expect(
            () =>
                argumentFromBytes(
                    contractArgumentFormat.Byte,
                    0,
                    argumentToBytes({
                        index: 0,
                        format: contractArgumentFormat.Byte,
                        value: value2,
                    }),
                ).value,
        ).toThrow(/cannot parse byte at index 0/);
    });

    it('bytes to byte', () => {
        const value = 55;
        expect(
            argumentFromBytes(
                contractArgumentFormat.Int8,
                0,
                argumentToBytes({
                    index: 0,
                    format: contractArgumentFormat.Int8,
                    value: value,
                }),
            ).value,
        ).toStrictEqual(value);

        const value2 = 555;

        expect(
            () =>
                argumentFromBytes(
                    contractArgumentFormat.Int8,
                    0,
                    argumentToBytes({
                        index: 0,
                        format: contractArgumentFormat.Int8,
                        value: value2,
                    }),
                ).value,
        ).toThrow(/cannot parse int8 at index 0/);
    });

    it('bytes to uint64', () => {
        const value = '9223372036854775807';
        expect(
            argumentFromBytes(
                contractArgumentFormat.Uint64,
                0,
                argumentToBytes({
                    index: 0,
                    format: contractArgumentFormat.Uint64,
                    value: value,
                }),
            ).value,
        ).toStrictEqual(value);

        const value2 = '-9223372036854775808';

        expect(
            () =>
                argumentFromBytes(
                    contractArgumentFormat.Uint64,
                    0,
                    argumentToBytes({
                        index: 0,
                        format: contractArgumentFormat.Uint64,
                        value: value2,
                    }),
                ).value,
        ).toThrow(/cannot parse uint64 at index 0/);
    });

    it('bytes to int64', () => {
        const value = '9223372036854775807';
        expect(
            argumentFromBytes(
                contractArgumentFormat.Int64,
                0,
                argumentToBytes({
                    index: 0,
                    format: contractArgumentFormat.Int64,
                    value: value,
                }),
            ).value,
        ).toStrictEqual(value);

        const value2 = '-9223372036854775808';

        expect(
            argumentFromBytes(
                contractArgumentFormat.Int64,
                0,
                argumentToBytes({
                    index: 0,
                    format: contractArgumentFormat.Int64,
                    value: value2,
                }),
            ).value,
        ).toStrictEqual(value2);
    });

    it('bytes to string', () => {
        const value = 'helow world idena';
        expect(
            argumentFromBytes(
                contractArgumentFormat.String,
                0,
                argumentToBytes({
                    index: 0,
                    format: contractArgumentFormat.String,
                    value: value,
                }),
            ).value,
        ).toStrictEqual(value);

        const value2 = 'abc';

        expect(
            argumentFromBytes(
                contractArgumentFormat.String,
                0,
                argumentToBytes({
                    index: 0,
                    format: contractArgumentFormat.String,
                    value: value2,
                }),
            ).value,
        ).toStrictEqual(value2);
    });

    it('bytes to bigint', () => {
        const value = '123123123123123123123';
        expect(
            argumentFromBytes(
                contractArgumentFormat.Bigint,
                0,
                argumentToBytes({
                    index: 0,
                    format: contractArgumentFormat.Bigint,
                    value: value,
                }),
            ).value,
        ).toStrictEqual(value);

        const value2 = '0';

        expect(
            argumentFromBytes(
                contractArgumentFormat.Bigint,
                0,
                argumentToBytes({
                    index: 0,
                    format: contractArgumentFormat.Bigint,
                    value: value2,
                }),
            ).value,
        ).toStrictEqual(value2);
    });

    it('bytes to hex', () => {
        const value = '0xaabbcc001122';
        expect(
            argumentFromBytes(
                contractArgumentFormat.Hex,
                0,
                argumentToBytes({
                    index: 0,
                    format: contractArgumentFormat.Hex,
                    value: value,
                }),
            ).value,
        ).toStrictEqual(value);

        const value2 = '0x0';

        expect(
            argumentFromBytes(
                contractArgumentFormat.Hex,
                0,
                argumentToBytes({
                    index: 0,
                    format: contractArgumentFormat.Hex,
                    value: value2,
                }),
            ).value,
        ).toStrictEqual(null);
    });

    it('bytes to hex', () => {
        const value = '1.123456789123456789';
        expect(
            argumentFromBytes(
                contractArgumentFormat.Dna,
                0,
                argumentToBytes({
                    index: 0,
                    format: contractArgumentFormat.Dna,
                    value: value,
                }),
            ).value,
        ).toStrictEqual(value);

        const value2 = '500.005';

        expect(
            argumentFromBytes(
                contractArgumentFormat.Dna,
                0,
                argumentToBytes({
                    index: 0,
                    format: contractArgumentFormat.Dna,
                    value: value2,
                }),
            ).value,
        ).toStrictEqual(value2);
    });
});
