import Link from "next/link"
import { useContext, useState } from "react"
import { DynamicIcon } from "./DynamicIcon"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { AppContext } from "@/providers/AppContextProvider"

export default function NameEdit({value, onEdit}: {value: any[], onEdit: Function}) {
  const { showError } = useContext(AppContext)

  const [links, setLinks] = useState<any>(value)
  const [isInsertDialogOpen, setIsInsertDialogOpen] = useState(false)
  const [toAddLink, setToAddLink] = useState("")

  const parseLinkAndInsert = (link: string) => {
    let type = "official", name = "unknown"
    if (link.indexOf("x.com") > -1 || link.indexOf("twitter.com") > -1) {
      type = "x"
    }
    if (link.indexOf("facebook.com") > -1) {
      type = "facebook"
    }
    if (link.indexOf("youtube.com") > -1) {
      type = "youtube"
    }
    if (link.indexOf("github.com") > -1) {
      type = "github"
    }
    if (link.indexOf("linkedin.com") > -1) {
      type = "linkedin"
    }
    if (link.indexOf("t.me") > -1) {
      type = "telegram"
    }
    if (link.indexOf("discord.com") > -1 || link.indexOf("discord.gg") > -1) {
      type = "discord"
    }
    if (link.indexOf("instagram.com") > -1) {
      type = "instagram"
    }

    let toBeSplit = link
    if (toBeSplit.endsWith("/") || toBeSplit.endsWith("\\")) 
      toBeSplit = toBeSplit.substring(0, toBeSplit.length - 1)
    const splits = toBeSplit.split("/")
    if (splits.length > 0)
      name = splits[splits.length - 1]

    let newLinks = links
    newLinks.push({
      type,
      name,
      url: link
    })
    setLinks(newLinks)
    onEdit(newLinks)
  }

  return (
    <>
      <div className="lg:grid lg:grid-cols-2 flex flex-col gap-x-10 gap-y-2 mx-auto">
        {
          links.map((elem: any) => (
            <Link href={elem.url} target="_blank" key={`${elem.type}${elem.url}${elem.type}`}>
              <span className="flex flex-row items-center gap-2">
                <DynamicIcon url={elem.url} type={elem.type} />{elem.name}
              </span>
            </Link>
          ))
        }
      </div>
      <Button 
        className="lg:w-1/2 w-full lg:mx-auto"
        onClick={() => {
          setToAddLink("https://")
          setIsInsertDialogOpen(true)
        }}
      >
        Add Link
      </Button>
      <Dialog open={isInsertDialogOpen} onOpenChange={() => setIsInsertDialogOpen(false)} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add your social link.</DialogTitle>
            <DialogDescription>
              <Input 
                value={toAddLink}
                className="my-4"
                onChange={(event: any) => {
                  setToAddLink(event.target.value)
                }}
              />
              <Button onClick={() => {
                if (!toAddLink.startsWith("https://")) {
                  showError("Please input valid link starting with \"https://\"")
                  return
                }
                if (toAddLink.split(".").length < 2) {
                  showError("Social links should not be empty.")
                  return
                }
                parseLinkAndInsert(toAddLink)
                setIsInsertDialogOpen(false)
              }}>Save</Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}