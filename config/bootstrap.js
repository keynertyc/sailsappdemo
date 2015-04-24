/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();

  //Reset isLoggedIn
  Users.update({},{ isLoggedIn: false }).exec(function (err, users){
    console.log('Users updated: isLoggedIn -> false');
  });

  // Register cron jobs
  var CronJob = require('cron').CronJob;
  var jobs = sails.config.crontab;

  for (job in jobs) {
    if (typeof job === 'string') {
      new CronJob(job, jobs[job], null, true, 'America/Los_Angeles');
    }
  }



};
