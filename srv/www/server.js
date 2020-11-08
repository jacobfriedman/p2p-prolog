var express = require('express');

console.log('\n ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n')

console.log(` 🗃  Serving files on Port 80 (HTTP).`)

console.log('\n ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n')

express()
    .get('/', function(req, res) {
        res.sendFile('index.html', {
            root: __dirname
        });
    })
    .use(express.static(__dirname))
    .listen(80);



