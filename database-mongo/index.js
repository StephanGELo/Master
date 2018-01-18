const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/lit');

const db = mongoose.connection;

// db.dropDatabase();
// mongoose.connect('mongodb://localhost/lit');

db.on('error', () => {
  console.log('mongoose connection error');
});

db.once('open', () => {
  console.log('mongoose connected successfully');
});

const bookSchema = mongoose.Schema({
  year: String,
  month: String,
  day: String,
  title: String,
  author: String,
  averageRating: String,
  description: String,
  imageURL: String,
  pages: String,
  popularShelves: [String],
  isbn13: String,
  genres: [String],
  // reviewWidget: [String]
});

const userSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    // required: true
  },
  reviewedBooks: [Number],
  favoriteBooks: [Number],
});

const reviewSchema = new mongoose.Schema({
  idNameNumber: String,
  user: String,
  isbn: Number,
  text: String,
  rating: Number,
});

const Book = mongoose.model('Book', bookSchema);
const User = mongoose.model('User', userSchema);
const Review = mongoose.model('Review', reviewSchema);
// const favorite = mongoose.model('Favorite', favoriteSchema);

const selectAllBooks = (callback) => {
  Book.find({}, (err, items) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, items);
    }
  });
};

const findUserFavorites = (user, cb) => {
  console.log("on line 72 @ DB.findUserFavorites", user);
  const books = [];
  User.find({ username: user }).then((foundUser) => {
    const len = foundUser[0].favoriteBooks.length;
    foundUser[0].favoriteBooks.forEach((book) => {
      console.log(" on line 76 @ db.findUserFavorites", book);
      Book.find({ isbn13: book }).then((foundBook) => {
        console.log("on line 77 @ db.findUserFavorites", foundBook);
        books.push(foundBook);
      }).then(() => {
        if (books.length === len) {
          cb(books);
        }
      });
    });
  });
};

const findUserReviews = (user, cb) => {
  const reviews = [];
  User.find({ username: user }).then((foundUser) => {
    const len = foundUser[0].reviewedBooks.length;

    foundUser[0].reviewedBooks.forEach((book) => {
      const id = foundUser[0].username + book;
      Review.find({ idNameNumber: id }).then((foundReview) => {
        reviews.push(foundReview);
      }).then(() => {
        if (reviews.length === len) {
          cb(reviews);
        }
      });
    });
  });
};

const findProfile = (user, cb) => {
  User.find({ username: user }).exec(cb);
};

const createProfile = (user) => {
  const newProfile = new User(user);
  newProfile.save();
};

const findBook = (book, cb) => {
  // console.log('findBook is working with:', book);
  const pattern = new RegExp('^\\d{10,13}$');
  if ((book.length === 10 || book.length === 13) && pattern.test(book)) {
    // console.log('its an ISBN?');
    Book.find({ isbn: book }).exec(cb);
  } else {
    Book.find({ title: book }).exec(cb);
  }
};

const save = (bookInfo) => {
  const newBook = new Book({
    year: bookInfo.year,
    month: bookInfo.month,
    day: bookInfo.day,
    title: bookInfo.title,
    author: bookInfo.author,
    averageRating: bookInfo.averageRating,
    description: bookInfo.description,
    imageURL: bookInfo.imageURL,
    pages: bookInfo.pages,
    popularShelves: bookInfo.popularShelves,
    isbn13: bookInfo.isbn13,
    genres: bookInfo.genres,
  });
  newBook.save();
};

const findReview = (review, cb) => {
  Review.findOne({ idNameNumber: review }, (err, item) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, item);
    }
  });
};

