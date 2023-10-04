<template>
  <div class="NodeRelationNew">
    <canvas ref="NodeRelationNewCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { NodeRelationNew } from '../../src/main'
import { rand } from '../../src/util/helper'
export default {
  name: 'NodeRelationNew',
  setup() {
    const color = ['#ff7575', '#96FED1', '#E4C1F9', '#97CBFF', '#F694C1', '#EDE7B1']
    const nodes = []
    const desc = '<span>描述</span>描述描述描述<span>描述</span>描述描述描述描述描述描述'
    for (let i = 0; i < rand(40, 60); i++) {
      nodes.push({
        icon: i,
        text: i + desc.substr(0, rand(20, desc.length)),
        uuid: i,
        style: {
          graphStyle: {
            fillColor: color[rand(0, 5)]
          }
        }
      })
    }
    const paths = []
    for (let i = 0; i < rand(40, 60); i++) {
      const num = rand(1, nodes.length - 1)
      paths.push({
        fromUuid: nodes[rand(0, num - 1)].uuid,
        toUuid: nodes[rand(num, nodes.length - 1)].uuid
      })
    }
    nodes.push({
      text: -1,
      uuid: -1,
      style: {
        color: color[rand(0, 5)]
      }
    })
    nodes.push({
      text: -2,
      uuid: -2,
      style: {
        color: color[rand(0, 5)]
      }
    })
    nodes.push({
      text: -3,
      uuid: -3,
      style: {
        color: color[rand(0, 5)]
      }
    })
    nodes.push({
      text: -4,
      uuid: -4,
      style: {
        color: color[rand(0, 5)]
      }
    })
    nodes.push({
      text: -5,
      uuid: -5,
      style: {
        color: color[rand(0, 5)]
      }
    })
    nodes.push({
      text: -6,
      uuid: -6,
      style: {
        color: color[rand(0, 5)]
      }
    })
    nodes.push({
      text: -7,
      uuid: -7,
      style: {
        color: color[rand(0, 5)]
      }
    })
    nodes.push({
      text: -8,
      uuid: -8,
      style: {
        color: color[rand(0, 5)]
      }
    })
    nodes.push({
      text: -9,
      uuid: -9,
      style: {
        color: color[rand(0, 5)]
      }
    })
    paths.push({
      fromUuid: -1,
      toUuid: -2
    })
    paths.push({
      fromUuid: -2,
      toUuid: -3
    })
    paths.push({
      fromUuid: -2,
      toUuid: -4
    })
    paths.push({
      fromUuid: -6,
      toUuid: -5
    })
    paths.push({
      fromUuid: -5,
      toUuid: -5
    })

    const NodeRelationNewCanvas = ref(null)
    let NodeRelationNewClass = null
    onMounted(() => {
      NodeRelationNewClass = new NodeRelationNew({
        canvas: NodeRelationNewCanvas.value,
        nodes,
        paths,
        autoScale: false,
        style: {
          graphStyle: {
            text: {
              wordWrap: false,
              ellipsis: true,
              ellipsisLine: 2
            }
          }
        },
        eventFlag: true,
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
      NodeRelationNewClass && NodeRelationNewClass.removeEvent()
    })
    return {
      NodeRelationNewCanvas
    }
  }
}
</script>

<style scoped lang="scss">
.NodeRelationNew {
  width: 100%;
  height: 100%;
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
