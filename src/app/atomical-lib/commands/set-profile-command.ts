import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { KeyPairInfo, getKeypairInfo } from "../utils/address-keypair-path";
import { AtomicalsPayload, NETWORK, RBF_INPUT_SEQUENCE, getAndCheckAtomicalInfo, logBanner, prepareCommitRevealConfig, prepareCommitRevealConfigWithChildXOnlyPubkey } from "./command-helpers";
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
import { detectAddressTypeToScripthash } from "../utils/address-helpers";
import { witnessStackToScriptWitness } from "./witness_stack_to_script_witness";

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
    private fundingWIF: any,
    private publicKey: any
  ) {
  }

  async run(waitForUserToSign: Function): Promise<any> {
    const clientKeypair = ECPair.fromPublicKey(this.publicKey);
    const clientKeypairInfo: KeyPairInfo = getKeypairInfo(clientKeypair)
    console.log(this.fundingWIF)
    const fundingKeypairRaw = ECPair.fromWIF(this.fundingWIF);
    const fundingKeypair: KeyPairInfo = getKeypairInfo(fundingKeypairRaw)

    const { inputUtxoPartial } = await getAndCheckAtomicalInfo(this.electrumApi, this.atomicalId, clientKeypairInfo.address);
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
    let atomicalId: string | null = null;
    let commitTxid: string | null = null;
    let revealTxid: string | null = null;

    const mockAtomPayload = new AtomicalsPayload(copiedData);
    const payloadSize = mockAtomPayload.cbor().length;

    const mockBaseCommitForFeeCalculation: { scriptP2TR: any; hashLockP2TR: any } =
      prepareCommitRevealConfigWithChildXOnlyPubkey(
        'mod',
        // clientKeypairInfo.childNodeXOnlyPubkey,
        // justtest
        fundingKeypair.childNodeXOnlyPubkey,
        mockAtomPayload
      );
    const fees: FeeCalculations =
      this.calculateFeesRequiredForAccumulatedCommitAndReveal(
        mockBaseCommitForFeeCalculation.hashLockP2TR.redeem.output.length,
        false
      );

    const fundingUtxo = await getFundingUtxo(
      this.electrumApi,
      // clientKeypairInfo.address,
      // justtest
      fundingKeypair.address,
      fees.commitAndRevealFeePlusOutputs
    );
    this.electrumApi.close();
    
    const atomPayload = new AtomicalsPayload(this.userData)
    const updatedBaseCommit: {
      scriptP2TR: any;
      hashLockP2TR: any;
      hashscript: any;
    } = prepareCommitRevealConfigWithChildXOnlyPubkey(
      "mod",
      // clientKeypairInfo.childNodeXOnlyPubkey,
      // justtest
      fundingKeypair.childNodeXOnlyPubkey,
      atomPayload
    );

    console.log(fundingKeypair.address)
    console.log(fundingKeypair.childNode)
    console.log(fundingKeypair.childNodeXOnlyPubkey)
    console.log(fundingKeypair.tweakedChildNode)
    console.log(fundingKeypair.tweakedChildNode.address)
    console.log(updatedBaseCommit.scriptP2TR.address)
  
    let psbtStart = new Psbt({ network: bitcoin.networks.testnet });
    psbtStart.setVersion(1);
    const { output } = detectAddressTypeToScripthash(clientKeypairInfo.address)

    psbtStart.addInput({
      hash: fundingUtxo.txid,
      index: fundingUtxo.index,
      tapInternalKey: Buffer.from(
        // clientKeypairInfo.childNodeXOnlyPubkey as number[]
        // justtest
        fundingKeypair.childNodeXOnlyPubkey as number[]
      ),
      witnessUtxo: {
          value: fundingUtxo.value,
          // script: Buffer.from(output, "hex"),   // this is suspicious
          // justtest
          script: Buffer.from(fundingKeypair.output, "hex")
      },
    });

    psbtStart.addOutput({
      address: updatedBaseCommit.scriptP2TR.address,    // this might be right
      value: this.getOutputValueForCommit(fees),
    });

    this.addCommitChangeOutputIfRequired(
      fundingUtxo.value,
      fees,
      psbtStart,
      clientKeypairInfo.address   // address where the extra sats are being come back
      // justtest
      // let`s keep this for a while
    );

    // justtest
    psbtStart.signInput(0, fundingKeypair.tweakedChildNode)
    psbtStart.finalizeAllInputs()
    const interTx = psbtStart.extractTransaction();
    const rawtx = interTx.toHex();
    // await AtomicalOperationBuilder.finalSafetyCheckForExcessiveFee(
    //     psbtStart,
    //     interTx
    // );
    let tx_result = await this.electrumApi.broadcast(rawtx)
    // if (!this.broadcastWithRetries(rawtx)) {
    //   console.log("Error sending", interTx.getId(), rawtx);
    //   throw new Error(
    //     "Unable to broadcast commit transaction after attempts: " + interTx.getId()
    //   );
    // } else {
    //   console.log("Success sent tx: ", interTx.getId());
    // }







    // psbtStart.finalizeInput(0)    // this is the problem. what is fundingKeypair.tweakedChildNode ???
    // first to know what is ChildNode.tweak ? can I do this with wallet ?

    // psbtStart.signInput(0, fundingKeypair.tweakedChildNode)
    // psbtStart.finalizeInput(0)
    // psbtStart = await waitForUserToSign([psbtStart.toHex()])

    scriptP2TR = updatedBaseCommit.scriptP2TR;
    hashLockP2TR = updatedBaseCommit.hashLockP2TR;


    const utxoOfCommitAddress = await getFundingUtxo(
      this.electrumApi,
      scriptP2TR.address,
      this.getOutputValueForCommit(fees),
      false,
      5
    );
    commitTxid = utxoOfCommitAddress.txid;
    atomicalId = commitTxid + "i0"; // Atomicals are always minted at the 0'th output

    const tapLeafScript = {
      leafVersion: hashLockP2TR.redeem.redeemVersion,
      script: hashLockP2TR.redeem.output,
      controlBlock: hashLockP2TR.witness![hashLockP2TR.witness!.length - 1],
    };

    let totalInputsforReveal = 0; // We calculate the total inputs for the reveal to determine to make change output or not
    let totalOutputsForReveal = 0; // Calculate total outputs for the reveal and compare to totalInputsforReveal and reveal fee
    let nonce = Math.floor(Math.random() * 100000000);
    let unixTime = Math.floor(Date.now() / 1000);
    let psbt = new Psbt({ network: NETWORK });
    psbt.setVersion(1);
    psbt.addInput({
      sequence: this.options.rbf ? RBF_INPUT_SEQUENCE : undefined,
      hash: utxoOfCommitAddress.txid,
      index: utxoOfCommitAddress.vout,
      witnessUtxo: {
        value: utxoOfCommitAddress.value,
        // script: Buffer.from(output, "hex"),  // this is issue
        script: hashLockP2TR.output!,
      },
      tapLeafScript: [tapLeafScript],
    });
    totalInputsforReveal += utxoOfCommitAddress.value;

    for (const additionalInput of this.inputUtxos) {
      psbt.addInput({
        sequence: this.options.rbf ? RBF_INPUT_SEQUENCE : undefined,
        hash: additionalInput.utxo.hash,
        index: additionalInput.utxo.index,
        witnessUtxo: additionalInput.utxo.witnessUtxo,
        tapInternalKey:
          additionalInput.keypairInfo.childNodeXOnlyPubkey,
      });
      totalInputsforReveal += additionalInput.utxo.witnessUtxo.value;
    }

    for (const additionalOutput of this.additionalOutputs) {
      psbt.addOutput({
        address: additionalOutput.address,
        value: additionalOutput.value,
      });
      totalOutputsForReveal += additionalOutput.value;
    }

    // console.log(psbt.toHex())
    psbt.signInput(0, fundingKeypair.childNode);
    const customFinalizer = (_inputIndex: number, input: any) => {
      const scriptSolution = [input.tapScriptSig[0].signature];
      const witness = scriptSolution
          .concat(tapLeafScript.script)
          .concat(tapLeafScript.controlBlock);
      return {
          finalScriptWitness: witnessStackToScriptWitness(witness),
      };
    };
    psbt.finalizeInput(0, customFinalizer)
    // console.log(psbt.toHex())
    psbt = await waitForUserToSign([psbt.toHex()])
    // let noncesGenerated = 0;
    // if (noncesGenerated % 10000 == 0) {
    //   unixTime = Math.floor(Date.now() / 1000);
    // }
    // const data = Buffer.from(unixTime + ":" + nonce, "utf8");
    // const embed = bitcoin.payments.embed({ data: [data] });

    // if (performBitworkForRevealTx) {
    //   psbt.addOutput({
    //       script: embed.output!,
    //       value: 0,
    //   });
    // }

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