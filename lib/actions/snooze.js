'use strict';
function snooze(player) {
 return player.coordinator.snooze();
}

module.exports = function (api) {
  api.registerAction('snooze', snooze);
}
