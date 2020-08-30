#!/usr/bin/env node

const got = require('got')
const tar = require('tar')
const ora = require('ora')
const sade = require('sade')
const chalk = require('chalk')
const spawn = require('cross-spawn')
const { join } = require('path')
const { Stream } = require('stream')
const { execSync } = require('child_process')
const { promisify } = require('util')
const { mkdirSync, existsSync } = require('fs')

sade('parcreate <dir>', true)
    .version('2.0.0')
    .describe('Bootstrap an app bundled with Parcel.js')
    .example('my-app')
    .example('my-react-app --template react')
    .example('. --template tailwind')
    .option(
        '-t, --template',
        'Choose a template for your app (defaults to basic)'
    )
    .option('-n, --use-npm', 'Use npm instead of yarn')
    .action((dir, opts) => {
        downloadGitRepo({
            template: opts.template || 'basic',
            directory: dir,
            useNpm: !!opts['use-npm'],
        })
    })
    .parse(process.argv)

/* This code was adapted from the `create-next-app` project:
        https://github.com/vercel/next.js/blob/canary/packages/create-next-app/
*/

async function downloadGitRepo({ template, directory, useNpm }) {
    const templatesResponse = await got(
        'https://api.github.com/repos/kartiknair/parcreate/contents/templates',
        { responseType: 'json' }
    )
    const templates = templatesResponse.body.map((temp) => temp.name)

    const packageManager = useNpm ? 'npm' : yarnInstalled() ? 'yarn' : 'npm'

    const pipeline = promisify(Stream.pipeline)

    if (!templates.includes(template)) {
        console.log(`\n${chalk.red(template)} is not an available template`)
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

    const downloadSpinner = ora(
        `Downloading template files for \`${chalk.cyan(template)}\``
    ).start()

    await pipeline(
        got.stream(
            `https://codeload.github.com/kartiknair/parcreate/tar.gz/master`
        ),
        tar.extract({ cwd: join(process.cwd(), directory), strip: 3 }, [
            `parcreate-master/templates/${template}`,
        ])
    )

    downloadSpinner.succeed(
        `Downloaded files for template \`${chalk.cyan(template)}\``
    )

    console.log(
        `\nInstalling dependancies with ${chalk.cyan(
            '`' + packageManager + '`'
        )}`
    )

    const installation = spawn(packageManager, ['install'], {
        cwd: join(process.cwd(), directory),
        stdio: 'inherit',
    })

    installation.on('close', (code) => {
        if (code === 0) {
            console.log(
                '\nProject was succesfully bootstrapped. Here are the commands you have available:'
            )
            console.log('\n    Get started by changing directories:')
            console.log(chalk.cyanBright(`\n        cd ${directory}`))
            console.log('\n\n    Start the dev server:')
            console.log(
                chalk.cyanBright(
                    `\n        ${
                        packageManager === 'npm' ? 'npm run' : 'yarn'
                    } dev`
                )
            )
            console.log('\n\n    Build production-ready files:')
            console.log(
                chalk.cyanBright(
                    `\n        ${
                        packageManager === 'npm' ? 'npm run' : 'yarn'
                    } build`
                )
            )
        }
    })
}

function yarnInstalled() {
    try {
        execSync('yarnpkg --version', { stdio: 'ignore' })
        return true
    } catch (e) {
        return false
    }
}
