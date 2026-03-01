// boot_check.js — paste contents into browser console to diagnose
// Or add <script src="js/boot_check.js"></script> as last script in index.html temporarily

console.group('=== LAURIE 2 BOOT DIAGNOSTIC ===');
const checks = {
  'C (constants)':   typeof C !== 'undefined',
  'Utils':           typeof Utils !== 'undefined',
  'Audio2':          typeof Audio2 !== 'undefined',
  'Maps':            typeof Maps !== 'undefined',
  'Player':          typeof Player !== 'undefined',
  'Enemies':         typeof Enemies !== 'undefined',
  'Projectiles':     typeof Projectiles !== 'undefined',
  'Pickups':         typeof Pickups !== 'undefined',
  'Renderer':        typeof Renderer !== 'undefined',
  'HUD':             typeof HUD !== 'undefined',
  'Screens':         typeof Screens !== 'undefined',
  'GameState':       typeof GameState !== 'undefined',
};

let allOk = true;
for (const [name, ok] of Object.entries(checks)) {
  console.log((ok ? '✅' : '❌') + ' ' + name);
  if (!ok) allOk = false;
}

console.log('');
console.log('Active screen divs:');
document.querySelectorAll('.screen').forEach(s => {
  console.log((s.classList.contains('active') ? '👁 VISIBLE' : '   hidden') + '  #' + s.id);
});

if (allOk) {
  console.log('');
  console.log('✅ All modules loaded. GameState.currentScreen = "' + GameState.currentScreen + '"');
} else {
  console.log('');
  console.log('❌ Missing modules above will cause boot failure.');
}
console.groupEnd();