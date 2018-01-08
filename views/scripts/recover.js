$('#recoverForm').submit(function(e) {
    e.preventDefault();
    var pass = $('#passwordInput');
    var confirmPass = $('#confirmPassInput');
    path = window.location.pathname.split('/');
    if(encodeURI(pass.val()) == encodeURI(confirmPass.val())) {
        $.post('/recover', {password: encodeURI(pass.val()), owner: path[2], key: path[3]});
        location.href = "/";
    }
    else
        confirmPass.css('border-color', 'red');
});