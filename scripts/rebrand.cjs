const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../src');

const replacements = [
  ['Welcome to Vendora,', 'Welcome to TradeHub,'],
  ['Create your Vendora identity.', 'Create your TradeHub identity.'],
  ['on the Vendora network.', 'on the TradeHub network.'],
  ['Vendora Marketplace. All rights reserved.', 'TradeHub Marketplace. All rights reserved.'],
  ['Selling on Vendora?', 'Selling on TradeHub?'],
  ['on the Vendora platform.', 'on the TradeHub platform.'],
  ['place an order on Vendora?', 'place an order on TradeHub?'],
  ['become a seller on Vendora?', 'become a seller on TradeHub?'],
  ['shopping on Vendora.', 'shopping on TradeHub.'],
  ['Vendora cloud engine.', 'TradeHub cloud engine.'],
  ['the Vendora marketplace platform', 'the TradeHub marketplace platform'],
  ['notify Vendora immediately', 'notify TradeHub immediately'],
  ['products on Vendora must', 'products on TradeHub must'],
  ['use of Vendora.', 'use of TradeHub.'],
  ['purchase from Vendora!', 'purchase from TradeHub!'],
  ["brand || 'Vendora'", "brand || 'TradeHub'"],
  ["brand: 'Vendora'", "brand: 'TradeHub'"],
  ["|| 'Vendora Store'", "|| 'TradeHub Store'"],
  ["|| 'Vendora'", "|| 'TradeHub'"],
  ["siteName || 'Vendora'", "siteName || 'TradeHub'"],
  ['Vendora ecosystem', 'TradeHub ecosystem'],
  ['Vendora Blog &amp; Press', 'TradeHub Blog &amp; Press'],
  ['Vendora Blog & Press', 'TradeHub Blog & Press'],
  ['Vendora Team', 'TradeHub Team'],
  ['Vendora continues to invest', 'TradeHub continues to invest'],
  ['Vendora Crosses', 'TradeHub Crosses'],
  ['Vendora has officially', 'TradeHub has officially'],
  ['When we launched Vendora,', 'When we launched TradeHub,'],
  ['All Vendora merchants', 'All TradeHub merchants'],
  ["joining Vendora's multi-vendor", "joining TradeHub's multi-vendor"],
  ['relying on Vendora to handle', 'relying on TradeHub to handle'],
  ['Vendora Partner Ecosystem', 'TradeHub Partner Ecosystem'],
  ['Vendora today announced', 'TradeHub today announced'],
  ['Vendora-managed operations', 'TradeHub-managed operations'],
  ['e.g. Vendora', 'e.g. TradeHub'],
  ['About Vendora', 'About TradeHub'],
  ['Vendora was founded', 'TradeHub was founded'],
  // emails
  ['admin@vendora.store', 'admin@tradehub.store'],
  ['buyer@vendora.store', 'buyer@tradehub.store'],
  ['admin@vendora.com', 'admin@tradehub.com'],
  ['privacy@vendora.store', 'privacy@tradehub.store'],
  ['support@vendora.store', 'support@tradehub.store'],
  // Remaining bare Vendora (not localStorage keys, not brand-in-code)
  ['\n              Vendora\n', '\n              TradeHub\n'],
  ['>Vendora<', '>TradeHub<'],
  // Register.tsx specific
  ['>Vendora', '>TradeHub'],
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) files.push(full);
  }
  return files;
}

const files = walk(SRC);
let changed = 0;

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  for (const [from, to] of replacements) {
    while (content.includes(from)) {
      content = content.split(from).join(to);
    }
  }
  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated:', path.relative(SRC, f));
    changed++;
  }
}
console.log(`\nDone. ${changed} file(s) updated.`);
