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
      const data = await jwthelper.check(token, 'base64', true, true);
      req.token = data;
    }

    if (headers['app-key'] || req.query['app-key']) {
      const appKey = headers['app-key'] || req.query['app-key'];
      const appData = await checkone(req.Knex, 'application', { uuid: appKey }, true);
      if (!appData) throw errhandler('app-key incorrect.', appKey, 403);
      req.application_id = appData.id.toString();
    }

    req.modulelist = modulelist;
    next();
  } catch (e) {
    console.log(e);
    response(res, e.code || 500, e.message, e.data || null);
  }
};