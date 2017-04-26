/**
* @name Test-queue
* @summary Test-queue Hydra service entry point
* @description
*/
'use strict';

const version = require('./package.json').version;
const hydra = require('hydra');
let config = require('fwsp-config');

var redis = require('redis');
var ReliableQueue = require('redis-reliable-queue');
var Promise = require('bluebird');
let r;
/**
* Load configuration file
*/
config.init('./config/config.json')
  .then(() => {
    config.version = version;
    config.hydra.serviceVersion = version;
    /**
    * Initialize hydra
    */
    return hydra.init(config);
  })
  .then(() => hydra.registerService())
  .then(serviceInfo => {
    let logEntry = `Starting ${config.hydra.serviceName} (v.${config.version})`;
    hydra.sendToHealthLog('info', logEntry);
    console.log(logEntry);
    r = new ReliableQueue(hydra.redisdb);
    processTask(r);

  })
  .catch(err => {
    console.log('Error initializing hydra', err);
  });

var processTask = async function (r) {
  let task;
  let completed;
  try {
    task = await r.dequeue('fisclet2');
    console.log('task comming');
    console.log('key: ' + task[0]);
    console.log('data: ' + task[1]);

    completed = await r.complete('fisclet2', task[0]);
    console.log('removed ' + completed);
  } catch (err) {
    if (err.code != 'NORESULT') {
      console.log(err);
    }
  } finally {
    Promise.delay(1000).then(function() {processTask(r)});
  }

};
