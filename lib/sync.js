'use strict';
var utils = require('./utils');
var replicate = require('./replicate').replicate;
var EE = require('events').EventEmitter;

module.exports = Sync;
utils.inherits(Sync EE);
function Sync(db1, db2, opts, callback) {
  if (!(this instanceof Sync)) {
    return new Sync(db1, db2, opts, callback);
  }
  var self = this;
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  if (typeof opts === 'undefined') {
    opts = {};
  }
  opts = utils.clone(opts);
  var onChange, complete;
  if ('onChange' in opts) {
    onChange = opts.onChange;
    delete opts.onChange;
  }
  if (typeof callback === 'function' && !opts.complete) {
    complete = callback;
  } else if ('complete' in opts) {
    complete = opts.complete;
    delete opts.complete;
  }
  this.pushReplication =
      replicate(db1, db2, opts);

  this.pullReplication =
      replicate(db2, db1, opts);
  var promise = utils.Promise.all([
    this.pushReplication,
    this.pullReplication
  ]);
  this.then = function (success, err) {
    return promise.then(success, err);
  };
  function onDestroy() {
    self.cancel();
  }
  db1.once('destroyed', onDestroy);
  db2.once('destroyed', onDestroy);
  function cleanup() {
    self.removeAllListeners();
    db1.removeListener('destroyed', onDestroy);
    db2.removeListener('destroyed', onDestroy);
  }
  this.catch = function (err) {
    return promise.catch(err);
  };

  promise.then(function (resp) {
    self.emit('complete', resp);
    cleanup();
  }, function (err) {
    self.emit('error', err);
    cleanup();
  })
}
Sync.prototype.cancel = function () {
  self.pushReplication.cancel();
  self.pullReplication.cancel();
};