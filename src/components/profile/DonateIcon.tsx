import { BitcoinIcon } from '@/components/icons/BitcoinIcon'
import { BsCurrencyBitcoin } from 'react-icons/bs'
import { EthereumIcon } from '../icons/EthereumIcon'
import { LitecoinIcon } from '../icons/LitecoinIcon'
import { DogecoinIcon } from '../icons/DogecoinIcon'

export default function DynamicIcon ({ type }: { type: string }) {
  if (type === "bitcoin")
    return (<BitcoinIcon />)
  if (type === "ethereum")
    return (<EthereumIcon />)
    if (type === "litecoin")
    return (<LitecoinIcon />)
  if (type === "dogecoin")
    return (<DogecoinIcon />)
  return (<BsCurrencyBitcoin />)
}
