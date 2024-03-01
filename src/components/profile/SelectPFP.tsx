import ImageFromData from "../common/ImageFromData"
import ImageFromDataClickable from "../common/ImageFromDataClickable"

export default function SelectPFP ({ value, onClick = (f: any) => f }: { value: string, onClick: Function }) {
  if (!value)
    return (
      <div className="rounded-lg outline-1 outline-dashed w-[144px] h-[144px] m-auto cursor-pointer" onClick={() => onClick()}><div className="pt-10">Click to choose your PFP</div></div>
    )

  return (
    <div className="cursor-pointer">
      <ImageFromDataClickable onClick={() => onClick()} data={value} />
    </div>
  )
}