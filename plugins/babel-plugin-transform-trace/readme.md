# @sliit-foss/babel-plugin-transform-trace

> Adds tracing to the source code during transpilation

> The transformed code will need the following package installed to be able to successfully run :- [@sliit-foss/functions]('https://www.npmjs.com/package/@sliit-foss/functions')

<br/>

## Install

<br/>

Using npm:

```sh
npm install --save-dev @sliit-foss/babel-plugin-transform-trace
```

or using yarn:

```sh
yarn add @sliit-foss/babel-plugin-transform-trace --dev
```

<br/>

## Options

- **ignore-functions**: Array of function names to ignore when adding tracing
- **clean**: Boolean value which when `true` omits the default behaviour of tracing anonymous functions which can pollute the logs

---

- Example babel config:-

  ```json
  {
    "plugins": [
      [
        "@sliit-foss/babel-plugin-transform-trace",
        {
          "ignore-functions": ["foo", "bar"],
          "clean": true
        }
      ]
    ]
  }
  ```
