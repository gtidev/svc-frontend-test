module.exports = async (res, code, msg, data = null) => {
  const initCode = require('./htmlcode');

  if (!initCode[code]) {
    if (Number.isInteger(code)) {
      return res.status(code).json({
        status: null,
        code,
        message: 'response - code not found on init.',
        data : {
          code,
          'only-accept': initCode,
        },
      });
    } else {
      return res.status(500).json({
        status: 'Undefined',
        code,
        message: msg,
        data,
      });
    }
  }
  
  return res.status(code).json({
    status: initCode[code],
    code,
    message: msg,
    data,
  });
}