// DO NOT TOUCH
const saveReview = (review, cb) => {
  const reviewID = `${review.user}${review.isbn13}`;
  findReview(reviewID, (err, data) => {
    if (err) {
      console.log('ERR on Database line 156');
      console.log(err);
      cb(err, null);
    } else if (data) {
      console.log('Success on database review look up line 160');
      console.log(data);

      if (review.review.length > 0) {
        updatedReview = review.review;
      } else {
        updatedReview = data.text;
      }

      if (review.rating > 0) {
        updatedRating = review.rating;
      } else {
        updatedRating = data.rating;
      }

      Review.update({ idNameNumber: reviewID }, {
        text: updatedReview,
        rating: updatedRating,
      }, (errUpdate, dataUpdate) => {
        cb(errUpdate, dataUpdate);
      });
    } else {
      console.log('add NEW DB @ 184', review);
      const newReview = new Review({
        idNameNumber: reviewID,
        user: review.user,
        isbn: review.isbn13,
        text: review.review,
        rating: review.rating,
      });
      newReview.save();
      cb(null, data);
    }
  });
};

// STEPHAN: YOU DONT NEED THIS. YOU CAN USE findUserFavorites

// const findFavorite = (favorite, cb) => {
//   favorite.findOne({ idNameNumber: review }, (err, item) => {
//     if (err) {
//       cb(err, null);
//     } else {
//       cb(null, item);
//     }
//   });
// };



// STEPHAN: THIS IS WHERE YOU ARE WORKING

// check DB and see whether user exists
// if user exists, check whether isbn13 exists in favorite books
     // if isbn13 exists, delete isbn13 (assume the only time favorite book get added is via clicking of heart)
     // if isbn13 does not exists, add isbn13 to favorite books
// if user does not exists, create new user..(this is already being taken care of.. no need to worry about this in here)


const saveFavorite = (userObject, cb) => {
  const { user, isbn13 } = userObject;
  console.log('on line 201  @ db.saveFavorite', user, isbn13);

  const updatedFavoriteBooks = user.favoriteBooks;
  console.log('before', updatedFavoriteBooks.length);

  let removed = false;

  if (updatedFavoriteBooks.length > 0) {
    updatedFavoriteBooks.forEach((isbn, index) => {
      // console.log('');
      console.log('are they equal?:', isbn, isbn13, isbn - isbn13);
      if (isbn - isbn13 === 0) {
        console.log('then remove it');
        removed = true;
        updatedFavoriteBooks.splice(index, 1);
        console.log('DURING', updatedFavoriteBooks.length);

      }
    });
    if (!removed) {
      console.log('   or we could add it');
      updatedFavoriteBooks.push(isbn13);
    }
  } else {
    updatedFavoriteBooks.push(isbn13);
  }

  console.log('after', updatedFavoriteBooks.length);

  User.update({ username: user }, {
    favoriteBooks: updatedFavoriteBooks,
  }, (errUpdate, dataUpdate) => {
    cb(errUpdate, dataUpdate);
  });
};




// const saveFavorite = (favorite, cb) => {
//   console.log(" on line 201  @ db.saveFavorite", favorite);

//   const user = `${favorite.user.username}`;
//   const isbn13 = `${favorite.isbn13}`;
//   console.log('on line 226 @ db.saveFavorite', user, isbn13);

//   findUserFavorites(user, (err, data) => {
//     console.log(" on line 231 in db", user);
//     if (err) {
//       console.log('ERR on Database line 206');
//       console.log(err);
//       cb(err, null);
//     } else if (data) {
//       console.log(" on line 235 in db", data);
//       console.log('Success on database favorite look up line 210');
//       console.log(data);

//       if (user.favoriteBooks) {
//         updatedFavorite = user.favoriteBooks.is
//         console.log(updatedFavorite);
//       }
//       //else {
//       //  // updatedFavorite = data.text;
//       //}

//       User.update({ username: user }, {
//         favoriteBooks: updatedFavorite,
//       }, (errUpdate, dataUpdate) => {
//         cb(errUpdate, dataUpdate);
//       });
//     }
    //else {
    //   console.log('add to favorite on line 261 @ DB.saveFavorite', isbn13);
    //   const newUser = new User({
    //      name: user,
    //      username: user,
    //      password: password,
    //      reviewedBooks: reviewedBooks,
    //      favoriteBooks: isbn13,
    //   });
    //   newUser.save();
    //   cb(null, data);
    // }
  //});
//}




module.exports = {
  selectAllBooks,
  findUserFavorites,
  findUserReviews,
  findProfile,
  findBook,
  createProfile,
  save,
  saveReview,
  findReview,
  saveFavorite,
};
