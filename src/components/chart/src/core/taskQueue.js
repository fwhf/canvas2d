export default class TaskQueue {
  constructor() {
    this.taskList = []
    this.hasTaskDone = false
    this.status = 'do' // do or stop

    this.requestAnimationFrame = null
    this.requestAnimationFrameDrawBind = this.requestAnimationFrameDraw.bind(this)
  }
  addTask(func) {
    this.taskList.push(func)
    if (this.requestAnimationFrame === null) {
      this.addRequestAnimationFrame()
      this.do()
    }
  }
  do() {
    this.status = 'do'
    new Promise(res => {
      this.taskList[0] && this.taskList[0]()
      this.taskList.shift()
      this.hasTaskDone = true
      res()
    }).then(() => {
      if (this.status === 'do' && this.taskList.length) {
        this.do()
      }
    })
  }
  stop() {
    this.status = 'stop'
  }
  requestAnimationFrameDraw() {
    this.stop()
    if (this.hasTaskDone && this.reDraw) {
      this.hasTaskDone = false
      this.reDraw()
    }
    if (this.taskList.length) {
      this.addRequestAnimationFrame()
      this.do()
    } else {
      this.clearRequestAnimationFrame()
    }
  }
  addRequestAnimationFrame() {
    this.requestAnimationFrame = window.requestAnimationFrame(this.requestAnimationFrameDrawBind)
  }
  clearRequestAnimationFrame() {
    window.cancelAnimationFrame(this.requestAnimationFrame)
    this.requestAnimationFrame = null
  }
  removeEvent() {
    this.stop()
    this.clearRequestAnimationFrame()
  }
}
