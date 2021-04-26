/*
* Gulp Builder (Config)
* @version: 1.0.0 (Fri, 31 July 2020)
* @author: HtmlStream
* @license: Htmlstream (https://htmlstream.com/licenses)
* Copyright 2020 Htmlstream
*/


// You may find more detailed documentation at documentation/gulp.html

module.exports = {

  //
  // Start path when launching a Gulp
  //

  startPath: "/index.html",


  //
  // Variables that can be used in HTML pages and SVG files
  //

  vars: {
    googleFont: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap",
    version: "?v=1.0",
    style: {
      color: '#377dff', // Primary Color
      font: 'Open Sans' // Primary Font
    }
  },


  //
  // Layout builder to customize look and feel of siderbar and navbar
  //

  layoutBuilder: {
    skin: 'default', // default, dark, light
    header: {
      layoutMode: 'default', // default, single, double
      containerMode: 'container' // container, container-fluid
    },
    sidebarLayout: 'default', // default, compact, mini
  },


  //
  // Skip CSS & JavaScript files from bundle files (e.g. vendor.min.css)
  //

  skipFilesFromBundle: {
    dist: [
      "assets/js/hs.chartjs-matrix.js"
    ],

    build: [
      "assets/css/docs.css",
      "assets/vendor/icon-set/style.css",
      "assets/js/hs.chartjs-matrix.js",
      "assets/vendor/hs-navbar-vertical-aside/hs-navbar-vertical-aside-mini-cache.js",
      "assets/vendor/chart.js.extensions/chartjs-extensions.js",
      "assets/vendor/babel-polyfill/polyfill.min.js",
      "node_modules/chart.js/dist/Chart.min.js",
      "node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js",
      "node_modules/chartjs-chart-matrix/dist/chartjs-chart-matrix.min.js"
    ]
  },


  //
  // Copy/Paste files and folders into different path
  //

  copyDependencies: {
    dist: {
      "*assets/js/theme-custom.js": ""
    },

    build: {
      "*assets/js/theme-custom.js": ""
    }
  },


  //
  // An option to set custom folder name for build process
  //

  buildFolder: "", // e.g. my-project


  //
  // Replace an asset paths in HTML to CDN
  //

  replacePathsToCDN: {},


  //
  // Change directory folder names
  //

  directoryNames: {
    src: "./src",
    dist: "./dist",
    build: "./build"
  },


  //
  // Change bundle file names
  //

  fileNames: {
    dist: {
      js: "theme.min.js",
      css: "theme.min.css"
    },

    build: {
      css: "theme.min.css",
      js: "theme.min.js",
      vendorCSS: "vendor.min.css",
      vendorJS: "vendor.min.js",
    }
  },


  //
  // Files types that will be copied to the ./build/* folder
  //

  fileTypes: "jpg|png|svg|mp4|webm|ogv|json",

}
