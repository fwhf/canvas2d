/*
  wanghuijie

  配置解读
  canvas 目标渲染dom
  dpr 画图清晰度 默认取值window.devicePixelRatio
*/
import View from './view'

import { TextGraphAutoWH } from './graphList.js'
import {
  dpr,
  objectMerge,
  getTriangleVertex,
  deepClone,
  getCurveVertex,
  getLineVertex,
  getCurveLineVertex,
  getType,
  graphInCanvas,
  getArcVertex
} from '../util/helper.js'

const style = {
  strokeWidth: 1 * dpr,
  strokeVirtualWidth: 10 * dpr,
  strokeColor: '#333333',
  triangleFillColor: '#333333',
  triangleEdgeWidth: 10 * dpr,
  globalAlpha: 1,
  text: {
    globalAlpha: 1,
    lineHeight: 16 * dpr,
    fontSize: 14 * dpr,
    color: '#000000',
    textAlign: 'center',
    fontWight: 'normal',
    fontFamily: 'PingFang SC'
  },
  hover: {
    show: false,
    strokeWidth: 1 * dpr,
    strokeVirtualWidth: 10 * dpr,
    strokeColor: '#333333',
    triangleFillColor: '#333333',
    triangleEdgeWidth: 10 * dpr,
    globalAlpha: 1,
    text: {
      globalAlpha: 1,
      lineHeight: 16 * dpr,
      fontSize: 14 * dpr,
      color: '#000000',
      textAlign: 'center',
      fontWight: 'normal',
      fontFamily: 'PingFang SC'
    }
  },
  focus: {
    show: true,
    point: {
      fillColor: '#29b6f2',
      globalAlpha: 1,
      r: 6 * dpr,
      virtualR: 12 * dpr
    },
    emptyPoint: {
      fillColor: '#29b6f2',
      globalAlpha: 0.6,
      r: 6 * dpr,
      virtualR: 12 * dpr
    }
  }
}

