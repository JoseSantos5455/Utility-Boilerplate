"use client"
import { useState, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useWalletConnected, useWalletCurrentAddress, useWalletType } from "@/hooks/use-wallet";

import { Modal, ModalBody, ModalHeader, Button, ModalContent, Link } from "@nextui-org/react";

declare global {
  interface Window {
      atom: any;
      unisat: any;
  }
}

export const WalletConnect = () => {

  const [isModalOpen, setModalOpen] = useState(false)

  // const [walletConnected, setWalletConnected] = useLocalStorage<string>('walletConnected', () => {
  //   return (typeof window === 'undefined') ? 'waiting' : (localStorage.getItem('walletConnect') || 'waiting')
  // })
  // const [walletType, setWalletType] = useLocalStorage<string>('walletType', () => {
  //   return (typeof window === 'undefined') ? 'atom' : (localStorage.getItem('walletType') || 'atom')
  // })
  // const [walletCurrentAddress, setWalletCurrentAddress] = useLocalStorage<string>('walletCurrentAddress', () => {
  //   return (typeof window === 'undefined') ? '' : (localStorage.getItem('walletCurrentAddress') || '')
  // })

  const [walletConnected, setWalletConnected] = useWalletConnected()
  const [walletType, setWalletType] = useWalletType()
  const [walletCurrentAddress, setWalletCurrentAddress] = useWalletCurrentAddress()
  
  const connectWizz = async () => {
    if (typeof window !== 'undefined' && typeof window.atom !== 'undefined') {
      const result: string[] = await window.atom.requestAccounts()
      if (result.length > 0) {
        setModalOpen(false)
        setWalletConnected('connected')
        setWalletType('atom')
        setWalletCurrentAddress(result[0])
      }
    }
  }

  // const hasWizzExtension = () => {
  //   return (typeof window !== 'undefined' && typeof window.atom !== 'undefined')
  // }
  
  // const hasUnisatExtension = () => {
  //   return (typeof window !== 'undefined' && typeof window.unisat !== 'undefined')
  // }
  
  const getWizzAccounts = async () => {
    if (typeof window !== 'undefined' && typeof window.atom !== 'undefined') {
      const accounts: string[] = await window.atom.getAccounts()
      return accounts
    }
    return []
  }
  
  const isWizzConnected = async () => {
    const accounts = await getWizzAccounts()
    return accounts.length > 0
  }

  const getStatesFromLocalStorage = () => {
    if ( typeof window !== 'undefined' && localStorage ) {
      if ( localStorage.getItem('walletConnected') )
        setWalletConnected(localStorage.getItem('walletConnected') || '')
      if ( localStorage.getItem('walletType') )
        setWalletType(localStorage.getItem('walletType') || '')
      if ( localStorage.getItem('walletCurrentAddress') )
        setWalletCurrentAddress(localStorage.getItem('walletCurrentAddress') || '')
    }
  }

  useEffect(() => {
    getStatesFromLocalStorage();
    const getWalletConnectionDetail = async () => {
      setWalletConnected('waiting')
      const wizzConnected = await isWizzConnected()
      if ( wizzConnected ) {
        setWalletConnected('connected')
      }
      else
        setWalletConnected('disconnected')
    }
    getWalletConnectionDetail()
  }, [])
  
  // useEffect(() => {
  //   console.log('wallet stated changed to ' + walletConnected)
  // }, [walletConnected])

  return (
    <>
      <Button color="primary" variant="bordered" onPress={() => setModalOpen(true)}>
        {
          walletConnected ? (
            <>{walletConnected}</>
          ) : (
            <>{walletConnected}</>
          )
        }
      </Button>

      <Modal isOpen={isModalOpen} onOpenChange={() => setModalOpen(false)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Connect Wallet</ModalHeader>
              <ModalBody>
                <div>
                  {
                    (window.atom ? (
                      <Button color="primary" variant="bordered" onPress={connectWizz}>
                        Connect Wizz Wallet
                      </Button>
                    ) : (
                      <Link target="_blank" href="/">Please first install Wizz Wallet</Link>
                    ))
                  }
                </div>
                <div>
                  {
                    (window.unisat ? (
                      <Button color="primary" variant="bordered" onPress={connectWizz}>
                        Connect Unisat Wallet
                      </Button>
                    ) : (
                      <Link target="_blank" href="/">Please first install Unisat Wallet</Link>
                    ))
                  }
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}