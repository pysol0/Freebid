import { reload_channels_list } from "../reusable_functions.js"
import { CountUp } from './countUp.min.js';

const root = document.querySelector(':root');
var bids_counter

document.addEventListener("DOMContentLoaded",async ()=>{
    const user = await window.loadashboard.getMe()
    const groups = await window.telegram.getGroups(user.telegram.channels_groups)
    document.getElementById("settings_messages").value = user.telegram.messages_count
    root.style.setProperty('--text-gradient', user.telegram.messages_count + "%");
    bids_counter = new CountUp('message_count', user.telegram.messages_count, {duration:3});
    bids_counter.start()
    reload_channels_list(groups,user.telegram.selected_chats)
    document.getElementById("name").innerText = user.name
    document.getElementById("username").innerText = "@"+user.username
    document.getElementById("img_profile_text").innerText = user.name.slice(0,1).toUpperCase() 
    window.bidoo.getRedeemMode().then(await_mode => {
        if (await_mode) {
            document.getElementById("redeem_mode").classList.add("redeem_mode_checked")
        }else{
            document.getElementById("redeem_mode").classList.remove("redeem_mode_checked")
        }
    })
    document.getElementById("redeem_mode").addEventListener("click",()=>{
        window.bidoo.setRedeemMode()
        document.getElementById("redeem_mode").classList.toggle("redeem_mode_checked")
    })
})

document.getElementById("logout_button").addEventListener("click",async()=>{
    await window.route.logout()
})

document.getElementById("back_to_dashboard").addEventListener("click",async()=>{
    await window.route.getDashboard()
})

document.getElementById("settings_messages").addEventListener("change",(e)=>{
    bids_counter.update(e.target.value)
    window.telegram.handleMessagesCount(parseInt(e.target.value))
    if (e.target.value == 99) {
        root.style.setProperty('--text-gradient', "100%");
    }else{
        root.style.setProperty('--text-gradient', e.target.value + "%");
    }
})