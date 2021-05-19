const express = require('express');
const router = express.Router();

const config = require('./../config');
const response = require('./helper/response');
const htmlcode = require('./helper/htmlcode');

const modulelist = require('./database/modulelist');

const jwthelper = require('./helper/jwthelper');
const checkmodule = require('./controller/checkmodule');

const checktoken = require('./middleware/checktoken');

router.get('/ping', (req, res) => response(res, 200, `GTI Present - Service ${config.get('SERVICE_NAME')} ${config.get('ENV')} is ready to use.`));
router.get('/htmlcode', (req, res) => response(res, 203, 'List Accepted HTML Code', htmlcode));
router.get('/info', (req, res) => response(res, 203, 'List Module', Object.keys(modulelist)));
router.get('/info/:module', (req, res) => 
  modulelist[req.params.module] ? 
    response(res, 203, 'List Module', modulelist[req.params.module]) :
    response(res, 400, 'Cannot find module.', { input: req.params.module, modules: Object.keys(modulelist) })
);
router.post('/check/:target', (req, res) => response(res, 203, `Test ${req.params.target}`, { data: req[req.params.target] } ));
router.get('/checktoken', async (req, res) => response(res, 203, `Check Token.`, await jwthelper.check(req.query.token, 'base64', true, true) ));
router.get('/checkmodule', checkmodule);


// DO SOMETHING DOWN HERE
const test = require('./controller/test');
router.post('/register', test.register);
router.post('/login', test.login);
router.post('/update', checktoken, test.update);
router.get('/profile', checktoken, test.profile);
router.get('/delete/:id', checktoken, test.delete);
router.get('/changestatus/:activate/:id', checktoken, test.activate);
// END DO

module.exports = router;
