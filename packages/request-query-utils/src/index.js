export const getRequestFilters = ({ req, returnObject = false, mongooseSupport = false }) => {
  const res = getRequestQueryParams({ req, returnObject });

  const replaceFunction = (str) =>
    str.replaceAll("filter[", "").replaceAll("]", "");

  const filterCheck = (key) => key.includes("filter");

  if (returnObject) {
    let filterObject = {};
    Object.keys(res).forEach((key) => {
      if (filterCheck(key)) filterObject[replaceFunction(key)] = res[key];
    });
    if (mongooseSupport) {
      filterObject = Object.keys(filterObject).reduce((acc, key) => {
        if (filterObject[key].includes(',')) {
          acc[key] = { $in: filterObject[key].split(',') };
        } else {
          acc[key] = filterObject[key];
        }
        return acc
      }, {})
    }
    return filterObject;
  } else {
    return res
      .filter((filter) => filterCheck(filter.key))
      .map((filter) => {
        filter.key = replaceFunction(filter.key);
        return filter;
      });
  }
};

export const getRequestSorts = ({ req, returnObject = false }) => {
  const res = getRequestQueryParams({ req, returnObject });

  const sortCheck = (key) => key.includes("sort");

  const getFormattedSort = (value) => {
    let direction = 1;
    if (value.startsWith("-")) {
      direction = -1;
      value = value.replace("-", "");
    }
    return {
      key: value,
      value: direction,
    };
  };

  if (returnObject) {
    const sortObject = {};
    Object.keys(res).forEach((key) => {
      if (sortCheck(key))
        sortObject[getFormattedSort(res[key]).key] = getFormattedSort(
          res[key]
        ).value;
    });
    return sortObject;
  } else {
    return res
      .filter((filter) => sortCheck(filter.key))
      .map((filter) => getFormattedSort(filter.value));
  }
};

export const getRequestQueryParams = ({ req, returnObject = false }) => {
  let res = returnObject ? {} : [];
  const query = decodeURIComponent(req.originalUrl).split("?");
  if (query.length > 1) {
    query[1].split("&").forEach((param) => {
      let [key, value] = param.split("=");
      if (_isRegex(value)) value = new RegExp(value.slice(1, -1));
      if (returnObject) {
        if (res[key]) {
          const genKey = `${key}-${Date.now()}`;
          res[genKey] = value;
        } else res[key] = value;
      } else res.push({ key, value });
    });
  }
  return res;
};

export const mapToFilterQuery = (filters) => {
  return Object.keys(filters).map((key) => {
    return `filter[${key}]=${filters[key]}`
  }).join("&")
}

const _isRegex = (s) => {
  try {
    const m = s.match(/^([/~@;%#'])(.*?)\1([gimsuy]*)$/);
    return m ? !!new RegExp(m[2], m[3])
      : false;
  } catch (e) {
    return false
  }
}

export default {
  getRequestFilters,
  getRequestSorts,
  getRequestQueryParams,
  mapToFilterQuery
}