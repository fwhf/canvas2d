<template>
  <div class="drawingBoardFlow">
    <div class="graphGroup">
      <div class="groupTitle">{{ graphGroup.title }}</div>
      <div class="graphGroupItem" v-for="(groupItem, index) in graphGroup.children" :key="'groupItem' + index">
        <div class="groupDesc">{{ groupItem.title }}</div>
        <div class="graphList">
          <div class="graphItem" v-for="(graphItem, index) in groupItem.children" :key="'graphItem' + index">
            <div class="graphDom" @mousedown="graphDown(graphItem)"><canvas class="graphCanvas" :ref="graphItemRef"></canvas></div>
            <div class="graphDesc">{{ graphItem.title }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="drawingBoardFlow">
      <canvas ref="drawingBoardFlowCanvas"></canvas>
    </div>
    <div class="config">
      <div class="configTitle">{{ config.title }}</div>
      <div class="configItem">
        <div class="configDesc">{{ config.canvas.title }}</div>
        <div class="configList">
          <div class="label">背景颜色</div>
          <div class="value"><input type="color" v-model="config.canvas.bgColor" @change="canvasChange" /></div>
        </div>
        <div class="configList">
          <div class="label">图像保存内边距</div>
          <div class="value"><input type="number" v-model="config.canvas.saveImagePadding" @change="canvasChange" /></div>
        </div>
        <div class="configList">
          <div class="label">网格开关</div>
          <div class="value">
            <input
              type="radio"
              :checked="config.canvas.gridStyle.show"
              :value="true"
              @click="canvasChange((config.canvas.gridStyle.show = !config.canvas.gridStyle.show))"
            />
          </div>
        </div>
        <div class="configList">
          <div class="label">网格宽度</div>
          <div class="value"><input type="number" v-model="config.canvas.gridStyle.width" @change="canvasChange" /></div>
        </div>
        <div class="configList">
          <div class="label">高亮网格间隔</div>
          <div class="value"><input type="number" v-model="config.canvas.gridStyle.lightInterval" @change="canvasChange" /></div>
        </div>
        <div class="configList">
          <div class="label">高亮网格线宽</div>
          <div class="value"><input type="number" v-model="config.canvas.gridStyle.strokeLightWidth" @change="canvasChange" /></div>
        </div>
        <div class="configList">
          <div class="label">高亮网格颜色</div>
          <div class="value"><input type="color" v-model="config.canvas.gridStyle.strokeLightColor" @change="canvasChange" /></div>
        </div>
        <div class="configList">
          <div class="label">低暗网格线宽</div>
          <div class="value"><input type="number" v-model="config.canvas.gridStyle.strokeDarkWidth" @change="canvasChange" /></div>
        </div>
        <div class="configList">
          <div class="label">低暗网格颜色</div>
          <div class="value"><input type="color" v-model="config.canvas.gridStyle.strokeDarkColor" @change="canvasChange" /></div>
        </div>
      </div>
      <div class="configItem">
        <div class="configDesc">{{ config.graph.title }}</div>
        <div class="configList">
          <div class="label">图形线条宽度{{ config.graph.graphStyle.strokeWidth }}</div>
          <div class="value"><input type="number" v-model="config.graph.graphStyle.strokeWidth" @change="graphChange('strokeWidth')" /></div>
        </div>
        <div class="configList">
          <div class="label">图形线条颜色</div>
          <div class="value"><input type="color" v-model="config.graph.graphStyle.strokeColor" @change="graphChange('strokeColor')" /></div>
        </div>
        <div class="configList">
          <div class="label">图形填充颜色</div>
          <div class="value"><input type="color" v-model="config.graph.graphStyle.fillColor" @change="graphChange('fillColor')" /></div>
        </div>
        <div class="configList">
          <div class="label">图形内边距</div>
          <div class="value paddingValue">
            <div>上：<input type="number" v-model="config.graph.graphStyle.padding[0]" @change="graphChange('padding')" /></div>
            <div>右：<input type="number" v-model="config.graph.graphStyle.padding[1]" @change="graphChange('padding')" /></div>
            <div>下：<input type="number" v-model="config.graph.graphStyle.padding[2]" @change="graphChange('padding')" /></div>
            <div>左：<input type="number" v-model="config.graph.graphStyle.padding[3]" @change="graphChange('padding')" /></div>
          </div>
        </div>
        <div class="configList">
          <div class="label">节点线条宽度</div>
          <div class="value"><input type="number" v-model="config.graph.graphStyle.focus.strokeWidth" @change="graphChange('focus.strokeWidth')" /></div>
        </div>
        <div class="configList">
          <div class="label">节点线条颜色</div>
          <div class="value"><input type="color" v-model="config.graph.graphStyle.focus.strokeColor" @change="graphChange('focus.strokeColor')" /></div>
        </div>
        <div class="configList">
          <div class="label">节点线条虚线间隔</div>
          <div class="value doubleValue">
            <input type="number" v-model="config.graph.graphStyle.focus.lineDash[0]" @change="graphChange('focus.lineDash', 0)" />
            <input type="number" v-model="config.graph.graphStyle.focus.lineDash[1]" @change="graphChange('focus.lineDash', 1)" />
          </div>
        </div>
        <div class="configList">
          <div class="label">节点颜色</div>
          <div class="value"><input type="color" v-model="config.graph.graphStyle.focus.point.fillColor" @change="graphChange('focus.point.fillColor')" /></div>
        </div>
        <div class="configList">
          <div class="label">节点半径</div>
          <div class="value"><input type="number" v-model="config.graph.graphStyle.focus.point.r" @change="graphChange('focus.point.r')" /></div>
        </div>
        <div class="configList">
          <div class="label">节点虚拟半径</div>
          <div class="value"><input type="number" v-model="config.graph.graphStyle.focus.point.virtualR" @change="graphChange('focus.point.virtualR')" /></div>
        </div>
        <div class="configList">
          <div class="label">图形文本行高</div>
          <div class="value"><input type="number" v-model="config.graph.graphStyle.text.lineHeight" @change="graphChange('text.lineHeight')" /></div>
        </div>
        <div class="configList">
          <div class="label">图形文本字体大小</div>
          <div class="value"><input type="number" v-model="config.graph.graphStyle.text.fontSize" @change="graphChange('text.fontSize')" /></div>
        </div>
        <div class="configList">
          <div class="label">图形文本颜色</div>
          <div class="value"><input type="color" v-model="config.graph.graphStyle.text.color" @change="graphChange('text.color')" /></div>
        </div>
        <div class="configList">
          <div class="label">图形文本对其方式</div>
          <div class="value threeValue">
            <div>
              <input type="radio" name="textAlign" v-model="config.graph.graphStyle.text.textAlign" value="left" @change="graphChange('text.textAlign')" />左
            </div>
            <div>
              <input type="radio" name="textAlign" v-model="config.graph.graphStyle.text.textAlign" value="center" @change="graphChange('text.textAlign')" />中
            </div>
            <div>
              <input type="radio" name="textAlign" v-model="config.graph.graphStyle.text.textAlign" value="right" @change="graphChange('text.textAlign')" />右
            </div>
          </div>
        </div>
        <div class="configList">
          <div class="label">图形文本字体加粗</div>
          <div class="value doubleValue2">
            <div>
              <input type="radio" name="fontWight" v-model="config.graph.graphStyle.text.fontWight" value="normal" @change="graphChange('text.fontWight')" />细
            </div>
            <div>
              <input type="radio" name="fontWight" v-model="config.graph.graphStyle.text.fontWight" value="bold" @change="graphChange('text.fontWight')" />粗
            </div>
          </div>
        </div>
        <div class="configList">
          <div class="label">图形文本字体</div>
          <div class="value"><input type="value" v-model="config.graph.graphStyle.text.fontFamily" @change="graphChange('text.fontFamily')" /></div>
        </div>
      </div>
      <div class="configItem">
        <div class="configDesc">{{ config.line.title }}</div>
        <div class="configList">
          <div class="label">线段宽度</div>
          <div class="value"><input type="number" v-model="config.line.lineStyle.strokeWidth" @change="graphChange('strokeWidth')" /></div>
        </div>
        <div class="configList">
          <div class="label">线段虚拟宽度</div>
          <div class="value"><input type="number" v-model="config.line.lineStyle.strokeVirtualWidth" @change="graphChange('strokeVirtualWidth')" /></div>
        </div>
        <div class="configList">
          <div class="label">线段颜色</div>
          <div class="value"><input type="color" v-model="config.line.lineStyle.strokeColor" @change="graphChange('strokeColor')" /></div>
        </div>
        <div class="configList">
          <div class="label">线段箭头颜色</div>
          <div class="value"><input type="color" v-model="config.line.lineStyle.triangleFillColor" @change="graphChange('triangleFillColor')" /></div>
        </div>
        <div class="configList">
          <div class="label">线段箭头大小</div>
          <div class="value"><input type="number" v-model="config.line.lineStyle.triangleEdgeWidth" @change="graphChange('triangleEdgeWidth')" /></div>
        </div>
        <div class="configList">
          <div class="label">节点颜色</div>
          <div class="value"><input type="color" v-model="config.line.lineStyle.focus.point.fillColor" @change="graphChange('focus.point.fillColor')" /></div>
        </div>
        <div class="configList">
          <div class="label">节点半径</div>
          <div class="value"><input type="number" v-model="config.line.lineStyle.focus.point.r" @change="graphChange('focus.point.r')" /></div>
        </div>
        <div class="configList">
          <div class="label">节点虚拟半径</div>
          <div class="value"><input type="number" v-model="config.line.lineStyle.focus.point.virtualR" @change="graphChange('focus.point.virtualR')" /></div>
        </div>
        <div class="configList">
          <div class="label">虚拟节点颜色</div>
          <div class="value">
            <input type="color" v-model="config.line.lineStyle.focus.emptyPoint.fillColor" @change="graphChange('focus.emptyPoint.fillColor')" />
          </div>
        </div>
        <div class="configList">
          <div class="label">虚拟节点半径</div>
          <div class="value"><input type="number" v-model="config.line.lineStyle.focus.emptyPoint.r" @change="graphChange('focus.emptyPoint.r')" /></div>
        </div>
        <div class="configList">
          <div class="label">虚拟节点虚拟半径</div>
          <div class="value">
            <input type="number" v-model="config.line.lineStyle.focus.emptyPoint.virtualR" @change="graphChange('focus.emptyPoint.virtualR')" />
          </div>
        </div>
      </div>
    </div>
    <div class="fictitiousGrid" ref="fictitiousGrid" v-show="fictitiousGridAttr.show"></div>
    <div class="rightMenu" v-if="rightMenu.show" :style="rightMenu.style">
      <div class="menuItem" v-for="item in rightMenu.list" :key="item.value" v-show="item.show" @click="item.cb">{{ item.label }}</div>
    </div>
    <!-- <div class=""></div> -->
    <div class="canvasBtn">
      <button class="dowload" @click="dowload">下载</button>
      <button class="save" @click="saveData">保存</button>
      <button class="reset" @click="resetConfig">重置配置</button>
    </div>
  </div>
</template>

<script>
/*
  待实现（优先级排序）：
    保存图片背景色配置
    保存图片width、height优化
    文本rang特殊标记
*/
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'

import {
  ArcGraph,
  ThreeGraph,
  FourGraph,
  EllipseGraph,
  RectangleGraph,
  RectangleArcGraph,
  DiamondGraph,
  ParallelogramGraph,
  FillGraph,
  TextGraph,
  TextGraphAutoWH
} from '../../src/core/graphList'
import { UndirectedLine, UnidirectionalLine, BidirectionalLine, CurveLine } from '../../src/core/lineList'
const allClass = [
  ArcGraph,
  ThreeGraph,
  FourGraph,
  EllipseGraph,
  RectangleGraph,
  RectangleArcGraph,
  DiamondGraph,
  ParallelogramGraph,
  FillGraph,
  TextGraph,
  TextGraphAutoWH,
  UndirectedLine,
  UnidirectionalLine,
  BidirectionalLine,
  CurveLine
]
import DrawingBoardFlow from '../../src/core/drawingBoardFlow/flow'
import { vertexInGraph, deepClone, objectMerge, dpr, local } from '../../src/util/helper'

export default {
  name: 'DrawingBoardFlow',
  setup() {
    // 图形列表初始化
    const graphGroup = reactive({
      title: '图形列表',
      children: [
        {
          title: '基本图形',
          children: [
            {
              title: '圆',
              GraphClass: ArcGraph
            },
            {
              title: '正三角形',
              GraphClass: ThreeGraph
            },
            {
              title: '正方形',
              GraphClass: FourGraph
            },
            {
              title: '椭圆',
              GraphClass: EllipseGraph
            },
            {
              title: '菱形',
              GraphClass: DiamondGraph
            },
            {
              title: '矩形',
              GraphClass: RectangleGraph
            },
            {
              title: '圆角矩形',
              GraphClass: RectangleArcGraph
            },
            {
              title: '平行四边形',
              GraphClass: ParallelogramGraph
            },
            {
              title: '文件',
              GraphClass: FillGraph
            },
            {
              title: '文本',
              GraphClass: TextGraph
            }
          ]
        },
        {
          title: '线段',
          children: [
            {
              title: '无向',
              GraphClass: UndirectedLine
            },
            {
              title: '单向',
              GraphClass: UnidirectionalLine
            },
            {
              title: '双向',
              GraphClass: BidirectionalLine
            },
            {
              title: '曲线',
              GraphClass: CurveLine
            }
          ]
        }
      ]
    })
    const graphRefs = []
    const graphItemRef = el => {
      if (el) {
        graphRefs.push(el)
      }
    }
    onMounted(() => {
      let index = 0
      graphGroup.children.forEach(item => {
        item.children.forEach(graph => {
          if (graph.GraphClass) {
            new graph.GraphClass({
              canvas: graphRefs[index]
            })
          }
          index++
        })
      })
    })

    // 配置初始化
    let DrawingBoardFlowClass = null
    const originConfig = {
      title: '配置',
      canvas: {
        title: '画板',
        bgColor: '#ffffff',
        saveImagePadding: 10 * dpr,
        gridStyle: {
          show: true,
          width: 10 * dpr,
          lightInterval: 5,
          strokeLightWidth: 1 * dpr,
          strokeLightColor: '#cccccc',
          strokeDarkWidth: 1 * dpr,
          strokeDarkColor: '#eeeeee'
        }
      },
      graph: {
        title: '图形',
        graphStyle: {
          width: 100 * dpr,
          height: 50 * dpr,
          strokeWidth: 1 * dpr,
          strokeColor: '#333333',
          fillColor: '#ffffff',
          padding: [10 * dpr, 10 * dpr, 10 * dpr, 10 * dpr],
          text: {
            lineHeight: 18 * dpr,
            fontSize: 14 * dpr,
            color: '#000000',
            textAlign: 'center',
            fontWight: 'normal',
            fontFamily: 'PingFang SC'
          },
          hover: {
            show: true,
            globalAlpha: 0.6,
            fillColor: '#fefefe'
          },
          focus: {
            strokeWidth: 1 * dpr,
            strokeColor: '#29b6f2',
            lineDash: [5 * dpr, 5 * dpr],
            point: {
              fillColor: '#29b6f2',
              r: 6 * dpr,
              virtualR: 12 * dpr
            }
          }
        }
      },
      line: {
        title: '线段',
        lineStyle: {
          width: 100 * dpr,
          height: 50 * dpr,
          strokeWidth: 1 * dpr,
          strokeVirtualWidth: 10 * dpr,
          strokeColor: '#333333',
          triangleFillColor: '#333333',
          triangleEdgeWidth: 10 * dpr,
          focus: {
            point: {
              fillColor: '#29b6f2',
              r: 6 * dpr,
              virtualR: 12 * dpr
            },
            emptyPoint: {
              fillColor: '#29b6f2',
              r: 6 * dpr,
              globalAlpha: 0.6,
              virtualR: 12 * dpr
            }
          }
        }
      }
    }
    const config = reactive({
      title: '配置'
    })
    const resetConfig = () => {
      config.canvas = JSON.parse(JSON.stringify(originConfig.canvas))
      config.graph = JSON.parse(JSON.stringify(originConfig.graph))
      config.line = JSON.parse(JSON.stringify(originConfig.line))

      if (DrawingBoardFlowClass) {
        canvasChange()
      }
    }
    resetConfig()

    // 配置 画板修改
    const canvasChange = () => {
      if (!DrawingBoardFlowClass) {
        return
      }
      DrawingBoardFlowClass.saveImagePadding = config.canvas.saveImagePadding
      DrawingBoardFlowClass.bgColor = config.canvas.bgColor
      DrawingBoardFlowClass.gridStyle = config.canvas.gridStyle
      DrawingBoardFlowClass.reDraw()
    }
    // 配置 图形、线段修改
    const graphChange = type => {
      if (DrawingBoardFlowClass.focusGraphOrLine) {
        if (DrawingBoardFlowClass.focusGraphOrLine.graphType === 'graph') {
          DrawingBoardFlowClass.focusGraphOrLine.style = objectMerge(DrawingBoardFlowClass.focusGraphOrLine.style, config.graph.graphStyle)
          if (type.indexOf('text') > -1) {
            DrawingBoardFlowClass.focusGraphOrLine.formatTextXY()
          }
          DrawingBoardFlowClass.reDraw()
        } else if (DrawingBoardFlowClass.focusGraphOrLine.graphType === 'line') {
          DrawingBoardFlowClass.focusGraphOrLine.style = objectMerge(DrawingBoardFlowClass.focusGraphOrLine.style, config.line.lineStyle)
          DrawingBoardFlowClass.reDraw()
        }
      }
    }

    // 左击回调
    const mouseupBtn0Cb = () => {
      rightMenu.show = false
      if (DrawingBoardFlowClass.focusGraphOrLine) {
        if (DrawingBoardFlowClass.focusGraphOrLine.graphType === 'graph') {
          Object.keys(config.graph.graphStyle).forEach(attr => {
            config.graph.graphStyle[attr] = DrawingBoardFlowClass.focusGraphOrLine.style[attr]
          })
        } else if (DrawingBoardFlowClass.focusGraphOrLine.graphType === 'line') {
          Object.keys(config.line.lineStyle).forEach(attr => {
            config.line.lineStyle[attr] = DrawingBoardFlowClass.focusGraphOrLine.style[attr]
          })
        }
      }
    }

    // 右击菜单
    const rightMenu = reactive({
      show: false,
      style: {},
      ctrlC: null,
      rightSelectionIndex: null,
      xy: {},
      translate: {
        x: 10,
        y: 10
      },
      list: [
        {
          label: '置于顶层',
          value: 0,
          show: true,
          cb: () => {
            DrawingBoardFlowClass.resetGraphListIndex()
            rightMenu.show = false
          }
        },
        {
          label: '删除',
          value: 1,
          show: true,
          cb: () => {
            DrawingBoardFlowClass.delGraphToList()
            rightMenu.show = false
          }
        },
        {
          label: '复制',
          value: 2,
          show: true,
          cb: () => {
            rightMenu.ctrlC = DrawingBoardFlowClass.focusGraphOrLine
            rightMenu.show = false
          }
        },
        {
          label: '在此处粘贴',
          value: 3,
          show: true,
          cb: () => {
            const canvasDom = drawingBoardFlowCanvas.value
            let data = {
              canvas: canvasDom,
              scaleC: rightMenu.ctrlC.scaleC
            }
            let x = (rightMenu.xy.x - canvasDom.getBoundingClientRect().left) * DrawingBoardFlowClass.dpr
            let y = (rightMenu.xy.y - canvasDom.getBoundingClientRect().top) * DrawingBoardFlowClass.dpr
            x = x - ((x - DrawingBoardFlowClass.canvas.width / 2) % (config.canvas.gridStyle.width * DrawingBoardFlowClass.scaleC))
            y = y - ((y - DrawingBoardFlowClass.canvas.height / 2) % (config.canvas.gridStyle.width * DrawingBoardFlowClass.scaleC))
            if (rightMenu.ctrlC.graphType === 'graph') {
              data = objectMerge(data, {
                xy: {
                  x:
                    DrawingBoardFlowClass.canvas.width / 2 +
                    (x - DrawingBoardFlowClass.canvas.width / 2) / DrawingBoardFlowClass.scaleC +
                    rightMenu.ctrlC.style.width / 2,
                  y:
                    DrawingBoardFlowClass.canvas.height / 2 +
                    (y - DrawingBoardFlowClass.canvas.height / 2) / DrawingBoardFlowClass.scaleC +
                    rightMenu.ctrlC.style.height / 2
                },
                style: rightMenu.ctrlC.style,
                content: rightMenu.ctrlC.content,
                drawContent: rightMenu.ctrlC.drawContent,
                autoDraw: false
              })
              let newGraph = null
              if (rightMenu.ctrlC.asName === 'TextGraphAutoWH') {
                newGraph = new TextGraph(data)
              } else {
                newGraph = new rightMenu.ctrlC.constructor(data)
              }
              newGraph.formatTextXY()
              DrawingBoardFlowClass.addGraphToList(newGraph)
            }
            if (rightMenu.ctrlC.graphType === 'line') {
              const vertex = []
              const translate = {
                x:
                  DrawingBoardFlowClass.canvas.width / 2 +
                  (x - DrawingBoardFlowClass.canvas.width / 2) / DrawingBoardFlowClass.scaleC -
                  rightMenu.ctrlC.vertex[0].x,
                y:
                  DrawingBoardFlowClass.canvas.height / 2 +
                  (y - DrawingBoardFlowClass.canvas.height / 2) / DrawingBoardFlowClass.scaleC -
                  rightMenu.ctrlC.vertex[0].y
              }
              rightMenu.ctrlC.vertex.forEach(item => {
                vertex.push({
                  x: item.x + translate.x,
                  y: item.y + translate.y
                })
              })
              data = objectMerge(data, {
                vertex: vertex,
                style: rightMenu.ctrlC.style,
                autoDraw: false
              })
              const newLine = new rightMenu.ctrlC.constructor(data)
              if (rightMenu.ctrlC.contentArr.length) {
                rightMenu.ctrlC.contentArr.forEach(item => {
                  const newLineTextGraph = new item.constructor(
                    deepClone({
                      canvas: canvasDom,
                      scaleC: rightMenu.ctrlC.scaleC,
                      xy: {
                        x: item.xy.x + translate.x,
                        y: item.xy.y + translate.y
                      },
                      content: item.content,
                      autoDraw: false,
                      lineVertexIndex: item.lineVertexIndex,
                      positionPercentage: item.positionPercentage,
                      style: item.style
                    })
                  )
                  newLineTextGraph.parentClass = newLine
                  newLine.contentArr.push(newLineTextGraph)
                })
              }
              DrawingBoardFlowClass.addGraphToList(newLine)
              if (newLine.contentArr.length) {
                newLine.contentArr.forEach(item => {
                  DrawingBoardFlowClass.addGraphToList(item)
                })
              }
            }
            rightMenu.show = false
          }
        },
        {
          label: '删除该节点',
          value: 4,
          show: false,
          cb: () => {
            DrawingBoardFlowClass.focusGraphOrLine.delVertex(rightMenu.rightSelectionIndex, DrawingBoardFlowClass)
            rightMenu.show = false
            DrawingBoardFlowClass.vertexFocusRightSelectionIndex = null
            DrawingBoardFlowClass.reDraw()
          }
        },
        {
          label: '添加备注',
          value: 5,
          show: false,
          cb: () => {}
        }
      ]
    })
    const mouseupBtn2Cb = (xy, vertexFocusRightSelectionIndex) => {
      // 右击
      rightMenu.list.forEach(item => {
        item.show = false
      })
      let length = 0
      if (DrawingBoardFlowClass.focusGraphOrLine) {
        rightMenu.list[0].show = true
        rightMenu.list[1].show = true
        rightMenu.list[2].show = true
        rightMenu.list[5].show = true
        length = 4
      }
      if (rightMenu.ctrlC) {
        rightMenu.list[3].show = true
        length += 1
      }
      if (vertexFocusRightSelectionIndex) {
        rightMenu.rightSelectionIndex = vertexFocusRightSelectionIndex
        rightMenu.list[4].show = true
        length += 1
      }
      if (length) {
        rightMenu.show = true
        rightMenu.xy = {
          x: xy.x,
          y: xy.y
        }
        const width = 100
        const height = length * 30 + 6
        const bodyClientWidth = document.body.clientWidth
        const bodyClientHeight = document.body.clientHeight
        let left = xy.x + rightMenu.translate.x
        let top = xy.y + rightMenu.translate.y
        if (left + width > bodyClientWidth) {
          left = left - width - rightMenu.translate.x * 2
        }
        if (top + height > bodyClientHeight) {
          top = top - height - rightMenu.translate.y * 2
        }
        left += 'px'
        top += 'px'
        rightMenu.style = {
          left,
          top
        }
      } else {
        rightMenu.show = false
      }
    }

    // 保存数据
    const saveData = () => {
      const saveData = DrawingBoardFlowClass.save()
      local.set('flowData', JSON.stringify(saveData.objData), 999)
    }

    // 下载图片
    const dowload = () => {
      const saveData = DrawingBoardFlowClass.save()
      downloadImage(saveData.imageData.base64, '流程图')
    }
    const downloadImage = (base64, downloadName) => {
      const link = document.createElement('a')
      link.setAttribute('download', downloadName)
      link.href = base64
      link.click()
    }

    // 画布初始化
    const drawingBoardFlowCanvas = ref(null)
    onMounted(() => {
      const drawingBoardFlowObj = {
        canvas: drawingBoardFlowCanvas.value,
        eventFlag: true,
        saveImagePadding: config.canvas.saveImagePadding,
        bgColor: config.canvas.bgColor,
        gridStyle: config.canvas.gridStyle,
        mousemoveHoverFlag: true,
        mouseupBtn0Cb: mouseupBtn0Cb,
        mouseupBtn2Cb: mouseupBtn2Cb
      }
      let flowData = local.get('flowData')
      if (flowData) {
        flowData = JSON.parse(flowData)
        const dprIndex = dpr / flowData.dpr

        flowData.centerXY = {
          x: flowData.centerXY.x * dprIndex,
          y: flowData.centerXY.y * dprIndex
        }

        flowData.gridStyle.strokeDarkWidth *= dprIndex
        flowData.gridStyle.strokeLightWidth *= dprIndex
        flowData.gridStyle.width *= dprIndex
        drawingBoardFlowObj.bgColor = flowData.bgColor
        config.canvas.bgColor = flowData.bgColor
        drawingBoardFlowObj.saveImagePadding = flowData.saveImagePadding
        config.canvas.saveImagePadding = flowData.saveImagePadding
        drawingBoardFlowObj.gridStyle = flowData.gridStyle
        config.canvas.gridStyle = flowData.gridStyle

        drawingBoardFlowObj.scaleCIndex = flowData.scaleCIndex
        DrawingBoardFlowClass = new DrawingBoardFlow(drawingBoardFlowObj)

        const translate = {
          x: DrawingBoardFlowClass.centerXY.x - flowData.centerXY.x,
          y: DrawingBoardFlowClass.centerXY.y - flowData.centerXY.y
        }
        if (flowData.graphList.length) {
          if (dprIndex !== 1 || translate.x !== 0 || translate.y !== 0) {
            flowData.graphList.forEach(item => {
              if (item.graphType === 'graph') {
                item.xy.x = item.xy.x * dprIndex + translate.x
                item.xy.y = item.xy.y * dprIndex + translate.y
                item.style.height *= dprIndex
                item.style.width *= dprIndex
                item.style.strokeWidth *= dprIndex
                item.style.padding[0] *= dprIndex
                item.style.padding[1] *= dprIndex
                item.style.padding[2] *= dprIndex
                item.style.padding[3] *= dprIndex
                item.style.focus.lineDash[0] *= dprIndex
                item.style.focus.lineDash[1] *= dprIndex
                item.style.focus.strokeWidth *= dprIndex
                item.style.focus.point.r *= dprIndex
                item.style.focus.point.virtualR *= dprIndex
                item.style.focus.point.strokeWidth *= dprIndex
                item.style.text.fontSize *= dprIndex
                item.style.text.lineHeight *= dprIndex
              } else {
                item.vertex.forEach(vertex => {
                  vertex.x = vertex.x * dprIndex + translate.x
                  vertex.y = vertex.y * dprIndex + translate.y
                })
                item.style.strokeVirtualWidth *= dprIndex
                item.style.strokeWidth *= dprIndex
                item.style.triangleEdgeWidth *= dprIndex
                item.style.focus.point.r *= dprIndex
                item.style.focus.point.virtualR *= dprIndex
                item.style.focus.emptyPoint.r *= dprIndex
                item.style.focus.emptyPoint.virtualR *= dprIndex
                item.style.text.fontSize *= dprIndex
                item.style.text.lineHeight *= dprIndex
              }
            })
          }
          flowData.graphList.forEach(item => {
            const NewClass = allClass.filter(itemClass => {
              return itemClass.asName === item.asName
            })[0]
            if (NewClass) {
              const data = {
                canvas: drawingBoardFlowCanvas.value,
                scaleC: DrawingBoardFlowClass.scaleC,
                autoDraw: false,
                style: item.style,
                id: item.id,
                content: item.content
              }
              if (NewClass.graphType === 'graph') {
                data.xy = item.xy
                data.lineArr = item.lineArr
                // 线文本特殊处理
                if (item.lineVertexIndex) {
                  data.lineVertexIndex = item.lineVertexIndex
                }
                if (item.positionPercentage) {
                  data.positionPercentage = item.positionPercentage
                }
              } else {
                data.vertex = item.vertex
                data.contentArr = item.contentArr
              }
              DrawingBoardFlowClass.addGraphToList(new NewClass(data))
            }
          })
          DrawingBoardFlowClass.graphList.forEach(item => {
            if (item.graphType === 'graph' && item.lineArr.length) {
              for (let i = 0; i < item.lineArr.length; i++) {
                item.lineArr[i].line = DrawingBoardFlowClass.graphList.filter(line => {
                  return line.id === item.lineArr[i].id
                })[0]
              }
            } else if (item.graphType === 'line' && item.contentArr.length) {
              for (let i = 0; i < item.contentArr.length; i++) {
                item.contentArr[i] = DrawingBoardFlowClass.graphList.filter(graph => {
                  return graph.id === item.contentArr[i]
                })[0]
                item.contentArr[i].parentClass = item
              }
            }
          })
        }
      } else {
        DrawingBoardFlowClass = new DrawingBoardFlow(drawingBoardFlowObj)
      }
    })
    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', graphMove)
      document.removeEventListener('mouseup', graphUp)
      DrawingBoardFlowClass && DrawingBoardFlowClass.removeEvent && DrawingBoardFlowClass.removeEvent()
    })

    // 图形拖放逻辑
    let CurMoveGraphClass = null
    const fictitiousGrid = ref(null)
    const fictitiousGridAttr = reactive({
      width: 0,
      height: 0,
      show: false
    })
    const fictitiousGridDomInit = (x, y) => {
      fictitiousGridAttr.width = originConfig.graph.graphStyle.width
      fictitiousGrid.value.style.width = (fictitiousGridAttr.width / DrawingBoardFlowClass.dpr) * DrawingBoardFlowClass.scaleC + 'px'
      fictitiousGridAttr.height = CurMoveGraphClass.benchmarkType ? originConfig.graph.graphStyle.height : originConfig.graph.graphStyle.height * 2
      fictitiousGrid.value.style.height = (fictitiousGridAttr.height / DrawingBoardFlowClass.dpr) * DrawingBoardFlowClass.scaleC + 'px'
      fictitiousGridMove(x, y)
      fictitiousGridAttr.show = true
    }
    const fictitiousGridMove = (x, y) => {
      fictitiousGrid.value.style.left = x + 'px'
      fictitiousGrid.value.style.top = y + 'px'
    }
    const graphDown = graphItem => {
      const e = window.event
      CurMoveGraphClass = graphItem.GraphClass
      document.addEventListener('mousemove', graphMove)
      document.addEventListener('mouseup', graphUp)

      fictitiousGridDomInit(e.clientX, e.clientY)
      e.preventDefault()
    }
    const graphMove = e => {
      if (!CurMoveGraphClass) {
        return
      }
      fictitiousGridMove(e.clientX, e.clientY)
    }
    const graphUp = e => {
      const canvasDom = drawingBoardFlowCanvas.value
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
        let data = {
          canvas: canvasDom,
          scaleC: DrawingBoardFlowClass.scaleC,
          autoDraw: false
        }
        let x = (e.clientX - canvasDom.getBoundingClientRect().left) * DrawingBoardFlowClass.dpr
        let y = (e.clientY - canvasDom.getBoundingClientRect().top) * DrawingBoardFlowClass.dpr
        x = x - ((x - DrawingBoardFlowClass.canvas.width / 2) % (config.canvas.gridStyle.width * DrawingBoardFlowClass.scaleC))
        y = y - ((y - DrawingBoardFlowClass.canvas.height / 2) % (config.canvas.gridStyle.width * DrawingBoardFlowClass.scaleC))
        if (CurMoveGraphClass.graphType === 'graph') {
          data = objectMerge(data, {
            xy: {
              x:
                DrawingBoardFlowClass.canvas.width / 2 +
                (x - DrawingBoardFlowClass.canvas.width / 2) / DrawingBoardFlowClass.scaleC +
                fictitiousGridAttr.width / 2,
              y:
                DrawingBoardFlowClass.canvas.height / 2 +
                (y - DrawingBoardFlowClass.canvas.height / 2) / DrawingBoardFlowClass.scaleC +
                fictitiousGridAttr.height / 2
            },
            style: objectMerge(config.graph.graphStyle, {
              width: fictitiousGridAttr.width,
              height: fictitiousGridAttr.height
            })
          })
          DrawingBoardFlowClass.addGraphToList(new CurMoveGraphClass(data))
        } else if (CurMoveGraphClass.graphType === 'line') {
          let vertex = []
          if (CurMoveGraphClass.asName === 'CurveLine') {
            vertex = [
              {
                x: DrawingBoardFlowClass.canvas.width / 2 + (x - DrawingBoardFlowClass.canvas.width / 2) / DrawingBoardFlowClass.scaleC,
                y: DrawingBoardFlowClass.canvas.height / 2 + (y - DrawingBoardFlowClass.canvas.height / 2) / DrawingBoardFlowClass.scaleC
              },
              {
                x:
                  DrawingBoardFlowClass.canvas.width / 2 +
                  (x - DrawingBoardFlowClass.canvas.width / 2) / DrawingBoardFlowClass.scaleC +
                  fictitiousGridAttr.width / 2,
                y:
                  DrawingBoardFlowClass.canvas.height / 2 +
                  (y - DrawingBoardFlowClass.canvas.height / 2) / DrawingBoardFlowClass.scaleC +
                  fictitiousGridAttr.height
              },
              {
                x:
                  DrawingBoardFlowClass.canvas.width / 2 +
                  (x - DrawingBoardFlowClass.canvas.width / 2) / DrawingBoardFlowClass.scaleC +
                  fictitiousGridAttr.width,
                y: DrawingBoardFlowClass.canvas.height / 2 + (y - DrawingBoardFlowClass.canvas.height / 2) / DrawingBoardFlowClass.scaleC
              }
            ]
          } else {
            vertex = [
              {
                x: DrawingBoardFlowClass.canvas.width / 2 + (x - DrawingBoardFlowClass.canvas.width / 2) / DrawingBoardFlowClass.scaleC,
                y: DrawingBoardFlowClass.canvas.height / 2 + (y - DrawingBoardFlowClass.canvas.height / 2) / DrawingBoardFlowClass.scaleC
              },
              {
                x:
                  DrawingBoardFlowClass.canvas.width / 2 +
                  (x - DrawingBoardFlowClass.canvas.width / 2) / DrawingBoardFlowClass.scaleC +
                  fictitiousGridAttr.width,
                y:
                  DrawingBoardFlowClass.canvas.height / 2 +
                  (y - DrawingBoardFlowClass.canvas.height / 2) / DrawingBoardFlowClass.scaleC +
                  fictitiousGridAttr.height
              }
            ]
          }
          data = objectMerge(data, {
            vertex,
            style: objectMerge(config.line.lineStyle, {
              width: fictitiousGridAttr.width,
              height: fictitiousGridAttr.height
            })
          })
          DrawingBoardFlowClass.addGraphToList(new CurMoveGraphClass(data))
        }
      }
      document.removeEventListener('mousemove', graphMove)
      document.removeEventListener('mouseup', graphUp)
      fictitiousGridAttr.show = false
      CurMoveGraphClass = null
    }

    return {
      graphGroup,
      graphItemRef,

      config,
      resetConfig,
      canvasChange,
      graphChange,

      drawingBoardFlowCanvas,

      fictitiousGrid,
      fictitiousGridAttr,
      graphDown,

      rightMenu,

      saveData,
      dowload
    }
  }
}
</script>

