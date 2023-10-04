import { deepClone, getType, dpr, vertexInGraph, vertexInLines, textLastPos, eInDom, isM } from '../util/helper.js'
import TaskQueue from './taskQueue'
export default class Event extends TaskQueue {
  constructor(opt) {
    super(opt)
    if (opt.scaleCIndex) {
      this.scaleCIndex = getType(opt.scaleCIndex) === 'Number' ? opt.scaleCIndex : 100
      this.scaleC = this.scaleCIndex / 100
    } else {
      this.scaleC = getType(opt.scaleC) === 'Number' ? opt.scaleC : 1
      this.scaleCIndex = this.scaleC * 100
    }

    this.eventFlag = getType(opt.eventFlag) === 'Boolean' ? opt.eventFlag : false
    this.mouseScaleIndex = getType(opt.mouseScaleIndex) === 'Number' ? opt.mouseScaleIndex : 5

    this.mousemoveCb = getType(opt.mousemoveCb) === 'Function' ? opt.mousemoveCb : null
    this.mouseupBtn0Cb = getType(opt.mouseupBtn0Cb) === 'Function' ? opt.mouseupBtn0Cb : null
    this.mouseupDBBtn0Cb = getType(opt.mouseupDBBtn0Cb) === 'Function' ? opt.mouseupDBBtn0Cb : null
    this.mouseupBtn2Cb = getType(opt.mouseupBtn2Cb) === 'Function' ? opt.mouseupBtn2Cb : null
    this.mouseupDBBtn2Cb = getType(opt.mouseupDBBtn2Cb) === 'Function' ? opt.mouseupDBBtn2Cb : null

    this.dbclickEditFlag = getType(opt.dbclickEditFlag) === 'Boolean' ? opt.dbclickEditFlag : true
    this.mousemoveGraphFlag = getType(opt.mousemoveGraphFlag) === 'Boolean' ? opt.mousemoveGraphFlag : true
    this.mousedownFocusFlag = getType(opt.mousedownFocusFlag) === 'Boolean' ? opt.mousedownFocusFlag : true
    this.mousemoveHoverFlag = getType(opt.mousemoveHoverFlag) === 'Boolean' ? opt.mousemoveHoverFlag : true

    this.resizeObserver = null
    this.resizeObserverFlag = getType(opt.resizeObserverFlag) === 'Boolean' ? opt.resizeObserverFlag : true
    this.resizeObserverAutoComputeType = getType(opt.resizeObserverAutoComputeType) === 'Boolean' ? opt.Number : 2 // 1: translate 2: scale

    this.isM = isM()
  }
  addEvent() {
    this.canvasContextmenuBind = this.canvasContextmenu.bind(this)
    this.canvasMousedownBind = this.canvasMousedown.bind(this)
    this.documentMouseupBind = this.documentMouseup.bind(this)
    this.mousewheelBind = this.mousewheel.bind(this)
    this.documentMouseMoveBind = this.documentMouseMove.bind(this)
    this.windowReSizeBind = this.windowReSize.bind(this)

    // 阻止右击默认事件
    this.canvas.addEventListener('contextmenu', this.canvasContextmenuBind)

    // mouse
    this.mousedownXY = null
    this.cumulativeTranslate = { x: 0, y: 0 }
    this.moveFlag = false
    this.isDBClick = false
    this.mouseUpTimer = null
    // hover
    this.hoverGraphOrLine = null
    // focus
    this.focusGraphOrLine = null
    this.focusGraphOrLineIndex = null
    this.vertexFocusSelectionIndex = null
    this.vertexFocusRightSelectionIndex = null
    // edit
    this.dbClickTimer = null
    this.editGraphOrLine = null
    this.editLineVertexIndex = []
    this.contenteditableDom = null

    // mousedown,mousemove,mouseeup
    if (this.isM) {
      this.canvas.addEventListener('touchstart', this.canvasMousedownBind)
      document.addEventListener('touchmove', this.documentMouseMoveBind)
    } else {
      this.canvas.addEventListener('mousedown', this.canvasMousedownBind)
      document.addEventListener('mousemove', this.documentMouseMoveBind)
    }

    this.scaleFlag = false
    this.canvas.addEventListener('mousewheel', this.mousewheelBind)

    if (this.resizeObserverFlag) {
      window.addEventListener('resize', this.windowReSizeBind)
      this.resizeObserver = new window.MutationObserver(() => {
        if (this.canvas.width !== Math.floor(this.canvas.offsetWidth * this.dpr) || this.canvas.height !== Math.floor(this.canvas.offsetHeight * this.dpr)) {
          this.windowReSizeBind()
        }
      })
      this.resizeObserver.observe(window.document.body, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true,
        attributeFilter: ['style'],
        attributeOldValue: true
      })
    }
  }
  removeEvent() {
    super.removeEvent()
    if (this.isM) {
      this.canvasMousedownBind && this.canvas.removeEventListener('touchstart', this.canvasMousedownBind)
      this.documentMouseMoveBind && document.removeEventListener('touchmove', this.documentMouseMoveBind)
      this.documentMouseupBind && document.removeEventListener('touchend', this.documentMouseupBind)
    } else {
      this.canvasMousedownBind && this.canvas.removeEventListener('mousedown', this.canvasMousedownBind)
      this.documentMouseMoveBind && document.removeEventListener('mousemove', this.documentMouseMoveBind)
      this.documentMouseupBind && document.removeEventListener('mouseup', this.documentMouseupBind)
    }
    this.canvasContextmenuBind && this.canvas.removeEventListener('contextmenu', this.canvasContextmenuBind)
    this.mousewheelBind && this.canvas.removeEventListener('mousewheel', this.mousewheelBind)

    this.dbClickTimer && clearTimeout(this.dbClickTimer)
    this.mouseUpTimer && clearTimeout(this.mouseUpTimer)

    this.windowReSizeBind && window.removeEventListener('resize', this.windowReSizeBind)
    this.resizeObserver && this.resizeObserver.disconnect()
  }
  canvasContextmenu(e) {
    if (e.button === 2) {
      e.preventDefault()
    }
  }
  windowReSize() {
    this.addTask(() => {
      if (this.resizeObserverAutoComputeType === 1) {
        this.formatDataTranslate({
          x: ((Math.floor(this.canvas.offsetWidth * this.dpr) - this.canvas.width) / 2) * this.scaleC,
          y: ((Math.floor(this.canvas.offsetHeight * this.dpr) - this.canvas.height) / 2) * this.scaleC
        })
      } else if (this.resizeObserverAutoComputeType === 2) {
        this.formatDataTranslate({
          x: (Math.floor(this.canvas.offsetWidth * this.dpr) - this.canvas.width) / 2,
          y: (Math.floor(this.canvas.offsetHeight * this.dpr) - this.canvas.height) / 2
        })
        const widthScale = Math.floor(this.canvas.offsetWidth * this.dpr) / this.canvas.width
        const heightScale = Math.floor(this.canvas.offsetHeight * this.dpr) / this.canvas.height
        if (widthScale <= 1 && heightScale <= 1) {
          this.scaleCIndex *= heightScale < widthScale ? heightScale : widthScale
        } else if (widthScale >= 1 && heightScale >= 1) {
          this.scaleCIndex *= heightScale < widthScale ? widthScale : heightScale
        }
        this.scaleC = this.scaleCIndex / 100
        this.formatDataScale && this.formatDataScale()
      }
      this.canvas.width = Math.floor(this.canvas.offsetWidth * this.dpr)
      this.canvas.height = Math.floor(this.canvas.offsetHeight * this.dpr)
    })
  }
  canvasMousedown(e) {
    if (this.isM || (!this.isM && (e.button === 0 || e.button === 2))) {
      this.isDBClick = false
      if (this.dbClickTimer) {
        this.isDBClick = true
        clearTimeout(this.dbClickTimer)
        this.dbClickTimer = null
      } else {
        this.dbClickTimer = setTimeout(() => {
          clearTimeout(this.dbClickTimer)
          this.dbClickTimer = null
        }, 300)
      }

      if (this.isM) {
        this.mousedownXY = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        }
      } else {
        this.mousedownXY = {
          x: e.clientX,
          y: e.clientY
        }
      }
      this.cumulativeTranslate = { x: 0, y: 0 }
      const formatE = {
        x: ((this.mousedownXY.x - this.canvas.getBoundingClientRect().left) * dpr - this.canvas.width / 2) / this.scaleC + this.canvas.width / 2,
        y: ((this.mousedownXY.y - this.canvas.getBoundingClientRect().top) * dpr - this.canvas.height / 2) / this.scaleC + this.canvas.height / 2
      }

      if (this.dbclickEditFlag && e.button === 0 && this.isDBClick && this.focusGraphOrLine) {
        this.editGraphOrLine = this.focusGraphOrLine
        if (this.editGraphOrLine.graphType === 'graph') {
          this.showContenteditable(
            this.editGraphOrLine.xy,
            this.editGraphOrLine.content,
            this.editGraphOrLine.style.text,
            this.editGraphOrLine.style.width,
            this.editGraphOrLine.style.padding
          )
          this.editGraphOrLine.content = ''
          this.editGraphOrLine.drawContent = []
        } else {
          this.editLineVertexIndex = vertexInLines(formatE, this.editGraphOrLine.vertex, this.editGraphOrLine.style.strokeVirtualWidth)
          if (this.editLineVertexIndex) {
            this.showContenteditable(formatE, '', this.editGraphOrLine.style.text, 10 * dpr, 0)
          }
        }
      } else {
        // 单击取消文本编辑状态
        if (this.editGraphOrLine) {
          if (this.editGraphOrLine.graphType === 'graph') {
            this.editGraphOrLine.formatText(this.contenteditableDom.innerHTML)
            this.editGraphOrLine.setGraphRange()
          } else if (this.editGraphOrLine.graphType === 'line' && this.editLineVertexIndex) {
            this.editGraphOrLine.formatText(
              this.contenteditableDom.innerHTML,
              {
                x: this.contenteditableDom.mouseUpX,
                y: this.contenteditableDom.mouseUpY
              },
              this.editLineVertexIndex,
              {
                width: this.contenteditableDom.offsetWidth,
                height: this.contenteditableDom.offsetHeight
              },
              this
            )
          }
          this.editGraphOrLine = null
          this.editLineVertexIndex = []
          this.hideContenteditable()
        }

        // focus节点
        if (this.mousedownFocusFlag) {
          this.vertexFocusSelectionIndex = null
          if (e.button === 0 && this.focusGraphOrLine && this.focusGraphOrLine.vertexFocus && this.focusGraphOrLine.vertexFocus.length) {
            // 判断是否是图形节点操作
            for (let i = 0; i < this.focusGraphOrLine.vertexFocus.length; i++) {
              if (this.focusGraphOrLine.graphType === 'line' && i % 2) {
                if (vertexInGraph(formatE, this.focusGraphOrLine.vertexFocus[i], [], this.focusGraphOrLine.style.focus.emptyPoint.virtualR)) {
                  this.vertexFocusSelectionIndex = i
                }
              } else {
                if (vertexInGraph(formatE, this.focusGraphOrLine.vertexFocus[i], [], this.focusGraphOrLine.style.focus.point.virtualR)) {
                  this.vertexFocusSelectionIndex = i
                }
              }
            }
          }

          this.vertexFocusRightSelectionIndex = null
          if (e.button === 2 && this.focusGraphOrLine && this.focusGraphOrLine.vertex && this.focusGraphOrLine.vertex.length) {
            // 判断是否是线段节点右击操作
            for (let i = 1; i < this.focusGraphOrLine.vertex.length - 1; i++) {
              if (vertexInGraph(formatE, this.focusGraphOrLine.vertex[i], [], this.focusGraphOrLine.style.focus.point.virtualR)) {
                this.vertexFocusRightSelectionIndex = i
              }
            }
          }
        }

        // 获取点击的图形
        if (this.vertexFocusSelectionIndex === null && this.vertexFocusRightSelectionIndex === null) {
          const mousedownGraphOrLine = []

          if (eInDom(e, this.canvas)) {
            for (let i = 0; i < this.graphList.length; i++) {
              if (!this.graphList[i].inCanvasShow) {
                continue
              }
              if (this.graphList[i].graphType === 'graph') {
                if (vertexInGraph(formatE, this.graphList[i].xy, this.graphList[i].vertex, this.graphList[i].r, this.graphList[i].hr)) {
                  mousedownGraphOrLine.push({
                    graph: this.graphList[i],
                    i
                  })
                }
              } else {
                if (this.graphList[i].benchmarkType === 1) {
                  if (vertexInLines(formatE, this.graphList[i].curveVertex, this.graphList[i].style.strokeVirtualWidth)) {
                    mousedownGraphOrLine.push({
                      graph: this.graphList[i],
                      i
                    })
                  }
                } else {
                  if (vertexInLines(formatE, this.graphList[i].vertex, this.graphList[i].style.strokeVirtualWidth)) {
                    mousedownGraphOrLine.push({
                      graph: this.graphList[i],
                      i
                    })
                  }
                }
              }
            }
          }
          if (this.focusGraphOrLine) {
            this.focusGraphOrLine.focus = false
            this.focusGraphOrLineIndex = null
            this.focusGraphOrLine = null
          }
          if (mousedownGraphOrLine.length) {
            this.focusGraphOrLineIndex = mousedownGraphOrLine[mousedownGraphOrLine.length - 1].i
            this.focusGraphOrLine = mousedownGraphOrLine[mousedownGraphOrLine.length - 1].graph
            if (this.mousedownFocusFlag) {
              this.focusGraphOrLine.focus = true
            }
          }
        }
      }
      this.addTask()
      if (this.isM) {
        document.addEventListener('touchend', this.documentMouseupBind)
      } else {
        document.addEventListener('mouseup', this.documentMouseupBind)
      }
    }
    e.preventDefault()
  }
  documentMouseMove(e) {
    if (this.editGraphOrLine) {
      return
    }
    if (this.moveFlag) {
      return
    }
    if (this.mousedownXY) {
      // 长按移动
      this.moveFlag = true
      let E = null
      if (this.isM) {
        E = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        }
      } else {
        E = {
          x: e.clientX,
          y: e.clientY
        }
      }
      this.cumulativeTranslate.x += ((E.x - this.mousedownXY.x) * dpr) / this.scaleC
      this.cumulativeTranslate.y += ((E.y - this.mousedownXY.y) * dpr) / this.scaleC
      const translate = {
        x: 0,
        y: 0
      }
      if (this.moveByGrid) {
        if (Math.abs(this.cumulativeTranslate.x) > this.gridStyle.width) {
          const index = Math.floor(Math.abs(this.cumulativeTranslate.x) / this.gridStyle.width)
          translate.x = this.cumulativeTranslate.x > 0 ? this.gridStyle.width * index : -this.gridStyle.width * index
          this.cumulativeTranslate.x -= translate.x
        }
        if (Math.abs(this.cumulativeTranslate.y) > this.gridStyle.width) {
          const index = Math.floor(Math.abs(this.cumulativeTranslate.y) / this.gridStyle.width)
          translate.y = this.cumulativeTranslate.y > 0 ? this.gridStyle.width * index : -this.gridStyle.width * index
          this.cumulativeTranslate.y -= translate.y
        }
      } else {
        translate.x = this.cumulativeTranslate.x
        translate.y = this.cumulativeTranslate.y
        this.cumulativeTranslate.x = 0
        this.cumulativeTranslate.y = 0
      }
      if (this.vertexFocusSelectionIndex !== null) {
        // 图形节点操作
        if (this.focusGraphOrLine.graphType === 'graph') {
          let x = translate.x
          let y = translate.y
          switch (this.vertexFocusSelectionIndex) {
            case 0:
              x *= -1
              y *= -1
              break
            case 1:
              y *= -1
              break
            case 3:
              x *= -1
              break
          }
          if (this.focusGraphOrLine.benchmarkType === 0) {
            // 基类正多边形
            if (Math.abs(y) > Math.abs(x)) {
              this.cumulativeTranslate.y = this.cumulativeTranslate.y + translate.y - translate.x
              translate.x = x
              translate.y = x
            } else {
              this.cumulativeTranslate.x = this.cumulativeTranslate.x + translate.x - translate.y
              translate.x = y
              translate.y = y
            }
          } else {
            // 基类矩形
            translate.x = x
            translate.y = y
          }
        } else {
          // 根据网格点重新计算translate
          let selectionX = this.focusGraphOrLine.vertexFocus[this.vertexFocusSelectionIndex].x
          let selectionY = this.focusGraphOrLine.vertexFocus[this.vertexFocusSelectionIndex].y
          selectionX = (this.canvas.width / 2 - selectionX) % this.gridStyle.width
          selectionY = (this.canvas.height / 2 - selectionY) % this.gridStyle.width
          this.addTask(() => {
            this.focusGraphOrLine.graphZoom({ x: selectionX, y: selectionY }, this.vertexFocusSelectionIndex, this)
          })
        }

        this.addTask(() => {
          this.focusGraphOrLine.graphZoom(translate, this.vertexFocusSelectionIndex, this)
        })
      } else if (this.focusGraphOrLine && this.mousemoveGraphFlag) {
        // 图形拖拽操作
        if (this.focusGraphOrLine.allowTranslate) {
          this.addTask(() => {
            this.focusGraphOrLine.formatDataTranslate(translate)
          })
        }
      } else {
        // canvas拖拽操作
        this.addTask(() => {
          this.formatDataTranslate(translate)
        })
      }

      if (this.isM) {
        this.mousedownXY = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        }
      } else {
        this.mousedownXY = {
          x: e.clientX,
          y: e.clientY
        }
      }

      this.moveFlag = false
    } else if (this.mousemoveHoverFlag || this.mousemoveCb) {
      // 普通移动
      this.moveFlag = true
      let E = null
      if (this.isM) {
        E = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        }
      } else {
        E = {
          x: e.clientX,
          y: e.clientY
        }
      }
      const formatE = {
        x: ((E.x - this.canvas.getBoundingClientRect().left) * dpr - this.canvas.width / 2) / this.scaleC + this.canvas.width / 2,
        y: ((E.y - this.canvas.getBoundingClientRect().top) * dpr - this.canvas.height / 2) / this.scaleC + this.canvas.height / 2
      }
      const mousemoveGraphOrLine = []
      if (eInDom(e, this.canvas)) {
        for (let i = 0; i < this.graphList.length; i++) {
          if (!this.graphList[i].inCanvasShow) {
            continue
          }
          if (this.graphList[i].graphType === 'graph') {
            if (vertexInGraph(formatE, this.graphList[i].xy, this.graphList[i].vertex, this.graphList[i].r, this.graphList[i].hr)) {
              mousemoveGraphOrLine.push({
                graph: this.graphList[i],
                i
              })
            }
          } else {
            if (this.graphList[i].benchmarkType === 1) {
              if (vertexInLines(formatE, this.graphList[i].curveVertex, this.graphList[i].style.strokeVirtualWidth)) {
                mousemoveGraphOrLine.push({
                  graph: this.graphList[i],
                  i
                })
              }
            } else {
              if (vertexInLines(formatE, this.graphList[i].vertex, this.graphList[i].style.strokeVirtualWidth)) {
                mousemoveGraphOrLine.push({
                  graph: this.graphList[i],
                  i
                })
              }
            }
          }
        }
      }
      if (mousemoveGraphOrLine.length) {
        if (this.hoverGraphOrLine && this.hoverGraphOrLine.id !== mousemoveGraphOrLine[mousemoveGraphOrLine.length - 1].graph.id) {
          this.hoverGraphOrLine.setHoverStatus(false, null)
        }
        this.hoverGraphOrLine = mousemoveGraphOrLine[mousemoveGraphOrLine.length - 1].graph
        if (this.mousemoveHoverFlag) {
          this.hoverGraphOrLine.setHoverStatus(true, formatE)
        }
        this.addTask()
      } else {
        if (this.hoverGraphOrLine) {
          this.hoverGraphOrLine.setHoverStatus(false, null)
          this.hoverGraphOrLine = null
          this.addTask()
        }
      }
      if (this.mousemoveCb) {
        this.mousemoveCb(this.hoverGraphOrLine, formatE)
      }
      this.moveFlag = false
    }
  }
  documentMouseup(e) {
    if (this.isM) {
      document.removeEventListener('touchend', this.documentMouseupBind)
    } else {
      document.removeEventListener('mouseup', this.documentMouseupBind)
    }
    if (this.editGraphOrLine) {
      return
    }
    if (this.mouseUpTimer) {
      clearTimeout(this.mouseUpTimer)
      this.mouseUpTimer = null
    }
    const mousedownXY = deepClone(this.mousedownXY)
    this.mousedownXY = null
    if (e.button === 0) {
      if (this.mouseupDBBtn0Cb) {
        this.mouseUpTimer = setTimeout(() => {
          if (this.isDBClick && this.mouseupDBBtn0Cb) {
            this.mouseupDBBtn0Cb(mousedownXY, this.focusGraphOrLine)
          } else if (this.mouseupBtn0Cb) {
            this.mouseupBtn0Cb(mousedownXY, this.focusGraphOrLine)
          }
        }, 300)
      } else {
        if (this.mouseupBtn0Cb) {
          this.mouseupBtn0Cb(mousedownXY, this.focusGraphOrLine)
        }
      }
    }
    if (e.button === 2) {
      if (this.mouseupDBBtn2Cb) {
        this.mouseUpTimer = setTimeout(() => {
          if (this.isDBClick && this.mouseupDBBtn2Cb) {
            this.mouseupDBBtn2Cb(mousedownXY, this.vertexFocusRightSelectionIndex)
          } else if (this.mouseupBtn2Cb) {
            this.mouseupBtn2Cb(mousedownXY, this.vertexFocusRightSelectionIndex)
          }
        })
      } else {
        if (this.mouseupBtn2Cb) {
          this.mouseupBtn2Cb(mousedownXY, this.vertexFocusRightSelectionIndex)
        }
      }
    }
  }
  mousewheel(e) {
    if (this.editGraphOrLine) {
      return
    }
    if (this.scaleFlag) {
      return
    }
    this.scaleFlag = true
    if (e.wheelDelta > 0) {
      this.scaleCIndex += this.mouseScaleIndex
    } else {
      if (this.scaleCIndex > this.mouseScaleIndex) {
        this.scaleCIndex -= this.mouseScaleIndex
      }
    }
    this.scaleC = this.scaleCIndex / 100
    if (this.formatDataScale) {
      this.setCanvasRange()
      this.addTask(() => {
        this.formatDataScale()
      })
    }
    this.scaleFlag = false
  }
  showContenteditable({ x, y }, content, textStyle, minWidth, padding) {
    if (!this.contenteditableDom) {
      this.contenteditableDom = document.createElement('div')
      document.body.appendChild(this.contenteditableDom)

      const divId = document.createAttribute('id')
      divId.value = 'fwhf_chart_text_edit'
      this.contenteditableDom.setAttributeNode(divId)
      const contenteditable = document.createAttribute('contenteditable')
      contenteditable.value = true
      this.contenteditableDom.setAttributeNode(contenteditable)

      this.contenteditableDom.style.position = 'fixed'
      this.contenteditableDom.style.outline = 'none'
    }
    this.contenteditableDom.style.display = 'block'
    this.contenteditableDom.style.lineHeight = textStyle.lineHeight / dpr + 'px'
    this.contenteditableDom.style.fontSize = textStyle.fontSize / dpr + 'px'
    this.contenteditableDom.style.color = textStyle.color
    this.contenteditableDom.style.textAlign = textStyle.textAlign
    this.contenteditableDom.style.fontWight = textStyle.fontWight

    this.contenteditableDom.style.minWidth = minWidth / dpr + 'px'
    switch (textStyle.textAlign) {
      case 'left':
        this.contenteditableDom.style.transform = 'translate(0,-50%) scale(' + this.scaleC + ')'
        this.contenteditableDom.style.right = 'auto'
        this.contenteditableDom.style.left =
          this.canvas.getBoundingClientRect().left +
          (this.canvas.width / 2 + (x - this.canvas.width / 2) * this.scaleC - minWidth / 2 + padding[3] * this.scaleC) / dpr +
          'px'
        break
      case 'right':
        this.contenteditableDom.style.transform = 'translate(0,-50%) scale(' + this.scaleC + ')'
        this.contenteditableDom.style.left = 'auto'
        this.contenteditableDom.style.right =
          document.body.clientWidth -
          this.canvas.getBoundingClientRect().right +
          (this.canvas.width / 2 - (x - this.canvas.width / 2) * this.scaleC - minWidth / 2 + padding[1] * this.scaleC) / dpr +
          'px'
        break
      default:
        this.contenteditableDom.style.transform = 'translate(-50%,-50%) scale(' + this.scaleC + ')'
        this.contenteditableDom.style.right = 'auto'
        this.contenteditableDom.style.left =
          this.canvas.getBoundingClientRect().left + (this.canvas.width / 2 + (x - this.canvas.width / 2) * this.scaleC) / dpr + 'px'
        break
    }
    this.contenteditableDom.style.top =
      this.canvas.getBoundingClientRect().top + (this.canvas.height / 2 + (y - this.canvas.height / 2) * this.scaleC) / dpr + 'px'
    this.contenteditableDom.mouseUpX = x
    this.contenteditableDom.mouseUpY = y

    this.contenteditableDom.focus()
    if (this.editGraphOrLine.graphType === 'graph') {
      this.contenteditableDom.innerHTML = content
    } else {
      this.contenteditableDom.innerHTML = ''
    }

    textLastPos(this.contenteditableDom)
  }
  hideContenteditable() {
    if (!this.contenteditableDom) {
      return
    }
    this.contenteditableDom.style.display = 'none'
  }
}
