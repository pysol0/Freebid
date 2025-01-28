const render_qr = (link)=>{
    document.getElementById('qrcode').innerHTML=""
    const qrcode = new QRCode(document.getElementById('qrcode'), {
        text: link,
        width: 130,
        height: 130,
        colorDark : '#000',
        colorLight : '#fff',
        correctLevel : QRCode.CorrectLevel.H
    });

}

window.telegram.sendMessage({environment:'telegram',msg:'need_qr'})

  // Listen for messages
window.telegram.onMessage((data) => {
    console.log(data)
    if (data.environment === 'telegram') {
        switch (data.msg) {
            case "need_psw":
                document.getElementById("tg_psw_input").disabled=false
                document.getElementById("tg_psw_input").placeholder="telegram required your password:"
                document.getElementById("tg_psw_input").classList.add("password_required")
                document.getElementById("tg_psw_btn").addEventListener("click",(event) => {
                    window.telegram.sendMessage({environment:'telegram',msg:'send_psw',value:document.getElementById("tg_psw_input").value})
                })
                break;
            case "invalid_psw":
                document.getElementById("tg_psw_input").classList.remove("password_required")
                setTimeout(() => {document.getElementById("tg_psw_input").classList.add("password_required")},10)
                document.getElementById("tg_psw_input").style.border = "1px solid red"
                break
            default:
                render_qr(data.msg)
                break;
        }
    }

})
