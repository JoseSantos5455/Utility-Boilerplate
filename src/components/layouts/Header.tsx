
"use client"

import { Logo } from "./Logo"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useRouter } from "next/navigation"
import { WalletConnect } from "../WalletConnect"
import { ModeToggle } from "../ui/ModeToggle"



export const Header = () => {

  const router = useRouter()

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
      text: "Mint Subrealm",
      href: "/mint-subrealm"
    },
    {
      text: "My Assets",
      href: "/my-assets"
    },
    {
      text: "Profile",
      href: "/profile"
    },
  ]

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

        <ModeToggle />

        <WalletConnect />

      </Menubar>

    </>
  )
}