"use client"
import { useContext, useEffect, useState } from "react";
import axios from 'axios'
import { WalletContext } from "@/common/WalletContextProvider";
import { Modal, ModalBody, ModalHeader, Button, ModalContent, Link, ModalFooter } from "@nextui-org/react";

export default function MyAssets () {

  const [isModalOpen, setModalOpen] = useState(false)
  
  const [subrealms, setSubrealms] = useState([])
  const [currentAddr, setCurrentAddr] = useState('')
  const realmName = 'bullrun.1'

  const { walletData } = useContext( WalletContext )


  useEffect(() => {
  }, [])

  useEffect(() => {
    const fetchSubrealms = async () => {
      const response = await axios.get(`https://ep.atomicals.xyz/proxy/blockchain.atomicals.get_realm_info?params=[\"${realmName}\",1]`)
      if (response.data && response.data.success) {
        const { result } = response.data.response
        const { atomical_id, found_full_realm_name } = result
      }
    }
    fetchSubrealms()
  }, [currentAddr])

  // console.log(localStorage.getItem('walletConnected'))
  return (
    <div className="flex flex-col text-center mt-6">
      {
        walletData.connected ? (
          <div>
            <div>
              Wallet Connected !
            </div>
            <div>
              {walletData.type}
            </div>
            <div>
              {walletData.legacy_taproot_addr}
            </div>

            <div className="mt-6">
              <Button onClick={() => setModalOpen(true)}>

              </Button>

              <Modal isOpen={isModalOpen} onOpenChange={() => setModalOpen(false)}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">Connect Wallet</ModalHeader>
                      <ModalBody>
                        <div>
                          <Button color="primary" variant="bordered">
                            Connect Wizz Wallet
                          </Button>
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="primary" variant="bordered">
                          Connect Wizz Wallet
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
          </div>
        ) : (
          <div>
            Disconnected ...
          </div>
        )
      }
    </div>
  )
}