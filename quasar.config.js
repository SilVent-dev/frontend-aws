/* eslint-env node */
const { configure } = require('quasar/wrappers')

module.exports = configure(function (ctx) {
  return {
    eslint: { warnings: true, errors: true },

    boot: ['axios'],

    css: ['app.scss'],

    extras: ['mdi-v7', 'roboto-font'],

    build: {
      target: { browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'] },
      vueRouterMode: 'hash',
      vitePlugins: [],
      env: {
        APP_ENV: 'development',
        API_URL: '/api'
      }
    },

    devServer: {
      open: true,
      port: 9000,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },

    framework: {
      iconSet: 'mdi-v7',
      config: {
        dark: 'auto',
        notify: { position: 'top-right', timeout: 3000, progress: true },
        loading: { message: 'Carregando...' },
        brand: {
          primary: '#1565C0',
          secondary: '#26A69A',
          accent: '#9C27B0',
          positive: '#21BA45',
          negative: '#C10015',
          warning: '#F2C037',
          info: '#31CCEC'
        }
      },
      lang: 'pt-BR',
      plugins: ['Notify', 'Loading', 'Dialog', 'LocalStorage', 'Cookies']
    },

    animations: 'all',

    ssr: { pwa: false, prodPort: 3000, middlewares: ['render'] },

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false
    },

    capacitor: { hideSplashscreen: true },

    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 5858,
      bundler: 'packager',
      packager: {},
      builder: {
        appId: 'aws-manager'
      }
    },

    bex: { contentScripts: ['my-content-script'] }
  }
})