class Line extends View {
  constructor(opt) {
    super(opt)

    this.style = objectMerge(style, opt.style)
    this.benchmarkType = opt.benchmarkType
    this.asName = opt.asName
    this.vertex = opt.vertex || []
    this.dash = opt.dash || [5, 15]
    this.graphType = 'line'

    this.zIndex = getType(opt.zIndex) === 'Number' ? opt.zIndex : 1

    this.focus = false

    this.hover = false
    this.hoverE = null

    // 存放线条关联图形(文本)对象
    this.contentArr = opt.contentArr || []

    this.autoDraw = getType(opt.autoDraw) === 'Boolean' ? opt.autoDraw : true

    this.allowTranslate = getType(opt.allowTranslate) === 'Boolean' ? opt.allowTranslate : true
    this.formatDataTranslateCb = getType(opt.formatDataTranslateCb) === 'Function' ? opt.formatDataTranslateCb : null

    this.id = opt.id || new Date().getTime()

    this.graphRange = {}
    // 图形是否在canvas内，如果不在则不绘制
    this.inCanvasShow = true

    this.opt = opt
  }
  init() {
    super.init()

    if (!this.vertex || !this.vertex.length) {
      if (this.benchmarkType === 0) {
        this.vertex = [
          { x: this.style.strokeWidth / 2, y: this.style.strokeWidth / 2 },
          {
            x: this.canvas.width - this.style.strokeWidth / 2,
            y: this.canvas.height - this.style.strokeWidth / 2
          }
        ]
      } else if (this.benchmarkType === 1) {
        this.vertex = [
          { x: this.style.strokeWidth / 2, y: this.style.strokeWidth / 2 },
          {
            x: this.canvas.width / 2,
            y: this.canvas.height - this.style.strokeWidth / 2
          },
          {
            x: this.canvas.width - this.style.strokeWidth / 2,
            y: this.style.strokeWidth / 2
          }
        ]
      } else {
        this.vertex = getArcVertex(this.xy, this.r, this.startDeg, this.endDeg, 1)
      }
    }
    this.triangleVertex = []

    if (this.benchmarkType === 1) {
      this.curveVertex = getCurveVertex(this.vertex, 0.4)
    }

    this.setGraphRange()

    if (this.autoDraw) {
      this.draw()
    }
  }
  setGraphRange() {
    if (this.benchmarkType !== 1) {
      this.graphRange = {
        left: this.vertex[0].x,
        right: this.vertex[0].x,
        top: this.vertex[0].y,
        bottom: this.vertex[0].y
      }
      this.vertex.forEach(point => {
        if (point.x < this.graphRange.left) {
          this.graphRange.left = point.x
        } else if (point.x > this.graphRange.right) {
          this.graphRange.right = point.x
        }
        if (point.y < this.graphRange.top) {
          this.graphRange.top = point.y
        } else if (point.y > this.graphRange.bottom) {
          this.graphRange.bottom = point.y
        }
      })
    } else {
      this.graphRange = {
        left: this.curveVertex[0].x,
        right: this.curveVertex[0].x,
        top: this.curveVertex[0].y,
        bottom: this.curveVertex[0].y
      }
      this.curveVertex.forEach(point => {
        if (point.x < this.graphRange.left) {
          this.graphRange.left = point.x
        } else if (point.x > this.graphRange.right) {
          this.graphRange.right = point.x
        }
        if (point.y < this.graphRange.top) {
          this.graphRange.top = point.y
        } else if (point.y > this.graphRange.bottom) {
          this.graphRange.bottom = point.y
        }
      })
    }
  }
  formatDataTranslate({ x, y }) {
    if (this.vertex && this.vertex.length) {
      this.vertex.forEach(vertexItem => {
        vertexItem.x += x
        vertexItem.y += y
      })
    }
    if (this.triangleVertex && this.triangleVertex.length) {
      this.triangleVertex.forEach(vertexItem => {
        vertexItem.x += x
        vertexItem.y += y
      })
    }
    if (this.triangleVertexStart && this.triangleVertexStart.length) {
      this.triangleVertexStart.forEach(vertexItem => {
        vertexItem.x += x
        vertexItem.y += y
      })
    }
    if (this.triangleVertexEnd && this.triangleVertexEnd.length) {
      this.triangleVertexEnd.forEach(vertexItem => {
        vertexItem.x += x
        vertexItem.y += y
      })
    }
    if (this.focus && this.contentArr.length) {
      this.contentArr.forEach(textGraph => {
        textGraph.formatDataTranslate({ x, y })
      })
    }
    if (this.curveVertex && this.curveVertex.length) {
      this.curveVertex.forEach(vertexItem => {
        vertexItem.x += x
        vertexItem.y += y
      })
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
  }
  drawFocus() {
    if (this.benchmarkType === 1) {
      this.vertexFocus = getCurveLineVertex(this.vertex, this.curveVertex)
    } else {
      this.vertexFocus = getLineVertex(this.vertex)
    }

    this.ctx.save()
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.scale(this.scaleC, this.scaleC)
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)

    this.vertexFocus.forEach((vertexItem, index) => {
      this.ctx.beginPath()
      if (index % 2) {
        this.ctx.globalAlpha = this.style.focus.emptyPoint.globalAlpha
        this.ctx.fillStyle = this.style.focus.emptyPoint.fillColor
        this.ctx.arc(vertexItem.x, vertexItem.y, this.style.focus.emptyPoint.r, 0, 2 * Math.PI)
      } else {
        this.ctx.globalAlpha = this.style.focus.point.globalAlpha
        this.ctx.fillStyle = this.style.focus.point.fillColor
        this.ctx.arc(vertexItem.x, vertexItem.y, this.style.focus.point.r, 0, 2 * Math.PI)
      }
      this.ctx.fill()
      this.ctx.closePath()
    })

    this.ctx.restore()
  }
  formatText(html, xy, lineVertexIndex, wh, that) {
    let percentage = null
    if (
      (xy.x > this.vertex[lineVertexIndex[0]].x && xy.x < this.vertex[lineVertexIndex[1]].x) ||
      (xy.x < this.vertex[lineVertexIndex[0]].x && xy.x > this.vertex[lineVertexIndex[1]].x)
    ) {
      // 以x为基准
      percentage = (xy.x - this.vertex[lineVertexIndex[0]].x) / (this.vertex[lineVertexIndex[1]].x - this.vertex[lineVertexIndex[0]].x)
    } else if (
      (xy.y > this.vertex[lineVertexIndex[0]].y && xy.y < this.vertex[lineVertexIndex[1]].y) ||
      (xy.y < this.vertex[lineVertexIndex[0]].y && xy.y > this.vertex[lineVertexIndex[1]].y)
    ) {
      // 以y为基准
      percentage = (xy.y - this.vertex[lineVertexIndex[0]].y) / (this.vertex[lineVertexIndex[1]].y - this.vertex[lineVertexIndex[0]].y)
    } else {
      percentage = 0.3
    }

    const textGraph = new TextGraphAutoWH({
      canvas: this.canvas,
      scaleC: this.scaleC,
      xy,
      content: html,
      autoDraw: false,
      lineVertexIndex,
      positionPercentage: {
        percentage,
        translateX: 0,
        translateY: 0
      },
      style: objectMerge(this.style, {
        width: wh.width,
        height: wh.height
      })
    })
    textGraph.parentClass = this
    that.addGraphToList(textGraph)
    this.contentArr.push(textGraph)
  }
  graphZoom({ x, y }, vertexFocusSelectionIndex, that) {
    if (vertexFocusSelectionIndex % 2) {
      this.vertex.splice((vertexFocusSelectionIndex + 1) / 2, 0, {
        x: this.vertexFocus[vertexFocusSelectionIndex].x + x,
        y: this.vertexFocus[vertexFocusSelectionIndex].y + y
      })
      that.vertexFocusSelectionIndex += 1
      if (this.contentArr.length) {
        this.contentArr.forEach(textGraph => {
          if (textGraph.lineVertexIndex[0] > vertexFocusSelectionIndex / 2) {
            textGraph.addLineVertexIndex()
          } else if (textGraph.lineVertexIndex[0] < vertexFocusSelectionIndex / 2 && textGraph.lineVertexIndex[1] > vertexFocusSelectionIndex / 2) {
            textGraph.resetPositionPercentage()
          }
        })
      }
    } else if (vertexFocusSelectionIndex) {
      this.vertex[Math.floor(vertexFocusSelectionIndex / 2)].x += x
      this.vertex[Math.floor(vertexFocusSelectionIndex / 2)].y += y
      if (this.contentArr.length) {
        this.contentArr.forEach(textGraph => {
          if (textGraph.lineVertexIndex.indexOf(vertexFocusSelectionIndex / 2) > -1) {
            textGraph.setXY()
          }
        })
      }
    } else {
      this.vertex[0].x += x
      this.vertex[0].y += y
      if (this.contentArr.length) {
        this.contentArr.forEach(textGraph => {
          if (textGraph.lineVertexIndex.indexOf(0) > -1) {
            textGraph.setXY()
          }
        })
      }
    }

    if (this.benchmarkType === 1) {
      this.curveVertex = getCurveVertex(this.vertex, 0.4)
    }

    this.setGraphRange()
  }
  delVertex(vertexIndex) {
    this.vertex.splice(vertexIndex, 1)
    if (this.benchmarkType === 1) {
      this.curveVertex = getCurveVertex(this.vertex, 0.4)
    }
    if (this.contentArr.length) {
      this.contentArr.forEach(textGraph => {
        if (textGraph.lineVertexIndex[0] > vertexIndex) {
          textGraph.subLineVertexIndex()
        } else if (textGraph.lineVertexIndex[0] === vertexIndex) {
          textGraph.delResetPositionPercentage('right')
        } else if (textGraph.lineVertexIndex[1] === vertexIndex) {
          textGraph.delResetPositionPercentage('left')
        }
      })
    }
    this.setGraphRange()
  }
  setHoverStatus(hover, hoverE) {
    this.hover = hover
    this.hoverE = hoverE
  }
}

