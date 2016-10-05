import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { debounce } from 'lodash'

import { resetErrorMessage, resetMessage } from '../actions'
import { loadSessionUser } from '../actions/session'
import { toggleMenu, hideMenu } from '../actions/app'
import { resizeDevice } from '../actions/device'

import { selectSessionUser } from '../selectors/session'

import Navbar from '../components/Navbar'
import MainMenu from '../components/MainMenu'

class App extends Component {
  constructor(props) {
    super(props);

    [ "handleChange", "handleDismissClick", "handleDismissMessage", "handleMenuToggle", "handleHideMenu" ].forEach(m => this[m] = this[m].bind(this))
  }

  componentWillMount() {
    this.props.loadSessionUser()

    this._oldResize = window.onresize
    // debounce device resizing to not be a jerk on resize
    window.onresize = debounce((e) => {
      this.props.resizeDevice(window.innerWidth, window.innerHeight)
    }, 200)

    // initial call to make things not crazy
    this.props.resizeDevice(window.innerWidth, window.innerHeight)
  }

  componentWillUnmount() {
    window.onresize = this._oldResize
  }

  handleDismissClick(e) {
    this.props.resetErrorMessage()
    e.preventDefault()
  }

  handleDismissMessage(e) {
    this.props.resetMessage()
    e.preventDefault()
  }

  handleMenuToggle(e) {
    e.stopPropagation();
    this.props.toggleMenu();
  }
  handleHideMenu(e) {
    if (this.props.showMenu) {
      this.props.hideMenu();
    }
  }

  handleChange(nextValue) {
    browserHistory.push(`/${nextValue}`)
  }

  renderErrorMessage() {
    const { errorMessage } = this.props
    if (!errorMessage) {
      return null
    }

    return (
      <div className="alert alert-warning" role="alert">
        <b>{errorMessage}</b>
        {' '}
        (<a href="#"
            onClick={this.handleDismissClick}>
          Dismiss
        </a>)
      </div>
    )
  }

  renderMessage() {
    const { message } = this.props
    if (!message) {
      return null
    }

    return (
      <div className="alert alert-success" role="alert">
        <b>{message}</b>
        {' '}
        (<a href="#"
            onClick={this.handleDismissClick}>
          Dismiss
        </a>)
      </div>
    )
  }

  render() {
    const { children, inputValue, user, showMenu } = this.props
    return (
      <div onClick={this.handleHideMenu}>
        <Navbar user={user} onToggleMenu={this.handleMenuToggle} />
        <MainMenu user={user} show={showMenu} />
        {this.renderErrorMessage()}
        {this.renderMessage()}
        {children}
      </div>
    )
  }
}

App.propTypes = {
  // Injected by React Redux
  errorMessage: PropTypes.string,
  message : PropTypes.string,
  inputValue: PropTypes.string.isRequired,
  // Injected by React Router
  children: PropTypes.node,
  user : PropTypes.object,

  resetErrorMessage: PropTypes.func.isRequired,
  resetMessage: PropTypes.func.isRequired,
  loadSessionUser: PropTypes.func.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  hideMenu: PropTypes.func.isRequired
}

function mapStateToProps(state, ownProps) {
  return {
    message: state.message,
    errorMessage: state.errorMessage,
    inputValue: ownProps.location.pathname.substring(1),
    user : selectSessionUser(state),
    showMenu : state.app.showMenu
  }
}

export default connect(mapStateToProps, {
  resetMessage,
  resetErrorMessage,
  loadSessionUser,
  resizeDevice,
  toggleMenu,
  hideMenu
})(App)