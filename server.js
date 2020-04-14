const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

// Removes CORS error
app.use(cors());

app.get('/data', function(req, res) {
    res.status(200).json({ "items": [{"message": "Hello from Backend"}]});
    console.log('Data sent to Client.');
});

app.listen(port, function() {
    console.log('Server is running on PORT:', port);
});
