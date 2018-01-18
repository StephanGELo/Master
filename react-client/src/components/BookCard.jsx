import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import classnames from 'classnames';
import Card, { CardHeader, CardContent, CardActions } from 'material-ui/Card';
import Collapse from 'material-ui/transitions/Collapse';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import red from 'material-ui/colors/red';
import FavoriteIcon from 'material-ui-icons/Favorite';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import Divider from 'material-ui/Divider';
import renderHTML from 'react-render-html';
import $ from 'jquery';
const axios = require('axios');

import PopUp from './PopUp.jsx';
import Rating from './Rating.jsx';

import Grid from 'material-ui/Grid';

const styles = theme => ({
  card: {
    maxWidth: 300,
    // height: 200,
  },
  media: {
    height: 25,
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: red[500],
  },
  flexGrow: {
    flex: '1 1 auto',
  },
  control: {
    padding: 100,
  },
});

class BookCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      book: this.props.book,
      expanded: false,
      rating: 0,
      description: '',
      user: this.props.userProfile,
      liked: false,
      thing: 0,
    };
    this.submitRank = this.submitRank.bind(this);
    this.goToBook = this.goToBook.bind(this);
    this.handleExpandClick = this.handleExpandClick.bind(this);
    this.addtoFavorites= this.addtoFavorites.bind(this);
    this.updateFavorite=this.updateFavorite.bind(this);
    console.log(" on line 63 @ class bookcard", this.props.user);
    //this.addtoFavorites = this.addtoFavorites.bind(this);
  }

  componentDidMount() {
    let str = this.props.book.description;
    str = str.replace(/<br>/gi, '\n');
    str = str.replace(/<p.*>/gi, '\n');
    str = str.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, ' $2 (Link->$1) ');
    str = str.replace(/<(?:.|\s)*?>/g, '');
    const arrayString = `${str.split(' ').join(' ').substring(0, 200)}...`;
    this.setState({
      description: arrayString,
    });
    const favIsbns = this.props;
    console.log("on line 79", favIsbns );
  }

  goToBook() {
    this.props.changeView('Book', this.state.book);
  }

  handleExpandClick() {
    console.log('expand');
    this.setState({ expanded: !this.state.expanded });
  }

  submitRank(rating) {
    // stuff here

  }

  updateFavorite() {
    if (this.props.userProfile.favoriteBooks.length > 0 && !this.state.liked) {
      this.props.userProfile.favoriteBooks.forEach((isbn13) => {
        if (isbn13 - this.state.book.isbn13 === 0) {
          this.setState({
            liked: true,
          }, () => { this.setState({ thing: Math.random() }); });
        }
      });
    }
  }

  addtoFavorites(cb) {
   // console.log(this.props.userProfile);
    // add books object to the array of favoriteBooks in user schema and save to DB
    alert('you clicked me', this.props.userProfile);
    axios({
      method: 'post',
      url: '/favorites',
      data: {
        user: this.props.userProfile,
        isbn13: this.state.book.isbn13,
      },
    })
    .then((response) => {
      const newFavs = JSON.parse(response.config.data);
      //console.log('response.body', newFavs);
      let user = this.props.userProfile;
      user.favoriteBooks = response;
      // this.props.updateUserData(user)
    });
  }



  render() {
    const { classes } = this.props;
    this.updateFavorite();

    return (
      <Grid item style={{ padding: 20 }} >
        <Card className={classes.card}>
          <CardHeader
            avatar={
              <img src={this.state.book.imageURL} alt="" />
              }
            action={
              <IconButton>
                <MoreVertIcon />
              </IconButton>
              }
            title={this.state.book.title}
            subheader={this.state.book.author}
            onClick={this.goToBook}
            style={{ cursor: 'pointer' }}
          />
          name: {this.props.userProfile.username}

           liked: {this.state.liked ? ' liked' : ' hate'}

          <Divider light />
          <CardContent>
            <Typography component="p">
              {this.state.description} <PopUp description={this.state.book.description} />
            </Typography>
          </CardContent>

          <Divider light />
          <CardContent>
          <Typography component="p">
            {this.state.book.genres.map(genre => (
                genre[0].toUpperCase() + genre.slice(1) + ' '
            ))}
          </Typography>
          </CardContent>

          <Divider light />
          <CardActions disableActionSpacing>
            <IconButton aria-label="Add to favorites" >
              <FavoriteIcon

              color={this.state.liked ? "accent" : "action"}
              onClick={this.addtoFavorites}
              />
            </IconButton>

            <Rating
              icon="Star"
              defaultRating={this.state.book.averageRating}
              maxRating={5}
              click={this.submitRank}
            />

            <div className={classes.flexGrow} />
          </CardActions>
        </Card>
      </Grid>
    );
  }
}

BookCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(BookCard);
