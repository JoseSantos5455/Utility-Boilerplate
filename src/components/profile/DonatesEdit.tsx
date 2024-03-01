import { useContext, useState } from "react";
import { Button } from "../ui/button";
import DonateIcon from "./DonateIcon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AppContext } from "@/providers/AppContextProvider";

export default function DonatesEdit ({value, onEdit}: {value: any[], onEdit: Function}) {

  const { showError } = useContext(AppContext)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [address, setAddress] = useState("")
  const [type, setType] = useState("")

  const coinList = ["bitcoin", "ethereum", "litecoin", "dogecoin"]

  return (
    <>
      <div className="lg:grid lg:grid-cols-2 flex flex-col gap-x-10 gap-y-2 mt-4 mx-auto">
        {
          value.map((elem: any) => (
            <div key={elem.address} className="flex flex-row items-center gap-2 ">
              <DonateIcon type={elem.type} />
              <div>
                {elem.address.substring(0, 5)}...{elem.address.substring(elem.address.length - 5, elem.address.length)}
              </div>
            </div>
          ))
        }
      </div>
      <Button className="lg:w-1/2 w-full lg:mx-auto" onClick={() => {
        setAddress("")
        setIsDialogOpen(true)
      }}>Add address</Button>
      <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(false)} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add your donation address.</DialogTitle>
            <DialogDescription>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-row gap-4">
                  <Select value={type} onValueChange={(val: any) => setType(val)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={"Select your coin"} />
                    </SelectTrigger>
                    <SelectContent>
                      {
                        coinList.map((elem: any) => (
                          <SelectItem key={elem} value={elem}>{elem}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select> 
                  <Input 
                    value={address}
                    onChange={(event: any) => {
                      setAddress(event.target.value)
                    }}
                  />
                </div>
                <Button onClick={() => {
                  if (!type) {
                    showError("Please select token type.")
                    return
                  }
                  if (!address) {
                    showError("Please type in your address.")
                    return
                  }
                  const newValue = value
                  newValue.push({
                    type,
                    address
                  })
                  onEdit(newValue)
                  setIsDialogOpen(false)
                }}>Save</Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}