import { useContext, useEffect } from "react";
import { WalletContext } from "@/common/WalletContextProvider";
import { AppContext } from "@/common/AppContextProvider";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "./ui/button";
import Link from "next/link";
import { DollarIcon } from "./icons/DollarIcon";
import { RepairIcon } from "./icons/RepairIcon";
import { Switch } from "./ui/switch";
import { createMnemonicPhrase } from "@/app/atomical-lib/utils/create-mnemonic-phrase";
import { switchLibraryNetwork } from "@/app/atomical-lib/commands/command-helpers";

declare global {
  interface Window {
    wizz: any;
    unisat: any;
  }
}

export const WalletConnect = () => {
  const { walletData, setWalletData } = useContext(WalletContext);
  const { network, setNetwork, setMnemonic } = useContext(AppContext)

  const connectWizz = async () => {
    if (hasWizzExtension()) {
      const result: string[] = await window.wizz.requestAccounts();
      if (result.length > 0) {
        setWalletData({
          ...walletData,
          type: "wizz",
          connected: true,
          primary_addr: result[0],
        });
        if (localStorage.getItem('clientSeed')) {
          setMnemonic(localStorage.getItem('clientSeed'))
        }
        else {
          const clientSeed = createMnemonicPhrase().phrase
          setMnemonic(clientSeed)
          localStorage.setItem('clientSeed', clientSeed)
        }
      }
    }
  };

  const connectUnisat = async () => {
    if (hasUnisatExtension()) {
      const result: string[] = await window.unisat.requestAccounts();
      if (result.length > 0) {
        setWalletData({
          ...walletData,
          type: "unisat",
          connected: true,
          primary_addr: result[0],
        });
        if (localStorage.getItem('clientSeed')) {
          setMnemonic(localStorage.getItem('clientSeed'))
        }
        else {
          const clientSeed = createMnemonicPhrase().phrase
          setMnemonic(clientSeed)
          localStorage.setItem('clientSeed', clientSeed)
        }
      }
    }
  };

  const isWizzConnected = async () => {
    if (hasWizzExtension()) {
      const result: string[] = await window.wizz.getAccounts()
      return result.length > 0
    }
  }

  const isUnisatConnected = async () => {
    if (hasUnisatExtension()) {
      const result: string[] = await window.unisat.getAccounts()
      return result.length > 0
    }
  }

  const getWizzAccounts = async () => {
    if (typeof window !== 'undefined' && typeof window.wizz !== 'undefined') {
      const accounts: string[] = await window.wizz.getAccounts()
      return accounts
    }
    return []
  }

  const getUnisatAccounts = async () => {
    if (typeof window !== 'undefined' && typeof window.unisat !== 'undefined') {
      const accounts: string[] = await window.unisat.getAccounts()
      return accounts
    }
    return []
  }
  
  const disconnectWallet = () => {
    setWalletData({
      type: null,
      connected: false,
      primary_addr: null,
    });
  };

  const hasWizzExtension = () => {
    return typeof window !== "undefined" && typeof window.wizz !== "undefined";
  };

  const hasUnisatExtension = () => {
    return typeof window !== "undefined" && typeof window.unisat !== "undefined";
  };

  const handleSwitchChange = async (checked: any) => {
    try {
      if (await isWizzConnected) {
        await window.wizz.switchNetwork(checked ? "livenet" : "testnet");
        setNetwork(checked ? 'bitcoin' : 'testnet');
      }
      else if (await isUnisatConnected) {
        await window.unisat.switchNetwork(checked ? "livenet" : "testnet");
        setNetwork(checked ? 'bitcoin' : 'testnet');
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    switchLibraryNetwork(network)
  }, [network])

  useEffect(() => {
    const checkRealWalletConnectivity = async () => {
      if (typeof window !== 'undefined' && await hasWizzExtension() && await isWizzConnected()) {       
        window.wizz.on('networkChanged', (network_str: string) => {
          if (network_str === 'livenet')
            setNetwork('bitcoin')
          else
            setNetwork('testnet')
          connectWizz()
        })

        window.wizz.on('accountsChanged', (accounts: Array<string>) => {
          connectWizz()
        });

        const accounts = await getWizzAccounts()
        if (accounts.length > 0) {
          setWalletData({
            ...walletData,
            type: "wizz",
            connected: true,
            primary_addr: accounts[0],
          });

          if (localStorage.getItem('clientSeed')) {
            setMnemonic(localStorage.getItem('clientSeed'))
          }
          else {
            const clientSeed = createMnemonicPhrase().phrase
            setMnemonic(clientSeed)
            localStorage.setItem('clientSeed', clientSeed)
          }
        }
      }
      else if (typeof window !== 'undefined' && await hasUnisatExtension() && await isUnisatConnected()) {
        window.unisat.on('networkChanged', (network_str: string) => {
          if (network_str === 'livenet')
            setNetwork('bitcoin')
          else
            setNetwork('testnet')
          connectUnisat()
        })

        window.unisat.on('accountsChanged', (accounts: Array<string>) => {
          connectUnisat()
        });

        const accounts = await getUnisatAccounts()
        if (accounts.length > 0) {
          setWalletData({
            ...walletData,
            type: "unisat",
            connected: true,
            primary_addr: accounts[0],
          });

          if (localStorage.getItem('clientSeed')) {
            setMnemonic(localStorage.getItem('clientSeed'))
          }
          else {
            const clientSeed = createMnemonicPhrase().phrase
            setMnemonic(clientSeed)
            localStorage.setItem('clientSeed', clientSeed)
          }
        }
      }
    }
    checkRealWalletConnectivity()
  }, [])

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>
          {walletData.connected ? (
            <>
              {walletData.primary_addr.slice(0, 4)}...{walletData.primary_addr.slice(-4)}
            </>
          ) : (
            <>Connect Wallet</>
          )}
        </MenubarTrigger>
        <MenubarContent className="flex items-center flex-col gap-1">


          {walletData.connected ? (
            <>
              <Link target="_blank" href={`https://mempool.space/${network === "testnet" ? "testnet/" : ""}address/${walletData.primary_addr}`}>
                History
              </Link>
              <MenubarSeparator />
              <Button onClick={disconnectWallet}>
                Disconnect
              </Button>

            </>
          ) : (

            <>
              <MenubarItem>
                {typeof window !== 'undefined' && window.wizz ? (
                  <Button color="primary" onClick={connectWizz}>
                    Connect Wizz Wallet
                  </Button>
                ) : (
                  <Link target="_blank" href="https://wizzwallet.io/">
                    Please first install Wizz Wallet
                  </Link>
                )}
              </MenubarItem>
              <MenubarItem>
                {typeof window !== 'undefined' && window.unisat ? (
                  <Button color="primary" onClick={connectUnisat}>
                    Connect Unisat Wallet
                  </Button>
                ) : (
                  <Link target="_blank" href="https://unisat.io/download">
                    Please first install Unisat Wallet
                  </Link>
                )}
              </MenubarItem>
            </>
          )}

          <MenubarSeparator />
          <div className="w-full flex content-center items-center justify-between">
            {network === 'bitcoin' ?
              <DollarIcon /> : <RepairIcon />
            }
            <Switch
              checked={network === 'bitcoin'}
              onCheckedChange={handleSwitchChange}
            >
            </Switch>

          </div>

        </MenubarContent>
      </MenubarMenu>

    </Menubar>
  );
};
