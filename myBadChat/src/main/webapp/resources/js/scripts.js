
// переменные для хранения имени пользователя и статуса(онлайн или нет)
var login, online = false;

var appState = {
    mainUrl : 'http://localhost:8080/chat',
    token : 'TN11EN',
    userName : '',
    friends: []
};
var theMessage = function(message1, id1, loginName1) {
    return {
        text: message1,
        id: id1,
        user: loginName1
    };
};

var uniqueId = function() {
    var date = Date.now();
    var random = Math.random() * Math.random();
    return Math.floor(date * random).toString();
};

function sent (){
    if(online){
        var text1 = document.getElementById('message_area');
        if (text1.value != ''){
            var msg = theMessage(text1.value, uniqueId(),appState.userName);
            post(appState.mainUrl, JSON.stringify(msg), function(){
                var newToken = parseInt(appState.token.substring(2,4),10) + 8;
                appState.token = 'TN' + newToken + 'EN';
                updateMsg(msg);
            });
        }
    }
    else
        alert("Please, login!");
}

function run (){
}

function updateMsg(msg){
    var p = document.createElement('p');
    p.className += 'message';
    p.innerHTML = msg.user + ': ';
    p.innerHTML += msg.text;
    var incoming = document.getElementById('incoming_messages');
    incoming.appendChild(p);
    var message_area = document.getElementById('message_area'),
    clean_message =  ' ';
    message_area.value = clean_message;
}

function log()
{
	login =	document.getElementById('name').value;
	if(login != "")
	{
            online = true;
            doPolling();
            var log_window = document.getElementById('login');
			log_window.style.display = 'none';
			var exit_window = document.getElementById('exit');
			exit_window.style.display = 'inline';
			var text_exit = document.getElementById('text_exit');
			var text = document.createTextNode("You have been logged as " + login);
			text_exit.appendChild(text);
			var childNodes = log_window.childNodes;
			document.getElementById('incoming_messages').innerHTML = "";
			var users = document.getElementById('users_holder');
			var p = document.createElement('p');
			p.innerHTML = login;
	    	users.appendChild(p);
            appState.userName = login;
        }
}
function exit()
{
		document.getElementById('name').value = login;
		login = '';
        appState.userName = '';
		online = false;
		var exit_text = document.getElementById('text_exit');
		exit_text.removeChild(exit_text.lastChild);
		var exit_window = document.getElementById('exit');
		exit_window.style.display = 'none';
		var log_window = document.getElementById('login');
		log_window.style.display = 'inline';
		document.getElementById('incoming_messages').innerHTML = "";
		var users = document.getElementById('users_holder');
		users.innerHTML = "";
}
function edit()
{
	var edit_window = document.getElementById('edit');
	var ok_button = document.getElementById('edit_ok');
	var edit_button = document.getElementById('edit_button');
	var exit_button = document.getElementById('exit_button');
	edit_window.style.display = 'inline';
	edit_ok.style.display = 'inline';
	edit_button.style.display = 'none';
	exit_button.style.display = 'none';
	edit_window.value = login;
}
function ok_edit()
{
	var edit_window = document.getElementById('edit');
	var ok_button = document.getElementById('edit_ok');
	var edit_button = document.getElementById('edit_button');
	var exit_button = document.getElementById('exit_button');
	edit_window.style.display = 'none';
	edit_ok.style.display = 'none';
	edit_button.style.display = 'inline';
	exit_button.style.display = 'inline';
	if(edit_window.value != "")
	{
			login = edit_window.value;
			var div_exit = document.getElementById('exit');
			var old_text_exit = document.getElementById('text_exit');
			var text_exit = document.createElement('p')
			text_exit.setAttribute("id", "text_exit");
			var text = document.createTextNode("You have been logged as " + login);
			text_exit.appendChild(text);
			div_exit.removeChild(old_text_exit);
			div_exit.insertBefore(text_exit, div_exit.firstChild);
			var users = document.getElementById('users_holder');
			users.childNodes[1].innerHTML = login;
            appState.userName = login;
	}
}


function doPolling() {
    function loop() {
        var url = appState.mainUrl + '?token=' + appState.token;
        get(url, function(responseText) {
                var response = JSON.parse(responseText);
                appState.token = response.token;
                createAllMessages(response.messages);
            setTimeout(loop, 1000);
        }, function(error) {
            defaultErrorHandler(error);
            setTimeout(loop, 1000);
        });
    }
    loop();
}

function createAllMessages(allMessages) {
    for(var i = 0; i < allMessages.length; i++)
        updateMsg(allMessages[i]);
}

function defaultErrorHandler(message) {
	alert(message);
}

function get(url, continueWith, continueWithError) {
	ajax('GET', url, null, continueWith, continueWithError);
}

function post(url, data, continueWith, continueWithError) {
	ajax('POST', url, data, continueWith, continueWithError);	
}
function del(url,data,continueWith,continueWithError){
	ajax('DELETE', url, data, continueWith, continueWithError);
}
function put(url,data,continueWith,continueWithError){
	ajax('PUT', url, data, continueWith, continueWithError);
}

function isError(text) {
	if(text == "")
		return false;
	
	try {
		var obj = JSON.parse(text);
	} catch(ex) {
		return true;
	}

	return !!obj.error;
}

function ajax(method, url, data, continueWith, continueWithError) {
	var xhr = new XMLHttpRequest();

	continueWithError = continueWithError || defaultErrorHandler;
	xhr.open(method || 'GET', url, true);

	xhr.onload = function () {
		if (xhr.readyState !== 4)
			return;

		if(xhr.status != 200) {
			continueWithError('Error on the server side, response ' + xhr.status);
			return;
		}

		if(isError(xhr.responseText)) {
			continueWithError('Error on the server side, response ' + xhr.responseText);
			return;
		}

		continueWith(xhr.responseText);
	};    

	xhr.ontimeout = function () {
		ontinueWithError('Server timed out !');
	};

	xhr.onerror = function (e) {
		var errMsg = 'Server connection error ' + appState.mainUrl + '\n';

		continueWithError(errMsg);
	};

	xhr.send(data);
}

window.onerror = function(err) {
	defaultErrorHandler(err.toString());
};
