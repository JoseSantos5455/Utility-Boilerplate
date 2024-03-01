import { BsTwitterX, BsLink45Deg, BsLinkedin, BsFacebook, BsYoutube, BsGithub, BsTelegram, BsDiscord, BsInstagram } from 'react-icons/bs'

export const DynamicIcon = ({url, type}: {url: string, type: string}) => {
  if (type === "official")
    return (<BsLink45Deg />)
  if (type === "x" || type === "twitter")
    return (<BsTwitterX />)
  if (type === "facebook")
    return (<BsFacebook />)
  if (type === "linkedin")
    return (<BsLinkedin />)
  if (type === "youtube")
    return (<BsYoutube />)
  if (type === "github")
    return (<BsGithub />)
  if (type === "telegram")
    return (<BsTelegram />)
  if (type === "discord")
    return (<BsDiscord />)
  if (type === "instagram")
    return (<BsInstagram />)
  return (<BsLink45Deg />)
}
