/*
  wanghuijie

  配置解读
  canvas 目标渲染dom
  dpr 画图清晰度 默认取值window.devicePixelRatio

  xy 图形绘制中心点
  benchmarkType 基准图形 0:正方形 1:矩形
*/
import View from './view'

import {
  dpr,
  objectMerge,
  getGraphVertex,
  getRectangleVertex,
  getDiamondVertex,
  getParallelogramVertex,
  getFillVertex,
  htmlStr2textArr,
  getType,
  getStr,
  vertexInLines,
  deepClone,
  convertMorP,
  graphInCanvas,
  getGraphWidthOrHeight
} from '../util/helper.js'
// htmlStr2textArr('<div>222<div>222-1</div></div><div>333<div>333-1</div>333-2</div><div>333<div>333-1</div>333-2<div>333-3</div></div>111', {})

const style = {
  strokeWidth: 1 * dpr,
  strokeColor: '#333333',
  fillColor: '#ffffff',
  padding: 10 * dpr,
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
    ellipsis: false,
    ellipsisLine: 1
  },
  tooltip: {
    globalAlpha: 1,
    strokeWidth: 1 * dpr,
    strokeColor: '#333333',
    fillColor: '#ffffff',
    padding: 10 * dpr,
    width: 'auto',
    height: 'auto',
    position: {
      left: 10 * dpr,
      top: 10 * dpr
    },
    text: {
      globalAlpha: 1,
      lineHeight: 18 * dpr,
      fontSize: 14 * dpr,
      color: '#000000',
      textAlign: 'center',
      fontWight: 'normal',
      fontFamily: 'PingFang SC',
      wordWrap: false,
      ellipsis: false,
      ellipsisLine: 1
    }
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
    show: true,
    strokeWidth: 1 * dpr,
    strokeColor: '#29b6f2',
    lineDash: [5 * dpr, 5 * dpr],
    point: {
      fillColor: '#29b6f2',
      r: 6 * dpr,
      virtualR: 12 * dpr
    }
  }
}

class Graph extends View {
  constructor(opt) {
    super(opt)

    this.style = objectMerge(style, opt.style)
    this.xy = opt.xy
    this.benchmarkType = opt.benchmarkType
    this.asName = opt.asName
    this.graphType = 'graph'

    this.zIndex = getType(opt.zIndex) === 'Number' ? opt.zIndex : 1

    this.focus = false

    this.hover = false
    this.hoverE = null

    this.tooltip = getType(opt.tooltip) === 'String' ? opt.tooltip : ''
    this.drawTooltip = getType(opt.drawTooltip) === 'Object' ? opt.drawTooltip : null

    this.content = getType(opt.content) === 'String' ? opt.content : ''
    this.drawContent = getType(opt.drawContent) === 'Array' ? opt.drawContent : []

    this.autoDraw = getType(opt.autoDraw) === 'Boolean' ? opt.autoDraw : true

    this.allowTranslate = getType(opt.allowTranslate) === 'Boolean' ? opt.allowTranslate : true
    this.formatDataTranslateCb = getType(opt.formatDataTranslateCb) === 'Function' ? opt.formatDataTranslateCb : null

    this.id = opt.id || new Date().getTime()

    // 存放图形关联线条对象
    this.lineArr = opt.lineArr || []

    this.graphRange = {}
    // 图形是否在canvas内，如果不在则不绘制
    this.inCanvasShow = true

    this.opt = opt
  }
  init() {
    super.init()

    if (this.style.width === 'auto' || this.style.height === 'auto') {
      const widthHeight = getGraphWidthOrHeight(this.ctx, this.content, this.style.text, this.style.padding, this.style.width)
      if (this.style.width === 'auto') {
        this.style.width = widthHeight.width
      }
      if (this.style.height === 'auto') {
        this.style.height = widthHeight.height
      }
    }

    if (!this.style.width) {
      this.style.width = this.canvas.width - this.style.strokeWidth
    }
    if (!this.style.height) {
      this.style.height = (this.benchmarkType ? this.canvas.height / 2 : this.canvas.height) - this.style.strokeWidth
    }
    if (!this.xy) {
      this.xy = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2
      }
    }
    this.style.padding = convertMorP(this.style.padding)

    if (this.content && !this.drawContent.length) {
      this.formatText(this.content)
    }

