import { AdapterSync } from 'lowdb'

import low from 'lowdb'
import fs from 'fs'
import FileSync from 'lowdb/adapters/FileSync'

let db: low.LowdbSync<any>

// database tables
export const STATE_TABLE: string = 'state'
export const AUTHORITIES_TABLE: string = 'authorities'
export const NODES_TABLE: string = 'nodes'
export const BALLOT_ADDRESS_TABLE: string = 'ballotAddress'
export const BALLOT_DEPLOYED_TABLE: string = 'ballotDeployed'
export const VOTING_QUESTION_TABLE: string = 'votingQuestion'
export const CHAINSPEC_TABLE: string = 'chainspec'

export const setupDB = (): void => {
  const adapter: AdapterSync = new FileSync('./src/database/db.json')
  db = low(adapter)

  const defaultConfig = JSON.parse(fs.readFileSync('./src/database/defaultChainspec.json', 'utf-8'))

  // set defaults (if JSON is empty)
  db.defaults({
    state: 'REGISTER',
    authorities: [],
    nodes: [],
    ballotAddress: '',
    ballotDeployed: false,
    votingQuestion: '',
    chainspec: defaultConfig,
  }).write()
}

export const getListFromDB = (table: string): string[] => {
  return db.get(table).value()
}

export const getValueFromDB = (table: string): any => {
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

export const setValue = (table: string, value: any): void => {
  // write the new value to the field in the DB
  db.set(table, value).value()
  db.write()
}
