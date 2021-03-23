const axios = require('axios');
const { kanyeRest: { url} } = require('../config/index')

const getQuote = () => {
  return axios.get(url)
}
module.exports = getQuote