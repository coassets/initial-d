/**
 * Created by huankiat on 2/10/14.
 */

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

function userentertrack(current_url) {
    var ca_id = '';
    if ($.cookie('ca_id') === undefined) {
        ca_id = generateUUID();
        $.cookie('ca_id', ca_id, { expires:1 })

    } else {
        ca_id = $.cookie('ca_id');
    };

    $.ajaxSetup({async:true});
    $.post('/tracker/user/data/enter/', {current_url:current_url, ca_id:ca_id, csrfmiddlewaretoken: '{{ csrf_token }}'})
    .done(function(data) {
            console.log(data);
        });

}

function userexittrack(current_url) {
    var ca_id = '';
    if ($.cookie('ca_id') === undefined) {
        ca_id = generateUUID();
        $.cookie('ca_id', ca_id, { expires:1 })

    } else {
        ca_id = $.cookies('ca_id');
    };
    $.ajaxSetup({async:true});
    $.post('/tracker/user/data/exit/', {current_url:current_url, ca_id:ca_id, csrfmiddlewaretoken: '{{ csrf_token }}'})
    .done(function(data) {
            console.log(data);
        });
}

$(document).ready(function(){
    var current_url = window.location.pathname;
    userentertrack(current_url);
})

$(window).unload(function(){
    var current_url = window.location.pathname;
    userexittrack(current_url);

});