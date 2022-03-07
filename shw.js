let tabs = [];
let messages = [];
let cap = {
  msg: 'MSG',
  dc: 'DC',
  reg: 'REG',
  msgs: 'MSGS',
  regerr: 'REGERR',
}

function removeVal(arr,val) {
  if (arr.indexOf(val) === -1) return arr
  return arr.splice(arr.indexOf(val), 1)
}

onconnect = function(e) {
  const port = e.ports[0]

  tabs.push(port)
  
  port.onmessage = function(ev) {
    const data = ev.data;
    
    messages.push(data)
    
    tabs.forEach(instance => {
      instance.postMessage([cap.msgs,messages]);
    });
  }
}
