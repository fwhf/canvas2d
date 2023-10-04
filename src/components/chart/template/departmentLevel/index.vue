<template>
  <div class="departmentLevel">
    <canvas ref="departmentLevelCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { DepartmentCrossLevel } from '../../src/main'
import { dpr, rand } from '../../src/util/helper'
export default {
  name: 'DepartmentLevel',
  setup() {
    const color = ['#ff7575', '#96FED1', '#E4C1F9', '#97CBFF', '#F694C1', '#EDE7B1']
    const data = []
    const level = rand(3, 5)
    const randData = data => {
      const randItem = data[rand(0, data.length - 1)]
      if (randItem.children && rand(0, 1)) {
        return randData(randItem.children)
      } else {
        return randItem
      }
    }
    const mockData = levelIndex => {
      const randLength = rand(1, 5)
      for (let i = 0; i < randLength; i++) {
        const obj = {
          text: levelIndex + '<span style="color:red;">-' + i + '测试长</span><div>损益:<span style="color:red">+1亿</span></div>',
          id: levelIndex + '-' + i,
          style: {
            graphStyle: {
              fillColor: color[rand(0, color.length - 1)]
            },
            margin: [10 * dpr, 5 * dpr]
          }
        }
        if (levelIndex !== 0) {
          const randItem = randData(data)
          if (!randItem.children) {
            randItem.children = []
          }
          const crossLevel = rand(0, 2)
          if (crossLevel) {
            // 跨级
            obj.crossLevel = crossLevel
          }
          randItem.children.push(obj)
        } else {
          data.push(obj)
        }
      }
      if (levelIndex !== level) {
        mockData(++levelIndex)
      }
    }
    mockData(0)

    const departmentLevelCanvas = ref(null)
    let DepartmentLevelClass = null
    onMounted(() => {
      DepartmentLevelClass = new DepartmentCrossLevel({
        canvas: departmentLevelCanvas.value,
        data,
        style: {
          graph: 'RectangleGraph',
          graphStyle: {
            width: 'auto',
            height: 'auto',
            padding: 10 * dpr,
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
            }
          }
        },
        autoScale: false,
        eventFlag: true,
        level: 0,
        collapsable: true,
        dbclickEditFlag: false,
        mousemoveGraphFlag: false,
        mousedownFocusFlag: false,
        mousemoveHoverFlag: true,
        mousemoveCb: item => {
          if (item) {
            // console.log(item)
          }
        },
        mouseupBtn2Cb: () => {
          console.log(DepartmentLevelClass.focusGraphOrLine, 222)
        },
        mouseupBtn0Cb: (xy, item) => {
          if (item) {
            console.log(item)
          }
        }
      })
    })
    onBeforeUnmount(() => {
      DepartmentLevelClass && DepartmentLevelClass.removeEvent()
    })
    return {
      departmentLevelCanvas
    }
  }
}
</script>

<style scoped lang="scss">
.departmentLevel {
  width: 100%;
  height: 100%;
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
