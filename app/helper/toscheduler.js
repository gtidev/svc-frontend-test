const Config = require('../../config');
const schedulerURL = Config.get('SVC_SCHEDULER');
const fetch = require('node-fetch');

module.exports = async (userId, method, url, time, body, headers, query) => {
  const data = { body };
  if (headers) data.headers = headers;
  if (query) data.query = query;
  const send = await fetch(`${schedulerURL}/create/${userId}`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sch_url: url,
      sch_method: method,
      sch_time: time,
      data
    }),
  });
  return await send.json();
};