<template>
  <div class="nodeRelation">
    <div class="nodeRelationCanvas">
      <canvas ref="nodeRelationCanvas"></canvas>
    </div>
    <div class="nodes">
      <div class="label">nodes:</div>
      <div v-for="(item, index) in nodesList" :key="index" class="item" @mousedown="nodeMousedown(item)">
        <span :style="{ background: item.color }"></span>{{ item.text }}
      </div>
    </div>
    <div class="rightMenu" v-if="rightMenu.show" :style="rightMenu.style">
      <div class="menuItem" v-for="(item, index) in rightMenu.list" :key="index" @click="item.cb" v-show="item.show">{{ item.name }}</div>
    </div>
    <div class="canvasBtn">
      <button class="save" @click="saveData">保存</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'
import { NodeRelationCustom } from '../../src/main'
import { vertexInGraph, objectMerge, dpr, rand, local } from '../../src/util/helper'
export default {
  name: 'NodeRelation',
  setup() {
    const color = ['#ff7575', '#96FED1', '#E4C1F9', '#97CBFF', '#F694C1', '#EDE7B1']

    const nodesList = reactive([])
    const lineList = []
    for (let i = 0; i < color.length; i++) {
      nodesList.push({
        text: 'node' + i,
        color: color[i]
      })
      lineList.push({
        text: 'line' + i,
        color: color[i]
      })
    }

    let nodeItem = null
    const nodeStyle = {
      width: 40 * dpr,
      height: 40 * dpr
    }
    const nodeMousedown = item => {
      const e = window.event
      nodeItem = item
      document.addEventListener('mouseup', nodeMouseUp)
      e.preventDefault()
    }
    const nodeMouseUp = e => {
      if (!nodeItem) {
        return
      }
      const canvasDom = nodeRelationCanvas.value
      if (
        vertexInGraph({ x: e.clientX, y: e.clientY }, null, [
          {
            x: canvasDom.getBoundingClientRect().left,
            y: canvasDom.getBoundingClientRect().top
          },
          {
            x: canvasDom.getBoundingClientRect().left + canvasDom.offsetWidth,
            y: canvasDom.getBoundingClientRect().top
          },
          {
            x: canvasDom.getBoundingClientRect().left + canvasDom.offsetWidth,
            y: canvasDom.getBoundingClientRect().top + canvasDom.offsetHeight
          },
          {
            x: canvasDom.getBoundingClientRect().left,
            y: canvasDom.getBoundingClientRect().top + canvasDom.offsetHeight
          }
        ])
      ) {
        const x = (e.clientX - canvasDom.getBoundingClientRect().left) * NodeRelationCustomClass.dpr
        const y = (e.clientY - canvasDom.getBoundingClientRect().top) * NodeRelationCustomClass.dpr
        const data = {
          canvas: canvasDom,
          scaleC: NodeRelationCustomClass.scaleC,
          xy: {
            x: Math.round(NodeRelationCustomClass.canvas.width / 2 + (x - NodeRelationCustomClass.canvas.width / 2) / NodeRelationCustomClass.scaleC),
            y: Math.round(NodeRelationCustomClass.canvas.height / 2 + (y - NodeRelationCustomClass.canvas.height / 2) / NodeRelationCustomClass.scaleC)
          },
          style: objectMerge(nodeStyle, {
            fillColor: nodeItem.color,
            hover: {
              fillColor: nodeItem.color,
              strokeWidth: 0,
              globalAlpha: 0.6
            }
          }),
          text: nodeItem.text,
          textGraphStyle: {
            margin: [10 * dpr, 0]
          }
        }
        NodeRelationCustomClass.addGraphToList(data)
      }
      document.removeEventListener('mouseup', nodeMouseUp)
      nodeItem = null
    }

    const rightMenu = reactive({
      show: false,
      style: {},
      list: [
        {
          show: true,
          name: '新建关系',
          cb: () => {
            NodeRelationCustomClass.creatLineStart()
            rightMenu.show = false
          }
        },
        {
          show: true,
          name: '删除',
          cb: () => {
            NodeRelationCustomClass.delGraphToList()
            rightMenu.show = false
          }
        }
      ]
    })

    const initCreatLineCb = () => {
      const line = lineList[rand(0, lineList.length - 1)]
      NodeRelationCustomClass.creatLineAddGraphList({
        canvas: NodeRelationCustomClass.canvas,
        scaleC: NodeRelationCustomClass.scaleC,
        style: {
          strokeColor: line.color,
          triangleFillColor: line.color
        },
        text: line.text
      })
    }
    const mouseupBtn0Cb = () => {
      rightMenu.show = false
    }
    const mouseupBtn2Cb = (xy, focusGraphOrLine) => {
      if (focusGraphOrLine) {
        rightMenu.style = {
          left: xy.x + 10 + 'px',
          top: xy.y + 10 + 'px'
        }
        if (focusGraphOrLine.graphType === 'line') {
          rightMenu.list[0].show = false
        } else {
          rightMenu.list[0].show = true
        }
        rightMenu.show = true
      } else {
        rightMenu.show = false
      }
    }

    const saveData = () => {
      const saveData = NodeRelationCustomClass.save()
      local.set('nodeRelationCustomData', JSON.stringify(saveData.objData), 999)
    }

    const nodeRelationCanvas = ref(null)
    let NodeRelationCustomClass = null
    onMounted(() => {
      let nodeRelationCustomData = local.get('nodeRelationCustomData')
      if (nodeRelationCustomData) {
        nodeRelationCustomData = JSON.parse(nodeRelationCustomData)
      }
      NodeRelationCustomClass = new NodeRelationCustom({
        data: nodeRelationCustomData,
        canvas: nodeRelationCanvas.value,
        eventFlag: true,
        dbclickEditFlag: false,
        mousemoveGraphFlag: true,
        mousedownFocusFlag: false,
        mousemoveHoverFlag: true,
        mouseupBtn0Cb: mouseupBtn0Cb,
        mouseupBtn2Cb: mouseupBtn2Cb,
        initCreatLineCb: initCreatLineCb
      })
    })
    onBeforeUnmount(() => {
      NodeRelationCustomClass && NodeRelationCustomClass.removeEvent()
    })
    return {
      nodeRelationCanvas,
      nodesList,
      nodeMousedown,
      rightMenu,
      saveData
    }
  }
}
</script>

