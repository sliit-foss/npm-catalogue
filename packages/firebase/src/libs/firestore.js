/* eslint-disable import/named */

import {
  getFirestore,
  collection as firebaseCollection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

let databaseInstance;

export const initialize = (app) => {
  databaseInstance = getFirestore(app);
};

export const read = ({
  collection,
  filters = [],
  sorts = [],
  recordLimit,
  onSuccess,
  onError,
}) => {
  let q = getFilteredQuery({ collection, filters, sorts });
  if (recordLimit) q = query(q, limit(recordLimit));
  return request({ func: () => getDocs(q), onSuccess, onError });
};

export const write = ({
  collection,
  documentId,
  payload,
  merge = false,
  onSuccess,
  onError,
}) => {
  let writeFunc;
  if (documentId)
    writeFunc = () =>
      setDoc(doc(databaseInstance, `${collection}/${documentId}`), payload, {
        merge,
      });
  else
    writeFunc = () =>
      addDoc(firebaseCollection(databaseInstance, collection), payload);
  return request({ func: writeFunc, onSuccess, onError });
};

export const update = ({
  collection,
  payload,
  filters = [],
  onSuccess,
  onError,
}) => {
  return updateOrDelete({
    collection,
    filters,
    onSuccess,
    onError,
    func: (id) => updateDoc(doc(databaseInstance, collection, id), payload),
  });
};

export const remove = ({ collection, filters = [], onSuccess, onError }) => {
  return updateOrDelete({
    collection,
    filters,
    onSuccess,
    onError,
    func: (id) => deleteDoc(doc(databaseInstance, collection, id)),
  });
};

const getFilteredQuery = ({ collection, filters = [], sorts = [] }) => {
  const collectionRef = firebaseCollection(databaseInstance, collection);

  let q = query(collectionRef);

  filters.forEach((filter) => {
    q = query(q, where(filter.key, filter.operator || "==", filter.value));
  });

  sorts.forEach((sort) => {
    q = query(q, orderBy(sort.key, sort.direction || "asc"));
  });

  return q;
};

const request = ({ func, onSuccess, onError }) => {
  return func()
    .then((res) => {
      if (onSuccess) onSuccess(res);
      return {
        success: true,
        data: res || false,
      };
    })
    .catch((error) => {
      if (onError) onError(error);
      return {
        success: false,
        error,
      };
    });
};

const updateOrDelete = async ({
  func,
  collection,
  filters = [],
  onSuccess,
  onError,
}) => {
  const res = await read({ collection, filters });
  if (res.success) {
    const modifiedIds = [];
    const errors = [];
    await Promise.all(
      res.data.docs.map(async (document) => {
        await func(document.id)
          .then(() => {
            modifiedIds.push(document.id);
          })
          .catch((e) => {
            errors.push(e);
          });
      })
    );
    if (errors.length > 0) {
      if (onError) onError(errors);
      return {
        success: false,
        error: errors,
        data: modifiedIds,
      };
    }
    if (onSuccess) onSuccess(modifiedIds);
    return { success: true, data: modifiedIds };
  }
  return res;
};

export default { initialize, read, write, update, remove };
