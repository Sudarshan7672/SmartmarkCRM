const cron = require('node-cron');
const followUpService = require('../services/followUpService');

// Cron job to check follow-ups every hour
cron.schedule('0 * * * *', async () => {
  console.log('Checking for follow-ups...');
  await followUpService.checkFollowUps();
});
