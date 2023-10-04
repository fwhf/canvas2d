/*
 * 使用示例
 *
 * main.js引入方式(无多处应用时无需挂载至vue原型上)
 * import {Local} from './utils/public'
 * Vue.prototype.$local = Local
 *
 * Local：本地存储
 * 设置/修改set	this.$local.set('name','fwhf',1);
 * 获取get	console.log(this.$local.get('name'));
 * 移除del	this.$local.del('name');
 *
 * Rand：随机n-m的整数
 * console.log(this.$rand(3,6))
 *
 * ToDate：处理时间戳
 * 年月日		console.log(this.$ToDate.getYmd(1583160290000))
 * 时分秒		console.log(this.$ToDate.getHms(1583160290000))
 * 年月日时分秒	console.log(this.$ToDate.getYmdHms(1583160290000))
 *
 * Trim：去除空格
 * 去除两边空格trim	this.$trim.trim('name',' fwhf ');
 * 去除左边空格ltrim	this.$trim.ltrim('name',' fwhf');
 * 去除右边空格rtrim	this.$trim.rtrim('name','fwhf ');
 *
 */
// 图片预览
// function changeImg(_this,_thisNext,cb){
//	var reader = new FileReader();
//  reader.readAsDataURL(_this.files[0]);
//	reader.onload = function(e){
//		_this.nextSibling.src = e.target.result;
//		if(cb){
//			cb(_thisNext);
//		}
//	}
// }

// 本地存储
class LocalClass {
  constructor() {
    if (window.localStorage) {
      this.state = true
    } else {
      this.state = false
    }
  }
  set(key, value, day) {
    if (this.state) {
      window.localStorage[key] = JSON.stringify({
        value,
        day: Date.now() + day * 24 * 3600 * 1000
      })
    } else {
      const now = new Date()
      now.setDate(now.getDate() + day)
      document.cookie = `${key}=${value};expires=${now}`
    }
  }
  get(key) {
    if (this.state) {
      if (window.localStorage[key]) {
        const value = JSON.parse(window.localStorage[key])
        if (value.day < Date.now()) {
          this.del(key)
          return false
        } else {
          return value.value
        }
      } else {
        return false
      }
    } else {
      const str = document.cookie
      const reg = /; /
      const reg2 = new RegExp(key)
      if (reg.test(str) && reg2.test(str)) {
        return str.split(key)[1].split('=')[1].replace(/;.+/, '')
      } else if (reg2.test(str)) {
        return str.split('=')[1]
      }
      return false
    }
  }
  del(key) {
    if (this.state) {
      window.localStorage.removeItem(key)
    } else {
      this.set(key, '', -1)
    }
  }
}
const Local = new LocalClass()

// 随机n-m
class RandClass {
  Rand(n, m) {
    const c = m - n + 1
    return Math.floor(Math.random() * c + n)
  }
}
const Rand = new RandClass().Rand

// 处理时间戳
const ToDate = {
  getYmd(time) {
    const date = time === undefined ? new Date() : new Date(time)
    return date.getFullYear() + '/' + (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getDate().toString().padStart(2, '0')
  },
  getHms(time) {
    const date = time === undefined ? new Date() : new Date(time)
    return (
      date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0')
    )
  },
  getYmdHms(time) {
    const date = time === undefined ? new Date() : new Date(time)
    return (
      date.getFullYear() +
      '/' +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      '/' +
      date.getDate().toString().padStart(2, '0') +
      ' ' +
      date.getHours().toString().padStart(2, '0') +
      ':' +
      date.getMinutes().toString().padStart(2, '0') +
      ':' +
      date.getSeconds().toString().padStart(2, '0')
    )
  }
}

const Trim = {
  trim(str) {
    return str ? str.replace(/(^\s*)|(\s*$)/g, '') : ''
  },
  lTrim(str) {
    return str ? str.replace(/(^\s*)/g, '') : ''
  },
  rTrim(str) {
    return str ? str.replace(/(\s*$)/g, '') : ''
  }
}

export { Local, Rand, ToDate, Trim }
