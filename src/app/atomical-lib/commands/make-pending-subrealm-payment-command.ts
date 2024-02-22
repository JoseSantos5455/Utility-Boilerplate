import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { KeyPairInfo, getKeypairInfo } from "../utils/address-keypair-path";
import { NETWORK, RBF_INPUT_SEQUENCE, logBanner } from "./command-helpers";
import * as ecc from '@bitcoinerlab/secp256k1';
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
import {
  initEccLib,
} from "bitcoinjs-lib";

; import { ECPairFactory, ECPairAPI, TinySecp256k1Interface } from 'ecpair';
const tinysecp: TinySecp256k1Interface = require('@bitcoinerlab/secp256k1');
initEccLib(tinysecp as any);
const ECPair: ECPairAPI = ECPairFactory(tinysecp);

import { compactIdToOutpoint } from "../utils/atomical-format-helpers";
import { ATOMICALS_PROTOCOL_ENVELOPE_ID } from "../types/protocol-tags";
import { BaseRequestOptions } from "../interfaces/api.interface";

export interface MakePendingSubrealmPaymentCommandResultInterface {
  success: boolean;
  message?: string;
  data?: any;
  error?: any;
}

export class MakePendingSubrealmPaymentCommand implements CommandInterface {
  constructor(
    private electrumApi: ElectrumApiInterface,
    private options: BaseRequestOptions,
    private fundingWIF: string,
    private atomicalId: string,
    private paymentOutputs: Array<{ address: string, value: number }>
  ) {
  }

  calculateFundsRequired(price: any, satsbyte: any): number {
    const base = 300 * (satsbyte ? satsbyte : 1)
    return base + price;
  }

  async run(pushInfo: Function): Promise<any> {
  // async makePayment(atomicalId: string, paymentOutputs: Array<{ address: string, value: number }>, fundingKeypair: any, satsbyte: number, pushInfo: Function) {
    const fundingKeypair = ECPair.fromWIF(this.fundingWIF);
    const keypairFundingInfo: KeyPairInfo = getKeypairInfo(fundingKeypair)
    pushInfo({
      'pending-state': 'Funding address provided: '
    })
    // console.log('Funding address of the funding private key (WIF) provided: ', keypairFundingInfo.address);
    logBanner('Preparing Funding Fees...');
    pushInfo({
      'pending-state': 'Pre-estimating Funding Fees...'
    })
    let price = 0;
    this.paymentOutputs.map((e: any) => {
      price += e.value;
    });

    pushInfo({
      'pending-state': 'Estimating satsbyte...'
    })    
    // const response: { result: any } = await this.electrumApi.estimateFee(1);
    // let estimatedSatsByte = Math.ceil((response.result / 1000) * 100000000);
    // if (isNaN(estimatedSatsByte)) {
    //     estimatedSatsByte = 30; // Something went wrong, just default to 30 bytes sat estimate
    // }

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
    pushInfo({
      'pending-state': `Satsbyte set to ${this.options.satsbyte}`
    })    
    
    const expectedSatoshisDeposit = this.calculateFundsRequired(price, this.options.satsbyte);
    const psbt = new bitcoin.Psbt({ network: NETWORK })
    logBanner(`DEPOSIT ${expectedSatoshisDeposit / 100000000} BTC to ${keypairFundingInfo.address}`);
    pushInfo({
      'pending-state': `Awaiting funding UTXO`,
      'rule-address': keypairFundingInfo.address,
      'rule-fee': expectedSatoshisDeposit
    })  
    // temporary
    // qrcode.generate(keypairFundingInfo.address, { small: false });
    // console.log(`...`)
    // console.log(`...`)
    // console.log(`WAITING UNTIL ${expectedSatoshisDeposit / 100000000} BTC RECEIVED AT ${keypairFundingInfo.address}`)
    // console.log(`...`)
    // console.log(`...`)
    let utxo = await this.electrumApi.waitUntilUTXO(keypairFundingInfo.address, expectedSatoshisDeposit, 5, true);
    pushInfo({
      // 'pending-state': `Detected funding UTXO (${utxo.txid}:${utxo.vout}) with value ${utxo.value} for funding the operation...`,
      'pending-state': `Detected funding UTXO...`,
    })  
    // console.log(`Detected UTXO (${utxo.txid}:${utxo.vout}) with value ${utxo.value} for funding the operation...`);
    // Add the funding input
    psbt.addInput({
      sequence: this.options.rbf ? RBF_INPUT_SEQUENCE : undefined,
      hash: utxo.txid,
      index: utxo.outputIndex,
      witnessUtxo: { value: utxo.value, script: keypairFundingInfo.output },
      tapInternalKey: keypairFundingInfo.childNodeXOnlyPubkey,
    });

    for (const paymentOutput of this.paymentOutputs) {
      psbt.addOutput({
        value: paymentOutput.value,
        address: paymentOutput.address,
      })
    }
  
    const outpoint = compactIdToOutpoint(this.atomicalId);
    const atomEnvBuf = Buffer.from(ATOMICALS_PROTOCOL_ENVELOPE_ID, 'utf8');
    const payOpBuf = Buffer.from('p', 'utf8');
    const outpointBuf = Buffer.from(outpoint, 'hex')
    const embed = bitcoin.payments.embed({ data: [atomEnvBuf, payOpBuf, outpointBuf] });
    const paymentRecieptOpReturn = embed.output!

    psbt.addOutput({
      script: paymentRecieptOpReturn,
      value: 0,
    })
    pushInfo({
      'pending-state': `Signing transaction...`
    })
    // Add op return here
    psbt.signInput(0, keypairFundingInfo.tweakedChildNode)
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();
    const rawtx = tx.toHex();
    // console.log('rawtx', rawtx);
    // console.log(`Constructed Atomicals Payment, attempting to broadcast: ${tx.getId()}`);
    // console.log(`About to broadcast`);
    pushInfo({'pending-state': 'Broadcasting transaction...'})
    let broadcastedTxId = await this.electrumApi.broadcast(rawtx);
    pushInfo({'pending-state': 'Success'})
    return broadcastedTxId;
  }

}