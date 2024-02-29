import { BsTwitterX, BsLink45Deg } from 'react-icons/bs'

export const DynamicIcon = ({url, type}: {url: string, type: string}) => {
  if (type === "official")
    return (<BsLink45Deg />)
  if (type === "x" || type === "twitter")
    return (<BsTwitterX/>)
  return (<BsLink45Deg />)
}