/* globals window */
import React, { PropTypes } from 'react'
// import bbox from '../propTypes/bbox';

function computeState (props = {}) {
  let left = 0
  let top = props.headerHeight
  let heights = props.data.map(this.rowHeight)
  let widths = props.data[0].map(this.initialColWidth)

  return ({
    scrollX: 0,
    scrollY: 0,
    headerLabels: props.data[0].map(this.colHeaderName),
    widths,
    heights,
    tops: heights.map((h) => { top += h; return top - h }),
    lefts: widths.map((w) => { left += w; return left - w }),
    docWidth: widths.reduce((acc, w) => { return acc + w }, 0),
    docHeight: heights.reduce((acc, h) => { return acc + h }, 0)
  })
}

// calculates the position & size of a scrollbar
function calcScrollBar (docSize, vpSize, scrollPos, minSbSize = 25, clampStart = 0, clampEnd = 0) {
  const usableVp = (vpSize - clampStart - clampEnd)
  const visiblePercent = usableVp / docSize
  const size = ((usableVp * visiblePercent) > minSbSize) ? (usableVp * visiblePercent) : minSbSize
  const progressPercent = scrollPos / docSize
  // const availPos = vpSize - size,
  const pos = clampStart + (vpSize * progressPercent)

  return [pos, size]
}

class GridView extends React.Component {
  constructor (props) {
    super(props)

    this.state = computeState(this.props);

    [
      'colHeaderName',
      'initialColWidth',
      'rowHeight',
      'onGlobalScroll',
      'matchHeaderHeight',
      'updateScrollbars'
    ].forEach((m) => { this[m] = this[m].bind(this) })
  }

