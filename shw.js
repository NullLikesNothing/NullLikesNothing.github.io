/* TODO:
 * fix bugs
 */

let tabs = [];
let users = [];
let messages = [];
let banned = [];
let notadm = "You're not an admin."
let admin = [];
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
  rnk: 'RNK',
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
    if (data[0] === cap.adm) {
      let usr = data[1]
      let add = true
      if (data[1] == null || data[1] == undefined) add = false
      if (admin.length === 0) admin.push(port)
      if (users.indexOf(usr) === -1 && (data[1] != null || data[1] != undefined)) return port.postMessage([cap.nop, "User not found."])
      let user = tabs[users.indexOf(usr)]
      if (admin.indexOf(port) === -1) return port.postMessage([cap.nop, notadm])
      if (!add) return
      if (admin.indexOf(user) !== -1) return port.postMessage([cap.nop, "User is already admin!"])
      admin.push(user)
      user.postMessage([cap.rnk,true])
      users[users.indexOf(usr)] = "[A] " + users[users.indexOf(usr)]
    } else if (data[0] === cap.unadm) {
      if (admin.indexOf(port) === -1) return port.postMessage([cap.nop, notadm])
      let usr = data[1]
      if (admin.length === 0) return port.postMessage([cap.nop,"No admins!"])
      if (users.indexOf(usr) === -1) return port.postMessage([cap.nop, "User not found."])
      let user = tabs[users.indexOf(usr)]
      if (admin.indexOf(user) === -1) return port.postMessage([cap.nop, "User is not admin!"])
      admin.splice(admin.indexOf(user),1)
      user.postMessage([cap.rnk,false])
      users[users.indexOf(usr)] = users[users.indexOf(usr)].replace(["[A] ",""])
    } else if (data[0] === cap.reg || data[0] === cap.sreg) {
      if (data[1].trim() === "") return port.postMessage([cap.regerr, "Name cannot be blank or whitespace!"])
      data[1] = data[1].replaceAll("[A] ", "")
      if (users.indexOf(data[1]) === -1) {
        if (banned.indexOf(data[1]) !== -1) return port.postMessage([cap.regerr,"BANNED"])
        if (admin.indexOf(port) !== -1) {
          data[1] = "[A] " + data[1]
          port.postMessage([cap.rnk, true])
        }
        if (data[0] === cap.reg) messages.push(`User "${data[1]}" has connected.`)
        users[tabs.indexOf(port)] = data[1]
      } else {
        port.postMessage([cap.regerr, `User "${data[1]}" in use.`])
      }
    } else if (data[0] === cap.msg) {
      messages.push(`#${users[tabs.indexOf(port)]}: ${data[1]}`)
    } else if (data[0] === cap.dc) {
      if (admin.indexOf(port) !== -1) {
        admin.splice(admin.indexOf(port),1)
      }
      if (users[tabs.indexOf(port)] == undefined) return tabs.splice(tabs.indexOf(port), 1)
      messages.push(`User "${users[tabs.indexOf(port)]}" has disconnected.`)
      users.splice(tabs.indexOf(port), 1)
      tabs.splice(tabs.indexOf(port), 1)
    } else if (data[0] === cap.clr) {
      messages.length = 0
    } else if (data[0] === cap.regerr) {
      if (admin.indexOf(port) === -1) return port.postMessage([cap.nop, notadm])
      let target = data[1]
      if (users.indexOf(target) === -1) return
      messages.push(`User "${target}" has disconnected.`)
      tabs[users.indexOf(target)].postMessage([cap.regerr, "Internal error"])
      users[users.indexOf(target)] = null
    } else if (data[0] === cap.ref) {
      if (admin.indexOf(port) === -1) return port.postMessage([cap.nop, notadm])
      tabs.forEach(instance => {
        instance.postMessage([cap.ref]);
      });
    } else if (data[0] === cap.ban || data[0] === cap.sban ) {
      if (admin.indexOf(port) === -1) return port.postMessage([cap.nop, notadm])
      let target_ban = data[1]
      if (users.indexOf(target_ban) === -1) return port.postMessage([cap.nop, `User "${target_ban}" not found.`])
      if (banned.indexOf(target_ban) !== -1) return
      banned.push(target_ban)
      port.postMessage([cap.nop, `User "${target_ban}" banned.`])
      if (data[0] === cap.ban) messages.push(`User "${target_ban}" has disconnected`)
    } else if (data[0] === cap.unban) {
      if (admin.indexOf(port) === -1) return port.postMessage([cap.nop, notadm])
      let target_unban = data[1]
      if (banned.indexOf(target_unban) === -1) return port.postMessage([cap.nop, `User "${target_unban}" not found.`])
      banned.splice(banned.indexOf(target_unban),1)
      port.postMessage([cap.nop, `User "${target_unban}" unbanned.`])
    } else if (data[0] === cap.nop) {
      if (admin.indexOf(port) === -1) return port.postMessage([cap.nop, notadm])
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
