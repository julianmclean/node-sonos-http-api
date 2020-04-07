'use strict';
const logger = require('sonos-discovery/lib/helpers/logger');

function getFirstPlaying(system, except) {
  // find coordinator for first zone playing anything other than TV
  let firstPlayer = false;
  system.players.forEach(function (player) {
    if (!firstPlayer && player.state.playbackState === 'PLAYING' && (!except || player !== except)) {
      firstPlayer = player;
    }
  });
  return firstPlayer;
}

module.exports = getFirstPlaying;
