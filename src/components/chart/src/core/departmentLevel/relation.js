import DepartmentCrossLevel from './index'
import * as lineList from '../lineList.js'
import { dpr, objectMerge, getType } from '../../util/helper.js'

const style = {
  relationLine: 'CurveLine',
  relationLineStyle: {
    strokeWidth: 1 * dpr,
    strokeColor: '#333333',
    globalAlpha: 1,
    hover: {
      globalAlpha: 1,
      show: false
    },
    focus: {
      show: false
    }
  }
}

export default class RelationDepartmentCrossLevel extends DepartmentCrossLevel {
  constructor(opt) {
    opt.style = objectMerge(style, opt.style)
    super(opt)

    this.relationKey = opt.relationKey
    this.relationLineShow = getType(opt.relationLineShow) === 'Boolean' ? opt.relationLineShow : true

    this.mousemoveNextCb = this.mousemoveCb
    this.mousemoveCb = this.hijackMousemoveCb
  }
  initData() {
    this.oldNoRelationData = []
    this.oldRelationData = []
    this.oldRelationClass = []
    this.style.relationLine = lineList[this.style.relationLine]

    super.initData()
  }
  hijackMouseupBtn0Cb(xy, item) {
    this.clearOldData()
    super.hijackMouseupBtn0Cb(xy, item)
  }
  hijackMousemoveCb(graph) {
    let hoverData = null
    if (graph && graph.graphType === 'graph' && this.relationKey && this.relationKey.length) {
      if (!this.oldNoRelationData.length || this.oldNoRelationData[0].id !== graph.id) {
        this.clearOldData()
        this.oldNoRelationData.push(graph)
        hoverData = this.getDataByClass(graph, this.optData)
        const hoverDataRelationUuid = this.getDataRelationUuid([hoverData])
        this.setRelationDataHover(hoverDataRelationUuid, this.optData)

        if (this.relationLineShow) {
          const Line = this.style.relationLine
          const graphY = graph.xy.y + graph.style.height / 2
          this.oldRelationData.forEach(item => {
            const itemY = item.xy.y + item.style.height / 2
            const lineClass = new Line({
              canvas: this.canvas,
              scaleC: this.scaleC,
              vertex: [
                {
                  x: graph.xy.x,
                  y: graphY
                },
                {
                  x: (graph.xy.x + item.xy.x) / 2,
                  y: graphY > itemY ? graphY + graph.style.height : itemY + item.style.height
                },
                {
                  x: item.xy.x,
                  y: itemY
                }
              ],
              autoDraw: false,
              style: hoverData.style.relationLineStyle,
              id: ++this.graphId
            })
            this.oldRelationClass.push(lineClass)
            this.graphList.push(lineClass)
          })
        }
      }
      graph.setHoverStatus(false)
      this.addTask()
    } else if (this.oldNoRelationData.length) {
      this.clearOldData()
      this.addTask()
    }
    this.mousemoveNextCb && this.mousemoveNextCb({ graph, hoverData })
  }
  clearOldData() {
    this.oldNoRelationData.forEach(item => {
      item.setHoverStatus(false)
    })
    this.oldNoRelationData = []
    this.oldRelationData = []
    if (this.oldRelationClass && this.oldRelationClass.length) {
      for (let i = this.oldRelationClass.length - 1; i > -1; i--) {
        for (let j = this.graphList.length - 1; j > -1; j--) {
          if (this.graphList[j].id === this.oldRelationClass[i].id) {
            this.graphList.splice(j, 1)
            break
          }
        }
      }
    }
    this.oldRelationClass = []
  }
  getDataRelationUuid(data) {
    const hoverDataRelationUuid = {}
    data.forEach(item => {
      if (item.children && item.children.length) {
        const childrenHoverDataRelationUuid = this.getDataRelationUuid(item.children)
        Object.keys(childrenHoverDataRelationUuid).forEach(key => {
          if (!hoverDataRelationUuid[key]) {
            hoverDataRelationUuid[key] = []
          }
          hoverDataRelationUuid[key] = hoverDataRelationUuid[key].concat(childrenHoverDataRelationUuid[key])
        })
      } else {
        this.relationKey.forEach(key => {
          if (item[key] && item[key].length) {
            if (!hoverDataRelationUuid[key]) {
              hoverDataRelationUuid[key] = []
            }
            hoverDataRelationUuid[key] = hoverDataRelationUuid[key].concat(item[key])
          }
        })
      }
    })
    return hoverDataRelationUuid
  }
  setRelationDataHover(uuid, data, parentShow = true) {
    let hover = true
    let childShowAndHover = false
    data.forEach(item => {
      if (!parentShow) {
        item.show = parentShow
      }
      if (item.children && item.children.length) {
        const result = this.setRelationDataHover(uuid, item.children, item.show)
        if (result.hover) {
          if (item.graphClass) {
            item.graphClass.setHoverStatus(true)
            this.oldNoRelationData.push(item.graphClass)
          }
        } else {
          hover = false
          if (item.show && parentShow && !result.childShowAndHover && item.graphClass) {
            this.oldRelationData.push(item.graphClass)
          }
        }
        if (item.show && parentShow && item.lineClassArr && item.lineClassArr.length) {
          let i = 0
          item.children.forEach((childrenItem, index) => {
            if (childrenItem.show) {
              if (item.children[index].graphClass && item.children[index].graphClass.hover) {
                item.lineClassArr[i].setHoverStatus(true)
                this.oldNoRelationData.push(item.lineClassArr[i])
              }
              i++
            }
          })
        }
      } else {
        let hoverFlag = true
        Object.keys(uuid).forEach(key => {
          if (uuid[key].indexOf(item.uuid) > -1) {
            hover = false
            hoverFlag = false
            if (item.show && parentShow && item.graphClass) {
              this.oldRelationData.push(item.graphClass)
            }
          }
        })
        if (hoverFlag && item.graphClass) {
          item.graphClass.setHoverStatus(true)
          this.oldNoRelationData.push(item.graphClass)
        }
      }

      // 显示（自身及所有父级都展示，才证明出现在画布中) 并且 被关联   为证明父级存在展示关联的子级
      if (item.show && parentShow && !item.graphClass.hover) {
        childShowAndHover = true
      }
    })
    return { hover, childShowAndHover }
  }
}