    this.setGraphRange()
  }
  setGraphRange() {
    if (this.benchmarkType === 0) {
      this.graphRange = {
        left: this.xy.x - this.style.width / 2,
        right: this.xy.x + this.style.width / 2,
        top: this.xy.y - this.style.width / 2,
        bottom: this.xy.y + this.style.width / 2
      }
    } else {
      this.graphRange = {
        left: this.xy.x - this.style.width / 2,
        right: this.xy.x + this.style.width / 2,
        top: this.xy.y - this.style.height / 2,
        bottom: this.xy.y + this.style.height / 2
      }
    }
    this.drawContent &&
      this.drawContent.forEach(line => {
        let x = line.x
        line.children.forEach(item => {
          x += item.measureTextWidth
          if (this.graphRange.top > line.y - item.style.fontSize / 2) {
            this.graphRange.top = line.y - item.style.fontSize / 2
          }
          if (this.graphRange.bottom < line.y + item.style.fontSize / 2) {
            this.graphRange.bottom = line.y + item.style.fontSize / 2
          }
        })
        if (this.graphRange.left > line.x) {
          this.graphRange.left = line.x
        }
        if (this.graphRange.right < x) {
          this.graphRange.right = x
        }
      })
  }
  draw() {
    if (this.focus && this.style.focus.show) {
      this.drawFocus()
    }

    this.drawText()

    if (this.hover && !this.focus && this.tooltip.length) {
      if (!this.drawTooltip) {
        this.formatTooltip()
      }
    }
  }
  formatDataTranslate({ x, y }) {
    if (this.xy) {
      this.xy.x += x
      this.xy.y += y
    }
    if (this.vertex && this.vertex.length) {
      this.vertex.forEach(vertexItem => {
        vertexItem.x += x
        vertexItem.y += y
      })
    }
    if (this.drawContent && this.drawContent.length) {
      this.drawContent.forEach(line => {
        line.x += x
        line.y += y
      })
    }
    if (this.focus && this.lineArr && this.lineArr.length) {
      this.lineArr.forEach(item => {
        if (item.index) {
          item.line.graphZoom({ x, y }, item.line.vertex.length * 2 - 2)
        } else {
          item.line.graphZoom({ x, y }, 0)
        }
      })
    }
    if (this.drawTooltip) {
      this.drawTooltip.formatDataTranslate({ x, y })
    }
    if (this.setGraphRange) {
      this.graphRange.left += x
      this.graphRange.right += x
      this.graphRange.top += y
      this.graphRange.bottom += y
    }

    if (this.formatDataTranslateCb) {
      this.formatDataTranslateCb(this, { x, y })
    }
  }
  formatDataScale(scaleC) {
    this.scaleC = scaleC
    this.setCanvasRange()
    if (this.drawTooltip) {
      this.drawTooltip.formatDataScale(scaleC)
    }
  }
  graphZoom({ x, y }, { tx, ty }, vertexFocusSelectionIndex) {
    if ((x !== 0 || y !== 0) && this.lineArr && this.lineArr.length) {
      if (tx === 0) {
        tx = 1
      } else if (ty === 0) {
        ty = 1
      }
      this.lineArr.forEach(item => {
        if (item.index) {
          const lineTx =
            (1 - Math.abs(item.line.vertex[item.line.vertex.length - 1].x - this.vertexFocus[vertexFocusSelectionIndex].x) / (this.style.width - x)) *
            Math.abs(x) *
            (tx / Math.abs(tx))
          const lineTy =
            (1 - Math.abs(item.line.vertex[item.line.vertex.length - 1].y - this.vertexFocus[vertexFocusSelectionIndex].y) / (this.style.height - y)) *
            Math.abs(y) *
            (ty / Math.abs(ty))
          item.line.graphZoom({ x: lineTx, y: lineTy }, item.line.vertex.length * 2 - 2)
        } else {
          const lineTx =
            (1 - Math.abs(item.line.vertex[0].x - this.vertexFocus[vertexFocusSelectionIndex].x) / (this.style.width - x)) * Math.abs(x) * (tx / Math.abs(tx))
          const lineTy =
            (1 - Math.abs(item.line.vertex[0].y - this.vertexFocus[vertexFocusSelectionIndex].y) / (this.style.height - y)) * Math.abs(y) * (ty / Math.abs(ty))
          item.line.graphZoom({ x: lineTx, y: lineTy }, 0)
        }
      })
    }
    this.setGraphRange()
  }
  drawFocus() {
    if (this.benchmarkType) {
      this.vertexFocus = getRectangleVertex(this.style.width, this.style.height, this.xy)
    } else {
      this.vertexFocus = getGraphVertex(this.style.width, 4, this.xy)
    }

    this.ctx.save()
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.scale(this.scaleC, this.scaleC)
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)

    this.ctx.beginPath()
    this.ctx.lineWidth = this.style.focus.strokeWidth
    this.ctx.strokeStyle = this.style.focus.strokeColor
    this.ctx.setLineDash(this.style.focus.lineDash)
    this.vertexFocus.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.lineTo(this.vertexFocus[0].x, this.vertexFocus[0].y)
    this.ctx.stroke()
    this.ctx.closePath()

    this.vertexFocus.forEach(vertexItem => {
      this.ctx.beginPath()
      this.ctx.fillStyle = this.style.focus.point.fillColor
      this.ctx.arc(vertexItem.x, vertexItem.y, this.style.focus.point.r, 0, 2 * Math.PI)
      this.ctx.fill()
      this.ctx.closePath()
    })

    this.ctx.restore()
  }
  formatText(html) {
    this.content = html
    if (this.hover && this.style.hover.show) {
      this.drawContent = htmlStr2textArr(html, this.style.hover.text)
    } else {
      this.drawContent = htmlStr2textArr(html, this.style.text)
    }
    if (this.style.text.wordWrap) {
      this.formatDrawContent()
    } else if (this.style.text.ellipsis) {
      this.formatEllipsisDrawContent()
    }
    this.formatTextXY()
  }
  formatDrawContent() {
    const contentWidth = this.style.width - this.style.padding[1] - this.style.padding[3]
    for (let i = 0; i < this.drawContent.length; i++) {
      let surplusWidth = contentWidth
      const newTextArr = []
      let j = 0
      for (j = 0; j < this.drawContent[i].children.length; j++) {
        const item = this.drawContent[i].children[j]
        const curContentWidth = contentWidth < item.style.fontSize ? item.style.fontSize : contentWidth
        this.ctx.beginPath()
        this.ctx.font = item.style.fontSize + 'px' + ' ' + item.style.fontWight + ' ' + item.style.fontFamily
        if (surplusWidth < item.style.fontSize) {
          surplusWidth = curContentWidth
        }
        item.measureTextWidth = this.ctx.measureText(item.text).width
        if (item.measureTextWidth > surplusWidth) {
          while (item.text.length) {
            let obj = {}
            if (surplusWidth !== curContentWidth) {
              obj = {
                style: item.style,
                text: getStr(item.text, surplusWidth / item.style.fontSize)
              }
              newTextArr[newTextArr.length - 1].children.push(obj)
              item.text = item.text.substr(obj.text.length)
            } else {
              obj = {
                children: [
                  {
                    style: item.style,
                    text: getStr(item.text, surplusWidth / item.style.fontSize)
                  }
                ]
              }
              newTextArr.push(obj)
              item.text = item.text.substr(obj.children[obj.children.length - 1].text.length)
            }
            surplusWidth = curContentWidth
          }
          let lastLineTotalWidth = 0
          for (let k = 0; k < newTextArr[newTextArr.length - 1].children.length; k++) {
            const newTextArrLastChildItem = newTextArr[newTextArr.length - 1].children[k]
            lastLineTotalWidth += newTextArrLastChildItem.text.length * newTextArrLastChildItem.style.fontSize
          }
          surplusWidth -= lastLineTotalWidth
        } else {
          if (newTextArr.length) {
            newTextArr[newTextArr.length - 1].children.push({
              style: item.style,
              text: item.text
            })
          } else {
            newTextArr.push({
              children: [
                {
                  style: item.style,
                  text: item.text
                }
              ]
            })
          }
          surplusWidth -= item.measureTextWidth
        }
        this.ctx.closePath()
      }
      this.drawContent.splice(i, 1, ...newTextArr)
      i += newTextArr.length - 1
    }
  }
  formatEllipsisDrawContent() {
    const contentWidth = this.style.width - this.style.padding[1] - this.style.padding[3]
    const concatStr = '...'
    for (let i = 0; i < this.drawContent.length; i++) {
      let surplusWidth = contentWidth
      const newTextArr = []
      let j = 0
      for (j = 0; j < this.drawContent[i].children.length; j++) {
        const item = this.drawContent[i].children[j]
        const curContentWidth = contentWidth < item.style.fontSize ? item.style.fontSize : contentWidth
        this.ctx.beginPath()
        this.ctx.font = item.style.fontSize + 'px' + ' ' + item.style.fontWight + ' ' + item.style.fontFamily
        if (surplusWidth < item.style.fontSize) {
          if (newTextArr.length === this.style.text.ellipsisLine) {
            newTextArr[newTextArr.length - 1].children[newTextArr[newTextArr.length - 1].children.length - 1].text =
              newTextArr[newTextArr.length - 1].children[newTextArr[newTextArr.length - 1].children.length - 1].text.substr(
                0,
                newTextArr[newTextArr.length - 1].children[newTextArr[newTextArr.length - 1].children.length - 1].text.length - 1
              ) + concatStr
            break
          }
          surplusWidth = curContentWidth
        }
        item.measureTextWidth = this.ctx.measureText(item.text).width
        if (item.measureTextWidth > surplusWidth) {
          let breakWhile = false
          while (item.text.length) {
            let obj = {}
            let text = ''
            if (surplusWidth !== curContentWidth) {
              if (newTextArr.length === this.style.text.ellipsisLine && this.ctx.measureText(item.text).width >= surplusWidth) {
                // 当前行，且属于最后一行，且剩余字符大于当前宽度，证明属于尾行，需要break
                breakWhile = true
                text = getStr(item.text, (surplusWidth - item.style.fontSize) / item.style.fontSize) + concatStr
              } else {
                // 当前行，无论下面那种情况，都无需特殊处理
                // 1: 最后一行，剩余字符小于当前宽度，while会自动终止
                // 2: 非最后一行，剩余字符大于当前宽度，自动排列
                // 2: 最后一行，剩余字符小于当前宽度，自动排列
                text = getStr(item.text, surplusWidth / item.style.fontSize)
              }
              obj = {
                style: item.style,
                text
              }
              newTextArr[newTextArr.length - 1].children.push(obj)
              item.text = item.text.substr(obj.text.length)
            } else {
              if (newTextArr.length === this.style.text.ellipsisLine - 1 && this.ctx.measureText(item.text).width >= surplusWidth) {
                // 即将开辟新的一行，且属于最后一行，且剩余字符大于当前宽度，证明属于尾行，需要break
                breakWhile = true
                text = getStr(item.text, (surplusWidth - item.style.fontSize) / item.style.fontSize) + concatStr
              } else {
                // 即将开辟新的一行，无论下面那种情况，都无需特殊处理
                // 1: 最后一行，剩余字符小于当前宽度，while会自动终止
                // 2: 非最后一行，剩余字符大于当前宽度，自动开辟新行
                // 2: 最后一行，剩余字符小于当前宽度，自动开辟新行
                text = getStr(item.text, surplusWidth / item.style.fontSize)
              }
              obj = {
                children: [
                  {
                    style: item.style,
                    text
                  }
                ]
              }
              newTextArr.push(obj)
              item.text = item.text.substr(obj.children[obj.children.length - 1].text.length)
            }
            surplusWidth = curContentWidth
            if (breakWhile) {
              break
            }
          }
          let lastLineTotalWidth = 0
          for (let k = 0; k < newTextArr[newTextArr.length - 1].children.length; k++) {
            const newTextArrLastChildItem = newTextArr[newTextArr.length - 1].children[k]
            lastLineTotalWidth += newTextArrLastChildItem.text.length * newTextArrLastChildItem.style.fontSize
          }
          surplusWidth -= lastLineTotalWidth
          if (breakWhile) {
            break
          }
        } else {
          if (newTextArr.length) {
            newTextArr[newTextArr.length - 1].children.push({
              style: item.style,
              text: item.text
            })
          } else {
            newTextArr.push({
              children: [
                {
                  style: item.style,
                  text: item.text
                }
              ]
            })
          }
          surplusWidth -= item.measureTextWidth
        }
        this.ctx.closePath()
      }
      this.drawContent.splice(i, 1, ...newTextArr)
      i += newTextArr.length - 1
    }
  }
  formatTextXY() {
    const drawContentLength = this.drawContent.length - 1
    const yHeightIndex = drawContentLength ? (drawContentLength / 2) * -1 : 0
    this.drawContent.forEach((line, index) => {
      line.y = (yHeightIndex + index) * this.style.text.lineHeight + this.xy.y
      line.measureTextWidthTotal = 0
      line.children.forEach(item => {
        this.ctx.beginPath()
        this.ctx.font = item.style.fontSize + 'px' + ' ' + item.style.fontWight + ' ' + item.style.fontFamily
        item.measureTextWidth = this.ctx.measureText(item.text).width
        line.measureTextWidthTotal += item.measureTextWidth
        this.ctx.closePath()
      })
      switch (this.style.text.textAlign) {
        case 'left':
          line.x = this.xy.x - this.style.width / 2 + this.style.padding[3]
          break
        case 'right':
          line.x = this.xy.x + this.style.width / 2 - this.style.padding[1] - line.measureTextWidthTotal
          break
        default:
          line.x = this.xy.x + this.style.padding[3] / 2 - this.style.padding[1] / 2 - line.measureTextWidthTotal / 2
          break
      }
    })
  }
  drawText() {
    if (this.drawContent && this.drawContent.length) {
      this.ctx.save()
      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
      this.ctx.scale(this.scaleC, this.scaleC)
      this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)
      this.drawContent.forEach(line => {
        let x = line.x
        line.children.forEach(item => {
          this.ctx.beginPath()
          this.ctx.globalAlpha = item.style.globalAlpha
          this.ctx.textAlign = 'left'
          this.ctx.textBaseline = 'middle'
          this.ctx.fillStyle = item.style.color
          this.ctx.font = item.style.fontWight + ' ' + item.style.fontSize + 'px' + ' ' + item.style.fontFamily
          this.ctx.fillText(item.text, x, line.y)
          this.ctx.closePath()
          x += item.measureTextWidth
        })
      })

      this.ctx.restore()
    }
  }
  formatTooltip() {
    this.drawTooltip = new RectangleArcGraph({
      canvas: this.canvas,
      scaleC: this.scaleC,
      autoDraw: false,
      xy: {
        x: 0,
        y: 0
      },
      content: this.tooltip,
      style: this.style.tooltip
    })
  }
  drawHoverTooltip() {
    const translate = {}
    if (this.hoverE.x + this.drawTooltip.style.width + this.drawTooltip.style.position.left > this.canvas.width) {
      translate.x = this.hoverE.x - this.drawTooltip.style.width / 2 - this.drawTooltip.style.position.left - this.drawTooltip.xy.x
    } else {
      translate.x = this.hoverE.x + this.drawTooltip.style.width / 2 + this.drawTooltip.style.position.left - this.drawTooltip.xy.x
    }
    if (this.hoverE.y + this.drawTooltip.style.height + this.drawTooltip.style.position.top > this.canvas.height) {
      translate.y = this.hoverE.y - this.drawTooltip.style.height / 2 - this.drawTooltip.style.position.top - this.drawTooltip.xy.y
    } else {
      translate.y = this.hoverE.y + this.drawTooltip.style.height / 2 + this.drawTooltip.style.position.top - this.drawTooltip.xy.y
    }
    this.drawTooltip.formatDataTranslate(translate)
    this.drawTooltip.draw()
  }
  setHoverStatus(hover, hoverE) {
    if (this.hover !== hover) {
      this.hover = hover
      this.hoverE = hoverE
      this.formatText(this.content)
    } else {
      this.hover = hover
      this.hoverE = hoverE
    }
  }
}

