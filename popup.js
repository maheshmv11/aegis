var config = {
	apiKey: "AIzaSyDrlmO6rDG__BUZ7w-RiKeJrWCiwjSJJyQ",
	authDomain: "aegis-60167.firebaseapp.com",
	databaseURL: "https://aegis-60167.firebaseio.com",
	projectId: "aegis-60167",
	storageBucket: "aegis-60167.appspot.com",
	messagingSenderId: "75409796149"
};

firebase.initializeApp(config);

var ref = firebase.database().ref().child("blocked_sites/");

window.onload = function() {}

chrome.storage.sync.get('color', function(data) {
	changeColor.style.backgroundColor = data.color;
	changeColor.setAttribute('value', data.color);
});

changeColor.onclick = function (element) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var url =  tabs[0].url;
		var proto = url.substring(0, url.indexOf(":"));
        var tabId = tabs[0].id;
        var tabUrl = tabs[0].url;
		
		var smallurl = extractHostname(url);
		var surl = parseURL(smallurl).host;
		
		
		if (proto !== "https"){
			chrome.tabs.executeScript(
				tabs[0].id,
				{code: 'document.body.style.border = "20px double red";'}
			);
			chrome.tabs.executeScript(
				tabs[0].id,
				{code: 'alert("This site is not secured");'}
			);
		}
		else
		{
			var isNew = true;
			var readref = firebase.database().ref().child('blocked_sites/');
			let dbarea = document.getElementById('tableforreport');
			let fromdb = "<tr><th>URL</th><th>COUNT</th></tr>";
			readref.once('value', function(snapshot){
				snapshot.forEach(function(childSnapshot){
					var childData = childSnapshot.val();
					var tempurl = childData.url;
					var tempcount = childData.count;
					if (smallurl == tempurl){
						if (tempcount > 20){ 
							isNew = false;
						}
					}
				});
				if(isNew){
					chrome.tabs.executeScript(
						tabs[0].id,
						{code: 'alert("This site is secured");'}
					);
				}else{ 
					chrome.tabs.executeScript(
						tabs[0].id,
						{code: 'document.body.style.border = "20px double yellow";'}
					);
					chrome.tabs.executeScript(
						tabs[0].id,
						{code: 'alert("Warning:This site is reported by the community");'}
					);
				}						
			});
		}
	});
};

logButton.onclick = function(element) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	
		var bConsole = chrome.extension.getBackgroundPage().console;
		var url =  tabs[0].url;
		var proto = url.substring(0, url.indexOf(":"));
        var tabId = tabs[0].id;
        var tabUrl = tabs[0].url;
		var proto = tabUrl.substring(0, tabUrl.indexOf(":"));
		
		bConsole.log(tabs[0]);
		
		var tport = tabs[0].port
		var title = tabs[0].title;
		var width = tabs[0].width;
		var icg = tabs[0].incognito;

		var templatestart = '<div class="card-panel"><h3>Logs for nerds : </h3><hr/><br/><p class="blue-text" id="logarea">';
		var contenttoshow = "URL : "+tabUrl+"<br/>Protocol : "+proto+"<br/>port:"+tport+"<br/>Title:"+title+"<br/>Width:"+width+"<br/>Incognito:"+icg;
		var templateend = '</p></div>';

		let areacontainer = document.getElementById('logareacontainer');
		areacontainer.innerHTML = templatestart+contenttoshow+templateend;

		if (areacontainer.style.display === "none") {
			areacontainer.style.display = "block";
		} else {
			areacontainer.style.display = "none";
		}

		let dbareacontainer = document.getElementById('databasecontainer');

		if (areacontainer.style.display === "none") {
			dbareacontainer.style.display = "block";
		} else {
			dbareacontainer.style.display = "none";
		}

		var readref = firebase.database().ref().child('blocked_sites/');
		let dbarea = document.getElementById('tableforreport');
		let fromdb = "<tr><th>URL</th><th>COUNT</th></tr>";
		readref.once('value', function(snapshot) {
		    snapshot.forEach(function(childSnapshot) {

		      	var childData = childSnapshot.val();
		      	var tempurl = childData.url;
		      	var tempcount = childData.count;
		      	fromdb += "<tr><td>" + tempurl + "</td><td>" + tempcount + "</td></tr>";
				dbarea.innerHTML = fromdb;
		    });
		});
    });
};

