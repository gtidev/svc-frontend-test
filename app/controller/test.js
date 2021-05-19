const errhandler = require('../helper/errorhandler');
const response = require('../helper/response');
const logger = require('../helper/logger');
const checkempty = require('../helper/checkempty');
const takeonewhere = require('../helper/takeonewhere');
const takeone = require('../helper/takeone');
const countdata = require('../helper/countdata');
const { manipulate } = require('../helper/manipulate');
const rmvdupp = require('../helper/rmvdoublearr');
const toscheduler = require('../helper/toscheduler');
const baseurl = require('../helper/baseurl');
const jwt = require('../helper/jwthelper');

const tableInit = require('../database/tableinit');

const _ = require('lodash');
const moment = require('moment');

exports.register = async (req, res, next, additional = {}) => {
  let { transKnex: pTransKnex, dataOnly, overBody, overParams, overQuery } = additional;
  let { Knex, Config, body, params, query, headers } = req;
  const transKnex = pTransKnex || await Knex.transaction();
  try {
    if (overBody) body = overBody;
    if (overParams) params = overParams;
    if (overQuery) query = overQuery;
    
    let result = {};

    const { username, password, role } = body;

    checkempty(username, 'username');
    checkempty(password, 'password');
    checkempty(role, 'role');

    if (![
      'user',
      'admin',
    ].includes(role)) throw errhandler('Cannot insert this value on role.', body, 400);

    const insertedData = await manipulate(tableInit, 'test_user', {
      Knex,
      transKnex,
      type: 'insert',
      value: {
        username,
        password: jwt.encode(password, 'sha1'),
        role,
      },
      // where: {}
    });

    const prepare = {
      id: insertedData[0],
      username,
    };

    const token = await jwt.create(prepare, 'aes');

    prepare.token = token;
    result = prepare;

    if (!dataOnly) {
      await transKnex.commit();
      response(res, 200, 'Manipulated.', result);
    } else return result;
  } catch (e) {
    await transKnex.rollback();
    console.log(e);
    logger(e);
    if (dataOnly) throw e;
    response(res, e.code || 500, e.message, e.data || null);
  }
};

exports.login = async (req, res, next, additional = {}) => {
  let { transKnex: pTransKnex, dataOnly, overBody, overParams, overQuery } = additional;
  let { Knex, Config, body, params, query, headers } = req;
  const transKnex = pTransKnex || await Knex.transaction();
  try {
    if (overBody) body = overBody;
    if (overParams) params = overParams;
    if (overQuery) query = overQuery;
    
    let result = {};

    const { username, password } = body;

    checkempty(username, 'username');
    checkempty(password, 'password');

    const userData = await takeonewhere(Knex, 'test_user', { username, password });
    if (!userData) throw errhandler('Username or password wrong.', body, 400);
    if (userData.is_active === false) throw errhandler('This user is not active.', body, 400);
    if (userData.deleted_at) throw errhandler('This has been deleted.', body, 400);

    result = await jwt.create({
      id: userData.id,
      username,
      role: userData.role
    }, 'aes');

    if (!dataOnly) {
      await transKnex.commit();
      response(res, 200, 'Manipulated.', result);
    } else return result;
  } catch (e) {
    await transKnex.rollback();
    console.log(e);
    logger(e);
    if (dataOnly) throw e;
    response(res, e.code || 500, e.message, e.data || null);
  }
};

exports.profile = async (req, res, next, additional = {}) => {
  let { transKnex: pTransKnex, dataOnly, overBody, overParams, overQuery } = additional;
  let { Knex, Config, body, params, query, headers } = req;
  const transKnex = pTransKnex || await Knex.transaction();
  try {
    if (overBody) body = overBody;
    if (overParams) params = overParams;
    if (overQuery) query = overQuery;
    
    let result = {};

    const { token } = headers;
    checkempty(token, 'token');

    const decrypt = await jwt.check(token, 'aes');
    const { id, username } = decrypt;

    const userData = await takeonewhere(Knex, 'test_user', { id, username, is_active: true, deleted_at: null });
    delete userData.password;
    result = userData;

    if (!dataOnly) {
      await transKnex.commit();
      response(res, 200, 'Manipulated.', result);
    } else return result;
  } catch (e) {
    await transKnex.rollback();
    console.log(e);
    logger(e);
    if (dataOnly) throw e;
    response(res, e.code || 500, e.message, e.data || null);
  }
};

