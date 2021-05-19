const errhandler = require('./errorhandler');
const validator = require('validator');

module.exports = async (string, type, action) => {
  try {
    const arrayType = [
      'alfa', 'numeric', 'special', 
      'alfanumeric', 'alfaspecial', 'numericspecial',
      'alfanumericspecial', 'email'
    ];
    const arrayAction = [
      'allow', 'include'
    ];

    if (string.length === 0) throw errhandler('String cannot be empty.', string, 400);
    if (!arrayType.includes(type)) throw errhandler('Cannot proceed with this type.', { arrayType, type }, 403);
    if (!arrayAction.includes(action)) throw errhandler('Cannot proceed with this action.', { arrayAction, action }, 403);

    let doneInspect = false;
    if (action === 'include') {
      switch (type) {
        case 'alfa': 
          doneInspect = true;
          break;
        case 'numeric': 
          doneInspect = true;
          break;
        case 'special': 
          doneInspect = true;
          break;
        case 'alfanumeric': 
          doneInspect = true;
          break;
        case 'alfaspecial': 
          doneInspect = true;
          break;
        case 'numericspecial': 
          doneInspect = true;
          break;
        case 'alfanumericspecial': 
          doneInspect = true;
          break;
        case 'email': 
          if (!validator.isEmail(string)) throw errhandler('String isn\'t an email.', { string }, 400);
          doneInspect = true;
          break;
      }
    }
    
    if (action === 'allow') {
      switch (type) {
        case 'alfa': 
          if (!validator.isAlpha(string)) throw errhandler('String isn\'t an integer.', { string }, 400);
          doneInspect = true;
          break;
        case 'numeric': 
          if (!validator.isInt(string)) throw errhandler('String isn\'t an integer.', { string }, 400);
          doneInspect = true;
          break;
        case 'special': 
          const regex = new RegExp('[^a-zA-Z0-9]');
          if (!regex.test(string)) throw errhandler('String isn\'t a special.', { string }, 400);
          doneInspect = true;
          break;
        case 'alfanumeric': 
          if (!validator.isAlphanumeric(string)) throw errhandler('String isn\'t an integer.', { string }, 400);
          doneInspect = true;
          break;
        case 'alfaspecial': 
          const regex = new RegExp('[^0-9]');
          if (!regex.test(string)) throw errhandler('String isn\'t an alfaspecial.', { string }, 400);
          doneInspect = true;
          break;
        case 'numericspecial': 
          const regex = new RegExp('[^a-zA-Z]');
          if (!regex.test(string)) throw errhandler('String isn\'t an alfaspecial.', { string }, 400);
          doneInspect = true;
          break;
        case 'alfanumericspecial': 
          doneInspect = true;
          break;
        case 'email': 
          if (!validator.isEmail(string)) throw errhandler('String isn\'t an email.', { string }, 400);
          doneInspect = true;
          break;
      }
    }

    if (!doneInspect) throw errhandler('Nothing inspected.', { string, type, action }, 400);
    return string;
  } catch (e) {
    throw e;
  }
};