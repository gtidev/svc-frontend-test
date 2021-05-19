const errhandler = require('./errorhandler');
module.exports = (variable, varName, returning = false) => {
  try {
    if (typeof variable === 'undefined') throw errhandler(`${varName} not found.`, 400);
    if (variable === '') throw errhandler(`${varName} is empty.`, 400);
    if (returning) return true;
  } catch (e) {
    if (returning) return false;
    throw e;
  }
}