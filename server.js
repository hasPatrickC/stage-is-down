// https://github.com/danmactough/node-feedparser

var request = require('request');
var FeedParser = require('feedparser');
var rssUrl = 'https://sea1-jenkins01.sea1.office.priv/view/MAT%20api/job/Deploy_API_Stage/rssAll';
var index = 0;
var isDown = false;

var req = request({
  url: rssUrl,
  rejectUnauthorized: false
});
var feedparser = new FeedParser();


req.on('error', function(err) {
  console.log('request error', err);
});

req.on('response', function(res) {
  var stream = this;

  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

  stream.pipe(feedparser);
});

feedparser.on('error', function(err) {
  console.log('feedparser error', err);
});

feedparser.on('readable', function() {
  var stream = this;
  var item;

  while (item = stream.read()) {

    if (index === 0) {
      isDown = item.title.search('broken') !== -1;
      var downMsg = isDown ? 'YES' : 'NO';

      if (isDown) {
        downMsg += ', stage is down. It has been down since ' + item.date;
      }

      console.log(downMsg);
    }
  }
  index++;
});