<style scoped lang="scss">
.drawingBoardFlow {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
  .graphGroup {
    width: 216px;
    height: 100%;
    background: #fbfbfb;
    overflow-y: auto;
    .groupTitle {
      height: 66px;
      line-height: 66px;
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      background: #dbdbdb;
      border-bottom: 1px solid #fff;
    }
    .graphGroupItem {
      margin-bottom: 20px;
      .groupDesc {
        height: 26px;
        line-height: 26px;
        text-align: left;
        font-size: 14px;
        padding-left: 10px;
        background: #ebebeb;
      }
      .graphList {
        overflow: hidden;
        .graphItem {
          float: left;
          margin: 6px;
          width: 60px;
          .graphDom {
            width: 50px;
            height: 50px;
            padding: 5px;
            border-radius: 10px;
            box-sizing: content-box;
            .graphCanvas {
              width: 50px;
              height: 50px;
            }
          }
          .graphDom:hover {
            background: #e0e0e0;
          }
          .graphDesc {
            width: 100%;
            text-align: center;
            font-size: 12px;
          }
        }
      }
    }
  }
  .drawingBoardFlow {
    flex: 1;
  }
  .config {
    width: 260px;
    height: 100%;
    background: #fbfbfb;
    overflow-y: auto;
    .configTitle {
      height: 66px;
      line-height: 66px;
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      background: #dbdbdb;
      border-bottom: 1px solid #fff;
    }
    .configItem {
      margin-bottom: 10px;
      .configDesc {
        height: 26px;
        line-height: 26px;
        text-align: left;
        font-size: 14px;
        padding-left: 10px;
        background: #ebebeb;
      }
      .configList {
        display: flex;
        align-items: center;
        padding: 6px 10px;
        .label {
          width: 100px;
          font-size: 12px;
          text-align: right;
          margin-right: 20px;
        }
        .value {
          flex: 1;
          input {
            display: block;
            width: 100%;
            height: 20px;
            box-sizing: border-box;
          }
        }
        .doubleValue {
          display: flex;
          justify-content: space-between;
          input {
            width: 48%;
          }
        }
        .threeValue {
          display: flex;
          justify-content: space-between;
          div {
            width: 30%;
            font-size: 12px;
            input {
              width: 100%;
            }
          }
        }
        .doubleValue2 {
          display: flex;
          justify-content: space-between;
          div {
            width: 50%;
            font-size: 12px;
            input {
              width: 100%;
            }
          }
        }
        .paddingValue {
          div {
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          div:last-child {
            margin-bottom: 0px;
          }
        }
      }
    }
  }

  canvas {
    width: 100%;
    height: 100%;
  }
  .fictitiousGrid {
    position: fixed;
    width: 50px;
    height: 25px;
    border: 1px dashed #06f;
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
    right: 300px;
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
    .reset {
      background: #fff;
      border: 1px solid #409eff;
      color: #000;
    }
  }
}
</style>
