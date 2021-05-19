
const config = require('../../config');
const minio_conf = config.get('MINIO_CONFIG');

exports.create = async (Minio, buffer, uuid) => {
  const status = await Minio.putObject(minio_conf.BUCKET_NAME, uuid, buffer);
  let url;
  if (status) url = await Minio.presignedGetObject(minio_conf.BUCKET_NAME, uuid)
  return url;
};

exports.view = async (Minio, uuid) => {
  const data = await Minio.getObject(minio_conf.BUCKET_NAME, uuid);
  return data;
};

exports.viewPartial = async (Minio, uuid) => {
  const data = await Minio.getObject(minio_conf.BUCKET_NAME, uuid);
  return data;
};

exports.delete = async (Minio, uuid) => {
  const data = await Minio.removeObject(minio_conf.BUCKET_NAME, uuid);
  return data;
};

exports.deleteMany = async (Minio, array) => {
  if (array.constructor !== Array) return false;
  const data = await Minio.removeObjects(minio_conf.BUCKET_NAME, array);
  return data;
};

exports.list = async (Minio) => {
  const data = await Minio.listObjects(minio_conf.BUCKET_NAME, '', true);
  return data;
};