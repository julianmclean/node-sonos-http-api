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

function getMetadata(type, id, name, title) {
  const token = getServiceToken();
  
  if (type != 'station') {
    title = '';
  }

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
  var Name = '';
  var MetadataID = '';
  var UaM = {
              uri: '',
              metadata: ''
            };

  Id = resList.payload.ContainerGuideItems.containers[2].GuideItems[0].Id;
  Title = resList.payload.ContainerGuideItems.containers[2].GuideItems[0].Title;
  Name = Title.toLowerCase().replace("'","&apos;");
  MetadataID = encodeURIComponent(Id);
    
  UaM.metadata = getMetadata(type, MetadataID, Title, Title);
  UaM.uri = getURI(type, encodeURIComponent(Id));

  return UaM;
}

function isList(resList, type)
{
  return false;
}
  
function list(resList, type)
{
  var list = [];
  for (var j=0; (j < resList.data.length) ; j++) {
	  list.push( {'id': resList.data[j].id, 'name': resList.data[j].title + " by " + resList.data[j].user.name } );
  }
  
  return list;
}
  
function isEmpty(type, resList)
{
  return (resList.payload.ContainerGuideItems.containers[2].GuideItems.length == 0);
}

function buildUrl( type, limit, page ) {
	
	var url = tuneInDef.search[type];
	
	var index = (page - 1) * limit;
	return url.replace('|limit|', limit).replace('|index|', index);
	
}


function getHeaders() {
  return {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json, text/javascript, */*',
  };
}

module.exports = tuneInDef;

  
