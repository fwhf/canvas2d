<template>
  <div class="RelationDepartmentCrossLevel">
    <canvas ref="RelationDepartmentCrossLevelCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RelationDepartmentCrossLevel } from '../../src/main'
import { dpr, rand } from '../../src/util/helper'

export default {
  name: 'RelationDepartmentCrossLevel',
  setup() {
    // 数据组装
    const color = ['#ff7575', '#96FED1', '#E4C1F9', '#97CBFF', '#F694C1', '#EDE7B1']
    const data1 = []
    const data2 = []
    const data3 = []
    const mockData = (data, levelIndex, funcIndex) => {
      const randLength = rand(1, 5)
      for (let i = 0; i < randLength; i++) {
        const obj = {
          text: (data.uuid ? data.uuid : funcIndex) + '&' + levelIndex + '-' + i,
          uuid: (data.uuid ? data.uuid : funcIndex) + '&' + levelIndex + '-' + i,
          style: {
            graphStyle: {
              fillColor: color[rand(0, color.length - 1)]
            },
            margin: [10 * dpr, 5 * dpr]
          }
        }
        if (levelIndex !== 0) {
          if (!data.children) {
            data.children = []
          }
          const crossLevel = rand(0, 2)
          if (crossLevel + levelIndex < level) {
            obj.crossLevel = crossLevel
            mockData(obj, levelIndex + 1, funcIndex)
            data.children.push(obj)
          }
        } else {
          obj.crossLevel = 0
          mockData(obj, levelIndex + 1, funcIndex)
          data.push(obj)
        }
      }
    }
    const deepGetLeaf = (data, arr, levelIndex) => {
      data.forEach(item => {
        if (item.children && item.children.length) {
          deepGetLeaf(item.children, arr, levelIndex + 1)
        } else if (levelIndex + item.crossLevel + 1 === level) {
          arr.push(item)
        }
      })
    }
    let level = rand(2, 4)
    mockData(data1, 0, 0)
    const data1Leaf = []
    deepGetLeaf(data1, data1Leaf, 0)

    level = rand(2, 4)
    mockData(data2, 0, 1)
    const data2Leaf = []
    deepGetLeaf(data2, data2Leaf, 0)

    level = rand(2, 4)
    mockData(data3, 0, 2)
    const data3Leaf = []
    deepGetLeaf(data3, data3Leaf, 0)

    const getData1LeafByUuid = (uuid, data, key) => {
      const filterData = data.filter(item => {
        return item[key].indexOf(uuid) > -1
      })
      const arr = []
      filterData.forEach(item => {
        arr.push(item.uuid)
      })
      return arr
    }
    data1Leaf.forEach(item => {
      const data2LeafStart = rand(0, data2Leaf.length - 2)
      const data2LeafLength = rand(1, 3)
      item.data2LeafArr = []
      for (let i = 0; i < data2LeafLength - 1; i++) {
        if (data2LeafStart + i === data2Leaf.length - 1) {
          break
        }
        item.data2LeafArr.push(data2Leaf[data2LeafStart + i].uuid)
      }
      const data3LeafStart = rand(0, data3Leaf.length - 2)
      const data3LeafLength = rand(1, 3)
      item.data3LeafArr = []
      for (let i = 0; i < data3LeafLength - 1; i++) {
        if (data3LeafStart + i === data3Leaf.length - 1) {
          break
        }
        item.data3LeafArr.push(data3Leaf[data3LeafStart + i].uuid)
      }
    })
    data2Leaf.forEach(item => {
      const data3LeafStart = rand(0, data3Leaf.length - 2)
      const data3LeafLength = rand(1, 3)
      item.data3LeafArr = []
      for (let i = 0; i < data3LeafLength - 1; i++) {
        if (data3LeafStart + i === data3Leaf.length - 1) {
          break
        }
        item.data3LeafArr.push(data3Leaf[data3LeafStart + i].uuid)
      }
      item.data1LeafArr = getData1LeafByUuid(item.uuid, data1Leaf, 'data2LeafArr')
    })
    data3Leaf.forEach(item => {
      item.data1LeafArr = getData1LeafByUuid(item.uuid, data1Leaf, 'data3LeafArr')
      item.data2LeafArr = getData1LeafByUuid(item.uuid, data2Leaf, 'data3LeafArr')
    })

    console.log(data1)
    console.log(data2)
    console.log(data3)
    // console.log(data1Leaf)

    const RelationDepartmentCrossLevelCanvas = ref(null)
    let RelationDepartmentCrossLevelClass = null
    onMounted(() => {
      RelationDepartmentCrossLevelClass = new RelationDepartmentCrossLevel({
        canvas: RelationDepartmentCrossLevelCanvas.value,
        data: [...data1, ...data2, ...data3],
        autoScale: false,
        eventFlag: true,
        level: 3,
        collapsable: true,
        dbclickEditFlag: false,
        mousemoveGraphFlag: false,
        mousedownFocusFlag: false,
        mousemoveHoverFlag: true,
        relationKey: ['data1LeafArr', 'data2LeafArr', 'data3LeafArr'],
        style: {
          graphStyle: {
            hover: {
              globalAlpha: 0.4,
              text: {
                globalAlpha: 0.4
              }
            }
          },
          lineStyle: {
            hover: {
              show: true,
              globalAlpha: 0.4
            }
          }
        },
        mouseupBtn2Cb: () => {
          console.log(RelationDepartmentCrossLevelClass.focusGraphOrLine, 222)
        },
        mouseupBtn0Cb: (xy, item) => {
          if (item) {
            console.log(item)
          }
        }
      })
    })
    onBeforeUnmount(() => {
      RelationDepartmentCrossLevelClass && RelationDepartmentCrossLevelClass.removeEvent()
    })
    return {
      RelationDepartmentCrossLevelCanvas
    }
  }
}
</script>

<style scoped lang="scss">
.RelationDepartmentCrossLevel {
  width: 100%;
  height: 100%;
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
