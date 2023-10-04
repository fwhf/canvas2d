/*
  wanghuijie

  配置解读
  canvas 目标渲染dom
  dpr 画图清晰度 默认取值window.devicePixelRatio
  data 数据 详细格式见下

  lLM:lastLineMerge 尾行并入其他行 布尔值 默认false
  lLMMNC:lastLineMergeMaxNumCoefficient 尾行并入其他行允许的尾行最大个数系数 大于0的数字 默认值时max=行数*0.5;0~1时max=floor(行数*num);>=1时max=num

  autoDraw 是否自动绘制 布尔值 默认true
  style 图形style 详细格式见下 style优先级:数据style>图形style
  autoScale 自动缩放 布尔值 默认开启，图形整体中心居中绘制,若图形宽/高超出绘制区域时自动缩放
  lastLineJustify: start center end around between 尾行个体不满足时的布局方式
  graphInterval: 图集间距 数字 默认值：图形宽度

  data数据格式
  [{
    outsideValue: 'xxxxx', 图形外文案
    insideValue: 'x' 图形内文案
    style: {}
  }]
*/
import View from '../view'
import * as graphList from '../graphList.js'
import { dpr, echoWarn, getType, objectMerge, convertMorP, getTriangleEdgeX } from '../../util/helper.js'

const style = {
  graph: 'ArcGraph',
  graphStyle: {
    width: 50 * dpr,
    height: 50 * dpr,
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
      fontFamily: 'PingFang SC'
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
        textAlign: 'center',
        fontWight: 'normal',
        fontFamily: 'PingFang SC'
      }
    }
  },
  text: 'TextGraph',
  textStyle: {
    width: 70 * dpr,
    height: 20 * dpr,
    strokeWidth: 1 * dpr,
    strokeColor: '#333333',
    fillColor: '#ffffff',
    padding: 0,
    globalAlpha: 1,
    text: {
      globalAlpha: 1,
      lineHeight: 18 * dpr,
      fontSize: 14 * dpr,
      color: '#000000',
      textAlign: 'center',
      fontWight: 'normal',
      fontFamily: 'PingFang SC',
      wordWrap: false,
      ellipsis: true
    },
    hover: {
      show: false,
      strokeWidth: 1 * dpr,
      strokeColor: '#333333',
      fillColor: '#ffffff',
      globalAlpha: 1,
      text: {
        globalAlpha: 1,
        lineHeight: 18 * dpr,
        fontSize: 14 * dpr,
        color: '#000000',
        textAlign: 'center',
        fontWight: 'normal',
        fontFamily: 'PingFang SC'
      }
    },
    focus: {
      show: false
    }
  },
  margin: 12 * dpr
}

