const dpr = window.devicePixelRatio || 1
// if (devicePixelRatio >= 3) {
//   dpr = 3
// } else if (devicePixelRatio >= 2) {
//   dpr = 2
// } else {
//   dpr = 1
// }

const isM = () => {
  const ua = navigator.userAgent
  if (ua.indexOf('Android') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPod') > -1 || ua.indexOf('Symbian') > -1) {
    return true
  } else {
    return false
  }
}

const rand = (n, m) => {
  var c = m - n + 1
  return Math.floor(Math.random() * c + n)
}

class LocalClass {
  constructor() {
    if (window.localStorage) {
      this.state = true
    } else {
      this.state = false
    }
  }
  set(key, value, day) {
    if (this.state) {
      window.localStorage[key] = JSON.stringify({
        value,
        day: Date.now() + day * 24 * 3600 * 1000
      })
    } else {
      const now = new Date()
      now.setDate(now.getDate() + day)
      document.cookie = `${key}=${value};expires=${now}`
    }
  }
  get(key) {
    if (this.state) {
      if (window.localStorage[key]) {
        const value = JSON.parse(window.localStorage[key])
        if (value.day < Date.now()) {
          this.del(key)
          return false
        } else {
          return value.value
        }
      } else {
        return false
      }
    } else {
      const str = document.cookie
      const reg = /; /
      const reg2 = new RegExp(key)
      if (reg.test(str) && reg2.test(str)) {
        return str.split(key)[1].split('=')[1].replace(/;.+/, '')
      } else if (reg2.test(str)) {
        return str.split('=')[1]
      }
      return false
    }
  }
  del(key) {
    if (this.state) {
      window.localStorage.removeItem(key)
    } else {
      this.set(key, '', -1)
    }
  }
}
const local = new LocalClass()

const getDom = (val, type) => {
  let dom = null
  switch (type) {
    case 'tag':
      dom = document.getElementsByTagName(val)[0]
      break
    case 'class':
      dom = document.getElementsByClassName(val)[0]
      break
    case 'id':
      dom = document.getElementById(val)
      break
    default:
      dom = document.getElementById(val)
  }
  return dom
}

const echoError = val => {
  console.error(val)
}

const echoWarn = val => {
  console.warn(val)
}

const getType = val => {
  return Object.prototype.toString.call(val).replace(/\[object (\w+)\]/, '$1')
}

const isCanvasDom = val => {
  return val && getType(val) === 'HTMLCanvasElement' && val.nodeType === 1 && val.nodeName.toLowerCase() === 'canvas'
}

// 计算两个数值是否约等于
const approximatelyEqual = (val1, val2) => {
  return Math.abs(val1 - val2) < 0.01
}

// 计算两个数值是否约大于等于
const approximatelyGreaterEqual = (val1, val2) => {
  return approximatelyEqual(val1, val2) ? true : val1 - val2 > 0
}

// 计算两个数值是否约小于等于
const approximatelyLessEqual = (val1, val2) => {
  return approximatelyEqual(val1, val2) ? true : val1 - val2 < 0
}

const deepClone = val => {
  const type = getType(val)
  let valClone = null

  if (type === 'Object') {
    valClone = {}
    for (const attr in val) {
      valClone[attr] = deepClone(val[attr])
    }
  } else if (type === 'Array') {
    valClone = []
    val.forEach(item => {
      valClone.push(deepClone(item))
    })
  } else {
    valClone = val
  }

  return valClone
}

// 获取一个字符串在一个数组中出现的次数
const getRepetNum = (arr, str) => {
  let num = 0
  arr.forEach(item => {
    item === str && num++
  })
  return num
}

// 获取两个数组的交集
const getArrayIntersection = (arr1, arr2) => {
  const intersection = []
  arr1.forEach(item => {
    if (arr2.indexOf(item) > -1) {
      intersection.push(item)
    }
  })
  return intersection
}

// 获取指定字符长度的字符串 汉字1字符，其他0.5字符
const getStr = (str, length) => {
  let curStr = ''
  let curLength = 0
  const regArr = [
    '[\\u4E00-\\u9FFF]',
    '[\\u00d7\\u2013\\u2014]',
    '[\\u2018-\\u2027]',
    '[\\u3001\\u3002\\u3003]',
    '[\\u3008-\\u3011\\u3014\\u3015]',
    '[\\uff01-\\uff0f\\uff1a-\\uff20]',
    '[\\uff3b-\\uff40]',
    '[\\uff5b-\\uff65]',
    '[\\uffe5]'
  ]
  // var reg = new RegExp('[\\u4E00-\\u9FFF]+')
  for (let i = 0; i < str.length; i++) {
    let isCN = false
    for (let j = 0; j < regArr.length; j++) {
      isCN = new RegExp(regArr[j]).test(str[i])
      if (isCN) {
        break
      }
    }
    if (isCN) {
      curLength += 1
    } else {
      curLength += 0.5
    }
    if (curLength > length) {
      break
    }
    curStr += str[i]
  }
  return curStr
}

const objectMerge = (val1 = '', val2 = {}) => {
  const type = getType(val1)
  if (getType(val2) !== type) {
    return val2
  }

  if (type === 'Object') {
    val1 = deepClone(val1)
    val2 = deepClone(val2)
    for (const attr in val1) {
      if (Object.prototype.hasOwnProperty.call(val2, attr)) {
        val2[attr] = objectMerge(val1[attr], val2[attr])
      } else {
        val2[attr] = val1[attr]
      }
    }
  }
  return val2
}

