var exec = require('child_process').exec;
var async = require('async');
var ghslug = require('github-slug');
var noop     = function () {};
var cleanStdout = function (strOrBuffer) {
  return strOrBuffer.toString().replace('\n', '');
};

var GitHubInfo = module.exports = function () {
  this.slug = function (cb) {
    exec('git rev-parse --show-toplevel', function (err, folder) {
      if (err) {
        console.error("cannot find git config.");
        return cb(err);
      }
      ghslug(folder.trim(), function(err, slug) {
        if (err) {
          console.log("slug repo error.", err);
          return cb(err);
        }
        cb(null, slug)
      });
    });
  };
  this.branch = function (cb) {
    exec('git rev-parse --abbrev-ref HEAD', function (err, stdout, stderr) {
      if (err) {
        console.error("branch error.");
        cb(err);
      }
      else {
        cb(null, cleanStdout(stdout));
      }
    });
  };
  this.integrationBranch = function (cb) {
    exec('git config --get gitfb.integrationBranch', function (err, stdout, stderr) {
      if (err) {
        cb(null, 'master'); //default to master
      }
      else {
        cb(null, cleanStdout(stdout) || 'master');
      }
    });
  };
  this.get = function (cb) {
    async.parallel({
      slug: this.slug,
      branch: this.branch,
      integrationBranch: this.integrationBranch
    }, cb);
  };
};