// src/hooks/useGitOperations.js

import { useState } from 'react';
import {
  fetchFormSchemaFromRemote,
  fetchFormHTMLFromRemote,
  upsertGitFile
} from '../utils/github';
import { generateExportedHTML } from '../utils/exporters';

/* =========================================================================================
   Helpers to convert schema for the Builder UI (avoid .split crash on array options)
   ========================================================================================= */

function optionsArrayToCsv(opts) {
  if (!Array.isArray(opts)) return String(opts ?? '');
  const parts = [];
  for (const o of opts) {
    if (o == null) continue;
    if (typeof o === 'string') parts.push(o);
    else if (typeof o === 'object') {
      const lab = (o.label ?? o.text ?? o.value ?? '').toString().trim();
      if (lab) parts.push(lab);
    }
  }
  return parts.join(', ');
}

// recursively normalize a field object for the builder UI
function toBuilderField(el) {
  if (!el || typeof el !== 'object') return el;
  const copy = { ...el };
  if (Array.isArray(copy.options)) {
    copy.options = optionsArrayToCsv(copy.options);
  }
  for (const key of Object.keys(copy)) {
    const val = copy[key];
    if (Array.isArray(val)) {
      copy[key] = val.map(child => toBuilderField(child));
    } else if (val && typeof val === 'object' && typeof val.type === 'string') {
      copy[key] = toBuilderField(val);
    }
  }
  return copy;
}

function toBuilderShape(elements) {
  if (!Array.isArray(elements)) return [];
  return elements.map(toBuilderField);
}

/* =========================================================================================
   Sanitization + diagnostics (no UI changes)
   ========================================================================================= */

const ARRAY_KEYS_WHITELIST_KEEP_RAW = new Set(['options']); // arrays we do NOT treat as fields
const FIELDISH_ARRAY_NAME_HINT = /children|fields|steps|sections|rows|columns|groups|items|panels|blocks|tabs|cards|grid|list|accordions|pages|containers/i;
const RULES_ARRAY_NAME_HINT = /rules?|validations?|constraints?/i;

function isValidField(el) {
  return el && typeof el === 'object' && typeof el.type === 'string' && el.type.trim().length > 0;
}

function ensureId(el) {
  if (!el.id) el.id = 'id-' + Math.random().toString(36).slice(2, 10);
  return el;
}
function ensureStep(el) {
  const n = Number(el.step);
  el.step = Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  return el;
}
function ensureRequired(el) {
  if (typeof el.required !== 'boolean') el.required = false;
  return el;
}

// Minimal defaults for some common field types
function ensureTypeDefaults(el) {
  const t = (el.type || '').toLowerCase();
  if (t === 'input') {
    if (!el.inputType) el.inputType = 'text';
    if (!el.name) el.name = (el.id || '').replace(/^id-/, '') || 'input';
  } else if (t === 'textarea') {
    if (!el.name) el.name = (el.id || '').replace(/^id-/, '') || 'textarea';
  } else if (t === 'select') {
    if (!Array.isArray(el.options)) el.options = [];
    if (!el.name) el.name = (el.id || '').replace(/^id-/, '') || 'select';
  } else if (t === 'checkbox' || t === 'radio') {
    if (!el.name) el.name = (el.id || '').replace(/^id-/, '') || t;
  }
  return el;
}

function normalizeOptions(options, path, problems) {
  if (!options) return undefined;
  if (typeof options === 'string') {
    options = options.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(options)) {
    problems.push({ path, reason: 'options should be an array or CSV string; removing' });
    return undefined;
  }
  const normalized = [];
  options.forEach((opt, idx) => {
    const optPath = `${path}[${idx}]`;
    if (opt == null) {
      problems.push({ path: optPath, reason: 'option is null/undefined; dropping' });
      return;
    }
    if (typeof opt === 'string') {
      normalized.push({ label: opt, value: opt });
      return;
    }
    if (typeof opt === 'object') {
      const label = (opt.label ?? opt.text ?? opt.value ?? '').toString().trim();
      const value = (opt.value ?? label).toString().trim();
      if (!label) {
        problems.push({ path: optPath, reason: 'option missing label/text/value; dropping' });
        return;
      }
      normalized.push({ ...opt, label, value });
      return;
    }
    problems.push({ path: optPath, reason: `option has invalid type ${typeof opt}; dropping` });
  });
  return normalized.length ? normalized : undefined;
}