// 圆
class ArcGraph extends Graph {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: ArcGraph.benchmarkType, asName: ArcGraph.asName }))

    this.init()
  }
  init() {
    super.init()

    this.r = this.style.width / 2

    if (this.autoDraw) {
      this.draw()
    }
  }
  draw() {
    if (graphInCanvas(this.graphRange, this.canvasRange)) {
      this.inCanvasShow = true
    } else {
      this.inCanvasShow = false
      return
    }
    this.ctx.save()
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.scale(this.scaleC, this.scaleC)
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)

    this.ctx.beginPath()
    let strokeWidth = 0
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      strokeWidth = this.style.hover.strokeWidth
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
      this.ctx.fillStyle = this.style.hover.fillColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      strokeWidth = this.style.strokeWidth
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
      this.ctx.fillStyle = this.style.fillColor
    }
    this.ctx.arc(this.xy.x, this.xy.y, this.r, 0, 2 * Math.PI)
    this.ctx.fill()
    if (strokeWidth) {
      this.ctx.stroke()
    }
    this.ctx.closePath()
    this.ctx.restore()
    super.draw()
  }
  graphZoom({ x }, vertexFocusSelectionIndex) {
    if (this.style.width + x > this.style.focus.point.r * 2) {
      this.style.width += x
      this.style.height += x
      this.r = this.style.width / 2

      let tx = (x / 2) * -1
      let ty = (x / 2) * -1
      switch (vertexFocusSelectionIndex) {
        case 0:
          tx = (x / 2) * -1
          ty = (x / 2) * -1
          break
        case 1:
          tx = x / 2
          ty = (x / 2) * -1
          break
        case 2:
          tx = x / 2
          ty = x / 2
          break
        case 3:
          tx = (x / 2) * -1
          ty = x / 2
          break
      }
      this.xy.x += tx
      this.xy.y += ty
      if (this.drawContent && this.drawContent.length) {
        this.drawContent.forEach(line => {
          line.x += tx
          line.y += ty
        })
      }
      super.graphZoom({ x, y: x }, { tx, ty }, vertexFocusSelectionIndex)
    }
  }
}
ArcGraph.benchmarkType = 0
ArcGraph.asName = 'ArcGraph'

