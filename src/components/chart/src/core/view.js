import './expand'
import Event from './event'
import { dpr, getDom, echoError, getType, isCanvasDom } from '../util/helper.js'
export default class ViewEvent extends Event {
  constructor(opt) {
    super(opt)
    this.canvas = isCanvasDom(opt.canvas) ? opt.canvas : getDom(opt.canvas, 'id')
    this.dpr = getType(opt.dpr) === 'Number' ? opt.dpr : dpr

    this.canvasRange = {}
  }
  init() {
    if (!this.canvas || !isCanvasDom(this.canvas)) {
      echoError('未获取到canvas元素')
      return
    }

    if (this.canvas.width !== Math.floor(this.canvas.offsetWidth * this.dpr) || this.canvas.height !== Math.floor(this.canvas.offsetHeight * this.dpr)) {
      this.canvas.width = Math.floor(this.canvas.offsetWidth * this.dpr)
      this.canvas.height = Math.floor(this.canvas.offsetHeight * this.dpr)
    }
    this.ctx = this.canvas.getContext('2d')

    this.setCanvasRange()
  }
  reDraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.draw()
  }
  setCanvasRange() {
    this.canvasRange = {
      left: this.canvas.width / 2 - this.canvas.width / 2 / this.scaleC,
      right: this.canvas.width / 2 + this.canvas.width / 2 / this.scaleC,
      top: this.canvas.height / 2 - this.canvas.height / 2 / this.scaleC,
      bottom: this.canvas.height / 2 + this.canvas.height / 2 / this.scaleC
    }
  }
  destory() {
    super.removeEvent()
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
