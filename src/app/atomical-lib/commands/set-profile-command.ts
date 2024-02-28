import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { KeyPairInfo, getKeypairInfo } from "../utils/address-keypair-path";
import { AtomicalsPayload, NETWORK, RBF_INPUT_SEQUENCE, getAndCheckAtomicalInfo, logBanner, prepareCommitRevealConfig } from "./command-helpers";
import * as ecc from '@bitcoinerlab/secp256k1';
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
import {
  Psbt,
  initEccLib,
} from "bitcoinjs-lib";

; import { ECPairFactory, ECPairAPI, TinySecp256k1Interface } from 'ecpair';
const tinysecp: TinySecp256k1Interface = require('@bitcoinerlab/secp256k1');
initEccLib(tinysecp as any);
const ECPair: ECPairAPI = ECPairFactory(tinysecp);

import { BaseRequestOptions } from "../interfaces/api.interface";
import { BASE_BYTES, DUST_AMOUNT, FeeCalculations, INPUT_BYTES_BASE, OUTPUT_BYTES_BASE } from "../utils/atomical-operation-builder";
import { getFundingUtxo } from "../utils/select-funding-utxo";
import { IInputUtxoPartial } from "../types/UTXO.interface";

export interface SetProfileCommandResultInterface {
  success: boolean;
  message?: string;
  data?: any;
  error?: any;
}

export class SetProfileCommand implements CommandInterface {
  private inputUtxos: Array<{
    utxo: IInputUtxoPartial;
    keypairInfo: KeyPairInfo;
  }> = [];
  private additionalOutputs: Array<{
    address: string;
    value: number;
  }> = [];

  constructor(
    private electrumApi: ElectrumApiInterface,
    private options: BaseRequestOptions,
    private atomicalId: string,
    private userData: any,
    private publicKey: any
  ) {
  }

  async run(waitForUserToSign: Function): Promise<any> {
    const clientKeypair = ECPair.fromPublicKey(this.publicKey);
    const clientKeypairInfo: KeyPairInfo = getKeypairInfo(clientKeypair)

    const { atomicalInfo, locationInfo, inputUtxoPartial } = await getAndCheckAtomicalInfo(this.electrumApi, this.atomicalId, clientKeypairInfo.address);
    this.inputUtxos.push({
      utxo: inputUtxoPartial,
      keypairInfo: clientKeypairInfo
    })
    this.additionalOutputs.push({
      address: clientKeypairInfo.address,
      value: 1000
    })

    if (this.options.satsbyte == -1) {
        const response: { result: any } = await this.electrumApi.estimateFee(1);
        let estimatedSatsByte = Math.ceil((response.result / 1000) * 100000000);
        if (isNaN(estimatedSatsByte)) {
            estimatedSatsByte = 30; // Something went wrong, just default to 30 bytes sat estimate
            console.log('satsbyte fee query failed, defaulted to: ', estimatedSatsByte)
        } else {
            this.options.satsbyte = estimatedSatsByte; 
            console.log('satsbyte fee auto-detected to: ', estimatedSatsByte)
        }
    } else {
        console.log('satsbyte fee manually set to: ', this.options.satsbyte)
    } 

    let copiedData = Object.assign({}, this.userData); //

    let scriptP2TR: any = null;
    let hashLockP2TR: any = null;
    
    const mockAtomPayload = new AtomicalsPayload(copiedData);
    const payloadSize = mockAtomPayload.cbor().length;

    const mockBaseCommitForFeeCalculation: { scriptP2TR: any; hashLockP2TR: any } =
      prepareCommitRevealConfig(
        'mod',
        clientKeypairInfo,
        mockAtomPayload
      );
    const fees: FeeCalculations =
      this.calculateFeesRequiredForAccumulatedCommitAndReveal(
        mockBaseCommitForFeeCalculation.hashLockP2TR.redeem.output.length,
        false
      );

    const fundingUtxo = await getFundingUtxo(
      this.electrumApi,
      clientKeypairInfo.address,
      fees.commitAndRevealFeePlusOutputs
    );
    this.electrumApi.close();
    
    const atomPayload = new AtomicalsPayload(this.userData)
    const updatedBaseCommit: {
      scriptP2TR: any;
      hashLockP2TR: any;
      hashscript: any;
    } = prepareCommitRevealConfig(
      "mod",
      clientKeypairInfo,
      atomPayload
    );
  
    let psbtStart = new Psbt({ network: bitcoin.networks.testnet });
    psbtStart.setVersion(1);

    psbtStart.addInput({
      hash: fundingUtxo.txid,
      index: fundingUtxo.index,
      tapInternalKey: Buffer.from(
          clientKeypairInfo.childNodeXOnlyPubkey as number[]
      ),
      witnessUtxo: {
          value: fundingUtxo.value,
          script: Buffer.from(clientKeypairInfo.output, "hex"),
      },
    });

    psbtStart.addOutput({
      address: updatedBaseCommit.scriptP2TR.address,
      value: this.getOutputValueForCommit(fees),
    });

    this.addCommitChangeOutputIfRequired(
      fundingUtxo.value,
      fees,
      psbtStart,
      clientKeypairInfo.address
    );

    psbtStart.finalizeAllInputs()

    psbtStart = await waitForUserToSign(psbtStart.toHex())





    // psbt.addInput({
    //   sequence: this.options.rbf ? RBF_INPUT_SEQUENCE : undefined,
    //   hash: utxo.txid,
    //   index: utxo.outputIndex,
    //   witnessUtxo: { value: utxo.value, script: keypairFundingInfo.output },
    //   tapInternalKey: keypairFundingInfo.childNodeXOnlyPubkey,
    // });

    // for (const paymentOutput of this.paymentOutputs) {
    //   psbt.addOutput({
    //     value: paymentOutput.value,
    //     address: paymentOutput.address,
    //   })
    // }
  
    // psbt.addOutput({
    //   script: paymentRecieptOpReturn,
    //   value: 0,
    // })
    // pushInfo({
    //   'pending-state': `Signing transaction...`
    // })
    // // Add op return here
    // psbt.signInput(0, keypairFundingInfo.tweakedChildNode)
    // psbt.finalizeAllInputs();
    // const tx = psbt.extractTransaction();
    // const rawtx = tx.toHex();
    // // console.log('rawtx', rawtx);
    // // console.log(`Constructed Atomicals Payment, attempting to broadcast: ${tx.getId()}`);
    // // console.log(`About to broadcast`);
    // pushInfo({'pending-state': 'Broadcasting transaction...'})
    // let broadcastedTxId = await this.electrumApi.broadcast(rawtx);
    // pushInfo({'pending-state': 'Success'})
    return null;
  }

