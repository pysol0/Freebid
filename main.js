const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const tdl = require('tdl')
const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios'); 
const { getTdjson } = require('prebuilt-tdlib')
const build = false
const jsonData = require(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json")
function get_url_from_message(message) {
    try {
        return message.content.text.entities.filter((entity)=>entity.type._ == "textEntityTypeTextUrl")[0].type.url
    } catch (error) {
        if (message.content.link_preview) {
            return message.content.link_preview.url
        }else{
            return false
        }
    }
}

async function get_bids_list(number_of_messages, channels) {
    const temp_links = new Map()
    try {
        for (const channel of channels) {

            try {

                var message_id = 0

                for (let index = 0; index < number_of_messages; index++) {

                    const messages = await client.invoke({
                        _: "getChatHistory",
                        chat_id: channel,
                        from_message_id: message_id,
                        offset: 0,
                        limit: 1,
                        only_local: false
                    })
                    
                    const message = messages.messages[0]
                    message_id = message.id
                    let promocode = null
                    const text = get_url_from_message(message)
                    if (text) {
                        const url = new URL(text) 
                        promocode = url.searchParams.get("promocode")
                    }
                    if (promocode && ![...temp_links.values()].includes(promocode)) {

                        if (temp_links.has(messages.messages[0].date)) {
                            temp_links.set(messages.messages[0].date + 0.1 ,promocode)   
                            continue  
                        }else{
                            temp_links.set(messages.messages[0].date , promocode)
                        }

                    }

                }
                
            } catch (error) {
                return error
            }
        }

        const links = new Map()
        const length = temp_links.size

        for (let index = 0; index < length; index++) {
            const older_message = Math.min(...temp_links.keys());
            links.set(older_message, temp_links.get(older_message))
            temp_links.delete(older_message)
        }

        return links

    } catch (error) {
        return error
    }
}

tdl.configure({ tdjson: getTdjson() })

var client

const createWindow = (route) => {
    const win = new BrowserWindow({
      width: 1056,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'scripts/preload.js')
      }
    })
    //win.webContents.openDevTools();
    win.setTitle("Freebid")
    win.loadFile('pages/' + route)
    return win
}