// 椭圆
class EllipseGraph extends Graph {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: EllipseGraph.benchmarkType, asName: EllipseGraph.asName }))

    this.init(opt)
  }
  init() {
    super.init()

    this.r = this.style.width / 2
    this.hr = this.style.height / 2

    if (this.autoDraw) {
      this.draw()
    }
  }
  draw() {
    if (graphInCanvas(this.graphRange, this.canvasRange)) {
      this.inCanvasShow = true
    } else {
      this.inCanvasShow = false
      return
    }

    this.ctx.save()
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.scale(this.scaleC, this.scaleC)
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)

    this.ctx.beginPath()
    let strokeWidth = 0
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      strokeWidth = this.style.hover.strokeWidth
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
      this.ctx.fillStyle = this.style.hover.fillColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      strokeWidth = this.style.strokeWidth
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
      this.ctx.fillStyle = this.style.fillColor
    }
    this.ctx.ellipse(this.xy.x, this.xy.y, this.r, this.style.width / 2, this.style.height / 2, 0, 2 * Math.PI)
    this.ctx.fill()
    if (strokeWidth) {
      this.ctx.stroke()
    }
    this.ctx.closePath()
    this.ctx.restore()

    super.draw()
  }
  graphZoom({ x, y }, vertexFocusSelectionIndex) {
    if (this.style.width + x > this.style.focus.point.r * 2 && this.style.height + y > this.style.focus.point.r * 2) {
      this.style.width += x
      this.style.height += y
      this.r = this.style.width / 2
      this.hr = (this.r * this.style.height) / this.style.width

      let tx = (x / 2) * -1
      let ty = (y / 2) * -1
      switch (vertexFocusSelectionIndex) {
        case 0:
          tx = (x / 2) * -1
          ty = (y / 2) * -1
          break
        case 1:
          tx = x / 2
          ty = (y / 2) * -1
          break
        case 2:
          tx = x / 2
          ty = y / 2
          break
        case 3:
          tx = (x / 2) * -1
          ty = y / 2
          break
      }
      this.xy.x += tx
      this.xy.y += ty
      if (this.drawContent && this.drawContent.length) {
        this.drawContent.forEach(line => {
          line.x += tx
          line.y += ty
        })
      }
      super.graphZoom({ x, y }, { tx, ty }, vertexFocusSelectionIndex)
    }
  }
}
EllipseGraph.benchmarkType = 1
EllipseGraph.asName = 'EllipseGraph'

