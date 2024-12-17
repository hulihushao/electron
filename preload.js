const { ipcRenderer } = require("electron")


window.addEventListener('DOMContentLoaded',()=>{
  console.log(11111111111)
  ipcRenderer.send('DomLoaded','loaded')
})