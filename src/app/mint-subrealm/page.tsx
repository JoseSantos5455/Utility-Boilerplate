"use client"
import { useContext, useEffect, useRef, useState } from "react";
import { WalletContext } from "@/common/WalletContextProvider";
import { AppContext } from "@/common/AppContextProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle"
import { LoadingSpinner } from "@/components/icons/Spinner";
import { ClipboardCopyIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

  const { network, tlr, mnemonic, showError, showAlert } = useContext(AppContext)
  const { walletData } = useContext(WalletContext)

  // main state variables
  const [fullname, setFullname] = useState(`+${tlr}.`)
  const [mintingSubrealm, setMintingSubrealm] = useState("")
  const [receiverAddr, setReceiverAddr] = useState("")
  const [fundingAddress, setFundingAddress] = useState("")

  // satsbyte set logic state variables
  const [satsbyteDialogOpen, setSatsbyteDialogOpen] = useState(false)
  const [fastestFee, setFastestFee] = useState(0)
  const [halfHourFee, setHalfHourFee] = useState(0)
  const [hourFee, setHourFee] = useState(0)
  const [customFee, setCustomFee] = useState(30)
  const [selectedFeeType, setSelectedFeeType] = useState("fast")
  const [nextFunctionForSatsbyte, setNextFunctionForSatsbyte] = useState("mint")
  const customFeeInput = useRef<HTMLInputElement>(null)

  // claim logic state variables
  const [progressState, setProgressState] = useState('ready')
  const [fundingFee, setFundingFee] = useState(0)
  const [fundingStatementVisible, setFundingStatementVisible] = useState(false)
  const [qrCode, setQrCode] = useState('')

  // get pending subs logic state variables
  const [pendingState, setPendingState] = useState('ready')
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false)
  const [pendingAwaitingConfirmations, setPendingAwaitingConfirmations] = useState([])
  const [pendingAwaitingPayments, setPendingAwaitingPayments] = useState([])
  const [currentBlockHeight, setCurrentBlockHeight] = useState(2578696)    // block height at this time of coding...lol...

  // pay to verify logic state variables
  const [payToVerifyState, setPaytoVerifyState] = useState('ready')
  const [payToVerifyDialogOpen, setPayToVerifyDialogOpen] = useState(false)
  const [verifyingSubrealmAtomicalId, setVerifyingSubrealmAtomicalId] = useState("")
  const [verifyingSubrealmPaymentRules, setVerifyingSubrealmPaymentRules] = useState({})
  const [ruleFee, setRuleFee] = useState(0)
  const [ruleAddress, setRuleAddress] = useState('')
  const [ruleQrCode, setRuleQrCode] = useState('')
  
  useEffect(() => {
    if (!receiverAddr)
      setReceiverAddr(walletData.primary_addr)
  }, [walletData.primary_addr])

  // function to update current state and push notifications and display qrCode
  const pushInfo = (info: any) => {
    if (info.state) {
      setProgressState(info.state)
      if (info.state === 'awaiting-funding-utxo') {
        setFundingFee(info.data.fees)
        setFundingAddress(info.data.address)
        setFundingStatementVisible(true)
      }
    }
    if (info.warning) {
      showError(info.warning)
    }
    if (info.info) {
      showAlert(info.info)
    }
    if (info.qrcode)
      setQrCode(info.qrcode)
    if (info['pending-state']) {
      setPaytoVerifyState(info['pending-state'])
      if (info['pending-state'] === "Awaiting funding UTXO") {
        setRuleFee(info['rule-fee'])
        setRuleAddress(info['rule-address'])
        setRuleQrCode(info['rule-address'])
      }
      if (info['pending-state'] === "Success") {
        setPayToVerifyDialogOpen(false)
        showAlert('Successfully verified subrealm.')
      }
    }
    if (info['pending-state'] === "error") {
      showError(info['pending-error'])
    }
  }

  // generate keypairs regarding funding address...mnemonic is saved in local storage
  const getFundingDetails = async () => {
    const funding_address = await createKeyPair(mnemonic, "m/86'/0'/0'/1/0")
    setFundingAddress(funding_address.address)
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

  const onClose = () => {
    setPendingDialogOpen(false)
  }

  const onClosePayToVerify = () => {
    setPayToVerifyDialogOpen(false)
  }

  const onCloseSatsbyte = () => {
    setProgressState('ready')
    setSatsbyteDialogOpen(false)
  }

  const openSatsbyteWindow = async (next: string) => {
    const getRecommendedFeeAPI = `https://mempool.space/${network === "testnet" ? "testnet/" : ""}api/v1/fees/recommended`
    const response = await fetch(getRecommendedFeeAPI)
    const recommendedFees = await response.json()
    setFastestFee(recommendedFees.fastestFee)
    setHourFee(recommendedFees.hourFee)
    setHalfHourFee(recommendedFees.halfHourFee)
    setNextFunctionForSatsbyte(next)
    setSatsbyteDialogOpen(true)
  }

  const getUserSelectedSatsbyte = () => {
    switch (selectedFeeType) {
      case "fast": return fastestFee;
      case "average": return halfHourFee;
      case "slow": return hourFee;
      case "custom": return customFee;
      default: return -1
    }
  }

  const mintSubrealm = async () => {
    let str = fullname.trim()
    setProgressState('started')

    if (str.startsWith('+')) 
      str = str.substring(1, str.length).trim()

    if (!str) {
      showError('Please input subrealm name to claim.')
      setProgressState('error')
      return
    }

    let just_str = str.substring((tlr.length + 1), str.length).trim()
    if (!just_str) {
      showError(`Input your subrealm after +${tlr}.`)
      setProgressState('error')
      return
    }

    if (!receiverAddr) {
      showError('Please input BTC address to receive subrealm.')
      setProgressState('error')
      return
    }

    if (!str.startsWith(`${tlr}.`)) {
      showError(`You can mint only +\'${tlr}\' subrealms here...`)
      setProgressState('error')
      return
    }

    setMintingSubrealm(str)
    await openSatsbyteWindow("mint")
  }

  const MintSubrealmWithSatsByte = async (userSetSatsbyte: number) => {
    setSatsbyteDialogOpen(false)
    const atomicals = new Atomicals(ElectrumApi.createClient((network === 'testnet' ? process.env.NEXT_PUBLIC_ELECTRUMX_PROXY_TESTNET_BASE_URL : process.env.NEXT_PUBLIC_ELECTRUMX_PROXY_BASE_URL) || ''));
    try {
      const { owner, WIF } = await getFundingDetails()
      setProgressState('validating')
      await atomicals.electrumApi.open();
      const command: CommandInterface = new MintInteractiveSubrealmCommand(atomicals.electrumApi, {
        satsbyte: userSetSatsbyte,
        satsoutput: 1000
      }, mintingSubrealm, receiverAddr, WIF, owner);
      const res = await command.run(pushInfo);
    } catch (error: any) {
      // console.log(error)
    } finally {
      atomicals.electrumApi.close();
    }
  }

  const getPendingRealms = async () => {
    if (!receiverAddr) {
      showError('Please input receiver address or connect your wallet to see if you have any pending subrealms...')
    }
    setPendingState('fetching')
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
        setPendingDialogOpen(true)
      }
      else {
        showAlert('No pending subrealms found.')
      }
    } catch (error: any) {
      showAlert('No pending subrealms found.')
      return {
        success: false,
        message: error.toString(),
        error
      }
    } finally {
      atomicals.electrumApi.close();
      setPendingState('ready')
    }
  }

  const payForRules = async (atomicalId: any, paymentRules: any) => {
    setPendingDialogOpen(false)
    setVerifyingSubrealmAtomicalId(atomicalId)
    setVerifyingSubrealmPaymentRules(paymentRules)
    openSatsbyteWindow("verify")
  }  

  const PayToVerifyWithSatsByte = async (userSetSatsbyte: number) => {
    setSatsbyteDialogOpen(false)
    setPayToVerifyDialogOpen(true)
    let paymentOutputs = []
    const paymentRules: any = verifyingSubrealmPaymentRules
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
        showError('We don`t support ARC-20 payment for subrealm rule payment yet.')
        return;
      } else {
        console.log('Price: ', outputValue / 100000000);
      }
    }
    const { WIF } = await getFundingDetails()

    const atomicals = new Atomicals(ElectrumApi.createClient((network === 'testnet' ? process.env.NEXT_PUBLIC_ELECTRUMX_PROXY_TESTNET_BASE_URL : process.env.NEXT_PUBLIC_ELECTRUMX_PROXY_BASE_URL) || ''));
    
    try {
      await atomicals.electrumApi.open();
      const command: CommandInterface = new MakePendingSubrealmPaymentCommand(atomicals.electrumApi, {satsbyte: userSetSatsbyte}, WIF, verifyingSubrealmAtomicalId, paymentOutputs);
      const result = await command.run(pushInfo);
    } catch (err) {
      console.log(err)
    } finally {
      atomicals.electrumApi.close()
    }
  }

  const getStatementsFromProgreeState = (state: string) => {
    switch(state) {
      case 'ready': return 'Choose your subrealm and Mint it !'
      case 'error': return 'Oops! Something went wrong. Please try again with proper information.'
      case 'validating': return 'Validating your input...'
      case 'detected-rules': return 'Detected subrealm rules at the parent realm.'
      case 'checking-rules': return 'Now checking with the rules...'
      case 'rule-matched': return 'Your subrealm matches the rule. Starting...'
      case 'payment-address-detected': return 'Payment address detected'
      case 'detected-funding-utxo': return 'Detected funding UTXO. Preparing to mint...'
      case 'concurrency-set': return 'Concurrent mining workers are prepared.'
      case 'mining-started': return 'Mining started... This could take some time due to your GPU...'
      case 'mined-bitwork': return 'Bitwork mined !'
      case 'broadcasting-tx': return 'Broadcasting transaction for your subrealm'
      case 'sent-tx': return 'Subrealm Minted Successfully! Check it on your wallet.'
    }
    return ''
  }

  return (
    <div className="w-full">
      <div className="mt-4 flex flex-col w-full lg:items-start items-center space-y-2">
        <Input
          placeholder="Check realms and subrealms..."
          disabled={(progressState !== 'ready' && progressState !== 'error' && progressState !== 'sent-tx')}
          value={fullname}
          onChange={(e) => {
            let typedName = e.target.value
            if ( typedName.startsWith(`+${tlr}.`) && typedName.length > tlr.length + 1 )
              setFullname(typedName)
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter' && fullname !== '') mintSubrealm();
          }}
        />
        <div className=" w-full flex lg:flex-row flex-col lg:space-x-2 space-x-0 space-y-2 lg:space-y-0">
          <Button disabled={progressState !== "ready" && progressState !== "error" && progressState !== "sent-tx"} onClick={() => mintSubrealm()}>Mint</Button>
          <Button disabled={pendingState !== "ready"} onClick={() => getPendingRealms()}>Pending</Button>
        </div>
        
      </div>

      <div className="mt-4 items-center flex flex-col space-y-2">
        <div>
          Receiver address
        </div>
        <Input 
          className="w-full"
          type="text"
          disabled={pendingState !== "ready" || (progressState !== "ready" && progressState !== "error" && progressState !== "sent-tx")}
          placeholder="Address to receive subrealm"
          value={receiverAddr}
          onChange={e => setReceiverAddr(e.target.value)}
        />
      </div>

      <div className={`mt-12 flex flex-col items-center ${(progressState !== 'ready' && progressState !== 'error' && progressState !== 'sent-tx') ? "" : "hidden"}`}>
        <div>Now Minting...</div>
        <p className="text-center">
          Please do not refresh this page until minting finishes, otherwise minting stops.
        </p>      
      </div>

      <div className="mt-12 flex flex-col text-center w-full">
        <div className="w-full text-center">
          <LoadingSpinner className={` m-auto ${(progressState !== 'ready' && progressState !== 'error' && progressState !== 'sent-tx') ? "" : "hidden"}`}>
          </LoadingSpinner>
        </div>
        <p className="text-center">
          {getStatementsFromProgreeState(progressState)}
        </p>
      </div>

      <div className={`mt-8 flex flex-col space-y-2 text-center w-full ${progressState !== 'awaiting-funding-utxo' ? 'hidden' : ''}`}>
        <div className={`${fundingStatementVisible ? "" : "hidden"}`}>
          {`Awaiting ${fundingFee / 100000000} BTC to`}
        </div>
        <div className={`flex flex-row justify-center space-x-3 w-full text-center ${fundingStatementVisible ? "" : "hidden"}`}>
          <div>
            {`${fundingAddress.substring(0, 5)}.....${fundingAddress.substring(fundingAddress.length - 5, fundingAddress.length)}`}
          </div>

          <ClipboardCopyIcon 
            className="cursor-pointer" 
            onClick={() => {
              if (typeof navigator !== "undefined") {
                navigator.clipboard.writeText(fundingAddress)
                showAlert('Copied to clipboard !')
              }
            }} />
        </div>
        <div className="h-auto max-w-[320px] w-full mx-auto pb-20">
          <QRCode
            className="mt-4 bg-white p-4"
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={qrCode}
            viewBox={`0 0 256 256`}
            />
        </div>
      </div> 

      <Dialog open={pendingDialogOpen} onOpenChange={onClose} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pending Subrealms in Receiver Address</DialogTitle>
            <DialogDescription>
              <div className="mt-8 ">
                <div>
                  Current Block Height
                </div>
                <div className="mt-2">
                  {currentBlockHeight}
                </div>
              </div>

              <div className="mt-8">
                <div>
                  Pending Awaiting Payments
                </div>
                <div className="">
                  {
                    pendingAwaitingPayments.map((elem: any) => {
                      const payment_rule = elem.applicable_rule.matched_rule.o
                      return (
                        <div key={elem.atomical_id} className="mt-3">
                          <div>Atomical #{elem.atomical_number}: +{elem.request_full_realm_name}</div>
                          <div>Payment from height: {elem.make_payment_from_height}</div>
                          <div>Payment no later than: {elem.payment_due_no_later_than_height}</div>
                          <div>Candidates: {elem.subrealm_candidates.length}</div>
                          <div>
                            <Button color="primary" onClick={() => payForRules(elem.atomical_id, payment_rule)}>
                              Pay to verify
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>

              <div className="mt-8">
                <div>
                  Pending Awaiting Confirmations for Payment Window
                </div>
                <div className="mt-2">
                  {
                    pendingAwaitingConfirmations.map((elem: any) => (
                      <div key={elem.atomical_id} className="mt-6">
                        <div>Atomical #{elem.atomical_number}: +{elem.request_full_realm_name}</div>
                        <div>Payment from height: {elem.make_payment_from_height}</div>
                        <div>payment no later than: {elem.payment_due_no_later_than_height}</div>
                        <div>Candidates: {elem.subrealm_candidates.length}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={satsbyteDialogOpen} onOpenChange={onCloseSatsbyte} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fee Rate</DialogTitle>
            <DialogDescription>
              <div className="flex flex-col space-y-3 mt-4">
                <div className=" w-full flex lg:flex-row flex-col lg:space-x-2 space-x-0 space-y-2 lg:space-y-0 justify-between">
                  <Toggle onPressedChange={() => setSelectedFeeType("fast")} pressed={selectedFeeType === "fast"} variant="outline" className="w-full flex flex-col py-10">
                    <div>Fast</div>
                    <div>{fastestFee} sat/vB</div>
                    <div>~ 10 mins</div>
                  </Toggle>
                  <Toggle 
                    onPressedChange={() => {
                      setSelectedFeeType("custom")
                      if (customFeeInput.current)
                        customFeeInput.current.focus()
                    }} 
                    pressed={selectedFeeType === "custom"} 
                    variant="outline" 
                    className="w-full flex flex-col py-10">
                    <div>Custom</div>
                    <div className="flex flex-row items-center">
                      <input 
                        value={customFee} 
                        onChange={(e: any) => {
                          if (e.target.value <= 300 && e.target.value > hourFee)
                            setCustomFee(e.target.value)
                        }} 
                        ref={customFeeInput} 
                        className={`${selectedFeeType === "custom" ? "w-12" : "opacity-0 w-0"} p-1 my-0 `}
                        type="number" /> 
                      <div className={`${selectedFeeType === "custom" ? "opacity-0 w-0" : ""}`}>
                        {customFee}
                      </div>
                      <div className="ml-2">
                        sat/vB
                      </div>
                    </div>
                  </Toggle>
                </div>
                <div className=" w-full flex lg:flex-row flex-col lg:space-x-2 space-x-0 space-y-2 lg:space-y-0 justify-between">
                  <Toggle onPressedChange={() => setSelectedFeeType("average")} pressed={selectedFeeType === "average"} variant="outline" className="w-full flex flex-col py-10">
                    <div>Average</div>
                    <div>{halfHourFee} sat/vB</div>
                    <div>~ 30 mins</div>
                  </Toggle>
                  <Toggle onPressedChange={() => setSelectedFeeType("slow")} pressed={selectedFeeType === "slow"} variant="outline" className="w-full flex flex-col py-10">
                    <div>Slow</div>
                    <div>{hourFee} sat/vB</div>
                    <div>~ 1 hour</div>
                  </Toggle>
                </div>
                <Button onClick={async () => {
                  const satsbyte = getUserSelectedSatsbyte()
                  if (nextFunctionForSatsbyte === "mint")
                    await MintSubrealmWithSatsByte(satsbyte)
                  else if (nextFunctionForSatsbyte === "verify")
                    await PayToVerifyWithSatsByte(satsbyte)
                }}>Next</Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={payToVerifyDialogOpen} onOpenChange={onClosePayToVerify} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay to Verify your Subrealm</DialogTitle>
            <DialogDescription>
              <div className={payToVerifyState === "Awaiting funding UTXO" ? "hidden" : ""}>
                {payToVerifyState}
              </div>
              <div className={payToVerifyState === "Awaiting funding UTXO" ? "" : "hidden"}>
                <div className="flex flex-row justify-center space-x-3 w-full text-center mt-4 mb-2">
                  {`Awaiting ${ruleFee / 100000000} BTC to`}
                </div>
                <div className="flex flex-row justify-center space-x-3 w-full text-center">
                  <div>
                    {`${ruleAddress.substring(0, 5)}.....${ruleAddress.substring(ruleAddress.length - 5, ruleAddress.length)}`}
                  </div>

                  <ClipboardCopyIcon 
                    className="cursor-pointer" 
                    onClick={() => {
                      if (typeof navigator !== "undefined") {
                        navigator.clipboard.writeText(ruleAddress)
                        showAlert('Copied to clipboard !')
                      }
                    }} />
                </div>
                <div className="h-auto max-w-[320px] w-full mx-auto pb-20">
                  <QRCode
                    className="mt-4 bg-white p-4"
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={ruleQrCode}
                    viewBox={`0 0 256 256`}
                    />
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}