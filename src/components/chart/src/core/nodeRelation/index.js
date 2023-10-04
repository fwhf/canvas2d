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
import {
  dpr,
  echoWarn,
  getType,
  objectMerge,
  deepClone,
  getRepetNum,
  getArrayIntersection,
  convertMorP,
  getLineAndGraphIntersection
} from '../../util/helper.js'
import * as graphList from '../graphList.js'
import * as lineList from '../lineList.js'

const style = {
  graph: 'RectangleGraph',
  graphStyle: {
    width: 150 * dpr,
    height: 50 * dpr,
    padding: [10 * dpr, 10 * dpr, 10 * dpr, 50 * dpr],
    strokeWidth: 0 * dpr,
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
      textAlign: 'left',
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
  margin: [24 * dpr, 12 * dpr]
}

export default class NodeRelation extends View {
  constructor(opt) {
    super(opt)
    this.optNodes = getType(opt.nodes) === 'Array' ? opt.nodes : []
    this.optPaths = getType(opt.paths) === 'Array' ? opt.paths : []

    this.autoDraw = getType(opt.autoDraw) === 'Boolean' ? opt.autoDraw : true
    this.style = objectMerge(style, opt.style)
    this.autoScale = getType(opt.autoScale) === 'Boolean' ? opt.autoScale : true
    this.graphInterval = getType(opt.graphInterval) === 'Number' ? opt.graphInterval : 0

    this.mousemoveNextCb = this.mousemoveCb
    this.mousemoveCb = this.hijackMousemoveCb

    this.init()
  }
  init () {
    super.init()
    if (!this.optNodes.length) {
      echoWarn('未传入数据或数据为空')
      return
    }

    this.style.margin = convertMorP(this.style.margin)
    this.style.graph = graphList[this.style.graph]
    this.style.iconGraph = graphList[this.style.iconGraph]
    this.style.line = lineList[this.style.line]
    this.graphWidthMargin = this.style.graphStyle.width + this.style.margin[1] + this.style.margin[3]
    this.graphHeightMargin = this.style.graphStyle.height + this.style.margin[0] + this.style.margin[2]

    if (!this.graphInterval) {
      this.graphInterval = this.graphWidthMargin
    }

    this.oldNoRelationNode = []
    this.oldNoRelationLine = []

    this.initData()
  }
  initData () {
    // console.log(this.optNodes, 'optNodes')
    // console.log(this.optPaths, 'optPaths')

    // 去重处理optNodes
    this.formatOptNodes()

    // 去重整合处理optPaths
    this.formatOptPaths()

    // 点/链/图 查询
    // 单点/链点 单点：单独存在的点，与其他点无关  链点：与其他点有关系的点，多点构成称为链
    this.setNodesType() // 设置点类型
    this.aloneNodes = this.getAloneNodes()
    this.linkNodes = this.getLinkNodes()
    // console.log(this.aloneNodes, 'aloneNodes')
    // console.log(this.linkNodes, 'linkNodes')
    // 链路组装
    this.links = this.getLinks()
    // console.log(this.links, 'links')
    // 单链/图链  单链：单独存在的链，与其他链无关  图链：与其他链有交集的链，多链构成称为图
    const [aloneLinks, graphLinks] = this.getAloneOrGraphLinks(deepClone(this.links))
    this.aloneLinks = aloneLinks
    this.graphLinks = graphLinks
    // console.log(this.aloneLinks, 'aloneLinks')
    // console.log(this.graphLinks, 'graphLinks')

    // 坐标生成
    this.formatData()

    // 缩放计算
    if (this.autoScale) {
      let width = this.totalGraphAttr.reduce((prev, curr) => {
        return prev + curr
      })
      if ((this.totalGraphAttr.length + 1) % 2) {
        width += this.totalGraphAttr.length * this.graphInterval + this.graphWidthMargin * 2
      } else {
        width += (this.totalGraphAttr.length + 1) * this.graphInterval + this.graphWidthMargin * 3
      }
      let heightIndex = 0
      this.totalGraphData.forEach(graph => {
        if (graph.length > heightIndex) {
          heightIndex = graph.length
        }
      })
      this.totalLinkData.forEach(link => {
        if (link.length > heightIndex) {
          heightIndex = link.length
        }
      })
      if (this.totalNodeData.length > heightIndex) {
        heightIndex = this.totalNodeData.length
      }
      const height = heightIndex * this.graphHeightMargin
      const widthScale = (this.canvas.width / width).toFixed(2)
      const heightScale = (this.canvas.height / height).toFixed(2)
      if (widthScale < 1 && heightScale < 1) {
        this.scaleCIndex = widthScale < heightScale ? widthScale : heightScale
      } else if (widthScale < 1) {
        this.scaleCIndex = widthScale
      } else if (heightScale < 1) {
        this.scaleCIndex = heightScale
      }
      this.scaleC = this.scaleCIndex / 100
    }

    this.initGraphList()
    this.draw()
    if (this.eventFlag) {
      super.addEvent()
    }
  }
  formatOptPaths () {
    for (let i = 0; i < this.optPaths.length - 1; i++) {
      for (let j = i + 1; j < this.optPaths.length; j++) {
        if (this.optPaths[i].fromUuid === this.optPaths[j].fromUuid && this.optPaths[i].toUuid === this.optPaths[j].toUuid) {
          if (!this.optPaths[i].similar) {
            this.optPaths[i].similar = []
          }
          this.optPaths[i].similar.push(this.optPaths.splice(j, 1))
        }
      }
    }
  }
  formatOptNodes () {
    for (let i = 0; i < this.optNodes.length - 1; i++) {
      for (let j = i + 1; j < this.optNodes.length; j++) {
        if (this.optNodes[i].uuid === this.optNodes[j].uuid) {
          this.optNodes.splice(j, 1)
          j--
        }
      }
    }
  }
  setNodesType () {
    this.optNodes.forEach(item => {
      for (let i = 0; i < this.optPaths.length; i++) {
        if (item.uuid === this.optPaths[i].fromUuid || item.uuid === this.optPaths[i].toUuid) {
          item.nodeType = 1
          break
        }
        if (i === this.optPaths.length - 1) {
          item.nodeType = 0
          break
        }
      }
    })
  }
  getAloneNodes () {
    return this.optNodes.filter(item => {
      return item.nodeType === 0
    })
  }
  getLinkNodes () {
    return this.optNodes.filter(item => {
      return item.nodeType === 1
    })
  }
  getLinks () {
    const links = []
    this.optPaths.forEach(pathItem => {
      // 使用isGet标记path是否被前links覆盖到，加速getLinks
      if (!pathItem.isGet) {
        links.push(...this.getLink(pathItem))
      }
    })
    this.linkUnRepet(links)
    return links
  }
  getLink (pathItem) {
    // 找上下层链
    const topLink = this.getAloneUuid([[pathItem.toUuid, pathItem.fromUuid]], 'top')
    const bottomLink = this.getAloneUuid([[pathItem.toUuid, pathItem.fromUuid]], 'bottom')
    // 合并层链
    let link = []
    if (topLink.length === 0 || bottomLink.length === 0) {
      link = topLink.length ? topLink : bottomLink
    } else {
      topLink.forEach(topItem => {
        bottomLink.forEach(bottomItem => {
          const concatItem = bottomItem.slice(2)
          link.push(topItem.concat(concatItem))
        })
      })
    }
    return link
  }
  getAloneUuid (links, direction) {
    const judgeAttr = direction === 'top' ? 'fromUuid' : 'toUuid'
    const targetAttr = direction === 'top' ? 'toUuid' : 'fromUuid'
    const funcType = direction === 'top' ? 'unshift' : 'push'
    let curLinks = []
    let nextFlag = false
    this.optPaths.forEach(item => {
      links.forEach(itemLink => {
        if (itemLink[direction === 'top' ? 0 : itemLink.length - 1] === item[judgeAttr]) {
          const repetNum = getRepetNum(itemLink, item[targetAttr])
          if (repetNum > 0) {
            // 链路内存在该节点 闭环链路
            if (repetNum === 1) {
              curLinks.push(deepClone(itemLink))
              curLinks[curLinks.length - 1][funcType](item[targetAttr])
              item.isGet = true
            }
          } else {
            // 链路内不存在该节点 非闭环
            curLinks.push(deepClone(itemLink))
            curLinks[curLinks.length - 1][funcType](item[targetAttr])
            item.isGet = true
            nextFlag = true
          }
        }
      })
    })
    // 新老链路合并
    curLinks = this.linkConcat(links, curLinks)

    if (nextFlag) {
      return this.getAloneUuid(curLinks, direction)
    } else {
      return curLinks
    }
  }
  linkConcat (links1, links2) {
    for (let i = 0; i < links1.length; i++) {
      for (let j = 0; j < links2.length; j++) {
        if (links2[j].join(',').indexOf(links1[i].join(',')) > -1) {
          links1.splice(i, 1)
          i--
          break
        }
      }
    }
    const links = links1.concat(links2)
    return links
  }
  linkUnRepet (links) {
    for (let i = 0; i < links.length - 1; i++) {
      for (let j = i + 1; j < links.length; j++) {
        if ((',' + links[j].join(',') + ',').indexOf(',' + links[i].join(',') + ',') > -1) {
          links.splice(i, 1)
          i--
          break
        }
      }
    }
  }
  getAloneOrGraphLinks (links) {
    const aloneLinks = []
    const graphLinks = []
    for (let i = 0; i < links.length; i++) {
      for (let j = i + 1; j < links.length; j++) {
        if (getArrayIntersection(links[i], links[j]).length) {
          if (!graphLinks[graphLinks.length]) {
            graphLinks[graphLinks.length] = [...links.splice(j, 1), ...links.splice(i, 1)]
            this.getGraphLinks(links, graphLinks[graphLinks.length - 1])
          }
          i = -1
          break
        }
        if (j === links.length - 1) {
          aloneLinks.push(...links.splice(i, 1))
          i = -1
          break
        }
      }
    }
    if (links.length === 1) {
      aloneLinks.push(...links.splice(0, 1))
    }
    return [aloneLinks, graphLinks]
  }
  getGraphLinks (links, graphLinks) {
    for (let i = 0; i < links.length; i++) {
      for (let k = 0; k < graphLinks.length; k++) {
        if (getArrayIntersection(links[i], graphLinks[k]).length) {
          graphLinks.push(...links.splice(i, 1))
          i = -1
          break
        }
      }
    }
  }
  formatData () {
    // 数据处理顺序 图链>单链>单点
    this.graphLinks.sort((a, b) => {
      return b.length - a.length
    })
    this.aloneLinks.sort((a, b) => {
      return b.length - a.length
    })

    this.totalGraphAttr = [] // 记录每个图链的宽度，layout做图链分散布局用

    this.totalGraphData = []
    this.graphLinks.forEach(item => {
      this.totalGraphData.push(this.formatGraphData(deepClone(item)))
    })
    // console.log(this.totalGraphData, 'totalGraphData')
    this.totalLinkData = []
    this.aloneLinks.forEach(item => {
      this.totalLinkData.push(this.formatLinkData(deepClone(item)))
    })
    // console.log(this.totalLinkData, 'totalLinkData')
    this.totalNodeData = this.aloneNodes
    // console.log(this.totalNodeData, 'totalNodeData')

    this.layout()

    // 带有环链的图测试   未特殊处理环链绘制，故可能出现绘制混乱情况   后续优化处理（初步设想环链处理逻辑放置最后，即有顶点链>无顶点链>环链）
    // this.formatDataGraph([
    //   [15, 6, 2, 15],
    //   [11, 2],
    //   [15, 6, 0],
    //   [15, 5, 0],
    //   [13, 8, 0],
    //   [11, 4, 0],
    //   [12, 0],
    //   [13, 2],
    //   [15, 10, 0],
    //   [12, 7, 1],
    //   [15, 0],
    //   [15, 9],
    //   [14, 9],
    //   [15, 10, 1]
    // ])
  }
  formatGraphData (graph) {
    // 找出[0]出现次数最多的点作为遍历顶点
    const nodes = []
    graph.forEach(link => {
      const node = nodes.filter(nodeItem => {
        return link[0] === nodeItem.value
      })
      if (node.length) {
        node[0].length++
      } else {
        nodes.push({
          value: link[0],
          length: 1
        })
      }
    })
    nodes.sort((a, b) => {
      return b.length - a.length
    })

    // 优先遍历起点为顶点的链 链点重复取大值层级
    const graphData = []
    for (let i = 0; i < graph.length; i++) {
      if (graph[i][0] === nodes[0].value) {
        let graphStartIndex = 0
        graph[i].forEach(node => {
          let graphDataIndex = graphStartIndex
          for (let j = 0; j < graphData.length; j++) {
            if (graphData[j].indexOf(node) > -1) {
              j > graphDataIndex ? (graphDataIndex = j) : ''
              graphData[j].splice(graphData[j].indexOf(node), 1)
              break
            }
          }
          if (!graphData[graphDataIndex]) {
            graphData[graphDataIndex] = []
          }
          graphData[graphDataIndex].push(node)
          graphStartIndex = graphDataIndex + 1
        })
        graph.splice(i, 1)
        i--
      }
    }
    // 后遍历起点不为顶点的链 优先寻找重复链点，确认层级
    for (let i = 0; i < graph.length; i++) {
      let exist = false
      let graphStartIndex = 0
      for (let j = 0; j < graph[i].length; j++) {
        for (let k = 0; k < graphData.length; k++) {
          if (graphData[k].indexOf(graph[i][j]) > -1) {
            exist = true
            graphStartIndex = k - j
            break
          }
        }
        if (exist) {
          break
        }
      }
      if (exist) {
        const padStartGraphData = []
        if (graphStartIndex < 0) {
          graphStartIndex = Math.abs(graphStartIndex)
          for (let j = 0; j < graphStartIndex; j++) {
            padStartGraphData.push(graph[i].splice(j, 1))
          }
          graph = padStartGraphData.concat(graph)
        }
        graph[i].forEach(node => {
          let graphDataIndex = graphStartIndex
          for (let j = 0; j < graphData.length; j++) {
            if (graphData[j].indexOf(node) > -1) {
              j > graphDataIndex ? (graphDataIndex = j) : ''
              graphData[j].splice(graphData[j].indexOf(node), 1)
              break
            }
          }
          if (!graphData[graphDataIndex]) {
            graphData[graphDataIndex] = []
          }
          graphData[graphDataIndex].push(node)
          graphStartIndex = graphDataIndex + 1
        })

        graph.splice(i, 1)
        i = -1
      }
    }

    // 去空
    for (let i = 0; i < graphData.length; i++) {
      if (!graphData[i].length) {
        graphData.splice(i, 1)
        i--
        continue
      }
    }

    this.graphDataNode(graphData)
    return graphData
  }
  graphDataNode (graphData) {
    const startDrawXY = {
      y: this.canvas.height / 2 - (graphData.length / 2) * this.graphHeightMargin + this.style.graphStyle.height / 2 + this.style.margin[0]
    }
    let minLeft = 0
    let maxLeft = 0
    let translateIndex = 1
    for (let i = 0; i < graphData.length; i++) {
      startDrawXY.x = this.canvas.width / 2 - (graphData[i].length / 2) * this.graphWidthMargin + this.style.graphStyle.width / 2 + this.style.margin[3]
      // 节点偏移布局 右偏移
      if ((i % 2 === 0 && graphData[i].length % 2 === 1) || (i % 2 === 1 && graphData[i].length % 2 === 0)) {
        startDrawXY.x += (this.graphWidthMargin / 2) * translateIndex
        translateIndex *= -1
      }
      for (let j = 0; j < graphData[i].length; j++) {
        const node = this.linkNodes.filter(node => {
          return node.uuid === graphData[i][j]
        })
        graphData[i][j] = node[0]
        graphData[i][j].style = objectMerge(this.style, graphData[i][j].style)
        graphData[i][j].x = startDrawXY.x + this.graphWidthMargin * j
        graphData[i][j].y = startDrawXY.y

        if (i === 0 && j === 0) {
          minLeft = graphData[i][j].x
          maxLeft = graphData[i][j].x
        } else {
          if (graphData[i][j].x < minLeft) {
            minLeft = graphData[i][j].x
          } else if (graphData[i][j].x > maxLeft) {
            maxLeft = graphData[i][j].x
          }
        }
      }
      startDrawXY.y = startDrawXY.y + this.graphHeightMargin
    }
    this.totalGraphAttr.push({
      width: maxLeft - minLeft + this.graphWidthMargin,
      center: minLeft + (maxLeft - minLeft) / 2
    })
  }
  formatLinkData (linkData) {
    this.linkDataNode(linkData)
    return linkData
  }
  linkDataNode (linkData) {
    const startDrawXY = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2 - (linkData.length / 2) * this.graphHeightMargin + this.style.graphStyle.height / 2 + this.style.margin[0]
    }
    for (let i = 0; i < linkData.length; i++) {
      const node = this.linkNodes.filter(node => {
        return node.uuid === linkData[i]
      })
      linkData[i] = node[0]
      linkData[i].style = objectMerge(this.style, linkData[i].style)
      linkData[i].x = startDrawXY.x
      linkData[i].y = startDrawXY.y + this.graphHeightMargin * i
    }
    this.totalGraphAttr.push({
      width: this.graphWidthMargin,
      center: startDrawXY.x
    })
  }
  layout () {
    // 图链点分散布局 中心点Y相等 先左后右  计算规则：图一图二中心点距离 = 图一宽度一半+图间距+图二宽度一半
    // this.totalGraphData,this.totalLinkData,this.totalNodeData
    for (let i = 0; i < this.totalGraphData.length; i++) {
      let translateX = 0
      if (i) {
        translateX = this.totalGraphAttr[0].center - this.canvas.width / 2
        if (i === 1) {
          translateX = translateX - this.totalGraphAttr[0].width / 2 - this.totalGraphAttr[i].width / 2 - this.graphInterval
        } else if (i === 2) {
          translateX = translateX + this.totalGraphAttr[0].width / 2 + this.totalGraphAttr[i].width / 2 + this.graphInterval
        } else if (i % 2) {
          for (let i = 1; i < this.totalGraphData.length - 1; i += 2) {
            translateX = translateX - this.totalGraphAttr[i].width - this.graphInterval
          }
          translateX = translateX - this.totalGraphAttr[0].width / 2 - this.totalGraphAttr[i].width / 2 - this.graphInterval
        } else {
          for (let i = 2; i < this.totalGraphData.length - 1; i += 2) {
            translateX = translateX + this.totalGraphAttr[i].width + this.graphInterval
          }
          translateX = translateX + this.totalGraphAttr[0].width / 2 + this.totalGraphAttr[i].width / 2 + this.graphInterval
        }
      }
      for (let j = 0; j < this.totalGraphData[i].length; j++) {
        for (let k = 0; k < this.totalGraphData[i][j].length; k++) {
          this.totalGraphData[i][j][k].x += translateX
        }
      }
    }

    const totalGraphAndLinkLength = this.totalGraphData.length + this.totalLinkData.length
    for (let i = 0; i < this.totalLinkData.length; i++) {
      const index = this.totalGraphData.length + i
      let translateX = 0
      if (index) {
        translateX = this.totalGraphAttr[0].center - this.canvas.width / 2
        if (index === 1) {
          translateX = translateX - this.totalGraphAttr[0].width / 2 - this.totalGraphAttr[index].width / 2 - this.graphInterval
        } else if (index === 2) {
          translateX = translateX + this.totalGraphAttr[0].width / 2 + this.totalGraphAttr[index].width / 2 + this.graphInterval
        } else if (index % 2) {
          for (let index = 1; index < totalGraphAndLinkLength - 1; index += 2) {
            translateX = translateX - this.totalGraphAttr[index].width - this.graphInterval
          }
          translateX = translateX - this.totalGraphAttr[0].width / 2 - this.totalGraphAttr[index].width / 2 - this.graphInterval
        } else {
          for (let index = 2; index < totalGraphAndLinkLength - 1; index += 2) {
            translateX = translateX + this.totalGraphAttr[index].width + this.graphInterval
          }
          translateX = translateX + this.totalGraphAttr[0].width / 2 + this.totalGraphAttr[index].width / 2 + this.graphInterval
        }
      }
      for (let j = 0; j < this.totalLinkData[i].length; j++) {
        this.totalLinkData[i][j].x += translateX
      }
    }

    let translateX = 0
    const index = this.totalGraphAttr.length
    if (index) {
      translateX = this.totalGraphAttr[0].center - this.canvas.width / 2
      if (index === 1) {
        translateX = translateX - this.totalGraphAttr[0].width / 2 - this.graphWidthMargin / 2 - this.graphInterval
      } else if (index === 2) {
        translateX = translateX + this.totalGraphAttr[0].width / 2 + this.graphWidthMargin / 2 + this.graphInterval
      } else if (index % 2) {
        for (let index = 1; index < totalGraphAndLinkLength - 1; index += 2) {
          translateX = translateX - this.totalGraphAttr[index].width - this.graphInterval
        }
        translateX = translateX - this.totalGraphAttr[0].width / 2 - this.graphWidthMargin / 2 - this.graphInterval
      } else {
        for (let index = 2; index < totalGraphAndLinkLength - 1; index += 2) {
          translateX = translateX + this.totalGraphAttr[index].width + this.graphInterval
        }
        translateX = translateX + this.totalGraphAttr[0].width / 2 + this.graphWidthMargin / 2 + this.graphInterval
      }
    }

    const startDrawXY = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2 - (this.totalNodeData.length / 2) * this.graphHeightMargin + this.style.graphStyle.height / 2 + this.style.margin[0]
    }
    this.totalNodeData.forEach((item, index) => {
      item.style = objectMerge(this.style, item.style)
      item.x = startDrawXY.x + translateX
      item.y = startDrawXY.y + this.graphHeightMargin * index
    })

    this.optPaths.forEach(pathItem => {
      let fromNode = null
      let toNode = null
      for (let i = 0; i < this.optNodes.length; i++) {
        if (pathItem.fromUuid === this.optNodes[i].uuid) {
          fromNode = this.optNodes[i]
        }
        if (pathItem.toUuid === this.optNodes[i].uuid) {
          toNode = this.optNodes[i]
        }
        if (fromNode && toNode) {
          break
        }
      }
      if (!toNode.line) {
        toNode.line = []
      }
      if (toNode.uuid === fromNode.uuid) {
        // 自身指向自身
        // toNode.line.push({
        //   fromUuid: fromNode.uuid,
        //   lineArc: true
        // })
        toNode.line.push({
          fromNodeUuid: fromNode.uuid
        })
      } else {
        toNode.line.push({
          fromNodeUuid: fromNode.uuid
        })
      }
    })
  }

  initGraphList () {
    this.graphId = 0
    this.graphList = []
    const GraphClass = this.style.graph
    this.lineId = 0
    this.lineList = []
    const LineClass = this.style.line
    this.iconId = 0
    this.iconList = []
    const IconClass = this.style.iconGraph
    this.optNodes.forEach(dataItem => {
      if (GraphClass) {
        dataItem.graphClass = new GraphClass({
          canvas: this.canvas,
          scaleC: this.scaleC,
          xy: {
            x: dataItem.x,
            y: dataItem.y
          },
          allowTranslate: false,
          autoDraw: false,
          content: dataItem.text + '',
          style: dataItem.style.graphStyle,
          id: ++this.graphId
        })
        this.graphList.push(dataItem.graphClass)
      }
      if (IconClass && this.style.iconGraphShow && dataItem.icon !== undefined) {
        dataItem.iconClass = new IconClass({
          canvas: this.canvas,
          scaleC: this.scaleC,
          xy: {
            x: dataItem.x - dataItem.style.graphStyle.width / 2 + dataItem.style.iconGraphStyle.position.left + dataItem.style.iconGraphStyle.width / 2,
            y: dataItem.y - dataItem.style.graphStyle.height / 2 + dataItem.style.iconGraphStyle.position.top + dataItem.style.iconGraphStyle.height / 2
          },
          autoDraw: false,
          content: dataItem.icon + '',
          style: dataItem.style.iconGraphStyle,
          id: ++this.iconId
        })
        this.iconList.push(dataItem.iconClass)
      }
    })
    this.optNodes.forEach(dataItem => {
      if (LineClass && dataItem.line && dataItem.line.length) {
        dataItem.LineClass = []
        dataItem.line.forEach(lineItem => {
          const fromNode = this.optNodes.filter(node => {
            return node.uuid === lineItem.fromNodeUuid
          })[0]
          if (fromNode.uuid !== dataItem.uuid) {
            // 暂时摒弃自身指向自身
            const lineXY = [
              getLineAndGraphIntersection(
                dataItem.graphClass.style.width,
                dataItem.graphClass.vertex,
                { x: dataItem.x, y: dataItem.y },
                { x: fromNode.x, y: fromNode.y }
              ),
              getLineAndGraphIntersection(
                fromNode.graphClass.style.width,
                fromNode.graphClass.vertex,
                { x: fromNode.x, y: fromNode.y },
                { x: dataItem.x, y: dataItem.y }
              )
            ]
            const lineClass = new LineClass({
              canvas: this.canvas,
              scaleC: this.scaleC,
              vertex: [
                {
                  x: lineXY[0].x,
                  y: lineXY[0].y
                },
                {
                  x: lineXY[1].x,
                  y: lineXY[1].y
                }
              ],
              autoDraw: false,
              style: dataItem.style.lineStyle,
              id: ++this.lineId
            })
            dataItem.LineClass.push(lineClass)
            this.lineList.push(lineClass)
          }
        })
      }
    })
  }

  formatDataTranslate ({ x, y }) {
    this.graphList.forEach(graph => {
      graph.formatDataTranslate({ x, y })
    })
    this.iconList.forEach(icon => {
      icon.formatDataTranslate({ x, y })
    })
    this.lineList.forEach(line => {
      line.formatDataTranslate({ x, y })
    })
  }
  formatDataScale () {
    this.graphList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
    })
    this.iconList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
    })
    this.lineList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
    })
  }

  draw () {
    this.lineList.forEach(line => {
      if (line.hover) {
        line.draw()
      }
    })
    this.graphList.forEach(graph => {
      if (graph.hover) {
        graph.draw()
      }
    })
    this.iconList.forEach(icon => {
      if (icon.hover) {
        icon.draw()
      }
    })
    this.lineList.forEach(line => {
      if (!line.hover) {
        line.draw()
      }
    })
    this.graphList.forEach(graph => {
      if (!graph.hover) {
        graph.draw()
      }
    })
    this.iconList.forEach(icon => {
      if (!icon.hover) {
        icon.draw()
      }
    })
  }

  hijackMousemoveCb (graph) {
    let hoverData = null
    if (graph) {
      if (!this.oldNoRelationNode.length || this.oldNoRelationNode[0].graphClass.id !== graph.id) {
        this.clearOldData()
        hoverData = this.getDataByClass(graph, this.optNodes)
        this.oldNoRelationNode.push(hoverData)
        const relationData = this.getRelationData(hoverData, this.optNodes)
        this.setNoRelationDataHover(relationData, this.optNodes)
        this.setNoRelationLineHover(hoverData, this.lineList)
        if (hoverData.iconClass) {
          hoverData.iconClass.setHoverStatus(false)
        }
      }
      graph.setHoverStatus(false)
      this.addTask()
    } else if (this.oldNoRelationNode.length) {
      this.clearOldData()
      this.addTask()
    }
    this.mousemoveNextCb && this.mousemoveNextCb({ graph, hoverData })
  }
  clearOldData () {
    this.oldNoRelationNode.forEach(item => {
      item.graphClass.setHoverStatus(false)
      if (item.iconClass) {
        item.iconClass.setHoverStatus(false)
      }
    })
    this.oldNoRelationLine.forEach(item => {
      item.setHoverStatus(false)
    })
    this.oldNoRelationNode = []
    this.oldNoRelationLine = []
  }
  getDataByClass (item, data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].graphClass && data[i].graphClass.id === item.id) {
        return data[i]
      }
    }
  }
  getRelationData (item, data) {
    const relationData = []
    if (item.line && item.line.length) {
      item.line.forEach(line => {
        relationData.push(
          data.filter(dataItem => {
            return dataItem.uuid === line.fromNodeUuid
          })[0]
        )
      })
    }
    return relationData
  }
  setNoRelationDataHover (relationData, data) {
    data.forEach(item => {
      const isRelation = relationData.filter(relationItem => {
        return relationItem.uuid === item.uuid
      })[0]
      if (!isRelation) {
        this.oldNoRelationNode.push(item)
        item.graphClass.setHoverStatus(true)
        if (item.iconClass) {
          item.iconClass.setHoverStatus(true)
        }
      }
    })
  }
  setNoRelationLineHover (item, lineList) {
    if (item.LineClass) {
      lineList.forEach(line => {
        const isRelation = item.LineClass.filter(itemLine => {
          return itemLine.id === line.id
        })[0]
        if (!isRelation) {
          this.oldNoRelationLine.push(line)
          line.setHoverStatus(true)
        }
      })
    } else {
      this.oldNoRelationLine = lineList
      this.oldNoRelationLine.forEach(line => {
        line.setHoverStatus(true)
      })
    }
  }
}
