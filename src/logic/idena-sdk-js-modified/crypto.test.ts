import { privateKeyToAddress, privateKeyToPublicKey } from './crypto';

describe('crypto utils', () => {
    it('private key converting', () => {
        const key =
      '0944f35092d231c25a9a04f3495a976ae2d94eb3d28cc4a027f92ce9603d84b3';
        const pubKey =
      '04a870f2073139a7c750e0f0bb5d4ee4a3daa0b60911783106e730891cbca957686704a2791407793414eb3ed788a83a5b25d093d2d060c49008ebed74f2544cec';
        const address = '0xf988c3e9c389b96a76f05e99af7152d902af75cd';

        expect(privateKeyToPublicKey(key)).toBe(pubKey);
        expect(privateKeyToAddress(key)).toBe(address);
    });
});