/** Normalize arrays that are not field lists (e.g., rules/validations) */
function normalizeRulesArray(arr, path, problems) {
  if (!Array.isArray(arr)) return undefined;
  const out = [];
  arr.forEach((rule, idx) => {
    const p = `${path}[${idx}]`;
    if (!rule) return problems.push({ path: p, reason: 'null/undefined rule dropped' });
    if (typeof rule === 'string') {
      out.push({ type: 'custom', name: rule });
      return;
    }
    if (typeof rule === 'object') {
      if (typeof rule.type !== 'string' || !rule.type) {
        out.push({ ...rule, type: 'custom', name: rule.name ?? 'rule' });
      } else {
        out.push(rule);
      }
      return;
    }
    problems.push({ path: p, reason: `invalid rule type ${typeof rule}; dropped` });
  });
  return out;
}

/** Sanitize an object that should be a field */
function sanitizeFieldObject(el, path, problems) {
  if (!isValidField(el)) {
    problems.push({ path, reason: 'missing or invalid "type"' });
    return null;
  }

  const copy = { ...el };
  ensureId(copy);
  ensureStep(copy);
  ensureRequired(copy);
  ensureTypeDefaults(copy);

  // options
  if ('options' in copy) {
    const norm = normalizeOptions(copy.options, `${path}.options`, problems);
    if (norm) copy.options = norm; else delete copy.options;
  }

  // walk properties
  for (const key of Object.keys(copy)) {
    const val = copy[key];

    if (Array.isArray(val)) {
      if (ARRAY_KEYS_WHITELIST_KEEP_RAW.has(key)) {
        copy[key] = val.filter(Boolean);
        continue;
      }

      const treatAsFields = FIELDISH_ARRAY_NAME_HINT.test(key) ||
        val.some(v => v && typeof v === 'object' && typeof v.type === 'string');

      if (treatAsFields) {
        const next = [];
        val.forEach((child, idx) => {
          if (!child || typeof child !== 'object') {
            problems.push({ path: `${path}.${key}[${idx}]`, reason: 'non-object in field array; dropped' });
            return;
          }
          const ok = sanitizeFieldObject(child, `${path}.${key}[${idx}]`, problems);
          if (ok) next.push(ok);
          else problems.push({ path: `${path}.${key}[${idx}]`, reason: 'invalid field dropped' });
        });
        copy[key] = next;
        continue;
      }

      if (RULES_ARRAY_NAME_HINT.test(key)) {
        copy[key] = normalizeRulesArray(val, `${path}.${key}`, problems) ?? [];
        continue;
      }

      copy[key] = val.filter(Boolean);
    } else if (val && typeof val === 'object') {
      if (typeof val.type === 'string') {
        const ok = sanitizeFieldObject(val, `${path}.${key}`, problems);
        if (ok) copy[key] = ok;
        else {
          problems.push({ path: `${path}.${key}`, reason: 'invalid nested field dropped' });
          delete copy[key];
        }
      }
    }
  }

  return copy;
}

function sanitizeSchema(elements) {
  const problems = [];
  if (!Array.isArray(elements)) {
    return { elements: [], problems: [{ path: 'root', reason: 'formElements is not an array' }] };
  }
  const cleaned = [];
  elements.forEach((el, idx) => {
    const ok = sanitizeFieldObject(el, `formElements[${idx}]`, problems);
    if (ok) cleaned.push(ok);
  });
  return { elements: cleaned, problems };
}

