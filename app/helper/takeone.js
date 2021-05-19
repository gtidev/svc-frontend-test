module.exports = async (Knex, tablename, id) => {
  try {
    const result = await Knex(tablename).select(['*']).where({id});
    if (result.length === 0) throw Error(`Cannot find id: ${id} on table : ${tablename}`);
    return result[0];
  } catch (e) {
    throw e;
  }
};