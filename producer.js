var redis = require('redis');
var ReliableQueue = require('redis-reliable-queue');
var Promise = require('bluebird');

var rdb = redis.createClient();
rdb.select(15);
var r = new ReliableQueue(rdb);
//r.ttl = 600;

let counter = 0;
async function produceTask() {
  try {
    key = await r.enqueue('fisclet2', 'data:' + (counter++));
    console.log('Enqueue with key: ' + key);
  } catch (err) {
    console.log(err);
  } finally {
    Promise.delay(500).then(produceTask);
  }

};

produceTask();