// 转换margin/padding
const convertMorP = val => {
  let MorP = []
  const type = getType(val)
  if (type === 'Number') {
    MorP = [val, val, val, val]
  } else if (type === 'Array') {
    switch (val.length) {
      case 1:
        MorP = [val[0], val[0], val[0], val[0]]
        break
      case 2:
        MorP = [val[0], val[1], val[0], val[1]]
        break
      case 3:
        MorP = [val[0], val[1], val[2], val[1]]
        break
      case 4:
        MorP = val
        break
      default:
        MorP = [0, 0, 0, 0]
        break
    }
  } else {
    MorP = [0, 0, 0, 0]
  }
  return MorP
}

// 获取数组对象深度
const getDataDepth = data => {
  let depth = 1
  const curDeptArr = [0]
  data.forEach(item => {
    if (item.children && item.children.length) {
      curDeptArr.push(getDataDepth(item.children))
    }
  })
  curDeptArr.sort((a, b) => {
    return b - a
  })
  depth += curDeptArr[0]
  return depth
}

// 将style属性 -格式转为驼峰格式
const styleName2UC = styleName => {
  return styleName.replace(/-(\w)/g, function ($0, $1) {
    return $1.toUpperCase()
  })
}

// html字符串转树
const htmlStr2textArr = (htmlstr, style = {}) => {
  const tree = []
  const textArr = []

  const div = document.createElement('div')
  div.innerHTML = htmlstr
  // const nodes = div.childNodes
  // if (nodes && nodes.length) {
  deepHtmlNodes([div], tree)
  tree.forEach(item => {
    deepHtmlTree(item, textArr, style)
  })
  // }

  return textArr
}
const deepHtmlNodes = (nodes, tree) => {
  nodes.forEach(item => {
    if (item.nodeType === 3) {
      // 文本节点
      tree.push({
        text: item.nodeValue
      })
    } else if (item.nodeType === 1) {
      // 标签节点
      const obj = {
        tag: item.nodeName,
        style: {},
        children: []
      }
      for (let i = 0; i < item.style.length; i++) {
        const styleName = styleName2UC(item.style[i])
        obj.style[styleName] = item.style[item.style[i]]
      }
      if (item.childNodes && item.childNodes.length) {
        deepHtmlNodes(item.childNodes, obj.children)
      }
      tree.push(obj)
    }
  })
}
const deepHtmlTree = (treeItem, textArr, parentStyle) => {
  if (treeItem.text) {
    if (!textArr.length) {
      textArr.push({
        children: []
      })
    }
    textArr[textArr.length - 1].children.push({
      text: treeItem.text,
      style: parentStyle
    })
  } else if (treeItem.children.length) {
    const style = objectMerge(parentStyle, treeItem.style)
    let oldDivTag = false
    treeItem.children.forEach(item => {
      if (oldDivTag || (item.tag && item.tag.toLowerCase() === 'div')) {
        textArr.push({
          children: []
        })
        if (!item.tag || item.tag.toLowerCase() !== 'div') {
          oldDivTag = false
        } else {
          oldDivTag = true
        }
      } else {
        oldDivTag = false
      }
      deepHtmlTree(item, textArr, style)
    })
  } else {
    if (!textArr.length) {
      textArr.push({
        children: []
      })
    }
    textArr[textArr.length - 1].children.push({
      text: '',
      style: parentStyle
    })
  }
}

// width、height为auto时获取图形宽高
const getGraphWidthOrHeight = (ctx, content, textStyle, padding, originWidth) => {
  const data = htmlStr2textArr(content, textStyle)
  let width = 0
  let height = 0
  padding = convertMorP(padding)
  if (originWidth !== 'auto') {
    originWidth = originWidth - padding[1] - padding[3]
  }
  data.forEach(data => {
    data.measureTextWidthTotal = 0
    let maxLineHeight = 0
    data.children.forEach(childrenItem => {
      ctx.beginPath()
      ctx.font = childrenItem.style.fontSize + 'px' + ' ' + childrenItem.style.fontWight + ' ' + childrenItem.style.fontFamily
      childrenItem.measureTextWidth = ctx.measureText(childrenItem.text).width
      data.measureTextWidthTotal += childrenItem.measureTextWidth
      ctx.closePath()

      if (childrenItem.style.lineHeight && childrenItem.style.lineHeight > maxLineHeight) {
        maxLineHeight = childrenItem.style.lineHeight
      }
    })
    let lineIndex = 1
    if (originWidth !== 'auto' && data.measureTextWidthTotal > originWidth) {
      width = originWidth
      // 容错：文字绘制时自动换行可能每行空间应用不全，会引起高度变大 （理论应该完全按照文字绘制宽高定义图形宽高）
      lineIndex = Math.ceil(data.measureTextWidthTotal / originWidth) + Math.floor(Math.ceil(data.measureTextWidthTotal / originWidth) / 10)
    } else if (data.measureTextWidthTotal > width) {
      width = data.measureTextWidthTotal
    }
    height += maxLineHeight * lineIndex
  })
  width = width + padding[1] + padding[3]
  height += padding[0] + padding[2]

  return { width, height }
}

