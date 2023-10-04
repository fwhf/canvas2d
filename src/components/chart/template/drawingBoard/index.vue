<template>
  <div class="drawingBoard">
    <canvas ref="drawingBoardCanvas"></canvas>
  </div>
</template>

<script>
/*
  待实现（优先级排序）：
    保存图片背景色配置
    保存图片width、height优化
    文本rang特殊标记
*/
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { DrawingBoard } from '../../src/main'
// import { dpr, rand } from '../../src/util/helper'

export default {
  name: 'DrawingBoard',
  setup() {
    // 画布初始化
    const drawingBoardCanvas = ref(null)
    let DrawingBoardClass = null
    onMounted(() => {
      DrawingBoardClass = new DrawingBoard({
        canvas: drawingBoardCanvas.value,
        mockPonit: true,
        drawPoint: true
      })
    })
    onBeforeUnmount(() => {
      DrawingBoardClass && DrawingBoardClass.removeEvent && DrawingBoardClass.removeEvent()
    })

    return {
      drawingBoardCanvas
    }
  }
}
</script>

<style scoped lang="scss">
.drawingBoard {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
