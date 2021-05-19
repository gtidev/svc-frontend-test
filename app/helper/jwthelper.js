const jwt = require('jsonwebtoken');
const config = require('../../config');
const secretKeySystem = config.get('PASSWORD_KEY');
const errhandler = require('./errorhandler');

const Crypto = require('crypto-js');

const encode = (data, encrypt, uriencode = false, strict = false, secretKey = null) => {
  let result;
  try {
    if (!secretKey) secretKey = secretKeySystem;
    encrypt = encrypt.toUpperCase();
    switch (encrypt) {
      // Decryptable
      case 'BASE64': 
        result = Crypto.enc.Utf8.parse(data);
        result = Crypto.enc.Base64.stringify(result); 
        break;
      case 'AES': result = Crypto.AES.encrypt(data, secretKey).toString(); break;
  
      // Undecryptable
      case 'MD5': result = Crypto.HmacMD5(data, secretKey).toString(); break;
      case 'SHA1': result = Crypto.HmacSHA1(data, secretKey).toString(); break;
      case 'SHA256': result = Crypto.HmacSHA256(data, secretKey).toString(); break;
      case 'SHA224': result = Crypto.HmacSHA224(data, secretKey).toString(); break;
      case 'SHA512': result = Crypto.HmacSHA512(data, secretKey).toString(); break;
      case 'SHA384': result = Crypto.HmacSHA384(data, secretKey).toString(); break;
      case 'SHA3': result = Crypto.HmacSHA3(data, secretKey).toString(); break;
      case 'RIPEMD160': result = Crypto.HmacRIPEMD160(data, secretKey).toString(); break;
  
      default : result = data; break;
    }
    
    if (uriencode) result = encodeURIComponent(result);
    return result;
  } catch (e) {
    if (strict) throw e;
    return result;
  }
};

const decode = (data, encrypt, strict = false, secretKey = null) => {
  let result;
  try {
    if (!secretKey) secretKey = secretKeySystem;
    encrypt = encrypt.toUpperCase();
    switch (encrypt) {
      case 'BASE64': 
        result = Crypto.enc.Base64.parse(data);
        result = Crypto.enc.Utf8.stringify(result); 
        break;
      case 'AES': result = Crypto.AES.decrypt(data, secretKey).toString(Crypto.enc.Utf8); break;
      default: result = data; break;
    }
    return result;
  } catch (e) {
    if (strict) throw e;
    return result;
  }
};

module.exports = {
  encode,
  decode,
  create: async (data, encrypt = null, urlencoded = false, strict = false) => {
    try {
      let result;
      const token = await jwt.sign(JSON.stringify(data), secretKeySystem);
      result = encode(token, encrypt, urlencoded);
      return result;
    } catch (e) {
      throw e;
    }
  },
  check: async (token, encrypt = null, urlencoded = false, strict = false) => {
    try {
      let result;
      if (!token) throw errhandler('Token not found.', null, 499);
      if (urlencoded) token = decodeURIComponent(token);
      token = await decode(token, encrypt, urlencoded);
      result = jwt.verify(token, secretKeySystem);
      return result;
    } catch (e) {
      throw e;
    }
  },
  createSync: (data, encrypt = null, urlencoded = false, strict = false) => {
    try {
      let result;
      const token = jwt.sign(JSON.stringify(data), secretKeySystem);
      result = encode(token, encrypt, urlencoded);
      return result;
    } catch (e) {
      throw e;
    }
  },
  checkSync: (token, encrypt = null, urlencoded = false, strict = false) => {
    try {
      let result;
      if (!token) throw errhandler('Token not found.', null, 499);
      token = decode(token, encrypt, urlencoded);
      result = jwt.verify(token, secretKeySystem);
      return result;
    } catch (e) {
      throw e;
    }
  },
};
