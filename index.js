#!/usr/bin/env node

const got = require('got')
const tar = require('tar')
const sade = require('sade')
const ora = require('ora')
const chalk = require('chalk')
const { spawn } = require('child_process')
const { join } = require('path')
const { Stream } = require('stream')
const { promisify } = require('util')
const { readdirSync, mkdirSync, existsSync } = require('fs')

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const templates = readdirSync(join(__dirname, './templates'))

sade('parcreate [dir]', true)
    .version('2.0.0')
    .describe('Bootstrap an app bundled with Parcel.js')
    .example('my-app')
    .example('my-react-app --template react')
    .example('. --template tailwind')
    .option(
        '-t, --template',
        'Choose a template for your app (defaults to basic)'
    )
    .action((dir, opts) => {
        downloadGitRepo({ template: opts.template || 'basic', directory: dir })
    })
    .parse(process.argv)

/* This code was taken from the `create-next-app` project:
        https://github.com/vercel/next.js/blob/canary/packages/create-next-app/
*/

async function downloadGitRepo({ template, directory }) {
    const pipeline = promisify(Stream.pipeline)

    if (!templates.includes(template)) {
        console.log(`\n${chalk.red(template)} is not an available template`)
        process.exit(1)
    }

    if (!directory) {
        console.log(
            `\n${chalk.red(
                'Please specify a directory'
            )}\n\nSee examples with the ${chalk.cyan('`--help`')} command`
        )
        process.exit(1)
    }

    if (directory !== '.' && existsSync(directory)) {
        console.log(
            `\n${chalk.red(
                'The directory already exists.'
            )}\n\nIf you would like to create a project inside that directory,\n${chalk.cyan(
                '`cd`'
            )} into it & use '.' as the directory argument`
        )
        process.exit(1)
    }

    if (!existsSync(directory)) mkdirSync(join(process.cwd(), directory))

    const downloadSpinner = ora('Downloading template files').start()

    await pipeline(
        got.stream(
            `https://codeload.github.com/kartiknair/parcreate/tar.gz/master`
        ),
        tar.extract({ cwd: join(process.cwd(), directory), strip: 3 }, [
            `parcreate-master/templates/${template}`,
        ])
    )

    downloadSpinner.succeed('Downloaded files')

    console.log(`\nInstalling dependancies with ${chalk.cyan('`npm`')}`)

    const npmInstall = spawn(npm, ['install'], {
        cwd: join(process.cwd(), directory),
        stdio: 'inherit',
    })

    npmInstall.on('close', (code) => {
        if (code === 0) {
            console.log(
                '\nProject was succesfully bootstrapped. Here are the commands you have available:'
            )
            console.log('\n    Get started by changing directories:')
            console.log(chalk.cyanBright(`\n        cd ${directory}`))
            console.log(chalk.gray('\n\n    Start the dev server:'))
            console.log(chalk.cyanBright(`\n        npm run dev`))
            console.log('\n\n    Build production-ready static files:')
            console.log(chalk.cyanBright(`\n        npm run build`))
        }
    })
}
