let tabs = [];
let users = [];
let messages = [];
let cap = {
  msg: 'MSG',
  dc: 'DC',
  reg: 'REG',
  clr: 'CLR',
  regerr: 'REGERR',
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
        users.push(data[1])
      }
    } else if(data[0] === cap.msg) {
      if (data[1].startsWith('@!')) {
        let cmd = data[1].replace('@!','')
        let args = cmd.split(' ')
        args = args.splice(1,args.length-1)
        messages.push(`#${user[tabs.indexOf(port)]}`)
        return
      }
      messages.push(`#${users[tabs.indexOf(port)]}: ${data[1]}`)
    } else if(data[0] === cap.dc) {
      messages.push(`User ${users[tabs.indexOf(port)]} has disconnected.`)
      users.splice(tabs.indexOf(port),1)
      tabs.splice(tabs.indexOf(port),1)
    } else if(data[0] === cap.clr) {
      messages.length = 0
    } else {
      port.postMessage([cap.regerr,`Invalid command ${data[0]}.`])
      return
    }
    
    tabs.forEach(instance => {
      instance.postMessage([cap.msg,messages]);
    });
  }
}
