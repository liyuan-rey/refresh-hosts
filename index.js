// refresh host of windows system

var path = require('path');
var fs = require('fs');
// var https = require('https');
var https = require('http');
var zlib = require('zlib');
var exec = require('child_process').exec;

process.on('uncaughtException', function(err) {
    console.log('Uncaught error: ' + err);
});

checkEnvironment();

var tmpfile = __dirname + path.sep + 'host.tmp';
clean(tmpfile);

getHostFile(tmpfile);
replaceSysHostFile(tmpfile);
flushDns().on('close', function (code, signal) {
    clean(tmpfile);
    process.exit(0);
});

//////////

function checkEnvironment() {
    var os = process.platform;
    if (os !== 'win32') {
        console.error('Only support win32 system for now.');
        process.exit(1);
    }
}

function clean(file) {
    fs.unlink(file, function (err) {
        if (err !== null && err.errno !== -4058 && err.code !== 'ENOENT') {
            console.error('Unlink error: ' + err);
        }
    });
}

function getHostFile(file) {
    var options = {
            // hostname: 'raw.githubusercontent.com',
            // port: 443,
            // path: '/racaljk/hosts/master/hosts',
            hostname: '127.0.0.1',
            port: 80,
            path: '/',
            method: 'GET',
            headers: { 'accept-encoding': 'gzip, deflate' }
    };
    var request = https.request(options);

    request.on('response', function (response) {
        var output = fs.createWriteStream(file);
        
        switch (response.headers['content-encoding']) {
            case 'gzip':
                response.pipe(zlib.createGunzip()).pipe(output);
                break;
            case 'deflate':
                response.pipe(zlib.createInflate()).pipe(output);
                break;
            default:
                response.pipe(output);
                break;
        }
        
        output.end();
    });

    request.on('error', function(err) {
        console.error('Request error: ' + err);
    });

    request.end();
}

function replaceSysHostFile(file) {
    var sysfile = path.join(
            // process.env.SystemRoot,
            'C:/WINDOWS',
            'System32',
            'drivers',
            'etc',
            'hosts'
    );

    fs.rename(file, sysfile, function (err) {
        if (err !== null) {
            console.error(err);
        }
    })
}

function flushDns() {
    var cmd = 'ipconfig /flushdns';
    var child = exec(cmd, function (err, stdout, stderr) {
        if (err !== null) {
            console.error('Exec error: ' + err);
        }
    });
    
    return child;
}