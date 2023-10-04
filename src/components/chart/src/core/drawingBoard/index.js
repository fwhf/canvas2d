/*
  wanghuijie

  配置解读
  canvas 目标渲染dom
  dpr 画图清晰度 默认取值window.devicePixelRatio
*/
import View from '../view'
import { dpr, rand } from '../../util/helper.js'
export default class drawingBoard extends View {
  constructor(opt) {
    super(opt)

    this.clearOldFlag = opt.clearOldFlag || false
    this.LineData = []

    this.mockPonit = opt.mockPonit || false
    this.drawPoint = opt.drawPoint || false
    this.pointData = opt.pointData || []

    this.init()
  }
  init() {
    super.init()
    if (this.mockPonit) {
      this.mockPointData()
    }
    if (this.drawPoint) {
      this.drawPointData()
    }
    this.addEvent()
  }
  mockPointData() {
    const length = (this.canvas.width * this.canvas.height) / 10000
    for (let i = 0; i < length; i++) {
      this.pointData.push({
        x: rand(0, this.canvas.width),
        y: rand(0, this.canvas.height)
      })
    }
  }
  drawPointData() {
    this.ctx.save()
    this.ctx.beginPath()
    this.pointData.forEach(point => {
      this.ctx.beginPath()
      this.ctx.fillStyle = point.fillColor || '#ccc'
      this.ctx.arc(point.x, point.y, 10 * dpr, 0, 2 * Math.PI)
      this.ctx.fill()
      this.ctx.closePath()
    })
    this.ctx.restore()
  }
  reDraw() {
    if (!this.mousedownXY) {
      this.drawPointData()
    }
  }
  drawStart(point) {
    this.ctx.beginPath()
    this.ctx.lineCap = 'round'
    this.ctx.lineJion = 'round'
    this.ctx.moveTo(point.x, point.y)
  }
  drawLine(point) {
    // this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    // this.ctx.scale(this.scaleC, this.scaleC)
    // this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)
    this.ctx.lineTo(point.x, point.y)
    this.ctx.stroke()
  }
  drawEnd() {
    this.pointData.forEach(point => {
      const isInsert = this.ctx.isPointInPath(point.x, point.y, 'evenodd')
      if (isInsert) {
        point.fillColor = 'red'
      }
    })
    this.ctx.closePath()
    this.addTask(() => {})
  }
  addEvent() {
    this.canvasContextmenuBind = this.canvasContextmenu.bind(this)
    this.canvasMousedownBind = this.canvasMousedown.bind(this)
    this.documentMouseupBind = this.documentMouseup.bind(this)
    this.documentMouseMoveBind = this.documentMouseMove.bind(this)

    // 阻止右击默认事件
    this.canvas.addEventListener('contextmenu', this.canvasContextmenuBind)

    // mouse
    this.mousedownXY = null
    this.moveFlag = false

    // mousedown,mousemove,mouseeup
    if (this.isM) {
      this.canvas.addEventListener('touchstart', this.canvasMousedownBind)
      document.addEventListener('touchmove', this.documentMouseMoveBind)
    } else {
      this.canvas.addEventListener('mousedown', this.canvasMousedownBind)
      document.addEventListener('mousemove', this.documentMouseMoveBind)
    }
  }
  canvasContextmenu(e) {
    if (e.button === 2) {
      e.preventDefault()
    }
  }
  canvasMousedown(e) {
    if (this.isM || (!this.isM && (e.button === 0 || e.button === 2))) {
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
      const formatE = {
        x: ((this.mousedownXY.x - this.canvas.getBoundingClientRect().left) * dpr - this.canvas.width / 2) / this.scaleC + this.canvas.width / 2,
        y: ((this.mousedownXY.y - this.canvas.getBoundingClientRect().top) * dpr - this.canvas.height / 2) / this.scaleC + this.canvas.height / 2
      }

      if (this.clearOldFlag) {
        this.LineData = []
        this.pointData.forEach(point => {
          point.fillColor = '#ccc'
        })
      }
      this.LineData.push([formatE])
      this.addTask(() => {
        this.drawStart(formatE)
      })

      if (this.isM) {
        document.addEventListener('touchend', this.documentMouseupBind)
      } else {
        document.addEventListener('mouseup', this.documentMouseupBind)
      }
    }
    e.preventDefault()
  }
  documentMouseMove(e) {
    if (this.moveFlag) {
      return
    }
    if (this.mousedownXY) {
      // 长按移动
      this.moveFlag = true
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
      const formatE = {
        x: ((this.mousedownXY.x - this.canvas.getBoundingClientRect().left) * dpr - this.canvas.width / 2) / this.scaleC + this.canvas.width / 2,
        y: ((this.mousedownXY.y - this.canvas.getBoundingClientRect().top) * dpr - this.canvas.height / 2) / this.scaleC + this.canvas.height / 2
      }

      this.LineData[this.LineData.length - 1].push(formatE)
      this.addTask(() => {
        this.drawLine(formatE)
      })

      this.moveFlag = false
    }
  }
  documentMouseup() {
    if (this.isM) {
      document.removeEventListener('touchend', this.documentMouseupBind)
    } else {
      document.removeEventListener('mouseup', this.documentMouseupBind)
    }
    this.mousedownXY = null
    this.addTask(() => {
      this.drawEnd()
    })
  }
}
