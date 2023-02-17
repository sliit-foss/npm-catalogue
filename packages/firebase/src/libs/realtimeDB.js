/* eslint-disable import/named */
/* eslint-disable no-unused-vars */

import { getDatabase, ref, child, get } from "firebase/database";

let databaseInstance;

export const initialize = (app) => {
  databaseInstance = ref(getDatabase(app));
};

export const read = async ({ path }) => {
  let result;
  await get(child(databaseInstance, path))
    .then((snapshot) => {
      if (snapshot.exists())
        result = {
          success: true,
          data: snapshot.val(),
        };
    })
    .catch((error) => {
      result = {
        success: false,
        error,
      };
    });
  return result;
};

export const write = async ({ path, payload }) => {};

export const update = async ({ path, payload }) => {};

export const remove = async ({ path }) => {};

export default { initialize, read, write, update, remove };
