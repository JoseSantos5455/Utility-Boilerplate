import ImageFromDataClickable from "../common/ImageFromDataClickable"

export default function ClickToChoosePFP ({ atomicalId, data, onClick = (f: any) => f }: { atomicalId: string, data: string, onClick: Function }) {
  if (!atomicalId || !data)
    return (
      <div className="rounded-lg outline-1 outline-dashed w-[144px] h-[144px] m-auto cursor-pointer" onClick={() => onClick()}><div className="pt-10">Click to choose your PFP</div></div>
    )

  return (
    <div className="cursor-pointer">
      <ImageFromDataClickable onClick={() => onClick()} data={data} />
    </div>
  )
}