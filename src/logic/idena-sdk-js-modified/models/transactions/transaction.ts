import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import { ProtoTransactionSchema, type ProtoTransaction, ProtoTransaction_DataSchema, type ProtoTransaction_Data } from '../proto/models_pb';
import BN from 'bn.js';
import { floatStringToDna, hexToUint8Array, toHexString } from '../../utils';
import sha3 from 'js-sha3';
import { sender, sign } from '../../crypto';
import type { JsonTransaction } from '../json';
import { StoreToIpfsAttachment } from './attachments/storeToIpfsAttachment';

export type TransactionType = 0x0 | 0x1 | 0x2 | 0x3 | 0x4 | 0x5 | 0x6 | 0x7 | 0x8 | 0x9 | 0xa | 0xb | 0xc | 0xd | 0xe | 0xf | 0x10 | 0x11 | 0x12 | 0x13 | 0x14 | 0x15;

export const transactionType: Record<string, TransactionType> = {
    SendTx: 0x0,
    ActivationTx: 0x1,
    InviteTx: 0x2,
    KillTx: 0x3,
    SubmitFlipTx: 0x4,
    SubmitAnswersHashTx: 0x5,
    SubmitShortAnswersTx: 0x6,
    SubmitLongAnswersTx: 0x7,
    EvidenceTx: 0x8,
    OnlineStatusTx: 0x9,
    KillInviteeTx: 0xa,
    ChangeGodAddressTx: 0xb,
    BurnTx: 0xc,
    ChangeProfileTx: 0xd,
    DeleteFlipTx: 0xe,
    DeployContractTx: 0xf,
    CallContractTx: 0x10,
    TerminateContractTx: 0x11,
    DelegateTx: 0x12,
    UndelegateTx: 0x13,
    KillDelegatorTx: 0x14,
    StoreToIpfsTx: 0x15,
};

export class Transaction {
    private _nonce = 0;
    private _epoch = 0;
    private _type: TransactionType | number = 0;
    private _to: Uint8Array | null = null;
    private _amount: BN | null = null;
    private _maxFee: BN | null = null;
    private _tips: BN | null = null;
    private _payload: Uint8Array | null = null;

    private _signature: Uint8Array | null = null;

    constructor(
        init?: Partial<{
      nonce: number;
      epoch: number;
      type: TransactionType;
      to: Uint8Array | string;
      amount: Uint8Array | string | number | BN;
      maxFee: Uint8Array | string | number | BN;
      tips: Uint8Array | string | number | BN;
      payload: Uint8Array | number[];
    }>,
    ) {
        this.nonce = init?.nonce ?? 0;
        this.epoch = init?.epoch ?? 0;
        this.type = init?.type ?? 0;
        this.to = init?.to ?? null;
        this.amount = init?.amount ?? null;
        this.maxFee = init?.maxFee ?? null;
        this.tips = init?.tips ?? null;
        this.payload = init?.payload ? new Uint8Array(init.payload) : null;
    }

    public set nonce(nonce: number) {
        this._nonce = nonce;
    }

    public get nonce(): number {
        return this._nonce;
    }

    public set epoch(epoch: number) {
        this._epoch = epoch;
    }

    public get epoch(): number {
        return this._epoch;
    }

    public set type(type: TransactionType) {
        this._type = type;
    }

    public get type(): number {
        return this._type;
    }

    public set to(to: string | Uint8Array | null) {
        if (to === null) this._to = null;
        else if (to instanceof Uint8Array) this._to = to;
        else this._to = hexToUint8Array(to);
    }

    public get to(): string | null {
        return this._to && this._to.length > 0 ? toHexString(this._to, true) : null;
    }

    public set amount(amount: number | string | BN | Uint8Array | null) {
        this._amount = amount !== null ? new BN(amount) : null;
    }

    public get amount(): BN | null {
        return this._amount;
    }

    public set maxFee(maxFee: number | string | BN | Uint8Array | null) {
        this._maxFee = maxFee !== null ? new BN(maxFee) : null;
    }

    public get maxFee(): BN | null {
        return this._maxFee;
    }

    public set tips(tips: number | string | BN | Uint8Array | null) {
        this._tips = tips !== null ? new BN(tips) : null;
    }

    public get tips(): BN | null {
        return this._tips;
    }

    public set payload(payload: Uint8Array | null) {
        this._payload = payload;
    }

