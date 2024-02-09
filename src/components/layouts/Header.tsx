"use client"
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Switch } from "@nextui-org/react"

import { Logo } from "./Logo"
import { useContext } from "react"
import { NetworkContext } from "@/common/NetworkContextProvider"
import { WalletConnect } from "@/components/WalletConnect"

export const Header = () => {

  const { network, setNetwork } = useContext(NetworkContext)

  const menuItems = [
    {
      text: "Explore",
      href: "/explore"
    },
    {
      text: "Check",
      href: "/check"
    },
    {
      text: "My Assets",
      href: "/my-assets"
    }
  ]

  return (
    <>
      <Navbar>
        
        <NavbarBrand>
          <Logo />
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {
            menuItems.map((item: any) => (
              <NavbarItem key={item.href}>
                <Link color="foreground" href={item.href}>{item.text}</Link>
              </NavbarItem>
            ))
          }
        </NavbarContent>

        <NavbarContent justify="end">
          <WalletConnect />
          <Switch
            defaultSelected
            size="lg"
            color="primary"
            isSelected={network === 'mainnet'}
            onValueChange={isSelected => setNetwork(isSelected ? 'mainnet' : 'testnet')}
          >
            {network}
          </Switch>
        </NavbarContent>

      </Navbar>
    </>
  )
}