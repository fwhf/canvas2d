import DepartmentCrossLevel from './index'
import * as graphList from '../graphList.js'
import { objectMerge, convertMorP, dpr, getType, getGraphWidthOrHeight } from '../../util/helper.js'

const style = {
  graph: 'TextGraph',
  graphStyle: {
    padding: [0, 10 * dpr],
    tooltip: {
      globalAlpha: 1,
      strokeWidth: 1 * dpr,
      strokeColor: '#333333',
      fillColor: '#ffffff',
      padding: 10 * dpr,
      width: 140 * dpr,
      height: 'auto',
      borderRadius: 10 * dpr,
      position: {
        left: 10 * dpr,
        top: 10 * dpr
      },
      text: {
        globalAlpha: 1,
        lineHeight: 24 * dpr,
        fontSize: 14 * dpr,
        color: '#000000',
        textAlign: 'left',
        fontWight: 'normal',
        fontFamily: 'PingFang SC',
        wordWrap: true,
        ellipsis: false,
        ellipsisLine: 1
      }
    }
  },
  lineStyle: {
    strokeColor: '#999999'
  },
  labelGraph: 'RectangleGraph',
  labelStyle: {
    height: 60 * dpr,
    padding: 10 * dpr,
    strokeWidth: 1 * dpr,
    strokeColor: '#ffffff',
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
      show: false
    }
  }
}

export default class TextDepartmentCrossLevel extends DepartmentCrossLevel {
  constructor(opt) {
    opt.style = objectMerge(style, opt.style)
    opt.autoInit = false
    super(opt)

    this.xLabel = getType(opt.xLabel) === 'Array' ? opt.xLabel : []
    this.xLevel = getType(opt.xLevel) === 'Number' ? opt.xLevel : -1
    this.init()
  }
  initData() {
    this.style.labelGraph = graphList[this.style.labelGraph]
    this.center = {
      x: 0,
      y: 0
    }
    super.initData()
  }
  dataAttrShow(data, show = true) {
    data.forEach((item, index) => {
      item.show = show
      if (item.children) {
        this.dataAttrShow(item.children, this.xLevel === -1 ? true : this.xLevel === index)
      }
    })
  }
  layout() {
    this.levelWidth = []
    this.initXY = {
      x: 0,
      y: 0
    }
    this.initGraphWidth(this.optData, 0)
    this.formatLevelWidth()
    this.calculationHeight(this.optData, 0)
    this.setDataXY(this.optData, this.initXY.x, this.initXY.y, 0)
    this.initLabel()
    this.leftMiddel()
  }
  initGraphWidth(data, index, parentCross = 0) {
    data.forEach(item => {
      if (item.show) {
        item.style = objectMerge(this.style, item.style)
        item.style.margin = convertMorP(item.style.margin)
        item.style.graphStyle.width = getGraphWidthOrHeight(
          this.ctx,
          item.text,
          item.style.graphStyle.text,
          item.style.graphStyle.padding,
          item.style.graphStyle.width
        ).width
        item.crossLevel = item.crossLevel || 0
        item.level = item.crossLevel + parentCross
        if (
          (this.levelWidth[index + item.level] &&
            this.levelWidth[index + item.level] < item.style.graphStyle.width + item.style.margin[1] + item.style.margin[3]) ||
          !this.levelWidth[index + item.level]
        ) {
          this.levelWidth[index + item.level] = item.style.graphStyle.width + item.style.margin[1] + item.style.margin[3]
        }
        if (item.children) {
          this.initGraphWidth(item.children, index + 1, item.level)
        }
      }
    })
  }
  formatLevelWidth() {
    for (let i = 0; i < this.levelWidth.length; i++) {
      if (!this.levelWidth[i]) {
        this.levelWidth[i] = this.levelWidth[i - 1]
      }
    }
  }
  calculationHeight(data, level) {
    let totalHeight = 0
    data.forEach(item => {
      if (item.show) {
        if (item.children) {
          item.height = this.calculationHeight(item.children, level + 1)
          if (!item.height || item.height < item.style.graphStyle.height + item.style.margin[0] + item.style.margin[2]) {
            item.height = item.style.graphStyle.height + item.style.margin[0] + item.style.margin[2]
          }
        } else {
          item.height = item.style.graphStyle.height + item.style.margin[0] + item.style.margin[2]
        }
        totalHeight += item.height
      }
    })
    return totalHeight
  }
  setDataXY(data, x, y, index) {
    let totalHeight = 0
    data.forEach(item => {
      if (item.show) {
        totalHeight += item.height
      }
    })
    let startY = y - totalHeight / 2
    if (startY < this.initXY.y) {
      this.initXY.y = startY
    }
    data.forEach(item => {
      if (item.show) {
        item.y = startY + item.height / 2
        startY += item.height

        const graphCenterWidthMarginLeft = item.style.graphStyle.width / 2 + item.style.margin[3]
        let crossLevelWidth = 0
        if (item.level) {
          let i = 0
          while (item.crossLevel - i > 0) {
            crossLevelWidth += this.levelWidth[index + item.level - i - 1]
            i++
          }
        }
        item.x = x + crossLevelWidth + graphCenterWidthMarginLeft

        if (item.show && item.children) {
          this.setDataXY(item.children, x + crossLevelWidth + this.levelWidth[index + item.level], item.y, index + 1)
        }
      }
    })
  }
  initLabel() {
    let prevLevelWidth = 0
    let x = this.initXY.x
    const y = this.canvas.height / 2 - this.canvas.height / 2 / this.scaleC + this.style.labelStyle.height / 2
    this.levelWidth.forEach((item, index) => {
      this.xLabel[index].style = objectMerge(this.xLabel[index].style, this.style.labelStyle)
      if (item) {
        prevLevelWidth = item
      }
      this.xLabel[index].style.width = prevLevelWidth
      this.xLabel[index].x = x + prevLevelWidth / 2
      x += prevLevelWidth
      this.xLabel[index].y = y
    })
  }
  leftMiddel() {
    this.translateData(this.optData, {
      x: -this.initXY.x + this.center.x,
      y: -this.initXY.y + this.style.labelStyle.height + this.center.y
    })
    this.translateLabel({
      x: -this.initXY.x + this.center.x,
      y: 0
    })
  }
  translateLabel(translate) {
    this.xLabel.forEach(item => {
      if (item.x) {
        item.x += translate.x
        item.y += translate.y
      }
    })
  }

