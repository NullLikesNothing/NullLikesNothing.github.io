/* TODO:
 * fix bugs
 */

let tabs = [];
let users = [];
let messages = [];
let banned = [];
let notadm = "You're not the admin."
let admin = null;
const cap = {
  msg: 'MSG',
  dc: 'DC',
  reg: 'REG',
  sreg: 'SREG',
  clr: 'CLR',
  adm: "ADM",
  unadm: "RMADM",
  regerr: 'REGERR',
  ref: 'REF',
  ban: 'BAN',
  sban: 'SBAN',
  unban: 'UNBAN',
  nop: 'NOP',
}
let banInt = setInterval(() => {
  banned.forEach(usr => {
    if (users.indexOf(usr) === -1) return
    tabs[users.indexOf(usr)].postMessage(["REGERR", "BANNED"])
    users[users.indexOf(usr)] = undefined
  })
}, 100)

onconnect = function(e) {
  const port = e.ports[0]

  tabs.push(port)

  port.onmessage = function(ev) {
    const data = ev.data;
    if (data[0] === cap.adm && (admin == null || admin == undefined)) {
      admin = port
    } else if (data[0] === cap.unadm && (admin != null || admin != undefined)) {
      if (port !== admin) return port.postMessage([cap.nop, notadm])
      admin = null
    } else if (data[0] === cap.reg || data[0] === cap.sreg) {
      if (users.indexOf(data[1]) === -1) {
        if (banned.indexOf(data[1]) !== -1) return port.postMessage([cap.regerr,"BANNED"])
        if (data[0] === cap.reg) messages.push(`User "${data[1]}" has connected.`)
        users[tabs.indexOf(port)] = data[1]
      } else {
        port.postMessage([cap.regerr, `User "${data[1]}" in use.`])
      }
    } else if (data[0] === cap.msg) {
      messages.push(`#${users[tabs.indexOf(port)]}: ${data[1]}`)
    } else if (data[0] === cap.dc) {
      if (port === admin) admin = null
      if (users[tabs.indexOf(port)] == undefined) return tabs.splice(tabs.indexOf(port), 1)
      messages.push(`User "${users[tabs.indexOf(port)]}" has disconnected.`)
      users.splice(tabs.indexOf(port), 1)
      tabs.splice(tabs.indexOf(port), 1)
    } else if (data[0] === cap.clr) {
      messages.length = 0
    } else if (data[0] === cap.regerr) {
      if (port !== admin) return port.postMessage([cap.nop, notadm])
      let target = data[1]
      if (users.indexOf(target) === -1) return
      messages.push(`User "${target}" has disconnected.`)
      tabs[users.indexOf(target)].postMessage([cap.regerr, "Internal error"])
      users[users.indexOf(target)] = null
    } else if (data[0] === cap.ref) {
      if (port !== admin) return port.postMessage([cap.nop, notadm])
      tabs.forEach(instance => {
        instance.postMessage([cap.ref]);
      });
    } else if (data[0] === cap.ban || data[0] === cap.sban ) {
      if (port !== admin) return port.postMessage([cap.nop, notadm])
      let target_ban = data[1]
      if (users.indexOf(target_ban) === -1) return port.postMessage([cap.nop, `User "${target_ban}" not found.`])
      } else if (banned.indexOf(target_ban) === -1) {
        banned.push(target_ban)
        port.postMessage([cap.nop, `User "${target_ban}" banned.`])
        if (data[0] === cap.ban) messages.push(`User "${target_ban}" has disconnected`)
      }
    } else if (data[0] === cap.unban) {
      if (port !== admin) return port.postMessage([cap.nop, notadm])
      let target_unban = data[1]
      if (banned.indexOf(target_unban) === -1) return port.postMessage([cap.nop, `User "${target_unban}" not found.`])
      banned.splice(banned.indexOf(target_unban),1)
      port.postMessage([cap.nop, `User "${target_unban}" unbanned.`])
    } else if (data[0] === cap.nop) {
      if (port !== admin) return port.postMessage([cap.nop, notadm])
      try {
        port.postMessage([cap.nop,eval(data[1])])
      } catch (e) {
        port.postMessage([cap.nop, e])
      }
    } else {
      port.postMessage([cap.nop, `Invalid command ${data[0]}.`])
      return
    }

    tabs.forEach(instance => {
      instance.postMessage([cap.msg, messages]);
    });
  }
}