class UndirectedLine extends Line {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: UndirectedLine.benchmarkType, asName: UndirectedLine.asName }))

    this.init()
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
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
    }
    this.vertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.restore()

    if (this.focus && this.style.focus.show) {
      this.drawFocus()
    }
  }
}
UndirectedLine.asName = 'UndirectedLine'
UndirectedLine.benchmarkType = 0

class UndirectedDashedLine extends Line {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: UndirectedDashedLine.benchmarkType, asName: UndirectedDashedLine.asName }))

    this.init()
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
    this.ctx.setLineDash(this.dash)
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
    }
    this.vertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.restore()

    if (this.focus && this.style.focus.show) {
      this.drawFocus()
    }
  }
}
UndirectedDashedLine.asName = 'UndirectedDashedLine'
UndirectedDashedLine.benchmarkType = 0

class UnidirectionalLine extends Line {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: UnidirectionalLine.benchmarkType, asName: UnidirectionalLine.asName }))

    this.init()
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
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
    }

    this.vertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.stroke()
    this.ctx.closePath()

    this.triangleVertex = getTriangleVertex(deepClone(this.vertex[0]), deepClone(this.vertex[1]), this.style.triangleEdgeWidth)
    let drawTriangleVertex = true
    this.triangleVertex.forEach(item => {
      if (!item) {
        drawTriangleVertex = false
      }
    })
    if (drawTriangleVertex) {
      this.ctx.beginPath()
      if (this.hover && this.style.hover.show) {
        this.ctx.globalAlpha = this.style.hover.globalAlpha
        this.ctx.fillStyle = this.style.hover.triangleFillColor
      } else {
        this.ctx.globalAlpha = this.style.globalAlpha
        this.ctx.fillStyle = this.style.triangleFillColor
      }

      this.triangleVertex.forEach(vertexItem => {
        this.ctx.lineTo(vertexItem.x, vertexItem.y)
      })
      this.ctx.lineTo(this.triangleVertex[0].x, this.triangleVertex[0].y)

      this.ctx.fill()
      this.ctx.closePath()
    } else {
      this.triangleVertex = []
    }

    this.ctx.restore()

    if (this.focus && this.style.focus.show) {
      this.drawFocus()
    }
  }
}
UnidirectionalLine.asName = 'UnidirectionalLine'
UnidirectionalLine.benchmarkType = 0

