var q = document.getElementsByClassName("collapsible-button")
for (i = 0; i < q.length; i++) {
    q[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var n = this.nextElementSibling;
        if (n.style.maxHeight) {
            n.style.maxHeight = null;
        } else {
            n.style.maxHeight = n.scrollHeight + "px";
        }
    });
}