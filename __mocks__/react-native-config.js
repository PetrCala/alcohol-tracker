const path = require('path');
const dotenv = require('dotenv');

const env = dotenv.config({path: path.resolve('./.env')}).parsed;

export default env;