class BidirectionalLine extends Line {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: BidirectionalLine.benchmarkType, asName: BidirectionalLine.asName }))

    this.init()
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
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
    }
    this.vertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.stroke()
    this.ctx.closePath()

    this.triangleVertexStart = getTriangleVertex(deepClone(this.vertex[0]), deepClone(this.vertex[1]), this.style.triangleEdgeWidth)
    let drawTriangleVertexStart = true
    this.triangleVertexStart.forEach(item => {
      if (!item) {
        drawTriangleVertexStart = false
      }
    })
    if (drawTriangleVertexStart) {
      this.ctx.beginPath()
      if (this.hover && this.style.hover.show) {
        this.ctx.globalAlpha = this.style.hover.globalAlpha
        this.ctx.fillStyle = this.style.hover.triangleFillColor
      } else {
        this.ctx.globalAlpha = this.style.globalAlpha
        this.ctx.fillStyle = this.style.triangleFillColor
      }

      this.triangleVertexStart.forEach(vertexItem => {
        this.ctx.lineTo(vertexItem.x, vertexItem.y)
      })
      this.ctx.lineTo(this.triangleVertexStart[0].x, this.triangleVertexStart[0].y)

      this.ctx.fill()
      this.ctx.closePath()
    } else {
      this.triangleVertexStart = []
    }

    const vertexLength = this.vertex.length
    this.triangleVertexEnd = getTriangleVertex(deepClone(this.vertex[vertexLength - 1]), deepClone(this.vertex[vertexLength - 2]), this.style.triangleEdgeWidth)
    let drawTriangleVertexEnd = true
    this.triangleVertexEnd.forEach(item => {
      if (!item) {
        drawTriangleVertexEnd = false
      }
    })
    if (drawTriangleVertexEnd) {
      this.ctx.beginPath()
      if (this.hover && this.style.hover.show) {
        this.ctx.globalAlpha = this.style.hover.globalAlpha
        this.ctx.fillStyle = this.style.hover.triangleFillColor
      } else {
        this.ctx.globalAlpha = this.style.globalAlpha
        this.ctx.fillStyle = this.style.triangleFillColor
      }

      this.triangleVertexEnd.forEach(vertexItem => {
        this.ctx.lineTo(vertexItem.x, vertexItem.y)
      })
      this.ctx.lineTo(this.triangleVertexEnd[0].x, this.triangleVertexEnd[0].y)

      this.ctx.fill()
      this.ctx.closePath()
    } else {
      this.triangleVertexEnd = []
    }

    this.ctx.restore()

    if (this.focus && this.style.focus.show) {
      this.drawFocus()
    }
  }
}
BidirectionalLine.asName = 'BidirectionalLine'
BidirectionalLine.benchmarkType = 0

