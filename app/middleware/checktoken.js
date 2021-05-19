const errhandler = require('../helper/errorhandler');
const response = require('../helper/response');
const uuidtoid = require('../helper/uuidtoid');
const modulelist = require('../database/modulelist');

const jwthelper = require('../helper/jwthelper');
const checkone = require('../helper/checkone');

module.exports = async (req, res, next) => {
  try {
    const { headers } = req;
    if (headers.token) {
      const { token } = headers;
      const data = await jwthelper.check(token, 'aes', true, true);
      req.token = data;
    }

    req.modulelist = modulelist;
    next();
  } catch (e) {
    console.log(e);
    response(res, e.code || 500, e.message, e.data || null);
  }
};