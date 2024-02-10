<<<<<<< Updated upstream
export const Logo = ({width = 40, height = 40}: {width?: number, height?: number}) => {
  return (
    <img src={`https://www.gitbook.com/cdn-cgi/image/width=${width},dpr=2,height=${height},fit=contain,format=auto/https%3A%2F%2F2177772943-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FQSn3aNjJTHAvQ0ExJp0l%252Ficon%252FjxGzOg8J9NVHBo2Eb8T5%252Faord3.png%3Falt%3Dmedia%26token%3D0de4d867-3dae-40d6-a123-00936e14659c`} alt="" />
  )
}
=======
import Image from "next/image";
import Link from "next/link";

export const Logo = ({ width = 40, height = 40 }: { width?: number; height?: number }) => {
  return (
    <Link href="/">
      <Image width={width} height={height} src={`/plus.png`} alt="" />
    </Link>
  );
};
>>>>>>> Stashed changes
