const assert = require('node:assert/strict');
const ActivityClock = require('./activity-clock.js');

(function pausesWithoutCountingTheGapAndExpiresExactlyOnce() {
  let current = 100;
  let expirations = 0;
  const clock = ActivityClock.create(1000, null, {
    now: () => current,
    onExpire: () => { expirations += 1; },
  });
  clock.start();
  current = 400;
  assert.deepEqual(clock.tick(), {
    remaining: 700, running: true, unlimited: false, expired: false,
  });
  clock.pause();
  current = 5000;
  assert.equal(clock.tick().remaining, 700, 'paused wall time must not count');
  clock.start();
  current = 5700;
  assert.equal(clock.tick().remaining, 0);
  assert.equal(clock.snapshot().expired, true);
  assert.equal(expirations, 1);
  current = 9000;
  clock.tick();
  clock.start();
  assert.equal(expirations, 1, 'expired clock cannot restart or expire twice');
})();

(function restoreClampsValuesAndAlwaysRestoresPaused() {
  let current = 0;
  const above = ActivityClock.create(800, {
    remaining: 9000, running: true, unlimited: false, expired: false,
  }, { now: () => current });
  assert.deepEqual(above.snapshot(), {
    remaining: 800, running: false, unlimited: false, expired: false,
  });

  const invalid = ActivityClock.create(800, {
    remaining: 'oops', running: true, unlimited: 'yes', expired: true,
  }, { now: () => current });
  assert.deepEqual(invalid.snapshot(), {
    remaining: 800, running: false, unlimited: false, expired: false,
  });

  const empty = ActivityClock.create(800, {
    remaining: -5, running: true, unlimited: false, expired: false,
  }, { now: () => current });
  assert.deepEqual(empty.snapshot(), {
    remaining: 0, running: false, unlimited: false, expired: true,
  });
})();

(function unlimitedStopsTimingAndResetRestoresTheDuration() {
  let current = 20;
  let expirations = 0;
  const clock = ActivityClock.create(500, null, {
    now: () => current,
    onExpire: () => { expirations += 1; },
  });
  clock.start();
  current = 220;
  clock.unlimited();
  assert.deepEqual(clock.snapshot(), {
    remaining: 300, running: false, unlimited: true, expired: false,
  });
  current = 5000;
  assert.equal(clock.tick().remaining, 300);
  assert.equal(expirations, 0);
  clock.reset();
  assert.deepEqual(clock.snapshot(), {
    remaining: 500, running: false, unlimited: false, expired: false,
  });
})();

(function backwardsTimeIsIgnoredAndDisposePreventsCallbacks() {
  let current = 1000;
  let expirations = 0;
  const clock = ActivityClock.create(100, null, {
    now: () => current,
    onExpire: () => { expirations += 1; },
  });
  clock.start();
  current = 900;
  assert.equal(clock.tick().remaining, 100);
  current = 1050;
  assert.equal(clock.tick().remaining, 50);
  clock.dispose();
  current = 5000;
  clock.tick();
  clock.start();
  assert.equal(expirations, 0);
  assert.equal(clock.snapshot().running, false);
})();

(function rejectsInvalidDurations() {
  assert.throws(() => ActivityClock.create(0), /duration/i);
  assert.throws(() => ActivityClock.create(Number.NaN), /duration/i);
})();

console.log('activity clock tests passed');