app.whenReady().then(async () => {

    ipcMain.handle('check_logins', async()=>{
        const jsonData = require(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json")
        const no_logged_users = []
        
        await Promise.all(jsonData.bidoo_accounts.map(async user=>{
            const domainUrl = user.domain === "es" ? "https://es.bidoo.com" : "https://it.bidoo.com";
            const request = await axios.request({method:"GET",
                cache:false,
                headers:{
                    "Cache-Control":"no-store, no-cache, must-revalidate, max-age=0",
                    "Pragma":"no-cache",
                    "Cookie": "dess=" + user.dess + ";" 
                },
                url:`${domainUrl}/ajax/get_logged_user.php`,
            })
            !request.data.is_valid && no_logged_users.push(user.username)
        }))

        if (no_logged_users.length == 0) {
            return null
        } else {
            jsonData.bidoo_accounts = jsonData.bidoo_accounts.filter(user=>!no_logged_users.includes(user.username))
            fs.writeFileSync(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json", JSON.stringify(jsonData, null, 2));
            return no_logged_users
        }

    })

    ipcMain.handle('getUserInfo', async() => {
        const jsonData = require(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json")

        const telegram_user = 
            await client.invoke({
                _: 'getMe',
            })
        
        const chats = await client.invoke({
            _: 'getChats',
            limit: 10000
        })

        var total_count=0

        for (let date in jsonData.daily_bids_updates) {
            total_count+=jsonData.daily_bids_updates[date]
        }

        const last_date = new Date(Object.keys(jsonData.daily_bids_updates)[Object.keys(jsonData.daily_bids_updates).length - 1]).getTime()
        var iter_day = new Date(Object.keys(jsonData.daily_bids_updates)[0]).getTime()
        const to_chart = []

        while (iter_day <= last_date) {
            !jsonData.daily_bids_updates[new Date(iter_day).toLocaleDateString()] ? to_chart.push([iter_day, 0]) : to_chart.push([iter_day,jsonData.daily_bids_updates[new Date(iter_day).toLocaleDateString()]])
            iter_day += 86400000
        }

        const user = {
            name: telegram_user.first_name,
            username: telegram_user.usernames.editable_username,
            bidoo_accounts: jsonData.bidoo_accounts,
            stats: {
                total_redeemed:total_count,
                to_chart:to_chart
            },
            telegram:{
                channels_groups:chats.chat_ids.filter(id => id.toString().slice(0,4)==-100),
                selected_chats:jsonData.settings.bids.telegram_channels,
                messages_count:jsonData.settings.bids.messages,
            }
        }
        return user
        
    })

    ipcMain.handle('remove_bidoo_account', async(e, username) => {
        const jsonData = require(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json")
        jsonData.bidoo_accounts = jsonData.bidoo_accounts.filter((user)=>user.username != username)
        fs.writeFileSync(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json", JSON.stringify(jsonData, null, 2));
        return jsonData.bidoo_accounts
    })

    ipcMain.handle('update_bidoo_account', async(e, username, new_username) => {
        const jsonData = require(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json")
        for (const user of jsonData.bidoo_accounts) {
            if (user.username == new_username) {
                return "already_in_use"
            }
        }
        for (const user of jsonData.bidoo_accounts) {
            if (user.username == username) {
                user.username = new_username
                break
            }
        }
        fs.writeFileSync(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json", JSON.stringify(jsonData, null, 2));
        return jsonData.bidoo_accounts
    })

    ipcMain.handle('add_bidoo_account', async() => {
        
        const browser = await puppeteer.launch({headless: false, executablePath: build ?  process.resourcesPath +  "/app/chrome/win64-132.0.6834.110/chrome-win64/chrome.exe" : "./chrome/win64-132.0.6834.110/chrome-win64/chrome.exe"});
        const page = await browser.newPage();
        await page.goto('https://it.bidoo.com/login_push.php');

        const dess = await (async() => {
            while (true) {
                var cookies = await browser.cookies()
                for (const cookie of cookies) {
                    if (cookie.name == "dess") {
                        return cookie.value
                    }
                    
                }
            }
        })()
        
        await page.waitForNavigation()
        const {username,bids} = await page.evaluate(() => {
            const username = document.getElementById("NickLoggato").value
            const bids = document.getElementById("divSaldoBidMobileRight").innerText
            return {username,bids}
        });
        const currentDomain = page.url().includes("es.bidoo.com") ? "es" : "it";
        browser.close()
        const jsonData = require(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json")
        for (const user of jsonData.bidoo_accounts) {
            if (user.username == username) {
                return "already_added"
            }
        }
        jsonData.bidoo_accounts.push({
            "username":username,
            "bids_count":bids,
            "dess":dess,
            "domain": currentDomain,
            "bids_history":{}
        })

        fs.writeFileSync(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json", JSON.stringify(jsonData, null, 2));
        return jsonData.bidoo_accounts
    })

    ipcMain.handle('redeem_bids', async(e, specific_promocodes, specific_messages) => {

        var jsonData = require(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json")
        const number_of_messages = specific_messages ? specific_messages : jsonData.settings.bids.messages
        const channels = jsonData.settings.bids.telegram_channels

        const promocodes = specific_promocodes ? specific_promocodes : await get_bids_list(number_of_messages,channels)
        if (jsonData.last_redeemed_bid) {
            promocodes.forEach((value,key) => {
                if (key <= jsonData.last_redeemed_bid) {
                    promocodes.delete(key)
                }
            })
        }

        if (promocodes.size==0) {
            return jsonData.bidoo_accounts
        }

        var requests_list = []
        const user_index = new Map()
        for (let index = 0; index < jsonData.bidoo_accounts.length; index++) {
            user_index.set(jsonData["bidoo_accounts"][index]["username"],index)
        }
        var i = 0
        const initial_funds = new Map()
        const bids_updates = new Map()

        await Promise.all(jsonData.bidoo_accounts.map(async user=>{
            const domainUrl = user.domain === "es" ? "https://es.bidoo.com" : "https://it.bidoo.com";
            const request = await axios.request({method:"GET",
                cache:false,
                headers:{
                    "Cache-Control":"no-store, no-cache, must-revalidate, max-age=0",
                    "Pragma":"no-cache",
                    "Cookie": "dess=" + user.dess + ";" 
                },
                url:`${domainUrl}/get_user_details.php`,
            })
            initial_funds.set(user_index.get(user.username), request.data.user.funds)
        }))

        for (var user of jsonData.bidoo_accounts) {
            const domainUrl = user.domain === "es" ? "https://es.bidoo.com" : "https://it.bidoo.com";
            promocodes.forEach((value,key) => {
                const request = axios.request({method:"GET",
                    cache:false,
                    headers:{
                        "Cache-Control":"no-store, no-cache, must-revalidate, max-age=0",
                        "Pragma":"no-cache",
                        "Cookie": "dess=" + user.dess + ";" + "user=" + i
                    },
                    url:`${domainUrl}/push_promotions.php?code=` + value,
                }).then(response => {
                    try {
                        if (response.data.split("-")[0] == "ok") {
                            if (bids_updates.has(response.config.headers.Cookie.split(";")[1].split("=")[1])) {
                                if (parseInt(response.data.split("-")[1])>bids_updates.get(response.config.headers.Cookie.split(";")[1].split("=")[1])) {
                                    bids_updates.set(response.config.headers.Cookie.split(";")[1].split("=")[1], parseInt(response.data.split("-")[1]))
                                }
                            }else{
                                bids_updates.set(response.config.headers.Cookie.split(";")[1].split("=")[1], parseInt(response.data.split("-")[1]))
                            }
                            return
                        } 
                    } catch (error) {
                        return error
                    }
                }).catch(error => {
                    console.error('Errore GET:', error);
                })
                requests_list.push(request)
            });
            i++
        }
        
        await Promise.all(requests_list).then(response => {
            bids_updates.forEach((value,key)=>{
                jsonData.bidoo_accounts[parseInt(key)].bids_count=value
            })
            if (!specific_promocodes) {
                jsonData.last_redeemed_bid = [...promocodes.keys()][promocodes.size-1]
            }
            const now = Math.trunc(Date.now()/1000)
            var total_redeemed_bids = 0
            const data_locale = (new Date()).toLocaleDateString()
            var i = 0
            for (const user of jsonData.bidoo_accounts) {
                if (initial_funds.get(i)) {
                    total_redeemed_bids += user.bids_count - initial_funds.get(i)
                    if (bids_updates.size != 0) {
                        user.bids_history[now]=user.bids_count - initial_funds.get(i)
                    }
                }
                i++
            }
            
            if (jsonData.daily_bids_updates[data_locale]) {
                jsonData.daily_bids_updates[data_locale] += total_redeemed_bids
            } else {
                jsonData.daily_bids_updates[data_locale] = total_redeemed_bids
            }
            
            fs.writeFileSync(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json", JSON.stringify(jsonData, null, 2))
            
        })
        
        .catch(error => {
            console.error('Errore GET:', error);
        })   
        .catch(error => {
            console.error('Errore GET:', error);
        })   
        return jsonData.bidoo_accounts
    })

    ipcMain.handle('get_settings',()=>win.loadFile("pages/settings.html"))

    ipcMain.handle('get_dashboard',()=>win.loadFile("pages/dashboard.html"))

    ipcMain.handle('get_basic_telegram_info',async(e, ids_list)=>{
        const groupsDetails = await Promise.all(ids_list.map(id => client.invoke({
            _: 'getChat',
            chat_id: id
        })))
        const groupsWithPhotos = await Promise.all(groupsDetails.map(async (group) => {
            if (group.photo && group.photo.small && group.photo.small.local.path!="") {
                return {
                    chat_id: group.id,
                    chat_title: group.title,
                    photo_url: group.photo.small.local.path
                }
            }
            if (group.photo && group.photo.small) {
              const file = await client.invoke({
                _: 'downloadFile',
                file_id: group.photo.small.id,
                priority:1,
                synchronous:true
              })
              return {
                chat_id: group.id,
                chat_title: group.title,
                photo_url: file.local.path
              }
            } else {
              return {
                chat_id: group.id,
                chat_title: group.title,
                photo_url: null
              }
            }
        }))
          
        return groupsWithPhotos
    })

    ipcMain.handle('logout',async()=>{
        if (client) {
            await client.invoke({
                _: 'logOut',
            })
        }
        function wait_for_complete_logout (update) {
            if (update._ === "updateAuthorizationState" && update.authorization_state?._ === "authorizationStateClosed"){
                client.off('update', wait_for_complete_logout) 
                app.quit()
            }
        }
        client.on('update', wait_for_complete_logout)
    })

    ipcMain.handle('set_apis',(e, api_id, api_hash)=>{
        const jsonData = require(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json")
        jsonData.apiId = parseInt(api_id)
        jsonData.apiHash = api_hash
        fs.writeFileSync(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json", JSON.stringify(jsonData, null, 2));
        app.quit()
    })

    ipcMain.handle('handle_channel',(e,id,action)=>{
        const jsonData = require(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json")
        if (action == "add") {
            jsonData.settings.bids.telegram_channels.push(parseInt(id))
        }else{
            jsonData.settings.bids.telegram_channels = jsonData.settings.bids.telegram_channels.filter(channel => channel != parseInt(id))
        }
        fs.writeFileSync(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json", JSON.stringify(jsonData, null, 2));
    })

    ipcMain.handle('handle_messages_count',(e,new_count)=>{
        const jsonData = require(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json")
        jsonData.settings.bids.messages = new_count  
        fs.writeFileSync(build ? process.resourcesPath + "/app/data/user.json" : "./data/user.json", JSON.stringify(jsonData, null, 2));
    })


    var win = null

    try {
        
        client = tdl.createClient({
            apiId: jsonData.apiId, 
            apiHash: jsonData.apiHash
        })
           
        try {
            await client.invoke({
                _: 'getMe',
            })
            
            if (BrowserWindow.getAllWindows().length === 0) {
                win = createWindow("dashboard.html")
            }
        } catch (error) {
            if (BrowserWindow.getAllWindows().length === 0){
                win = createWindow("index.html")
            }
        }
    } catch (error) {
       if (BrowserWindow.getAllWindows().length === 0) {
           win = createWindow("setapis.html")
        }
    }

    if (client) {
        var auth_link=null
        auth_state = await client.invoke({
            _: 'getAuthorizationState'
        })
    
        if (auth_state._ === "authorizationStateWaitPhoneNumber") {
            client.invoke({
                _: 'requestQrCodeAuthentication'
            })
            function get_first_qr_link (update) {
                if (update._ === "updateAuthorizationState" && update.authorization_state?.link){
                    auth_link = update.authorization_state.link
                    client.off('update', get_first_qr_link) 
                }
            }
            client.on('update', get_first_qr_link)
        }
        
        ipcMain.on('send_message', async (e, data) => {
            if (data.environment === 'telegram') {
                switch (data.msg) {
                    case "need_qr":

                        auth_link && win.webContents.send('message', {environment:'telegram',msg:auth_link})

                        client.on('update', (update)=>{

                            if (update._ === 'updateAuthorizationState' && update.authorization_state.link) {
                                auth_link = update.authorization_state.link
                                win.webContents.send('message', {environment:'telegram',msg:update.authorization_state.link})
                            }

                            if (update._ === 'updateAuthorizationState' && update.authorization_state._ === "authorizationStateReady") {
                                client.off("update")
                                win.loadFile("pages/dashboard.html")
                            }

                            if (update._ === 'updateAuthorizationState' && update.authorization_state._ === "authorizationStateWaitPassword") {
                                win.webContents.send('message', {environment:'telegram',msg:'need_psw'})
                                client.off("update")
                            }

                        })
                        
                        break;
                    case "send_psw":

                        try {
                            await client.invoke({
                                _: 'checkAuthenticationPassword',
                                password:data.value
                            })
                            win.loadFile("pages/dashboard.html")
                        } catch (e) {
                            win.webContents.send('message', {environment:'telegram',msg:'invalid_psw'})
                        }
                        break 

                    default:
                        break;
                }
            }
        })
    }
    
    app.on('window-all-closed', async () => {
        if (client) {
            await client.close()
        }
        app.quit()
    })
    
})
  
  