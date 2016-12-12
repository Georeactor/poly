class Book extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phrasePairs: this.props.initialPhrasePairs,
      isEditingBook: false,
      book: this.props.initialBook,
      isDescriptionTruncated: true,
      isFavoriteBook: this.isFavoriteBook(),
      errors: [],
      isNewPhrase: false,
      isDescriptionVideo: false,
      isInputVideo: false,
      isVideoNotAvailable: true,
      videoButtonClass: ' video-button-disabled',
      // clientId Ben
      clientId: '463787160210-mcm71qds0opgn9cf661pptqt1hcofh3d.apps.googleusercontent.com',
      // wikitongues
      // clientId: '20162064407-uf2hnjg83uhaq6v3soa0bm0ngp5gmvjq.apps.googleusercontent.com',
      // refresh token Ben
      refreshToken: '1/vI-S3g2HImFh7nj2wV_cw8y-28lMva6O1IiTQZ7jKZQ',
      interval: '',
      accessToken: '',
    };
    this.makeApiCall = this.makeApiCall.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.saveToken = this.saveToken.bind(this);
    this.onSourcePhraseSubmit = this.onSourcePhraseSubmit.bind(this);
    this.onTargetPhraseSubmit = this.onTargetPhraseSubmit.bind(this);
    this.saveNewPhrasePair = this.saveNewPhrasePair.bind(this);
    this.onDeleteBookClick = this.onDeleteBookClick.bind(this);
    this.onSaveBookClick = this.onSaveBookClick.bind(this);
    this.onInvertLanguagesClick = this.onInvertLanguagesClick.bind(this);
    this.toggleEditingBookState = this.toggleEditingBookState.bind(this);
    this.cancelEditingBookState = this.cancelEditingBookState.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onClickFavoriteBook = this.onClickFavoriteBook.bind(this);
    this.destroyFavorite = this.destroyFavorite.bind(this);
    this.createFavorite = this.createFavorite.bind(this);
    this.toggleFavoriteBook = this.toggleFavoriteBook.bind(this);
    this.bookIsOwnedByCurrentUser = this.bookIsOwnedByCurrentUser.bind(this);
    this.onDeleteVideoDescription = this.onDeleteVideoDescription.bind(this);
    this.renderBookMenu = this.renderBookMenu.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
    this.renderAuthor = this.renderAuthor.bind(this);
    this.truncateText = this.truncateText.bind(this);
    this.renderTruncatedDescription = this.renderTruncatedDescription.bind(this);
    this.renderDescription = this.renderDescription.bind(this);
    this.renderSourceLanguage = this.renderSourceLanguage.bind(this);
    this.renderTargetLanguage = this.renderTargetLanguage.bind(this);
    this.favoriteImage = this.favoriteImage.bind(this);
    this.isFavoriteBook = this.isFavoriteBook.bind(this);
    this.renderFavoriteButton = this.renderFavoriteButton.bind(this);
    this.renderInputOptions = this.renderInputOptions.bind(this);
    this.renderVideoInput = this.renderVideoInput.bind(this);
  }

  componentWillMount() {
    const makeApiCall = this.makeApiCall;
    if (typeof gapi !== 'undefined') {
      gapi.load('client:auth2', makeApiCall);

      if (gapi.loaded_0 == null) {
        this.setState({
          isVideoNotAvailable: false,
          videoButtonClass: ' video-button-enabled',
        });
      }
    }
    this.refreshToken();
    const int = setInterval(this.refreshToken(), 2400000);
    this.setState({ interval: int });
  }

  makeApiCall() {
    const clientId = this.state.clientId;
    const scopes = this.state.scopes;

    gapi.auth2.init({
      client_id: clientId,
      scopes,
    }).then(() => {
      gapi.client.load('youtube', 'v3')
      .then(() => {
        this.setState({
          isVideoNotAvailable: false,
          videoButtonClass: ' video-button-enabled',
        });
      });
    });
  }

  refreshToken() {
    const url = 'https://www.googleapis.com/oauth2/v4/token';
    const method = 'POST';
    const postData = 'client_secret=31zQmZ0j4_16OXYRh_PLy5tB&grant_type=refresh_token&refresh_token=1%2FE_yN56Kk6X5Y6qv3bnackF7yH2SOfWJ7uaaMMcTtpP-GqAK8dNkv2sl1LRgG-sZl&client_id=463787160210-mcm71qds0opgn9cf661pptqt1hcofh3d.apps.googleusercontent.com';
    const request = new XMLHttpRequest();
    const saveToken = this.saveToken;
    request.onload = () => {
      const data = JSON.parse(request.responseText);
      saveToken(data.access_token);
    };
    request.open(method, url);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send(postData);
  }

  saveToken(accessToken) {
    this.setState({ accessToken });
  }

  onSourcePhraseSubmit(sourcePhrase, isNewPhrase) {
    if (isNewPhrase) {
      this.setState({ isNewPhrase: true });
    }
    const newPhrasePair = { source_phrase: sourcePhrase };
    const newPhrasePairs = this.state.phrasePairs;
    newPhrasePairs.push(newPhrasePair);
    this.setState({ phrasePairs: newPhrasePairs });
  }

  onTargetPhraseSubmit(targetPhrase) {
    const newPhrasePairs = this.state.phrasePairs;
    const newPhrasePair = newPhrasePairs[newPhrasePairs.length - 1];
    newPhrasePair.target_phrase = targetPhrase;
    this.setState({ phrasePairs: newPhrasePairs });
    this.saveNewPhrasePair(newPhrasePair);
  }

  saveNewPhrasePair(phrasePair) {
    $.ajax({
      url: '/phrase_pairs',
      type: 'POST',
      data: {
        book_id: this.state.book.id,
        phrase_pair: phrasePair,
      },
      success: function (phrasePair) {
        const newPhrasePairs = this.state.phrasePairs;
        newPhrasePairs.splice(this.state.phrasePairs.length - 1, 1, phrasePair.phrase_pair);
        this.setState({ phrasePairs: newPhrasePairs });
      }.bind(this),
      error() {
        console.log('Error: Save action failed');
      },
    });
  }

  onDeleteBookClick() {
    const id = this.state.book.id;
    bootbox.confirm({
      message: 'Are you sure you want to delete this book?',
      closeButton: false,
      callback: (result) => {
        if (result === true) {
          $.ajax({
            url: '/books/' + id,
            type: 'DELETE',
            success() {
              window.location.href = '/dashboard';
            },
          });
        }
      },
    });
  }

  onSaveBookClick() {
    this.state.errors = [];
    if (this.state.book.title && this.state.book.source_language && this.state.book.target_language) {
      $.ajax({
        url: '/books/' + this.state.book.id,
        type: 'PUT',
        data: { book: this.state.book },
        success: function () {
          this.cancelEditingBookState();
        }.bind(this),
        error() {
          bootbox.alert({
            message: 'Something went wrong',
            closeButton: false,
          });
        },
      });
    } else {
      if (!this.state.book.title) this.state.errors.push(' Title');
      if (!this.state.book.source_language) this.state.errors.push(" Source language");
      if (!this.state.book.target_language) this.state.errors.push(" Target language");
      bootbox.alert({
        message: 'Your book is missing the following required details:' + (this.state.errors),
        closeButton: false,
      });
    }
  }

  onInvertLanguagesClick() {
    const newBook = this.state.book;
    const newState = this.state;

    const sourceLanguage = this.state.book.source_language;
    const targetLanguage = this.state.book.target_language;

    newBook.source_language = targetLanguage;
    newBook.target_language = sourceLanguage;

    newState.book = newBook;
    this.setState(newState);
  }

  toggleEditingBookState() {
    if (this.state.book.description.startsWith('https://')) {
      this.setState({ isDescriptionVideo: true });
    }
    this.setState({ isEditingBook: true });
  }

  cancelEditingBookState() {
    this.setState({ isEditingBook: false });
  }

  onInputChange(e) {
    const newBook = this.state.book;
    const newState = this.state;

    newBook[e.target.name] = e.target.value;
    newState.book = newBook;
    this.setState(newState);
  }

  onClickFavoriteBook() {
    if (this.state.isFavoriteBook) {
      this.destroyFavorite();
    } else {
      this.createFavorite();
    }
  }

  destroyFavorite() {
    $.ajax({
      url: '/favorites/' + this.state.book.id,
      type: 'DELETE',
      success: function () {
        this.toggleFavoriteBook();
      }.bind(this),
      error() {
        console.log('something went wrong');
      },
    });
  }

  createFavorite() {
    $.ajax({
      url: '/favorites',
      type: 'POST',
      data: {
        book_id: this.state.book.id,
      },
      success: function () {
        this.toggleFavoriteBook();
      }.bind(this),
      error() {
        console.log('something went wrong');
      },
    });
  }

  toggleFavoriteBook() {
    this.setState({ isFavoriteBook: !this.state.isFavoriteBook });
  }

  bookIsOwnedByCurrentUser() {
    if (this.props.currentUser) {
      return this.props.initialBook.user_id == this.props.currentUser.id;
    }
  }

  onDeleteVideoDescription() {
    bootbox.confirm({
      message: 'Are you sure you want to delete the video description?',
      closeButton: false,
      callback: () => {
        const book = this.state.book;
        book.description = '';
        this.setState({
          book,
          isDescriptionVideo: false,
        });
      },
    });
  }

  renderBookMenu() {
    if (this.bookIsOwnedByCurrentUser()) {
      if (this.state.isEditingBook) {
        return (
          <div className="menu saving">
            <button title="Flip" onClick={this.onInvertLanguagesClick} className="icon">
              <img src={this.props.flipAlt} />
            </button>
            <button title="Save" onClick={this.onSaveBookClick} className="icon">
              <img src={this.props.saveAlt} alt="Save" />
            </button>
            <button title="Cancel" onClick={this.cancelEditingBookState} className="close icon">
              <img src={this.props.closeAlt} />
            </button>
          </div>
        );
      } else {
        return (
          <div className="menu">
            <button title="Menu" className="more icon">
              <img src={this.props.menuAlt} />
            </button>
            <button title="Edit" onClick={this.toggleEditingBookState} className="icon" tabIndex="-1">
              <img src={this.props.editAlt} />
            </button>
            <button title="Delete" onClick={this.onDeleteBookClick} className="icon" tabIndex="-1">
              <img src={this.props.deleteAlt} />
            </button>
          </div>
        );
      }
      return (
        <div className="menu">
          <button title="Menu" className="more icon">
            <img src={this.props.menuAlt} alt="Menu" />
          </button>
          <button
            title="Edit"
            onClick={this.toggleEditingBookState}
            className="icon"
            tabIndex="-1"
          >
            <img src={this.props.editAlt} alt="Edit" />
          </button>
          <button
            title="Delete"
            onClick={this.onDeleteBookClick}
            className="icon"
            tabIndex="-1"
          >
            <img src={this.props.deleteAlt} alt="Delete" />
          </button>
        </div>
      );
    }
  }

  renderTitle() {
    if (this.state.isEditingBook) {
      return (
        <input
          name="title"
          className="title new isEditing"
          onChange={this.onInputChange}
          value={this.state.book.title}
        />
      );
    }
    return <h1 title={this.state.book.title}>{this.state.book.title}</h1>;
  }

  renderAuthor() {
    const users = this.props.users;
    let authorName = '';
    for (var i = users.length - 1; i >= 0; i--) {
      if (this.props.initialBook.user_id == users[i].id) {
        authorName = users[i].username;
      }
    }

    if (this.bookIsOwnedByCurrentUser()) {
      if (this.state.isEditingBook) {
        return (
          <p className="author">{authorName}</p>
        );
      }
      return (
        <a href={"/dashboard"} className="author">{authorName}</a>
      );
    }
    return (
      <a href={'/users/' + this.state.book.user_id} className="author">{authorName}</a>
    );
  }

  truncateText() {
    this.setState({ isDescriptionTruncated: !this.state.isDescriptionTruncated });
  }

  renderTruncatedDescription() {
    if (this.state.book.description.startsWith('https://')) {
      return <iframe className="iframe-description" src={this.state.book.description} frameBorder="0" />;
    }
    if (this.state.book.description.length >= 132) {
      if (this.state.isDescriptionTruncated) {
        return (
          <p className="description">
            {this.state.book.description.substring(0, 132)}...
            <button onClick={this.truncateText}>More</button>
          </p>
        );
      }
      return (
        <p className="description">
          {this.state.book.description}
          <button onClick={this.truncateText}>Less</button>
        </p>
      );
    }
    return <p className="description">{this.state.book.description}</p>;
  }

  renderDescription() {
    if (this.state.book.description) {
      if (this.state.isEditingBook) {
        if (this.state.book.description.startsWith('https://')) {
          return <iframe className="iframe-description" src={this.state.book.description} frameBorder="0" />;
        }
        return (
          <textarea
            disabled={this.state.isDescriptionVideo}
            rows="4"
            className="description new isEditing"
            name="description"
            onChange={this.onInputChange}
            value={this.state.book.description}
          />
        );
      }
      return <span>{this.renderTruncatedDescription()}</span>;
    }
    if (this.state.isEditingBook) {
      return (
        <textarea
          rows="5"
          className="description new isEditing"
          name="description"
          onChange={this.onInputChange}
          value={this.state.book.description}
          placeholder="Describe the contents of your book,
          Ex: A collection of useful phrases in Laputa, a Swiftian
          language spoken in Balnibarbi and a number of other islands..."
        />
      );
    }
  }

  renderSourceLanguage() {
    if (this.state.isEditingBook) {
      return (
        <input
          className="new isEditing"
          name="source_language"
          onChange={this.onInputChange}
          value={this.state.book.source_language}
        />
      );
    }
    return (
      <h1 className="language source" title={this.state.book.source_language}>
        {this.state.book.source_language}
      </h1>
    );
  }

  renderTargetLanguage() {
    if (this.state.isEditingBook) {
      return (
        <input
          className="new isEditing"
          name="target_language"
          onChange={this.onInputChange}
          value={this.state.book.target_language}
        />
      );
    }
    return (
      <h1 className="language target" title={this.state.book.target_language}>
        {this.state.book.target_language}
      </h1>
    );
  }

  favoriteImage() {
    return this.state.isFavoriteBook
      ? this.props.star
      : this.props.unstar;
  }

  isFavoriteBook() {
    if (this.props.currentUser) {
      return this.props.currentUser.favorite_books.filter((favorite) => {
        return favorite.book_id == this.props.initialBook.id;
      }).length > 0;
    }
  }

  renderFavoriteButton() {
    if (this.props.currentUser) {
      return (
        <button title="Favorite" onClick={this.onClickFavoriteBook} className="favorite icon">
          <img src={this.favoriteImage()} alt="Favorite" />
        </button>
      );
    }
  }

  renderInputOptions() {
    if (this.state.isDescriptionVideo) {
      return (
        <div className="inputMethod">
          <span className="inputOptions">
            <button title="Delete" onClick={this.onDeleteVideoDescription} className="close icon"><img src={this.props.close} alt="close"/></button>
          </span>          
        </div>
      );
    }
    if (this.state.isEditingBook && !this.state.isInputVideo) {
      const videoButtonClass = 'video icon' + this.state.videoButtonClass;
      return (
        <div className="inputMethod">
          <span className="inputOptions">
            <button title="Text" className="text icon selectedInput"><img src={this.props.textAlt} alt="text"/></button>
            <button disabled={this.state.isVideoNotAvailable} title="Video" onClick={this.onToggleInputType} className={videoButtonClass}><img src={this.props.video} alt="video"/></button>
            <button title="Cancel" onClick={this.onCancelEditPhrase} className="close icon"><img src={this.props.close} alt="close"/></button>
          </span>          
        </div>
      );     
    }
  }

  renderVideoInput() {
    if (this.state.isInputVideo) {
      return (
        <div ref="video">
          <Video
            onRenderVideoInput={this.onRenderVideoInput}
            renderRecordButton={this.renderRecordButton}
            onCancelEditPhrase={this.onCancelEditPhrase}
            onCloseVideoComponent={this.onCloseVideoComponent}
            onStartRecordingClick={this.onStartRecordingClick}
            onStopRecordingClick={this.onStopRecordingClick}
            onSourceVideoSubmit={this.onSourceVideoSubmit}
            onTargetVideoSubmit={this.onTargetVideoSubmit}
            onToggleInputType={this.onToggleInputType}
            onClearStream={this.onClearStream}
            onToggleGAPILoaded={this.onToggleGAPILoaded}
            closeAlt={this.props.closeAlt}
            textAlt={this.props.textAlt}
            isVideoRecording={this.state.isVideoRecording}
            isInputVideo={this.state.isInputVideo}
            onSaveStream={this.onSaveStream}
            onStopStream={this.onStopStream}
            mediaConstraints={this.state.mediaConstraints}
            stream={this.state.stream}
            isTargetInputActive={this.state.isTargetInputActive}
            sourceLanguage={this.props.sourceLanguage}
            targetLanguage={this.props.targetLanguage}
            author={this.props.author}
            accessToken={this.state.accessToken}
          />
        </div>
      );
    }
  }

  render() {
    return (
      <div className="container">
        <NavBar
          currentUser={this.props.currentUser}
          logo={this.props.logo}
          detail={this.props.detail}
          search={this.props.search}
        />
        <span className="backgroundElement" />
        <div className="book">
          <div className="tools">
            {this.renderFavoriteButton()}
            <div className="cardinality">
              <section>
                { this.renderSourceLanguage() }
                <img src={this.props.cardinality} alt="Cardinality" />
                { this.renderTargetLanguage() }
              </section>
            </div>
            { this.renderBookMenu() }
          </div>
          <div className="info">
            <div className="wrapper">
              { this.renderTitle() }
              { this.renderAuthor() }
              { this.renderDescription() }
            </div>
          </div>
          { this.renderInputOptions() }
          {/* <ProgressBar /> */}
          <div className="NObannerWrapper"></div>

          <Dictionary
            isOwnedByCurrentUser={this.bookIsOwnedByCurrentUser()}
            initialPhrasePairs={this.state.phrasePairs}
            onSourcePhraseSubmit={this.onSourcePhraseSubmit}
            onTargetPhraseSubmit={this.onTargetPhraseSubmit}
            isEditingBook={this.state.isEditingBook}
            menu={this.props.menu}
            flip={this.props.flip}
            save={this.props.save}
            delete={this.props.delete}
            edit={this.props.edit}
            text={this.props.text}
            textAlt={this.props.textAlt}
            video={this.props.video}
            videoAlt={this.props.videoAlt}
            close={this.props.close}
            closeAlt={this.props.closeAlt}
            sourceLanguage={this.state.book.source_language}
            targetLanguage={this.state.book.target_language}
            author={this.state.book.user_id}
            isNewPhrase={this.state.isNewPhrase}
            isVideoNotAvailable={this.state.isVideoNotAvailable}
            videoButtonClass={this.state.videoButtonClass}
            accessToken={this.state.accessToken}
          />
        </div>
      </div>
    );
  }
}