/* =========================================================================================
   Exporter diagnostics + fallback exporter
   ========================================================================================= */

function subsetFails(elements, style, integration) {
  try {
    generateExportedHTML(elements, style, integration);
    return false;
  } catch {
    return true;
  }
}

/** Returns { indices, sample } where indices are positions in original array that cause failure */
function findFailingSubset(elements, style, integration, log) {
  const idxs = elements.map((_, i) => i);

  for (let i = 0; i < elements.length; i++) {
    if (subsetFails([elements[i]], style, integration)) {
      log(`❗ Exporter fails on single element at index ${i}`);
      return { indices: [i], sample: elements[i] };
    }
  }

  let cur = idxs.slice();
  let curElems = elements.slice();

  if (!subsetFails(curElems, style, integration)) return { indices: [], sample: null };

  while (cur.length > 1) {
    const mid = Math.floor(cur.length / 2);
    const leftIdxs = cur.slice(0, mid);
    const rightIdxs = cur.slice(mid);

    const leftElems = leftIdxs.map(i => elements[i]);
    const rightElems = rightIdxs.map(i => elements[i]);

    const leftFails = subsetFails(leftElems, style, integration);
    const rightFails = subsetFails(rightElems, style, integration);

    if (leftFails) {
      cur = leftIdxs; curElems = leftElems;
    } else if (rightFails) {
      cur = rightIdxs; curElems = rightElems;
    } else {
      for (let i = 0; i < cur.length; i++) {
        for (let j = i + 1; j < cur.length; j++) {
          const pairIdxs = [cur[i], cur[j]];
          const pair = pairIdxs.map(k => elements[k]);
          if (subsetFails(pair, style, integration)) {
            return { indices: pairIdxs, sample: pair };
          }
        }
      }
      return { indices: cur, sample: curElems };
    }
  }

  return { indices: cur, sample: curElems[0] };
}

