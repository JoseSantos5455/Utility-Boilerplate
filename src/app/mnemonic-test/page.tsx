"use client"
import { useState } from "react"
import { createKeyPair } from "../atomical-lib"
import { createMnemonicPhrase } from "../atomical-lib"

const bip32 = require('bip32')
const bip39 = require('bip39')

export default function MT () {
  const [mnemonic, setMnemonic] = useState("")
  const [mys, setMys] = useState("")
  const [pk, setPk] = useState("")

  const gen = async () => {
    const { phrase } = createMnemonicPhrase()
    setMnemonic(phrase)
    const keyPair = await createKeyPair(phrase, "m/86'/0'/0'/0/0")
    setPk(keyPair.WIF)
    setMys(phrase)
  }

  const again = async () => {
    const keyPair = await createKeyPair(mnemonic, "m/86'/0'/0'/0/0")
    setPk(keyPair.WIF)
  }

  const cpM = () => {
    navigator.clipboard.writeText(mnemonic)
  }

  const cpP = () => {
    navigator.clipboard.writeText(pk)
  }

  return (
    <>
      <div>
        <input type="password" className="w-[600px]" value={mys}  />
      </div>
      <div>
        <button onClick={cpM}>cpM</button>
      </div>
      <div>
        <input type="password" className="w-[600px]" value={pk} />
      </div>
      <div>
        <button onClick={cpP}>cpP</button>
      </div>
      <div>
        <button onClick={gen}>GGG</button>
      </div>
    </>
  )
}