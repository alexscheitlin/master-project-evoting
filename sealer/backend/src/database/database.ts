import low, { AdapterSync } from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

export const WALLET_TABLE = 'wallet'
export const PASSWORD_TABLE = 'password'
export const BALLOT_ADDRESS_TABLE = 'ballotAddress'
export const PRIVATE_KEY_SHARE_TABLE = 'privateKeyShare'
export const PUBLIC_KEY_SHARES_TABLE = 'publicKeyShare'

// TODO: replace with correct type
let db: any

export const setupDB = () => {
  const adapter: AdapterSync = new FileSync('./src/database/db.json')
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

export const addToList = (table: string, value: any[]) => {
  // read content from DB + add the new value
  const tableContent: string[] = getListFromDB(table)
  tableContent.push(...value)

  // write the content to the DB
  db.set(table, tableContent).value()
  db.write()
}

export const setValue = (table: string, value: any | any[]) => {
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

export const getObjectFromDB = (table: string): any => {
  return db.get(table).value()
}
