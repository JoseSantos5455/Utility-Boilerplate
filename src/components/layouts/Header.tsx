import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react"

import { Logo } from "./Logo"
import { WalletConnect } from "@/common/WalletConnect"

export const Header = () => {

  const menuItems = [
    {
      text: "Realms",
      href: "/realms"
    },
    {
      text: "Mine Subrealms",
      href: "/mine-subrealm"
    },
    {
      text: "Inscribe",
      href: "/inscribe"
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
        </NavbarContent>

      </Navbar>
    </>
  )
}