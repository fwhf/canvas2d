export default [
  {
    cnName: '三角分布图',
    children: [
      {
        path: '/',
        name: 'triangleDistribution',
        cnName: 'triangleDistribution',
        component: () => import('../components/chart/template/triangleDistribution')
      }
    ]
  },
  {
    cnName: '部门层级图',
    children: [
      {
        path: '/departmentCrossLevel',
        name: 'departmentCrossLevel',
        cnName: 'departmentCrossLevel',
        component: () => import('../components/chart/template/departmentLevel')
      },
      {
        path: '/departmentCrossLevelMore',
        name: 'departmentCrossLevelMore',
        cnName: 'departmentCrossLevelMore',
        component: () => import('../components/chart/template/departmentLevel/relation')
      },
      {
        path: '/departmentCrossLevelText',
        name: 'departmentCrossLevelText',
        cnName: 'departmentCrossLevelText',
        component: () => import('../components/chart/template/departmentLevel/text')
      }
    ]
  },
  {
    cnName: '节点关系图',
    children: [
      {
        path: '/nodeRelation',
        name: 'nodeRelation',
        cnName: 'nodeRelation',
        component: () => import('../components/chart/template/nodeRelation')
      },
      {
        path: '/nodeRelationNew',
        name: 'nodeRelationNew',
        cnName: 'nodeRelationNew',
        component: () => import('../components/chart/template/nodeRelation/indexNew')
      },
      {
        path: '/nodeRelationCustom',
        name: 'nodeRelationCustom',
        cnName: 'nodeRelationCustom',
        component: () => import('../components/chart/template/nodeRelation/custom')
      },
      {
        path: '/nodeRelationTree',
        name: 'nodeRelationTree',
        cnName: 'nodeRelationTree',
        component: () => import('../components/chart/template/nodeRelation/tree')
      }
    ]
  },
  {
    cnName: '画板-流程图',
    children: [
      {
        path: '/drawingBoardFlow',
        name: 'drawingBoardFlow',
        cnName: 'drawingBoardFlow',
        component: () => import('../components/chart/template/drawingBoardFlow/flow')
      },
      {
        path: '/drawingBoardFlow2',
        name: 'drawingBoardFlow2',
        cnName: 'drawingBoardFlow2',
        component: () => import('../components/chart/template/drawingBoardFlow/flow2')
      }
    ]
  },
  {
    cnName: '网格节点链路图',
    children: [
      {
        path: '/gridNodeLink',
        name: 'gridNodeLink',
        cnName: 'gridNodeLink',
        component: () => import('../components/chart/template/gridNodeLink')
      }
    ]
  },
  {
    cnName: '画板',
    children: [
      {
        path: '/drawingBoard',
        name: 'drawingBoard',
        cnName: 'drawingBoard',
        component: () => import('../components/chart/template/drawingBoard')
      }
    ]
  }
]