// 正多边形
class regularGraph extends Graph {
  constructor(opt) {
    super(opt)

    this.init()
  }
  init() {
    super.init()

    this.vertex = getGraphVertex(this.style.width, this.style.edgeNum, this.xy)

    if (this.autoDraw) {
      this.draw()
    }
  }
  draw() {
    if (graphInCanvas(this.graphRange, this.canvasRange)) {
      this.inCanvasShow = true
    } else {
      this.inCanvasShow = false
      return
    }

    this.ctx.save()
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.scale(this.scaleC, this.scaleC)
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)

    this.ctx.beginPath()
    let strokeWidth = 0
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      strokeWidth = this.style.hover.strokeWidth
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
      this.ctx.fillStyle = this.style.hover.fillColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      strokeWidth = this.style.strokeWidth
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
      this.ctx.fillStyle = this.style.fillColor
    }
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.vertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.lineTo(this.vertex[0].x, this.vertex[0].y)
    this.ctx.fill()
    if (strokeWidth) {
      this.ctx.stroke()
    }
    this.ctx.closePath()
    this.ctx.restore()

    super.draw()
  }
  graphZoom({ x }, vertexFocusSelectionIndex) {
    if (this.style.width + x > this.style.focus.point.r * 2) {
      this.style.width += x
      this.style.height += x

      let tx = (x / 2) * -1
      let ty = (x / 2) * -1
      switch (vertexFocusSelectionIndex) {
        case 0:
          tx = (x / 2) * -1
          ty = (x / 2) * -1
          break
        case 1:
          tx = x / 2
          ty = (x / 2) * -1
          break
        case 2:
          tx = x / 2
          ty = x / 2
          break
        case 3:
          tx = (x / 2) * -1
          ty = x / 2
          break
      }
      this.xy.x += tx
      this.xy.y += ty
      if (this.drawContent && this.drawContent.length) {
        this.drawContent.forEach(line => {
          line.x += tx
          line.y += ty
        })
      }

      this.vertex = getGraphVertex(this.style.width, this.style.edgeNum, this.xy)
      super.graphZoom({ x, y: x }, { tx, ty }, vertexFocusSelectionIndex)
    }
  }
}

class ThreeGraph extends regularGraph {
  constructor(opt) {
    opt.style = objectMerge(opt.style, { edgeNum: 3 })
    super(objectMerge(opt, { benchmarkType: ThreeGraph.benchmarkType, asName: ThreeGraph.asName }))
  }
}
ThreeGraph.benchmarkType = 0
ThreeGraph.asName = 'ThreeGraph'

class FourGraph extends regularGraph {
  constructor(opt) {
    opt.style = objectMerge(opt.style, { edgeNum: 4 })
    super(objectMerge(opt, { benchmarkType: FourGraph.benchmarkType, asName: FourGraph.asName }))
  }
}
FourGraph.benchmarkType = 0
FourGraph.asName = 'FourGraph'

// 矩形
class RectangleGraph extends Graph {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: RectangleGraph.benchmarkType, asName: RectangleGraph.asName }))

    this.init(opt)
  }
  init() {
    super.init()

    this.vertex = getRectangleVertex(this.style.width, this.style.height, this.xy, 0)

    if (this.autoDraw) {
      this.draw()
    }
  }
  draw() {
    if (graphInCanvas(this.graphRange, this.canvasRange)) {
      this.inCanvasShow = true
    } else {
      this.inCanvasShow = false
      return
    }

    this.ctx.save()
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.scale(this.scaleC, this.scaleC)
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)

    this.ctx.beginPath()
    let strokeWidth = 0
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      strokeWidth = this.style.hover.strokeWidth
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
      this.ctx.fillStyle = this.style.hover.fillColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      strokeWidth = this.style.strokeWidth
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
      this.ctx.fillStyle = this.style.fillColor
    }
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    let rIndex = 0
    this.vertex.forEach(vertexItem => {
      if (vertexItem.r) {
        this.ctx.arc(vertexItem.x, vertexItem.y, vertexItem.r, -Math.PI / 2 + (Math.PI / 2) * rIndex, -Math.PI / 2 + (Math.PI / 2) * (rIndex + 1))
        rIndex++
      } else {
        this.ctx.lineTo(vertexItem.x, vertexItem.y)
      }
    })
    this.ctx.lineTo(this.vertex[0].x, this.vertex[0].y)
    this.ctx.fill()
    if (strokeWidth) {
      this.ctx.stroke()
    }
    this.ctx.closePath()
    this.ctx.restore()

    super.draw()
  }
  graphZoom({ x, y }, vertexFocusSelectionIndex) {
    if (this.style.width + x > this.style.focus.point.r * 2 && this.style.height + y > this.style.focus.point.r * 2) {
      this.style.width += x
      this.style.height += y

      let tx = (x / 2) * -1
      let ty = (y / 2) * -1
      switch (vertexFocusSelectionIndex) {
        case 0:
          tx = (x / 2) * -1
          ty = (y / 2) * -1
          break
        case 1:
          tx = x / 2
          ty = (y / 2) * -1
          break
        case 2:
          tx = x / 2
          ty = y / 2
          break
        case 3:
          tx = (x / 2) * -1
          ty = y / 2
          break
      }
      this.xy.x += tx
      this.xy.y += ty
      if (this.drawContent && this.drawContent.length) {
        this.drawContent.forEach(line => {
          line.x += tx
          line.y += ty
        })
      }

      this.vertex = getRectangleVertex(this.style.width, this.style.height, this.xy, 0)
      super.graphZoom({ x, y }, { tx, ty }, vertexFocusSelectionIndex)
    }
  }
}
RectangleGraph.benchmarkType = 1
RectangleGraph.asName = 'RectangleGraph'

