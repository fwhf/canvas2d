/*
  wanghuijie

  配置解读
  canvas 目标渲染dom
  dpr 画图清晰度 默认取值window.devicePixelRatio
  data 数据 详细格式见下

  autoDraw 是否自动绘制 布尔值 默认true
  autoScale 自动缩放 布尔值 默认开启，图形整体中心居中绘制,若图形宽/高超出绘制区域时自动缩放
  graphInterval: 图间距 数字 默认值：图形宽度

  node数据格式
  [{
    value: '图形内文案',
    uuid: '关系唯一标识'
    style: {}
  }]
  path数据格式
  [{
    fromUuid: '关系唯一标识,来源',
    toUuid: '关系唯一标识,去向'
  }]
*/
import View from '../view'
import { dpr, echoWarn, getType, objectMerge, convertMorP, getLineAndGraphIntersection, vertexInGraph } from '../../util/helper.js'
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
  iconGraph: 'ArcGraph',
  iconGraphShow: true,
  iconGraphStyle: {
    width: 30 * dpr,
    height: 30 * dpr,
    padding: 10 * dpr,
    position: {
      top: 10 * dpr,
      left: 10 * dpr
    },
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
      globalAlpha: 0.4,
      text: {
        globalAlpha: 0.4,
        lineHeight: 18 * dpr,
        fontSize: 14 * dpr,
        color: '#000000',
        textAlign: 'left',
        fontWight: 'normal',
        fontFamily: 'PingFang SC'
      }
    }
  },
  line: 'UnidirectionalLine',
  lineStyle: {
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
  loopGraph: 'EllipseGraph',
  loopGraphStyle: {
    width: 60 * dpr,
    height: 30 * dpr,
    padding: 0,
    strokeWidth: 1 * dpr,
    strokeColor: '#333333',
    fillColor: 'transparent',
    globalAlpha: 1
  },
  r: 80 * dpr
}

