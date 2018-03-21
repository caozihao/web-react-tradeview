
export default {
  "entry": "src/index.js",
  "hash": true,
  "sass": true,
  "disableCSSModules": true,
  "theme": {
    "@primary-color": "#00add2",
  },
  "env": {
    "development": {
      "extraBabelPlugins": [
        "transform-runtime",
        [
          "import",
          {
            "libraryName": "antd",
            "style": true,
          }
        ]
      ]
    },
    "production": {
      "extraBabelPlugins": [
        "transform-runtime",
        [
          "import",
          {
            "libraryName": "antd",
            "style": true,
          }
        ]
      ]
    }
  }
}
