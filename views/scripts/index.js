$('#locationsInput').keydown(function(e) {
    if(e.keyCode == 13) {
        var input = $('#locationsInput')[0].value;
        window.location.href = "/l/" + input;
    }
});

$('#searchIcon').click(function() {
    window.location.href = "/l/" + $('#locationsInput')[0].value;
});