const util = require('util')
const exec = util.promisify(require('child_process').exec)

/**
 *
 * @param fileLocation the location of the script given from the root of the project (e.g., "src/test.sh")
 */
export const runScript = async (fileLocation: string) => {
  try {
    const { stdout, stderr } = await exec(`bash ${fileLocation}`)
    return { stdout, stderr }
  } catch (err) {
    return err
  }
}
