import React, { Component } from 'react';
import {
  Grid,
  Header,
  Segment,
  Button,
  Icon,
  Divider,
  Statistic,
  Message,
  Form,
  Responsive
} from 'semantic-ui-react';
import { getKey, createKey, deleteKey } from './profileController';


/* Extended react.Component class as ProfileSettings */

export default class ProfileSettings extends Component {

  /**
   * Constructor for the ProfileSettings class
   * @constructor extends react.Component
   */

  constructor(props) {
    super(props);
    this.state = {
      key: false,
      requestsAllowed: '-',
      requestsLeft: '-',
      timeLeft: '-',
      error: false,
      errorMessage: '',
      textCopied: false,
      profile:{

      }
    };
    this.createAccessKey = this.createAccessKey.bind(this);
    this.deleteAccessKey = this.deleteAccessKey.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
  }

  /**
   * Function to calculate remaining time to reset API key
   * @param {string} time
   * @return {string}
   */

  timeLeftToReset(time) {
    const timeLeft = (new Date() - new Date(time)) / 1000; // convert to seconds
    // console.log(time);
    if (timeLeft >= 86400) {
      return `0 H`;
    } else if (86400 - timeLeft >= 3600) {
      return `${Math.floor((86400 - timeLeft) / 3600)} H`;
    } else {
      return `${Math.ceil(timeLeft / 60)} M`;
    }
  }

  /**
   * Function to create API key
   */

  createAccessKey() {
    // const self = this;
    createKey().then(data => {
      //console.log(data);
      if (data.success) {
        this.setState({
          key: data.apikey,
          requestsAllowed: data.requests.allowed,
          requestsLeft: data.requests.left,
          timeLeft: this.timeLeftToReset(data.requests.resetTime)
        });
      } else {
        this.setState({
          error: true,
          errorMessage: data.err
        });
      }
    });
  }

  /**
   * Function to delete API key
   */

  deleteAccessKey() {
    const self = this;
    deleteKey().then(data => {
      // console.log(data);
      if (data.success) {
        this.setState({
          key: false,
          requestsAllowed: '-',
          requestsLeft: '-',
          timeLeft: '-'
        });
      } else {
        this.setState({
          error: true,
          errorMessage: data.err
        });
      }
    });
  }

  copyToClipboard(){
    let textField = document.createElement('textarea');
    textField.innerText = this.state.key;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    this.setState({ textCopied: true});
    setTimeout(() => {
        this.setState({ textCopied: false});
    }, 5000);
  }

  /** 
   * Inherit function from react.Component to handle after mounting
   *   react component
   */

  componentDidMount(){
      this.props.auth.getProfile()
          .then((profile) => {
              this.setState({profile:profile});
          })
          .catch((err) => {
              console.log(err);
          });
    
    getKey().then(data => {
      if (data.success) {
        this.setState({
          key: data.apikey,
          requestsAllowed: data.requests.allowed,
          requestsLeft: data.requests.left,
          timeLeft: this.timeLeftToReset(data.requests.resetTime)
        });
      }
    });
  }

  /** 
   * Inherited function from react.Component to render to DOM object into html
   */

  render(){
    return (
      <Responsive as={Segment} raised>
        <Header as="h3">
          <Icon name="settings" />
          <Header.Content>
            Account Settings
            <Header.Subheader>Manage your preferences</Header.Subheader>
          </Header.Content>
        </Header>
        <Divider />
        <Grid divided textAlign="center" columns="equal">
          <Grid.Row>
            <Grid.Column mobile={16} tablet={5} computer={5}>
              <Statistic
                size="mini"
                value={this.state.requestsAllowed}
                label="Requests Allowed"
              />
            </Grid.Column>
            <Grid.Column mobile={16} tablet={5} computer={5}>
              <Statistic
                size="mini"
                value={this.state.requestsLeft}
                label="Requests Left"
              />
            </Grid.Column>
            <Grid.Column mobile={16} tablet={5} computer={5}>
              <Statistic
                size="mini"
                value={this.state.timeLeft}
                label="Time to reset"
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider />
        {this.state.error &&
          <Message warning>
            <Message.Header>
              {this.state.errorMessage}
            </Message.Header>
            <p>Please contact us if you are feeling stuck.</p>
          </Message>}
          {this.state.textCopied &&
          <Message success>
            <p>Copied to clipboard!</p>
          </Message>}

        <Form>
          <Form.Group>
           <Form.Input width={12} value={this.state.key ? this.state.key : 'Generate an API access key'} readOnly />
          {!this.state.key
            ? <Button primary size='small' onClick={this.createAccessKey} style={{marginLeft:'10px'}}>
                CREATE API KEY
              </Button>
            : <Button negative size='small' onClick={this.deleteAccessKey} style={{marginLeft:'10px'}}>
                DELETE KEY
              </Button>}

              {this.state.key && document.queryCommandSupported('copy') &&
              <div>
              <Button positive size='small' onClick={this.copyToClipboard} style={{marginLeft:'10px'}}>
                  COPY TO CLIPBOARD
                  </Button>
              </div>}
        </Form.Group>
        </Form>
      </Responsive>
    );
  }
}
