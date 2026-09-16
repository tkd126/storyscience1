# Playground Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans task-by-task. User approved implementation; continue without another design gate.

**Goal:** Replace chapter2 card-only activities with visual exploration, two optional timed tasks and a wind-dial evidence chest.
**Architecture:** Pure Playground state machine drives a separate DOM view, with ActivityClock owning only elapsed-time accounting. App persists an independent flags object per activity; chapter2 preserves scene IDs and common ending.
**Tech Stack:** Static JS/CSS, Node assert, generated cartoon raster art, existing character/BGM assets.
**Spec:** docs/superpowers/specs/2026-09-15-chapter2-playground-design.md

## Global Constraints

- Static file opening, no builds or runtime libraries. Keep chapter1 and original assets unchanged.
- No gameover or 15-second answer penalty. Timer optional; dialogue, detail view and hidden tab pause it.
- Timed wind is 35 seconds; packing is 45 seconds. Retry keeps progress; reload restores paused.
- Korean elementary-school language, same ending, no instant film-photo preview before development.
- Save states are validated and no duplicate completion or inventory reward.

## Task 1: Pure game state and clock

Files: create prototype/playground.js, playground.test.js, activity-clock.js, activity-clock.test.js.

Interfaces: Playground.initial(mode,saved), Playground.act(state,{type,value}), Playground.ready(state), modes fog/wind/locker/pack/photo. act returns a fresh validated state with message and speaker. Expose cards (id,time,end direction), items map and windDirections=['east','north','east'] for UI use. Return {version:1,mode,seen:[],inventory:[],selected:'',storeOpen:false,clean:false,windStep:0,paper:false,fixed:false,dials:['north','north','north'],lockerOpen:false,loaded:false,heard:false,packed:[],closed:false,complete:false,message:'',speaker:'소미'} plus purpose-specific fields needed below.

- [ ] Write failing behavior tests: missing module asserted first, illegal unlock/play/pack prevented; all success flows, wrong direction preserves progress, restore sanitizes values, completion immutable.
```js
assert.equal(P.act(P.initial('locker'),{type:'play'}).heard,false);
assert.equal(P.act(P.initial('wind'),{type:'direction',value:'west'}).windStep,0);
```
- [ ] Run `node prototype/playground.test.js`, expect missing module assertion; then implement rules.
- Fog: inspect grass/air/sky/lens, use cloth on lens after taking it (cloth available at lens), observe no disappearance of outdoor fog; wait completes after grass/air/sky and wipedLens. Incorrect attempts observational feedback. No glossary question.
- Wind: initial inventory key; select key then use store opens; take clip/reacher/cloth/box only when storeOpen. direction advances east/north/east, no progress on wrong. After3 select reacher use hedge gets paper; select clip use board fixes paper and completes. ready requires tools clip/reacher. Persistent actions guarded.
- Locker: inspect card-a/card-b/card-c adds seen; dials via {type:'dial',value:{index,direction}} allowed cardinal values. unlock requires all3 and west/north/east. take tape only after open; select tape use recorder loads; play heard/complete. Expose cards 09:40 flag east,09:45 flag south,09:50 flag west. Clues not answers.
- Pack: initial inventory cloth/box, inspect morning/forecast/ground; plan inside after3 sets safe=true. select cloth use box dries clean; pack notes/tape only after safe and clean, bad ball/flag rejected; close after both completes. ready means safe.
- Photo: inspect log/photo/voice; connect value {photo:'finish',wind:'north',rain:'dry',time:'10:20'} all correct completes; wrong leaves open. Use multi-card evidence UI.
- Clock interface ActivityClock.create(durationMs,saved,{now,onExpire}), methods start/pause/reset/unlimited/tick/snapshot/dispose. snapshot {remaining,running,unlimited,expired}. restore clamps and paused. start cannot restart expired; reset resets duration paused; unlimited clears expiry and running; tick uses monotonic injected now. Expire once; dispose prevents callbacks. Unit test paused gaps and exact expiry, invalid saved values, unlimited, disposed.
- [ ] Run both Node tests and self-review, report files and output. Do not commit unrelated working changes.

## Task 2: Visual playground and integration

Files: create playground-view.js/playground.css; modify chapter2.js,app.js,index.html,chapter2.test.js; create integration test. Generate new assets via built-in imagegen into assets/playground-*.png.

- [ ] Add failing integration test using real Chapter2.build for c2-fog/c2-wind/c2-locker/c2-schedule/c2-photo experiment playground; photo occurs after c2-night and before theft, branch graph reaches end.
- [ ] View interface PlaygroundView.mount(host,mode,done,saved,onSave): wrap pure state plus clock snapshot; shared one-listener delegated inputs, pause on modal/talk/visibility; clean timers/listeners on dispose.
- [ ] Use full raster field, SVG contour hotspots in image coordinate system and CSS only for interactive mechanics/diagrams. Separate locker/packing detail with opening lid, tape insertion, inventory tokens. No generated text in artwork. New field and covered desk art are required; original assets retained.
- [ ] Implement 2-way dialogue queue, optional scenery, fog lens wipe, key use/store goods, wind forecast regions + moving paper, dials/cards/tape, packing inventory, photo evidence matching. Provide click alternatives and labels.
- [ ] Connect scene modes: fog→existing fog-after, wind→wind-after, erased→locker→evidence, schedule→schedule-after. reassurance→shutter; face→night→photo→new proof scene→theft. Same ending.
- [ ] App bridge persists flags['playground-'+mode], maps old weather complete states to complete safely; replay clears both prefixes. Preview includes locker. Load scripts before app.
- [ ] Browser check full set of activity paths and common ending; mobile390×844 and desktop; incorrect/retry/unlimited/pause and save roundtrip. Run all tests. Document actual omissions explicitly, no deploy.

## Execution record

- Ruling: Continue current codex/chapter2-weather checkout because the user explicitly asked to resume this local game and it contains the uncommitted chapter2 dependency. Do not make a worktree missing those files. Existing unrelated directories remain untouched.
- Ruling: One state/clock worker while main integrates art/view; no simultaneous edits to shared files. Task interfaces above are binding.
- Preflight: Task1→Task2 state/action names are shared; use published API rather than replicate rules in UI. Task2 alone owns app/chapter2. Timer speed never determines evidence or ending.
