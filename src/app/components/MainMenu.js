import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import SettingIcon from '@material-ui/icons/Settings'
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder'

import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Grow from '@material-ui/core/Grow'

import Paper from '@material-ui/core/Paper'
import SearchIcon from '@material-ui/icons/Search'
import InputBase from '@material-ui/core/InputBase'
import API from '../../api/api.js'

const styles = theme => ({
  root: {
    backgroundColor: '#4285f4',
    width: '100%',
    margin: 0,
    minHeight: '108px'
  },
  form: {
    textAlign: 'left'
  },
  select: {
    color: 'rgba(255, 255, 255, 0.87)',
    fontSize: '16px',
    '&:hover::before': {
      color: 'white !important',
      borderBottomColor: 'rgba(255, 255, 255, 0.87) !important'
    },
    '&:before': {
      borderBottomColor: 'rgba(255, 255, 255, 0.42)'
    },
    '&:after': {
      borderBottomColor: 'white'
    }
  },
  selectNote: {
    fontSize: '14px'
  },
  triangle: {
    fill: 'white'
  },
  searchBox: {
    width: '100%',
    height: '44px',
    margin: '0 8px'
  },
  searchIcon: {
    fontSize: '24px',
    fill: 'rgba(0, 0, 0, 0.58)'
  }
})

class MainMenu extends React.PureComponent {
  // constructor
  constructor (props) {
    super(props)
    // state declaration
    this.state = {
      tabs: ['Recent', 'Personal', 'Directory'],
      keying: null
    }
    props.setTab(API.getData('last_tab'))
    this.changeShowDir = this.changeShowDir.bind(this)
    this.changeTab = this.changeTab.bind(this)
    this.changeSearch = this.changeSearch.bind(this)
  }

  changeTab (event) {
    this.props.setPrevTab(this.props.tab.current)
    this.props.setTab(event.target.value)
    this.props.setSearch('')
    this.props.searchNotes('')
    API.writeContent('last_tab', event.target.value)
  }

  changeShowDir () {
    if (Object.keys(this.props.list.selectedNotes).length > 0) {
      return
    }
    this.props.setNewDir(!this.props.newdir)
  }
  changeSearch (event) {
    const searchingText = event.target.value
    let keying = this.state.keying
    if (keying) {
      clearTimeout(keying)
    }
    keying = setTimeout(function () {
      if (this.props.tab.current !== 'Directory') {
        this.props.searchNotes(searchingText)
      } else {
        this.props.setSearch(searchingText)
      }
    }.bind(this), 250)
  }
  handleDisplay (event) {
    window.__HMDIR.display = false
  }

  // the render function
  render () {
    console.log('MainMenu render')
    return (
      <Grid
        item
        container
        direction='row'
        justify='flex-start'
        alignContent='flex-start'
        alignItems='flex-start'
        className={this.props.classes.root}
        spacing={8}>
        <Grid item container alignContent='center' alignItems='center'>
          <Grid item xs={2}>
            <IconButton
              color='inherit'
              size='small'
              aria-label='arrow-back'
              onClick={this.handleDisplay}>
              <ArrowBackIcon />
            </IconButton>
          </Grid>
          <Grid item xs={6}>
            <form className={this.props.classes.form}>
              <FormControl>
                <Select
                  value={this.props.tab.current}
                  onChange={this.changeTab}
                  inputProps={{
                    classes: {
                      icon: this.props.classes.triangle
                    }
                  }}
                  name='tab'
                  className={this.props.classes.select}>
                  {[0, 1, 2].map(index => (
                    <MenuItem
                      value={this.state.tabs[index]}
                      key={this.state.tabs[index]}
                      className={this.props.classes.selectNote}>
                      {this.state.tabs[index]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </form>
          </Grid>
          <Grid item xs={2}>
            <Grow
              in={this.props.tab.current === 'Directory'}
              timeout={200}>
              <IconButton
                color='inherit'
                size='small'
                aria-label='new-dir'
                onClick={this.changeShowDir}>
                <CreateNewFolderIcon />
              </IconButton>
            </Grow>
          </Grid>
          <Grid item xs={2}>
            <IconButton
              color='inherit'
              size='small'
              aria-label='setting'>
              <SettingIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Grid item container component={Paper} className={this.props.classes.searchBox}>
          <Grid item container spacing={16} justify='flex-start' alignContent='center' alignItems='center'>
            <Grid item xs={2}>
              <SearchIcon className={this.props.classes.searchIcon} />
            </Grid>
            <Grid item xs={9} container>
              <InputBase onChange={this.changeSearch} style={{ fontSize: '16px' }} fullWidth placeholder={this.props.tab.current === 'Directory' ? 'Search directories here ...' : 'Search notes here ...'} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

MainMenu.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(MainMenu)