    public get payload(): Uint8Array | null {
        return this._payload ? new Uint8Array(this._payload) : null;
    }

    public get signature(): Uint8Array | null {
        return this._signature;
    }

    get hash() {
        return Buffer.from(sha3.keccak_256.array(this.toBytes())).toString('hex');
    }

    get sender() {
        try {
            if (!this._signature || this._signature.length === 0) return null;

            const data = toBinary(ProtoTransaction_DataSchema, this._createProtoTxData());
      
            return sender(data, this._signature, true);
        } catch {
            return null;
        }
    }

    get gas() {
        const bytes = this.toBytes();
        let size = bytes.length;
        if (!this._signature || this._signature.length === 0) size += 67;
        if (this.type === transactionType.DeleteFlipTx) size += 1024 * 120;
        if (this.type === transactionType.StoreToIpfsTx) {
            const maxSize = 1024 * 1024;
            try {
                if (this.payload) {
                    const attachment = new StoreToIpfsAttachment().fromBytes(
                        this.payload,
                    );
                    size += attachment.size * 0.2 || maxSize;
                } else {
                    size += maxSize;
                }
            } catch (e) {
                size += maxSize;
            }
        }
        return ~~size * 10;
    }

    static fromHex(hex: string): Transaction {
        return new Transaction().fromHex(hex);
    }

    static fromBytes(bytes: Uint8Array): Transaction {
        return new Transaction().fromBytes(bytes);
    }

    public fromHex(hex: string): Transaction {
        return this.fromBytes(hexToUint8Array(hex));
    }

    public fromBytes(bytes: Uint8Array): Transaction {
        const protoTx = fromBinary(ProtoTransactionSchema, bytes);
        const protoTxData = protoTx.data;

        if (protoTxData) {
            this.nonce = protoTxData.nonce;
            this.epoch = protoTxData.epoch;
            this.type = protoTxData.type as TransactionType;
            this.to = protoTxData.to;
            this.amount = protoTxData.amount;
            this.maxFee = protoTxData.maxFee;
            this.tips = protoTxData.tips;
            this.payload = protoTxData.payload;
        }

        this._signature = protoTx.signature;

        return this;
    }

    public fromJson(jsonTx: JsonTransaction): Transaction {
        function getTxType(type: string): TransactionType {
            if (!type?.length) return transactionType.SendTx;
            const stringType = type[0]?.toUpperCase() + type.slice(1) + 'Tx';
            return (
                (Object.entries(transactionType).find(
                    ([key]) => key === stringType,
                )?.[1] || transactionType.SendTx)
            );
        }

        this.nonce = jsonTx.nonce;
        this.epoch = jsonTx.epoch;
        this.type = getTxType(jsonTx.type);
        this.to = jsonTx.to;
        this.amount = floatStringToDna(jsonTx.amount);
        this.maxFee = floatStringToDna(jsonTx.maxFee);
        this.tips = floatStringToDna(jsonTx.tips);
        this.payload = hexToUint8Array(jsonTx.payload);

        return this;
    }

    public toBytes(): Uint8Array {
        const tx: ProtoTransaction = create(ProtoTransactionSchema, {
            data: this._createProtoTxData(),
            signature: this._signature ?? new Uint8Array(),
        });

        return toBinary(ProtoTransactionSchema, tx);
    }

    public sign(key: string | Uint8Array | number[]): Transaction {
        const data = toBinary(ProtoTransaction_DataSchema, this._createProtoTxData());
        this._signature = sign(data, key);
        return this;
    }

    public toHex(withPrefix = true): string {
        return toHexString(this.toBytes(), withPrefix);
    }

    private _createProtoTxData(): ProtoTransaction_Data {
        return create(ProtoTransaction_DataSchema, {
            epoch: this._epoch,
            nonce: this._nonce,
            type: this._type,
            to: this._to ?? new Uint8Array(),
            amount: new Uint8Array(
                !this._amount || this._amount.isZero() ? [] : this._amount.toArray(),
            ),
            maxFee: new Uint8Array(
                !this._maxFee || this._maxFee.isZero() ? [] : this._maxFee.toArray(),
            ),
            tips: new Uint8Array(
                !this._tips || this._tips.isZero() ? [] : this._tips.toArray(),
            ),
            payload: this._payload ?? new Uint8Array(),
        });
    }
}
