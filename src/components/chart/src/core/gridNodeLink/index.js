import View from '../view'
import * as graphList from '../graphList.js'
import * as lineList from '../lineList.js'
import { dpr, echoWarn, getType, echoError, objectMerge, convertMorP, getGraphWidthOrHeight } from '../../util/helper.js'

const style = {
  graph: 'RectangleArcGraph',
  graphStyle: {
    width: 100 * dpr,
    height: 50 * dpr,
    padding: 10 * dpr,
    strokeWidth: 1 * dpr,
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
    },
    hover: {
      show: true,
      strokeWidth: 1 * dpr,
      strokeColor: '#333333',
      fillColor: '#ffffff',
      globalAlpha: 1,
      text: {
        globalAlpha: 1,
        lineHeight: 18 * dpr,
        fontSize: 14 * dpr,
        color: '#000000',
        textAlign: 'left',
        fontWight: 'normal',
        fontFamily: 'PingFang SC'
      }
    }
  },
  line: 'UndirectedLine',
  lineStyle: {
    strokeWidth: 1 * dpr,
    strokeColor: '#333333',
    globalAlpha: 1,
    hover: {
      globalAlpha: 1,
      show: false
    },
    focus: {
      show: false
    }
  },
  cardLine: 'UndirectedDashedLine',
  cardLineStyle: {
    strokeWidth: 1 * dpr,
    strokeColor: '#333333',
    globalAlpha: 1,
    hover: {
      globalAlpha: 1,
      show: false
    },
    focus: {
      show: false
    }
  },
  titleGraph: 'TextGraph',
  titleGraphStyle: {
    width: 'auto',
    height: 'auto',
    padding: 10 * dpr,
    strokeWidth: 1 * dpr,
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
    },
    hover: {
      show: true,
      strokeWidth: 1 * dpr,
      strokeColor: '#333333',
      fillColor: '#ffffff',
      globalAlpha: 1,
      text: {
        globalAlpha: 1,
        lineHeight: 18 * dpr,
        fontSize: 14 * dpr,
        color: '#000000',
        textAlign: 'left',
        fontWight: 'normal',
        fontFamily: 'PingFang SC'
      }
    }
  },
  layoutStyle: {
    padding: [1 * dpr, 1 * dpr],
    card: [
      [
        {
          padding: [60 * dpr, 10 * dpr, 10 * dpr],
          itemMargin: [20 * dpr, 10 * dpr]
        },
        {
          padding: [60 * dpr, 10 * dpr, 10 * dpr],
          itemMargin: [20 * dpr, 10 * dpr]
        },
        {
          padding: [60 * dpr, 10 * dpr, 10 * dpr],
          itemMargin: [20 * dpr, 10 * dpr]
        }
      ],
      [
        {
          padding: [10 * dpr, 10 * dpr, 60 * dpr],
          itemMargin: [20 * dpr, 10 * dpr]
        },
        {
          padding: [10 * dpr, 10 * dpr, 60 * dpr],
          itemMargin: [20 * dpr, 10 * dpr]
        },
        {
          padding: [10 * dpr, 10 * dpr, 60 * dpr],
          itemMargin: [20 * dpr, 10 * dpr]
        }
      ]
    ]
  }
}

