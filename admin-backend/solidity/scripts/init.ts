import { createBuildFolder, compileContracts } from './compile'
import { deployContract } from './deploy'

createBuildFolder()
compileContracts()
deployContract()