// 判断鼠标在dom元素内
const eInDom = (e, dom) => {
  const x = e.clientX
  const y = e.clientY
  const domx1 = dom.getBoundingClientRect().left
  const domy1 = dom.getBoundingClientRect().top
  const domx2 = domx1 + dom.offsetWidth
  const domy2 = domy1 + dom.offsetHeight
  if (x > domx1 && x < domx2 && y > domy1 && y < domy2) {
    return true
  }
  return false
}

/* -------------------------------------------------------------------------------------------*/

// 把光标移到末尾
const textLastPos = obj => {
  // 解决浏览器的兼容问题
  if (window.getSelection) {
    const range = window.getSelection()
    range.selectAllChildren(obj)
    range.collapseToEnd() // 光标移至最后
  } else if (document.selection) {
    const range = document.selection.createRange()
    range.moveToElementText(obj)
    range.collapse(false) // 光标移至最后
    range.select()
  }
}

/* -------------------------------------------------------------------------------------------*/

// 正多边形，通过中心点以及边长计算顶点 暂时支持三角形，正方形
const getGraphVertex = (edgeWidth, edgeNum, centerXY) => {
  let graphVertex = []
  switch (edgeNum) {
    case 3:
      graphVertex = [
        {
          x: centerXY.x,
          y: centerXY.y - edgeWidth / 2
        },
        {
          x: centerXY.x + edgeWidth / 2,
          y: centerXY.y + edgeWidth / 2
        },
        {
          x: centerXY.x - edgeWidth / 2,
          y: centerXY.y + edgeWidth / 2
        }
      ]
      break
    case 4:
      graphVertex = [
        {
          x: centerXY.x - edgeWidth / 2,
          y: centerXY.y - edgeWidth / 2
        },
        {
          x: centerXY.x + edgeWidth / 2,
          y: centerXY.y - edgeWidth / 2
        },
        {
          x: centerXY.x + edgeWidth / 2,
          y: centerXY.y + edgeWidth / 2
        },
        {
          x: centerXY.x - edgeWidth / 2,
          y: centerXY.y + edgeWidth / 2
        }
      ]
      break
    default:
      graphVertex = []
      break
  }
  return graphVertex
}
// 圆角矩形，通过中心点以及边长计算顶点
const getRectangleVertex = (edgeWidth, edgeHeight, centerXY, borderRadius = 0) => {
  if (approximatelyEqual(borderRadius, 0)) {
    borderRadius = 0
  }
  if (borderRadius) {
    return [
      {
        x: centerXY.x - edgeWidth / 2 + borderRadius,
        y: centerXY.y - edgeHeight / 2
      },
      {
        x: centerXY.x + edgeWidth / 2 - borderRadius,
        y: centerXY.y - edgeHeight / 2
      },
      {
        r: borderRadius,
        x: centerXY.x + edgeWidth / 2 - borderRadius,
        y: centerXY.y - edgeHeight / 2 + borderRadius
      },
      {
        x: centerXY.x + edgeWidth / 2,
        y: centerXY.y - edgeHeight / 2 + borderRadius
      },
      {
        x: centerXY.x + edgeWidth / 2,
        y: centerXY.y + edgeHeight / 2 - borderRadius
      },
      {
        r: borderRadius,
        x: centerXY.x + edgeWidth / 2 - borderRadius,
        y: centerXY.y + edgeHeight / 2 - borderRadius
      },
      {
        x: centerXY.x + edgeWidth / 2 - borderRadius,
        y: centerXY.y + edgeHeight / 2
      },
      {
        x: centerXY.x - edgeWidth / 2 + borderRadius,
        y: centerXY.y + edgeHeight / 2
      },
      {
        r: borderRadius,
        x: centerXY.x - edgeWidth / 2 + borderRadius,
        y: centerXY.y + edgeHeight / 2 - borderRadius
      },
      {
        x: centerXY.x - edgeWidth / 2,
        y: centerXY.y + edgeHeight / 2 - borderRadius
      },
      {
        x: centerXY.x - edgeWidth / 2,
        y: centerXY.y - edgeHeight / 2 + borderRadius
      },
      {
        r: borderRadius,
        x: centerXY.x - edgeWidth / 2 + borderRadius,
        y: centerXY.y - edgeHeight / 2 + borderRadius
      }
    ]
  } else {
    return [
      {
        x: centerXY.x - edgeWidth / 2,
        y: centerXY.y - edgeHeight / 2
      },
      {
        x: centerXY.x + edgeWidth / 2,
        y: centerXY.y - edgeHeight / 2
      },
      {
        x: centerXY.x + edgeWidth / 2,
        y: centerXY.y + edgeHeight / 2
      },
      {
        x: centerXY.x - edgeWidth / 2,
        y: centerXY.y + edgeHeight / 2
      }
    ]
  }
}
// 菱形，通过中心点以及宽高计算顶点
const getDiamondVertex = (graphWidth, graphHeight, centerXY) => {
  return [
    {
      x: centerXY.x,
      y: centerXY.y - graphHeight / 2
    },
    {
      x: centerXY.x + graphWidth / 2,
      y: centerXY.y
    },
    {
      x: centerXY.x,
      y: centerXY.y + graphHeight / 2
    },
    {
      x: centerXY.x - graphWidth / 2,
      y: centerXY.y
    }
  ]
}
// 平行四边形，通过中心点以及宽高计算顶点, 倾斜系数(宽的比例)
const getParallelogramVertex = (graphWidth, graphHeight, centerXY, tiltIndex = 0.2) => {
  const translateX = graphWidth * tiltIndex
  return [
    {
      x: centerXY.x - graphWidth / 2 + translateX,
      y: centerXY.y - graphHeight / 2
    },
    {
      x: centerXY.x + graphWidth / 2,
      y: centerXY.y - graphHeight / 2
    },
    {
      x: centerXY.x + graphWidth / 2 - translateX,
      y: centerXY.y + graphHeight / 2
    },
    {
      x: centerXY.x - graphWidth / 2,
      y: centerXY.y + graphHeight / 2
    }
  ]
}
// 文件，通过中心点以及宽高计算顶点, 波系数(高的比例), 波点插值系数(宽的比例)
const getFillVertex = (graphWidth, graphHeight, centerXY, waveIndex = 0.1, wavePointIndex = 0.4) => {
  const translateY = graphHeight * waveIndex
  return [
    {
      x: centerXY.x - graphWidth / 2,
      y: centerXY.y - graphHeight / 2
    },
    {
      x: centerXY.x + graphWidth / 2,
      y: centerXY.y - graphHeight / 2
    }
  ].concat(
    getNewData(
      [
        {
          x: centerXY.x + graphWidth / 2,
          y: centerXY.y + graphHeight / 2 - translateY
        },
        {
          x: centerXY.x + graphWidth / 4,
          y: centerXY.y + graphHeight / 2 - translateY * 2
        },
        {
          x: centerXY.x - graphWidth / 4,
          y: centerXY.y + graphHeight / 2
        },
        {
          x: centerXY.x - graphWidth / 2,
          y: centerXY.y + graphHeight / 2 - translateY
        }
      ],
      Math.ceil(graphWidth * wavePointIndex)
    )
  )
}

