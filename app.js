const express = require('express');
const app = express();
const path = require('path');
// const link = "";
const fs = require('fs');
const youtubedl = require('youtube-dl');


//server conn and assets
// Require static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));
// Set 'views' directory for any views 
// being rendered res.render()
app.set('views', path.join(__dirname, ''));
// Set view engine as EJS
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.listen(5000, () => {
    console.log('listening on port 3000');

});


//render
app.get('/', (req, res) => {
    res.render('index', {})
});

////Downloading video
app.post('/', (req, res, next) => {
    console.log(req.body);
    const link = req.body.url;
    const video = youtubedl('link', ['--format=18'], { cwd: __dirname });

    video.on('info', function(info) {
        console.log('Download Started');
        console.log('filename :' + info._filename);
        console.log('size:' + info.size);
    })

    video.pipe(fs.createWriteStream('myvideo.mp4'));

});