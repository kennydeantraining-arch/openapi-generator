const express = require('express');
const yaml = require('js-yaml');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const JAR = path.join(__dirname, 'vendor', 'openapi-generator-cli.jar');

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Curated generators shown in the UI. id = openapi-generator name.
const GENERATORS = [
  { id: 'typescript-fetch', label: 'TypeScript (fetch)' },
  { id: 'typescript-axios', label: 'TypeScript (axios)' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'go', label: 'Go' },
  { id: 'java', label: 'Java' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'csharp', label: 'C#' },
  { id: 'ruby', label: 'Ruby' },
  { id: 'php', label: 'PHP' },
  { id: 'rust', label: 'Rust' },
  { id: 'swift5', label: 'Swift 5' },
];

function parseSpec(text) {
  try {
    return JSON.parse(text);
  } catch {
    return yaml.load(text);
  }
}

function runJar(args, opts) {
  return new Promise((resolve) => {
    execFile('java', ['-jar', JAR, ...args], { timeout: 120000, ...opts },
      (err, stdout, stderr) => resolve({ code: err ? (err.code ?? 1) : 0, stdout, stderr }));
  });
}

function writeSpecToTemp(specText) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'specstudio-'));
  const isJson = specText.trimStart().startsWith('{');
  const file = path.join(dir, isJson ? 'spec.json' : 'spec.yaml');
  fs.writeFileSync(file, specText);
  return { dir, file };
}

app.get('/api/generators', (_req, res) => res.json(GENERATORS));

// Summarize the spec: title, endpoints, auth — powers the insight panel and snippets.
app.post('/api/analyze', (req, res) => {
  const { spec } = req.body || {};
  if (!spec) return res.status(400).json({ error: 'Missing spec' });
  let doc;
  try {
    doc = parseSpec(spec);
  } catch (e) {
    return res.status(400).json({ error: 'Could not parse spec: ' + e.message });
  }
  if (!doc || typeof doc !== 'object' || !doc.paths) {
    return res.status(400).json({ error: 'Not a valid OpenAPI document (no paths found).' });
  }
  const ops = [];
  for (const [p, item] of Object.entries(doc.paths)) {
    if (!item || typeof item !== 'object') continue;
    for (const method of ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']) {
      const op = item[method];
      if (!op) continue;
      ops.push({
        method: method.toUpperCase(),
        path: p,
        summary: op.summary || op.operationId || '',
        deprecated: !!op.deprecated,
        tags: op.tags || [],
        hasBody: !!op.requestBody,
        params: (op.parameters || item.parameters || []).map(pr => ({
          name: pr.name, in: pr.in, required: !!pr.required,
        })),
      });
    }
  }
  const security = Object.entries((doc.components && doc.components.securitySchemes) || {})
    .map(([name, s]) => ({ name, type: s.type, scheme: s.scheme, in: s.in }));
  res.json({
    title: (doc.info && doc.info.title) || 'Untitled API',
    version: (doc.info && doc.info.version) || '',
    description: (doc.info && doc.info.description) || '',
    openapi: doc.openapi || doc.swagger || '',
    servers: (doc.servers || []).map(s => s.url),
    schemas: Object.keys((doc.components && doc.components.schemas) || {}),
    security,
    operations: ops,
  });
});

app.post('/api/validate', async (req, res) => {
  const { spec } = req.body || {};
  if (!spec) return res.status(400).json({ error: 'Missing spec' });
  const { dir, file } = writeSpecToTemp(spec);
  try {
    const r = await runJar(['validate', '-i', file]);
    res.json({ valid: r.code === 0, output: (r.stdout + r.stderr).trim() });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

app.post('/api/generate', async (req, res) => {
  const { spec, generator } = req.body || {};
  if (!spec) return res.status(400).json({ error: 'Missing spec' });
  if (!GENERATORS.some(g => g.id === generator)) {
    return res.status(400).json({ error: 'Unknown generator: ' + generator });
  }
  const { dir, file } = writeSpecToTemp(spec);
  const outDir = path.join(dir, 'out');
  const cleanup = () => fs.rmSync(dir, { recursive: true, force: true });
  let streamed = false;
  try {
    const r = await runJar([
      'generate', '-i', file, '-g', generator, '-o', outDir,
      '--skip-validate-spec',
    ]);
    if (r.code !== 0 || !fs.existsSync(outDir)) {
      const tail = (r.stderr || r.stdout).split('\n').filter(Boolean).slice(-15).join('\n');
      return res.status(422).json({ error: 'Generation failed', output: tail });
    }
    const zipName = `sdk-${generator}-${crypto.randomBytes(4).toString('hex')}.zip`;
    const zipPath = path.join(dir, zipName);
    const zip = await new Promise((resolve) => {
      execFile('zip', ['-rq', zipPath, '.'], { cwd: outDir, timeout: 60000 },
        (err) => resolve(!err));
    });
    if (!zip) return res.status(500).json({ error: 'Failed to package SDK' });
    const fileCount = r.stdout.split('\n').filter(l => l.includes('writing file')).length;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);
    res.setHeader('X-SpecStudio-Files', String(fileCount));
    streamed = true;
    fs.createReadStream(zipPath).on('close', cleanup).pipe(res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    if (!streamed) cleanup();
  }
});

app.listen(PORT, () => console.log(`SpecStudio running at http://localhost:${PORT}`));