repButton.onclick = function(element) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var cururl = tabs[0].url;
		var thost = extractHostname(cururl);
		var host = parseURL(thost).host;
		var count = 1;

		var readref = firebase.database().ref().child('blocked_sites/');
		let dbarea = document.getElementById('tableforreport');

		readref.once('value', function(snapshot) {
			var isNew = true;
		    snapshot.forEach(function(childSnapshot) {
		      	var childData = childSnapshot.val();
		      	var tempurl = childData.url;
		      	var tempcount = childData.count;
		      	var tempdomain = extractHostname(tempurl);
				var temphost = parseURL(tempdomain).host;
				if(isNew){
					if(host === temphost){
						isNew = false;
					}else{
						isNew = true;
					}
				}
		    });
		    if(isNew){
				var tempdomain = extractHostname(cururl);
				var temphost = parseURL(tempdomain).host;
	      		ref.child(temphost).update({
					url:tempdomain,
					count:1
				});
	      		alert("This page has been reported");
			}else{
	      		alert("This page has been already in our list. Updating the index.");
				readref.once('value', function(snapshot) {
				    snapshot.forEach(function(childSnapshot) {
				      	var childData = childSnapshot.val();
				      	var tempurl = childData.url;
				      	var tempcount = childData.count;
				      	var tempdomain = extractHostname(tempurl);
						var temphost = parseURL(tempdomain).host;
				      	if(temphost === host){
				      		ref.child(temphost).update({
								url:tempdomain,
								count:tempcount+1
							});
				      	}
				    });
				});
			}
		});
    });
};


phishButton.onclick = function(element) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var url =  tabs[0].url;
		var thost = extractHostname(url);
		var host = parseURL(thost).host;
		var proto = url.substring(0, url.indexOf(":"));
        var tabId = tabs[0].id;
        var tabUrl = tabs[0].url;
		var proto = tabUrl.substring(0, tabUrl.indexOf(":"));

		/*let areacontainer = document.getElementById('phishingareacontainer');
		//areacontainer.innerHTML = templatestart+contenttoshow+templateend;

		if (areacontainer.style.display === "none") {
			areacontainer.style.display = "block";
		} else {
			areacontainer.style.display = "none";
		}*/

		var readref = firebase.database().ref().child('phishing_sites/');
		var isFake = false;
		readref.once('value', function(snapshot) {
		    snapshot.forEach(function(childSnapshot) {

		      	var childData = childSnapshot.val();
		      	var tempdomain = childData.domain;
				//alert(tempdomain + thost);
		      	//fromdb += "<tr><td>" + tempurl + "</td><td>" + tempcount + "</td></tr>";		      	
		      		if(thost == tempdomain){
						// alert(tempdomain + thost);
			      		//alert("This might be a fake site");
			      		isFake = true;
			      	}		      		
		    });
		    if(isFake){
		    	alert("This might be a fake site");
		    }else{
		    	alert("No problems found yet");
		    }
		});
    });
};



function extractHostname(url) {
    var hostname;
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }
    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];
    return hostname;
}

function parseURL(url){
    parsed_url = {}

    if ( url == null || url.length == 0 )
        return parsed_url;

    protocol_i = url.indexOf('://');
    parsed_url.protocol = url.substr(0,protocol_i);

    remaining_url = url.substr(protocol_i + 3, url.length);
    domain_i = remaining_url.indexOf('/');
    domain_i = domain_i == -1 ? remaining_url.length - 1 : domain_i;
    parsed_url.domain = remaining_url.substr(0, domain_i);
    parsed_url.path = domain_i == -1 || domain_i + 1 == remaining_url.length ? null : remaining_url.substr(domain_i + 1, remaining_url.length);

    domain_parts = parsed_url.domain.split('.');
    switch ( domain_parts.length ){
        case 2:
          parsed_url.subdomain = null;
          parsed_url.host = domain_parts[0];
          parsed_url.tld = domain_parts[1];
          break;
        case 3:
          parsed_url.subdomain = domain_parts[0];
          parsed_url.host = domain_parts[1];
          parsed_url.tld = domain_parts[2];
          break;
        case 4:
          parsed_url.subdomain = domain_parts[0];
          parsed_url.host = domain_parts[1];
          parsed_url.tld = domain_parts[2] + '.' + domain_parts[3];
          break;
    }

    parsed_url.parent_domain = parsed_url.host + '.' + parsed_url.tld;

    return parsed_url;
}
