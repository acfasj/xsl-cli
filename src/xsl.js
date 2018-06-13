#! /usr/bin/env node

const path = require('path')
const program = require('commander')
const inquirer = require('inquirer')
const chalk = require('chalk')
const shell = require('shelljs')
const dowloadRepo = require('download-git-repo')

const repos = [
  {
    name: 'eslint-template',
    value: 'acfasj/eslint-template'
  },
  {
    name: 'koa-template',
    value: 'acfasj/koa-template'
  }
]

/**
 * version 0.0.1
 */
program
  .version('0.1.0')
  .usage('<command> [options]')
  .description('An application for download personal templates')

/**
 * xsl init
 */
program
  .command('init')
  .description('选择项目模板来来初始化项目')
  .action(() => {
    const config = {
      name: '',
      templateName: '',
      templateUrl: ''
    }
    const prompts = []

    if (!config.templateUrl) {
      prompts.push({
        type: 'list',
        name: 'templateUrl',
        message: '选择一个项目模板',
        choices: [...repos]
      })
    }

    if (!config.name) {
      prompts.push({
        type: 'input',
        name: 'name',
        message: '输入项目名称'
      })
    }

    inquirer.prompt(prompts)
      .then(res => {
        config.name = res.name
        config.templateUrl = res.templateUrl
        return config
      })
      .then(config => {
        console.log('下载中, 请等待...')
        dowloadRepo(config.templateUrl, config.name, err => {
          if (err) {
            console.log(chalk.bgRed('下载模板文件出错, 请稍后再试'))
            console.log(chalk.bgRed(err))
            return
          }
          const pwd = shell.pwd().toString()
          const projectDir = path.resolve(pwd, config.name)
          console.log(chalk.green(`下载成功, 项目文件夹位于${projectDir}`))
        })
      })
  })

// parse process.argv
program.parse(process.argv)

// 如果没有命令, 显示help
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
