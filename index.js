// refresh host of windows system

process.on('uncaughtException', uncaughtException);


var path = require('path');
var Q = require('q');
var fs = require('fs');
var https = require('https');
// var https = require('http'); // for test only
var zlib = require('zlib');
var exec = require('child_process').exec;

var errcode = 0;
var tmpfile = path.join(__dirname, 'host.tmp');


checkEnvironment()
    .then(clean)
    .then(getHostFile)
    .then(replaceSysHostFile)
    .then(flushDns)
    .then(clean)
    .catch(function (err) {
        console.error('promise error: ' + err);
    })
    .done(function () {
        if (errcode === 0) {
            console.log('Hosts file and dns cache update successfully.');
        }
        
        process.exit(errcode);
    });


//////////

function uncaughtException(err) {
    console.log('Uncaught error: ' + err);
    process.exit(-1);
}

function checkEnvironment() {
    console.log('Checking environment...');
    var deffered = Q.defer();
    
    var os = process.platform;
    if (os !== 'win32') {
        errcode = 1;
        console.error('    error: only support win32 system for now.');
        deffered.reject('env_error');
    }
    else {
        console.log('    done.');
        deffered.resolve();
    }
    
    return deffered.promise;
}

function clean() {
    console.log('Begin clean temp file...');
    var deffered = Q.defer();
    
    fs.unlink(tmpfile, function (err) {
        if (err !== null && err.errno !== -4058 && err.code !== 'ENOENT') {
            errcode = 2;
            console.error('    error: ' + err);
            deffered.reject(err);
        }
        else {
            console.log('    done.');
            deffered.resolve();
        }
    });
    
    return deffered.promise;
}

function getHostFile() {
    console.log('Begin get remote hosts file...');
    var deffered = Q.defer();
    
    var options = {
            hostname: 'raw.githubusercontent.com',
            port: 443,
            path: '/racaljk/hosts/master/hosts',
            // hostname: '127.0.0.1', // for test only
            // port: 80,
            // path: '/',
            method: 'GET',
            headers: { 'accept-encoding': 'gzip, deflate' }
    };
    
    var request = https.request(options);
    request.on('response', function (response) {
        var output = fs.createWriteStream(tmpfile);

        var tmp;
        switch (response.headers['content-encoding']) {
            case 'gzip':
                tmp = response.pipe(zlib.createGunzip());
                break;
            case 'deflate':
                tmp = response.pipe(zlib.createInflate());
                break;
            default:
                tmp = response;
                break;
        }
        
        tmp.pipe(output);
        tmp.on('close', function () {
            output.end();
            
            console.log('    done.');
            deffered.resolve();
        });
    });

    request.on('error', function(err) {
        errcode = 3;
        console.error('    error: ' + err);
        deffered.reject(err);
    });

    request.end();
    return deffered.promise;
}

function replaceSysHostFile() {
    console.log('Begin replace system hosts file...');
    var deffered = Q.defer();
    
    var sysfile = path.join(
            // process.env.SystemRoot, //todo: check why can't get env variables
            'C:/WINDOWS',
            'System32',
            'drivers',
            'etc',
            'hosts'
    );

    fs.rename(tmpfile, sysfile, function (err) {
        if (err !== null) {
            errcode = 4;
            console.error('    error: ' + err);
            deffered.reject(err);
        }
        else {
            console.log('    done.');
            deffered.resolve();
        }
    });
    
    return deffered.promise;
}

function flushDns() {
    console.log('Begin flush dns cache...');
    var deffered = Q.defer();
    
    var cmd = 'ipconfig /flushdns';
    var child = exec(cmd, function (err, stdout, stderr) {
        if (err !== null) {
            errcode = 5;
            console.error('    error: ' + err);
            deffered.reject(err);
        }
    });
    
    child.on('close', function (code, signal) {
        console.log('    done.');
        deffered.resolve();
    });
    
    return deffered.promise;
}
