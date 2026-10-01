var LS_ONBOARDED = 'coach_onboarded';
var LS_CHOICE = 'coach_checkin_choice';
var LS_SAFETY = 'coach_safety_seen';
var LS_INCOMPLETE = 'coach_incomplete_lesson';

function isOnboarded() { return localStorage.getItem(LS_ONBOARDED) === '1'; }
function getChoice() { return localStorage.getItem(LS_CHOICE) || ''; }
function hasIncomplete() { return localStorage.getItem(LS_INCOMPLETE) === '1'; }

window.startOnboarding = function () { location.hash = '#welcome'; };
window.choose = function (c) {
  localStorage.setItem(LS_CHOICE, c);
  location.hash = '#start';
};
window.finishOnboarding = function () {
  localStorage.setItem(LS_ONBOARDED, '1');
  localStorage.setItem(LS_SAFETY, '1');
  location.hash = '#home';
};
window.resetDemo = function () {
  localStorage.removeItem(LS_ONBOARDED);
  localStorage.removeItem(LS_CHOICE);
  localStorage.removeItem(LS_SAFETY);
  localStorage.removeItem(LS_INCOMPLETE);
  location.hash = '#welcome';
  render();
};
window.toggleIncomplete = function () {
  localStorage.setItem(LS_INCOMPLETE, hasIncomplete() ? '0' : '1');
  render();
};

function suggestionFor(choice) {
  if (choice === 'learn') return { route: 'learn', label: 'a short lesson on active listening' };
  if (choice === 'practice') return { route: 'practice', label: 'a role-play to practice' };
  return { route: 'reflect', label: 'the guidance tool for your real situation' };
}

var routes = {
  welcome: function () {
    return '<div class="card"><h2>Welcome</h2><p>This app helps students and early-career pros handle difficult conversations with empathy. Short lessons, role-play practice, and bounded guidance for real situations.</p><button class="btn" onclick="location.hash=\'#checkin\'">Start check-in</button></div>';
  },
  checkin: function () {
    return '<div class="card"><h2>Quick check-in — why are you here today?</h2><button class="btn" onclick="choose(\'learn\')">I want to learn</button><button class="btn" onclick="choose(\'practice\')">I want to practice</button><button class="btn" onclick="choose(\'situ\')">I have a real situation</button><p class="muted">First-time only. Returning users never see this.</p></div>';
  },
  start: function () {
    var s = suggestionFor(getChoice() || 'learn');
    return '<div class="card"><h2>Guided first action</h2><p>Based on your check-in, try ' + s.label + '.</p><button class="btn" onclick="location.hash=\'#' + s.route + '\'">Go now</button> <button class="btn secondary" onclick="location.hash=\'#safety\'">Next: safety notice</button></div>';
  },
  safety: function () {
    return '<div class="safety"><h2>Safety notice (one-time)</h2><p>This app is not a substitute for professional help in emergencies. If there is danger, abuse, self-harm, or a mental-health crisis, contact trusted people or emergency services.</p><p><a href="#safety">Resources link (placeholder)</a></p><button class="btn" onclick="finishOnboarding()">Got it — go to Home</button></div>';
  },
  home: function () {
    if (!isOnboarded()) {
      return '<div class="card"><h2>Welcome — new here?</h2><p>Take the 30-second guided start, or explore freely.</p><button class="btn" onclick="startOnboarding()">Start guided onboarding</button><p>Or jump in: <a href="#learn">Learn</a> · <a href="#practice">Practice</a> · <a href="#reflect">Reflect</a></p></div>';
    }
    var cont = hasIncomplete()
      ? '<p><button class="btn" onclick="location.hash=\'#learn\'">Continue lesson</button></p>'
      : '<p class="muted">No incomplete lesson — Continue hidden.</p>';
    return '<div class="card"><h2>Good to see you again. What would you like to work on today?</h2><p><b>Daily reflection (placeholder):</b> Someone misunderstood what you meant. What could you do before responding?</p>' + cont + '<p>Free choice: <a href="#learn">Learn</a> · <a href="#practice">Practice</a> · <a href="#reflect">Reflect</a> · <a href="#progress">Progress</a></p><p class="muted">Demo: incomplete=' + (hasIncomplete() ? '1' : '0') + ' <button class="btn secondary" onclick="toggleIncomplete()">Toggle incomplete</button> <button class="btn secondary" onclick="resetDemo()">Reset demo</button></p></div>';
  },
  learn: function () {
    return '<div class="card"><h2>Learn</h2><p>Short lessons placeholder (Phase 3).</p><p><a href="#home">Back home</a></p></div>';
  },
  practice: function () {
    return '<div class="card"><h2>Practice</h2><p>Role-play placeholder (Phase 4).</p><p><a href="#home">Back home</a></p></div>';
  },
  reflect: function () {
    return '<div class="card"><h2>Reflect</h2><p>Real-situation guidance placeholder (Phase 5).</p><p class="muted">Tone scaffold active, ' + window.COACH_SYSTEM.length + ' chars.</p></div>';
  },
  progress: function () {
    return '<div class="card"><h2>Progress</h2><p>Gentle counts only, no streaks/scores (Phase 6).</p></div>';
  }
};

function render() {
  var hash = (location.hash || '#home').replace('#', '');
  if (!routes[hash]) hash = 'home';
  document.getElementById('view').innerHTML = routes[hash]();
  var links = document.querySelectorAll('nav.tabs a');
  for (var i = 0; i < links.length; i++) {
    links[i].className = links[i].getAttribute('data-route') === hash ? 'active' : '';
  }
}
window.addEventListener('hashchange', render);
render();
