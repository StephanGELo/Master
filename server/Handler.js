const convert = require('xml-js');

const db = require('../database-mongo');
const api = require('../api/apiHelper.js');
const { organizeBookData } = require('../api/apiTest.js');
const { addReviewData } = require('../api/apiTest.js');
const handler = require('./Handler.js');

module.exports = {
  getAllBooks: (req, res) => {
    db.selectAllBooks((err, data) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json(data);
      }
    });
  },
  getBookByISBN: (req, res) => {
    const { isbn } = req.params;
    db.findBook(isbn, (err, data) => {
      if (err) {
        res.sendStatus(500);
      } else if (data.length > 0) {
        res.json(data[0]);
      } else {
        api.searchBook(isbn, (errAPI, searchResults) => {
          if (errAPI) {
            res.sendStatus(500);
          } else {
            api.getMoreBookData(searchResults, (error, results) => {
              if (error) {
                res.sendStatus(500);
              } else {
                searchResults.isbn13 = isbn;
                const bookData = organizeBookData(searchResults);
                const parRez = convert.xml2json(results.data);
                const jsonRez = JSON.parse(parRez).elements[0].elements[1].elements;
                const updatedData = addReviewData(jsonRez, bookData);
                const genres = api.filterByPopularShelves(updatedData);
                updatedData.genres = genres;
                db.save(updatedData);
                res.json(updatedData);
              }
            });
          }
        });
      }
    });
  },
  getUserByName: (req, res) => {
    const { username } = req.params;
    db.findProfile(username, (err, data) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json(data[0]);
      }
    });
  },
  postLogin: (req, res) => {
    console.log(" in handler on line 62", req);
    let loginData = {};
    req.on('data', (chunk) => {
      loginData = JSON.parse(chunk.toString());
      db.findProfile(loginData.username, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          // console.log(data);
          if (!data.length) {
            loginData.type = 'invalid username';
          } else if (loginData.password === data[0].password) {
            loginData.type = 'success';
            loginData.userProfile = data[0];
          } else {
            loginData.type = 'wrong password';
          }
        }
        res.json(loginData);
      });
    });
  },
  postSignUp: (req, res) => {
    req.on('data', (chunk) => {
      const userData = JSON.parse(chunk.toString());
      const response = {
        type: '',
        data: {},
      };
      // check if exists in database
      db.findProfile(userData.username, (err, data) => {
        if (err) {
          console.log('ERR', err);
        } else if (!data.length) {
          db.createProfile(userData);
          // figure out how to callback this
          response.type = 'success';
          response.data = userData;
          res.json(response);
        } else {
          response.type = 'error';
          res.json(response);
        }
      });
    });
  },
  getSearchTitle: (req, res) => {
    const { title } = req.params;
    api.searchBook(title, (err, searchResults) => {
      if (err) {
        res.sendStatus(500);
      } else {
        // const parsResults = searchResults.map((book) => {
        //   const cleanBook = organizeBookData(book);
        //   return organizeBookData(book);
        // });
        // res.json(parsResults);
        res.json(searchResults);
      }
    });
  },
  getBestSellers: (req, res) => {
    api.getBestBooks((err, data) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json(data.data);
      }
    });
  },
  postReview: (req, res) => {
    db.saveReview(req.body, (err, data) => {
      res.json([err, data]);
    });
  },

  postFavorites: (req, res) => {
     db.saveFavorite(req.body, (err, data) => {
      res.json([err, data]);
    });
  },



   // //console.log(" in handler on line 138", req)
   //  const { username, isbn } = req.body; // to check isbn format/data being returned.
   //  //console.log("username on line 141 in handler", username);
   //  db.findUserFavorites(username, (err, data) => { // to find out what data is being returned. Expecting an array of books
   //    console.log("data on line 143 in Handler", data);
   //     if (err) {
   //      console.log("failed");
   //      res.sendStatus(500);
   //     } else {
   //    //   //console.log("on line 145 in handler", data);
   //    //   if(!data.length) {
   //    //      // check whether isbn already exists, if yes
   //    //      // find out isbn number
   //    //      // add isbn number to favoriteBooks array
   //    //      // save to database
   //    //      //updateFavorites..
   //    //      res.json({status:'added'})
   //    //   }
   //    //   //else {
   //    //     //if isbn already exists in Favorites book
   //    //     // delete isbn
   //    //     //save to database
   //    //    // res.json({status:'deleted'});
   //    //   //}
   //    }
   //  });

  // },
};