export default class GridNodeLink extends View {
  constructor(opt) {
    super(opt)
    this.data = getType(opt.data) === 'Array' ? opt.data : []
    this.link = getType(opt.link) === 'Array' ? opt.link : []
    this.dataTitle = getType(opt.dataTitle) === 'Array' ? opt.dataTitle : []

    this.autoDraw = getType(opt.autoDraw) === 'Boolean' ? opt.autoDraw : true
    this.style = objectMerge(style, opt.style)

    this.init()
  }
  init() {
    super.init()
    if (!this.data.length) {
      echoWarn('未传入数据或数据为空')
      return
    }

    this.initData()
  }
  initData() {
    this.style.graph = graphList[this.style.graph]
    this.style.line = lineList[this.style.line]
    this.style.cardLine = lineList[this.style.cardLine]
    this.style.titleGraph = graphList[this.style.titleGraph]

    if (!this.style.graph) {
      echoError('未知图类型')
      return
    }

    this.formatLayoutStyle()

    this.setDataXY()

    this.initGraphList()

    this.draw()
    if (this.eventFlag) {
      super.addEvent()
    }
  }
  formatLayoutStyle() {
    this.style.layoutStyle.padding = convertMorP(this.style.layoutStyle.padding)
    this.style.layoutStyle.card.forEach(rowCard => {
      rowCard.forEach(item => {
        item.padding = convertMorP(item.padding)
        item.itemMargin = convertMorP(item.itemMargin)
      })
    })
  }
  setDataXY() {
    this.card = []
    let cardRowLength = 0
    this.data.forEach(card => {
      if (card.length > cardRowLength) {
        cardRowLength = card.length
      }
    })
    let cardStartY = this.style.layoutStyle.padding[0]
    const cardWidth = (this.canvas.width - this.style.layoutStyle.padding[1] - this.style.layoutStyle.padding[3]) / cardRowLength
    this.data.forEach((cardRow, cardRowIndex) => {
      let maxHeight = 0
      const cardGraph = []
      cardRow.forEach((card, cardIndex) => {
        const cardStartX = this.style.layoutStyle.padding[3] + cardWidth * cardIndex
        const itemWidth =
          this.style.graphStyle.width +
          this.style.layoutStyle.card[cardRowIndex][cardIndex].itemMargin[1] +
          this.style.layoutStyle.card[cardRowIndex][cardIndex].itemMargin[3]
        const itemHeight =
          this.style.graphStyle.height +
          this.style.layoutStyle.card[cardRowIndex][cardIndex].itemMargin[0] +
          this.style.layoutStyle.card[cardRowIndex][cardIndex].itemMargin[2]
        let y = cardStartY
        y += this.style.layoutStyle.card[cardRowIndex][cardIndex].padding[0]
        const padWidth =
          (cardWidth -
            this.style.layoutStyle.card[cardRowIndex][cardIndex].padding[1] -
            this.style.layoutStyle.card[cardRowIndex][cardIndex].padding[3] -
            itemWidth * card[0].length) /
          (card[0].length + 1)
        card.forEach(row => {
          y += itemHeight
          row.forEach((item, index) => {
            if (item) {
              item.style = objectMerge(this.style, item.style)
              item.x = cardStartX + this.style.layoutStyle.card[cardRowIndex][cardIndex].padding[1] + (padWidth + itemWidth) * (index + 1) - itemWidth / 2
              item.y = y - itemHeight / 2
            }
          })
        })
        y += this.style.layoutStyle.card[cardRowIndex][cardIndex].padding[2]
        if (maxHeight < y - cardStartY) {
          maxHeight = y - cardStartY
        }
        cardGraph.push({
          startX: cardStartX,
          startY: cardStartY,
          padding: this.style.layoutStyle.card[cardRowIndex][cardIndex].padding,
          width: cardWidth
        })
      })
      cardGraph.forEach(item => {
        item.height = maxHeight
      })
      this.card = this.card.concat(cardGraph)
      cardStartY += maxHeight
    })

    this.dataTitle.forEach((item, index) => {
      item.style = objectMerge(this.style.titleGraphStyle, item.style)
      if (item.style.width === 'auto' || item.style.height === 'auto') {
        const widthOrHeight = getGraphWidthOrHeight(this.ctx, item.text, item.style.text, item.style.padding, item.style.width)
        item.style.width = widthOrHeight.width
        item.style.height = widthOrHeight.height
      }
      if (item.style) {
        if (item.position.left === 'left') {
          item.x = item.style.width / 2
        } else if (item.position.left === 'center') {
          item.x = this.card[index].startX + this.card[index].width / 2
        } else if (item.position.left === 'right') {
          item.x = this.card[index].startX + this.card[index].width - item.style.width / 2
        } else {
          item.x = item.position.left + item.style.width / 2
        }
      }
      if (item.position.top === 'top') {
        item.y = item.style.height / 2
      } else if (item.position.top === 'center') {
        item.y = this.card[index].startY + this.card[index].height / 2
      } else if (item.position.top === 'bottom') {
        item.y = this.card[index].startY + this.card[index].height - item.style.height / 2
      } else {
        item.y = item.position.top + item.style.height / 2
      }
    })
  }

