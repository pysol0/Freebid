function reload_account_list(accounts_list) {
    document.getElementsByClassName("bidoo_accounts_list")[0].innerHTML=""
    let i = 0
    for (const account of accounts_list) {
        i++
        const container = document.createElement("div")
        const sub_container = document.createElement("div")
        const accounts_count = document.createElement("p")
        const username = document.createElement("p")
        const bids_count = document.createElement("p")
        accounts_count.appendChild(document.createTextNode(i+")"))
        username.appendChild(document.createTextNode(account.username))
        username.addEventListener("click",()=>{inspect_bidoo_account(account)})
        bids_count.appendChild(document.createTextNode(account.bids_count))
        sub_container.appendChild(accounts_count)
        sub_container.appendChild(username)
        container.appendChild(sub_container)
        container.appendChild(bids_count)
        container.classList.add("bidoo_account_widget")
        username.classList.add("medium_text")
        username.classList.add("underline_hover")
        username.onmouseover=()=>{username.style="cursor:pointer"}
        accounts_count.classList.add("small_text")
        bids_count.classList.add("bids_count")
        sub_container.style="display:flex; gap: 3px"
        document.getElementsByClassName("bidoo_accounts_list")[0].appendChild(container)
    }
}

function send_notification(title,message){
    document.getElementsByClassName("message-text")[0].innerHTML=title
    document.getElementsByClassName("sub-text")[0].innerHTML=message
    document.getElementsByClassName("card")[0].classList.remove("show_notification")
    setTimeout(() => {document.getElementsByClassName("card")[0].classList.add("show_notification")},20)
}

function inspect_bidoo_account(account) {
    let new_username = null
    document.getElementsByClassName("widget_background")[0].style="display:flex"
    document.getElementById("inspect_username").value=account.username
    document.getElementById("inspect_dess").value=account.dess
    document.getElementById("remove_bidoo_account").addEventListener("click",async()=>{
        reload_account_list(await window.bidoo.remove_account(account.username))
        document.getElementsByClassName("widget_background")[0].style="display:none"
        send_notification("ACCOUNT RIMOSSO","L'account è stato rimosso correttamente!")
    }, {once : true})
    document.getElementById("inspect_username").addEventListener("change",(e) => {
        new_username = e.target.value
    })
    document.getElementById("save_bidoo_account").addEventListener("click",async () => {
        if (new_username && new_username != account.username) {
            const new_list = await window.bidoo.update_account(account.username, new_username)
            if (new_list != "already_in_use") {
                reload_account_list(new_list)
                document.getElementsByClassName("widget_background")[0].style="display:none"
                send_notification("ACCOUNT SALVATO","L'account è stato salvato correttamente!")
            }else{
                document.getElementsByClassName("widget_background")[0].style="display:none"
                send_notification("NOME DUPLICATO","Il nome utente è già in uso!")
            }
        }else{
            document.getElementsByClassName("widget_background")[0].style="display:none"
            send_notification("TUTTO OK","Non è cambiato nulla!")
        }
    }, {once : true})
}

function is_valid_bid(text) {
    try {
        const url = new URL(text) 
        const promocode = url.searchParams.get("promocode")
        const host = url.hostname
        if (promocode && host.slice(3) == "bidoo.com") {
            return promocode
        }else{
            return false
        }
    } catch (error) {
        return false
    }
}

const colors = ["#83ff00","#0083ff","#ff6100","#ff00f2","#04ff00","#6a00ff","#754737"]
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function reload_channels_list(channels_list,selected_list) {
    document.getElementById("channels_list").innerHTML=""
    for (const channel of channels_list) {
        const container = document.createElement("div")
        const img_wrapper = document.createElement("div")
        const img = document.createElement("img")
        const channel_title = document.createElement("p")
        img_wrapper.appendChild(img)
        container.appendChild(img_wrapper)
        container.appendChild(channel_title)
        channel_title.innerText=channel.chat_title
        img.width=40
        if (channel.photo_url) {
            img.src=channel.photo_url
        }else{
            const letter_for_icon = document.createElement("p")
            img_wrapper.style.backgroundColor = colors[getRandomInt(7)]
            img_wrapper.appendChild(letter_for_icon)
            letter_for_icon.innerText = channel.chat_title.slice(0,1).toUpperCase()
            letter_for_icon.classList.add("icon_letter")
        }
        container.classList.add("chat_item")
        img_wrapper.classList.add("channel_img_wrapper")
        channel_title.classList.add("small_text")
        if (selected_list.includes(channel.chat_id)) {
            img_wrapper.classList.add("channel_selected")
            channel_title.classList.add("text_selected")
        }
        container.addEventListener("click",()=>{
            if (img_wrapper.classList.contains("channel_selected") && channel_title.classList.contains("text_selected")) {
                window.telegram.handleChannel(channel.chat_id,"remove")
                img_wrapper.classList.remove("channel_selected")
                channel_title.classList.remove("text_selected")
            } else {
                window.telegram.handleChannel(channel.chat_id,"add")
                img_wrapper.classList.add("channel_selected")
                channel_title.classList.add("text_selected")
            }
        })
        document.getElementById("channels_list").appendChild(container)
    }
}

export {reload_account_list, send_notification, is_valid_bid, reload_channels_list}