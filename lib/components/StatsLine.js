import React from 'react'
import PropTypes from 'prop-types'

import { Palette, defaultPalette } from '../propTypes/palette'

import Base from './Base'

export default class StatsLine extends Base {
  constructor (props) {
    super(props);
    [
      'renderStat'
    ].forEach((m) => { this[m] = this[m].bind(m) })
  }

  renderStat (stat, space, css, index) {
    if (stat && stat.value && stat.name) {
      const num = stat.value > 1000 ? Math.round(stat.value / 1000) + 'K' : stat.value
      return <span key={index} className={css(space)}><strong>{num}</strong> {stat.name}</span>
    }
  }

  template (css) {
    const { stats, muted, extraSpace, large } = this.props
    const space = extraSpace ? 'extraSpace' : 'space'
    const displayLarge = large ? '' : 'stats'
    const displayMuted = muted ? 'muted' : ''
    return (
      <div className={`${displayLarge} ${displayMuted ? css(displayMuted) : undefined}`}>{stats.map((stat, index) => this.renderStat(stat, space, css, index))}</div>
    )
  }

  styles (props) {
    const { palette } = props
    return {
      space: {
        marginRight: 15
      },
      extraSpace: {
        marginRight: 50
      },
      muted: {
        color: palette.muted
      }
    }
  }
}

StatsLine.propTypes = {
  palette: Palette,
  stats: PropTypes.arrayOf(PropTypes.object).isRequired,
  muted: PropTypes.bool,
  extraSpace: PropTypes.bool
}

StatsLine.defaultProps = {
  palette: defaultPalette,
  stats: [],
  muted: false,
  extraSpace: false,
  large: false
}