const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

const dbUrl = process.env.DATABASE_URL || '';
let provider = 'sqlite';

if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  provider = 'postgresql';
}

const startIdx = schemaContent.indexOf('datasource db {');
if (startIdx !== -1) {
  const endIdx = schemaContent.indexOf('}', startIdx);
  if (endIdx !== -1) {
    const datasourceBlock = schemaContent.substring(startIdx, endIdx + 1);
    const updatedBlock = datasourceBlock.replace(/(provider\s*=\s*")([^"]+)(")/, `$1${provider}$3`);
    schemaContent = schemaContent.substring(0, startIdx) + updatedBlock + schemaContent.substring(endIdx + 1);
    fs.writeFileSync(schemaPath, schemaContent, 'utf8');
    console.log(`[Prisma Database Switcher] Set schema.prisma provider to '${provider}'`);
  }
} else {
  console.error('[Prisma Database Switcher] Could not find datasource db block in schema.prisma');
}
