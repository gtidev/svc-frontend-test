const fetch = require('node-fetch');

(async () => {
  const body = {
    username: 'cobacoba3',
    password: 'testing1234',
  };
  const response = await fetch('https://api.frontendtest.dev.griyatekno.id/login', {
    // These properties are part of the Fetch Standard
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

  console.log(await response.json());
})();