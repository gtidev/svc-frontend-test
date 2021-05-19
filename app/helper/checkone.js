const errhandler = require('./errorhandler');

module.exports = async (Knex, tablename, where = {}, bypasserr = false) => {
  try {
    const result = await Knex(tablename).select(['id']).where(where);
    if (result.length === 0) {
      if (!bypasserr) throw errhandler('Cannot find data', { tablename, where }, 403);
      return false;
    }
    return result[0];
  } catch (e) {
    throw e;
  }
};