// 圆角矩形
class RectangleArcGraph extends Graph {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: RectangleArcGraph.benchmarkType, asName: RectangleArcGraph.asName }))

    this.init(opt)
  }
  init() {
    super.init()

    this.style.borderRadius = this.style.borderRadius || (this.style.height > this.style.width ? this.style.width : this.style.height) / 4

    this.vertex = getRectangleVertex(this.style.width, this.style.height, this.xy, this.style.borderRadius)

    if (this.autoDraw) {
      this.draw()
    }
  }
  draw() {
    if (graphInCanvas(this.graphRange, this.canvasRange)) {
      this.inCanvasShow = true
    } else {
      this.inCanvasShow = false
      return
    }

    this.ctx.save()
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.scale(this.scaleC, this.scaleC)
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)

    this.ctx.beginPath()
    let strokeWidth = 0
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      strokeWidth = this.style.hover.strokeWidth
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
      this.ctx.fillStyle = this.style.hover.fillColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      strokeWidth = this.style.strokeWidth
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
      this.ctx.fillStyle = this.style.fillColor
    }
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    let rIndex = 0
    this.vertex.forEach(vertexItem => {
      if (vertexItem.r) {
        this.ctx.arc(vertexItem.x, vertexItem.y, vertexItem.r, -Math.PI / 2 + (Math.PI / 2) * rIndex, -Math.PI / 2 + (Math.PI / 2) * (rIndex + 1))
        rIndex++
      } else {
        this.ctx.lineTo(vertexItem.x, vertexItem.y)
      }
    })
    this.ctx.lineTo(this.vertex[0].x, this.vertex[0].y)
    this.ctx.fill()
    if (strokeWidth) {
      this.ctx.stroke()
    }
    this.ctx.closePath()
    this.ctx.restore()

    super.draw()
  }
  graphZoom({ x, y }, vertexFocusSelectionIndex) {
    if (this.style.width + x > this.style.focus.point.r * 2 && this.style.height + y > this.style.focus.point.r * 2) {
      this.style.width += x
      this.style.height += y

      let tx = (x / 2) * -1
      let ty = (y / 2) * -1
      switch (vertexFocusSelectionIndex) {
        case 0:
          tx = (x / 2) * -1
          ty = (y / 2) * -1
          break
        case 1:
          tx = x / 2
          ty = (y / 2) * -1
          break
        case 2:
          tx = x / 2
          ty = y / 2
          break
        case 3:
          tx = (x / 2) * -1
          ty = y / 2
          break
      }
      this.xy.x += tx
      this.xy.y += ty
      if (this.drawContent && this.drawContent.length) {
        this.drawContent.forEach(line => {
          line.x += tx
          line.y += ty
        })
      }

      this.style.borderRadius = (this.style.height > this.style.width ? this.style.width : this.style.height) / 4
      this.vertex = getRectangleVertex(this.style.width, this.style.height, this.xy, this.style.borderRadius)
      super.graphZoom({ x, y }, { tx, ty }, vertexFocusSelectionIndex)
    }
  }
}
RectangleArcGraph.benchmarkType = 1
RectangleArcGraph.asName = 'RectangleArcGraph'

// 菱形
class DiamondGraph extends Graph {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: DiamondGraph.benchmarkType, asName: DiamondGraph.asName }))

    this.init()
  }
  init() {
    super.init()

    this.vertex = getDiamondVertex(this.style.width, this.style.height, this.xy)

    if (this.autoDraw) {
      this.draw()
    }
  }
  draw() {
    if (graphInCanvas(this.graphRange, this.canvasRange)) {
      this.inCanvasShow = true
    } else {
      this.inCanvasShow = false
      return
    }

    this.ctx.save()
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.scale(this.scaleC, this.scaleC)
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)

    this.ctx.beginPath()
    let strokeWidth = 0
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      strokeWidth = this.style.hover.strokeWidth
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
      this.ctx.fillStyle = this.style.hover.fillColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      strokeWidth = this.style.strokeWidth
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
      this.ctx.fillStyle = this.style.fillColor
    }
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.vertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.lineTo(this.vertex[0].x, this.vertex[0].y)
    this.ctx.fill()
    if (strokeWidth) {
      this.ctx.stroke()
    }
    this.ctx.closePath()
    this.ctx.restore()

    super.draw()
  }
  graphZoom({ x, y }, vertexFocusSelectionIndex) {
    if (this.style.width + x > this.style.focus.point.r * 2 && this.style.height + y > this.style.focus.point.r * 2) {
      this.style.width += x
      this.style.height += y

      let tx = (x / 2) * -1
      let ty = (y / 2) * -1
      switch (vertexFocusSelectionIndex) {
        case 0:
          tx = (x / 2) * -1
          ty = (y / 2) * -1
          break
        case 1:
          tx = x / 2
          ty = (y / 2) * -1
          break
        case 2:
          tx = x / 2
          ty = y / 2
          break
        case 3:
          tx = (x / 2) * -1
          ty = y / 2
          break
      }
      this.xy.x += tx
      this.xy.y += ty
      if (this.drawContent && this.drawContent.length) {
        this.drawContent.forEach(line => {
          line.x += tx
          line.y += ty
        })
      }

      this.vertex = getDiamondVertex(this.style.width, this.style.height, this.xy)
      super.graphZoom({ x, y }, { tx, ty }, vertexFocusSelectionIndex)
    }
  }
}
DiamondGraph.benchmarkType = 1
DiamondGraph.asName = 'DiamondGraph'