// 曲线
const getCurveVertex = (vertex, pointsPow = 0.4) => {
  let length = 0
  for (let i = 0; i < vertex.length - 1; i++) {
    length += Math.sqrt(Math.pow(vertex[i].x - vertex[i + 1].x, 2) + Math.pow(vertex[i].y - vertex[i + 1].y, 2))
  }
  length = Math.ceil(length)
  return getNewData(vertex, length * pointsPow)
}
// 曲线 插值
const getNewData = (pointsOrigin, pointsPow) => {
  const points = []
  const divisions = (pointsOrigin.length - 1) * pointsPow
  for (let i = 0; i < divisions; i++) {
    points.push(getPoint(i, divisions, pointsOrigin, pointsPow))
  }
  return points
}
const getPoint = (i, divisions, pointsOrigin, pointsPow) => {
  const isRealI = (i * divisions) % pointsPow
  const p = ((pointsOrigin.length - 1) * i) / divisions
  const intPoint = Math.floor(p)
  const weight = p - intPoint
  const p0 = pointsOrigin[intPoint === 0 ? intPoint : intPoint - 1]
  const p1 = pointsOrigin[intPoint]
  const p2 = pointsOrigin[intPoint > pointsOrigin.length - 2 ? pointsOrigin.length - 1 : intPoint + 1]
  const p3 = pointsOrigin[intPoint > pointsOrigin.length - 3 ? pointsOrigin.length - 1 : intPoint + 2]
  return {
    isReal: isRealI === 0,
    x: catmullRom(weight, p0.x, p1.x, p2.x, p3.x),
    y: catmullRom(weight, p0.y, p1.y, p2.y, p3.y)
  }
}
const catmullRom = (t, p0, p1, p2, p3) => {
  const v0 = (p2 - p0) * 0.5
  const v1 = (p3 - p1) * 0.5
  const t2 = t * t
  const t3 = t * t2
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1
}

// 圆弧线
const getArcVertex = (xy, r, startDeg, endDeg, pointsPow = 1) => {
  const degRang = Math.abs(endDeg - startDeg)
  const pointNum = Math.ceil((degRang / (Math.PI * 2)) * 2 * Math.PI * r * pointsPow)
  const degStep = degRang / pointNum
  const vertex = []
  for (let i = 0; i <= pointNum; i++) {
    vertex.push({
      x: xy.x + Math.sin(startDeg + degStep * i) * r,
      y: xy.y - Math.cos(startDeg + degStep * i) * r
    })
  }
  return vertex
}

// 获取线条的顶点及中心点
const getLineVertex = vertex => {
  const lineVertex = []
  let i = 0
  for (i = 0; i < vertex.length - 1; i++) {
    lineVertex.push(vertex[i])
    lineVertex.push({
      x: +((vertex[i].x + vertex[i + 1].x) / 2).toFixed(2),
      y: +((vertex[i].y + vertex[i + 1].y) / 2).toFixed(2)
    })
  }
  lineVertex.push(vertex[i])
  return lineVertex
}
// 获取曲线的顶点及中心点
const getCurveLineVertex = (vertex, curveVertex) => {
  const lineVertex = []
  let i = 0
  for (i = 0; i < vertex.length - 1; i++) {
    lineVertex.push(vertex[i])
    lineVertex.push(curveVertex[Math.ceil((curveVertex.length * (i + 0.5)) / (vertex.length - 1))])
  }
  lineVertex.push(vertex[i])
  return lineVertex
}

// 已知直线线上x点，求线上y点
const getLineYByX = ({ x, y }, LineVertex) => {
  if (approximatelyEqual(LineVertex[0].x, LineVertex[1].x)) {
    return y
  }
  return LineVertex[0].y - ((LineVertex[0].y - LineVertex[1].y) / (LineVertex[0].x - LineVertex[1].x)) * (LineVertex[0].x - x)
}

