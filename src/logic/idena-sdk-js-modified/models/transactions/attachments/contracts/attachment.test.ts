import { CallContractAttachment } from './callContractAttachment';
import { contractArgumentFormat } from './types';

describe('call contract attachment', () => {
    it('convert', () => {
        const attachment = new CallContractAttachment({ method: 'test' });

        const args = [
            { index: 0, format: contractArgumentFormat.Dna, value: '10' },
            { index: 1, format: contractArgumentFormat.Byte, value: 250 },
            { index: 3, format: contractArgumentFormat.Hex, value: '0xaabbcc' },
        ];

        attachment.setArgs(args);

        const bytes = attachment.toBytes();

        const attachment2 = new CallContractAttachment().fromBytes(bytes);

        const parsedArgs = attachment2.getArgs([
            contractArgumentFormat.Dna,
            contractArgumentFormat.Byte,
            contractArgumentFormat.Byte,
            contractArgumentFormat.Hex,
        ]);

        expect(attachment2.method).toBe('test');

        expect(parsedArgs[0]?.value).toBe('10');
        expect(parsedArgs[0]?.index).toBe(0);

        expect(parsedArgs[1]?.value).toBe(250);
        expect(parsedArgs[1]?.index).toBe(1);

        expect(parsedArgs[2]?.value).toBe(null);
        expect(parsedArgs[2]?.index).toBe(2);

        expect(parsedArgs[3]?.value).toBe('0xaabbcc');
        expect(parsedArgs[3]?.index).toBe(3);
    });
});

