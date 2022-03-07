let tabs = [];
let users = [];
let messages = [];
const cap = {
  msg: 'MSG',
  dc: 'DC',
  reg: 'REG',
  clr: 'CLR',
  regerr: 'REGERR',
  ref: 'REF',
}

onconnect = function(e) {
  const port = e.ports[0]

  tabs.push(port)
  
  port.onmessage = function(ev) {
    const data = ev.data;
    
    if(data[0] === cap.reg) {
      if (data[1] in users) {
        port.postMessage([cap.regerr,`User "${data[1]}" in use.`])
      } else {
        messages.push(`User "${data[1]}" has connected.`)
        users[tabs.indexOf(port)] = data[1]
      }
    } else if(data[0] === cap.msg) {
      messages.push(`#${users[tabs.indexOf(port)]}: ${data[1]}`)
    } else if(data[0] === cap.dc) {
      if (users[tabs.indexOf(port)] == undefined) {
        tabs.splice(tabs.indexOf(port),1)
        return
      }
      messages.push(`User "${users[tabs.indexOf(port)]}" has disconnected.`)
      users.splice(tabs.indexOf(port),1)
      tabs.splice(tabs.indexOf(port),1)
    } else if(data[0] === cap.clr) {
      messages.length = 0
    } else if(data[0] === cap.regerr) {
      let target = data[1]
      if (users.indexOf(target) === -1) return
      messages.push(`User "${target}" has disconnected.`)
      tabs[users.indexOf(target)].postMessage([cap.regerr,"Internal error"])
    } else if(data[0] === cap.ref) {
      tabs.forEach(instance => {
        instance.postMessage([cap.ref]);
      });
    } else {
      port.postMessage([cap.regerr,`Invalid command ${data[0]}.`])
      return
    }
    
    tabs.forEach(instance => {
      instance.postMessage([cap.msg,messages]);
    });
  }
}
