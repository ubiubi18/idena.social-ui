import BN from 'bn.js';
import Decimal from 'decimal.js';
import {
    dnaToFloatString,
    floatStringToDna,
    hexToUint8Array,
    toHexString,
} from '../../../../utils';
import { type ContractArgument, type ContractArgumentFormat, contractArgumentFormat } from './types';

Decimal.set({ toExpPos: 10000 });

export function argumentFromBytes(
    format: ContractArgumentFormat,
    index: number,
    bytes: Uint8Array,
): ContractArgument {
    if (bytes.length === 0) {
        return {
            format,
            index,
            value: null,
        };
    }
    switch (format) {
    case 'byte': {
        return {
            format: contractArgumentFormat.Byte,
            index: index,
            value: bytes[0],
        };
    }
    case 'int8': {
        return {
            format: contractArgumentFormat.Int8,
            index: index,
            value: bytes[0],
        };
    }
    case 'uint64': {
        const res = Buffer.from(bytes).readBigUint64LE();
        return {
            format: contractArgumentFormat.Uint64,
            index: index,
            value: res.toString(10),
        };
    }
    case 'int64': {
        const res = Buffer.from(bytes).readBigInt64LE();
        return {
            format: contractArgumentFormat.Int64,
            index: index,
            value: res.toString(10),
        };
    }
    case 'string': {
        const res = utf8ByteArrayToString(bytes);
        return {
            format: contractArgumentFormat.String,
            index: index,
            value: res,
        };
    }
    case 'bigint': {
        const res = new BN(bytes);
        return {
            format: contractArgumentFormat.Bigint,
            index: index,
            value: res.toString(10),
        };
    }
    case 'hex': {
        return {
            format: contractArgumentFormat.Hex,
            index: index,
            value: toHexString(bytes),
        };
    }
    case 'dna': {
        const bn = new BN(bytes);
        return {
            format: contractArgumentFormat.Dna,
            index: index,
            value: dnaToFloatString(bn),
        };
    }
    default: {
        return {
            format: contractArgumentFormat.Default,
            index: index,
            value: toHexString(bytes),
        };
    }
    }
}

export function argumentsFromBytes(
    formats: ContractArgumentFormat[],
    bytes: Uint8Array[],
): ContractArgument[] {
    return formats.map((format, idx) =>
        argumentFromBytes(format, idx, bytes[idx] || new Uint8Array()),
    );
}

export function argumentToBytes(data: ContractArgument): Uint8Array {
    try {
        switch (data.format) {
        case 'byte': {
            const val = parseInt(data.value, 10);
            if (val >= 0 && val <= 255) {
                return new Uint8Array([val]);
            }
            throw new Error('invalid byte value');
        }
        case 'int8': {
            const val = parseInt(data.value, 10);
            if (val >= 0 && val <= 255) {
                return new Uint8Array([val]);
            }
            throw new Error('invalid int8 value');
        }
        case 'uint64': {
            const res = new BN(data.value);
            if (res.isNeg()) throw new Error('invalid uint64 value');
            const buf = Buffer.alloc(8);
            buf.writeBigUint64LE(BigInt(res.toString()));
            return new Uint8Array(buf);
        }
        case 'int64': {
            const buf = Buffer.alloc(8);
            buf.writeBigInt64LE(BigInt(new BN(data.value).toString()));
            return new Uint8Array(buf);
        }
        case 'string': {
            return stringToUtf8ByteArray(data.value);
        }
        case 'bigint': {
            return new Uint8Array(new BN(data.value).toArray());
        }
        case 'hex': {
            return new Uint8Array([...hexToUint8Array(data.value)]);
        }
        case 'dna': {
            return new Uint8Array(floatStringToDna(data.value).toArray());
        }
        default: {
            return new Uint8Array([...hexToUint8Array(data.value)]);
        }
        }
    } catch (e) {
        throw new Error(
            `cannot parse ${data.format} at index ${data.index}: ${
                (e as Error)?.message
            }`,
        );
    }
}

export function argumentsToBytes(args: ContractArgument[]): Uint8Array[] {
    const maxIndex = Math.max(...args.map((x) => x.index));

    const result: Uint8Array[] = new Array(maxIndex).fill(null);

    args.forEach((element) => {
        result[element.index] = argumentToBytes(element);
    });

    return result;
}

/**
 * Converts a JS string to a UTF-8 "byte" array.
 * @param {string} str 16-bit unicode string.
 * @return {!Uint8Array} UTF-8 byte array.
 */
function stringToUtf8ByteArray(str: string): Uint8Array {
    const out = [];
    let p = 0;
    for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c < 128) {
            out[p++] = c;
        } else if (c < 2048) {
            out[p++] = (c >> 6) | 192;
            out[p++] = (c & 63) | 128;
        } else if (
            (c & 0xfc00) == 0xd800 &&
      i + 1 < str.length &&
      (str.charCodeAt(i + 1) & 0xfc00) == 0xdc00
        ) {
            // Surrogate Pair
            c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
            out[p++] = (c >> 18) | 240;
            out[p++] = ((c >> 12) & 63) | 128;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        } else {
            out[p++] = (c >> 12) | 224;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
    }
    return new Uint8Array(out);
}

/**
 * Converts a UTF-8 byte array to JavaScript's 16-bit Unicode.
 * @param {Uint8Array} bytes UTF-8 byte array.
 * @return {string} 16-bit Unicode string.
 */
function utf8ByteArrayToString(bytes: Uint8Array): string {
    const out = [];
    let pos = 0;
    let c = 0;
    while (pos < bytes.length) {
        const c1 = bytes[pos++] || 0;
        if (c1 < 128) {
            out[c++] = String.fromCharCode(c1);
        } else if (c1 > 191 && c1 < 224) {
            const c2 = bytes[pos++] || 0;
            out[c++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
        } else if (c1 > 239 && c1 < 365) {
            // Surrogate Pair
            const c2 = bytes[pos++] || 0;
            const c3 = bytes[pos++] || 0;
            const c4 = bytes[pos++] || 0;
            const u =
        (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) -
        0x10000;
            out[c++] = String.fromCharCode(0xd800 + (u >> 10));
            out[c++] = String.fromCharCode(0xdc00 + (u & 1023));
        } else {
            const c2 = bytes[pos++] || 0;
            const c3 = bytes[pos++] || 0;
            out[c++] = String.fromCharCode(
                ((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63),
            );
        }
    }
    return out.join('');
}
