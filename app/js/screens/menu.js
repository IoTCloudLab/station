import React, {Component} from 'react'
import CSSTransitionGroup from 'react-addons-css-transition-group'
import ipc from 'electron-safe-ipc/guest'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import StartScreen from './menu/start'
import ProfileScreen from './menu/profile'
import Loader from '../components/view/loader'

import '../../styles/animations.less'

const UNINITIALIZED = 'uninitialized'
const RUNNING = 'running'
const STARTING = 'starting'
const STOPPING = 'stopping'

@DragDropContext(HTML5Backend)
export default class Menu extends Component {

  state = {
    status: UNINITIALIZED,
    connected: false,
    version: null,
    stats: {}
  }

  // -- Event Listeners

  _onVersion = (arg) => {
    this.setState({version: arg})
  }

  _onNodeStatus = (status) => {
    this.setState({status: status})
  }

  _onStats = (stats) => {
    this.setState({stats: stats})
  }

  _startDaemon () {
    ipc.send('start-daemon')
  }

  _stopDaemon () {
    ipc.send('stop-daemon')
  }

  _closeWindow () {
    ipc.send('close-tray-window')
  }

  _openConsole () {
    ipc.send('open-console')
  }

  _openBrowser () {
    ipc.send('open-browser')
  }

  _openSettings () {
    ipc.send('open-settings')
  }

  componentDidMount () {
    // -- Listen to control events

    ipc.on('version', this._onVersion)
    ipc.on('node-status', this._onNodeStatus)
    ipc.on('stats', this._onStats)

    ipc.send('request-state')
  }

  componentWillUnmount () {
    // -- Remove control events

    ipc.removeListener('version', this._onVersion)
    ipc.removeListener('node-status', this._onNodeStatus)
    ipc.removeListener('stats', this._onStats)
    ipc.removeListener('uploading', this._onUploading)
    ipc.removeListener('uploaded', this._onUploaded)
  }

  _getScreen () {
    switch (this.state.status) {
      case RUNNING:
        return (
          <ProfileScreen
            key='profile-screen'
            peers={this.state.stats.peers}
            location={this.state.stats.location}
            onStopClick={this._stopDaemon}
            onConsoleClick={this._openConsole}
            onBrowserClick={this._openBrowser}
            onSettingsClick={this._openSettings}
            onCloseClick={this._closeWindow}
            />
        )
      case STARTING:
      case STOPPING:
        return <Loader key='loader-screen' />
      default:
        return (
          <StartScreen
            key='start-screen'
            onStartClick={this._startDaemon}
            onCloseClick={this._closeWindow}/>
        )
    }
  }

  render () {
    return (
      <CSSTransitionGroup
        transitionName='fade'
        transitionEnterTimeout={300}
        transitionLeaveTimeout={200}
        >
        {this._getScreen()}
      </CSSTransitionGroup>
    )
  }
}
