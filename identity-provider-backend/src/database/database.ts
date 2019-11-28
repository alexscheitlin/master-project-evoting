import { AdapterSync } from 'lowdb'

import low from 'lowdb'
import fs from 'fs'
import FileSync from 'lowdb/adapters/FileSync'
import { Identity } from '../models'

// TODO: replace with correct type
let db: any

export const setupDB = () => {
  const adapter: AdapterSync = new FileSync('./src/database/db.json')
  db = low(adapter)

  // read identities and map them to the Identity interface
  // assumption: voters already have an existing eIdentity
  // uuids version 4 generated with: https://www.uuidgenerator.net/
  const rawIdentities = fs.readFileSync('./src/database/identities', 'utf-8')
  const identities = []
  for (const identity of rawIdentities.split('\n')) {
    const values = identity.split(':')
    identities.push(<Identity>{
      uuid: values[0],
      username: values[1],
      password: values[2],
    })
  }

  // set defaults (if JSON is empty)
  db.defaults({
    identities: identities,
    voters: [],
    tokens: []
  }).write()
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

export const getObjectFromDB = (table: string): any => {
  return db.get(table).value()
}