<style scoped lang="scss">
.nodeRelation {
  width: 100%;
  height: 100%;
  position: relative;
  .nodeRelationCanvas {
    width: 100%;
    height: 100%;
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  }
  .nodes {
    position: absolute;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
    background: #eee;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    div {
      margin-right: 10px;
    }
    .item {
      cursor: pointer;
      display: flex;
      align-items: center;
      span {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 4px;
      }
    }
  }
  .rightMenu {
    position: fixed;
    z-index: 999;
    width: 94px;
    left: 500px;
    top: 100px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0px 0px 10px rgba(20, 20, 20, 0.4);
    padding: 3px;
    .menuItem {
      height: 30px;
      line-height: 30px;
      text-align: left;
      font-size: 14px;
      padding: 0 6px;
      cursor: pointer;
      border-radius: 4px;
    }
    .menuItem:hover {
      background: #eeeeee;
    }
    .menuItem:last-child {
      border-bottom: none;
    }
  }
  .canvasBtn {
    position: absolute;
    right: 20px;
    top: 20px;
    button {
      width: 80px;
      height: 30px;
      line-height: 28px;
      font-size: 14px;
      cursor: pointer;
      background: #409eff;
      border: 1px solid #fff;
      color: #fff;
      box-shadow: 0px 0px 10px rgba(20, 20, 20, 0.4);
      margin: 0 5px;
    }
  }
}
</style>