  calculateFeesRequiredForAccumulatedCommitAndReveal(
    hashLockP2TROutputLen: number = 0,
    performBitworkForRevealTx: boolean = false
  ): FeeCalculations {
    const revealFee = this.calculateAmountRequiredForReveal(
      hashLockP2TROutputLen,
      performBitworkForRevealTx
    );
    const commitFee = this.calculateFeesRequiredForCommit();
    const commitAndRevealFee = commitFee + revealFee;
    const commitAndRevealFeePlusOutputs = commitFee + revealFee + this.totalOutputSum();
    const revealFeePlusOutputs = revealFee + this.totalOutputSum();
    const ret = {
      commitAndRevealFee,
      commitAndRevealFeePlusOutputs,
      revealFeePlusOutputs,
      commitFeeOnly: commitFee,
      revealFeeOnly: revealFee,
    };
    return ret;
  }

  calculateAmountRequiredForReveal(
    hashLockP2TROutputLen: number = 0,
    performBitworkForRevealTx: boolean = false
  ): number {
    // <Previous txid> <Output index> <Length of scriptSig> <Sequence number>
    // 32 + 4 + 1 + 4 = 41
    // <Witness stack item length> <Signature> ... <Control block>
    // (1 + 65 + 34) / 4 = 25
    // Total: 41 + 25 = 66
    //-----------------------------------------
    // OP_RETURN size
    // 8-bytes value, a one-byte script’s size
    const OP_RETURN_BYTES: number = 21 + 8 + 1;
    //-----------------------------------------
    const REVEAL_INPUT_BYTES_BASE = 66;
    // OP_RETURN size
    let hashLockCompactSizeBytes = 9;
    let op_Return_SizeBytes = 0;
    if(performBitworkForRevealTx){
        op_Return_SizeBytes = OP_RETURN_BYTES;
    }
    if (hashLockP2TROutputLen <= 252) {
        hashLockCompactSizeBytes = 1;
    } else if (hashLockP2TROutputLen <= 0xffff) {
        hashLockCompactSizeBytes = 3;
    } else if (hashLockP2TROutputLen <= 0xffffffff) {
        hashLockCompactSizeBytes = 5;
    }
    return Math.ceil(
        (this.options.satsbyte as any) *
            (BASE_BYTES +
                // Reveal input
                REVEAL_INPUT_BYTES_BASE +
                (hashLockCompactSizeBytes + hashLockP2TROutputLen) / 4 +
                // Additional inputs
                this.inputUtxos.length * INPUT_BYTES_BASE +
                // Outputs
                this.additionalOutputs.length * OUTPUT_BYTES_BASE +
                // Bitwork Output OP_RETURN Size Bytes
                op_Return_SizeBytes)
            )
  }

  calculateFeesRequiredForCommit(): number {
    let fees =  Math.ceil(
      (this.options.satsbyte as any) *
        (BASE_BYTES + 1 * INPUT_BYTES_BASE + 1 * OUTPUT_BYTES_BASE)
    );
    return fees;
  }

  getOutputValueForCommit(fees: FeeCalculations): number {
    // Note that `Additional inputs` refers to the additional inputs in a reveal tx.
    return fees.revealFeePlusOutputs - this.getTotalAdditionalInputValues();
  }

  getTotalAdditionalInputValues(): number {
    let sum = 0;
    for (const utxo of this.inputUtxos) {
        sum += utxo.utxo.witnessUtxo.value;
    }
    return sum;
  }

  totalOutputSum(): number {
    let sum = 0;
    for (const additionalOutput of this.additionalOutputs) {
        sum += additionalOutput.value;
    }
    return sum;
  }

  addCommitChangeOutputIfRequired(
    extraInputValue: number,
    fee: FeeCalculations,
    pbst: any,
    address: string
  ) {
    const totalInputsValue = extraInputValue;
    const totalOutputsValue = this.getOutputValueForCommit(fee);
    const calculatedFee = totalInputsValue - totalOutputsValue;
    // It will be invalid, but at least we know we don't need to add change
    if (calculatedFee <= 0) {
        return;
    }
    // In order to keep the fee-rate unchanged, we should add extra fee for the new added change output.
    const expectedFee =
        fee.commitFeeOnly +
        (this.options.satsbyte as any) * OUTPUT_BYTES_BASE;
    const differenceBetweenCalculatedAndExpected =
        calculatedFee - expectedFee;
    if (differenceBetweenCalculatedAndExpected <= 0) {
        return;
    }
    // There were some excess satoshis, but let's verify that it meets the dust threshold to make change
    if (differenceBetweenCalculatedAndExpected >= DUST_AMOUNT) {
        pbst.addOutput({
            address: address,
            value: differenceBetweenCalculatedAndExpected,
        });
    }
  }
}