# @sliit-foss/babel-plugin-transform-trace

> Adds tracing to the source code during transformation

> The transformed code will need the following package installed to be able to successfully run :- [@sliit-foss/functions]('https://www.npmjs.com/package/@sliit-foss/functions')

## Install

Using npm:

```sh
npm install --save-dev @sliit-foss/babel-plugin-transform-trace
```

or using yarn:

```sh
yarn add @sliit-foss/babel-plugin-transform-trace --dev
```

## Note

- The transpiled code uses top level awaits which in order to be run will require Node.JS version >= 14 and the `type` to be specified as `module` in your package.json file
