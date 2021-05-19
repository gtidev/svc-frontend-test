module.exports = (input) => {
  return input.toString().toLowerCase().replace(/[^a-z0-9 _]/g,'').replace(' ', '_');
};