# @sliit-foss/request-query-utils

### A package to isolate filters and sorts from a given request's query parameters

<br/>

## Installation

```js
# using npm
npm install @sliit-foss/request-query-utils

# using yarn
yarn add @sliit-foss/request-query-utils
```

## Usage

```js
# using require
const { getRequestFilters, getRequestSorts, getRequestQueryParams } = require("@sliit-foss/request-query-utils");

# using import
import { getRequestFilters, getRequestSorts, getRequestQueryParams } from "@sliit-foss/request-query-utils";
```

## Example<br/>

- ### Example request uri - ?filter[name]=Ciri&filter[age]=19&sort=-id&sort=height
```js
const params = getRequestQueryParams({
  req, // node.js request object
});

console.log(params) // output: [{ key: 'filter[name]', value: 'Ciri' }, { key: 'filter[age]', value: '19' }, { key: 'sort', value: '-id' }, { key: 'sort', value: 'height' } ]

const filters = getRequestFilters({
  req, // node.js request object
});

console.log(filters) // output - [ { key: 'name', value: 'Ciri' }, { key: 'age', value: '19' } ]

const sorts = getRequestSorts({
  req, // node.js request object
});

console.log(sorts) // output - [ { key: 'id', value: -1 }, { key: 'height', value: 1 } ]
```

## Additional Options

- All functions can take in an addition boolean parameter **returnObject** which will return a single object with the merged values isolated from the function. The return type by default is an array.

- For example, requests to above three functions with returnObject provided as true will result in the following outputs:
```js
// getRequestQueryParams - { 'filter[name]': 'Ciri', 'filter[age]': '19', sort: '-id', 'sort-1652632797392': 'height'  }

// getRequestFilters - { name: 'Ciri', age: '19' }

// getRequestSorts - { id: -1, height: 1 }
```
- The getRequestFilters function can take in the parameter mongooseSupport which will modify the filter object in certain ways to match a mongoose filter query:

- For example, requests to above three functions with returnObject provided as true will result in the following outputs:
```js
// Request uri - ?filter[name]=Ciri&filter[age]=19,20,21,22&sort=-id&sort=height

// getRequestFilters - { name: 'Ciri', age: { $in: ['19', '20', '21', '22'] } }
```