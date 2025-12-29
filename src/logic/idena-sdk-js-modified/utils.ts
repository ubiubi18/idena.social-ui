import BN from 'bn.js';
import Decimal from 'decimal.js';

Decimal.set({ toExpPos: 10000 });

export const DNA_BASE = '1000000000000000000';

function isHexPrefixed(str: string): boolean {
    return str.slice(0, 2) === '0x';
}

export function stripHexPrefix(str: string): string {
    if (typeof str !== 'string') {
        return str;
    }
    return isHexPrefixed(str) ? str.slice(2) : str;
}

export function hexToUint8Array(hexString: string): Uint8Array {
    const str = stripHexPrefix(hexString);

    const arrayBuffer = new Uint8Array(str.length / 2);

    for (let i = 0; i < str.length; i += 2) {
        const byteValue = parseInt(str.substring(i, i + 2), 16);
        arrayBuffer[i / 2] = byteValue;
    }

    return arrayBuffer;
}

export function toHexString(
    byteArray: Uint8Array | number[],
    withPrefix = true,
) {
    return (
        (withPrefix ? '0x' : '') +
    Array.from(byteArray, function (byte) {
        return `0${(byte & 0xff).toString(16)}`.slice(-2);
    }).join('')
    );
}

export function floatStringToDna(value: string) {
    const decimalValue = new Decimal(value).mul(new Decimal(DNA_BASE)).toString();
    return new BN(decimalValue);
}

export function dnaToFloatString(value: BN | string) {
    const bn = new BN(value);
    return new Decimal(bn.toString(10)).div(new Decimal(DNA_BASE)).toString();
}

export function calculateGasCost(feePerGas: BN | string, gas: number): string {
    const bn = new BN(feePerGas);
    return bn.mul(new BN(gas)).toString();
}
