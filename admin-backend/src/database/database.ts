import { AdapterSync } from 'lowdb'

import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

// TODO: replace with correct type
let db: any

export const setupDB = () => {
  const adapter: AdapterSync = new FileSync('./src/database/db.json')
  db = low(adapter)

  // set defaults (if JSON is empty)
  db.defaults({ voters: [], usedSignupTokens: [], validSignupTokens: [], cantons: [], state: 'PRE_VOTING' }).write()
}

export const addToList = (table: string, value: string) => {
  // read content from DB + add the new value
  const tableContent: string[] = getListFromDB(table)
  tableContent.push(value)

  // write the content to the DB
  db.set(table, tableContent).value()
  db.write()
}

export const setValue = (table: string, value: string) => {
  // write the new value to the field in the DB
  db.set(table, value).value()
  db.write()
}

export const getListFromDB = (table: string): string[] => {
  return db.get(table).value()
}

export const getValueFromDB = (table: string): string => {
  return db.get(table).value()
}
