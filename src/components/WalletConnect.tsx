import { useState, useContext } from "react";
import { WalletContext } from "@/common/WalletContextProvider";
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
import { NetworkContext } from "@/common/NetworkContextProvider";


declare global {
  interface Window {
    atom: any;
    unisat: any;
  }
}

export const WalletConnect = () => {
  const { walletData, setWalletData } = useContext(WalletContext);
  const [isConnectOptionsVisible, setConnectOptionsVisible] = useState(false);

  const { network, setNetwork } = useContext(NetworkContext)


  const connectWizz = async () => {
    if (hasWizzExtension()) {
      const result = await window.atom.requestAccounts();
      if (result.length > 0) {
        setConnectOptionsVisible(false);
        setWalletData({
          ...walletData,
          type: "atom",
          connected: true,
          legacy_taproot_addr: result[0],
        });
      }
    }
  };

  const disconnectWallet = () => {
    setWalletData({
      type: null,
      connected: false,
      legacy_taproot_addr: null,
    });
  };

  const hasWizzExtension = () => {
    return typeof window !== "undefined" && typeof window.atom !== "undefined";
  };

  const handleConnectButtonClick = () => {
    setConnectOptionsVisible(!isConnectOptionsVisible);
  };

  const handleSwitchChange = (checked: any) => {
    setNetwork(checked ? 'mainnet' : 'testnet');
    //console.log(network);
  };

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>
          {walletData.connected ? (
            <>
              {walletData.legacy_taproot_addr.slice(0, 4)}...{walletData.legacy_taproot_addr.slice(-4)}
            </>
          ) : (
            <>Connect Wallet</>
          )}
        </MenubarTrigger>
        <MenubarContent className="flex items-center flex-col gap-1">


          {walletData.connected ? (
            <>
              <Link target="_blank" href={"https://mempool.space/address/" + walletData.legacy_taproot_addr}>
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
                {window.atom ? (
                  <Button color="primary" onClick={connectWizz}>
                    Connect Wizz Wallet
                  </Button>
                ) : (
                  <Link target="_blank" href="/">
                    Please first install Wizz Wallet
                  </Link>
                )}
              </MenubarItem>
              <MenubarItem>
                {window.unisat ? (
                  <Button color="primary" onClick={connectWizz}>
                    Connect Unisat Wallet
                  </Button>
                ) : (
                  <Link target="_blank" href="/">
                    Please first install Unisat Wallet
                  </Link>
                )}
              </MenubarItem>
            </>
          )}

          <MenubarSeparator />
          <div className="w-full flex content-center items-center justify-between">
            {network === 'mainnet' ?
              <DollarIcon /> : <RepairIcon />
            }
            <Switch
              checked={network === 'mainnet'}
              onCheckedChange={handleSwitchChange}
            >
            </Switch>

          </div>

        </MenubarContent>
      </MenubarMenu>

    </Menubar>
  );
};
