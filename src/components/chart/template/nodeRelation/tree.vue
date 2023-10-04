<template>
  <div class="nodeRelation">
    <canvas ref="nodeRelationCanvasTree"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { NodeRelationTree } from '../../src/main'

const data = {
  nodes: [
    {
      value: '图形内文案1',
      uuid: 1
    },
    {
      value: '图形内文案2',
      uuid: 2
    },
    {
      value: '图形内文案3',
      uuid: 3
    },
    {
      value: '图形内文案4',
      uuid: 4
    },
    {
      value: '图形内文案5',
      uuid: 5
    },
    {
      value: '图形内文案6',
      uuid: 6
    },
    {
      value: '图形内文案7',
      uuid: 7
    }
  ],
  edges: [
    {
      fromUuid: 1,
      toUuid: 2
    },
    {
      fromUuid: 3,
      toUuid: 4
    },
    {
      fromUuid: 5,
      toUuid: 6
    },
    {
      fromUuid: 7,
      toUuid: 1
    },
    {
      fromUuid: 2,
      toUuid: 5
    },
    {
      fromUuid: 3,
      toUuid: 5
    },
    {
      fromUuid: 4,
      toUuid: 6
    },
    {
      fromUuid: 3,
      toUuid: 5
    },
    {
      fromUuid: 5,
      toUuid: 7
    }
  ]
}
export default {
  name: 'NodeRelation',
  setup() {
    // create an array with nodes
    const nodes = data.nodes
    // create an array with edges
    const paths = data.edges

    const nodeRelationCanvasTree = ref(null)
    let NodeRelationClass = null
    const Class = NodeRelationTree
    onMounted(() => {
      NodeRelationClass = new Class({
        canvas: nodeRelationCanvasTree.value,
        nodes,
        paths,
        autoUuidScale: false,
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
      NodeRelationClass && NodeRelationClass.removeEvent()
    })
    return {
      nodeRelationCanvasTree
    }
  }
}
</script>

<style scoped lang="scss">
.nodeRelation {
  width: 100%;
  height: 100%;
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