class CurveLine extends Line {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: CurveLine.benchmarkType, asName: CurveLine.asName }))

    this.init()
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
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
    }
    this.curveVertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.restore()

    if (this.focus && this.style.focus.show) {
      this.drawFocus()
    }
  }
}
CurveLine.asName = 'CurveLine'
CurveLine.benchmarkType = 1

class UnidirectionalCurveLine extends Line {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: UnidirectionalCurveLine.benchmarkType, asName: UnidirectionalCurveLine.asName }))

    this.init()
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
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
    }
    this.curveVertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.stroke()
    this.ctx.closePath()

    this.triangleVertex = getTriangleVertex(deepClone(this.vertex[0]), deepClone(this.vertex[1]), this.style.triangleEdgeWidth)
    let drawTriangleVertex = true
    this.triangleVertex.forEach(item => {
      if (!item) {
        drawTriangleVertex = false
      }
    })
    if (drawTriangleVertex) {
      this.ctx.beginPath()
      if (this.hover && this.style.hover.show) {
        this.ctx.globalAlpha = this.style.hover.globalAlpha
        this.ctx.fillStyle = this.style.hover.triangleFillColor
      } else {
        this.ctx.globalAlpha = this.style.globalAlpha
        this.ctx.fillStyle = this.style.triangleFillColor
      }

      this.triangleVertex.forEach(vertexItem => {
        this.ctx.lineTo(vertexItem.x, vertexItem.y)
      })
      this.ctx.lineTo(this.triangleVertex[0].x, this.triangleVertex[0].y)

      this.ctx.fill()
      this.ctx.closePath()
    } else {
      this.triangleVertex = []
    }

    this.ctx.restore()

    if (this.focus && this.style.focus.show) {
      this.drawFocus()
    }
  }
}
UnidirectionalCurveLine.asName = 'UnidirectionalCurveLine'
UnidirectionalCurveLine.benchmarkType = 1

class BidirectionalCurveLine extends Line {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: BidirectionalCurveLine.benchmarkType, asName: BidirectionalCurveLine.asName }))

    this.init()
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
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
    }
    this.curveVertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.stroke()
    this.ctx.closePath()

    this.triangleVertexStart = getTriangleVertex(deepClone(this.vertex[0]), deepClone(this.vertex[1]), this.style.triangleEdgeWidth)
    let drawTriangleVertexStart = true
    this.triangleVertexStart.forEach(item => {
      if (!item) {
        drawTriangleVertexStart = false
      }
    })
    if (drawTriangleVertexStart) {
      this.ctx.beginPath()
      if (this.hover && this.style.hover.show) {
        this.ctx.globalAlpha = this.style.hover.globalAlpha
        this.ctx.fillStyle = this.style.hover.triangleFillColor
      } else {
        this.ctx.globalAlpha = this.style.globalAlpha
        this.ctx.fillStyle = this.style.triangleFillColor
      }

      this.triangleVertexStart.forEach(vertexItem => {
        this.ctx.lineTo(vertexItem.x, vertexItem.y)
      })
      this.ctx.lineTo(this.triangleVertexStart[0].x, this.triangleVertexStart[0].y)

      this.ctx.fill()
      this.ctx.closePath()
    } else {
      this.triangleVertexStart = []
    }

    const vertexLength = this.vertex.length
    this.triangleVertexEnd = getTriangleVertex(deepClone(this.vertex[vertexLength - 1]), deepClone(this.vertex[vertexLength - 2]), this.style.triangleEdgeWidth)
    let drawTriangleVertexEnd = true
    this.triangleVertexEnd.forEach(item => {
      if (!item) {
        drawTriangleVertexEnd = false
      }
    })
    if (drawTriangleVertexEnd) {
      this.ctx.beginPath()
      if (this.hover && this.style.hover.show) {
        this.ctx.globalAlpha = this.style.hover.globalAlpha
        this.ctx.fillStyle = this.style.hover.triangleFillColor
      } else {
        this.ctx.globalAlpha = this.style.globalAlpha
        this.ctx.fillStyle = this.style.triangleFillColor
      }

      this.triangleVertexEnd.forEach(vertexItem => {
        this.ctx.lineTo(vertexItem.x, vertexItem.y)
      })
      this.ctx.lineTo(this.triangleVertexEnd[0].x, this.triangleVertexEnd[0].y)

      this.ctx.fill()
      this.ctx.closePath()
    } else {
      this.triangleVertexEnd = []
    }

    this.ctx.restore()

    if (this.focus && this.style.focus.show) {
      this.drawFocus()
    }
  }
}
BidirectionalCurveLine.asName = 'BidirectionalCurveLine'
BidirectionalCurveLine.benchmarkType = 1

