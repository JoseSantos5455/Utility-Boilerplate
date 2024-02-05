import { Link, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import React, { useState } from 'react';

declare global {
  interface Window {
    atom: any;
    unisat: any;
  }
}

export const WalletConnect = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const onConnectWizz = async () => {
    if (window.atom && typeof window.atom !== undefined) {
      try {
        let accounts = await window.atom.requestAccounts();
        setUserAddress(accounts[0]); // Assuming the user's address is the first account in the array
        console.log('connect success', accounts);
      } catch (e) {
        console.log('connect failed');
      }
    }
  }

  const onConnectUnisat = async () => {
    if (window.unisat && typeof window.unisat !== undefined) {
      try {
        let accounts = await window.unisat.requestAccounts();
        setUserAddress(accounts[0]); // Assuming the user's address is the first account in the array
        console.log('connect success', accounts);
      } catch (e) {
        console.log('connect failed');
      }
    }
  }

  return (
    <>
      {userAddress ? (
        <Button color="primary" variant="bordered">
          {`${userAddress.slice(0, 4)}...${userAddress.slice(-3)}`}
        </Button>
      ) : (
        <Button color="primary" variant="bordered" onPress={onOpen}>
          Connect Wallet
        </Button>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Connect Wallet</ModalHeader>
              <ModalBody>
                <div>
                  {window.atom ? (
                    <Button color="primary" variant="bordered" onPress={onConnectWizz}>
                      Connect Wizz Wallet
                    </Button>
                  ) : (
                    <Link target="_blank" href="/">
                      Please first install Wizz Wallet
                    </Link>
                  )}
                </div>
                <div>
                  {window.unisat ? (
                    <Button color="primary" variant="bordered" onPress={onConnectUnisat}>
                      Connect Unisat Wallet
                    </Button>
                  ) : (
                    <Link target="_blank" href="/">
                      Please first install Unisat Wallet
                    </Link>
                  )}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
