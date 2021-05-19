
const errhandler = require('../helper/errorhandler');
const checkone = require('../helper/checkone');
const moment = require('moment');

exports.manipulate = async (tableInit, tablename, additional = {}) => {
  const { Knex, transKnex, value, where, type, id } = additional;
  try {
    if (!type) throw errhandler('Type must be specified.', type, 400);
    if (!['insert', 'update', 'delete'].includes(type)) throw errhandler(`Type must be 'insert' or 'update'.`, type, 400);

    const { modulelist, info, sanitizing } = await tableInit(tablename, Knex);
    const { required, insertAble, updateAble } = info;

    let processing;

    if (type === 'delete') {

      if (!id) throw errhandler('Cannot find id when deleting.', null, 400);
      processing = transKnex(tablename).where({ id }).del();
      
    } else {
      if (value.direct_id || value.direct_source) {
        if (value.direct_id && value.direct_source) {
          await tableInit(value.direct_source, Knex);
          if (value.direct_id) await checkone(Knex, value.direct_source, { id: value.direct_id });
        } else {
          throw errhandler('Cannot find direct_id or direct_source', value, 400);
        }
      }
  
      const valueKeys = Object.keys(value);
      for (let el of valueKeys) {
        // console.log(el, value[el]);
        if (modulelist[el].inenum)
          if (!modulelist[el].inenum.includes(value[el])) 
            throw errhandler(`Value not in enum: ${el}`, { inenum: modulelist[el].inenum, data: value[el] }, 400);
  
        if (typeof modulelist[el].allowNull !== 'undefined')
          if (modulelist[el].allowNull === false && value[el] === '')
            throw errhandler(`Value cannot empty: ${el}`, { data: el }, 400);
  
        if (typeof value[el] !== 'string' && value[el] !== null) value[el] = value[el].toString();
        if (value[el]) value[el] = await sanitizing(info, el, value[el]);
        
        if (type === 'insert') {
          if (!value.application_id) value.application_id = 0;
          if (!insertAble.includes(el)) throw errhandler(`Cannot insert '${el}'`, { insertAble, value }, 400);
          processing = transKnex(tablename).insert(value);
        }
  
        if (type === 'update') {
          if (!updateAble.includes(el)) throw errhandler(`Cannot insert '${el}'`, { updateAble, value }, 400);
          value.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
          processing = transKnex(tablename).update(value);
          if (where) processing.where(where);
        }
      }
    }

    return await processing;
  } catch (e) {
    throw e;
  }
};