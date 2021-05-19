module.exports = (msg, data = null, code = null) => {
  const err = new Error(msg);
  err.data = data;
  err.code = code;
  
  return err;
}