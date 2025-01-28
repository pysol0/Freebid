import {reload_account_list,send_notification,is_valid_bid} from "../reusable_functions.js"
import { CountUp } from './countUp.min.js';

var bids_counter
var chart
const custom_promocodes = new Map()
var i=0

const time_presets = {
    0: ["30 minuti", 30*60],
    1: ["1 ora", 60*60],
    2: ["1.5 ore", 90*60],
    3: ["3 ore", 180*60],
    4: ["6 ore", 360*60],
    5: ["12 ore", 720*60],
    6: ["1 giorno", 1440*60],
    7: ["2 giorni", 2880*60],
}

document.getElementById("add_bidoo_account").addEventListener("click",async() => {
    document.getElementById("loading_screen").style.display="flex"
    const new_accounts_list = await window.bidoo.add_account()
    if (new_accounts_list != "already_added") {
        reload_account_list(new_accounts_list)
        document.getElementById("loading_screen").style.display="none"
        send_notification("OTTIMO","Account aggiunto correttamente!") 
    }else{
        document.getElementById("loading_screen").style.display="none"
        send_notification("NON È CAMBIATO NULLA","L'account era già presente nella lista!") 
    }
})

document.getElementsByClassName("x_icon")[0].addEventListener("click",() => {
    document.getElementsByClassName("widget_background")[0].style="display:none"
})

document.getElementById("redeem_bids").addEventListener("click",async () => {
    document.getElementById("loading_screen").style.display="flex"
    const new_account_list = await window.bidoo.redeem_bids(null,null)
    reload_account_list(new_account_list)
    document.getElementById("loading_screen").style.display="none"
    send_notification("RISCOSSIONE COMPLETATA","Puntate riscosse correttamente!")
    const user = await window.loadashboard.getMe()
    bids_counter.update(user.stats.total_redeemed)
    chart.updateOptions({
        series: [{
            data: user.stats.to_chart
        }],
        xaxis: {
            min: user.stats.to_chart[0][0],
            max: user.stats.to_chart[user.stats.to_chart.length - 1][0]
        }})
})

document.addEventListener("DOMContentLoaded", async() => {
    const no_logged_users = await window.loadashboard.check_logins()
    if (no_logged_users) {
        no_logged_users.map(user => {
            const username = document.createElement("p")
            username.innerText = user
            username.classList.add("small_text")
            document.getElementById("no_logged_list").appendChild(username)
        })
        document.getElementById("no_logged_alert").style.display = "flex"
    } 
    const user = await window.loadashboard.getMe()
    reload_account_list(user.bidoo_accounts)
    bids_counter = new CountUp('total_redeemed', user.stats.total_redeemed, {duration:3});
    if (!bids_counter.error) {
        bids_counter.start();
    } else {
        console.error(bids_counter.error);
    }

    var options = {
        tooltip:{
            enabled:false
        },
        chart: {
          type: 'area',
          toolbar:{
            show:false
          },
          width: "100%",
          height: "70%"
        },
        stroke: {
          curve: 'smooth',
        },
        dataLabels: {
          enabled: false
        },
        colors: ["#34CC98"],
        series: [{
          data: user.stats.to_chart
        }],
        xaxis: {
            type: "datetime",
            min: user.stats.to_chart[0][0],
            max: user.stats.to_chart[user.stats.to_chart.length - 1][0]
        }
      }
      
    chart = new ApexCharts(document.getElementById("chart_div"), options);
    
    chart.render();
})


function add_specific_link(e) {
    e.preventDefault()
    const link = document.getElementById("specific_bidoo_link").value
    document.getElementById("specific_bidoo_link").value = null
    const promocode = is_valid_bid(link)
    if (!promocode) {
        send_notification("LINK NON VALIDO","Il link inserito non è valido!")
    }
    else if ([...custom_promocodes.values()].includes(promocode)) {
        send_notification("LINK GIÀ AGGIUNTO","Il link è già presente nella lista!")
    }
    else{
        custom_promocodes.set(9999999999999+i, promocode)
        i++
        document.getElementById("specific_bidoo_link_list").value += promocode + '\n'
        send_notification("LINK AGGIUNTO","Il link è stato aggiunto correttamente!")
    }
}

document.getElementById("specific_link_form").addEventListener("submit",(e)=>add_specific_link(e))
document.getElementById("specific_link_btn").addEventListener("click",(e)=>add_specific_link(e))
document.getElementById("specific_collect").addEventListener("click",async (e) => {
    document.getElementById("loading_screen").style.display="flex"
    const new_account_list = await window.bidoo.redeem_bids(custom_promocodes,null)
    reload_account_list(new_account_list)
    document.getElementById("loading_screen").style.display="none"
    document.getElementById("specific_bidoo_link_list").value = null
    custom_promocodes.clear()
    send_notification("RISCOSSIONE COMPLETATA","Puntate riscosse correttamente!")
    const user = await window.loadashboard.getMe()
    bids_counter.update(user.stats.total_redeemed)
    chart.updateOptions({
        series: [{
            data: user.stats.to_chart
        }],
        xaxis: {
            min: user.stats.to_chart[0][0],
            max: user.stats.to_chart[user.stats.to_chart.length - 1][0]
        }})
})

document.getElementById("automate_time_range").addEventListener("change",(e) => {
    document.getElementById("time_rage_text").innerText = time_presets[e.target.value][0]
})

document.getElementById("automate_messages").addEventListener("change",(e) => {
    document.getElementById("messages_number_text").innerText = e.target.value + " messaggi"
})

document.getElementById("automate_button").addEventListener("click",async () => {
    document.getElementById("automate_screen").style.display="flex"
    const time_range = time_presets[document.getElementById("automate_time_range").value][1]
    const messages_number = parseInt(document.getElementById("automate_messages").value)
    var cycle = true
    document.getElementById("stop_automation").addEventListener("click",()=>{
        cycle = !cycle; 
        document.getElementById("automate_screen").style.display="none"
        document.getElementById("automate_loading_gif").style.display="flex"
        document.getElementById("automate_waiting").style.display="none"
        clearInterval(update_timer)
    }, {once : true})
    while (cycle) {
        document.getElementById("seconds_for_next_cycle").innerText = time_range
        document.getElementById("automate_loading_gif").style.display="flex"
        document.getElementById("automate_waiting").style.display="none"
        var new_account_list = await window.bidoo.redeem_bids(null,messages_number)
        reload_account_list(new_account_list)
        document.getElementById("automate_loading_gif").style.display="none"
        document.getElementById("automate_waiting").style.display="flex"
        var countDown = time_range
        var update_timer = setInterval(()=>{document.getElementById("seconds_for_next_cycle").innerText = countDown; countDown--},1000)
        await new Promise(r => setTimeout(r, time_range*1000 + 1000));
        clearInterval(update_timer)
    }
})

document.getElementById("settings_icon").addEventListener("click",()=>{
    window.route.getSettings()
})

document.getElementById("no_logged_button").addEventListener("click",()=>{
    document.getElementById("no_logged_alert").style.display="none"
})