<template>
  <div class="chart-nav">
    <div class="title"><img src="@/assets/logo.svg" alt="" /><span>chart-dev</span></div>
    <el-scrollbar height="100%" wrap-class="scrollbar-light">
      <el-menu
        active-text-color="#ffd04b"
        background-color="transparent"
        class="chart-menu"
        :default-active="active"
        :default-openeds="openeds"
        text-color="#fff"
      >
        <el-sub-menu v-for="(item, index) in menuArr" :index="index + ''" :key="index">
          <template #title>
            <!-- <el-icon><location /></el-icon> -->
            <span>{{ item.cnName }}</span>
          </template>
          <el-menu-item
            v-for="(childItem, childIndex) in item.children"
            :index="index + '-' + childIndex"
            :key="index + '-' + childIndex"
            @click="toPage(childItem.path)"
            >{{ childItem.cnName }}</el-menu-item
          >
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { getCurrentInstance, reactive } from 'vue'
import { menuRouters, helper } from '../util'
export default {
  cnName: 'ChartNav',
  setup() {
    const instance = getCurrentInstance()
    const _this = instance.appContext.config.globalProperties

    // 菜单组装
    let menuArr = []
    const convertMenu = menuRouters => {
      menuRouters.forEach(route => {
        if (route.component) {
          delete route.component
        }
        if (route.children) {
          convertMenu(route.children)
        }
      })
    }
    convertMenu(menuRouters)
    menuArr = [].concat(menuRouters)
    for (let i = 0; i < 10; i++) {
      menuArr.push({
        cnName: '测试',
        children: [
          {
            cnName: '测试',
            path: ''
          }
        ]
      })
    }
    menuArr.push({
      cnName: '到底了',
      children: [
        {
          cnName: '正多边形',
          path: ''
        }
      ]
    })

    // 默认展开菜单查找
    const getDefaultMenu = (menus, localPath) => {
      for (let i = 0; i < menus.length; i++) {
        if (menus[i].path === localPath) {
          return i
        }
        if (menus[i].children) {
          const active = getDefaultMenu(menus[i].children, localPath)
          if (active !== false) {
            return i + '-' + active
          }
        }
      }
      return false
    }
    const defaultMenu = reactive({
      active: '0-0',
      openeds: ['0']
    })
    const localPath = helper.Local.get('menuPath')
    if (localPath) {
      const defaultActive = getDefaultMenu(menuArr, localPath)
      if (defaultActive !== false) {
        defaultMenu.active = defaultActive
        defaultMenu.openeds = [defaultActive.split('-')[0]]
      }
    }

    // 跳转
    const toPage = path => {
      helper.Local.set('menuPath', path, 9999)
      _this.$router.push({
        path
      })
    }

    return {
      menuArr,
      ...defaultMenu,
      toPage
    }
  }
}
</script>

<style scoped lang="scss">
@import '../style/common.scss';
.chart-nav {
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  background: #545c64;
  display: flex;
  flex-direction: column;
  .title {
    width: 100%;
    height: 66px;
    border-bottom: 1px solid #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 22px;
      margin-right: 10px;
    }
    span {
      color: #fff;
      font-size: 22px;
      font-weight: bold;
    }
  }
  .chart-menu {
    width: 100%;
    flex: 1;
    .el-sub-menu:hover {
      background-color: var(--el-menu-hover-bg-color);
    }
  }
}
</style>
