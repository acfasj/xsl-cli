const chalk = require('chalk')
const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')
const memFs = require('mem-fs')
const editor = require('mem-fs-editor')
const { getRootPath, canUseYarn, canUseGit } = require('./helper')

const templateList = [
  {
    name: '默认模板',
    value: 'default',
  },
]

/**
 * 主要是为了传配置参数和添加一些公共方法
 * 然后调用 template 目录里的 index.js 真正写入
 */
class Project {
  constructor(opts) {
    console.log(chalk.green(`即将创建一个新项目!`))

    const store = memFs.create()
    this.fs = editor.create(store)
    this.conf = Object.assign(
      {
        projectName: null,
        template: null,
      },
      opts
    )

    this.ask().then(answers => {
      this.conf = Object.assign(this.conf, answers)
      Object.assign(this, this.conf)
      this.src = path.resolve(getRootPath(), 'template', this.conf.template)
      this.dst = path.resolve(process.cwd(), this.conf.projectName)
      this.canUseYarn = canUseYarn()
      this.canUseGit = canUseGit()
      this.create()
    })
  }

  ask() {
    const prompts = []
    const conf = this.conf

    // projectName
    if (typeof conf.projectName !== 'string') {
      prompts.push({
        type: 'input',
        name: 'projectName',
        message: '请输入项目名称',
        validate(val) {
          if (!val) return '项目名称不能为空'
          if (fs.existsSync(val)) {
            return '当前目录已经存在同名项目，请换一个项目名'
          }
          return true
        },
      })
    } else if (fs.existsSync(conf.projectName)) {
      prompts.push({
        type: 'input',
        name: 'projectName',
        message: '当前目录已经存在同名项目，请换一个项目名',
        validate(val) {
          if (!val) return '项目名称不能为空'
          if (fs.existsSync(val)) return '项目名依然重复'
          return true
        },
      })
    }

    // template
    if (typeof conf.template !== 'string') {
      prompts.push({
        type: 'list',
        name: 'template',
        message: '请选择模板',
        choices: templateList,
      })
    } else {
      const isTplExisted = templateList.some(
        item => item.value === conf.template
      )
      if (!isTplExisted) {
        console.log(chalk.red('你选择的模板不存在'))
        console.log(chalk.red('目前提供了以下模板以供使用:'))
        templateList.forEach(item => {
          console.log(chalk.green(`- ${item.name}`))
        })
        process.exit(1)
      }
    }

    return inquirer.prompt(prompts)
  }

  create() {
    const realCreate = require(path.join(this.src, 'index.js'))
    realCreate(this, this.conf)
  }

  copy(from, to, data = Object.assign({}, this), opts = {}) {
    console.log(path.resolve(this.dst, to))
    this.fs.copyTpl(
      path.resolve(this.src, from),
      path.resolve(this.dst, to),
      data,
      opts
    )
  }
}

module.exports = Project
