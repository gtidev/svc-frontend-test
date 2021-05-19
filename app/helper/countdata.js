module.exports = async (Knex, tablename, key, id) => {
  try {
    const where = {};
    where[key] = id;
    const result = await Knex(tablename).count('id as count').where(where);
    return result[0].count;
  } catch (e) {
    throw e;
  }
};