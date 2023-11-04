const throwEx = <Exception extends Error>(exception: Exception): never => {
  throw exception;
};

export default throwEx;
