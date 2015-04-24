module.exports.crontab = {

  '*/5 * * * * *' : function job1() {
    console.log('Run Job1');
  },

  '*/10 * * * * *' : function job2() {
    console.log('Run Job2');
  },

}
