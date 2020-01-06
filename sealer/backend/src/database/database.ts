/*eslint @typescript-eslint/no-explicit-any: "off"*/

import low, { AdapterSync } from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import path from 'path'

export const WALLET_TABLE = 'wallet'
export const PASSWORD_TABLE = 'password'
export const BALLOT_ADDRESS_TABLE = 'ballotAddress'
export const PRIVATE_KEY_SHARE_TABLE = 'privateKeyShare'
export const PUBLIC_KEY_SHARES_TABLE = 'publicKeyShare'

let db: low.LowdbSync<any>

export const setupDB = (): void => {
  const adapter: AdapterSync = new FileSync(path.join(__dirname, 'db.json'))
  db = low(adapter)

  // set defaults (if JSON is empty)
  db.defaults({
    wallet: '',
    password: '',
    ballotAddress: '',
    privateKeyShare: '',
    publicKeyShare: '',
  }).write()
}

export const setValue = (table: string, value: any | any[]): void => {
  // write the new value to the field in the DB
  db.set(table, value).value()
  db.write()
}

export const getListFromDB = (table: string): any[] => {
  return db.get(table).value()
}

export const getValueFromDB = (table: string): string => {
  return db.get(table).value()
}

export const getObjectFromDB = (table: string): {} => {
  return db.get(table).value()
}

export const addToList = (table: string, value: any[]): void => {
  // read content from DB + add the new value
  const tableContent: string[] = getListFromDB(table)
  tableContent.push(...value)

  // write the content to the DB
  db.set(table, tableContent).value()
  db.write()
}
