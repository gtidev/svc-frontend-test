module.exports = async (Knex, tablename, where) => {
  try {
    const result = await Knex(tablename).select(['*']).where(where);
    if (result.length === 0) return false;
    return result[0];
  } catch (e) {
    throw e;
  }
};