// 判断点是否在图形内部
const vertexInGraph = (vertex, graphCenterVertex, graphEdgeVertex, graphR, graphHR) => {
  let vertexInGraph = false
  if (graphEdgeVertex && graphEdgeVertex.length) {
    vertexInGraph = true
    // 若点在图形内，则点 必在 图形两两顺时针顺序顶点所构成直线的右侧
    for (let i = 0; i < graphEdgeVertex.length; i++) {
      const startVertex = graphEdgeVertex[i]
      let endVertex = null
      if (i === graphEdgeVertex.length - 1) {
        endVertex = graphEdgeVertex[0]
      } else {
        endVertex = graphEdgeVertex[i + 1]
      }
      if (startVertex.r || endVertex.r) {
        continue
      }
      if ((endVertex.x - startVertex.x) * (vertex.y - startVertex.y) - (endVertex.y - startVertex.y) * (vertex.x - startVertex.x) < 0) {
        vertexInGraph = false
        break
      }
    }
    if (vertexInGraph) {
      // 图形圆角边
      for (let i = 0; i < graphEdgeVertex.length; i++) {
        if (graphEdgeVertex[i].r) {
          vertexInGraph =
            vertexInGraph || Math.pow(vertex.x - graphEdgeVertex[i].x, 2) + Math.pow(vertex.y - graphEdgeVertex[i].y, 2) < Math.pow(graphEdgeVertex[i].r, 2)
        }
      }
    }
  } else if (graphHR) {
    // 椭圆
    vertexInGraph = Math.pow(vertex.x - graphCenterVertex.x, 2) + Math.pow(((vertex.y - graphCenterVertex.y) * graphR) / graphHR, 2) <= Math.pow(graphR, 2)
  } else {
    vertexInGraph = Math.pow(vertex.x - graphCenterVertex.x, 2) + Math.pow(vertex.y - graphCenterVertex.y, 2) <= Math.pow(graphR, 2)
  }
  return vertexInGraph
}

// 判断点是否在线上
const vertexInLines = (vertex, LineVertex, LineWidth) => {
  let vertexInLines = false
  let i = 0
  for (i = 0; i < LineVertex.length - 1; i++) {
    const startVertex = LineVertex[i]
    const endVertex = LineVertex[i + 1]
    if (startVertex.x === endVertex.x && startVertex.y === endVertex.y) {
      continue
    }
    const x = startVertex.x - endVertex.x
    const y = startVertex.y - endVertex.y
    const l = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
    const translateX = ((y / l) * LineWidth) / 2
    const translateY = ((x / l) * LineWidth) / 2
    const graphEdgeVertex = [
      {
        x: startVertex.x - translateX,
        y: startVertex.y + translateY
      },
      {
        x: endVertex.x - translateX,
        y: endVertex.y + translateY
      },
      {
        x: endVertex.x + translateX,
        y: endVertex.y - translateY
      },
      {
        x: startVertex.x + translateX,
        y: startVertex.y - translateY
      }
    ]

    vertexInLines = vertexInGraph(vertex, null, graphEdgeVertex)
    if (vertexInLines) {
      break
    }
  }
  if (vertexInLines) {
    return [i, i + 1]
  }
  return false
}