exports.update = async (req, res, next, additional = {}) => {
  let { transKnex: pTransKnex, dataOnly, overBody, overParams, overQuery } = additional;
  let { Knex, Config, body, params, query, headers } = req;
  const transKnex = pTransKnex || await Knex.transaction();
  try {
    if (overBody) body = overBody;
    if (overParams) params = overParams;
    if (overQuery) query = overQuery;
    
    let result = {};

    const { username, password, role } = body;
    const { token } = headers;

    checkempty(token, 'token');

    const { id } = await jwt.check(token, 'aes');

    const prepare = {};

    if (checkempty(username, 'username', true)) prepare.username = username;
    if (checkempty(password, 'password', true)) prepare.password = password;
    if (checkempty(role, 'role', true))
      if (![
        'user',
        'admin',
      ].includes(role)) {
        throw errhandler('Cannot insert this value on role.', body, 400)
      } else prepare.role = role;

    if (!_.isEmpty(prepare)) {
      const updateData = await manipulate(tableInit, 'test_user', {
        Knex,
        transKnex,
        type: 'update',
        value: prepare,
        where: {
          id
        }
      });
      prepare.id = id;
      result = prepare;
      
    } else result = 'Nothing changed.';

    if (!dataOnly) {
      await transKnex.commit();
      response(res, 200, 'Manipulated.', result);
    } else return result;
  } catch (e) {
    await transKnex.rollback();
    console.log(e);
    logger(e);
    if (dataOnly) throw e;
    response(res, e.code || 500, e.message, e.data || null);
  }
};

exports.activate = async (req, res, next, additional = {}) => {
  let { transKnex: pTransKnex, dataOnly, overBody, overParams, overQuery } = additional;
  let { Knex, Config, body, params, query, headers } = req;
  const transKnex = pTransKnex || await Knex.transaction();
  try {
    if (overBody) body = overBody;
    if (overParams) params = overParams;
    if (overQuery) query = overQuery;
    
    let result = {};

    const { token } = headers;
    const { id , activate } = params;

    checkempty(token, 'token');

    const { id: userId, role } = await jwt.check(token, 'aes');

    if (id !== userId && role !== 'admin') throw errhandler('You don\'t have privilege to activate this user.', params, 403);

    if (![
      'deactive',
      'activate',
    ].includes(activate)) throw errhandler('Cannot insert this value on activate.', params, 400)

    await manipulate(tableInit, 'test_user', {
      Knex,
      transKnex,
      type: 'update',
      value: {
        is_active: activate === 'activate' ? true : false,
      },
      where: {
        id
      }
    });

    if (!dataOnly) {
      await transKnex.commit();
      response(res, 200, 'Manipulated.', result);
    } else return result;
  } catch (e) {
    await transKnex.rollback();
    console.log(e);
    logger(e);
    if (dataOnly) throw e;
    response(res, e.code || 500, e.message, e.data || null);
  }
};

exports.delete = async (req, res, next, additional = {}) => {
  let { transKnex: pTransKnex, dataOnly, overBody, overParams, overQuery } = additional;
  let { Knex, Config, body, params, query, headers } = req;
  const transKnex = pTransKnex || await Knex.transaction();
  try {
    if (overBody) body = overBody;
    if (overParams) params = overParams;
    if (overQuery) query = overQuery;
    
    let result = {};

    const { token } = headers;
    const { id } = params;

    checkempty(token, 'token');
    const { id: userId, role } = await jwt.check(token, 'aes');

    if (id !== userId && role !== 'admin') throw errhandler('You don\'t have privilege to activate this user.', params, 403);

    await manipulate(tableInit, 'test_user', {
      Knex,
      transKnex,
      type: 'update',
      value: {
        deleted_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      where: {
        id
      }
    });

    if (!dataOnly) {
      await transKnex.commit();
      response(res, 200, 'Manipulated.', result);
    } else return result;
  } catch (e) {
    await transKnex.rollback();
    console.log(e);
    logger(e);
    if (dataOnly) throw e;
    response(res, e.code || 500, e.message, e.data || null);
  }
};
