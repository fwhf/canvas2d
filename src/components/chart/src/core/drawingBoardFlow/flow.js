/*
  wanghuijie

  配置解读
  canvas 目标渲染dom
  dpr 画图清晰度 默认取值window.devicePixelRatio
*/
import View from '../view'
import { dpr, objectMerge, getType, getSaveImageData, vertexInGraph } from '../../util/helper.js'

export default class DrawingBoardFlow extends View {
  constructor(opt) {
    super(opt)
    this.gridStyle = objectMerge(
      {
        show: true,
        width: 10 * dpr,
        lightInterval: 5,
        strokeLightWidth: 1 * dpr,
        strokeLightColor: '#ccc',
        strokeDarkWidth: 1 * dpr,
        strokeDarkColor: '#eee'
      },
      opt.gridStyle || {}
    )
    this.bgColor = getType(opt.bgColor) === 'String' ? opt.bgColor : '#ffffff'
    this.saveImagePadding = getType(opt.saveImagePadding) === 'String' ? opt.saveImagePadding : 10 * dpr
    this.graphList = getType(opt.graphList) === 'Array' ? opt.graphList : []

    this.moveByGrid = true

    this.mouseupBtn0NextCb = this.mouseupBtn0Cb
    this.mouseupBtn0Cb = this.hijackMouseupBtn0Cb

    this.init()
  }
  init() {
    super.init()

    this.initData()

    if (this.eventFlag) {
      this.addEvent()
    }
  }
  initData() {
    this.centerXY = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    }
    this.draw()
  }
  addGraphToList(graph) {
    graph.formatDataTranslateCb = this.graphFormatDataTranslateCb.bind(this)
    this.graphList.push(graph)
    graph.draw()
  }
  resetGraphListIndex() {
    if (this.focusGraphOrLineIndex !== null && this.graphList[this.focusGraphOrLineIndex]) {
      const graph = this.graphList.splice(this.focusGraphOrLineIndex, 1)
      this.graphList.push(graph[0])
      if (graph[0].contentArr && graph[0].contentArr.length) {
        graph[0].contentArr.forEach(lineItem => {
          for (let i = 0; i < this.graphList.length; i++) {
            if (lineItem.id === this.graphList[i].id) {
              this.graphList.push(this.graphList.splice(i, 1)[0])
              break
            }
          }
        })
      }
      for (let i = 0; i < this.graphList.length; i++) {
        if (this.graphList[i].id === graph[0].id) {
          this.focusGraphOrLineIndex = i
          break
        }
      }
      this.addTask()
    }
  }
  delGraphToList() {
    if (this.focusGraphOrLine) {
      if (this.focusGraphOrLine.graphType === 'line') {
        this.graphList.forEach(graph => {
          if (graph.lineArr && graph.lineArr.length) {
            for (let i = 0; i < graph.lineArr.length; i++) {
              if (graph.lineArr[i].line.id === this.focusGraphOrLine.id) {
                graph.lineArr.splice(i, 1)
                i--
              }
            }
          }
        })
      }
      if (this.focusGraphOrLine.parentClass) {
        for (let i = 0; i < this.focusGraphOrLine.parentClass.contentArr.length; i++) {
          if (this.focusGraphOrLine.parentClass.contentArr[i].id === this.focusGraphOrLine.id) {
            this.focusGraphOrLine.parentClass.contentArr.splice(i, 1)
            break
          }
        }
        this.graphList.splice(this.focusGraphOrLineIndex, 1)
      } else if (this.focusGraphOrLine.contentArr && this.focusGraphOrLine.contentArr.length) {
        for (let i = 0; i < this.focusGraphOrLine.contentArr.length; i++) {
          for (let j = 0; j < this.graphList.length; j++) {
            if (this.focusGraphOrLine.contentArr[i].id === this.graphList[j].id) {
              this.graphList.splice(j, 1)
              break
            }
          }
        }
        for (let i = 0; i < this.graphList.length; i++) {
          if (this.focusGraphOrLine.id === this.graphList[i].id) {
            this.graphList.splice(i, 1)
            break
          }
        }
      } else {
        this.graphList.splice(this.focusGraphOrLineIndex, 1)
      }
      this.focusGraphOrLineIndex = null
      this.focusGraphOrLine = null
      this.addTask()
    }
  }
  formatDataTranslate({ x, y }) {
    this.graphList.forEach(graph => {
      graph.formatDataTranslate({ x, y })
    })
  }
  graphFormatDataTranslateCb(data) {
    if (data && data.graphType === 'line' && data.vertexFocus) {
      this.relationGraphAndLine(data, 0)
      this.relationGraphAndLine(data, data.vertexFocus.length - 1)
    }
  }
  formatDataScale() {
    this.graphList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
    })
  }
  draw() {
    this.drawBg()
    this.drawGrid()
    this.drawGraph()
  }
  drawBg() {
    this.ctx.beginPath()
    this.ctx.fillStyle = this.bgColor
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fill()
    this.ctx.closePath()
  }
  drawGraph() {
    this.graphList.forEach(graph => {
      graph.draw()
    })
  }
  drawGrid() {
    if (!this.gridStyle.show) {
      return
    }
    const gridWidth = this.gridStyle.width * this.scaleC

    const I = (this.canvas.width / 2 / gridWidth) % this.gridStyle.lightInterval
    let i = this.gridStyle.lightInterval - parseInt(I)
    let gridX = (I % 1) * gridWidth
    while (gridX < this.canvas.width) {
      this.ctx.beginPath()

      this.ctx.lineWidth = i % this.gridStyle.lightInterval ? this.gridStyle.strokeDarkWidth : this.gridStyle.strokeLightWidth
      this.ctx.strokeStyle = i % this.gridStyle.lightInterval ? this.gridStyle.strokeDarkColor : this.gridStyle.strokeLightColor
      this.ctx.lineTo(gridX, 0)
      this.ctx.lineTo(gridX, this.canvas.height)

      this.ctx.stroke()
      this.ctx.closePath()
      gridX += gridWidth
      i++
    }

    const J = (this.canvas.height / 2 / gridWidth) % this.gridStyle.lightInterval
    let j = this.gridStyle.lightInterval - parseInt(J)
    let gridY = (J % 1) * gridWidth
    while (gridY < this.canvas.height) {
      this.ctx.beginPath()

      this.ctx.lineWidth = j % this.gridStyle.lightInterval ? this.gridStyle.strokeDarkWidth : this.gridStyle.strokeLightWidth
      this.ctx.strokeStyle = j % this.gridStyle.lightInterval ? this.gridStyle.strokeDarkColor : this.gridStyle.strokeLightColor
      this.ctx.lineTo(0, gridY)
      this.ctx.lineTo(this.canvas.width, gridY)

      this.ctx.stroke()
      this.ctx.closePath()
      gridY += gridWidth
      j++
    }
  }
  addEvent() {
    super.addEvent()
  }
  save() {
    return {
      objData: this.getSaveObjData(),
      imageData: getSaveImageData(this)
    }
  }
  getSaveObjData() {
    const saveData = {
      centerXY: this.centerXY,
      dpr: this.dpr,
      graphList: [],
      bgColor: this.bgColor,
      saveImagePadding: this.saveImagePadding,
      gridStyle: this.gridStyle,
      scaleCIndex: this.scaleCIndex
    }
    this.graphList.forEach(item => {
      const graph = {
        asName: item.constructor.asName,
        id: item.id,
        style: item.style
      }
      if (item.graphType === 'graph') {
        // 图 ArcGraph, ThreeGraph, FourGraph, RectangleGraph, DiamondGraph, EllipseGraph, ParallelogramGraph, FillGraph, TextGraph,LineTextGraph
        graph.graphType = 'graph'
        graph.content = item.content
        graph.xy = item.xy
        graph.lineArr = []
        if (item.lineArr.length) {
          item.lineArr.forEach(lineClass => {
            graph.lineArr.push({
              id: lineClass.line.id,
              index: lineClass.index
            })
          })
        }

        // 线文本特殊处理
        if (item.lineVertexIndex) {
          graph.lineVertexIndex = item.lineVertexIndex
        }
        if (item.positionPercentage) {
          graph.positionPercentage = item.positionPercentage
        }
      } else {
        // 线 UndirectedLine, UnidirectionalLine, BidirectionalLine
        graph.graphType = 'line'
        graph.contentArr = []
        graph.vertex = item.vertex
        if (item.contentArr.length) {
          item.contentArr.forEach(LineTextGraph => {
            graph.contentArr.push(LineTextGraph.id)
          })
        }
      }
      saveData.graphList.push(graph)
    })
    return saveData
  }

  hijackMouseupBtn0Cb(xy, data) {
    if (data && data.graphType === 'line' && (this.vertexFocusSelectionIndex === 0 || this.vertexFocusSelectionIndex === data.vertexFocus.length - 1)) {
      this.relationGraphAndLine(data, this.vertexFocusSelectionIndex)
    }
    this.mouseupBtn0NextCb && this.mouseupBtn0NextCb(xy, data)
  }
  relationGraphAndLine(data, vertexFocusSelectionIndex) {
    const vertex = data.vertexFocus[vertexFocusSelectionIndex]
    let graph = null
    let spliceFlag = true
    this.graphList.forEach(item => {
      if (spliceFlag && item.lineArr && item.lineArr.length) {
        for (let i = 0; i < item.lineArr.length; i++) {
          if (
            item.lineArr[i].line.id === data.id &&
            (item.lineArr[i].index === vertexFocusSelectionIndex || (item.lineArr[i].index !== 0 && vertexFocusSelectionIndex !== 0))
          ) {
            item.lineArr.splice(i, 1)
            spliceFlag = false
            break
          }
        }
      }
      if (item.graphType === 'graph' && vertexInGraph(vertex, item.xy, item.vertex, item.r, item.hr)) {
        graph = item
      }
    })

    if (graph) {
      if (!graph.lineArr) {
        graph.lineArr = []
      }
      graph.lineArr.push({
        line: data,
        index: vertexFocusSelectionIndex
      })
    }
  }
}
