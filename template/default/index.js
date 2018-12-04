const fse = require('fs-extra')
const ora = require('ora')
const chalk = require('chalk')
const shelljs = require('shelljs')

module.exports = function create(project) {
  fse.mkdirSync(project.dst)
  process.chdir(project.dst)

  project.copy('package', 'package.json')
  project.copy('editorconfig', '.editorconfig')
  project.copy('gitignore', '.gitignore')
  project.copy('eslintrc', '.eslintrc.js')
  project.copy('prettierrc', '.prettierrc')
  project.copy('index', 'index.js')

  project.fs.commit(() => {
    // git init
    if (project.canUseGit) {
      const gitInitSpinner = ora(`执行 ${chalk.cyan.bold('git init')}`).start()
      const gitInit = shelljs.exec('git init', { silent: true })
      if (gitInit.code === 0) {
        gitInitSpinner.color = 'green'
        gitInitSpinner.succeed(gitInit.stdout)
      } else {
        gitInitSpinner.color = 'red'
        gitInitSpinner.fail(gitInit.stderr)
      }
    }

    // npm/yarn install
    let installCmd
    if (project.canUseYarn) {
      installCmd = 'yarn install'
    } else {
      installCmd = 'npm install'
    }
    const installSpinner = ora(
      `执行安装项目依赖 ${chalk.cyan.bold(installCmd)}, 需要一会儿...`
    ).start()
    const install = shelljs.exec(installCmd, { silent: true })
    if (install.code === 0) {
      installSpinner.color = 'green'
      installSpinner.succeed('安装成功')
      console.log(`${install.stderr}${install.stdout}`)
    } else {
      installSpinner.color = 'red'
      installSpinner.fail(chalk.red('安装项目依赖失败，请自行重新安装！'))
      console.log(`${install.stderr}${install.stdout}`)
    }

    console.log(
      chalk.green(`创建项目 ${chalk.green.bold(project.projectName)} 成功！`)
    )
    console.log(
      chalk.green(
        `请进入项目目录 ${chalk.green.bold(project.projectName)} 开始工作吧！😝`
      )
    )
  })
}