export default class NodeRelation extends View {
  constructor(opt) {
    super(opt)
    this.optNodes = getType(opt.nodes) === 'Array' ? opt.nodes : []
    this.optPaths = getType(opt.paths) === 'Array' ? opt.paths : []

    this.autoDraw = getType(opt.autoDraw) === 'Boolean' ? opt.autoDraw : true
    this.style = objectMerge(style, opt.style)

    this.repulsionFlag = getType(opt.repulsionFlag) === 'Boolean' ? opt.repulsionFlag : false
    this.againRepulsionLevel = getType(opt.againRepulsionLevel) === 'Number' ? opt.againRepulsionLevel : 3

    this.init()
  }
  init() {
    super.init()
    if (!this.optNodes.length) {
      echoWarn('未传入数据或数据为空')
      return
    }

    this.style.margin = convertMorP(this.style.margin)
    this.style.graph = graphList[this.style.graph]
    this.style.iconGraph = graphList[this.style.iconGraph]
    this.style.line = lineList[this.style.line]
    this.style.loopGraph = graphList[this.style.loopGraph]

    console.log(this.optNodes, 'optNodes')
    console.log(this.optPaths, 'optPaths')

    this.nodeRelation()
    this.splitGraph()
    this.graphArr.forEach((graphItem, index) => {
      if (index === this.graphArr.length - 1) {
        this.regularGraphDataXY(graphItem)
      } else {
        this.searchCenterNode(graphItem)
        this.computedNodeWeight([this.centerNode], graphItem)
        this.setDataXY([{ deg: 0, node: this.centerNode }], graphItem)
        this.againRepulsion(graphItem)
      }
    })

    this.layout()

    this.initGraphList()

    this.draw()
    if (this.eventFlag) {
      super.addEvent()
    }
  }
  nodeRelation() {
    this.optNodes.forEach(item => {
      item.style = objectMerge(this.style, item.style)
      item.relationNum = 0
      item.selfLoop = 0
      // 去往哪个node
      item.toNode = []
      // 来源哪个node
      item.fromNode = []
    })
    this.optPaths.forEach(link => {
      if (link.fromUuid === link.toUuid) {
        const node = this.optNodes.filter(node => {
          return node.uuid === link.fromUuid
        })[0]
        node.selfLoop += 1
      } else {
        const fromNode = this.optNodes.filter(node => {
          return node.uuid === link.fromUuid
        })[0]
        let toNodeIndexOf = -1
        for (let i = 0; i < fromNode.toNode.length; i++) {
          if (fromNode.toNode[i].uuid === link.toUuid) {
            toNodeIndexOf = i
            break
          }
        }
        if (toNodeIndexOf > -1) {
          fromNode.toNode[toNodeIndexOf].num += 1
        } else {
          fromNode.relationNum += 1
          fromNode.toNode.push({
            uuid: link.toUuid,
            num: 1
          })
        }
        const toNode = this.optNodes.filter(node => {
          return node.uuid === link.toUuid
        })[0]
        let fromNodeIndexOf = -1
        for (let i = 0; i < toNode.fromNode.length; i++) {
          if (toNode.fromNode[i].uuid === link.fromUuid) {
            fromNodeIndexOf = i
            break
          }
        }
        if (fromNodeIndexOf > -1) {
          toNode.fromNode[fromNodeIndexOf].num += 1
        } else {
          toNode.relationNum += 1
          toNode.fromNode.push({
            uuid: link.fromUuid,
            num: 1
          })
        }
      }
    })
  }
  splitGraph() {
    this.graphArr = []
    this.optNodes.forEach(node => {
      let addGraphArr = true
      for (let i = 0; i < this.graphArr.length; i++) {
        for (let j = 0; j < this.graphArr[i].length; j++) {
          if (this.graphArr[i][j].uuid === node.uuid) {
            addGraphArr = false
            break
          }
        }
        if (!addGraphArr) {
          break
        }
      }
      if (addGraphArr) {
        this.graphArr.push([node])
        this.nodeAddGraphArr(this.graphArr[this.graphArr.length - 1])
      }
    })
    const aloneNode = []
    for (let i = this.graphArr.length - 1; i >= 0; i--) {
      if (this.graphArr[i].length === 1) {
        aloneNode.push(this.graphArr[i][0])
        this.graphArr.splice(i, 1)
      }
    }
    this.graphArr.push(aloneNode)
  }
  nodeAddGraphArr(nodeArr) {
    nodeArr.forEach(node => {
      const relationNode = []
      node.fromNode.forEach(fromNode => {
        const hasNode = this.graphArr[this.graphArr.length - 1].filter(optNode => {
          return optNode.uuid === fromNode.uuid
        })[0]
        if (!hasNode) {
          const curNode = this.optNodes.filter(optNode => {
            return optNode.uuid === fromNode.uuid
          })[0]
          relationNode.push(curNode)
        }
      })
      node.toNode.forEach(toNode => {
        const hasNode = this.graphArr[this.graphArr.length - 1].filter(optNode => {
          return optNode.uuid === toNode.uuid
        })[0]
        if (!hasNode) {
          const curNode = this.optNodes.filter(optNode => {
            return optNode.uuid === toNode.uuid
          })[0]
          relationNode.push(curNode)
        }
      })
      if (relationNode.length) {
        this.graphArr[this.graphArr.length - 1] = this.graphArr[this.graphArr.length - 1].concat(relationNode)
        this.nodeAddGraphArr(relationNode)
      }
    })
  }
  searchCenterNode(graphItem) {
    this.centerNode = graphItem[0]
    graphItem.forEach(item => {
      if (item.relationNum > this.centerNode.relationNum) {
        this.centerNode = item
      }
    })
    this.centerNode.weight = 1
    this.centerNode.x = this.canvas.width / 2
    this.centerNode.y = this.canvas.height / 2
  }
  computedNodeWeight(nodeArr, graphItem) {
    // 广度优先
    const newNodeArr = []
    nodeArr.forEach(node => {
      if (node) {
        node.fromNode.forEach(fromNode => {
          const curNode = graphItem.filter(optNode => {
            return optNode.uuid === fromNode.uuid
          })[0]
          if (!curNode.weight) {
            curNode.weight = 1
            newNodeArr.push(curNode)
          } else {
            newNodeArr.push(null)
          }
        })
        node.toNode.forEach(toNode => {
          const curNode = graphItem.filter(optNode => {
            return optNode.uuid === toNode.uuid
          })[0]
          if (!curNode.weight) {
            curNode.weight = 1
            newNodeArr.push(curNode)
          } else {
            newNodeArr.push(null)
          }
        })
      }
    })
    if (newNodeArr.length) {
      this.computedNodeWeight(newNodeArr, graphItem)
      let i = 0
      nodeArr.forEach(node => {
        if (node) {
          node.fromNode.forEach(fromNode => {
            if (newNodeArr[i]) {
              const curNode = graphItem.filter(optNode => {
                return optNode.uuid === fromNode.uuid
              })[0]
              node.weight += curNode.weight
            }
            i++
          })
          node.toNode.forEach(toNode => {
            if (newNodeArr[i]) {
              const curNode = graphItem.filter(optNode => {
                return optNode.uuid === toNode.uuid
              })[0]
              node.weight += curNode.weight
            }
            i++
          })
        }
      })
    }
    return nodeArr
  }
  setDataXY(nodeArr, graphItem) {
    const newNodeArr = []
    nodeArr.forEach(item => {
      if (item.parentUuid) {
        let uuidIndex = -1
        for (let i = 0; i < item.node.fromNode.length; i++) {
          if (item.node.fromNode[i].uuid === item.parentUuid) {
            uuidIndex = i
            break
          }
        }
        if (uuidIndex === -1) {
          for (let i = 0; i < item.node.toNode.length; i++) {
            if (item.node.toNode[i].uuid === item.parentUuid) {
              uuidIndex = i + item.node.fromNode.length
              break
            }
          }
        }
        item.deg -= (uuidIndex / item.node.relationNum) * 360
      }

      item.node.fromNode.forEach((fromNode, index) => {
        const curNode = graphItem.filter(optNode => {
          return optNode.uuid === fromNode.uuid
        })[0]
        if (!curNode.x) {
          let nodeDeg = (index / item.node.relationNum) * 360
          if (item.node.relationNum < 3) {
            nodeDeg = index * 120
          }
          nodeDeg = (nodeDeg + item.deg) % 360
          const nodePI = (nodeDeg / 180) * Math.PI
          let repulsionIndex = 1
          if (this.repulsionFlag) {
            repulsionIndex += item.node.weight / (this.centerNode.weight / 2)
          }
          curNode.x = item.node.x + this.style.r * repulsionIndex * Math.sin(nodePI)
          curNode.y = item.node.y + this.style.r * repulsionIndex * Math.cos(nodePI)

          newNodeArr.push({
            deg: nodeDeg + 180,
            parentUuid: item.node.uuid,
            node: curNode
          })
        }
      })
      item.node.toNode.forEach((toNode, index) => {
        const curNode = graphItem.filter(optNode => {
          return optNode.uuid === toNode.uuid
        })[0]
        if (!curNode.x) {
          let nodeDeg = ((index + item.node.fromNode.length) / item.node.relationNum) * 360
          if (item.node.relationNum < 3) {
            nodeDeg = (index + item.node.fromNode.length) * 120
          }
          nodeDeg = (nodeDeg + item.deg) % 360
          const nodePI = (nodeDeg / 180) * Math.PI
          // const repulsionIndex = curNode.weight
          let repulsionIndex = 1
          if (this.repulsionFlag) {
            repulsionIndex += item.node.weight / (this.centerNode.weight / 2)
          }
          curNode.x = item.node.x + this.style.r * repulsionIndex * Math.sin(nodePI)
          curNode.y = item.node.y + this.style.r * repulsionIndex * Math.cos(nodePI)

          newNodeArr.push({
            deg: nodeDeg + 180,
            parentUuid: item.node.uuid,
            node: curNode
          })
        }
      })
    })

    if (newNodeArr.length) {
      this.setDataXY(newNodeArr, graphItem)
    }
  }
  againRepulsion(graphItem) {
    graphItem.forEach(node => {
      if (node.x) {
        const otherNodes = []
        graphItem.forEach(otherNode => {
          if (
            otherNode.x &&
            node.uuid !== otherNode.uuid &&
            vertexInGraph(
              {
                x: otherNode.x,
                y: otherNode.y
              },
              {
                x: node.x,
                y: node.y
              },
              null,
              node.style.r,
              null
            )
          ) {
            otherNodes.push(otherNode)
          }
        })
        if (otherNodes.length) {
          this.repulsionDataXY(node, otherNodes, graphItem)
        }
      }
    })
  }
  repulsionDataXY(node, otherNodes, graphItem, level = 0) {
    otherNodes.forEach(nodeItem => {
      const l = Math.sqrt(Math.pow(nodeItem.x - node.x, 2) + Math.pow(nodeItem.y - node.y, 2))
      nodeItem.x = node.x + (node.style.r / l) * (nodeItem.x - node.x)
      nodeItem.y = node.y + (node.style.r / l) * (nodeItem.y - node.y)
      if (level < this.againRepulsionLevel) {
        const newOtherNodes = []
        graphItem.forEach(otherNode => {
          if (
            otherNode.x &&
            nodeItem.uuid !== otherNode.uuid &&
            vertexInGraph(
              {
                x: otherNode.x,
                y: otherNode.y
              },
              {
                x: nodeItem.x,
                y: nodeItem.y
              },
              null,
              nodeItem.style.r,
              null
            )
          ) {
            newOtherNodes.push(otherNode)
          }
        })
        if (newOtherNodes.length) {
          this.repulsionDataXY(nodeItem, newOtherNodes, graphItem, level + 1)
        }
      }
    })
  }
  regularGraphDataXY(graphItem) {
    const edgeI = Math.ceil(Math.sqrt(graphItem.length))
    let startY = this.canvas.height / 2
    let startX = this.canvas.width / 2
    if (edgeI % 2) {
      const graphWidth = Math.floor(edgeI / 2) * this.style.r
      startY -= graphWidth
      startX -= graphWidth
    } else {
      const graphWidth = (Math.floor(edgeI / 2) - 0.5) * this.style.r
      startY -= graphWidth
      startX -= graphWidth
    }

    graphItem.forEach((node, index) => {
      node.x = startX + (index % edgeI) * this.style.r
      node.y = startY + Math.floor(index / edgeI) * this.style.r
    })
  }

