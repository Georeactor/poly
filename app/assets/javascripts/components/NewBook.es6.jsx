class NewBook extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      source_language: '',
      target_language: '',
      errors: [],
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
      scopes: [
        'https://www.googleapis.com/auth/youtube',
      ],
      interval: '',
      accessToken: '',
      stream: '',
      isVideoRecording: false,
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.makeApiCall = this.makeApiCall.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.saveToken = this.saveToken.bind(this);
    this.onDeleteVideoDescription = this.onDeleteVideoDescription.bind(this);
    this.onToggleInputType = this.onToggleInputType.bind(this);
    this.onCloseVideoComponent = this.onCloseVideoComponent.bind(this);
    this.onStopRecordingClick = this.onStopRecordingClick.bind(this);
    this.onStartRecordingClick = this.onStartRecordingClick.bind(this);
    this.onRenderVideoInput = this.onRenderVideoInput.bind(this);
    this.onSaveStream = this.onSaveStream.bind(this);
    this.onStopStream = this.onStopStream.bind(this);
    this.onClearStream = this.onClearStream.bind(this);
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

  // video zone

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

  onToggleInputType() {
    this.setState({ isInputVideo: !this.state.isInputVideo });
  }

  onCloseVideoComponent() {
    this.setState({
      isVideoRecording: false,
      isInputVideo: false,
    });
    if (this.state.stream !== '') {
      this.onStopStream();
    }
  }

  onStopRecordingClick() {
    this.setState({ isVideoRecording: !this.state.isVideoRecording });
  }

  onStartRecordingClick() {
    this.setState({ isVideoRecording: !this.state.isVideoRecording });
  }

  onRenderVideoInput() {
    if (this.state.isInputVideo) {
      const video = document.getElementById('camera-stream');
      video.muted = true;
      const self = this;

      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }

      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = (constraints) => {
          const getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia);

          if (!getUserMedia) {
            self.onCloseVideoComponent();
            alert('Sorry, your browser does not support the video recording.\n(In order to access the video recording, try again with one of these browsers: Chrome, Firefox, Edge, Opera.)');
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
          }
          return new Promise((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      }
      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then((stream) => {
        self.onSaveStream(stream);
        video.controls = false;
        video.src = window.URL.createObjectURL(stream);
      })
      .catch((err) => {
        console.log(err.name + ": " + err.message);
      });
    }
  }

  onSaveStream(stream) {
    this.setState({ stream: stream });
  }

  onStopStream() {
    const tracks = this.state.stream.getTracks();
    tracks[0].stop();
    tracks[1].stop();
    this.onClearStream();
  }
  onClearStream() {
    this.setState({stream: ''});
  }

  onInputChange(e) {
    const newState = this.state;
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  onSubmit(e) {
    e.preventDefault();
    this.state.errors = [];
    if (this.state.title && this.state.source_language && this.state.target_language) {
      $.ajax({
        url: '/books',
        type: 'POST',
        data: {
          book: this.state,
        },
        success(book) {
          window.location.href = '/books/' + book.id;
        },
        error(error) {
          console.log(error);
        },
      });
    } else {
      if (!this.state.title) this.state.errors.push(' Title');
      if (!this.state.source_language) this.state.errors.push(' Source language');
      if (!this.state.target_language) this.state.errors.push(' Target language');
      bootbox.alert({
        message: 'Your book is missing the following required details:' + (this.state.errors),
        closeButton: false,
      });
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
    if (!this.state.isInputVideo) {
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
            onCancelEditPhrase={this.onCancelEditPhrase}
            onCloseVideoComponent={this.onCloseVideoComponent}
            onStartRecordingClick={this.onStartRecordingClick}
            onStopRecordingClick={this.onStopRecordingClick}
            onToggleInputType={this.onToggleInputType}
            onSaveStream={this.onSaveStream}
            onStopStream={this.onStopStream}
            onClearStream={this.onClearStream}
            onSaveVideoDescription={this.onSaveVideoDescription}
            closeAlt={this.props.closeAlt}
            textAlt={this.props.textAlt}
            isVideoRecording={this.state.isVideoRecording}
            isInputVideo={this.state.isInputVideo}
            mediaConstraints={this.state.mediaConstraints}
            stream={this.state.stream}
            sourceLanguage={this.props.sourceLanguage}
            targetLanguage={this.props.targetLanguage}
            author={this.props.author}
            accessToken={this.state.accessToken}
          />
        </div>
      );
    }
  }

  renderDescription() {
    if (this.state.description.startsWith('http://')) {
      this.setState({ isDescriptionVideo: true });
      return <iframe className="iframe-description" src={this.state.book.description} frameBorder="0" />;
    }
    return (
      <textarea
        disabled={this.state.isDescriptionVideo}
        rows="4"
        className="description new isEditing"
        name="description"
        placeholder="Describe the contents of your book, Ex: A
        collection of useful phrases in Laputa, a Swiftian language
        spoken in Balnibarbi and a number of other islands."
        onChange={this.onInputChange}
        value={this.state.description}
      />
    );
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
          <form onSubmit={this.onSubmit}>
            <fieldset className="tools">
              <span title="Favorite"className="icon">
                <img src={this.props.unstar} alt="Favorite" />
              </span>
              <section className="cardinality">
                <section>
                  <input
                    className="new language source"
                    type="text"
                    name="source_language"
                    placeholder="Source"
                    value={this.state.sourceLanguage}
                    onChange={this.onInputChange}
                  />
                  <img src={this.props.cardinality} alt="" />
                  <input
                    className="new language target"
                    type="text"
                    name="target_language"
                    placeholder="Target"
                    value={this.state.targetLanguager}
                    onChange={this.onInputChange}
                  />
                </section>
              </section>
              {/* <button title="Menu" className="more icon">
                <img src={this.props.menuAlt}/>
              </button> */}
              <span title="Menu" className="icon">
                <img src={this.props.menuAlt} />
              </span>
            </fieldset>
            <fieldset className="info">
              <div className="wrapper">
                <input
                  className="new title"
                  type="text"
                  name="title"
                  placeholder="Useful phrases in Laputa"
                  autoFocus
                  value={this.state.title}
                  onChange={this.onInputChange}
                />
                <a className="author">{this.props.currentUser.username}</a>
                {this.renderDescription()}
                {this.renderVideoInput()}
                {this.renderInputOptions()}
              </div>
            </fieldset>
            <section className="new dictionary">
              <DummyContent />
              <button className="startBook" type="submit">Create Book</button>
            </section>
          </form>
        </div>
      </div>
    );
  }
}

NewBook.propTypes = {
  currentUser: React.PropTypes.shape({
    created_at: React.PropTypes.string,
    email: React.PropTypes.string,
    favorite_books: React.PropTypes.array,
    id: React.PropTypes.number,
    username: React.PropTypes.string,
  }),
  logo: React.PropTypes.string,
  detail: React.PropTypes.string,
  search: React.PropTypes.string,
  unstar: React.PropTypes.string,
  cardinality: React.PropTypes.string,
  menuAlt: React.PropTypes.string,
};
