<template>
  <div class="departmentLevel">
    <canvas ref="departmentLevelCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { TextDepartmentCrossLevel } from '../../src/main'
import { dpr, rand } from '../../src/util/helper'

export default {
  name: 'DepartmentLevel',
  setup() {
    const color = ['#ff7575', '#96FED1', '#E4C1F9', '#97CBFF', '#F694C1', '#EDE7B1']
    const data = []
    const level = rand(5, 7)
    const randData = data => {
      const randItem = data[rand(0, data.length - 1)]
      if (randItem.children && rand(0, 5)) {
        return randData(randItem.children)
      } else {
        return randItem
      }
    }
    const mockData = levelIndex => {
      const randLength = rand((levelIndex + 1) * 5, (levelIndex + 1) * 8)
      const str = '测试长损益:+1亿测试长损益:+1亿'
      const tooltip = [
        '<div>1: 123ewqr13r</div>',
        '<div>1: 123ewqr13r</div><div>2: 测试长损益</div>',
        '<div>1: 123ewqr13r</div><div>2: 测试长损益</div><div>3: 测试长损益</div>',
        '<div>1: 123ewqr13r</div><div>2: 测试长损益</div><div>3: 测试长损益</div><div>4: 测试长损益测试长损益</div>',
        '<div>1: 123ewqr13r</div><div>4: 测试长损益测试长损益</div>'
      ]
      for (let i = 0; i < randLength; i++) {
        const obj = {
          text: levelIndex + '-' + i + str.slice(0, rand(0, str.length)),
          id: levelIndex + '-' + i,
          tooltip: tooltip[rand(0, tooltip.length - 1)],
          style: {
            graphStyle: {
              width: 'auto',
              height: 30 * dpr,
              fillColor: color[rand(0, color.length - 1)]
            },
            margin: [0, 20 * dpr]
          }
        }
        if (levelIndex !== 0) {
          const randItem = randData(data)
          if (!randItem.children) {
            randItem.children = []
          }
          // const crossLevel = rand(0, 2)
          // if (crossLevel) {
          //   // 跨级
          //   obj.crossLevel = crossLevel
          // }
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
      DepartmentLevelClass = new TextDepartmentCrossLevel({
        canvas: departmentLevelCanvas.value,
        data,
        xLabel: [
          { text: 'label1' },
          { text: 'label2' },
          { text: 'label3' },
          { text: 'label4' },
          { text: 'label5' },
          { text: 'label6' },
          { text: 'label7' },
          { text: 'label8' },
          { text: 'label9' }
        ],
        autoScale: false,
        eventFlag: true,
        xLevel: 0,
        style: {
          graphStyle: {
            width: 'auto',
            height: 30 * dpr,
            fillColor: color[rand(0, color.length - 1)]
          },
          margin: [0, 20 * dpr]
        },
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
          console.log(DepartmentLevelClass.focusGraphOrLine)
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