  layout() {
    const centerWidth = this.canvas.width / 2
    let rightX = centerWidth
    let leftX = centerWidth
    this.graphArr.forEach((graphItem, index) => {
      let graphRightX = centerWidth
      let graphLeftX = centerWidth
      graphItem.forEach(node => {
        if (node.x > graphRightX) {
          graphRightX = node.x
        }
        if (node.x < graphLeftX) {
          graphLeftX = node.x
        }
      })
      if (index === 0) {
        rightX = graphRightX
        leftX = graphLeftX
      } else if (index % 2) {
        rightX += this.style.r
        const translateX = rightX - graphLeftX
        graphItem.forEach(node => {
          node.x += translateX
        })
        rightX += graphRightX - graphLeftX
      } else {
        leftX -= this.style.r
        const translateX = leftX - graphRightX
        graphItem.forEach(node => {
          node.x += translateX
        })
        leftX -= graphRightX - graphLeftX
      }
    })
  }

  initGraphList() {
    const Graph = this.style.graph
    const Line = this.style.line
    const LoopGraph = this.style.loopGraph
    this.graphList = []
    this.optNodes.forEach(node => {
      if (node.x) {
        node.graphClass = new Graph({
          canvas: this.canvas,
          scaleC: this.scaleC,
          xy: {
            x: node.x,
            y: node.y
          },
          autoDraw: false,
          content: node.uuid + '',
          style: node.style.graphStyle,
          relationFromLine: [],
          relationToLine: [],
          relationLoopGraph: [],
          zIndex: 2,
          id: node.uuid
        })
        node.graphClass.formatDataTranslateCb = this.graphFormatDataTranslateCb.bind(this)
        this.graphList.push(node.graphClass)
        node.fromNode.forEach(fromNode => {
          const curNode = this.optNodes.filter(optNode => {
            return optNode.uuid === fromNode.uuid
          })[0]
          let line = this.graphList.filter(line => {
            return line.id === curNode.uuid + '-fwhf2-' + node.uuid
          })[0]
          if (!line) {
            let vertex1 = getLineAndGraphIntersection(
              node.style.graphStyle.width / 2,
              null,
              {
                x: node.x,
                y: node.y
              },
              {
                x: curNode.x,
                y: curNode.y
              }
            )
            let vertex2 = getLineAndGraphIntersection(
              node.style.graphStyle.width / 2,
              null,
              {
                x: curNode.x,
                y: curNode.y
              },
              {
                x: node.x,
                y: node.y
              }
            )
            if (!vertex1 || !vertex2) {
              vertex1 = { x: 0, y: 0 }
              vertex2 = { x: 0, y: 0 }
            }
            line = new Line({
              canvas: this.canvas,
              scaleC: this.scaleC,
              vertex: [vertex2, vertex1],
              autoDraw: false,
              style: this.style.lineStyle,
              allowTranslate: false,
              zIndex: 1,
              id: curNode.uuid + '-fwhf2-' + node.uuid
            })
            this.graphList.push(line)
          }
          node.graphClass.opt.relationFromLine.push({ index: 0, line })
        })
        node.toNode.forEach(toNode => {
          const curNode = this.optNodes.filter(optNode => {
            return optNode.uuid === toNode.uuid
          })[0]
          let line = this.graphList.filter(line => {
            return line.id === node.uuid + '-fwhf2-' + curNode.uuid
          })[0]
          if (!line) {
            let vertex1 = getLineAndGraphIntersection(
              node.style.graphStyle.width / 2,
              null,
              {
                x: node.x,
                y: node.y
              },
              {
                x: curNode.x,
                y: curNode.y
              }
            )
            let vertex2 = getLineAndGraphIntersection(
              node.style.graphStyle.width / 2,
              null,
              {
                x: curNode.x,
                y: curNode.y
              },
              {
                x: node.x,
                y: node.y
              }
            )
            if (!vertex1 || !vertex2) {
              vertex1 = { x: 0, y: 0 }
              vertex2 = { x: 0, y: 0 }
            }
            line = new Line({
              canvas: this.canvas,
              scaleC: this.scaleC,
              vertex: [vertex1, vertex2],
              autoDraw: false,
              style: this.style.lineStyle,
              allowTranslate: false,
              zIndex: 1,
              id: node.uuid + '-fwhf2-' + curNode.uuid
            })
            this.graphList.push(line)
          }
          node.graphClass.opt.relationToLine.push({ index: 1, line })
        })
        if (node.selfLoop) {
          // 自循环曲线
          const loop = new LoopGraph({
            canvas: this.canvas,
            scaleC: this.scaleC,
            xy: {
              x: node.x,
              y: node.y + node.style.graphStyle.height / 2
            },
            autoDraw: false,
            style: this.style.loopGraphStyle,
            zIndex: 1,
            id: node.uuid
          })
          this.graphList.push(loop)
          node.graphClass.opt.relationLoopGraph.push(loop)
        }
      }
    })
    this.graphList.sort((a, b) => {
      return a.zIndex - b.zIndex
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
    this.graphList.forEach(graph => {
      graph.draw()
    })
  }

  graphFormatDataTranslateCb(that, { x, y }) {
    if (!this.focusGraphOrLine) {
      return
    }
    this.focusGraphOrLine.opt.relationFromLine.forEach(line => {
      const nodeId = line.line.id.split('-fwhf2-')
      const curNode = this.optNodes.filter(optNode => {
        return optNode.uuid + '' === nodeId[0]
      })[0]
      const vertex1 = getLineAndGraphIntersection(
        this.focusGraphOrLine.style.width / 2,
        null,
        {
          x: this.focusGraphOrLine.xy.x,
          y: this.focusGraphOrLine.xy.y
        },
        {
          x: curNode.graphClass.xy.x,
          y: curNode.graphClass.xy.y
        }
      )
      const vertex2 = getLineAndGraphIntersection(
        this.focusGraphOrLine.style.width / 2,
        null,
        {
          x: curNode.graphClass.xy.x,
          y: curNode.graphClass.xy.y
        },
        {
          x: this.focusGraphOrLine.xy.x,
          y: this.focusGraphOrLine.xy.y
        }
      )
      if (!vertex1 || !vertex2) {
        line.line.vertex = [
          { x: 0, y: 0 },
          { x: 0, y: 0 }
        ]
      } else {
        line.line.vertex = [vertex2, vertex1]
      }
    })
    this.focusGraphOrLine.opt.relationToLine.forEach(line => {
      const nodeId = line.line.id.split('-fwhf2-')
      const curNode = this.optNodes.filter(optNode => {
        return optNode.uuid + '' === nodeId[1]
      })[0]
      const vertex1 = getLineAndGraphIntersection(
        this.focusGraphOrLine.style.width / 2,
        null,
        {
          x: this.focusGraphOrLine.xy.x,
          y: this.focusGraphOrLine.xy.y
        },
        {
          x: curNode.graphClass.xy.x,
          y: curNode.graphClass.xy.y
        }
      )
      const vertex2 = getLineAndGraphIntersection(
        this.focusGraphOrLine.style.width / 2,
        null,
        {
          x: curNode.graphClass.xy.x,
          y: curNode.graphClass.xy.y
        },
        {
          x: this.focusGraphOrLine.xy.x,
          y: this.focusGraphOrLine.xy.y
        }
      )
      if (!vertex1 || !vertex2) {
        line.line.vertex = [
          { x: 0, y: 0 },
          { x: 0, y: 0 }
        ]
      } else {
        line.line.vertex = [vertex1, vertex2]
      }
    })
    this.focusGraphOrLine.opt.relationLoopGraph.forEach(graph => {
      graph.formatDataTranslate({ x, y })
    })
  }
}
