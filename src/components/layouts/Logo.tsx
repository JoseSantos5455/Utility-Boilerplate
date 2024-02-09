import Image from "next/image"

export const Logo = ({width = 40, height = 40}: {width?: number, height?: number}) => {
  return (
    <Image 
      width={width}
      height={height}
      src={`/bull.jpg`} 
      alt=""
    />
  )
}