const goodreads = require('./goodreads.js')
const axios = require('axios')
const {goodreadsKey} = require('./goodreads.js')
const {NYTKey} = require('./apiKeys.js')
const $ = require('jquery')

//**** API search body:
 // q: The query text to match against book title, author, and ISBN fields. Supports boolean operators and phrase searching.
 // page: Which page to return (default 1, optional)
 // key: Developer key (required).
 // search[field]: Field to search, one of 'title', 'author', or 'all' (default is 'all')

//curl "https://www.goodreads.com/search.xml?key=YOUR_KEY&q=Ender%27s+Game"

var searchBook = (book, cb) => {
  axios.get('https://www.goodreads.com/search.xml', {
      params: {
        q: book,
        key: goodreadsKey.key,
      }
    })
    .then(function (response) {
      cb(response.data)
    })
    .catch(function (error) {
      console.log(error);
    });
}

var getBestSellersBooks = (callback) => {
    var url = "https://api.nytimes.com/svc/books/v3/lists/best-sellers/history.json";
    url += '?' + $.param({'api-key': NYTKey});
    $.ajax({
      url: 'url',
      method: 'GET',
      }).done(function(result) {
    }).fail(function(err) {
      throw err;
    });
  }

module.exports = {
  searchBook,
  getBestSellersBooks
}
