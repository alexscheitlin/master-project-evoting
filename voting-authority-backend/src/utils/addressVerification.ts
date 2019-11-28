import web3 from 'web3'
import { getListFromDB } from '../database/database'

export const hasAddressAlreadyBeenRegistered = (table: string, address: string): boolean => {
  // needs to be done in two steps -> includes cannot be chained, otherwise getListFromDB won't work any more
  const registeredAddressess = getListFromDB(table)
  return !registeredAddressess.includes(address)
}

export const verifyAddress = (table: string, address: string): boolean => {
  return web3.utils.isAddress(address) && hasAddressAlreadyBeenRegistered(table, address)
}