// 获取直线与图形的交点
const getLineAndGraphIntersection = (edgeWidth, graphVertex, startVertex, endVertex) => {
  // 直线方程1系数
  const a1 = endVertex.y - startVertex.y
  const b1 = startVertex.x - endVertex.x
  const c1 = -(a1 * endVertex.x + b1 * endVertex.y)
  if (graphVertex && graphVertex.length) {
    // 多边形
    // 多边形直线边
    for (let i = 0; i < graphVertex.length; i++) {
      const graphStartVertex = graphVertex[i]
      let graphEndVertex = null
      if (i === graphVertex.length - 1) {
        graphEndVertex = graphVertex[0]
      } else {
        graphEndVertex = graphVertex[i + 1]
      }
      if (graphStartVertex.r || graphEndVertex.r) {
        continue
      }
      const a2 = approximatelyEqual(graphEndVertex.y - graphStartVertex.y) ? 0 : graphEndVertex.y - graphStartVertex.y
      const b2 = approximatelyEqual(graphStartVertex.x - graphEndVertex.x) ? 0 : graphStartVertex.x - graphEndVertex.x
      const c2 = -(a2 * graphEndVertex.x + b2 * graphEndVertex.y)
      if ((a1 === 0 && a2 === 0) || (b1 === 0 && b2 === 0) || a1 / a2 === b1 / b2) {
        // 平行/重合
        if (c1 === c2) {
          // 重合
          if ((a1 === 0 && a2 === 0) || a1 / a2 === b1 / b2) {
            // 平行于x轴的直线 或者 斜线(也可用下方平行于y轴的直线逻辑处理)
            if (
              (approximatelyGreaterEqual(endVertex.x, graphStartVertex.x) && approximatelyLessEqual(startVertex.x, graphStartVertex.x)) ||
              (approximatelyLessEqual(endVertex.x, graphStartVertex.x) && approximatelyGreaterEqual(startVertex.x, graphStartVertex.x))
            ) {
              // 有交点 返回graphStartVertex
              return graphStartVertex
            } else if (
              (approximatelyLessEqual(endVertex.x, graphEndVertex.x) && approximatelyGreaterEqual(startVertex.x, graphEndVertex.x)) ||
              (approximatelyGreaterEqual(endVertex.x, graphEndVertex.x) && approximatelyLessEqual(startVertex.x, graphEndVertex.x))
            ) {
              // 有交点 返回graphEndVertex
              return graphEndVertex
            }
          } else if (b1 === 0 && b2 === 0) {
            // 平行于y轴的直线
            if (
              (approximatelyGreaterEqual(endVertex.y, graphStartVertex.y) && approximatelyLessEqual(startVertex.y, graphStartVertex.y)) ||
              (approximatelyLessEqual(endVertex.y < graphStartVertex.y) && approximatelyGreaterEqual(startVertex.y, graphStartVertex.y))
            ) {
              // 有交点 返回graphStartVertex
              return graphStartVertex
            } else if (
              (approximatelyLessEqual(endVertex.y, graphEndVertex.y) && approximatelyGreaterEqual(startVertex.y, graphEndVertex.y)) ||
              (approximatelyGreaterEqual(endVertex.y > graphEndVertex.y) && approximatelyLessEqual(startVertex.y < graphEndVertex.y))
            ) {
              // 有交点 返回graphEndVertex
              return graphEndVertex
            }
          }
        }
        continue
      } else {
        const vertex = {
          x: (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1),
          y: (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1)
        }
        if (compareVertexInSection(vertex, startVertex, endVertex, graphStartVertex, graphEndVertex)) {
          // 有交点 返回vertex
          return vertex
        }
      }
    }
    // 多边形圆角边
    for (let i = 0; i < graphVertex.length; i++) {
      if (graphVertex[i].r) {
        const vertex = getLineAndArcIntersection(graphVertex[i].r, endVertex, graphVertex[i], startVertex, endVertex)
        if (vertex) {
          return vertex
        }
      }
    }
  } else {
    return getLineAndArcIntersection(edgeWidth, startVertex, endVertex, startVertex, endVertex)
  }
  return
}
// 获取直线与圆的交点
const getLineAndArcIntersection = (R, startVertex, endVertex, compareStartVertex, compareEndVertex) => {
  const a1 = endVertex.y - startVertex.y
  const b1 = startVertex.x - endVertex.x
  const c1 = -(a1 * endVertex.x + b1 * endVertex.y)
  // 圆
  if (b1 === 0) {
    // 平行于y轴的直线 x = c/a
    let vertex = {
      x: endVertex.x,
      y: endVertex.y - R
    }
    if (compareVertexInSection(vertex, startVertex, endVertex, compareStartVertex, compareEndVertex)) {
      return vertex
    } else {
      vertex = {
        x: endVertex.x,
        y: endVertex.y + R
      }
      return vertex
    }
  } else {
    // ax + by + c = 0 => y = -a/b*x - c/b
    const k = -a1 / b1
    const b = -c1 / b1
    // (x+c)(x+c) + (y+d)(y+d) = r*r
    const c = -endVertex.x
    const d = -endVertex.y
    const r = R
    let vertex = {
      x: -(Math.sqrt((k * k + 1) * r * r - c * c * k * k + (2 * c * d + 2 * b * c) * k - d * d - 2 * b * d - b * b) + (d + b) * k + c) / (k * k + 1),
      y: -((Math.sqrt(k * k * r * r + r * r - c * c * k * k + 2 * c * d * k + 2 * b * c * k - d * d - 2 * b * d - b * b) + c) * k + d * k * k - b) / (k * k + 1)
    }
    if (compareVertexInSection(vertex, startVertex, endVertex, compareStartVertex, compareEndVertex)) {
      return vertex
    } else {
      vertex = {
        x: (Math.sqrt((k * k + 1) * r * r - c * c * k * k + (2 * c * d + 2 * b * c) * k - d * d - 2 * b * d - b * b) + (-d - b) * k - c) / (k * k + 1),
        y:
          -((c - Math.sqrt(k * k * r * r + r * r - c * c * k * k + 2 * c * d * k + 2 * b * c * k - d * d - 2 * b * d - b * b)) * k + d * k * k - b) /
          (k * k + 1)
      }
      if (compareVertexInSection(vertex, startVertex, endVertex, compareStartVertex, compareEndVertex)) {
        return vertex
      }
    }
  }
}
// 判断交点是否在两条直线的范围内
const compareVertexInSection = (vertex, startVertex, endVertex, compareStartVertex, compareEndVertex) => {
  return (
    ((approximatelyGreaterEqual(vertex.x, startVertex.x) && approximatelyLessEqual(vertex.x, endVertex.x)) ||
      (approximatelyLessEqual(vertex.x, startVertex.x) && approximatelyGreaterEqual(vertex.x, endVertex.x))) &&
    ((approximatelyGreaterEqual(vertex.y, startVertex.y) && approximatelyLessEqual(vertex.y, endVertex.y)) ||
      (approximatelyLessEqual(vertex.y, startVertex.y) && approximatelyGreaterEqual(vertex.y, endVertex.y))) &&
    ((approximatelyGreaterEqual(vertex.x, compareStartVertex.x) && approximatelyLessEqual(vertex.x, compareEndVertex.x)) ||
      (approximatelyLessEqual(vertex.x, compareStartVertex.x) && approximatelyGreaterEqual(vertex.x, compareEndVertex.x))) &&
    ((approximatelyGreaterEqual(vertex.y, compareStartVertex.y) && approximatelyLessEqual(vertex.y, compareEndVertex.y)) ||
      (approximatelyLessEqual(vertex.y, compareStartVertex.y) && approximatelyGreaterEqual(vertex.y, compareEndVertex.y)))
  )
}

