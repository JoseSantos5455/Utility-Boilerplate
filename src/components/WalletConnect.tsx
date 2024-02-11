"use client"
import { useState, useContext } from "react";
import { WalletContext } from "@/common/WalletContextProvider";

import { Modal, ModalBody, ModalHeader, Button, ModalContent, Link } from "@nextui-org/react";

declare global {
  interface Window {
    atom: any;
    unisat: any;
  }
}

export const WalletConnect = () => {

  const [isModalOpen, setModalOpen] = useState(false)
  const { walletData, setWalletData } = useContext(WalletContext)

  const connectWizz = async () => {
    if ( hasWizzExtension() ) {
      const result: string[] = await window.atom.requestAccounts()
      if (result.length > 0) {
        setModalOpen(false)
        setWalletData({
          ...walletData,
          type: 'atom',
          connected: true,
          legacy_taproot_addr: result[0]
        })
      }
    }
  }

  const hasWizzExtension = () => {
    return (typeof window !== 'undefined' && typeof window.atom !== 'undefined')
  }

  const getWizzAccounts = async () => {
    if (typeof window !== 'undefined' && typeof window.atom !== 'undefined') {
      const accounts: string[] = await window.atom.getAccounts()
      return accounts
    }
    return []
  }

  return (
    <>
      <Button color="primary" variant="bordered" onPress={() => setModalOpen(true)}>
        {
          walletData.connected ? (
            <>Profile</>
          ) : (
            <>Connect Wallet</>
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