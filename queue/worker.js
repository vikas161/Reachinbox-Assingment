const { Worker } = require('bullmq');
const Redis = require('ioredis');
const { processMail } = require('../services/gmailService');
const Outlook = require('../services/outlookService')

const redisConnection = new Redis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });

const worker = new Worker(
  'emailQueue',
  async (job) => {
    console.log(`Processing job ${job.id}...`);
    if(job.data.provider=="gmail")
    await processMail(job.data.messageId);
    else
    await Outlook.processOutlookEmail(job.data.message)
  },
  { connection: redisConnection }
);

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

module.exports = worker;