  initGraphList() {
    this.graphList = []
    const Graph = this.style.graph
    this.data.forEach(cardRow => {
      cardRow.forEach(card => {
        card.forEach(row => {
          row.forEach(item => {
            if (item) {
              item.graphClass = new Graph({
                canvas: this.canvas,
                scaleC: this.scaleC,
                xy: {
                  x: item.x,
                  y: item.y
                },
                autoDraw: false,
                content: item.text,
                style: item.style.graphStyle,
                disabled: item.disabled,
                id: item.id
              })
              this.graphList.push(item.graphClass)
            }
          })
        })
      })
    })
    this.cardLineList = []
    this.cardLineId = 0
    const CardLine = this.style.cardLine
    const lastCardIndex = []
    this.data.forEach(cardRow => {
      if (lastCardIndex.length) {
        lastCardIndex.push(lastCardIndex[lastCardIndex.length - 1] + cardRow.length)
      } else {
        lastCardIndex.push(cardRow.length - 1)
      }
    })
    this.card.forEach((item, index) => {
      this.cardLineList.push(
        new CardLine({
          canvas: this.canvas,
          scaleC: this.scaleC,
          vertex: [
            {
              x: item.startX,
              y: item.startY
            },
            {
              x: item.startX,
              y: item.startY + item.height
            },
            {
              x: item.startX + item.width,
              y: item.startY + item.height
            }
          ],
          autoDraw: false,
          style: this.style.cardLineStyle,
          id: 'cardLine_' + ++this.cardLineId
        })
      )
      if (lastCardIndex.indexOf(index) > -1) {
        this.cardLineList.push(
          new CardLine({
            canvas: this.canvas,
            scaleC: this.scaleC,
            vertex: [
              {
                x: item.startX + item.width,
                y: item.startY + item.height
              },
              {
                x: item.startX + item.width,
                y: item.startY
              }
            ],
            autoDraw: false,
            style: this.style.cardLineStyle,
            id: 'cardLine_' + ++this.cardLineId
          })
        )
      }
      if (index < this.data[0].length) {
        this.cardLineList.push(
          new CardLine({
            canvas: this.canvas,
            scaleC: this.scaleC,
            vertex: [
              {
                x: item.startX,
                y: item.startY
              },
              {
                x: item.startX + item.width,
                y: item.startY
              }
            ],
            autoDraw: false,
            style: this.style.cardLineStyle,
            id: 'cardLine_' + ++this.cardLineId
          })
        )
      }
    })
    this.linkList = []
    this.linkId = 0
    const LinkLine = this.style.line
    this.link.forEach(item => {
      const fromGraph = this.graphList.filter(graph => {
        return graph.id === item.fromId
      })[0]
      const toGraph = this.graphList.filter(graph => {
        return graph.id === item.toId
      })[0]
      let vertex = []
      if (fromGraph.xy.x === toGraph.xy.x) {
        if (fromGraph.xy.y > toGraph.xy.y) {
          vertex = [
            {
              x: fromGraph.xy.x,
              y: fromGraph.xy.y - fromGraph.style.height / 2
            },
            {
              x: toGraph.xy.x,
              y: toGraph.xy.y + toGraph.style.height / 2
            }
          ]
        } else {
          vertex = [
            {
              x: fromGraph.xy.x,
              y: fromGraph.xy.y + fromGraph.style.height / 2
            },
            {
              x: toGraph.xy.x,
              y: toGraph.xy.y - toGraph.style.height / 2
            }
          ]
        }
      } else if (fromGraph.xy.y === toGraph.xy.y) {
        if (fromGraph.xy.x > toGraph.xy.x) {
          vertex = [
            {
              x: fromGraph.xy.x - fromGraph.style.width / 2,
              y: fromGraph.xy.y
            },
            {
              x: toGraph.xy.x + toGraph.style.width / 2,
              y: toGraph.xy.y
            }
          ]
        } else {
          vertex = [
            {
              x: fromGraph.xy.x + fromGraph.style.width / 2,
              y: fromGraph.xy.y
            },
            {
              x: toGraph.xy.x - toGraph.style.width / 2,
              y: toGraph.xy.y
            }
          ]
        }
      } else {
        let startX = fromGraph.xy.x - fromGraph.style.width / 2
        let endX = toGraph.xy.x + toGraph.style.width / 2
        if (fromGraph.xy.x < toGraph.xy.x) {
          startX = fromGraph.xy.x + fromGraph.style.width / 2
          endX = toGraph.xy.x - toGraph.style.width / 2
        }
        let startY = fromGraph.xy.y
        let endY = toGraph.xy.y
        if (fromGraph.xy.y < toGraph.xy.y) {
          startY = fromGraph.xy.y
          endY = toGraph.xy.y
        }
        vertex = [
          {
            x: startX,
            y: startY
          },
          {
            x: endX + (startX - endX) / 3,
            y: startY
          },
          {
            x: endX + (startX - endX) / 3,
            y: endY
          },
          {
            x: endX,
            y: endY
          }
        ]
      }
      this.linkList.push(
        new LinkLine({
          canvas: this.canvas,
          scaleC: this.scaleC,
          vertex,
          autoDraw: false,
          style: this.style.lineStyle,
          id: 'cardLine_' + ++this.cardLineId,
          originData: item
        })
      )
    })
    this.dataTitleList = []
    this.dataTitleId = 0
    const TitleGraph = this.style.titleGraph
    this.dataTitle.forEach(item => {
      this.dataTitleList.push(
        new TitleGraph({
          canvas: this.canvas,
          scaleC: this.scaleC,
          xy: {
            x: item.x,
            y: item.y
          },
          autoDraw: false,
          content: item.text,
          style: item.style,
          id: ++this.dataTitleId
        })
      )
    })
  }

  formatDataTranslate({ x, y }) {
    this.graphList.forEach(graph => {
      graph.formatDataTranslate({ x, y })
    })
    this.cardLineList.forEach(graph => {
      graph.formatDataTranslate({ x, y })
    })
    this.linkList.forEach(graph => {
      graph.formatDataTranslate({ x, y })
    })
    this.dataTitleList.forEach(graph => {
      graph.formatDataTranslate({ x, y })
    })
  }
  formatDataScale() {
    this.graphList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
    })
    this.cardLineList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
    })
    this.linkList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
    })
    this.dataTitleList.forEach(graph => {
      graph.formatDataScale(this.scaleC)
    })
  }

  draw() {
    this.graphList.forEach(graph => {
      graph.draw()
    })
    this.cardLineList.forEach(graph => {
      graph.draw()
    })
    this.linkList.forEach(graph => {
      graph.draw()
    })
    this.dataTitleList.forEach(graph => {
      graph.draw()
    })
  }
}