  componentDidMount () {
    if (window.onwheel !== undefined) {
      window.addEventListener('wheel', this.onGlobalScroll)
    } else if (window.onmousewheel !== undefined) {
      window.addEventListener('mousewheel', this.onGlobalScroll)
    } else {
      // unsupported browser
    }

    if (this.props.data) {
      if (this.props.data.length) {
        this.updateScrollbars()
        this.matchHeaderHeight()
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState(computeState(nextProps))
  }

  componentDidUpdate () {
    if (this.props.data) {
      if (this.props.data.length) {
        this.updateScrollbars()
        this.matchHeaderHeight()
      }
    }
  }

  componentWillUnmount () {
    if (window.onwheel !== undefined) {
      window.removeEventListener('wheel', this.onGlobalScroll)
    } else if (window.onmousewheel !== undefined) {
      window.removeEventListener('mousewheel', this.onGlobalScroll)
    } else {
      // unsupported browser
    }
  }

  // all of these will be set with ref funcs:
  // container
  // vsb
  // hsb
  // header
  // table

  // event handlers
  onGlobalScroll (e) {
    // TODO - constrain to only events that occur over the viewport
    let vp = this.container

    if (!vp || !this.state) {
      return
    }

    let x = this.state.scrollX + e.deltaX
    let y = this.state.scrollY + e.deltaY
    let maxX = this.state.docWidth - vp.clientWidth
    let maxY = this.state.docHeight - vp.clientHeight

    if (x < 0 || vp.clientWidth > this.state.docWidth) {
      x = 0
    } else if (x > maxX) {
      x = maxX
    }
    if (y < 0 || vp.clientHeight > this.state.docHeight) {
      y = 0
    } else if (y > maxY) {
      y = maxY
    }

    this.setState({ scrollX: x, scrollY: y })
  }

  // methods
  colHeaderName (row, i) {
    return (this.props.colHeaderName) ? this.props.colHeaderName(i) : `col. ${(i + 1)}`
  }
  initialColWidth (col, i) {
    return (this.props.initialColWidth) ? this.props.initialColWidth(i) : 80
  }
  rowHeight (row, i) {
    return (this.props.rowHeight) ? this.props.rowHeight(i) : 30
  }

  // render
  matchHeaderHeight () {
    let vp = this.container
    let h = this.header

    if (h.clientWidth < vp.clientWidth) {
      h.style.width = `${vp.clientWidth}px`
    }
  }
  // return necessary math for scrollbars
  updateScrollbars () {
    let vp = this.container
    let vsb = this.vsb
    let hsb = this.hsb
    let vert = calcScrollBar(this.state.docHeight, vp.clientHeight, this.state.scrollY, 25, this.props.headerHeight, 0)
    let horiz = calcScrollBar(this.state.docWidth, vp.clientWidth, this.state.scrollX, 25, 0, 0)

    vsb.style.display = (vp.clientHeight < this.state.docHeight) ? 'block' : 'none'
    vsb.style.top = `${vert[0]}px`
    vsb.style.height = `${vert[1]}px`
    hsb.style.display = (vp.clientWidth < this.state.docWidth) ? 'block' : 'none'
    hsb.style.left = `${horiz[0]}px`
    hsb.style.width = `${horiz[1]}px`
  }

  render () {
    let headers = []
    let pinnedColumns = []
    let cells = []
    let scrollX = this.state.scrollX

    pinnedColumns = (this.props.pinnedColumns > 0) ? this.props.pinnedColumns - 1 : 0

    if (!this.props.data) {
      return (<div className='gridView'><p>{this.props.emptyText}</p></div>)
    } else if (!this.props.data.length) {
      return (<div className='gridView'><p>{this.props.emptyText}</p></div>)
    }

    // @todo - support index columning
    // if (this.props.showIndexColumn) { row.splice(0,0,i+1); }

    if (this.props.snapColumns) {
      for (let r = 0; r < this.state.lefts.length; r += 1) {
        let left = this.state.lefts[r]
        if (scrollX > left && scrollX < this.state.lefts[r + 1]) {
          // determine which column the scroll is currently closer to.
          scrollX = ((scrollX - left) < (this.state.lefts[r + 1] - scrollX)) ? left : this.state.lefts[r + 1]
        }
      }
    }

    this.state.headerLabels.forEach((label, i) => {
      headers.push(
        <div
          key={`header-${i}`}
          className={(i <= pinnedColumns) ? 'pinned colHeader' : 'colHeader'}
          style={{
            position: 'absolute',
            top: 0,
            width: this.state.widths[i],
            left: (i <= pinnedColumns) ? this.state.lefts[i] : this.state.lefts[i] - scrollX,
            height: this.props.headerHeight
          }}
        >{label}</div>)
    })

    this.props.data.forEach((row, i) => {
      let td = []
      let className = 'row'

      if (this.props.zebraClasses) {
        className = (i % 2 === 0) ? 'even row' : 'odd row'
      }

      row.forEach((col, j) => {
        td.push(
          <div
            key={`row-${i}-col-${j}`}
            className={(j <= pinnedColumns) ? 'pinned cell' : 'cell'}
            data-row={i}
            data-col={j}
            style={{
              position: 'absolute',
              top: 0,
              left: (j <= pinnedColumns) ? this.state.lefts[j] : this.state.lefts[j] - scrollX,
              width: this.state.widths[j],
              height: '100%'
            }}
          >{col}</div>)
      })

      cells.push(
        <div
          className={className}
          key={`row-${i}`}
          style={{
            position: 'absolute',
            top: this.state.tops[i] - this.state.scrollY,
            width: '100%',
            height: this.state.heights[i]
          }}
        >{td}</div>)
    })

    return (
      <div ref={(el) => { this.container = el }} className='gridView'>
        <header ref={(el) => { this.header = el }} className='header' style={{ position: 'absolute', width: this.state.docWidth, left: this.state.scrollLeft, height: this.props.headerHeight }}>
          {headers}
        </header>
        <section ref={(el) => { this.section = el }} className='table'>
          {cells}
        </section>
        <div ref={(el) => { this.vsb = el }} className='scrollBar vertical' style={{ right: 2, width: this.props.scrollBarWidth }} />
        <div ref={(el) => { this.hsb = el }} className='scrollBar horizontal' style={{ bottom: 2, height: this.props.scrollBarWidth }} />
      </div>
    )
  }
}

GridView.propTypes = {
  // data should be an array of arrays, but can be transformed with the
  // "map" prop-func
  data: PropTypes.arrayOf(propTypes.array).isRequired,
  // function to return the name of each column
  colHeaderName: PropTypes.func.isRequired,
  // predicate to return the initial width of a column.
  initialColWidth: PropTypes.func.isRequired,
  rowHeight: PropTypes.func.isRequired,

  // bbox,

  headerHeight: PropTypes.number,
  // add "odd" & "even" classes rows
  zebraClasses: PropTypes.bool,
  // show the row number
  showIndexColumn: PropTypes.bool,
  // text to display if no data is given
  emptyText: PropTypes.string,
  // should scrolling along the x axis snap to each column?
  snapColumns: PropTypes.bool,
  // width of scrollbars
  scrollBarWidth: PropTypes.number
  // number of columns to keep "pinned" to the left side
  pinnedColumns: PropTypes.number,
}

GridView.defaultProps = {
  headerHeight: 60,
  zebraClasses: true,
  showIndexColumn: true,
  emptyText: 'no data to display',
  snapColumns: true,
  scrollBarWidth: 10
  pinnedColumns: 0,
}

export default GridView