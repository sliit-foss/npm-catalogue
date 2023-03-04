const resolver = async (fn, fullRes = false) => {
  const response = await fn();
  return fullRes ? response : response?.data?.data ?? response?.data;
};

export default resolver;