// 箭头坐标 已知正三角形顶点、中线圆外一点、边长，求与圆相交的另外两点的坐标作为箭头的另外两点
const getTriangleVertex = (vertex, edgeCenterVertex, edgeWidth) => {
  let vertex2
  let vertex3
  // 直线方程1系数
  const b1 = approximatelyEqual(vertex.x, edgeCenterVertex.x) ? 0 : vertex.x - edgeCenterVertex.x
  if (b1 === 0) {
    // 平行于y轴的直线 x = 1/a
    let y
    if (approximatelyGreaterEqual(edgeCenterVertex.y, vertex.y)) {
      // 箭头向上
      y = vertex.y + Math.cos((30 / 180) * Math.PI) * edgeWidth
    } else {
      // 箭头向下
      y = vertex.y - Math.cos((30 / 180) * Math.PI) * edgeWidth
    }
    vertex2 = {
      x: vertex.x + Math.sin((30 / 180) * Math.PI) * edgeWidth,
      y
    }
    vertex3 = {
      x: vertex.x - Math.sin((30 / 180) * Math.PI) * edgeWidth,
      y
    }
  } else {
    const r = Math.sqrt(Math.pow(edgeCenterVertex.x - vertex.x, 2) + Math.pow(edgeCenterVertex.y - vertex.y, 2))
    const edgeCenterVertex0 = {
      x: edgeCenterVertex.x - vertex.x,
      y: edgeCenterVertex.y - vertex.y
    }
    const angle = Math.atan2(edgeCenterVertex0.y, edgeCenterVertex0.x)
    const edgeCenterVertex2 = {
      x: Math.cos((30 / 180) * Math.PI + angle) * r + vertex.x,
      y: Math.sin((30 / 180) * Math.PI + angle) * r + vertex.y
    }
    vertex2 = getLineAndGraphIntersection(edgeWidth, [], edgeCenterVertex2, vertex)
    const edgeCenterVertex3 = {
      x: Math.cos((-30 / 180) * Math.PI + angle) * r + vertex.x,
      y: Math.sin((-30 / 180) * Math.PI + angle) * r + vertex.y
    }
    vertex3 = getLineAndGraphIntersection(edgeWidth, [], edgeCenterVertex3, vertex)
  }
  const triangleVertex = [vertex, vertex2, vertex3]
  return triangleVertex
}

// 已知类正三角形三个顶点  求三角形顶点两边上某y点的x坐标
const getTriangleEdgeX = (vertex, y) => {
  // ax + by + c = 0 => y = -a/b*x - c/b => x = (y + c/b)*(-b/a)
  const x = []
  // 直线方程1系数
  const a1 = vertex[1].y - vertex[0].y
  const b1 = vertex[0].x - vertex[1].x
  const c1 = -(a1 * vertex[1].x + b1 * vertex[1].y)
  x.push((y + c1 / b1) * (-b1 / a1))
  // 直线方程2系数
  const a2 = vertex[2].y - vertex[0].y
  const b2 = vertex[0].x - vertex[2].x
  const c2 = -(a2 * vertex[2].x + b2 * vertex[2].y)
  x.push((y + c2 / b2) * (-b2 / a2))
  return x
}

// 判断图形是否在canvas范围内
const graphInCanvas = (range, canvasRange) => {
  return range.left < canvasRange.right && range.right > canvasRange.left && range.top < canvasRange.bottom && range.bottom > canvasRange.top
}

/* -------------------------------------------------------------------------------------------*/

// 数据存储图像处理
const getSaveImageData = obj => {
  if (!obj.graphList.length) {
    return ''
  }

  let position = {
    top: null,
    right: null,
    bottom: null,
    left: null
  }
  let init = true
  obj.graphList.forEach(item => {
    if (init) {
      position = {
        top: item.graphRange.top,
        right: item.graphRange.right,
        bottom: item.graphRange.bottom,
        left: item.graphRange.left
      }
      init = false
    } else {
      position = positionCompare(position, item.graphRange)
    }
  })
  position.top -= obj.saveImagePadding
  position.right += obj.saveImagePadding
  position.bottom += obj.saveImagePadding
  position.left -= obj.saveImagePadding

  const width = (position.right - position.left) / obj.dpr
  const height = (position.bottom - position.top) / obj.dpr

  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  canvas.style.position = 'fixed'
  canvas.style.left = -width + 'px'
  canvas.style.top = -height + 'px'
  canvas.style.left = 0
  canvas.style.top = 0

  const DrawingBoardFlowClass = new obj.constructor({
    canvas,
    eventFlag: false,
    gridStyle: { show: false },
    dpr: obj.dpr,
    bgColor: obj.bgColor,
    saveImagePadding: obj.saveImagePadding
  })

  const translate = {
    x: position.left,
    y: position.top
  }
  obj.graphList.forEach(item => {
    const data = {
      canvas: canvas,
      scaleC: DrawingBoardFlowClass.scaleC,
      autoDraw: false,
      style: item.style,
      id: item.id,
      dpr: item.dpr,
      content: item.content
    }
    if (item.graphType === 'graph') {
      data.xy = deepClone(item.xy)
      data.xy.x = data.xy.x - translate.x
      data.xy.y = data.xy.y - translate.y
    } else {
      data.vertex = deepClone(item.vertex)
      data.vertex.forEach(vertex => {
        vertex.x = vertex.x - translate.x
        vertex.y = vertex.y - translate.y
      })
    }
    DrawingBoardFlowClass.addGraphToList(new item.constructor(data))
  })

  const base64 = canvas.toDataURL('image/jpeg')

  document.body.removeChild(canvas)

  return {
    base64,
    width,
    height
  }
}
const positionCompare = (oldPosition, newPosition) => {
  if (oldPosition.top > newPosition.top) {
    oldPosition.top = newPosition.top
  }
  if (oldPosition.right < newPosition.right) {
    oldPosition.right = newPosition.right
  }
  if (oldPosition.bottom < newPosition.bottom) {
    oldPosition.bottom = newPosition.bottom
  }
  if (oldPosition.left > newPosition.left) {
    oldPosition.left = newPosition.left
  }
  return oldPosition
}

