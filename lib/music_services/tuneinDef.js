'use strict';
const tuneInDef = {
  country:   '',
  search:    {
               station: ' http://tunein.com/search/?query='
             },
  init:      function() {return this;},       
  service:   setService,
  headers:   getHeaders,
  term:      getSearchTerm,    
  empty:     isEmpty,
  metadata:  getMetadata,
  urimeta:   getURIandMetadata,
  list:		 list,
  isList:    isList,
  buildUrl:  buildUrl,
  directPlay: directPlay,
}  

function getURI(type, id) {
    return `x-sonosapi-stream:s${id}?sid=254&flags=8224&sn=0`;
}

function getServiceToken() {
    return `SA_RINCON65031_`;
}


var sid = '';
var serviceType = '';
var accountId = '';
var accountSN = '';
var country = '';

function setService(player, p_accountId, p_accountSN, p_country)
{
  sid = player.system.getServiceId('TuneIn');
  serviceType = player.system.getServiceType('TuneIn');
  accountId = p_accountId;
  accountSN = p_accountSN;
  country = p_country;
}

function getSearchTerm(type, term, artist, album, track) {

  return encodeURIComponent(term);
}

function getMetadata( type, id, title ) {
  const token = getServiceToken();
  
  return `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/" xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">
  <item id="R:0/0/0" parentID="R:0/0" restricted="true">
  <dc:title>${title}</dc:title>
  <upnp:class>object.item.audioItem.audioBroadcast</upnp:class>
  <desc id="cdudn" nameSpace="urn:schemas-rinconnetworks-com:metadata-1-0/">
  ${token}
  </desc>
  </item>
  </DIDL-Lite>`;
}

function getURIandMetadata(type, resList)
{
  var Id = '';
  var Title = '';
  var MetadataID = '';
  var UaM = {
              uri: '',
              metadata: ''
            };

  if ( directPlay( resList ) ) {
	  Id = resList.split('&')[0].replace('id:', '');
	  Title = resList.split('&')[1].replace('name:', '');
  } else {
	  Id = resList.payload.ContainerGuideItems.containers[2].GuideItems[0].Id;
	  Title = resList.payload.ContainerGuideItems.containers[2].GuideItems[0].Title;
  }
  MetadataID = encodeURIComponent(Id);
  UaM.metadata = getMetadata(type, MetadataID, Title );
  UaM.uri = getURI(type, encodeURIComponent(Id));

  return UaM;
}

function isList(resList, type)
{
  return true;
}
 
function findContainer(resList) {
	  for (var j=0; ( j < resList.payload.ContainerGuideItems.containers.length ) ; j++) {
		  if (resList.payload.ContainerGuideItems.containers[j].Title == 'Stations') {
			  return resList.payload.ContainerGuideItems.containers[j];
		  }
	  }
	  return [];
}

function list(resList, type, limit, page)
{
  var list = [];
  
  var container = findContainer(resList);
  for (var j=0; (j < container.GuideItems.length) ; j++) {
	  list.push( {'id': container.GuideItems[j].Id, 'name': container.GuideItems[j].Title } );
  }

  var start = (page - 1) * limit;
  list = list.slice( start, parseInt(start) + parseInt(limit) );
  return list;
}
  
function isEmpty(type, resList)
{
  var container = findContainer(resList);
  return (container.GuideItems.length == 0);
}

function buildUrl( type, limit, page ) {
	var url = tuneInDef.search[type];
	return url;
}


function getHeaders() {
  return {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json, text/javascript, */*',
  };
}

function directPlay( term ) {
	return term.includes("id:") && term.includes("name:"); 
}

module.exports = tuneInDef;

  
