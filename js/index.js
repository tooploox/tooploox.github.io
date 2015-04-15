$(document).ready(function () {
    $("a").on("click", function(event){
        if ($(this).is("[disabled]")) {
            event.preventDefault();
        }
    });
});