class ArcLine extends Line {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: ArcLine.benchmarkType, asName: ArcLine.asName }))

    this.xy = opt.xy || {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    }
    this.r = opt.r || this.canvas.width / 2
    this.startDeg = getType(opt.startDeg) === 'Number' ? opt.startDeg : 0
    this.endDeg = getType(opt.endDeg) === 'Number' ? opt.endDeg : Math.PI

    this.init()
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
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
    }
    this.vertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.restore()

    if (this.focus && this.style.focus.show) {
      this.drawFocus()
    }
  }
}
ArcLine.asName = 'ArcLine'
ArcLine.benchmarkType = 2

class UnidirectionalArcLine extends Line {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: UnidirectionalArcLine.benchmarkType, asName: UnidirectionalArcLine.asName }))

    this.xy = opt.xy || {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    }
    this.r = opt.r || this.canvas.width / 2
    this.startDeg = getType(opt.startDeg) === 'Number' ? opt.startDeg : 0
    this.endDeg = getType(opt.endDeg) === 'Number' ? opt.endDeg : Math.PI

    this.init()
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
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
    }
    this.vertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.stroke()
    this.ctx.closePath()

    const vertexEnd = {
      x: this.vertex[0].x + (this.vertex[1].x - this.vertex[0].x) * this.r,
      y: this.vertex[0].y + (this.vertex[1].y - this.vertex[0].y) * this.r
    }
    this.triangleVertex = getTriangleVertex(deepClone(this.vertex[0]), deepClone(vertexEnd), this.style.triangleEdgeWidth)
    let drawTriangleVertex = true
    this.triangleVertex.forEach(item => {
      if (!item) {
        drawTriangleVertex = false
      }
    })
    if (drawTriangleVertex) {
      this.ctx.beginPath()
      if (this.hover && this.style.hover.show) {
        this.ctx.globalAlpha = this.style.hover.globalAlpha
        this.ctx.fillStyle = this.style.hover.triangleFillColor
      } else {
        this.ctx.globalAlpha = this.style.globalAlpha
        this.ctx.fillStyle = this.style.triangleFillColor
      }

      this.triangleVertex.forEach(vertexItem => {
        this.ctx.lineTo(vertexItem.x, vertexItem.y)
      })
      this.ctx.lineTo(this.triangleVertex[0].x, this.triangleVertex[0].y)

      this.ctx.fill()
      this.ctx.closePath()
    } else {
      this.triangleVertex = []
    }

    this.ctx.restore()

    if (this.focus && this.style.focus.show) {
      this.drawFocus()
    }
  }
}
UnidirectionalArcLine.asName = 'UnidirectionalArcLine'
UnidirectionalArcLine.benchmarkType = 2

