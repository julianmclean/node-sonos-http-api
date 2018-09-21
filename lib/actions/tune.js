'use strict';
const request = require('request-promise');
const fs = require("fs");

const tuneInDef = require('../music_services/tuneInDef');
const tuneInStations = require('../tunein-stations.json');

var accountId = '';
var accountSN = '';
var searchType = 0;

function getService(service) {
  if (service == 'apple') {
    return appleDef;
  } else
  if (service == 'spotify') {
    return spotifyDef;
  } else
  if (service == 'deezer') {
    return deezerDef;
  } else
  if (service == 'elite') {
    return eliteDef;
  } else
  if (service == 'library') {
    return libraryDef;
  } else
  if (service == 'tunein') {
    return tuneInDef;
  }
}

function getAccountId(player)
{
    accountId = '';
	return request({url: player.baseUrl + '/status/accounts',json: false})
	  .then((res) => {
	    var actLoc = res.indexOf(player.system.getServiceType("TuneIn"));
	   
	    if (actLoc != -1) {
	      var idLoc = res.indexOf('<UN>', actLoc)+4;
	      var snLoc = res.indexOf('SerialNum="', actLoc)+11;
	  
	      accountId = res.substring(idLoc,res.indexOf('</UN>',idLoc));
	      accountSN = res.substring(snLoc,res.indexOf('"',snLoc));
	    }
	    
	    return Promise.resolve();
	  });
}


function tuneRadio(player, values) {
  const name = decodeURIComponent(values[0]).replace('+',' ');

  console.log('Radio Name: ' + name);
  
  var term = '';
  for (var i = 0; i < tuneInStations.length; i++) { 
	  if( tuneInStations[i].Name.toLowerCase() == name.toLowerCase() ) {
		  var foundName = tuneInStations[i].Name;
		  term = 'id:'+tuneInStations[i].Id+'&name:'+tuneInStations[i].Name;
	  }
  }
  
  const queueURI = 'x-rincon-queue:' + player.uuid + '#0';
   
  var   serviceDef = null;

  if (term == '') {
	  return Promise.resolve({ "status": "success", "message": "Sorry I couldn't find a station matching " + name } );
  }
  
  return getAccountId(player)
    .then(() => {
      tuneInDef.service(player, accountId, accountSN);
	  var UaM = tuneInDef.urimeta('station', term);
      player.coordinator.setAVTransport(UaM.uri, UaM.metadata) 
        .then(() => player.coordinator.play());
      return Promise.resolve({ "status": "success", "message": "Starting " + foundName } );
    });
}

module.exports = function (api) {
  api.registerAction('tune', tuneRadio);
};
