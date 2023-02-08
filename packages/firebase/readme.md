# @sliit-foss/firebase

### A wrapper around the [Firebase JS SDK](https://www.npmjs.com/package/firebase) with firestore and realtime database support for filtering sorting, limiting, error handling, and success scenarios

<br/>

## Installation

```js
# using npm
npm install @sliit-foss/firebase

# using yarn
yarn add @sliit-foss/firebase
```

## Usage

```js
# using require
const { firestoreService } = require("@sliit-foss/firebase");

# using import
import { firestoreService } from "@sliit-foss/firebase";
```

## Example - Firestore<br/>

```js
// read
const users = await firestoreService.read({ collectionName: "users" });

// write
const result = await firestoreService.write({
  collectionName: "users",
  payload: { name: "Ciri", age: 19 },
});

// update
const result = await firestoreService.update({
  collectionName: "users",
  payload: { age: 20 },
  filters: [
    {
      key: "name",
      operator: "==",
      value: "Ciri",
    },
  ],
});

// delete
const result = await firestoreService.remove({ collectionName: "users" });
```

## Additional Options

- The read, update and delete functions can take in the additional parameter **filters** which is an array of objects indicating the filtering criteria of the results. The supported operators are the same as the ones provided in the **firebase docs** (https://cloud.google.com/firestore/docs/query-data/queries#query_operators)

- The read function can take in the additional parameters **sorts** and **recordLimit** where sorts is an array of objects indicating the sorting criteria of the results and recordLimit is an integer which limits the number of records returned from the query.

- The write function can take in the additional parameters **documentId** which will allow you to create documents with a provided documentId as opposed to its auto generated behavior and **merge** which will allow you to merge the newly provided payload with the existing data at the provided path if it exists.

- All functions can take in the additional parameters **onSuccess** and **onError** which are callback functions which will get executed on success and failure scenarios respectively. **The onSuccess callback is passed the result of the operation as a parameter by default** whereas **the onError function is passed the error or details of the error which occurred**.<br/><br/>

---

<br/>Based on the original cloud firebase package by Google (https://www.npmjs.com/package/firebase)
