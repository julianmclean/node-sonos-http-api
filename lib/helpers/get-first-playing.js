'use strict';
const logger = require('sonos-discovery/lib/helpers/logger');

function getFirstPlaying(system, except) {
  // find coordinator for first zone playing anything other than TV
  let firstPlayer = false;
  //try to find one playing
  system.players.forEach(function (player) {
    if (!firstPlayer && player.state.playbackState === 'PLAYING' && (!except || player !== except)) {
      firstPlayer = player;
    }
  });
  //if not, grab any of them
  firstPlayer = system.players[0];
  return firstPlayer;
}

module.exports = getFirstPlaying;
