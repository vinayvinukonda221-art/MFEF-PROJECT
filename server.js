const path = require('path');

// Change working directory to backend folder so all backend modules and node_modules resolve properly
process.chdir(path.join(__dirname, 'backend'));

// Start backend server
require('./server.js');
