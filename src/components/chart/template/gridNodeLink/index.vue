<template>
  <div class="gridNodeLink">
    <canvas ref="gridNodeLinkCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { GridNodeLink } from '../../src/main'
import { objectMerge, dpr } from '../../src/util/helper'
export default {
  name: 'GridNodeLink',
  setup() {
    // const color = ['#ff7575', '#96FED1', '#E4C1F9', '#97CBFF', '#F694C1', '#EDE7B1']

    const style = {
      graphStyle: {
        fillColor: '#ffffff',
        strokeColor: '#383F51',
        text: {
          color: '#333333'
        }
      },
      lineStyle: {
        strokeColor: '#333333'
      }
    }
    const focusStyle = {
      graphStyle: {
        fillColor: '#D3D8EF',
        strokeColor: '#383F51',
        text: {
          color: '#333333'
        }
      },
      lineStyle: {
        strokeColor: '#DC3545'
      }
    }
    const disabledStyle = {
      graphStyle: {
        fillColor: '#F9F9F9',
        strokeColor: '#D5D5D5',
        text: {
          color: '#999999'
        }
      }
    }
    const data = [
      [
        [
          [
            {
              text: '监管项目',
              id: '1-1',
              style
            },
            null
          ],
          [
            {
              text: '版本',
              id: '1-2',
              style
            },
            null
          ],
          [
            {
              text: '主题',
              id: '1-3',
              style
            },
            {
              text: '数据源类型',
              id: '1-4',
              style
            }
          ],
          [
            {
              text: '数据表',
              id: '1-5',
              style
            },
            {
              text: '数据源',
              id: '1-6',
              style
            }
          ],
          [
            null,
            {
              text: '数据项',
              id: '1-7',
              style
            }
          ],
          [
            {
              text: '检核类型',
              id: '1-8',
              style
            },
            {
              text: '检核规则',
              id: '1-9',
              style
            }
          ]
        ],
        [
          [null],
          [
            {
              text: '源系统',
              id: '2-1',
              disabled: true,
              style: disabledStyle
            }
          ],
          [
            {
              text: '源数据库',
              id: '2-2',
              disabled: true,
              style: disabledStyle
            }
          ],
          [
            {
              text: '源数据表',
              id: '2-3',
              disabled: true,
              style: disabledStyle
            }
          ],
          [
            {
              text: '源字段',
              id: '2-4',
              disabled: true,
              style: disabledStyle
            }
          ],
          [null]
        ],
        [
          [
            {
              text: '法人机构',
              id: '3-1',
              disabled: true,
              style: disabledStyle
            }
          ],
          [
            {
              text: '部门',
              id: '3-2',
              disabled: true,
              style: disabledStyle
            }
          ],
          [
            {
              text: '人员',
              id: '3-3',
              disabled: true,
              style: disabledStyle
            }
          ],
          [null],
          [null],
          [null]
        ]
      ],
      [
        [
          [
            {
              text: '问题批次',
              id: '4-1',
              style
            },
            {
              text: '检核问题',
              id: '4-2',
              style
            }
          ]
        ],
        [
          [
            {
              text: '问题分析单',
              id: '5-1',
              disabled: true,
              style: disabledStyle
            }
          ]
        ],
        [
          [
            {
              text: '整改任务',
              id: '6-1',
              disabled: true,
              style: disabledStyle
            }
          ]
        ]
      ]
    ]

    const dataTitleStyle = {
      fillColor: '#ffffff',
      strokeColor: '#ffffff',
      padding: 20 * dpr,
      text: {
        color: '#333333',
        fontWight: 'bold'
      }
    }
    const dataTitle = [
      {
        text: '监管标准',
        style: dataTitleStyle,
        position: {
          left: 'center',
          top: 'top'
        }
      },
      {
        text: '源系统结构',
        style: dataTitleStyle,
        position: {
          left: 'center',
          top: 'top'
        }
      },
      {
        text: '组织-人员',
        style: dataTitleStyle,
        position: {
          left: 'center',
          top: 'top'
        }
      },
      {
        text: '问题汇总库',
        style: dataTitleStyle,
        position: {
          left: 'center',
          top: 'bottom'
        }
      },
      {
        text: '问题分析库',
        style: dataTitleStyle,
        position: {
          left: 'center',
          top: 'bottom'
        }
      },
      {
        text: '整改任务库',
        style: dataTitleStyle,
        position: {
          left: 'center',
          top: 'bottom'
        }
      }
    ]
    const link = [
      {
        fromId: '1-1',
        toId: '1-2'
      },
      {
        fromId: '1-2',
        toId: '1-3'
      },
      {
        fromId: '1-3',
        toId: '1-5'
      },
      {
        fromId: '1-5',
        toId: '1-7'
      },
      {
        fromId: '1-7',
        toId: '1-6'
      },
      {
        fromId: '1-6',
        toId: '1-4'
      },
      {
        fromId: '1-7',
        toId: '1-9'
      },
      {
        fromId: '1-9',
        toId: '1-8'
      },
      {
        fromId: '1-9',
        toId: '4-2'
      },
      {
        fromId: '4-2',
        toId: '4-1'
      },
      {
        fromId: '1-7',
        toId: '2-4'
      },
      {
        fromId: '2-4',
        toId: '2-3'
      },
      {
        fromId: '2-3',
        toId: '2-2'
      },
      {
        fromId: '2-2',
        toId: '2-1'
      },
      {
        fromId: '2-1',
        toId: '3-1'
      },
      {
        fromId: '2-1',
        toId: '3-2'
      },
      {
        fromId: '2-1',
        toId: '3-3'
      },
      {
        fromId: '3-3',
        toId: '6-1'
      },
      {
        fromId: '6-1',
        toId: '5-1'
      },
      {
        fromId: '5-1',
        toId: '4-2'
      }
    ]
    const linkLine = [
      ['1-1', '1-2', '1-3', '1-5', '1-7', '1-6', '1-4'],
      ['1-1', '1-2', '1-3', '1-5', '1-7', '1-9', '1-8'],
      ['1-1', '1-2', '1-3', '1-5', '1-7', '1-9', '4-2', '4-1'],
      ['1-4', '1-6', '1-7', '1-9', '1-8'],
      ['1-4', '1-6', '1-7', '1-9', '4-2', '4-1'],
      ['1-8', '1-9', '4-2', '4-1']
    ]
    let focusGraph = []
    let focusGraphId = []
    let focusLine = []

    const gridNodeLinkCanvas = ref(null)
    let GridNodeLinkClass = null
    onMounted(() => {
      GridNodeLinkClass = new GridNodeLink({
        canvas: gridNodeLinkCanvas.value,
        data,
        dataTitle,
        link,
        autoScale: false,
        eventFlag: true,
        collapsable: true,
        dbclickEditFlag: false,
        mousemoveGraphFlag: false,
        mousedownFocusFlag: false,
        mousemoveHoverFlag: false,
        mousemoveCb: item => {
          if (item) {
            // console.log(item)
          }
        },
        mouseupBtn2Cb: () => {
          console.log(GridNodeLinkClass.focusGraphOrLine, 222)
        },
        mouseupBtn0Cb: (xy, item) => {
          if (item && !item.opt.disabled) {
            if (focusGraph.length === 1) {
              if (item.id !== focusGraphId[0]) {
                for (let i = 0; i < linkLine.length; i++) {
                  const startIndex = linkLine[i].indexOf(focusGraphId[0])
                  const endIndex = linkLine[i].indexOf(item.id)
                  if (startIndex > -1 && endIndex > -1) {
                    if (startIndex < endIndex) {
                      for (let j = startIndex + 1; j <= endIndex; j++) {
                        const graph = GridNodeLinkClass.graphList.filter(graph => {
                          return linkLine[i][j] === graph.id
                        })[0]
                        focusGraph.push(graph)
                        focusGraphId.push(graph.id)
                      }
                    } else {
                      for (let j = startIndex - 1; j >= endIndex; j--) {
                        const graph = GridNodeLinkClass.graphList.filter(graph => {
                          return linkLine[i][j] === graph.id
                        })[0]
                        focusGraph.push(graph)
                        focusGraphId.push(graph.id)
                      }
                    }
                    break
                  }
                }
                focusGraph.forEach(item => {
                  item.style = objectMerge(item.style, focusStyle.graphStyle)
                })

                GridNodeLinkClass.linkList.forEach(itemLine => {
                  if (focusGraphId.indexOf(itemLine.opt.originData.fromId) > -1 && focusGraphId.indexOf(itemLine.opt.originData.toId) > -1) {
                    focusLine.push(itemLine)
                  }
                })
                focusLine.forEach(item => {
                  item.style = objectMerge(item.style, focusStyle.lineStyle)
                })

                GridNodeLinkClass.reDraw()
              }
            } else {
              if (focusGraph.length > 1) {
                focusGraph.forEach(item => {
                  item.style = objectMerge(item.style, style.graphStyle)
                })
                focusLine.forEach(item => {
                  item.style = objectMerge(item.style, style.lineStyle)
                })
              }
              focusGraph = [item]
              focusGraphId = [item.id]
              focusLine = []
              item.style = objectMerge(item.style, focusStyle.graphStyle)
              GridNodeLinkClass.reDraw()
            }
          }
        }
      })
    })
    onBeforeUnmount(() => {
      GridNodeLinkClass && GridNodeLinkClass.removeEvent()
    })
    return {
      gridNodeLinkCanvas
    }
  }
}
</script>

<style scoped lang="scss">
.gridNodeLink {
  width: 100%;
  height: 100%;
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