  initGraphList() {
    this.graphId = 0
    this.graphList = []
    this.deepAddGraphList(this.optData, 0)
    this.labelGraphId = 0
    this.labelList = []
    this.addLabelList()
  }
  deepAddGraphList(data, index) {
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
          tooltip: item.tooltip,
          style: item.style.graphStyle,
          id: item.id || ++this.graphId
        })
        this.graphList.push(item.graphClass)
        if (item.children) {
          this.deepAddGraphList(item.children, index + 1)
          item.lineClassArr = []
          item.children.forEach(lineItem => {
            if (lineItem.show) {
              const lineClass = new Line({
                canvas: this.canvas,
                scaleC: this.scaleC,
                vertex: [
                  {
                    x: item.x + item.style.graphStyle.width / 2,
                    y: item.y
                  },
                  {
                    x: item.x - item.style.graphStyle.width / 2 - item.style.margin[1] + this.levelWidth[index + item.crossLevel],
                    y: item.y
                  },
                  {
                    x: item.x - item.style.graphStyle.width / 2 - item.style.margin[1] + this.levelWidth[index + item.crossLevel],
                    y: lineItem.y
                  },
                  {
                    x: lineItem.x - lineItem.style.graphStyle.width / 2,
                    y: lineItem.y
                  }
                ],
                autoDraw: false,
                style: item.style.lineStyle,
                id: ++this.graphId
              })
              item.lineClassArr.push(lineClass)
              this.graphList.push(lineClass)
            }
          })
        }
      }
    })
  }
  addLabelList() {
    const LabelGraph = this.style.labelGraph
    this.levelWidth.forEach((item, index) => {
      this.labelList.push(
        new LabelGraph({
          canvas: this.canvas,
          scaleC: this.scaleC,
          xy: {
            x: this.xLabel[index].x,
            y: this.xLabel[index].y
          },
          autoDraw: false,
          content: this.xLabel[index].text,
          style: this.xLabel[index].style,
          id: ++this.labelGraphId
        })
      )
    })
  }

  formatDataTranslate({ x, y }) {
    this.center.x += x
    this.center.y += y
    this.graphList.forEach(graph => {
      graph.formatDataTranslate({ x, y })
    })
    this.labelList.forEach(graph => {
      graph.formatDataTranslate({ x, y: 0 })
    })
  }
  formatDataScale() {
    this.graphList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
    })
    this.labelList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
    })
    this.labelList.forEach(graph => {
      graph.formatDataTranslate({ x: 0, y: this.canvas.height / 2 - this.canvas.height / 2 / graph.scaleC - graph.xy.y + graph.style.height / 2 })
    })
  }
  draw() {
    this.graphList.forEach(graph => {
      graph.draw()
    })
    this.labelList.forEach(graph => {
      graph.draw()
    })
    this.graphList.forEach(graph => {
      if (graph.hover && !graph.focus && graph.tooltip && graph.tooltip.length) {
        graph.drawHoverTooltip()
      }
    })
  }
}
