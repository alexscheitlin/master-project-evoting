import { AdapterSync } from 'lowdb'
import path from 'path'

import low from 'lowdb'
import fs from 'fs'
import FileSync from 'lowdb/adapters/FileSync'
import { Identity } from '../models'

let db: low.LowdbSync<any>

// database tables
export const IDENTITIES_TABLE: string = 'identities'
export const TOKENS_TABLE: string = 'tokens'

export const setupDB = (): void => {
  const adapter: AdapterSync = new FileSync(path.join(__dirname, 'db.json'))
  db = low(adapter)

  // read identities and map them to the Identity interface
  // assumption: voters already have an existing eIdentity
  // uuids version 4 generated with: https://www.uuidgenerator.net/
  const rawIdentities = fs.readFileSync(path.join(__dirname, 'identities'), 'utf8')
  const identities = []
  for (const identity of rawIdentities.split('\n')) {
    const values = identity.split(':')
    identities.push({
      uuid: values[0],
      username: values[1],
      password: values[2],
    } as Identity)
  }

  // set defaults (if JSON is empty)
  db.defaults({
    identities: identities,
    tokens: [],
  }).write()
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

export const addToList = (table: string, value: any[]): void => {
  // read content from DB + add the new value
  const tableContent: string[] = getListFromDB(table)
  tableContent.push(...value)

  // write the content to the DB
  db.set(table, tableContent).value()
  db.write()
}

export const setValue = (table: string, value: any | any[]): void => {
  // write the new value to the field in the DB
  db.set(table, value).value()
  db.write()
}
