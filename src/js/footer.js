var modal = document.querySelector(".msgbox");
var trigger = document.querySelectorAll(".footer_text");
var closeButton = document.querySelector(".close-button");

function toggleModal() {
    if (this.id == "contact") {
        return false;
    }
    var path = "static/" + this.id + ".html";
    if (modal.classList.toggle("show-msgbox")) {
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", reqListener);
        oReq.open("GET", path);
        oReq.send();
    }
}

function reqListener() {
    var contentText = document.querySelector("#msgbox-text");
    contentText.innerHTML = this.responseText;
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}
window.addEventListener("click", windowOnClick);
closeButton.addEventListener("click", toggleModal);
trigger.forEach(function(item) {
    item.addEventListener("click", toggleModal);
});