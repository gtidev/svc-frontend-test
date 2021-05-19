module.exports = async (Knex, tablename, uuid, notSnapshot = true) => {
  try {
    const temp = Knex(tablename).select(['id']).where({uuid});
    const result = notSnapshot ? await temp.whereNull('snapshot_from') : await temp; 
    if (result.length === 0) throw Error(`Cannot find uuid: ${uuid} on table : ${tablename}`);
    return result[0].id.toString();
  } catch (e) {
    throw e;
  }
};