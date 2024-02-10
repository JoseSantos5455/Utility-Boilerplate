<<<<<<< Updated upstream
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react"

import { Logo } from "./Logo"
import { WalletConnect } from "@/common/WalletConnect"

import { useState } from "react"
=======
"use client"

import { Logo } from "./Logo"
import { useContext } from "react"
import { WalletConnect } from "@/components/WalletConnect"
import { DollarIcon } from "@/components/icons/DollarIcon"
import { RepairIcon } from "@/components/icons/RepairIcon"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useRouter } from "next/navigation"
import { Switch } from "../ui/switch"

>>>>>>> Stashed changes


<<<<<<< Updated upstream
export const Header = () => {
=======

  const router = useRouter()
>>>>>>> Stashed changes

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

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <Menubar className="flex justify-between p-6">
        <Logo />

        <MenubarMenu >
          <MenubarTrigger>Menu</MenubarTrigger>
          <MenubarContent className="flex flex-col gap-2">
            {
              menuItems.map((item: any) => (
                <MenubarItem key={item.href} onClick={() => router.push(item.href)}>
                  {item.text}
                </MenubarItem>
              ))
            }

          </MenubarContent>
        </MenubarMenu>

        <WalletConnect />

<<<<<<< Updated upstream
        <NavbarContent justify="end">
          <WalletConnect />
        </NavbarContent>
=======
      </Menubar>
>>>>>>> Stashed changes

    </>
  )
}