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
  margin: [20 * dpr, 10 * dpr],
  r: 80 * dpr
}

// import ComputedTree from './computedTree'

export default class NodeRelationTree extends View {
  constructor(opt) {
    super(opt)
    this.optNodes = getType(opt.nodes) === 'Array' ? opt.nodes : []
    this.optPaths = getType(opt.paths) === 'Array' ? opt.paths : []

    this.autoDraw = getType(opt.autoDraw) === 'Boolean' ? opt.autoDraw : true
    this.style = objectMerge(style, opt.style)

    this.mode = getType(opt.mode) === 'Number' ? opt.mode : 1 // 0 关联点最多的为顶点 1 边方向向上 2 边方向向下

    this.repulsionFlag = getType(opt.repulsionFlag) === 'Boolean' ? opt.repulsionFlag : false
    this.againRepulsionLevel = getType(opt.againRepulsionLevel) === 'Number' ? opt.againRepulsionLevel : 3

    this.init(opt)
  }
  init() {
    super.init()
    if (!this.optNodes.length) {
      echoWarn('未传入数据或数据为空')
      return
    }

    // new ComputedTree(
    //   JSON.parse(
    //     JSON.stringify({
    //       ...opt,
    //       canvas: {
    //         width: this.canvas.width,
    //         height: this.canvas.height
    //       }
    //     })
    //   )
    // )

    this.style.margin = convertMorP(this.style.margin)
    this.style.graph = graphList[this.style.graph]
    this.style.line = lineList[this.style.line]
    this.style.loopGraph = graphList[this.style.loopGraph]

    console.log(this.optNodes, 'optNodes')
    console.log(this.optPaths, 'optPaths')

    this.nodeRelation()
    this.splitGraph()
    console.log(this.graphArr, 'graphArr')
    this.treeData = []
    this.treeDataDeep = []
    this.graphArr.forEach((graphItem, index) => {
      if (index === this.graphArr.length - 1) {
        this.regularGraphDataXY(graphItem)
      } else {
        console.log('---')
        this.treeData[index] = null
        if (this.mode === 1) {
          console.time(1)
          this.searchNode0(graphItem)
          console.timeEnd(1)
          console.time(2)
          this.treeData[index] = [this.centerNode]
          // 组装树，并返回层级
          this.treeDataDeep[index] = this.initTreeDataAny(this.treeData[index], graphItem)
          console.timeEnd(2)
          // this.treeDataDeep[index] = this.initTreeData(graphItem, 'from')
        } else if (this.mode === 2) {
          this.searchNode0(graphItem)
          this.treeData[index] = [this.centerNode]
          // 组装树，并返回层级
          this.treeDataDeep[index] = this.initTreeDataAny(this.treeData[index], graphItem)
          // this.treeDataDeep[index] = this.initTreeData(graphItem, 'to')
        } else {
          this.searchCenterNode(graphItem)
          this.computedNodeWeight([this.centerNode], graphItem)
          this.treeData[index] = [this.centerNode]
          // 组装树，并返回层级
          this.treeDataDeep[index] = this.initTreeDataAny(this.treeData[index], graphItem)
        }
        this.computedNodeWidth(this.treeData[index])
        console.log(this.treeData[index][0].width, this.treeData[index])
        this.setDataXY(this.treeData[index], this.canvas.width / 2 - this.treeData[index][0].width / 2, this.treeDataDeep[index])
        // this.againRepulsion(graphItem)
      }
    })
    console.log(this.treeData, 'treeData')
    console.log(this.treeDataDeep, 'treeDataDeep')

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
  searchNode0(graphItem) {
    let Links = []
    // 查询路径
    graphItem.forEach(node => {
      if (!node.isLeftLink || !node.isRightLink) {
        Links = Links.concat(this.getLinks(node, graphItem))
      }
    })
    Links = Links.sort((a, b) => {
      return b.length - a.length
    })

    // const flag = true
    const index = 0
    // while (flag) {
    //   const link = Links[index]
    //   for (let i = 0; i < link.length; i++) {
    //     if (link.lastIndexOf(link[i]) !== i) {
    //       break
    //     }
    //     if (i === link.length - 1) {
    //       flag = false
    //     }
    //   }
    //   if (flag) {
    //     ++index
    //   }
    // }

    const link0 = Links[index]
    const node0 = link0[0]
    this.centerNode = graphItem.filter(optNode => {
      return optNode.uuid === node0
    })[0]
    // console.log(graphItem, direction)
    // console.log(Links)
    // console.log('------------------------------------')
  }
  getLinks(node, graphItem) {
    // const leftLink = this.getLeftLink(node, [], graphItem)
    // const rightLink = this.getRightLink(node, [], graphItem)
    // const combinationLinks = []
    // leftLink.forEach(left => {
    //   rightLink.forEach(right => {
    //     combinationLinks.push([...left, node.uuid, ...right])
    //   })
    // })
    // return combinationLinks
    this.stopGetLink = false
    if (this.mode === 1) {
      return this.getLeftLink(node, [], graphItem)
    } else {
      return this.getRightLink(node, [], graphItem)
    }
  }
  getLeftLink(node, originLink, graphItem) {
    if (this.stopGetLink) {
      return []
    }
    let newLinks = []
    node.fromNode.forEach(item => {
      if (originLink.indexOf(item.uuid) === -1) {
        const newLink = [item.uuid, ...originLink]
        const curNode = graphItem.filter(optNode => {
          return optNode.uuid === item.uuid
        })[0]
        curNode.isRightLink = true
        if (newLink.length > 10) {
          this.stopGetLink = true
        }
        if (curNode?.fromNode?.length && !this.stopGetLink) {
          newLinks = newLinks.concat(this.getLeftLink(curNode, newLink, graphItem))
        } else {
          newLinks = newLinks.concat([newLink])
        }
      } else {
        // 存在，即环链，停止该链继续递归
      }
    })
    if (newLinks.length) {
      return [newLinks[0]]
    } else {
      return [originLink]
    }
  }
  getRightLink(node, originLink, graphItem) {
    if (this.stopGetLink) {
      return []
    }
    let newLinks = []
    node.toNode.forEach(item => {
      if (originLink.indexOf(item.uuid) === -1) {
        const newLink = [...originLink, item.uuid]
        const curNode = graphItem.filter(optNode => {
          return optNode.uuid === item.uuid
        })[0]
        curNode.isLeftLink = true
        if (newLink.length > 10) {
          this.stopGetLink = true
        }
        if (curNode?.toNode?.length && !this.stopGetLink) {
          newLinks = newLinks.concat(this.getRightLink(curNode, newLink, graphItem))
        } else {
          newLinks = newLinks.concat([newLink])
        }
      } else {
        // 存在，即环链，停止该链继续递归
      }
    })
    if (newLinks.length) {
      return [newLinks[0]]
    } else {
      return [originLink]
    }
  }
  initTreeDataAny(nodeArr, graphItem, deep = 1) {
    // 同层优先遍历
    const childrenNode = []
    nodeArr.forEach(node => {
      if (!node.children) {
        node.isTree = true
        node.children = []
      }
      node.fromNode.forEach(item => {
        const curNode = graphItem.filter(optNode => {
          return optNode.uuid === item.uuid
        })[0]
        if (!curNode.isTree) {
          curNode.isTree = true
          node.children.push(curNode)
          childrenNode.push(curNode)
        }
      })
      node.toNode.forEach(item => {
        const curNode = graphItem.filter(optNode => {
          return optNode.uuid === item.uuid
        })[0]
        if (!curNode.isTree) {
          curNode.isTree = true
          node.children.push(curNode)
          childrenNode.push(curNode)
        }
      })
    })
    if (childrenNode.length) {
      return this.initTreeDataAny(childrenNode, graphItem, deep + 1)
    }
    return deep
  }
  computedNodeWidth(treeArr) {
    let width = 0
    treeArr.forEach(item => {
      if (item?.children?.length) {
        item.width = this.computedNodeWidth(item.children)
      } else {
        item.width = item.style.graphStyle.width + this.style.margin[1] + this.style.margin[3]
      }
      width += item.width
    })
    return width
  }
  setDataXY(treeArr, startX, deep, curDeep = 1) {
    // console.log(treeArr, deep)
    // 深度优先遍历
    const height = this.style.graphStyle.height + this.style.margin[0] + this.style.margin[2]
    const y = this.canvas.height / 2 - (deep / 2) * height + (curDeep - 0.5) * height
    treeArr.forEach(item => {
      if (item?.children?.length) {
        this.setDataXY(item.children, startX, deep, curDeep + 1)
      }
      item.x = startX + item.width / 2
      startX += item.width
      item.y = y
    })
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
          if (!node.layout) {
            node.layout = true
            node.x += translateX
          }
        })
        rightX += graphRightX - graphLeftX
      } else {
        leftX -= this.style.r
        const translateX = leftX - graphRightX
        graphItem.forEach(node => {
          if (!node.layout) {
            node.layout = true
            node.x += translateX
          }
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
