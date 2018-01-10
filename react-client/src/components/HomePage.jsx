import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
// import key from '../env/config.js';


class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bestSellerBook: ''
      };
    this.getBestSellersBooks = this.getBestSellersBooks.bind(this);
  }

  componentDidMount() {
    this.getBestSellersBooks();
  }

  getBestSellersBooks() {

    $.ajax({
      url: '/bestSellers',
      method: 'GET',
      }).done(function(result) {
      console.log("on line 26 in Hompeapage", result.results);
      this.setState({
        bestSellerBooks: result.results
      });
    }).fail(function(err) {
      throw err;
    });
  }

  render () {
    return (
      <div>
      <h1 >LiteraryLitten: The Rotten Tomatoes for Books</h1>
      <div className="bestSellerBooks"> Best Sellers Books view here</div>
      <div className="bookTitle" >       stars: </div>

    </div>)
  }
}

export default HomePage;
