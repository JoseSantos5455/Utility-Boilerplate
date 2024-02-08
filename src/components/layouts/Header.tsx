import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } from "@nextui-org/react"

import { Logo } from "./Logo"
import { WalletConnect } from "@/components/WalletConnect"

export const Header = () => {

  const menuItems = [
    {
      text: "Realm",
      href: "/realms"
    },
    {
      text: "Subrealms",
      href: "/sub-realms"
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
        </NavbarContent>

      </Navbar>
    </>
  )
}