import sha3 from 'js-sha3';
import { hexToUint8Array, toHexString } from './utils';
import secp256k1 from 'secp256k1';

function getKeyArray(key: Uint8Array | number[] | string): Uint8Array {
    return typeof key === 'string' ? hexToUint8Array(key) : new Uint8Array(key);
}

export function privateKeyToPublicKey(
    key: Uint8Array | number[] | string,
    withPrefix = false,
) {
    const pubKey = secp256k1.publicKeyCreate(getKeyArray(key), false);
    return toHexString(pubKey, withPrefix);
}

export function publicKeyToAddress(
    publicKey: Uint8Array | number[] | string,
    withPrefix = true,
) {
    return toHexString(
        sha3.keccak_256.array(getKeyArray(publicKey).slice(1)).slice(12),
        withPrefix,
    );
}

export function privateKeyToAddress(
    key: Uint8Array | number[] | string,
    withPrefix = true,
) {
    if (!key) {
        return '0x0000000000000000000000000000000000000000';
    }

    const pubKey = secp256k1.publicKeyCreate(getKeyArray(key), false);

    return publicKeyToAddress(pubKey, withPrefix);
}

export function sender(
    data: Uint8Array | number[],
    signature: Uint8Array | number[],
    withPrefix = true,
) {
    const hash = sha3.keccak_256.array(data);
    const pubKey = secp256k1.ecdsaRecover(
        new Uint8Array(signature).slice(0, -1),
        Number(signature[signature.length - 1]),
        new Uint8Array(hash),
        false,
    );

    return publicKeyToAddress(pubKey, withPrefix);
}

export function sign(
    data: Uint8Array | number[],
    key: Uint8Array | number[] | string,
): Uint8Array {
    const hash = sha3.keccak_256.array(data);
    const { signature, recid } = secp256k1.ecdsaSign(
        new Uint8Array(hash),
        typeof key === 'string' ? hexToUint8Array(key) : new Uint8Array(key),
    );

    return new Uint8Array([...signature, recid]);
}
