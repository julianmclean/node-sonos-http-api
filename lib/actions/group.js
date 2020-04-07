'use strict';
const logger = require('sonos-discovery/lib/helpers/logger');
const getFirstPlaying = require('../helpers/get-first-playing');

function addToGroup(player, values) {
  const joiningRoomName = decodeURIComponent(values[0]);
  const joiningPlayer = player.system.getPlayer(joiningRoomName);
  if(!joiningPlayer) {
    logger.warn(`Room ${joiningRoomName} not found - can't group with ${player.roomName}`);
    return Promise.reject(new Error(`Room ${joiningRoomName} not found - can't group with ${player.roomName}`));
  }
  return attachTo(joiningPlayer, player.coordinator);
}

function detachFromGroup(player, values) {
  const leavingRoomName = decodeURIComponent(values[0]);
  const leavingPlayer = player.system.getPlayer(leavingRoomName);
  if(!leavingRoomName) {
    logger.warn(`Room ${leavingRoomName} not found - can't detach from ${player.roomName}`);
    return Promise.reject(new Error(`Room ${joiningRoomName} not found - can't detach from ${player.roomName}`));
  }
  return isolate(leavingPlayer);
}

function detachAll(player) {
  player.system.players
    .filter(p => {
      return p !== player;
    })
    .map(p => {
      return isolate(p);
    });
}

function addAll(player) {
  player.system.players
    .filter(p => {
      return p !== player;
    })
    .map(p => {
      return attachTo(p, player.coordinator);
    });
}

function addAllFirst(player) {
  const receivingPlayer = getFirstPlaying(player.system, false);
  if(!receivingPlayer) {
    logger.warn(`Couldn't find any room playing music to group on`);
    return Promise.reject(new Error(`Couldn't find any room playing music to group on`));
  }
  receivingPlayer.system.players
    .filter(p => {
      return p !== receivingPlayer;
    })
    .map(p => {
      return attachTo(p, receivingPlayer.coordinator);
    });
}

function joinPlayer(player, values) {
  const receivingRoomName = decodeURIComponent(values[0]);
  const receivingPlayer = player.system.getPlayer(receivingRoomName);
  if(!receivingPlayer) {
    logger.warn(`Room ${receivingRoomName} not found - can't make ${player.roomName} join it`);
    return Promise.reject(new Error(`Room ${receivingRoomName} not found - can't make ${player.roomName} join it`));
  }
  return attachTo(player, receivingPlayer.coordinator);
}

function joinFirst(player) {
  const receivingPlayer = getFirstPlaying(player.system, player);
  if(!receivingPlayer) {
    logger.warn(`Couldn't find any other room playing music to join to`);
    return Promise.reject(new Error(`Couldn't find any other room playing music to join to`));
  }
  return attachTo(player, receivingPlayer.coordinator);
}


function rinconUri(player) {
  return `x-rincon:${player.uuid}`;
}

function attachTo(player, coordinator) {
  return player.setAVTransport(rinconUri(coordinator));
}

function isolate(player) {
  return player.becomeCoordinatorOfStandaloneGroup();
}

function isolateAll(player) {
  const promises = player.system.players
    .map(p => {
      return p.becomeCoordinatorOfStandaloneGroup();
    });
  return Promise.all(promises);  
}

module.exports = function (api) {
  api.registerAction('add', addToGroup);
  api.registerAction('attach', addToGroup);
  api.registerAction('addall', addAll);
  api.registerAction('attachall', addAll);
  api.registerAction('addallfirst', addAllFirst);
  api.registerAction('attachallfirst', addAllFirst);

  api.registerAction('detach', detachFromGroup);
  api.registerAction('detachall', detachAll);
  api.registerAction('remove', detachFromGroup);
  api.registerAction('removeall', detachAll);

  api.registerAction('join', joinPlayer);
  api.registerAction('joinfirst', joinFirst);
  api.registerAction('leave', isolate);

  api.registerAction('isolate', isolate);
  api.registerAction('ungroup', isolate);
  api.registerAction('isolateall', isolateAll);
  api.registerAction('ungroupall', isolateAll);
}
