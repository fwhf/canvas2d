<template>
  <div class="triangleDistribution">
    <canvas ref="triangleDistributionCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { TriangleDistribution } from '../../src/main'
import { rand, dpr } from '../../src/util/helper'
export default {
  name: 'TriangleDistribution',
  setup() {
    const color = ['#ff7575', '#96FED1', '#E4C1F9', '#97CBFF', '#F694C1', '#EDE7B1']
    const data = [[], [], [], [], [], []]
    for (let i = 0; i < 32; i++) {
      data[0].push({
        index: i,
        outsideValue: '第一个图' + i,
        insideValue: i + '',
        style: {
          graphStyle: {
            fillColor: color[rand(0, color.length - 1)]
          }
        }
      })
    }
    for (let i = 0; i < 16; i++) {
      data[1].push({
        index: i,
        outsideValue: '第二个图' + i,
        insideValue: i + '',
        style: {
          graphStyle: {
            fillColor: color[rand(0, color.length - 1)]
          }
        }
      })
    }
    for (let i = 0; i < 10; i++) {
      data[2].push({
        index: i,
        outsideValue: '第三个图' + i,
        insideValue: i + '',
        style: {
          graphStyle: {
            fillColor: color[rand(0, color.length - 1)]
          }
        }
      })
    }
    for (let i = 0; i < 1; i++) {
      data[3].push({
        index: i,
        outsideValue: '第四个图' + i,
        insideValue: i + '',
        style: {
          graphStyle: {
            fillColor: color[rand(0, color.length - 1)]
          }
        }
      })
    }
    for (let i = 0; i < 1; i++) {
      data[4].push({
        index: i,
        outsideValue: '第五个图' + i,
        insideValue: i + '',
        style: {
          graphStyle: {
            fillColor: color[rand(0, color.length - 1)]
          }
        }
      })
    }
    for (let i = 0; i < 1; i++) {
      data[5].push({
        index: i,
        outsideValue: '第六个图' + i,
        insideValue: i + '',
        style: {
          graphStyle: {
            fillColor: color[rand(0, color.length - 1)]
          }
        }
      })
    }

    const triangleDistributionCanvas = ref(null)
    let TriangleDistributionClass = null
    onMounted(() => {
      TriangleDistributionClass = new TriangleDistribution({
        canvas: triangleDistributionCanvas.value,
        data,
        lLM: true,
        graphInterval: 160 * dpr,
        eventFlag: true,
        dbclickEditFlag: false,
        mousemoveGraphFlag: false,
        mousedownFocusFlag: false,
        mousemoveHoverFlag: true,
        autoScale: true,
        mousemoveCb: item => {
          if (item) {
            // console.log(item)
          }
        },
        mouseupBtn2Cb: item => {
          if (item) {
            // console.log(item)
          }
        }
      })
    })
    onBeforeUnmount(() => {
      TriangleDistributionClass && TriangleDistributionClass.removeEvent()
    })

    return {
      triangleDistributionCanvas
    }
  }
}
</script>

<style scoped lang="scss">
.triangleDistribution {
  width: 100%;
  height: 100%;
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
