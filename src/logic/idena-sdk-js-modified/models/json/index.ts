export class JsonTransaction {
    hash: string;
    type: string;
    from: string;
    to: string;
    amount: string;
    tips: string;
    maxFee: string;
    nonce: number;
    epoch: number;
    payload: string;
    blockHash: string;
    usedFee: string;
    timestamp: number;

    constructor (
        hash: string,
        type: string,
        from: string,
        to: string,
        amount: string,
        tips: string,
        maxFee: string,
        nonce: number,
        epoch: number,
        payload: string,
        blockHash: string,
        usedFee: string,
        timestamp: number,
    ) {
        this.hash = hash;
        this.type = type;
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.tips = tips;
        this.maxFee = maxFee;
        this.nonce = nonce;
        this.epoch = epoch;
        this.payload = payload;
        this.blockHash = blockHash;
        this.usedFee = usedFee;
        this.timestamp = timestamp;
    }
}
