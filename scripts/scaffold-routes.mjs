// scripts/scaffold-routes.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.resolve(__dirname, '../server/src/routes');

const routeFiles = [
  'auth.routes.js',
  'me.routes.js',
  'geo.routes.js',
  'catalog.routes.js',
  'cart.routes.js',
  'orders.routes.js',
  'payments.routes.js',
  'reviews.routes.js',
  'support.routes.js',
  'assistant.routes.js',
  'seller.routes.js',
  'partner.routes.js',
  'ai.routes.js'
];

for (const file of routeFiles) {
  const fullPath = path.join(routesDir, file);
  if (!fs.existsSync(fullPath)) {
    const content = `// server/src/routes/${file}
import { Router } from 'express';

const router = Router();

export default router;
`;
    fs.writeFileSync(fullPath, content);
  }
}

console.log('Scaffolded route files.');