function escapeHtml(s = '') {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function cssVarsFromStyle(style = {}) {
  const s = style || {};
  const vars = {
    '--bg': s.backgroundColor || '#ffffff',
    '--fg': s.textColor || '#111827',
    '--accent': s.primaryColor || '#6366f1',
    '--border': s.borderColor || '#e5e7eb',
    '--radius': s.borderRadius || '8px',
    '--pad': s.padding || '12px',
    '--font': s.fontFamily || 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
  };
  return Object.entries(vars).map(([k,v]) => `${k}:${v}`).join(';');
}

function renderField(el) {
  const label = escapeHtml(el.label ?? '');
  const name = escapeHtml(el.name ?? el.id ?? 'field');
  const required = el.required ? ' required' : '';
  const placeholder = el.placeholder ? ` placeholder="${escapeHtml(el.placeholder)}"` : '';

  const t = (el.type || '').toLowerCase();
  if (t === 'input') {
    const it = escapeHtml(el.inputType || 'text');
    return `<label class="f-label">${label}</label><input class="f-input" type="${it}" name="${name}" id="${escapeHtml(el.id)}"${placeholder}${required} />`;
  }
  if (t === 'textarea') {
    return `<label class="f-label">${label}</label><textarea class="f-input" name="${name}" id="${escapeHtml(el.id)}"${placeholder}${required}></textarea>`;
  }
  if (t === 'select') {
    const opts = Array.isArray(el.options) ? el.options : [];
    const optionsHtml = opts.map(o => {
      const lab = escapeHtml(o.label ?? o.value ?? '');
      const val = escapeHtml(o.value ?? lab);
      return `<option value="${val}">${lab}</option>`;
    }).join('');
    return `<label class="f-label">${label}</label><select class="f-input" name="${name}" id="${escapeHtml(el.id)}"${required}>${optionsHtml}</select>`;
  }
  if (t === 'checkbox') {
    return `<label class="f-check"><input type="checkbox" name="${name}" id="${escapeHtml(el.id)}"${required}/> ${label}</label>`;
  }
  if (t === 'radio') {
    const group = escapeHtml(el.name || name);
    const opts = Array.isArray(el.options) ? el.options : [];
    const radios = opts.map((o,i)=> {
      const val = escapeHtml(o.value ?? o.label ?? `opt${i}`);
      const lab = escapeHtml(o.label ?? val);
      return `<label class="f-check"><input type="radio" name="${group}" value="${val}" /> ${lab}</label>`;
    }).join('');
    return `<div class="f-group"><div class="f-label">${label}</div>${radios}</div>`;
  }
  // generic fallback
  return `<div class="f-group"><div class="f-label">${label || name}</div></div>`;
}

function generateMinimalHTML(elements, style) {
  const vars = cssVarsFromStyle(style);
  const fields = elements.map(el => `<div class="f-group">${renderField(el)}</div>`).join('\n');
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Form</title>
<style>
:root{${vars}}
body{background:var(--bg);color:var(--fg);font-family:var(--font);padding:24px;}
form{max-width:760px;margin:0 auto;background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:24px;box-shadow:0 6px 24px rgba(0,0,0,.06);}
.f-group{margin-bottom:14px;}
.f-label{display:block;font-weight:600;margin-bottom:6px;}
.f-input{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;outline:none}
.f-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,.15)}
.f-check{display:flex;gap:8px;align-items:center;margin-bottom:6px;}
button{background:var(--accent);color:#fff;border:0;border-radius:10px;padding:10px 16px;font-weight:600;cursor:pointer}
button:disabled{opacity:.6;cursor:not-allowed}
</style>
</head>
<body>
<form>${fields}
  <div style="margin-top:16px"><button type="submit">Submit</button></div>
</form>
</body>
</html>`;
}

/* =========================================================================================
   Hook
   ========================================================================================= */

export function useGitOperations(
  githubToken,
  formElements,
  formStyle,
  setFormElements,
  setFormStyle,
  setPulledHTML,
  pushElems
) {
  const [gitRemoteURL, setGitRemoteURL] = useState('');
  const [repoExists, setRepoExists] = useState(false);
  const [gitLog, setGitLog] = useState('');
  const [commitMessage, setCommitMessage] = useState('');

  const log = (msg) => setGitLog((prev) => prev + msg + '\n');

  const initRepo = () => {
    if (!gitRemoteURL.trim()) return log('❌ Provide a Remote URL first.');
    setRepoExists(true);
    log(`✔️ Initialized repository at ${gitRemoteURL}`);
  };

  const cloneRepo = async () => {
    if (!gitRemoteURL) return log('❌ Remote URL missing.');
    if (!githubToken) return log('❌ Missing GitHub token.');
    log('> Cloning schema from remote…');
    try {
      const branch = 'main';
      const schema = await fetchFormSchemaFromRemote(
        gitRemoteURL,
        branch,
        githubToken
      );
      if (schema?.formElements && schema?.formStyle) {
        const builderElems = toBuilderShape(schema.formElements); // convert for UI
        setFormElements(builderElems);
        setFormStyle(schema.formStyle);
        setRepoExists(true);
        pushElems(builderElems);
        log('✔️ Schema loaded into builder.');
      } else {
        log('⚠️ No schema found.');
      }
    } catch (err) {
      log(`❌ Clone failed: ${err.message}`);
    }
  };

  const commitAndPush = async (messageOverride) => {
    if (!gitRemoteURL) return log('❌ Remote URL missing.');
    if (!githubToken) return log('❌ Missing GitHub token.');

    let msg =
      (typeof messageOverride === 'string' && messageOverride.trim()) ||
      (typeof commitMessage === 'string' && commitMessage.trim()) ||
      '';

    if (!msg) {
      try {
        msg =
          window.prompt(
            'Enter commit message',
            'Update form builder artifacts'
          )?.trim() || '';
      } catch (_) {}
    }
    if (!msg) return log('❌ Commit cancelled: no message provided.');

    log(`> Pushing form.html & form-schema.json…\n  • Commit message: "${msg}"`);

    try {
      // Sanitize and diagnose deeply (handles nested arrays/rules)
      const { elements: safeElements, problems } = sanitizeSchema(formElements || []);
      const safeStyle = formStyle || {};
      const integration = (formStyle && formStyle.integrationConfig) || { type: 'none' };

      if (problems.length) {
        log('⚠️ Schema issues found (will skip/normalize invalid items):');
        problems.slice(0, 10).forEach(p => log(`   - ${p.path}: ${p.reason}`));
        if (problems.length > 10) log(`   - …and ${problems.length - 10} more`);
      }
      if (!safeElements.length) {
        return log('❌ Cannot push: no valid form elements remain after sanitization.');
      }

      let html;
      try {
        // Try primary exporter
        html = generateExportedHTML(safeElements, safeStyle, integration);
      } catch (e) {
        log(`❌ Export failed: ${e?.message || e}`);

        // Identify offending element(s)
        try {
          const { indices, sample } = findFailingSubset(safeElements, safeStyle, integration, log);
          if (indices.length) {
            log(`🧭 Minimal failing indices: [${indices.join(', ')}]`);
            const sampleToShow = Array.isArray(sample) ? sample[0] : sample;
            log('🧪 Failing sample preview (first element of subset):');
            log(JSON.stringify(sampleToShow, null, 2).slice(0, 1200));
          } else {
            log('ℹ️ Could not isolate a failing subset (unexpected).');
          }
        } catch (isoErr) {
          log(`⚠️ Isolation step error: ${isoErr?.message || isoErr}`);
        }

        // Fallback exporter: generate minimal but valid HTML so push can proceed
        log('➡️ Using fallback HTML exporter.');
        html = generateMinimalHTML(safeElements, safeStyle);
      }

      const json = JSON.stringify(
        { formElements: safeElements, formStyle: safeStyle },
        null,
        2
      );

      await upsertGitFile(gitRemoteURL, 'form.html', html, githubToken, msg);
      log('  • form.html pushed.');

      await upsertGitFile(
        gitRemoteURL,
        'form-schema.json',
        json,
        githubToken,
        msg
      );
      log('  • form-schema.json pushed.');

      log('✔️ Commit & push successful.');
      setRepoExists(true);

      // Clear commit message after success so ephemeral field hides next time
      try { setCommitMessage(''); } catch {}
    } catch (err) {
      log(`❌ Push failed: ${err.message}`);
    }
  };

  const pullImport = async () => {
    if (!repoExists) return log('❌ No repo. Initialize or clone first.');
    if (!githubToken) return log('❌ Missing GitHub token.');
    try {
      const branch = 'main';
      log('> Pulling schema…');
      const schema = await fetchFormSchemaFromRemote(
        gitRemoteURL,
        branch,
        githubToken
      );
      if (schema?.formElements && schema?.formStyle) {
        const builderElems = toBuilderShape(schema.formElements); // convert for UI
        setFormElements(builderElems);
        setFormStyle(schema.formStyle);
        log('✔️ Schema updated.');
      } else {
        log('⚠️ No schema found.');
      }
      log('> Pulling HTML…');
      const html = await fetchFormHTMLFromRemote(
        gitRemoteURL,
        branch,
        githubToken
      );
      if (html) {
        setPulledHTML(html);
        log('✔️ form.html loaded for preview.');
      } else {
        log('⚠️ No form.html found.');
      }
    } catch (err) {
      log(`❌ Pull failed: ${err.message}`);
    }
  };

  const clearGit = () => {
    setRepoExists(false);
    setPulledHTML('');
    log('✔️ Git data cleared.');
  };

  return {
    gitRemoteURL,
    setGitRemoteURL,
    repoExists,
    gitLog,
    initRepo,
    cloneRepo,
    commitAndPush,
    pullImport,
    clearGit,
    commitMessage,
    setCommitMessage
  };
}
