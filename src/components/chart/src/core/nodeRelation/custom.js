/*
  wanghuijie

  配置解读
  canvas 目标渲染dom
  dpr 画图清晰度 默认取值window.devicePixelRatio
  data 数据 详细格式见下
*/
import View from '../view'
import {
  dpr,
  getType,
  objectMerge,
  getLineAndGraphIntersection,
  getCurveVertex,
  convertMorP,
  getArcVertex,
  dprToGraphStyle,
  dprToLineStyle
} from '../../util/helper.js'
import * as graphList from '../graphList.js'
import * as lineList from '../lineList.js'

const style = {
  graph: 'ArcGraph',
  graphStyle: {
    width: 40 * dpr,
    height: 40 * dpr,
    padding: 0,
    strokeWidth: 0,
    strokeColor: '#333333',
    fillColor: '#efc000',
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
  curLine: 'UnidirectionalCurveLine',
  curLineStyle: {
    strokeWidth: 1 * dpr,
    strokeColor: '#333333',
    globalAlpha: 1,
    hover: {
      globalAlpha: 0.2,
      show: true
    },
    focus: {
      show: false
    }
  },
  dashedLine: 'UndirectedDashedLine',
  dashedLineStyle: {
    strokeWidth: 1 * dpr,
    strokeColor: '#333333',
    globalAlpha: 1,
    hover: {
      show: false
    },
    focus: {
      show: false
    }
  },
  loopLine: 'UnidirectionalArcLine',
  loopLineStyle: {
    width: 60 * dpr,
    height: 30 * dpr,
    padding: 0,
    strokeWidth: 1 * dpr,
    strokeColor: '#333333',
    fillColor: 'transparent',
    globalAlpha: 1
  },
  textGraph: 'TextGraph',
  textGraphStyle: {
    width: 'auto',
    height: 20 * dpr,
    padding: 0,
    strokeWidth: 0,
    strokeColor: '#333333',
    fillColor: '#efc000',
    globalAlpha: 1,
    margin: [10 * dpr, 0],
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
  lineMargin: 20 * dpr,
  loopLineMargin: 10 * dpr
}

export default class NodeRelationCustom extends View {
  constructor(opt) {
    super(opt)
    this.data = getType(opt.data) === 'Object' ? opt.data : {}

    this.style = objectMerge(style, opt.style)

    this.creatLine = null
    this.creatLineStartGraph = null
    this.creatLineEndGraph = null

    this.initCreatLineCb = opt.initCreatLineCb
    this.mousemoveCb = this.hijackMousemoveCb
    this.mouseupBtn0NextCb = this.mouseupBtn0Cb
    this.mouseupBtn0Cb = this.hijackMouseupBtn0Cb
    this.mouseupBtn2NextCb = this.mouseupBtn2Cb
    this.mouseupBtn2Cb = this.hijackMouseupBtn2Cb

    this.init()
  }
  init() {
    super.init()

    this.style.graph = graphList[this.style.graph]
    this.style.curLine = lineList[this.style.curLine]
    this.style.dashedLine = lineList[this.style.dashedLine]
    this.style.loopLine = lineList[this.style.loopLine]
    this.style.textGraph = graphList[this.style.textGraph]

    this.initGraphList()

    this.draw()
    if (this.eventFlag) {
      super.addEvent()
    }
  }

  initGraphList() {
    this.graphList = []

    if (!this.data.centerXY) {
      return
    }
    const dprIndex = this.dpr / this.data.dpr
    this.scaleCIndex = this.data.scaleCIndex
    this.scaleC = this.scaleCIndex / 100
    const translate = {
      x: this.canvas.width / 2 - this.data.centerXY.x,
      y: this.canvas.height / 2 - this.data.centerXY.y
    }
    this.data.graphList.forEach(item => {
      if (item.graphType === 'graph') {
        let graphClass = null
        const Graph = graphList[item.asName]
        item.style = objectMerge(this.style.graphStyle, item.style)
        item.style = dprToGraphStyle(item.style, dprIndex)
        graphClass = new Graph({
          canvas: this.canvas,
          scaleC: this.scaleC,
          xy: {
            x: item.xy.x + translate.x,
            y: item.xy.y + translate.y
          },
          style: item.style,
          id: item.id
        })
        graphClass.toIds = item.toIds
        graphClass.fromIds = item.fromIds
        graphClass.loopIds = item.loopIds

        const TextGraph = graphList[item.label.asName]
        item.label.style = objectMerge(this.style.textGraphStyle, item.label.style)
        item.label.style = dprToGraphStyle(item.label.style, dprIndex)
        const textGraphClass = new TextGraph({
          canvas: this.canvas,
          scaleC: this.scaleC,
          xy: {
            x: graphClass.xy.x,
            y: graphClass.xy.y + item.style.height / 2 + item.label.style.margin[0]
          },
          style: item.label.style,
          content: item.label.content,
          id: item.label.id
        })
        graphClass.label = textGraphClass

        graphClass.formatDataTranslateCb = this.graphFormatDataTranslateCb.bind(this)
        this.graphList.push(graphClass)
      }
    })
    this.data.graphList.forEach(item => {
      if (item.graphType === 'line') {
        if (item.benchmarkType === 2) {
          // 自循环
          const graph = this.graphList.filter(graph => {
            return graph.id === item.fromToId.fromId
          })[0]
          const loopNum = item.loopNum
          let LineClass = null
          const vertex1 = {
            x: graph.xy.x - graph.style.width / 2,
            y: graph.xy.y
          }
          const vertex2 = {
            x: graph.xy.x,
            y: graph.xy.y - loopNum * this.style.loopLineMargin
          }
          const loopLineParmas = this.getLoopLineParmas(vertex1, vertex2)
          const LoopLine = lineList[item.asName]
          item.style = objectMerge(this.style.graphStyle, item.style)
          item.style = dprToLineStyle(item.style, dprIndex)
          LineClass = new LoopLine({
            canvas: this.canvas,
            scaleC: this.scaleC,
            xy: vertex2,
            r: loopLineParmas.r,
            startDeg: loopLineParmas.startDeg,
            endDeg: loopLineParmas.endDeg,
            autoDraw: false,
            allowTranslate: false,
            style: item.style,
            id: item.id
          })
          LineClass.loopNum = loopNum
          LineClass.fromToId = {
            fromId: graph.id,
            toId: graph.id
          }

          const TextGraph = graphList[item.label.asName]
          item.label.style = objectMerge(this.style.textGraphStyle, item.label.style)
          item.label.style = dprToGraphStyle(item.label.style, dprIndex)
          const textGraphClass = new TextGraph({
            canvas: this.canvas,
            scaleC: this.scaleC,
            xy: {
              x: vertex2.x,
              y: vertex2.y - loopLineParmas.r
            },
            style: item.label.style,
            content: item.label.content,
            id: item.label.id
          })
          LineClass.label = textGraphClass

          LineClass.formatDataTranslateCb = this.graphFormatDataTranslateCb.bind(this)
          this.graphList.push(LineClass)
        } else {
          const startGraph = this.graphList.filter(graph => {
            return graph.id === item.fromToId.fromId
          })[0]
          const endGraph = this.graphList.filter(graph => {
            return graph.id === item.fromToId.toId
          })[0]
          const lineNum = item.lineNum
          const k = item.k
          let LineClass = null
          let vertex = []
          const vertex1 = getLineAndGraphIntersection(
            endGraph.style.width / 2,
            null,
            {
              x: startGraph.xy.x,
              y: startGraph.xy.y
            },
            {
              x: endGraph.xy.x,
              y: endGraph.xy.y
            }
          )
          const vertex2 = getLineAndGraphIntersection(
            startGraph.style.width / 2,
            null,
            {
              x: endGraph.xy.x,
              y: endGraph.xy.y
            },
            {
              x: startGraph.xy.x,
              y: startGraph.xy.y
            }
          )
          if (vertex1 && vertex2) {
            if (lineNum) {
              // 多条关联线
              const vertexC = this.getLineCenterOutVertex(vertex1, vertex2, lineNum, k)
              vertex = [vertex1, vertexC, vertex2]
            } else {
              const vertexC = {
                x: (vertex1.x + vertex2.x) / 2,
                y: (vertex1.y + vertex2.y) / 2
              }
              vertex = [vertex1, vertexC, vertex2]
            }
          } else {
            vertex = [
              { x: -999, y: -999 },
              { x: -999, y: -999 },
              { x: -999, y: -999 }
            ]
          }
          const CurLine = lineList[item.asName]
          item.style = objectMerge(this.style.graphStyle, item.style)
          item.style = dprToLineStyle(item.style, dprIndex)
          LineClass = new CurLine({
            canvas: this.canvas,
            scaleC: this.scaleC,
            vertex,
            autoDraw: false,
            allowTranslate: false,
            style: item.style,
            id: item.id
          })
          LineClass.k = k
          LineClass.lineNum = lineNum
          LineClass.fromToId = {
            fromId: startGraph.id,
            toId: endGraph.id
          }

          const TextGraph = graphList[item.label.asName]
          item.label.style = objectMerge(this.style.textGraphStyle, item.label.style)
          item.label.style = dprToGraphStyle(item.label.style, dprIndex)
          const textGraphClass = new TextGraph({
            canvas: this.canvas,
            scaleC: this.scaleC,
            xy: {
              x: LineClass.vertex[1].x,
              y: LineClass.vertex[1].y
            },
            style: item.label.style,
            content: item.label.content,
            id: item.label.id
          })
          LineClass.label = textGraphClass

          LineClass.formatDataTranslateCb = this.graphFormatDataTranslateCb.bind(this)
          this.graphList.push(LineClass)
        }
      }
    })
  }

  addGraphToList(data) {
    if (data.id) {
      const graphList = this.graphList.filter(graph => {
        return graph.graphType === 'graph' && graph.id === data.id
      })
      if (graphList.length) {
        return
      }
    }
    const Graph = this.style.graph
    data.style = objectMerge(this.style.graphStyle, data.style)
    const graphClass = new Graph({
      canvas: data.canvas,
      scaleC: data.scaleC,
      xy: data.xy,
      style: data.style,
      id: data.id
    })
    graphClass.formatDataTranslateCb = this.graphFormatDataTranslateCb.bind(this)
    graphClass.toIds = []
    graphClass.fromIds = []
    graphClass.loopIds = []
    this.graphList.push(graphClass)
    graphClass.draw()

    const TextGraph = this.style.textGraph
    data.textGraphStyle = objectMerge(this.style.textGraphStyle, data.textGraphStyle)
    data.textGraphStyle.margin = convertMorP(data.textGraphStyle.margin)
    const textGraphClass = new TextGraph({
      canvas: data.canvas,
      scaleC: data.scaleC,
      xy: {
        x: data.xy.x,
        y: data.xy.y + data.style.height / 2 + data.textGraphStyle.margin[0]
      },
      style: data.textGraphStyle,
      content: data.text
    })
    graphClass.label = textGraphClass
    textGraphClass.draw()
  }
  delGraphToList() {
    if (this.focusGraphOrLine) {
      if (this.focusGraphOrLine.graphType === 'line') {
        if (this.focusGraphOrLine.benchmarkType === 1) {
          const fromGraph = this.graphList.filter(graph => {
            return graph.id === this.focusGraphOrLine.fromToId.fromId
          })[0]
          const toGraph = this.graphList.filter(graph => {
            return graph.id === this.focusGraphOrLine.fromToId.toId
          })[0]
          const lineNum = this.focusGraphOrLine.lineNum
          this.delLine(this.focusGraphOrLine)
          this.resetGraphLine(fromGraph, toGraph, lineNum)
        } else if (this.focusGraphOrLine.benchmarkType === 2) {
          const graph = this.graphList.filter(graph => {
            return graph.id === this.focusGraphOrLine.fromToId.fromId
          })[0]
          const loopNum = this.focusGraphOrLine.loopNum
          this.delLoopLine(this.focusGraphOrLine)
          this.resetGraphLoopLine(graph, loopNum)
        }
      } else {
        while (this.focusGraphOrLine.fromIds.length) {
          this.delLine(
            this.graphList.filter(line => {
              return line.id === this.focusGraphOrLine.fromIds[0].lineId
            })[0]
          )
        }
        while (this.focusGraphOrLine.toIds.length) {
          this.delLine(
            this.graphList.filter(line => {
              return line.id === this.focusGraphOrLine.toIds[0].lineId
            })[0]
          )
        }
        while (this.focusGraphOrLine.loopIds.length) {
          this.delLoopLine(
            this.graphList.filter(line => {
              return line.id === this.focusGraphOrLine.loopIds[0].lineId
            })[0]
          )
        }
        for (let i = 0; i < this.graphList.length; i++) {
          if (this.graphList[i].id === this.focusGraphOrLine.id) {
            this.graphList.splice(i, 1)
            break
          }
        }
      }
      this.focusGraphOrLineIndex = null
      this.focusGraphOrLine = null
      this.addTask()
    }
  }
  delLine(line) {
    let index = 0
    for (let i = 0; i < this.graphList.length; i++) {
      if (this.graphList[i].graphType === 'graph') {
        if (this.graphList[i].id === line.fromToId.fromId) {
          for (let j = 0; j < this.graphList[i].toIds.length; j++) {
            if (this.graphList[i].toIds[j].lineId === line.id) {
              this.graphList[i].toIds.splice(j, 1)
              break
            }
          }
        }
        if (this.graphList[i].id === line.fromToId.toId) {
          for (let j = 0; j < this.graphList[i].fromIds.length; j++) {
            if (this.graphList[i].fromIds[j].lineId === line.id) {
              this.graphList[i].fromIds.splice(j, 1)
              break
            }
          }
        }
      } else if (this.graphList[i].id === line.id) {
        index = i
      }
    }
    this.graphList.splice(index, 1)
  }
  resetGraphLine(fromGraph, toGraph, lineNum) {
    let lineArr = this.graphList.filter(graph => {
      return graph.graphType === 'line' && graph.fromToId.fromId === fromGraph.id && graph.fromToId.toId === toGraph.id
    })
    lineArr = lineArr.concat(
      this.graphList.filter(graph => {
        return graph.graphType === 'line' && graph.fromToId.fromId === toGraph.id && graph.fromToId.toId === fromGraph.id
      })
    )
    lineArr.forEach(line => {
      if (line.lineNum > lineNum) {
        line.lineNum -= 1
        const vertex1 = line.vertex[0]
        const vertex2 = line.vertex[2]
        let vertex = []
        if (vertex1 && vertex2) {
          if (line.lineNum) {
            // 多条关联线
            const vertexC = this.getLineCenterOutVertex(vertex1, vertex2, line.lineNum, line.k)
            vertex = [vertex1, vertexC, vertex2]
          } else {
            const vertexC = {
              x: (vertex1.x + vertex2.x) / 2,
              y: (vertex1.y + vertex2.y) / 2
            }
            vertex = [vertex1, vertexC, vertex2]
          }
        } else {
          vertex = [
            { x: -999, y: -999 },
            { x: -999, y: -999 },
            { x: -999, y: -999 }
          ]
        }
        line.vertex = vertex
        line.curveVertex = getCurveVertex(line.vertex, 0.4)

        line.label &&
          line.label.formatDataTranslate({
            x: line.vertex[1].x - line.label.xy.x,
            y: line.vertex[1].y - line.label.xy.y
          })
      }
    })
  }
  delLoopLine(line) {
    let index = 0
    for (let i = 0; i < this.graphList.length; i++) {
      if (this.graphList[i].graphType === 'graph') {
        if (this.graphList[i].id === line.fromToId.fromId) {
          for (let j = 0; j < this.graphList[i].loopIds.length; j++) {
            if (this.graphList[i].loopIds[j].lineId === line.id) {
              this.graphList[i].loopIds.splice(j, 1)
              break
            }
          }
        }
      } else if (this.graphList[i].id === line.id) {
        index = i
      }
    }
    this.graphList.splice(index, 1)
  }
  resetGraphLoopLine(graphC, loopNum) {
    const lineArr = this.graphList.filter(graph => {
      return graph.graphType === 'line' && graph.fromToId.fromId === graphC.id
    })
    lineArr.forEach(line => {
      if (line.loopNum > loopNum) {
        line.loopNum -= 1
        const vertex1 = {
          x: graphC.xy.x - graphC.style.width / 2,
          y: graphC.xy.y
        }
        const vertex2 = {
          x: graphC.xy.x,
          y: graphC.xy.y - line.loopNum * this.style.loopLineMargin
        }
        const loopLineParmas = this.getLoopLineParmas(vertex1, vertex2)
        line.xy = vertex2
        line.r = loopLineParmas.r
        line.startDeg = loopLineParmas.startDeg
        line.endDeg = loopLineParmas.endDeg
        line.vertex = getArcVertex(line.xy, line.r, line.startDeg, line.endDeg, 1)

        line.label &&
          line.label.formatDataTranslate({
            x: vertex2.x - line.label.xy.x,
            y: vertex2.y - loopLineParmas.r - line.label.xy.y
          })
      }
    })
  }
  creatLineStart() {
    const DashedLine = this.style.dashedLine
    this.creatLine = new DashedLine({
      canvas: this.canvas,
      scaleC: this.scaleC,
      vertex: [
        {
          x: this.focusGraphOrLine.xy.x,
          y: this.focusGraphOrLine.xy.y
        },
        {
          x: this.focusGraphOrLine.xy.x,
          y: this.focusGraphOrLine.xy.y
        }
      ],
      autoDraw: false,
      style: this.style.dashedLineStyle
    })
    this.creatLine.fromId = this.focusGraphOrLine.id
    this.creatLineStartGraph = this.focusGraphOrLine
  }
  creatLineAddGraphList(data) {
    if (this.creatLineEndGraph) {
      if (this.creatLineEndGraph.id === this.creatLineStartGraph.id) {
        // 自循环
        const loopNum = this.creatLineEndGraph.loopIds.length + 1
        let LineClass = null
        const vertex1 = {
          x: this.creatLineEndGraph.xy.x - this.creatLineEndGraph.style.width / 2,
          y: this.creatLineEndGraph.xy.y
        }
        const vertex2 = {
          x: this.creatLineEndGraph.xy.x,
          y: this.creatLineEndGraph.xy.y - loopNum * this.style.loopLineMargin
        }
        const loopLineParmas = this.getLoopLineParmas(vertex1, vertex2)
        const LoopLine = this.style.loopLine
        LineClass = new LoopLine({
          canvas: this.canvas,
          scaleC: this.scaleC,
          xy: vertex2,
          r: loopLineParmas.r,
          startDeg: loopLineParmas.startDeg,
          endDeg: loopLineParmas.endDeg,
          autoDraw: false,
          allowTranslate: false,
          style: objectMerge(this.style.curLineStyle, data.style),
          id: data.id
        })
        LineClass.loopNum = loopNum
        LineClass.fromToId = {
          fromId: this.creatLineEndGraph.id,
          toId: this.creatLineEndGraph.id
        }
        LineClass.formatDataTranslateCb = this.graphFormatDataTranslateCb.bind(this)
        this.graphList.push(LineClass)

        this.creatLineEndGraph.loopIds.push({
          lineId: LineClass.id
        })

        const TextGraph = this.style.textGraph
        data.textGraphStyle = objectMerge(this.style.textGraphStyle, data.textGraphStyle)
        const textGraphClass = new TextGraph({
          canvas: data.canvas,
          scaleC: data.scaleC,
          xy: {
            x: vertex2.x,
            y: vertex2.y - loopLineParmas.r
          },
          style: data.textGraphStyle,
          content: data.text
        })
        LineClass.label = textGraphClass
      } else {
        let lineNum = 0
        let k = 1
        let LineClass = null
        let vertex = []
        if (this.creatLineStartGraph.fromIds) {
          this.creatLineStartGraph.fromIds.forEach(fromId => {
            if (fromId.graphId === this.creatLineEndGraph.id) {
              ++lineNum
            }
          })
        }
        if (this.creatLineStartGraph.toIds) {
          this.creatLineStartGraph.toIds.forEach(toId => {
            if (toId.graphId === this.creatLineEndGraph.id) {
              ++lineNum
            }
          })
        }
        const vertex1 = getLineAndGraphIntersection(
          this.creatLineEndGraph.style.width / 2,
          null,
          {
            x: this.creatLineStartGraph.xy.x,
            y: this.creatLineStartGraph.xy.y
          },
          {
            x: this.creatLineEndGraph.xy.x,
            y: this.creatLineEndGraph.xy.y
          }
        )
        const vertex2 = getLineAndGraphIntersection(
          this.creatLineStartGraph.style.width / 2,
          null,
          {
            x: this.creatLineEndGraph.xy.x,
            y: this.creatLineEndGraph.xy.y
          },
          {
            x: this.creatLineStartGraph.xy.x,
            y: this.creatLineStartGraph.xy.y
          }
        )
        if (vertex1 && vertex2) {
          if (lineNum) {
            // 多条关联线
            for (let i = 0; i < this.graphList.length; i++) {
              if (this.graphList[i].graphType === 'line') {
                if (this.graphList[i].fromToId.fromId === this.creatLineStartGraph.id && this.graphList[i].fromToId.toId === this.creatLineEndGraph.id) {
                  k = 1
                  break
                } else if (this.graphList[i].fromToId.fromId === this.creatLineEndGraph.id && this.graphList[i].fromToId.toId === this.creatLineStartGraph.id) {
                  k = -1
                  break
                }
              }
            }
            const vertexC = this.getLineCenterOutVertex(vertex1, vertex2, lineNum, k)
            vertex = [vertex1, vertexC, vertex2]
          } else {
            const vertexC = {
              x: (vertex1.x + vertex2.x) / 2,
              y: (vertex1.y + vertex2.y) / 2
            }
            vertex = [vertex1, vertexC, vertex2]
          }
        } else {
          vertex = [
            { x: -999, y: -999 },
            { x: -999, y: -999 },
            { x: -999, y: -999 }
          ]
        }
        const CurLine = this.style.curLine
        LineClass = new CurLine({
          canvas: this.canvas,
          scaleC: this.scaleC,
          vertex,
          autoDraw: false,
          allowTranslate: false,
          style: objectMerge(this.style.curLineStyle, data.style),
          id: data.id
        })
        LineClass.k = k
        LineClass.lineNum = lineNum
        LineClass.fromToId = {
          fromId: this.creatLine.fromId,
          toId: this.creatLineEndGraph.id
        }
        LineClass.formatDataTranslateCb = this.graphFormatDataTranslateCb.bind(this)
        this.graphList.push(LineClass)

        this.creatLineStartGraph.toIds.push({
          lineId: LineClass.id,
          graphId: this.creatLineEndGraph.id
        })
        this.creatLineEndGraph.fromIds.push({
          lineId: LineClass.id,
          graphId: this.creatLineStartGraph.id
        })

        const TextGraph = this.style.textGraph
        data.textGraphStyle = objectMerge(this.style.textGraphStyle, data.textGraphStyle)
        const textGraphClass = new TextGraph({
          canvas: data.canvas,
          scaleC: data.scaleC,
          xy: {
            x: LineClass.vertex[1].x,
            y: LineClass.vertex[1].y
          },
          style: data.textGraphStyle,
          content: data.text
        })
        LineClass.label = textGraphClass
      }
    }

    this.creatLineStartGraph = null
    this.creatLineEndGraph = null

    this.addTask()
  }
  getLineCenterOutVertex(vertex1, vertex2, num, k) {
    let index = 1
    const width = this.style.lineMargin
    if (num % 2) {
      // 偶数，下方
      index *= (num + 1) / -2
    } else {
      // 奇数，上方
      index *= num / 2
    }
    const vertexCenter = {
      x: (vertex1.x + vertex2.x) / 2,
      y: (vertex1.y + vertex2.y) / 2
    }

    const deg = Math.atan2(vertex1.x - vertex2.x, vertex1.y - vertex2.y)
    const x = vertexCenter.x + Math.sin(deg - Math.PI / 2) * width * index * k
    const y = vertexCenter.y + Math.cos(deg - Math.PI / 2) * width * index * k

    return { x, y }
  }
  getLoopLineParmas(vertex1, vertex2) {
    const bw = Math.abs(vertex2.x - vertex1.x)
    const bh = Math.abs(vertex2.y - vertex1.y)
    const r = Math.sqrt(Math.pow(bw, 2) + Math.pow(bh, 2))
    const deg = Math.atan2(bw, bh)
    const endDeg = Math.PI - deg
    const startDeg = -endDeg
    return { r, startDeg, endDeg }
  }

  formatDataTranslate({ x, y }) {
    this.graphList.forEach(graph => {
      graph.formatDataTranslate({ x, y })
    })
    this.creatLine && this.creatLine.formatDataTranslate({ x, y })
  }
  graphFormatDataTranslateCb(that, { x, y }) {
    that.label && that.label.formatDataTranslate({ x, y })
    if (!this.focusGraphOrLine || that.graphType === 'line') {
      return
    }
    this.graphList.forEach(graph => {
      if (graph.graphType === 'line' && (graph.fromToId.fromId === that.id || graph.fromToId.toId === that.id)) {
        if (graph.benchmarkType === 1) {
          let vertex1 = null
          let vertex2 = null
          if (graph.fromToId.fromId === that.id) {
            const toGraph = this.graphList.filter(toGraph => {
              return toGraph.id === graph.fromToId.toId
            })[0]
            vertex1 = getLineAndGraphIntersection(
              that.style.width / 2,
              null,
              {
                x: that.xy.x,
                y: that.xy.y
              },
              {
                x: toGraph.xy.x,
                y: toGraph.xy.y
              }
            )
            vertex2 = getLineAndGraphIntersection(
              toGraph.style.width / 2,
              null,
              {
                x: toGraph.xy.x,
                y: toGraph.xy.y
              },
              {
                x: that.xy.x,
                y: that.xy.y
              }
            )
          }
          if (graph.fromToId.toId === that.id) {
            const fromGraph = this.graphList.filter(fromGraph => {
              return fromGraph.id === graph.fromToId.fromId
            })[0]
            vertex1 = getLineAndGraphIntersection(
              that.style.width / 2,
              null,
              {
                x: fromGraph.xy.x,
                y: fromGraph.xy.y
              },
              {
                x: that.xy.x,
                y: that.xy.y
              }
            )
            vertex2 = getLineAndGraphIntersection(
              fromGraph.style.width / 2,
              null,
              {
                x: that.xy.x,
                y: that.xy.y
              },
              {
                x: fromGraph.xy.x,
                y: fromGraph.xy.y
              }
            )
          }
          if (vertex1 && vertex2) {
            let vertexC = {}
            if (graph.lineNum) {
              vertexC = this.getLineCenterOutVertex(vertex1, vertex2, graph.lineNum, graph.k)
            } else {
              vertexC = {
                x: (vertex1.x + vertex2.x) / 2,
                y: (vertex1.y + vertex2.y) / 2
              }
            }
            graph.vertex = [vertex1, vertexC, vertex2]
          } else {
            graph.vertex = [
              { x: -999, y: -999 },
              { x: -999, y: -999 },
              { x: -999, y: -999 }
            ]
          }
          graph.curveVertex = getCurveVertex(graph.vertex, 0.4)

          graph.label &&
            graph.label.formatDataTranslate({
              x: graph.vertex[1].x - graph.label.xy.x,
              y: graph.vertex[1].y - graph.label.xy.y
            })
        } else if (graph.benchmarkType === 2) {
          graph.formatDataTranslate({ x, y })
        }
      }
    })
  }
  formatDataScale() {
    this.graphList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
      graph.label && graph.label.formatDataScale(this.scaleC)
    })
    this.creatLine && this.creatLine.formatDataScale(this.scaleC)
  }

  draw() {
    this.graphList.forEach(graph => {
      graph.draw()
      graph.label && graph.label.draw()
    })
    this.creatLine && this.creatLine.draw()
  }

  save() {
    return {
      objData: this.getSaveObjData()
    }
  }
  getSaveObjData() {
    const saveData = {
      centerXY: {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2
      },
      dpr: this.dpr,
      graphList: [],
      scaleCIndex: this.scaleCIndex
    }
    this.graphList.forEach(item => {
      const graph = {
        asName: item.constructor.asName,
        id: item.id,
        style: item.style
      }
      if (item.graphType === 'graph') {
        graph.graphType = 'graph'
        graph.xy = item.xy
        graph.fromIds = item.fromIds
        graph.toIds = item.toIds
        graph.loopIds = item.loopIds
      } else {
        graph.graphType = 'line'
        graph.fromToId = item.fromToId
        graph.benchmarkType = item.benchmarkType
        if (item.benchmarkType === 2) {
          graph.loopNum = item.loopNum
        } else {
          graph.k = item.k
          graph.lineNum = item.lineNum
        }
      }
      graph.label = {
        asName: item.label.constructor.asName,
        id: item.label.id,
        style: item.label.style,
        xy: item.label.xy,
        content: item.label.content
      }
      saveData.graphList.push(graph)
    })
    return saveData
  }

  hijackMousemoveCb(focusGraphOrLine, xy) {
    if (this.creatLine) {
      this.creatLine.vertex[1] = xy
      this.addTask()
    }
  }
  hijackMouseupBtn0Cb(xy) {
    if (this.creatLine) {
      if (this.focusGraphOrLine && this.focusGraphOrLine.asName === this.style.graph.asName) {
        this.creatLineEndGraph = this.focusGraphOrLine
        this.initCreatLineCb()
      } else {
        this.creatLineStartGraph = null
      }
      this.creatLine = null
      this.addTask()
    }
    this.mouseupBtn0NextCb && this.mouseupBtn0NextCb(xy, this.focusGraphOrLine)
  }
  hijackMouseupBtn2Cb(xy) {
    this.mouseupBtn2NextCb && this.mouseupBtn2NextCb(xy, this.focusGraphOrLine)
  }
}