class BidirectionalArcLine extends Line {
  constructor(opt) {
    super(objectMerge(opt, { benchmarkType: BidirectionalArcLine.benchmarkType, asName: BidirectionalArcLine.asName }))

    this.xy = opt.xy || {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    }
    this.r = opt.r || this.canvas.width / 2
    this.startDeg = getType(opt.startDeg) === 'Number' ? opt.startDeg : 0
    this.endDeg = getType(opt.endDeg) === 'Number' ? opt.endDeg : Math.PI

    this.init()
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
    if (this.hover && this.style.hover.show) {
      this.ctx.globalAlpha = this.style.hover.globalAlpha
      this.ctx.lineWidth = this.style.hover.strokeWidth
      this.ctx.strokeStyle = this.style.hover.strokeColor
    } else {
      this.ctx.globalAlpha = this.style.globalAlpha
      this.ctx.lineWidth = this.style.strokeWidth
      this.ctx.strokeStyle = this.style.strokeColor
    }
    this.vertex.forEach(vertexItem => {
      this.ctx.lineTo(vertexItem.x, vertexItem.y)
    })
    this.ctx.stroke()
    this.ctx.closePath()

    const vertexEnd = {
      x: this.vertex[0].x + (this.vertex[1].x - this.vertex[0].x) * this.r,
      y: this.vertex[0].y + (this.vertex[1].y - this.vertex[0].y) * this.r
    }
    this.triangleVertexStart = getTriangleVertex(deepClone(this.vertex[0]), deepClone(vertexEnd), this.style.triangleEdgeWidth)
    let drawTriangleVertexStart = true
    this.triangleVertexStart.forEach(item => {
      if (!item) {
        drawTriangleVertexStart = false
      }
    })
    if (drawTriangleVertexStart) {
      this.ctx.beginPath()
      if (this.hover && this.style.hover.show) {
        this.ctx.globalAlpha = this.style.hover.globalAlpha
        this.ctx.fillStyle = this.style.hover.triangleFillColor
      } else {
        this.ctx.globalAlpha = this.style.globalAlpha
        this.ctx.fillStyle = this.style.triangleFillColor
      }

      this.triangleVertexStart.forEach(vertexItem => {
        this.ctx.lineTo(vertexItem.x, vertexItem.y)
      })
      this.ctx.lineTo(this.triangleVertexStart[0].x, this.triangleVertexStart[0].y)

      this.ctx.fill()
      this.ctx.closePath()
    } else {
      this.triangleVertexStart = []
    }

    const vertexLength = this.vertex.length
    const vertexEnd2 = {
      x: this.vertex[vertexLength - 1].x + (this.vertex[vertexLength - 2].x - this.vertex[vertexLength - 1].x) * this.r,
      y: this.vertex[vertexLength - 1].y + (this.vertex[vertexLength - 2].y - this.vertex[vertexLength - 1].y) * this.r
    }
    this.triangleVertexEnd = getTriangleVertex(deepClone(this.vertex[vertexLength - 1]), deepClone(vertexEnd2), this.style.triangleEdgeWidth)
    let drawTriangleVertexEnd = true
    this.triangleVertexEnd.forEach(item => {
      if (!item) {
        drawTriangleVertexEnd = false
      }
    })
    if (drawTriangleVertexEnd) {
      this.ctx.beginPath()
      if (this.hover && this.style.hover.show) {
        this.ctx.globalAlpha = this.style.hover.globalAlpha
        this.ctx.fillStyle = this.style.hover.triangleFillColor
      } else {
        this.ctx.globalAlpha = this.style.globalAlpha
        this.ctx.fillStyle = this.style.triangleFillColor
      }

      this.triangleVertexEnd.forEach(vertexItem => {
        this.ctx.lineTo(vertexItem.x, vertexItem.y)
      })
      this.ctx.lineTo(this.triangleVertexEnd[0].x, this.triangleVertexEnd[0].y)

      this.ctx.fill()
      this.ctx.closePath()
    } else {
      this.triangleVertexEnd = []
    }

    this.ctx.restore()

    if (this.focus && this.style.focus.show) {
      this.drawFocus()
    }
  }
}
BidirectionalArcLine.asName = 'BidirectionalArcLine'
BidirectionalArcLine.benchmarkType = 2

const exportObj = {
  UndirectedLine, // 无向线
  UndirectedDashedLine, // 无向虚线
  UnidirectionalLine, // 单向线
  BidirectionalLine, // 双向线
  CurveLine, // 无向曲线
  UnidirectionalCurveLine, // 单向曲线
  BidirectionalCurveLine, // 双向曲线
  ArcLine, // 无向圆弧线
  UnidirectionalArcLine, // 单向圆弧线
  BidirectionalArcLine // 双向圆弧线
}

Object.keys(exportObj).forEach(key => {
  exportObj[key].graphType = 'line'
})

export {
  UndirectedLine,
  UndirectedDashedLine,
  UnidirectionalLine,
  BidirectionalLine,
  CurveLine,
  UnidirectionalCurveLine,
  BidirectionalCurveLine,
  ArcLine,
  UnidirectionalArcLine,
  BidirectionalArcLine
}
