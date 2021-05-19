const modulelist = require('./modulelist');
const errhandler = require('../helper/errorhandler');
const validator = require('validator');

const { Model } = require('objection');

const injectChainable = (column, columnname, schema, Knex) => {
  if (typeof schema[columnname].allowNull !== 'undefined') schema[columnname].allowNull ? column.nullable(columnname) : column.notNullable(columnname);
  if (schema[columnname].defaultValue) {
    if (schema[columnname].type === 'DATE' || schema[columnname].type === 'DATETIME') {
      column.defaultTo(Knex.fn.now());
    } else {
      column.defaultTo(schema[columnname].defaultValue);
    }
  }
};

const checkInput = (info, flag, key, value) => {
  const flagArr = ['update', 'insert'];
  const { 
    type, 
    length, 
    email, 
    url, 
    inenum,
    required,
  } = info;
  
  if (!flagArr.includes(flag)) 
    throw errhandler(`checkInput - Flag is not acceptable.`, { input: flag, acceptable: flagArr });

  if (flag === 'insert') {
    if (!info.insertAble.includes(key)) 
      throw errhandler(`checkInput - ${key} not on insert whitelist.`, { input: key, acceptable: info.insertAble });
  }

  if (flag === 'update') {
    if (!info.updateAble.includes(key)) 
      throw errhandler(`checkInput - ${key} not on update whitelist.`, { input: key, acceptable: info.updateAble });
  }
  
  if (typeof type[key] === 'undefined')
    throw errhandler(`checkInput - Cannot find ${key} on type.`, key);

  const inputType = type[key];
  // start validation
  let isError = false;
  if (inputType === 'INTEGER' && !validator.isInt(value)) isError = true;
  if (inputType === 'BOOLEAN' && !validator.isBoolean(value)) isError = true;
  if (inputType === 'FLOAT' && !validator.isFloat(value)) isError = true;
  if (inputType === 'DOUBLE' && !validator.isFloat(value)) isError = true;
  if (inputType === 'DATE' && !validator.isISO8601(value)) isError = true;
  
  if (isError) {
    const errData = {};
    errData[key] = value;
    errData.inputType = inputType.toLowerCase();
    throw errhandler(`checkInput - ${key} is not a(n) ${inputType.toLowerCase()}.`, errData);
  }
  
  // check string with length
  if (required.includes(key) && value === '') throw errhandler(`checkInput - ${key} : ${value} cannot be empty ${length[key]}.`, { input: value });
  if (inputType === 'STRING') {
    if (length[key]) {
      if (!validator.isLength(value, { min: 0, max: length[key] }))
        throw errhandler(`checkInput - ${key} : ${value} length must below ${length[key]}.`, { input: value });
    }

    if (inenum[key]) {
      if (!validator.isIn(value, inenum[key]))
        throw errhandler(`checkInput - ${key} : ${value} is not accepted.`, { input: value, enum: inenum[key] });
    }
  }

  // check string is an email
  if (email) {
    if (!email.includes(key)) throw errhandler(`checkInput - ${key} : ${value} is not on email whitelist.`);
    if (!validator.isEmail(value)) throw errhandler(`checkInput - ${key} : ${value} is not valid email pattern.`);
  }

  // check string is an url
  if (url) {
    if (!url.includes(key)) throw errhandler(`checkInput - ${key} : ${value} is not on url whitelist.`);
    if (!validator.isURL(value, { protocols: ['http','https','ftp'] })) 
      throw errhandler(`checkInput - ${key} : ${value} is not on url whitelist.`);
  }
  // end validation
};

const sanitizing = (info, key, input) => {
  const validator = require('validator');
  const { type } = info;

  if (type[key] === 'INTEGER') input = validator.toInt(input);
  if (type[key] === 'BOOLEAN') input = validator.toBoolean(input, true);
  if (type[key] === 'FLOAT') input = validator.toFloat(input, true);
  if (type[key] === 'DOUBLE') input = validator.toFloat(input, true);

  
  return input;
}

module.exports = async (tablename, Knex) => {
  try {
    if (!modulelist[tablename]) throw errhandler('Cannot find table name on modulelist', { table: tablename, list: Object.keys(modulelist) });

    // check table is exist
    const check = await Knex.schema.hasTable(tablename);
    if (!check) {
      // create table
      await Knex.schema.createTable(tablename, (table) => {

        const schema = modulelist[tablename];
        const keys = Object.keys(schema);

        // define column
        let column;
        for (let el of keys) {
          if (schema[el].length) {
            if (!schema[el].primaryKey) {
              column = table[schema[el].type.toLowerCase()](el, schema[el].length);
              injectChainable(column, el, schema, Knex);
            }
          } else {
            if (!schema[el].primaryKey) {
              column = table[schema[el].type.toLowerCase()](el);
              injectChainable(column, el, schema, Knex);
            }
          }
          // if (schema[el].primaryKey) table.primary(el);
          if (schema[el].autoIncrement) table.increments(el);
          if (schema[el].unique) table.unique(el);
        }

      });
    } else {
      const schema = modulelist[tablename];
      const keys = Object.keys(schema);
      for (let el of keys) {
        const check = await Knex.schema.hasColumn(tablename, el);
        if (!check) {
          await Knex.schema.table(tablename, (table) => {
            let column;
            if (schema[el].length) {
              if (!schema[el].primaryKey) {
                column = table[schema[el].type.toLowerCase()](el, schema[el].length);
                injectChainable(column, el, schema, Knex);
              }
            } else {
              if (!schema[el].primaryKey) {
                column = table[schema[el].type.toLowerCase()](el);
                injectChainable(column, el, schema, Knex);
              }
            }
          });
        }
      }
    }

    // Generate Info
    const column = modulelist[tablename]
    const keys = Object.keys(column);
    const info = {};

    info.full = column;
    keys.forEach((el) => {
      if (!info.required) info.required = [];
      if (typeof column[el].allowNull !== 'undefined') {
        info.required.push(el);
      } else {
        if (!info.optional) info.optional = [];
        if (el !== 'id') {
          info.optional.push(el);
        }
      }
      
      const ruleKeys = Object.keys(column[el].rules);
      ruleKeys.forEach((elm) => {
        if (!info[elm]) info[elm] = [];
        if (column[el].rules[elm]) info[elm].push(el);
      });
      
      if (!info.type) info.type = {};
      info.type[el] = column[el].type;

      if (!info.length) info.length = {};
      info.length[el] = column[el].length;

      if (!info.inenum) info.inenum = {};
      info.inenum[el] = column[el].inenum;
    });
    // End Generate Info

    Model.knex(Knex);

    class ORM extends Model {
      static tableName = tablename;
      static relationMappings = {};
    };

    return {
      tabel: tablename,
      info,
      Knex,
      checkInput,
      sanitizing,
      validator,
      ORM,
      Model,
      modulelist: modulelist[tablename],
    };
  } catch (e) {
    throw e;
  }
};