// dpr变动 样式转化
const dprToGraphStyle = (style, dprIndex) => {
  const keys = ['width', 'height', 'strokeWidth', 'padding', 'marging']
  const textKeys = ['lineHeight', 'fontSize']
  const focusKeys = ['strokeWidth', 'lineDash']
  const focusPointKeys = ['r', 'virtualR']

  keys.forEach(key => {
    if (!style[key]) {
      return
    }
    if (key === 'padding' || key === 'marging') {
      style[key] = convertMorP(style[key])
      style[key][0] *= dprIndex
      style[key][1] *= dprIndex
      style[key][2] *= dprIndex
      style[key][3] *= dprIndex
    } else {
      style[key] *= dprIndex
    }
  })
  if (style.text) {
    textKeys.forEach(key => {
      if (!style.text[key]) {
        return
      }
      style.text[key] *= dprIndex
    })
  }
  if (style.hover) {
    keys.forEach(key => {
      if (!style.hover[key]) {
        return
      }
      style.hover[key] *= dprIndex
    })
  }
  if (style.hover && style.hover.text) {
    textKeys.forEach(key => {
      if (!style.hover.text[key]) {
        return
      }
      style.hover.text[key] *= dprIndex
    })
  }
  if (style.focus) {
    focusKeys.forEach(key => {
      if (!style.focus[key]) {
        return
      }
      style.focus[key] *= dprIndex
    })
  }
  if (style.focus && style.focus.point) {
    focusPointKeys.forEach(key => {
      if (!style.focus.point[key]) {
        return
      }
      style.focus.point[key] *= dprIndex
    })
  }

  return style
}
const dprToLineStyle = (style, dprIndex) => {
  const keys = ['strokeWidth', 'strokeVirtualWidth', 'triangleEdgeWidth']
  const textKeys = ['lineHeight', 'fontSize']
  const focusPointKeys = ['r', 'virtualR']
  const focusEmptyPointKeys = ['r', 'virtualR']

  keys.forEach(key => {
    if (!style[key]) {
      return
    }
    if (key === 'padding' || key === 'marging') {
      style[key] = convertMorP(style[key])
      style[key][0] *= dprIndex
      style[key][1] *= dprIndex
      style[key][2] *= dprIndex
      style[key][3] *= dprIndex
    } else {
      style[key] *= dprIndex
    }
  })
  if (style.text) {
    textKeys.forEach(key => {
      if (!style.text[key]) {
        return
      }
      style.text[key] *= dprIndex
    })
  }
  if (style.hover) {
    keys.forEach(key => {
      if (!style.hover[key]) {
        return
      }
      style.hover[key] *= dprIndex
    })
  }
  if (style.hover && style.hover.text) {
    textKeys.forEach(key => {
      if (!style.hover.text[key]) {
        return
      }
      style.hover.text[key] *= dprIndex
    })
  }
  if (style.focus && style.focus.point) {
    focusPointKeys.forEach(key => {
      if (!style.focus.point[key]) {
        return
      }
      style.focus.point[key] *= dprIndex
    })
  }
  if (style.focus && style.focus.emptyPoint) {
    focusEmptyPointKeys.forEach(key => {
      if (!style.focus.emptyPoint[key]) {
        return
      }
      style.focus.emptyPoint[key] *= dprIndex
    })
  }

  return style
}

export {
  dpr,
  isM,
  rand,
  local,
  getDom,
  echoError,
  echoWarn,
  getType,
  isCanvasDom,
  approximatelyEqual,
  deepClone,
  getRepetNum,
  getArrayIntersection,
  getStr,
  objectMerge,
  convertMorP,
  getDataDepth,
  htmlStr2textArr,
  getGraphWidthOrHeight,
  eInDom,
  textLastPos,
  getGraphVertex,
  getRectangleVertex,
  getDiamondVertex,
  getParallelogramVertex,
  getFillVertex,
  getCurveVertex,
  getArcVertex,
  getLineVertex,
  getCurveLineVertex,
  getLineYByX,
  vertexInGraph,
  vertexInLines,
  getLineAndGraphIntersection,
  getTriangleVertex,
  getTriangleEdgeX,
  graphInCanvas,
  getSaveImageData,
  dprToGraphStyle,
  dprToLineStyle
}
