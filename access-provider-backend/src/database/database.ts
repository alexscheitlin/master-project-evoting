import { AdapterSync } from 'lowdb'

import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

let db: low.LowdbSync<any>

// database tables
export const DOES_ACCOUNT_EXIST: string = 'doesAccountExist'
export const REGISTERED_VOTERS_TABLE: string = 'voters'
export const VALID_TOKENS_TABLE: string = 'validSignupTokens'
export const USED_TOKENS_TABLE: string = 'usedSignupTokens'

export const setupDB = (): void => {
  const adapter: AdapterSync = new FileSync('./src/database/db.json')
  db = low(adapter)

  // set defaults (if JSON is empty)
  db.defaults({
    doesAccountExist: false,
    voters: [],
    validSignupTokens: [],
    usedSignupTokens: [],
  }).write()
}

export const getListFromDB = (table: string): string[] => {
  return db.get(table).value()
}

export const getValueFromDB = (table: string): string => {
  return db.get(table).value()
}

export const getObjectFromDB = (table: string): any => {
  return db.get(table).value()
}

export const addToList = (table: string, value: string[]): void => {
  // read content from DB + add the new value
  const tableContent: string[] = getListFromDB(table)
  tableContent.push(...value)

  // write the content to the DB
  db.set(table, tableContent).value()
  db.write()
}

export const setValue = (table: string, value: string): void => {
  // write the new value to the field in the DB
  db.set(table, value).value()
  db.write()
}