// 平行四边形
class ParallelogramGraph extends Graph {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: ParallelogramGraph.benchmarkType, asName: ParallelogramGraph.asName }))

    this.init(opt)
  }
  init() {
    super.init()

    this.vertex = getParallelogramVertex(this.style.width, this.style.height, this.xy)

    if (this.autoDraw) {
      this.draw()
    }
  }
  draw() {
    if (graphInCanvas(this.graphRange, this.canvasRange)) {
      this.inCanvasShow = true
    } else {
      this.inCanvasShow = false
      return
    }

    this.ctx.save()
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.scale(this.scaleC, this.scaleC)
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)

    this.ctx.beginPath()
    let strokeWidth = 0
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      strokeWidth = this.style.hover.strokeWidth
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
      this.ctx.fillStyle = this.style.hover.fillColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      strokeWidth = this.style.strokeWidth
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
      this.ctx.fillStyle = this.style.fillColor
    }
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.vertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.lineTo(this.vertex[0].x, this.vertex[0].y)
    this.ctx.fill()
    if (strokeWidth) {
      this.ctx.stroke()
    }
    this.ctx.closePath()
    this.ctx.restore()

    super.draw()
  }
  graphZoom({ x, y }, vertexFocusSelectionIndex) {
    if (this.style.width + x > this.style.focus.point.r * 2 && this.style.height + y > this.style.focus.point.r * 2) {
      this.style.width += x
      this.style.height += y

      let tx = (x / 2) * -1
      let ty = (y / 2) * -1
      switch (vertexFocusSelectionIndex) {
        case 0:
          tx = (x / 2) * -1
          ty = (y / 2) * -1
          break
        case 1:
          tx = x / 2
          ty = (y / 2) * -1
          break
        case 2:
          tx = x / 2
          ty = y / 2
          break
        case 3:
          tx = (x / 2) * -1
          ty = y / 2
          break
      }
      this.xy.x += tx
      this.xy.y += ty
      if (this.drawContent && this.drawContent.length) {
        this.drawContent.forEach(line => {
          line.x += tx
          line.y += ty
        })
      }

      this.vertex = getParallelogramVertex(this.style.width, this.style.height, this.xy)
      super.graphZoom({ x, y }, { tx, ty }, vertexFocusSelectionIndex)
    }
  }
}
ParallelogramGraph.benchmarkType = 1
ParallelogramGraph.asName = 'ParallelogramGraph'

// 文件
class FillGraph extends Graph {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: FillGraph.benchmarkType, asName: FillGraph.asName }))

    this.init(opt)
  }
  init() {
    super.init()

    this.drawVertex = getFillVertex(this.style.width, this.style.height, this.xy)
    this.vertex = getRectangleVertex(this.style.width, this.style.height, this.xy, 0)

    if (this.autoDraw) {
      this.draw()
    }
  }
  formatDataTranslate({ x, y }) {
    super.formatDataTranslate({ x, y })
    if (this.drawVertex && this.drawVertex.length) {
      this.drawVertex.forEach(vertexItem => {
        vertexItem.x += x
        vertexItem.y += y
      })
    }
  }
  draw() {
    if (graphInCanvas(this.graphRange, this.canvasRange)) {
      this.inCanvasShow = true
    } else {
      this.inCanvasShow = false
      return
    }

    this.ctx.save()
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.scale(this.scaleC, this.scaleC)
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)

    this.ctx.beginPath()
    let strokeWidth = 0
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      strokeWidth = this.style.hover.strokeWidth
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
      this.ctx.fillStyle = this.style.hover.fillColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      strokeWidth = this.style.strokeWidth
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
      this.ctx.fillStyle = this.style.fillColor
    }
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.drawVertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.lineTo(this.drawVertex[0].x, this.drawVertex[0].y)
    this.ctx.fill()
    if (strokeWidth) {
      this.ctx.stroke()
    }
    this.ctx.closePath()
    this.ctx.restore()

    super.draw()
  }
  graphZoom({ x, y }, vertexFocusSelectionIndex) {
    if (this.style.width + x > this.style.focus.point.r * 2 && this.style.height + y > this.style.focus.point.r * 2) {
      this.style.width += x
      this.style.height += y

      let tx = (x / 2) * -1
      let ty = (y / 2) * -1
      switch (vertexFocusSelectionIndex) {
        case 0:
          tx = (x / 2) * -1
          ty = (y / 2) * -1
          break
        case 1:
          tx = x / 2
          ty = (y / 2) * -1
          break
        case 2:
          tx = x / 2
          ty = y / 2
          break
        case 3:
          tx = (x / 2) * -1
          ty = y / 2
          break
      }
      this.xy.x += tx
      this.xy.y += ty
      if (this.drawContent && this.drawContent.length) {
        this.drawContent.forEach(line => {
          line.x += tx
          line.y += ty
        })
      }

      this.drawVertex = getFillVertex(this.style.width, this.style.height, this.xy)
      this.vertex = getRectangleVertex(this.style.width, this.style.height, this.xy, 0)
      super.graphZoom({ x, y }, { tx, ty }, vertexFocusSelectionIndex)
    }
  }
}
FillGraph.benchmarkType = 1
FillGraph.asName = 'FillGraph'

// 文本
class TextGraph extends Graph {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: TextGraph.benchmarkType, asName: TextGraph.asName }))

    this.drawBg = getType(opt.drawBg) === 'Boolean' ? opt.drawBg : false

    this.init(opt)
  }
  init() {
    super.init()

    this.vertex = getRectangleVertex(this.style.width, this.style.height, this.xy, 0)

    if (!this.content) {
      this.formatText('文本')
    }

    if (this.autoDraw) {
      this.draw()
    }
  }
  draw() {
    if (graphInCanvas(this.graphRange, this.canvasRange)) {
      this.inCanvasShow = true
    } else {
      this.inCanvasShow = false
      return
    }

    if (this.drawBg) {
      this.ctx.save()
      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
      this.ctx.scale(this.scaleC, this.scaleC)
      this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)

      this.ctx.beginPath()
      if (this.hover && this.style.hover.show) {
        this.ctx.globalAlpha = this.style.hover.globalAlpha
        this.ctx.fillStyle = this.style.hover.fillColor
      } else {
        this.ctx.globalAlpha = this.style.globalAlpha
        this.ctx.fillStyle = this.style.fillColor
      }
      this.vertex.forEach(vertexItem => {
        this.ctx.lineTo(vertexItem.x, vertexItem.y)
      })
      this.ctx.lineTo(this.vertex[0].x, this.vertex[0].y)
      this.ctx.fill()
      this.ctx.closePath()
      this.ctx.restore()
    }

    super.draw()
  }
  graphZoom({ x, y }, vertexFocusSelectionIndex) {
    if (this.style.width + x > this.style.focus.point.r * 2 && this.style.height + y > this.style.focus.point.r * 2) {
      this.style.width += x
      this.style.height += y

      let tx = (x / 2) * -1
      let ty = (y / 2) * -1
      switch (vertexFocusSelectionIndex) {
        case 0:
          tx = (x / 2) * -1
          ty = (y / 2) * -1
          break
        case 1:
          tx = x / 2
          ty = (y / 2) * -1
          break
        case 2:
          tx = x / 2
          ty = y / 2
          break
        case 3:
          tx = (x / 2) * -1
          ty = y / 2
          break
      }
      this.xy.x += tx
      this.xy.y += ty
      if (this.drawContent && this.drawContent.length) {
        this.drawContent.forEach(line => {
          line.x += tx
          line.y += ty
        })
      }

      this.vertex = getRectangleVertex(this.style.width, this.style.height, this.xy, 0)
      super.graphZoom({ x, y }, { tx, ty }, vertexFocusSelectionIndex)
    }
  }
}
TextGraph.benchmarkType = 1
TextGraph.asName = 'TextGraph'

