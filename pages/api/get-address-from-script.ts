// import * as ecc from 'tiny-secp256k1'
import * as ecc from '@bitcoinerlab/secp256k1';
const bitcoin = require('bitcoinjs-lib')
const { NETWORK } = require('bitcoinjs-lib')
bitcoin.initEccLib(ecc)

const detectScriptToAddressType = (script: string): string => {
  const address = bitcoin.address.fromOutputScript(Buffer.from(script, 'hex'), NETWORK)
  return address;
}

export default function handler (req: any, res: any) {
  const { script } = req.query
  return res.status(200).send(detectScriptToAddressType(script))
}