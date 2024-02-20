"use client"
import { useContext, useEffect, useState } from "react";
import { WalletContext } from "@/common/WalletContextProvider";
import { AppContext } from "@/common/AppContextProvider";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";

import { detectScriptToAddressType } from "../atomical-lib";
const bip39 = require('bip39')
import BIP32Factory from "bip32";
import * as ecc from '@bitcoinerlab/secp256k1';
const bip32 = BIP32Factory(ecc);
import { createKeyPair } from "../atomical-lib/utils/create-key-pair";

import { Atomicals } from "../atomical-lib";
import { ElectrumApi } from "../atomical-lib/api/electrum-api";
import { CommandInterface } from "../atomical-lib/commands/command.interface";
import { MintInteractiveSubrealmCommand } from "../atomical-lib/commands/mint-interactive-subrealm-command";
import { MakePendingSubrealmPaymentCommand } from "../atomical-lib/commands/make-pending-subrealm-payment-command";
import { PendingSubrealmsCommand } from "../atomical-lib/commands/pending-subrealms-command";

export default function MintSubrealm () {

  const { network, tlr, mnemonic, toNotify, setToNotify, subrealmCurrentState, setSubrealmCurrentState } = useContext(AppContext)
  const { walletData } = useContext(WalletContext)

  const [fullname, setFullname] = useState('bullrun.')
  const [receiverAddr, setReceiverAddr] = useState("")
  const [qrCode, setQrCode] = useState('')
  const [pendingAwaitingConfirmations, setPendingAwaitingConfirmations] = useState([])
  const [pendingAwaitingPayments, setPendingAwaitingPayments] = useState([])
  const [currentBlockHeight, setCurrentBlockHeight] = useState(2578696)    // block height at this time of coding...lol...
  
  useEffect(() => {
    if (!receiverAddr)
      setReceiverAddr(walletData.primary_addr)
  }, [walletData.primary_addr])

  // function to update current state and push notifications and display qrCode
  const pushInfo = (info: any) => {
    if (info.state)
      setSubrealmCurrentState(info.state)
    if (info.warning)
      setToNotify(info.warning)
    if (info.qrcode)
      setQrCode(info.qrcode)
  }

  // generate keypairs regarding funding address...mnemonic is saved in local storage
  const getFundingDetails = async () => {
    const funding_address = await createKeyPair(mnemonic, "m/86'/0'/0'/1/0")
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const rootKey = bip32.fromSeed(seed);
    const childNode = rootKey.derivePath("m/86'/0'/0'/1/0");
    const owner = {
      address: funding_address.address,
      WIF: funding_address.WIF,
      childNode
    }
    const WIF = funding_address.WIF
    return {
      funding_address,
      seed,
      rootKey,
      childNode,
      owner,
      WIF
    }
  }

  const mintSubrealm = async () => {
    let str = fullname.trim()
    setSubrealmCurrentState('started')

    if (str.startsWith('+')) 
      str = str.substring(1, str.length).trim()

    if (!str) {
      setToNotify('input your subrealm')
      setSubrealmCurrentState('error')
      return
    }

    if (!str.startsWith(`${tlr}.`) || str.split('.').length > 2) {
      setToNotify(`you can only mint \'${tlr}\' subrealms here...`)
      setSubrealmCurrentState('error')
      return
    }

    let just_str = str.substring((tlr.length + 1), str.length).trim()
    if (!just_str) {
      setToNotify(`input your subrealm after ${tlr}`)
      setSubrealmCurrentState('error')
      return
    }

    const atomicals = new Atomicals(ElectrumApi.createClient((network === 'testnet' ? process.env.NEXT_PUBLIC_ELECTRUMX_PROXY_TESTNET_BASE_URL : process.env.NEXT_PUBLIC_ELECTRUMX_PROXY_BASE_URL) || ''));
    setSubrealmCurrentState('initilized Electrum')
    try {
      const { owner, WIF } = await getFundingDetails()
      setSubrealmCurrentState('prepared funding address')
      await atomicals.electrumApi.open();
      const command: CommandInterface = new MintInteractiveSubrealmCommand(atomicals.electrumApi, {
        satsbyte: -1,
        satsoutput: 1000
      }, str, receiverAddr, WIF, owner);
      const res = await command.run(pushInfo);
    } catch (error: any) {
      console.log(error)
    } finally {
      atomicals.electrumApi.close();
    }
  }

  const getPendingRealms = async () => {
    const { WIF } = await getFundingDetails()

    const atomicals = new Atomicals(ElectrumApi.createClient((network === 'testnet' ? process.env.NEXT_PUBLIC_ELECTRUMX_PROXY_TESTNET_BASE_URL : process.env.NEXT_PUBLIC_ELECTRUMX_PROXY_BASE_URL) || ''));
    
    try {
      await atomicals.electrumApi.open();
      const command: CommandInterface = new PendingSubrealmsCommand(atomicals.electrumApi, {}, receiverAddr, WIF, -1, false);
      const result = await command.run(pushInfo);

      if ( result && result.data ) {
        const { current_block_height, request_subrealm } = result.data
        setCurrentBlockHeight(current_block_height)
        const { pending_awaiting_confirmations_for_payment_window, pending_awaiting_payment } = request_subrealm
        if (pending_awaiting_confirmations_for_payment_window && pending_awaiting_confirmations_for_payment_window.length > 0) {
          setPendingAwaitingConfirmations(pending_awaiting_confirmations_for_payment_window)
        }
        if (pending_awaiting_payment && pending_awaiting_payment.length > 0) {
          setPendingAwaitingPayments(pending_awaiting_payment)
        }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.toString(),
        error
      }
    } finally {
      atomicals.electrumApi.close();
    }
  }

  const payForRules = async (atomicalId: any, paymentRules: any) => {
    let paymentOutputs = []
    for (const payScript in paymentRules) {
      if (!paymentRules.hasOwnProperty(payScript)) {
        continue;
      }
      const outputValue = paymentRules[payScript]['v']
      const outputArc20 = paymentRules[payScript]['id']
      const expectedAddress = detectScriptToAddressType(payScript);
      paymentOutputs.push({
        address: expectedAddress,
        value: outputValue
      });

      if (outputArc20) {
        pushInfo({
          warning: 'We don`t support ARC-20 payment for subrealm rule payment yet.'
        })
      } else {
        console.log('Price: ', outputValue / 100000000);
      }
    }
    const { WIF } = await getFundingDetails()

    const atomicals = new Atomicals(ElectrumApi.createClient((network === 'testnet' ? process.env.NEXT_PUBLIC_ELECTRUMX_PROXY_TESTNET_BASE_URL : process.env.NEXT_PUBLIC_ELECTRUMX_PROXY_BASE_URL) || ''));
    
    try {
      await atomicals.electrumApi.open();
      const command: CommandInterface = new MakePendingSubrealmPaymentCommand(atomicals.electrumApi, {}, WIF, atomicalId, paymentOutputs);
      const result = await command.run(pushInfo);
    } catch (err) {
      console.log(err)
    } finally {
      atomicals.electrumApi.close()
    }
  }

  return (
    <div>
      <div>
        <input 
          type="text" 
          value={fullname}
          onChange={e => setFullname(e.target.value)}
        />
      </div>
      <div>
        <Button disabled={subrealmCurrentState !== "ready" && subrealmCurrentState !== "error"} onClick={() => mintSubrealm()}>MINT SUBREALM</Button>
      </div>

      <div>
        <Button onClick={() => getPendingRealms()}>getPendingRealms</Button>
      </div>

      <div className="mt-12">
        <div>
          Receiver address
        </div>
        <div className="mt-2">
          <input 
            type="text" 
            value={receiverAddr}
            onChange={e => setReceiverAddr(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-12">
        <div>
          Current State
        </div>
        <div className="mt-2">
          {subrealmCurrentState}
        </div>
      </div>

      <div className="mt-12">
        <div>
          notification
        </div>
        <div className="mt-2">
          {toNotify}
        </div>
      </div>

      <div className={`mt-12 ${qrCode === '' ? 'hidden' : ''}`}>
        <div>
          QR Code
        </div>
        <div className="mt-2">
          <div style={{ height: "auto", margin: "0 auto", maxWidth: 320, width: "100%" }}>
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={qrCode}
              viewBox={`0 0 256 256`}
              />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div>
          Current Block Height
        </div>
        <div className="mt-2">
          {currentBlockHeight}
        </div>
      </div>

      <div className="mt-12">
        <div>
          Pending Awaiting Payments
        </div>
        <div className="mt-2">
          {
            pendingAwaitingPayments.map((elem: any) => {
              const payment_rule = elem.applicable_rule.matched_rule.o
              return (
                <div key={elem.atomical_id} className="mt-6">
                  <div>atomical_id: {elem.atomical_id}</div>
                  <div>atomical_number: {elem.atomical_number}</div>
                  <div>full name: ${elem.request_full_realm_name}</div>
                  <div>make pay from hgt: {elem.make_payment_from_height}</div>
                  <div>payment no later than: {elem.payment_due_no_later_than_height}</div>
                  <div>total candidates: {elem.subrealm_candidates.length}</div>
                  <div>receipt id: {elem.receipt_id}</div>
                  <div>
                    <Button color="primary" onClick={() => payForRules(elem.atomical_id, payment_rule)}>
                      PAY
                    </Button>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>

      <div className="mt-12">
        <div>
          Pending Awaiting Confirmations for Payment Window
        </div>
        <div className="mt-2">
          {
            pendingAwaitingConfirmations.map((elem: any) => (
              <div key={elem.atomical_id} className="mt-6">
                <div>atomical_id: {elem.atomical_id}</div>
                <div>atomical_number: {elem.atomical_number}</div>
                <div>full name: ${elem.request_full_realm_name}</div>
                <div>make pay from hgt: {elem.make_payment_from_height}</div>
                <div>payment no later than: {elem.payment_due_no_later_than_height}</div>
                <div>total candidates: {elem.subrealm_candidates.length}</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}