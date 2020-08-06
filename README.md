# Parcreate

![npm](https://img.shields.io/npm/v/parcreate) ![License](https://img.shields.io/npm/l/parcreate)

Super simple project bootstrapping with [Parcel Bundler](https://parceljs.org).

```shell
npx parcreate example

# Or with a template:

npx parcreate example --template tailwind


# If you don't have npm>5.2.0
#    this method is not reccommended as you have to manually
#    make sure you're using the latest version everytime

npm i -g parcreate
parcreate example --template react
```

### Current list of templates:

-   `basic`
-   `tailwind`
-   `react`

### Help text:

```shell
$ parcreate <dir> [options]

Options
    -t, --template    Choose a template for your app (defaults to basic)

Examples
    $ parcreate my-app
    $ parcreate my-react-app --template react
    $ parcreate . --template tailwind
```
