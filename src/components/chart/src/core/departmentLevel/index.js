import View from '../view'
import * as graphList from '../graphList.js'
import * as lineList from '../lineList.js'
import { dpr, echoWarn, getType, echoError, objectMerge, convertMorP, getGraphWidthOrHeight } from '../../util/helper.js'

const style = {
  graph: 'RectangleGraph',
  graphStyle: {
    width: 50 * dpr,
    height: 80 * dpr,
    padding: 10 * dpr,
    strokeWidth: 0 * dpr,
    strokeColor: '#333333',
    fillColor: '#ffffff',
    globalAlpha: 1,
    focus: {
      show: false
    },
    text: {
      globalAlpha: 1,
      lineHeight: 18 * dpr,
      fontSize: 14 * dpr,
      color: '#000000',
      textAlign: 'center',
      fontWight: 'normal',
      fontFamily: 'PingFang SC',
      wordWrap: true
    },
    hover: {
      show: true,
      strokeWidth: 1 * dpr,
      strokeColor: '#333333',
      fillColor: '#ffffff',
      globalAlpha: 1,
      text: {
        globalAlpha: 1,
        lineHeight: 18 * dpr,
        fontSize: 14 * dpr,
        color: '#000000',
        textAlign: 'left',
        fontWight: 'normal',
        fontFamily: 'PingFang SC'
      }
    }
  },
  line: 'UndirectedLine',
  lineStyle: {
    strokeWidth: 1 * dpr,
    strokeColor: '#333333',
    globalAlpha: 1,
    hover: {
      globalAlpha: 1,
      show: false
    },
    focus: {
      show: false
    }
  },
  margin: 12 * dpr
}

export default class DepartmentCrossLevel extends View {
  constructor(opt) {
    super(opt)
    this.optData = getType(opt.data) === 'Array' ? opt.data : []

    this.autoDraw = getType(opt.autoDraw) === 'Boolean' ? opt.autoDraw : true
    this.style = objectMerge(style, opt.style)
    this.level = getType(opt.level) === 'Number' ? opt.level : 0
    this.collapsable = getType(opt.collapsable) === 'Boolean' ? opt.collapsable : true
    this.lineType = getType(opt.lineType) === 'Number' ? opt.lineType : 0 // 0：折线 1：直线

    this.mouseupBtn0NextCb = this.mouseupBtn0Cb
    this.mouseupBtn0Cb = this.hijackMouseupBtn0Cb
    this.mouseupBtn2NextCb = this.mouseupBtn2Cb
    this.mouseupBtn2Cb = this.hijackMouseupBtn2Cb

    this.autoInit = getType(opt.autoInit) === 'Boolean' ? opt.autoInit : true
    if (this.autoInit) {
      this.init()
    }
  }
  init() {
    super.init()
    if (!this.optData.length) {
      echoWarn('未传入数据或数据为空')
      return
    }

    this.initData()
  }
  initData() {
    this.style.graph = graphList[this.style.graph]
    this.style.line = lineList[this.style.line]

    if (!this.style.graph) {
      echoError('未知图类型')
      return
    }

    this.dataAttrShow(this.optData)
    if (!this.center) {
      this.center = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2
      }
    }
    this.layout()

