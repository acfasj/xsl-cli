const path = require('path')
const execSync = require('child_process').execSync

function getRootPath() {
  return path.resolve(__dirname, '..')
}

function getPkgVersion() {
  const filepath = path.resolve(getRootPath(), 'package.json')
  return require(filepath).version
}

function printPkgVersion() {
  const version = getPkgVersion()
  console.log(`Xsl v${version}\n`)
}

function canUseYarn() {
  try {
    execSync('yarn --version', { stdion: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

function canUseGit() {
  try {
    execSync('git --version', { stdion: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

module.exports = {
  getPkgVersion,
  printPkgVersion,
  getRootPath,
  canUseYarn,
  canUseGit,
}
