var routes = {
  home: '<div class="card"><h2>Good to see you again. What would you like to work on today?</h2><p><b>Daily reflection (placeholder):</b> Someone misunderstood what you meant. What could you do before responding?</p><p>Learn · Practice · Reflect</p></div>',
  learn: '<div class="card"><h2>Learn</h2><p>Short lessons placeholder (Phase 3). Each: question, idea, example, optional practice.</p></div>',
  practice: '<div class="card"><h2>Practice</h2><p>Role-play placeholder (Phase 4). 7 starter scenarios + describe-your-own.</p></div>',
  reflect: '<div class="card"><h2>Reflect</h2><p>Real-situation guidance placeholder (Phase 5). Strict 3-part shape.</p><p class="muted" id="toneLen"></p></div>',
  progress: '<div class="card"><h2>Progress</h2><p>Gentle counts only, no streaks/scores (Phase 6).</p></div>'
};

function render() {
  var hash = (location.hash || '#home').replace('#', '');
  if (!routes[hash]) hash = 'home';
  document.getElementById('view').innerHTML = routes[hash];
  var links = document.querySelectorAll('nav.tabs a');
  for (var i = 0; i < links.length; i++) {
    links[i].className = links[i].getAttribute('data-route') === hash ? 'active' : '';
  }
  var t = document.getElementById('toneLen');
  if (t) t.textContent = 'Tone scaffold active, ' + window.COACH_SYSTEM.length + ' chars.';
}
window.addEventListener('hashchange', render);
render();