class TextGraphAutoWH extends TextGraph {
  constructor(opt) {
    super(
      objectMerge(opt, {
        style: objectMerge(style, {
          fillColor: '#ffffff'
        }),
        drawBg: true
      })
    )

    this.benchmarkType = TextGraphAutoWH.benchmarkType
    this.asName = TextGraphAutoWH.asName

    this.parentClass = opt.parentClass
    this.lineVertexIndex = opt.lineVertexIndex
    this.positionPercentage = opt.positionPercentage
  }
  addLineVertexIndex() {
    this.lineVertexIndex[0] += 1
    this.lineVertexIndex[1] += 1
    this.setXY()
  }
  subLineVertexIndex() {
    this.lineVertexIndex[0] -= 1
    this.lineVertexIndex[1] -= 1
    this.setXY()
  }
  resetPositionPercentage() {
    if (this.positionPercentage.percentage > 0.5) {
      this.positionPercentage.percentage = (this.positionPercentage.percentage - 0.5) / 0.5
      this.addLineVertexIndex()
    } else {
      this.positionPercentage.percentage /= 0.5
    }

    this.positionPercentage.translateX = 0
    this.positionPercentage.translateY = 0
    this.setXY()
  }
  delResetPositionPercentage(type) {
    if (type === 'left') {
      this.positionPercentage.percentage /= 2
    } else {
      this.positionPercentage.percentage = this.positionPercentage.percentage / 2 + 0.5
      this.subLineVertexIndex()
    }

    this.positionPercentage.translateX = 0
    this.positionPercentage.translateY = 0
    this.setXY()
  }
  setXY() {
    this.xy.x =
      this.parentClass.vertex[this.lineVertexIndex[0]].x +
      (this.parentClass.vertex[this.lineVertexIndex[1]].x - this.parentClass.vertex[this.lineVertexIndex[0]].x) * this.positionPercentage.percentage +
      this.positionPercentage.translateX
    this.xy.y =
      this.parentClass.vertex[this.lineVertexIndex[0]].y +
      (this.parentClass.vertex[this.lineVertexIndex[1]].y - this.parentClass.vertex[this.lineVertexIndex[0]].y) * this.positionPercentage.percentage +
      this.positionPercentage.translateY
    if (this.vertex && this.vertex.length) {
      this.vertex = getRectangleVertex(this.style.width, this.style.height, this.xy, 0)
    }
    if (this.drawContent && this.drawContent.length) {
      this.formatTextXY()
    }
  }
  formatDataTranslate({ x, y }) {
    super.formatDataTranslate({ x, y })
    this.positionPercentage.translateX += x
    this.positionPercentage.translateY += y

    const lineVertexIndex = vertexInLines(this.xy, this.parentClass.vertex, this.parentClass.style.strokeVirtualWidth)
    if (lineVertexIndex) {
      this.lineVertexIndex = lineVertexIndex

      let percentage = null
      if (
        (this.xy.x > this.parentClass.vertex[lineVertexIndex[0]].x && this.xy.x < this.parentClass.vertex[lineVertexIndex[1]].x) ||
        (this.xy.x < this.parentClass.vertex[lineVertexIndex[0]].x && this.xy.x > this.parentClass.vertex[lineVertexIndex[1]].x)
      ) {
        // 以x为基准
        percentage =
          (this.xy.x - this.parentClass.vertex[lineVertexIndex[0]].x) /
          (this.parentClass.vertex[lineVertexIndex[1]].x - this.parentClass.vertex[lineVertexIndex[0]].x)
      } else if (
        (this.xy.y > this.parentClass.vertex[lineVertexIndex[0]].y && this.xy.y < this.parentClass.vertex[lineVertexIndex[1]].y) ||
        (this.xy.y < this.parentClass.vertex[lineVertexIndex[0]].y && this.xy.y > this.parentClass.vertex[lineVertexIndex[1]].y)
      ) {
        // 以y为基准
        percentage =
          (this.xy.y - this.parentClass.vertex[lineVertexIndex[0]].y) /
          (this.parentClass.vertex[lineVertexIndex[1]].y - this.parentClass.vertex[lineVertexIndex[0]].y)
      } else {
        percentage = 0.3
      }

      this.positionPercentage.percentage = percentage
      this.positionPercentage.translateX = 0
      this.positionPercentage.translateY = 0
    }
  }
  formatText(html) {
    this.content = html

    if (this.hover && this.style.hover.show) {
      this.drawContent = htmlStr2textArr(html, this.style.hover.text)
    } else {
      this.drawContent = htmlStr2textArr(html, this.style.text)
    }

    this.formatTextXY()
    if (this.drawContent && this.drawContent.length) {
      const drawContent = deepClone(this.drawContent)
      this.style.height = drawContent.length * this.style.text.lineHeight
      drawContent.sort((a, b) => {
        return b.measureTextWidthTotal - a.measureTextWidthTotal
      })
      this.style.width = drawContent[0].measureTextWidthTotal
      this.vertex = getRectangleVertex(this.style.width, this.style.height, this.xy, 0)
    }
  }
}
TextGraphAutoWH.benchmarkType = 1
TextGraphAutoWH.asName = 'TextGraphAutoWH'

const exportObj = {
  ArcGraph,
  ThreeGraph,
  FourGraph,
  RectangleGraph,
  RectangleArcGraph,
  DiamondGraph,
  EllipseGraph,
  ParallelogramGraph,
  FillGraph,
  TextGraph,
  TextGraphAutoWH
}

Object.keys(exportObj).forEach(key => {
  exportObj[key].graphType = 'graph'
})

export {
  ArcGraph,
  ThreeGraph,
  FourGraph,
  RectangleGraph,
  RectangleArcGraph,
  DiamondGraph,
  EllipseGraph,
  ParallelogramGraph,
  FillGraph,
  TextGraph,
  TextGraphAutoWH
}
