const errhandler = require('../helper/errorhandler');
const response = require('../helper/response');
const modulelist = require('../database/modulelist');

module.exports = async (req, res, next) => {
  try {
    const forbiddenVar = [
      // 'do',
      'relation',
      'as',
      'fromto',
      'take',
      'put',
      'disable',
      'req',
      'assoc',
      'like', 'search', 'page', 'limit', 'showall',
      'where', 'show', 'count', 'sum', 'avg', 'between', 'orderby', 'groupby',
    ];

    let error;
    const tablenameKeys = Object.keys(modulelist);
    for (let el of tablenameKeys) {
      if (forbiddenVar.includes(el)) {
        if (!error) error = {};
        if (!error[el]) error[el] = [];
        error[el].push(`${el} is on forbidden variable.`);
      }
      const colnameKeys = Object.keys(modulelist[el]);

      if (colnameKeys.includes(el)) {
        if (!error) error = {};
        if (!error[el]) error[el] = [];
        error[el].push(`${el} - table name has been used on column name.`);
      }

      for (let elm of colnameKeys) {
        if (forbiddenVar.includes(elm)) {
          if (!error) error = {};
          if (!error[el]) error[el] = [];
          error[el].push(`${elm} is on forbidden variable.`);
        }

        if (elm == el) {
          if (!error) error = {};
          if (!error[el]) error[el] = [];
          error[el].push(`${elm} - column name and table name has same name.`);
        }
      }
    }

    if (error) {
      throw errhandler('Error.', error, 500);
    } else response(res, 200, 'All checked.');
  } catch (e) {
    console.log(e);
    response(res, e.code || 500, e.message, e.data || null);
  }
};