Profile = React.createClass( {

  getInitialState: function () {
    //mockup data
    return {
      languages: ['Swiss german', 'German', 'French', 'English', 'Portuguese'],
      followers: [{username:'Daniel Udell', user_id:3},{username:'Charles Darwin', user_id:9},{username:'Marie Curie', user_id:1},{username:'Johannes Kepler', user_id:3},{username:'Louis Pasteur', user_id:3}]
    }
  },

  renderAuthoredBooks: function() {
    return this.props.books.map((book) => {
      return <BookEntry book={book} key={book.id}></BookEntry>
    })
  },

  currentUserProfile: function() {
    if (this.props.currentUser) {
      return this.props.userData.id != this.props.currentUser.id
    }
  },

  renderCreateBookButton: function() {
    if(!this.currentUserProfile()) {
      if (this.props.currentUser) {
        return (
          <a href="/books/new" className="newBook" title="Create a new book">+</a>
        )
      }
    }
  },

  renderDashboardHeader: function() {
    if(!this.currentUserProfile()) {
      return <h2>Your books</h2>
    } else {
      return <h2>Books by {this.props.userData.username}</h2>
    }
  },

  renderFollowButton: function() {
    if(this.currentUserProfile()) {
      return  <a className="follow">follow</a>
    }
  },

  render: function() {
    let langs = []
    this.state.languages.forEach(function (lang) {
      langs.push(<span className="language">{lang}</span>)
    })

    let followers = []
    this.state.followers.forEach(function (follower) {
      followers.push(<li><a href={follower.user_id}>{follower.username}</a></li>)
    })

    let createdDate = new Date(this.props.userData.created_at),
    createdYear = createdDate.getUTCFullYear(),
    months = ["January","February","March","April","May","June","July","August","September","October","November","December"],
    createdMonth = months[createdDate.getMonth()]

    return(
      <div className="container">
        <NavBar currentUser={this.props.currentUser}/>
        <div id="profile">
          <div className="info">
            <div className="wrapper">
              <h2>{this.props.userData.username}</h2>
              <p>{this.props.userData.email}</p>
              <img src={`http://www.gravatar.com/avatar/${this.props.hashedEmail}?s=200`} />
              <div className="languages">
                {langs}
              </div>
              <p>Member since {createdMonth} {createdYear}</p>
              {this.renderFollowButton()}
              <div className="followedBy">
              Followers ({followers.length})
                <ul>
                  {followers}
                </ul>
              </div>
            </div>
          </div>
          <div className="dashboard">
            {this.renderDashboardHeader()}
            <ul className="content">
              {this.renderAuthoredBooks()}
            </ul>
            {this.renderCreateBookButton()}
          </div>
        </div>
      </div>
    )}
  });
