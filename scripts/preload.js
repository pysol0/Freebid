const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('loadashboard', {
  getMe: async() => {return await ipcRenderer.invoke('getUserInfo')},
  check_logins: async() => {return await ipcRenderer.invoke('check_logins')}
})

contextBridge.exposeInMainWorld('bidoo', {
  add_account: async() => {return await ipcRenderer.invoke('add_bidoo_account')},
  remove_account: async(username) => {return await ipcRenderer.invoke('remove_bidoo_account',username)},
  update_account: async(username,new_username) => {return await ipcRenderer.invoke('update_bidoo_account',username,new_username)},
  redeem_bids: async(specific_promocodes, specific_messages) => {return await ipcRenderer.invoke('redeem_bids',specific_promocodes, specific_messages)},
})

contextBridge.exposeInMainWorld('route', {
  getSettings: async() => {return ipcRenderer.invoke('get_settings')},
  getDashboard: async() => {return ipcRenderer.invoke('get_dashboard')},
  logout: async() => {return await ipcRenderer.invoke('logout')}
})

contextBridge.exposeInMainWorld('telegram', {
  getGroups: async(ids_list) => {return await ipcRenderer.invoke('get_basic_telegram_info',ids_list)},
  handleChannel: (id,action) => {return ipcRenderer.invoke('handle_channel',id,action)},
  handleMessagesCount: (new_count) => {return ipcRenderer.invoke('handle_messages_count', new_count)},
  setApis: (api_id, api_hash) => {return ipcRenderer.invoke('set_apis', api_id, api_hash)},
  sendMessage: (data) => ipcRenderer.send('send_message', data),
  onMessage: (callback) => ipcRenderer.on('message', (_event, data) => callback(data))
})