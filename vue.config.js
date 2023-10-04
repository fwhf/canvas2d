const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  devServer: {
    host: '127.0.0.1',
    port: 8080,
    // client: {
    //   webSocketURL: 'ws://127.0.0.1:8081/ws',
    // },
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  transpileDependencies: true
})