Book.propTypes = {
  initialPhrasePairs: React.PropTypes.arrayOf(React.PropTypes.shape({
    book_id: React.PropTypes.number,
    created_at: React.PropTypes.string,
    id: React.PropTypes.number,
    source_phrase: React.PropTypes.string,
    target_phrase: React.PropTypes.string,
    updated_at: React.PropTypes.string,
  })),
  initialBook: React.PropTypes.shape({
    created_at: React.PropTypes.string,
    description: React.PropTypes.string,
    id: React.PropTypes.number,
    source_language: React.PropTypes.string,
    target_language: React.PropTypes.string,
    title: React.PropTypes.string,
    updated_at: React.PropTypes.string,
    user_id: React.PropTypes.number,
  }),
  currentUser: React.PropTypes.shape({
    created_at: React.PropTypes.string,
    email: React.PropTypes.string,
    favorite_books: React.PropTypes.array,
    id: React.PropTypes.number,
    username: React.PropTypes.string,
  }),
  flipAlt: React.PropTypes.string,
  saveAlt: React.PropTypes.string,
  closeAlt: React.PropTypes.string,
  menuAlt: React.PropTypes.string,
  editAlt: React.PropTypes.string,
  deleteAlt: React.PropTypes.string,
  users: React.PropTypes.arrayOf(React.PropTypes.shape({
    created_at: React.PropTypes.string,
    email: React.PropTypes.string,
    favorite_books: React.PropTypes.array,
    id: React.PropTypes.number,
    username: React.PropTypes.string,
  })),
  star: React.PropTypes.string,
  unstar: React.PropTypes.string,
  logo: React.PropTypes.string,
  detail: React.PropTypes.string,
  search: React.PropTypes.string,
  cardinality: React.PropTypes.string,
  menu: React.PropTypes.string,
  flip: React.PropTypes.string,
  save: React.PropTypes.string,
  delete: React.PropTypes.string,
  edit: React.PropTypes.string,
  close: React.PropTypes.string,
};
