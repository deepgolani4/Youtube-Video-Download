const express = require('express');
const app = express();
const path = require('path');
// const link = "";
const fs = require('fs');
const youtubedl = require('youtube-dl');


//server conn and assets
// Require static assets from public folder
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Set 'views' directory for any views 
// being rendered res.render()
app.set('views', path.join(__dirname, ''));
// Set view engine as EJS
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.listen(5000, () => {
    console.log('listening on port 5000');

});


//render
app.get('/', (req, res) => {
    res.render('index', {});
});

////Downloading video
app.post('/', (req, res, next) => {

    console.log(req.body);
    const url = req.body.url;
    const name = req.body.name;



    const video = youtubedl(url, ['--format=18'], { cwd: __dirname });

    video.on('info', function(info) {
        console.log('Download Started');
        console.log('filename :' + info._filename);
        console.log('size:' + info.size);
    })

    video.pipe(fs.createWriteStream(`${name}.mp4`));

});

app.get('/playlist', (req, res) => {
    res.render('playlist', {});
});

app.post('/playlist', (req, res, next) => {
    console.log(req.body);
    const url = req.body.url;

    function playlist(url) {

        'use strict'
        const video = youtubedl(url)

        video.on('error', function error(err) {
            console.log('error 2:', err)
        })

        let size = 0
        video.on('info', function(info) {
            size = info.size
            let output = path.join(__dirname + '/', size + '.mp4')
            video.pipe(fs.createWriteStream(output))
        })

        let pos = 0
        video.on('data', function data(chunk) {
            pos += chunk.length
                // `size` should not be 0 here.
            if (size) {
                let percent = (pos / size * 100).toFixed(2)
                process.stdout.cursorTo(0)
                process.stdout.clearLine(1)
                process.stdout.write(percent + '%')
            }
        })

        video.on('next', playlist)
    }
    playlist(url)
});

app.get('/thumbmail', (req, res) => {
    res.render('thumbnail', {})
});

app.post('/thumbmail', (req, res) => {
    const url = req.body.url;
    const options = {
        // Downloads available thumbnail.
        all: false,
        // The directory to save the downloaded files in.
        cwd: __dirname,
    }

    youtubedl.getThumbs(url, options, function(err, files) {
        if (err) throw err

        console.log('thumbnail file downloaded:', files)
    })

})

app.get('/sub', (req, res) => {
    res.render('sub', {});
});

app.post('/sub', (req, res, next) => {
    const url = req.body.url;
    const options = {
        // Write automatic subtitle file (youtube only)
        auto: false,
        // Downloads all the available subtitles.
        all: false,
        // Subtitle format. YouTube generated subtitles
        // are available ttml or vtt.
        format: 'ttml',
        // Languages of subtitles to download, separated by commas.
        lang: 'en',
        // The directory to save the downloaded files in.
        cwd: __dirname,
    }

    youtubedl.getSubs(url, options, function(err, files) {
        if (err) throw err

        console.log('subtitle files downloaded:', files)
    })


});

app.get('/partdown', (req, res) => {
    res.render('partdown', {});
});

app.post('/partdown', (req, res, next) => {
    const url = req.body.url;
    const output = req.body.name;

    let downloaded = 0

    if (fs.existsSync(output)) {
        downloaded = fs.statSync(output).size
    }

    const video = youtubedl('url',

        // Optional arguments passed to youtube-dl.
        ['--format=18'],

        // start will be sent as a range header
        { start: downloaded, cwd: __dirname })

    // Will be called when the download starts.
    video.on('info', function(info) {
        console.log('Download started')
        console.log('filename: ' + info._filename)

        // info.size will be the amount to download, add
        let total = info.size + downloaded
        console.log('size: ' + total)

        if (downloaded > 0) {
            // size will be the amount already downloaded
            console.log('resuming from: ' + downloaded)

            // display the remaining bytes to download
            console.log('remaining bytes: ' + info.size)
        }
    })

    video.pipe(fs.createWriteStream(output, { flags: 'a' }))

    // Will be called if download was already completed and there is nothing more to download.
    video.on('complete', function complete(info) {
        'use strict'
        console.log('filename: ' + info._filename + ' already downloaded.')
    })

    video.on('end', function() {
        console.log('finished downloading!')
    })

})


app.get('/videoinfo', (req, res) => {
    res.render('videoinfo', {});
})

app.post('/videoinfo', (req, res) => {

    const url = req.body.url;
    const options = ['--username=user', '--password=hunter2']

    youtubedl.getInfo(url, options, function(err, info) {
        if (err) throw err

        console.log('id:', info.id)
        console.log('title:', info.title)
        console.log('url:', info.url)
        console.log('thumbnail:', info.thumbnail)
        console.log('description:', info.description)
        console.log('filename:', info._filename)
        console.log('format id:', info.format_id)
    })

})

app.get('/ext', (req, res) => {
    res.render('ext', {});
})

app.post('/ext', (req, res, next) => {
    youtubedl.getExtractors(true, function(err, list) {
        console.log('Found ' + list.length + ' extractors')

        for (let i = 0; i < list.length; i++) {
            console.log(list[i])
        }
    })

})