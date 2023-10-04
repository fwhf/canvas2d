function expand() {
  CanvasRenderingContext2D.prototype.fwhfExpand = true
  CanvasRenderingContext2D.prototype.ellipse = function (x, y, r, radiusX, radiusY, startAngle, endAngle, anticlockwise) {
    this.save()
    const scaleX = radiusX / r // 计算缩放的x轴比例
    const scaleY = radiusY / r // 计算缩放的y轴比例
    this.translate(x, y) // 移动到圆心位置
    this.scale(scaleX, scaleY) // 进行缩放
    this.arc(0, 0, r, startAngle, endAngle, anticlockwise) // 绘制圆形
    this.restore()
  }
}
if (!CanvasRenderingContext2D.prototype.fwhfExpand) {
  expand()
}