    this.initGraphList()
    this.draw()
    if (this.eventFlag) {
      super.addEvent()
    }
  }
  dataAttrShow(data, level = 0) {
    data.forEach(item => {
      let curLevel = level
      if (item.crossLevel) {
        curLevel += item.crossLevel
      }
      if (this.level === 0 || curLevel < this.level) {
        item.show = true
      } else {
        item.show = false
      }
      if (item.children) {
        this.dataAttrShow(item.children, curLevel + 1)
      }
    })
  }
  layout() {
    this.calculationWidth(this.optData, 0)
    this.setDataXY(this.optData, this.canvas.width / 2, this.canvas.height / 2)
    this.centerMiddel()
  }
  calculationWidth(data, level) {
    let totalWidth = 0
    data.forEach(item => {
      if (item.show) {
        item.style = objectMerge(this.style, item.style)
        item.style.margin = convertMorP(item.style.margin)
        if (item.style.graphStyle.width === 'auto' || item.style.graphStyle.height === 'auto') {
          const widthHeight = getGraphWidthOrHeight(this.ctx, item.text, item.style.graphStyle.text, item.style.graphStyle.padding, item.style.graphStyle.width)
          if (item.style.graphStyle.width === 'auto') {
            item.style.graphStyle.width = widthHeight.width
          }
          if (item.style.graphStyle.height === 'auto') {
            item.style.graphStyle.height = widthHeight.height
          }
        }
        if (item.children) {
          item.width = this.calculationWidth(item.children, level + 1)
          if (!item.width || item.width < item.style.graphStyle.width + item.style.margin[1] + item.style.margin[3]) {
            item.width = item.style.graphStyle.width + item.style.margin[1] + item.style.margin[3]
          }
        } else {
          item.width = item.style.graphStyle.width + item.style.margin[1] + item.style.margin[3]
        }
        totalWidth += item.width
      }
    })
    return totalWidth
  }
  setDataXY(data, x, y, parentHeightMargin) {
    let totalWidth = 0
    data.forEach(item => {
      if (item.show) {
        totalWidth += item.width
      }
    })
    let startX = x - totalWidth / 2
    data.forEach(item => {
      if (item.show) {
        item.x = startX + item.width / 2
        startX += item.width

        const graphCenterHeightMarginTop = item.style.graphStyle.height / 2 + item.style.margin[0]
        const graphCenterHeightMarginBottom = item.style.graphStyle.height / 2 + item.style.margin[2]
        let crossLevelHeight = 0
        if (item.crossLevel) {
          crossLevelHeight += parentHeightMargin * item.crossLevel
        }
        item.y = y + crossLevelHeight + graphCenterHeightMarginTop

        if (item.show && item.children) {
          this.setDataXY(item.children, item.x, item.y + graphCenterHeightMarginBottom, graphCenterHeightMarginTop + graphCenterHeightMarginBottom)
        }
      }
    })
  }
  centerMiddel() {
    let left = this.optData[0].x
    let right = this.optData[0].x
    let top = this.optData[0].y
    let bottom = this.optData[0].y
    const position = this.getPosition(this.optData, left, right, top, bottom)
    left = position.left
    right = position.right
    top = position.top
    bottom = position.bottom
    const translate = {
      x: this.center.x - (left + right) / 2,
      y: this.center.y - (top + bottom) / 2
    }
    this.translateData(this.optData, translate)
  }
  getPosition(data, left, right, top, bottom) {
    data.forEach(item => {
      if (item.show) {
        if (item.x < left) {
          left = item.x
        } else if (item.x > right) {
          right = item.x
        }
        if (item.y < top) {
          top = item.y
        } else if (item.y > bottom) {
          bottom = item.y
        }
        if (item.children) {
          const position = this.getPosition(item.children, left, right, top, bottom)
          left = position.left
          right = position.right
          top = position.top
          bottom = position.bottom
        }
      }
    })
    return { left, right, top, bottom }
  }
  translateData(data, translate) {
    data.forEach(item => {
      if (item.show) {
        item.x += translate.x
        item.y += translate.y
        if (item.children) {
          this.translateData(item.children, translate)
        }
      }
    })
  }

  initGraphList() {
    this.graphId = 0
    this.graphList = []
    this.lineId = 0
    this.lineList = []
    this.deepAddGraphList(this.optData)
  }
  deepAddGraphList(data) {
    const Graph = this.style.graph
    const Line = this.style.line
    data.forEach(item => {
      if (item.show) {
        item.graphClass = new Graph({
          canvas: this.canvas,
          scaleC: this.scaleC,
          xy: {
            x: item.x,
            y: item.y
          },
          autoDraw: false,
          content: item.text,
          style: item.style.graphStyle,
          id: item.id || ++this.graphId
        })
        this.graphList.push(item.graphClass)
        if (item.children) {
          this.deepAddGraphList(item.children)
          item.lineClassArr = []
          item.children.forEach(lineItem => {
            if (lineItem.show) {
              let lineClass = null
              if (this.lineType === 0) {
                lineClass = new Line({
                  canvas: this.canvas,
                  scaleC: this.scaleC,
                  vertex: [
                    {
                      x: item.x,
                      y: item.y + item.style.graphStyle.height / 2
                    },
                    {
                      x: item.x,
                      y: item.y + item.style.graphStyle.height / 2 + item.style.margin[2]
                    },
                    {
                      x: lineItem.x,
                      y: item.y + item.style.graphStyle.height / 2 + item.style.margin[2]
                    },
                    {
                      x: lineItem.x,
                      y: lineItem.y - lineItem.style.graphStyle.height / 2
                    }
                  ],
                  autoDraw: false,
                  style: item.style.lineStyle,
                  id: ++this.lineId
                })
              } else if (this.lineType === 1) {
                lineClass = new Line({
                  canvas: this.canvas,
                  scaleC: this.scaleC,
                  vertex: [
                    {
                      x: item.x,
                      y: item.y + item.style.graphStyle.height / 2
                    },
                    {
                      x: lineItem.x,
                      y: lineItem.y - lineItem.style.graphStyle.height / 2
                    }
                  ],
                  autoDraw: false,
                  style: item.style.lineStyle,
                  id: ++this.lineId
                })
              }
              item.lineClassArr.push(lineClass)
              this.lineList.push(lineClass)
            }
          })
        }
      }
    })
  }

  formatDataTranslate({ x, y }) {
    this.center.x += x
    this.center.y += y
    this.graphList.forEach(graph => {
      graph.formatDataTranslate({ x, y })
    })
    this.lineList.forEach(graph => {
      graph.formatDataTranslate({ x, y })
    })
  }
  formatDataScale() {
    this.graphList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
    })
    this.lineList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
    })
  }

  draw() {
    this.lineList.forEach(graph => {
      graph.draw()
    })
    this.graphList.forEach(graph => {
      graph.draw()
    })
  }

  hijackMouseupBtn0Cb(xy, item) {
    if (item) {
      const data = this.getDataByClass(item, this.optData)
      if (this.collapsable && data.children) {
        let show = false
        data.children.forEach(childrenItem => {
          if (childrenItem.show) {
            show = true
          }
        })
        data.children.forEach(childrenItem => {
          childrenItem.show = !show
        })
        this.layout()

        this.initGraphList()
        this.addTask()
      }
      this.mouseupBtn0NextCb && this.mouseupBtn0NextCb(xy, data)
    } else {
      this.mouseupBtn0NextCb && this.mouseupBtn0NextCb(xy)
    }
  }
  hijackMouseupBtn2Cb(xy) {
    if (this.focusGraphOrLine) {
      const data = this.getDataByClass(this.focusGraphOrLine, this.optData)
      this.mouseupBtn2NextCb && this.mouseupBtn2NextCb(xy, data)
    } else {
      this.mouseupBtn2NextCb && this.mouseupBtn2NextCb(xy)
    }
  }
  getDataByClass(item, data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].show && data[i].graphClass && data[i].graphClass.id === item.id) {
        return data[i]
      }
      if (data[i].show && data[i].children) {
        const result = this.getDataByClass(item, data[i].children)
        if (result) {
          return result
        }
      }
    }
    return false
  }
}