export default class TriangleDistribution extends View {
  constructor(opt) {
    super(opt)
    this.optData = getType(opt.data) === 'Array' ? opt.data : []

    this.lLM = getType(opt.lLM) === 'Boolean' ? opt.lLM : false
    this.lLMMNC = getType(opt.lLMMNC) === 'Number' ? opt.lLMMNC : 0.5

    this.autoDraw = getType(opt.autoDraw) === 'Boolean' ? opt.autoDraw : true
    this.style = objectMerge(style, opt.style)
    this.autoScale = getType(opt.autoScale) === 'Boolean' ? opt.autoScale : true
    this.lastLineJustify = getType(opt.lastLineJustify) === 'String' ? opt.lastLineJustify : 'between'
    this.graphInterval = getType(opt.graphInterval) === 'Number' ? opt.graphInterval : 0

    this.mousemoveNextCb = this.mousemoveCb
    this.mousemoveCb = this.hijackMousemoveCb

    this.init()
  }
  init() {
    super.init()
    if (!this.optData.length) {
      echoWarn('未传入数据或数据为空')
      return
    }

    this.oldHoverDataItem = null

    this.initData()
  }
  initData() {
    this.style.margin = convertMorP(this.style.margin)
    this.style.graph = graphList[this.style.graph]
    this.style.text = graphList[this.style.text]
    this.graphWidthMargin = this.style.graphStyle.width + this.style.margin[1] + this.style.margin[3]
    this.graphHeightMargin = this.style.graphStyle.height + this.style.margin[0] + this.style.margin[2]

    if (!this.graphInterval) {
      this.graphInterval = this.graphWidthMargin
    }

    this.formatData()

    if (this.autoScale) {
      let width = 0
      this.data.forEach(item => {
        const newWidth = (item[item.length - 1].length > item.length ? item[item.length - 1].length : item.length) * this.graphWidthMargin
        if (newWidth > width) {
          width = newWidth
        }
      })
      const height = this.data[0].length * this.graphHeightMargin
      const widthScale = (this.canvas.width / width).toFixed(2)
      const heightScale = (this.canvas.height / height).toFixed(2)
      if (widthScale < 1 && heightScale < 1) {
        this.scaleCIndex = widthScale < heightScale ? widthScale * 100 : heightScale * 100
      } else if (widthScale < 1) {
        this.scaleCIndex = widthScale * 100
      } else if (heightScale < 1) {
        this.scaleCIndex = heightScale * 100
      }
      this.scaleC = this.scaleCIndex / 100
    }

    this.setDataAttr()

    if (this.data.length > 1) {
      this.layout()
    }

    this.initGraph()

    if (this.autoDraw) {
      this.draw()
    }
    if (this.eventFlag) {
      super.addEvent()
    }
  }
  formatData() {
    this.data = []
    const lLMMN = []
    for (let i = 0; i < this.optData.length; i++) {
      if (!this.optData[i] || !this.optData[i].length) {
        this.optData.splice(i, 1)
        i--
        continue
      }
      let length = 1
      let spliceArr = []
      this.data[i] = []
      lLMMN[i] = 0
      while (length <= this.optData[i].length) {
        spliceArr = this.optData[i].splice(0, length)
        length++
        this.data[i].push(spliceArr)
      }

      if (this.lLM) {
        if (this.lLMMNC >= 1) {
          lLMMN[i] = this.lLMMNC
        } else {
          lLMMN[i] = this.data[i].length * this.lLMMNC
        }
      }

      if (this.lLM && this.optData[i].length && this.optData[i].length <= lLMMN[i]) {
        // 尾行并入其他行
        let incorporateLength = this.optData[i].length
        let layerInex = this.data[i].length
        while (incorporateLength > 0) {
          layerInex--
          spliceArr = this.optData[i].splice(0)
          this.data[i][layerInex].push(...spliceArr)
          incorporateLength--
          this.optData[i] = this.data[i][layerInex].splice(0, incorporateLength)
        }
      } else if (this.optData[i].length) {
        spliceArr = this.optData[i].splice(0)
        this.data[i].push(spliceArr)
      }
    }

    this.data.sort((a, b) => {
      return b.length - a.length
    })
  }
  setDataAttr() {
    this.data.forEach(item => {
      const dataLength = item.length
      let dataLastLength = item[dataLength - 1].length
      dataLastLength = dataLastLength > dataLength ? dataLastLength : dataLength
      const dataLastWidth = dataLastLength * this.graphWidthMargin
      const dataLastCenterXY = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2 + (dataLength / 2) * this.graphHeightMargin
      }
      let lineIndex = dataLength
      item.reverse()
      item.forEach(itemLine => {
        const dataCurWidth = dataLastWidth - (dataLength - lineIndex) * this.graphWidthMargin
        const startXY = {
          x: dataLastCenterXY.x - dataCurWidth / 2 + (this.style.graphStyle.width / 2 + this.style.margin[3]),
          y: dataLastCenterXY.y - (dataLength - lineIndex) * this.graphHeightMargin - (this.style.graphStyle.height / 2 + this.style.margin[2])
        }
        const gap = (dataCurWidth - itemLine.length * this.graphWidthMargin) / itemLine.length
        if (dataLength === lineIndex && itemLine.length < lineIndex) {
          let space = 0
          switch (this.lastLineJustify) {
            case 'start':
              itemLine.forEach((dataItem, dataIndex) => {
                const x = startXY.x + dataIndex * this.graphWidthMargin
                this.setDataItemAttr(dataItem, x, startXY.y)
              })
              break
            case 'center':
              space = (dataCurWidth - itemLine.length * this.graphWidthMargin) / 2
              itemLine.forEach((dataItem, dataIndex) => {
                const x = startXY.x + space + dataIndex * this.graphWidthMargin
                this.setDataItemAttr(dataItem, x, startXY.y)
              })
              break
            case 'end':
              space = dataCurWidth - itemLine.length * this.graphWidthMargin
              itemLine.forEach((dataItem, dataIndex) => {
                const x = startXY.x + space + dataIndex * this.graphWidthMargin
                this.setDataItemAttr(dataItem, x, startXY.y)
              })
              break
            case 'between':
              space = (dataCurWidth - itemLine.length * this.graphWidthMargin) / (itemLine.length - 1)
              itemLine.forEach((dataItem, dataIndex) => {
                const x = startXY.x + dataIndex * (this.graphWidthMargin + space)
                this.setDataItemAttr(dataItem, x, startXY.y)
              })
              break
            default:
              // 'around'
              space = (dataCurWidth - itemLine.length * this.graphWidthMargin) / (itemLine.length * 2)
              itemLine.forEach((dataItem, dataIndex) => {
                const x = startXY.x + dataIndex * (this.graphWidthMargin + space * 2) + space
                this.setDataItemAttr(dataItem, x, startXY.y)
              })
              break
          }
        } else {
          itemLine.forEach((dataItem, dataIndex) => {
            const x = startXY.x + dataIndex * (this.graphWidthMargin + gap) + 0.5 * gap
            this.setDataItemAttr(dataItem, x, startXY.y)
          })
        }
        lineIndex--
      })
      item.reverse()
    })
  }
  setDataItemAttr(dataItem, x, y) {
    dataItem.x = x
    dataItem.y = y
    dataItem.style = objectMerge(this.style, dataItem.style)
  }
  layout() {
    // 多三角形分散布局 中心点Y相等 先左后右 计算规则：计算两个三角形的交点
    for (let i = 1; i < this.data.length; i++) {
      let fromData = null
      let fromDataLineLength = 0
      let fromDataLastLineLength = 0
      let lastLintFirstItem = null
      let lastLintLastItem = null
      if (i <= 2) {
        fromData = this.data[0]
        fromDataLineLength = fromData.length
        fromDataLastLineLength = fromData[fromDataLineLength - 1].length
      } else {
        fromData = this.data[i - 2]
        fromDataLineLength = fromData.length
        fromDataLastLineLength = fromData[fromDataLineLength - 1].length
      }

      let translateX = 0
      if (fromDataLineLength === 1) {
        if (i % 2) {
          translateX = this.data[0][0][0].x - fromData[0][0].x + this.graphInterval
        } else {
          translateX = this.data[0][0][0].x - fromData[0][0].x - this.graphInterval
        }
      } else {
        if (fromDataLineLength > fromDataLastLineLength) {
          lastLintFirstItem = {
            x: fromData[0][0].x - (this.graphWidthMargin * fromDataLineLength) / 2 + fromData[0][0].style.margin[3] + fromData[0][0].style.graphStyle.width,
            y: fromData[fromDataLineLength - 1][0].y
          }
          lastLintLastItem = {
            x: fromData[0][0].x + (this.graphWidthMargin * fromDataLineLength) / 2 - fromData[0][0].style.margin[1] - fromData[0][0].style.graphStyle.width,
            y: fromData[fromDataLineLength - 1][0].y
          }
        } else {
          lastLintFirstItem = fromData[fromDataLineLength - 1][0]
          lastLintLastItem = fromData[fromDataLineLength - 1][fromDataLastLineLength - 1]
        }

        const toData = this.data[i]
        const toDataLineLength = toData.length
        const toDataLastLineLength = toData[toDataLineLength - 1].length
        const y = toData[toDataLineLength - 1][0].y
        const XArr = getTriangleEdgeX([fromData[0][0], lastLintLastItem, lastLintFirstItem], y)
        if (i % 2) {
          translateX =
            this.data[0][0][0].x -
            XArr[1] +
            ((toDataLineLength > toDataLastLineLength ? toDataLineLength : toDataLastLineLength) * this.graphWidthMargin) / 2 -
            toData[0][0].style.margin[1] -
            toData[0][0].style.graphStyle.width +
            this.graphInterval
        } else {
          translateX =
            this.data[0][0][0].x -
            XArr[0] -
            ((toDataLineLength > toDataLastLineLength ? toDataLineLength : toDataLastLineLength) * this.graphWidthMargin) / 2 +
            toData[0][0].style.margin[3] +
            toData[0][0].style.graphStyle.width -
            this.graphInterval
        }
      }

      this.data[i].forEach(itemLine => {
        itemLine.forEach(dataItem => {
          dataItem.x -= translateX
        })
      })
    }
  }
  initGraph() {
    this.graphId = 0
    this.graphList = []
    const GraphClass = this.style.graph
    const TextClass = this.style.text
    this.data.forEach(itemData => {
      itemData.forEach(itemLine => {
        itemLine.forEach(dataItem => {
          if (GraphClass) {
            dataItem.graphClass = new GraphClass({
              canvas: this.canvas,
              scaleC: this.scaleC,
              xy: {
                x: dataItem.x,
                y: dataItem.y
              },
              autoDraw: false,
              content: dataItem.insideValue,
              style: dataItem.style.graphStyle,
              id: ++this.graphId
            })
            this.graphList.push(dataItem.graphClass)
          }
          if (TextClass) {
            dataItem.textClass = new TextClass({
              canvas: this.canvas,
              scaleC: this.scaleC,
              xy: {
                x: dataItem.x,
                y: dataItem.y + dataItem.style.graphStyle.height / 2 + dataItem.style.textStyle.height / 2
              },
              autoDraw: false,
              content: dataItem.outsideValue,
              style: dataItem.style.textStyle,
              id: ++this.graphId
            })
            this.graphList.push(dataItem.textClass)
          }
        })
      })
    })
  }
  formatDataTranslate({ x, y }) {
    this.graphList.forEach(graph => {
      graph.formatDataTranslate({ x, y })
    })
  }
  formatDataScale() {
    this.graphList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
    })
  }
  draw() {
    this.data.forEach(itemData => {
      itemData.forEach(itemLine => {
        itemLine.forEach(dataItem => {
          dataItem.graphClass.draw()
          dataItem.textClass.draw()
        })
      })
    })
  }

  hijackMousemoveCb(item) {
    if (this.oldHoverDataItem) {
      if (item && (item.id === this.oldHoverDataItem.graphClass.id || item.id === this.oldHoverDataItem.textClass.id)) {
        return
      }
      this.oldHoverDataItem.graphClass.setHoverStatus(false)
      this.oldHoverDataItem.textClass.setHoverStatus(false)
      this.oldHoverDataItem = null
    }
    if (item) {
      this.data.forEach(itemData => {
        itemData.forEach(itemLine => {
          itemLine.forEach(dataItem => {
            if (dataItem.graphClass.id === item.id || dataItem.textClass.id === item.id) {
              this.oldHoverDataItem = dataItem
              dataItem.graphClass.setHoverStatus(true)
              dataItem.textClass.setHoverStatus(true)
              this.addTask()
            }
          })
        })
      })
    } else {
      this.addTask()
    }
    this.mousemoveNextCb && this.mousemoveNextCb(item)
  }
}
