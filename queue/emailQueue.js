const { Queue } = require('bullmq');
const Redis = require('ioredis');

const redisConnection = new Redis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });
const emailQueue = new Queue('emailQueue', { connection: redisConnection });

/**
 * Add an email job to the queue.
 */
const addEmailJob = async (message) => {
  await emailQueue.add('processEmail', message);
  console.log(`Email job added for : ${message.provider}`);
};

module.exports = { emailQueue, addEmailJob };
