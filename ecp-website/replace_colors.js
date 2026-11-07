const fs = require('fs');
let text = fs.readFileSync('index.html', 'utf8');

// Define specific targeted replacements
const replacements = [
  ['font-weight: 700; color: #fff;', 'font-weight: 700; color: var(--ink);'],
  ['font-size: 19px; color: #fff;', 'font-size: 19px; color: var(--ink);'],
  ['.svc-card h3 { font-size: 22px; margin-bottom: 12px; color: #fff;', '.svc-card h3 { font-size: 22px; margin-bottom: 12px; color: var(--ink);'],
  ['.process h2 { color: #fff; }', '.process h2 { color: var(--ink); }'],
  ['color: #fff;\n  margin-bottom: 16px;', 'color: var(--ink);\n  margin-bottom: 16px;'], // .hero-main h1
  ['position: relative; z-index: 2; color: #fff; font-size: 32px; font-family: "Outfit", sans-serif; font-weight: 700; margin: 0;', 'position: relative; z-index: 2; color: var(--ink); font-size: 32px; font-family: "Outfit", sans-serif; font-weight: 700; margin: 0;'],
  ['.stat-highlight p { font-size: 18px; line-height: 1.6; color: #fff; margin: 0; }', '.stat-highlight p { font-size: 18px; line-height: 1.6; color: var(--body); margin: 0; }'],
  ['text-transform: uppercase; letter-spacing: .1em; color: #fff; margin-top: 10px;', 'text-transform: uppercase; letter-spacing: .1em; color: var(--ink); margin-top: 10px;'],
  ['.spec h3 { margin-bottom: 16px; font-size: 22px; font-family: "Outfit", sans-serif; font-weight: 700; color: #fff; }', '.spec h3 { margin-bottom: 16px; font-size: 22px; font-family: "Outfit", sans-serif; font-weight: 700; color: var(--ink); }'],
  ['color: #fff; margin-bottom: 16px; letter-spacing: -0.02em;', 'color: var(--ink); margin-bottom: 16px; letter-spacing: -0.02em;'], // form-card h3
  ['text-transform: uppercase; letter-spacing: 0.1em; color: #fff; margin-bottom: 12px;', 'text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink); margin-bottom: 12px;'], // form-card label
  ['padding: 16px; font-family: "Outfit", sans-serif; font-size: 16px; color: #fff;', 'padding: 16px; font-family: "Outfit", sans-serif; font-size: 16px; color: var(--ink);'], // form-card input
  ['.cdetail .v { font-size: 15px; color: #fff; line-height: 1.6; }', '.cdetail .v { font-size: 15px; color: var(--ink); line-height: 1.6; }'],
  ['.cdetail .v a { color: #fff; text-decoration: none; }', '.cdetail .v a { color: var(--ink); text-decoration: none; }'],
  ['.askbox { background: var(--band); color: #fff; padding: 48px; border-radius: 12px; }', '.askbox { background: var(--band); color: var(--band-ink); padding: 48px; border-radius: 12px; }'],
  ['.askbox h3 { color: #fff; margin-bottom: 16px; font-family: "Outfit", sans-serif; font-size: 24px; }', '.askbox h3 { color: var(--band-ink); margin-bottom: 16px; font-family: "Outfit", sans-serif; font-size: 24px; }'],
  ['color: #fff; line-height: 1.1; margin-bottom: 8px;', 'color: var(--band-ink); line-height: 1.1; margin-bottom: 8px;'],
  ['font-size: 18px; color: #fff; margin-top: 16px;', 'font-size: 18px; color: var(--band-ink); margin-top: 16px;'],
  ['footer ul a:hover { color: #fff; }', 'footer ul a:hover { color: var(--band-ink); }'],
  ['.mobnav a.btn { font-size: 16px; margin-top: 16px; color: #fff; }', '.mobnav a.btn { font-size: 16px; margin-top: 16px; color: var(--paper); }']
];

for (const [search, replace] of replacements) {
  text = text.replace(search, replace);
}

fs.writeFileSync('index.html', text);
console.log('Replaced colors successfully!');
