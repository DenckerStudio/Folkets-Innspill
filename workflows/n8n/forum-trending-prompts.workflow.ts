/**
 * Folkets Stemme – Forum trending prompts
 * RSS + SearXNG → Ollama → forum_prompts
 *
 * Live: https://n8n.heyklever.app/workflow/MloIdsnX7FozM4dv
 * Webhook: folkets-forum-prompts
 */
import {
  workflow,
  node,
  trigger,
  sticky,
  newCredential,
  languageModel,
  ifElse,
  expr,
} from '@n8n/workflow-sdk';

const PROMPT_SYSTEM = `Du er politisk redaktør for «Folkets Stemme» (norsk borgerdebatt).

INPUT: Nummererte saker [0], [1], … – kun disse titlene/lenkene finnes.

Lag 3–5 avstemningsspørsmål. OBLIGATORISK JSON per spørsmål:
- question: kort, konkret JA/NEI (maks 120 tegn). Start med «Støtter du», «Bør Norge», «Skal» eller «Er du enig i at».
- source_indices: tall-array med 1–2 indekser fra listen som spørsmålet bygger på (PÅKREVD).
- topic_tags: 1–3 norske stikkord.
- sensitivity: "low" eller "high" (high: krig, vold, kongehus, alvorlige personskandaler).

FORBUDT:
- «Bør det avstemmes om …», «Bør staten gjøre mer …», vage spørsmål uten konkret politisk handling.
- Sport/kjendis uten politisk vinkel.
- options-felt (ikke inkluder alternativer).
- Oppfinne saker som ikke står i listen.

GODE eksempler (med source_indices):
- question: «Støtter du nasjonalt forbud mot russelasere?», source_indices: [1]
- question: «Bør Norge stramme regler for KI-videoer i valgkamp?», source_indices: [5]

Svar med ett JSON-objekt, ingen markdown, ingen forklaring, ikke flere overskrifter:
{"prompts":[{"question":"…","source_indices":[0],"topic_tags":["…"],"sensitivity":"low"}]}`;

const FETCH_RSS_JS = `const settings = $input.first()?.json || {};
const feeds = [
  { outlet: 'VG', url: 'https://www.vg.no/rss/feed/' },
  { outlet: 'Dagbladet', url: 'https://www.dagbladet.no/?lab_viewport=rss' },
  { outlet: 'NRK', url: 'https://www.nrk.no/toppsaker.rss' },
  { outlet: 'Aftenposten', url: 'https://www.aftenposten.no/rss' },
];

function decodeXml(value) {
  return String(value ?? '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>/g, '$1').trim();
}

function extractMedia(block) {
  const pick = (re) => decodeXml(String(block).match(re)?.[1] || '');
  const encUrl = pick(/<enclosure[^>]+url=["']([^"']+)["']/i);
  const encType = pick(/<enclosure[^>]+type=["']([^"']+)["']/i).toLowerCase();
  const mediaUrl = pick(/<media:content[^>]+url=["']([^"']+)["']/i) || pick(/<media:content[^>]*url=["']([^"']+)["']/i);
  const thumb = pick(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
  let imageUrl = thumb || null;
  let videoUrl = null;
  const candidate = mediaUrl || encUrl;
  if (candidate) {
    if (encType.startsWith('video') || /\\/video\\//i.test(candidate)) videoUrl = candidate;
    else if (!imageUrl) imageUrl = candidate;
  }
  return { imageUrl, videoUrl };
}

function parseRssItems(xml, outlet) {
  const items = [];
  for (const block of (String(xml).match(/<item[\\s\\S]*?<\\/item>/gi) || []).slice(0, 15)) {
    const title = decodeXml(block.match(/<title(?:\\s[^>]*)?>([\\s\\S]*?)<\\/title>/i)?.[1]);
    const url = decodeXml(block.match(/<link(?:\\s[^>]*)?>([\\s\\S]*?)<\\/link>/i)?.[1]);
    const pubDate = decodeXml(block.match(/<pubDate>([\\s\\S]*?)<\\/pubDate>/i)?.[1]) || null;
    if (title && url) {
      const media = extractMedia(block);
      items.push({ title, url, link: url, outlet, publishedAt: pubDate, ...media });
    }
  }
  return items;
}

const rssHeadlines = [];
const seen = new Set();
const fetched = await Promise.all(
  feeds.map(async (feed) => {
    try {
      const xml = await this.helpers.httpRequest({ method: 'GET', url: feed.url, timeout: 8000 });
      return parseRssItems(xml, feed.outlet);
    } catch (_) {
      return [];
    }
  })
);
for (const items of fetched) {
  for (const item of items) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    rssHeadlines.push(item);
  }
}

return [{ json: { rssHeadlines, rssCount: rssHeadlines.length, searxngBaseUrl: settings.searxngBaseUrl, batchLimit: settings.batchLimit } }];`;

const COLLECT_HEADLINES_JS = `const input = $input.first()?.json || {};
const rssHeadlines = Array.isArray(input.rssHeadlines) ? input.rssHeadlines : [];
const baseUrl = input.searxngBaseUrl || 'https://searxng.heyklever.app';

function outletFromUrl(url) {
  if (!url) return 'Ukjent';
  if (url.includes('vg.no')) return 'VG';
  if (url.includes('dagbladet.no')) return 'Dagbladet';
  if (url.includes('nrk.no')) return 'NRK';
  if (url.includes('aftenposten.no')) return 'Aftenposten';
  return 'Nyhet';
}

function isGenericListing(url) {
  const u = String(url).toLowerCase();
  if (/tv\\.nrk\\.no|radio\\.nrk\\.no/.test(u)) return true;
  if (/\\/politikk\\/?$/.test(u) || /\\/valg\\/\\d+\\/resultat/.test(u)) return true;
  if (/\\/nyheter\\/norsk-politikk/.test(u)) return true;
  if (/\\/sport\\//.test(u) && !/politi|lov|forbud|regjering/.test(u)) return true;
  return false;
}

function isLikelyArticle(url, title) {
  if (!url || !title || title.length < 8) return false;
  if (!/^https?:\\/\\//i.test(url)) return false;
  if (/\\/(tag)\\//i.test(url)) return false;
  if (isGenericListing(url)) return false;
  return true;
}

function politicsScore(title) {
  const t = String(title).toLowerCase();
  const boost = /(storting|regjering|minister|lov|lovforslag|budsjett|valg|skatt|forsvar|nato|eu |politi|domstol|klima|russ|russe|immigrasjon|helse|utdanning|kommune|statsbudsjett|epstein|krig|ukraina|gaza|terror|skole|bolig|strøm|olje|korrupsjon|dsa|høyesterett)/i;
  const noise = /(mesterliga|champions league|håndball|ishockey|everest|monty python|frimerke|kjendis|rampelys|skjønnhet|fotball|rbk|carlsen|soft glam)/i;
  let s = 0;
  if (boost.test(t)) s += 3;
  if (noise.test(t)) s -= 3;
  return s;
}

const items = [...rssHeadlines];
try {
  const res = await this.helpers.httpRequest({
    method: 'GET',
    url: baseUrl + '/search?q=site:nrk.no+OR+site:vg.no+OR+site:aftenposten.no+politikk+OR+regjering+OR+stortinget&format=json&language=nb-NO',
    timeout: 8000,
  });
  for (const r of (res.results || []).slice(0, 8)) {
    if (r.title && r.url) items.push({ title: r.title, url: r.url, link: r.url, outlet: outletFromUrl(r.url), imageUrl: r.img_src || r.thumbnail || null, videoUrl: null });
  }
} catch (_) {}

const seen = new Set();
const headlines = [];
for (const item of items) {
  const title = String(item.title || '').trim();
  const url = String(item.url || item.link || '').trim();
  const outlet = item.outlet || outletFromUrl(url);
  if (!isLikelyArticle(url, title) || seen.has(url)) continue;
  seen.add(url);
  headlines.push({
    title,
    url,
    outlet,
    publishedAt: item.publishedAt || item.pubDate || null,
    imageUrl: item.imageUrl || null,
    videoUrl: item.videoUrl || null,
    politicsScore: politicsScore(title),
  });
}

headlines.sort((a, b) => (b.politicsScore || 0) - (a.politicsScore || 0));
let trimmed = headlines.filter((h) => (h.politicsScore || 0) >= 1).slice(0, 12);
if (trimmed.length < 6) trimmed = headlines.slice(0, 10);
trimmed = trimmed.map(({ politicsScore: _ps, ...rest }) => rest);

return [{ json: { headlines: trimmed, headlineCount: trimmed.length, batchLimit: input.batchLimit } }];`;

const BUILD_AGENT_INPUT_JS = `const headlines = $json.headlines || [];
if (!headlines.length) {
  return [{ json: { headlines: [], headlinesText: '', skipAgent: true, headlineCount: 0 } }];
}
const text = headlines.map((h, i) =>
  '[' + i + '] ' + h.title + ' (' + h.outlet + ')\\n    ' + h.url
).join('\\n');
const footer = '\\n\\n---\\nListen over. Generer 3–5 avstemningsspørsmål som ETT JSON-objekt med prompts-array. Ikke skriv flere [n]-linjer eller overskrifter.';
return [{ json: { headlines, headlinesText: (text + footer).slice(0, 5000), skipAgent: false, headlineCount: headlines.length } }];`;

const MODERATION_ROUTE_JS = `const item = $input.first()?.json || {};
let out = item.output ?? item;

function stripCodeFence(text) {
  let t = String(text).trim();
  const fence = '\u0060\u0060\u0060';
  const jsonTag = fence + 'json';
  let i = t.toLowerCase().indexOf(jsonTag);
  if (i >= 0) t = t.slice(i + jsonTag.length);
  i = t.indexOf(fence);
  if (i >= 0) t = t.slice(0, i);
  return t.trim();
}

function tryParseJson(raw) {
  if (!raw) return null;
  const s = stripCodeFence(raw);
  try { return JSON.parse(s); } catch (_) {}
  const start = s.indexOf('{"prompts"');
  const alt = start >= 0 ? start : s.indexOf('{');
  if (alt >= 0) {
    const slice = s.slice(alt);
    try { return JSON.parse(slice); } catch (_) {
      const end = slice.lastIndexOf('}');
      if (end > 0) {
        try { return JSON.parse(slice.slice(0, end + 1)); } catch (_) {}
      }
    }
  }
  return null;
}

if (typeof out === 'string') out = tryParseJson(out) || { prompts: [] };
if (out && typeof out.output === 'string') {
  out = tryParseJson(out.output) || tryParseJson(out) || { prompts: [] };
}

let prompts = Array.isArray(out.prompts) ? out.prompts : [];
prompts = prompts.filter((p) => p && typeof p === 'object' && typeof p.question === 'string');
const headlines = $('Build agent input').first()?.json?.headlines || [];

function fallbackPrompts(headlines) {
  const out = [];
  const seen = new Set();
  for (let i = 0; i < headlines.length && out.length < 5; i++) {
    const title = String(headlines[i].title || '');
    const t = title.toLowerCase();
    let question = null;
    let tags = [];
    if (/laser|russe/.test(t)) {
      question = 'Støtter du nasjonalt forbud mot lasere i russefeiringen?';
      tags = ['laser', 'russe'];
    } else if (/ki-video|ki-videoer|deepfake/.test(t)) {
      question = 'Bør Norge forby KI-genererte krigsvideoer i valgkamp?';
      tags = ['ki', 'valg'];
    } else if (/regjering|støre|ap-regjering/.test(t)) {
      question = 'Er du enig i at regjeringen bør styrkes i mediepolitikken?';
      tags = ['regjering', 'medier'];
    } else if (/politiet.*skutt|skjøt person/.test(t)) {
      question = 'Støtter du at politiet skal kunne bruke skarplader våpen ved trusler?';
      tags = ['politi', 'våpen'];
    } else if (/eksplosjon|brannskad/.test(t)) {
      continue;
    } else if (/strømpris/.test(t)) {
      continue;
    }
    if (question) {
      const key = question.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ question, source_indices: [i], topic_tags: tags, sensitivity: 'low' });
    }
  }
  return out;
}

if (!prompts.length) prompts = fallbackPrompts(headlines);
const batchLimit = Math.max(1, Math.min(10, Number($('Backfill settings').first()?.json?.batchLimit ?? 5) || 5));
const blocked = /(porn|nazi|hitler|jævla neger)/i;
const rejectQuestion = /bør det avstemmes|bør staten gjøre mer|bør det være nødvendig|forhindre brannskader i offentlige|antallet strømprisområder|olympiad|bronsemedalj|mesterliga|champions league|monty python|kultur og kreativ|forskning og utvikling i teknologiske|støtte førstehjelp i tilfelle|i norske byer bli forbudt for å forhindre skader|hva er den største|største utfordringen/i;
const seenQuestions = new Set();
const results = [];

function norm(q) {
  return String(q || '').toLowerCase().replace(/\\s+/g, ' ').trim();
}

function inferSourceIndex(question, headlines) {
  const q = norm(question);
  let bestIdx = -1;
  let best = 0;
  for (let i = 0; i < headlines.length; i++) {
    const t = norm(headlines[i].title || '');
    let score = 0;
    for (const w of q.split(/\\s+/).filter((x) => x.length > 4)) {
      if (t.includes(w)) score += 2;
    }
    for (const pw of ['laser', 'russ', 'russe', 'strøm', 'skudd', 'politi', 'ukraina', 'krig', 'ki', 'regjering', 'storting', 'forbud', 'dsa', 'epstein']) {
      if (q.includes(pw) && t.includes(pw)) score += 6;
    }
    if (score > best) { best = score; bestIdx = i; }
  }
  return best >= 4 ? bestIdx : -1;
}

function pickSources(p, headlines) {
  let indices = Array.isArray(p.source_indices) ? p.source_indices : [];
  if (!indices.length && typeof p.source_headline_index === 'number') indices = [p.source_headline_index];
  if (!indices.length) {
    const inferred = inferSourceIndex(p.question, headlines);
    if (inferred >= 0) indices = [inferred];
  }
  const out = [];
  for (const raw of indices) {
    const h = headlines[Number(raw)];
    if (!h) continue;
    out.push({
      title: h.title,
      url: h.url,
      outlet: h.outlet,
      imageUrl: h.imageUrl || null,
      videoUrl: h.videoUrl || null,
      publishedAt: h.publishedAt || null,
    });
  }
  return out;
}

for (let i = 0; i < prompts.length && results.length < batchLimit; i++) {
  const p = prompts[i];
  const q = String(p.question || '').trim();
  const key = norm(q);
  if (!q || key.length < 12 || key.length > 200 || blocked.test(q) || rejectQuestion.test(q) || seenQuestions.has(key)) continue;
  if (!/^(støtter du|bør |skal |er du enig)/i.test(q)) continue;
  const sources = pickSources(p, headlines);
  if (!sources.length) continue;
  seenQuestions.add(key);

  const sensitivity = p.sensitivity === 'high' ? 'high' : 'low';
  const status = sensitivity === 'high' ? 'draft' : 'active';
  const options = [
    { id: 'ja', label: 'Ja' },
    { id: 'nei', label: 'Nei' },
    { id: 'vet_ikke', label: 'Vet ikke' },
    { id: 'avstemmes', label: 'Bør avstemmes' },
  ];
  const tags = Array.isArray(p.topic_tags) ? p.topic_tags : [];
  const esc = (s) => String(s ?? '').replace(/'/g, "''");
  const optionsJson = esc(JSON.stringify(options));
  const headlinesJson = esc(JSON.stringify(sources));
  const tagsSql = tags.length
    ? \`ARRAY[\${tags.map((t) => "'" + esc(t) + "'").join(',')}]\`
    : 'ARRAY[]::text[]';
  const sql = status === 'active'
    ? \`INSERT INTO public.forum_prompts (
    question, options, source_headlines, topic_tags, sensitivity, status, sort_order, expires_at
  ) VALUES (
    '\${esc(q)}',
    '\${optionsJson}'::jsonb,
    '\${headlinesJson}'::jsonb,
    \${tagsSql},
    '\${sensitivity}',
    '\${status}',
    \${results.length},
    NOW() + INTERVAL '7 days'
  )\`
    : \`INSERT INTO public.forum_prompts (
    question, options, source_headlines, topic_tags, sensitivity, status, sort_order
  ) VALUES (
    '\${esc(q)}',
    '\${optionsJson}'::jsonb,
    '\${headlinesJson}'::jsonb,
    \${tagsSql},
    '\${sensitivity}',
    '\${status}',
    \${results.length}
  )\`;
  results.push({ json: { sql, question: q, status } });
}

return results.length ? results : [{ json: { sql: null, skipped: true } }];`;

const ollamaChatModel = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOllama',
  version: 1,
  config: {
    name: 'Ollama Chat Model',
    credentials: { ollamaApi: newCredential('Ollama account') },
    parameters: {
      // qwen3-vl:8b: bra for multimodal, men tekst-only JSON tar ofte 3+ min og køer ved parallelle webhooks.
      // Bruk llama3.2:3b-text for stabil ~20s kjøring; bytt tilbake til qwen3-vl kun ved én kjøring om gangen.
      model: 'llama3.2:3b-text-q4_K_M',
      options: { think: false, temperature: 0.15, numPredict: 800, numCtx: 4096 },
    },
  },
});

const scheduleTrigger = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.3,
  config: {
    name: 'Daily 06:00',
    parameters: {
      rule: {
        interval: [{ field: 'cronExpression', expression: '0 6 * * *' }],
      },
    },
  },
  output: [{}],
});

const webhookTrigger = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'Webhook manual',
    parameters: {
      path: 'folkets-forum-prompts',
      httpMethod: 'POST',
      responseMode: 'onReceived',
    },
  },
  output: [{ body: {} }],
});

const backfillSettings = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Backfill settings',
    parameters: {
      mode: 'manual',
      includeOtherFields: true,
      assignments: {
        assignments: [
          { id: 'searxng-base', name: 'searxngBaseUrl', value: 'https://searxng.heyklever.app', type: 'string' },
          { id: 'batch-limit', name: 'batchLimit', value: '5', type: 'string' },
        ],
      },
    },
  },
  output: [{ searxngBaseUrl: 'https://searxng.heyklever.app', batchLimit: '5' }],
});

const fetchRssHeadlines = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Fetch RSS headlines',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: FETCH_RSS_JS,
    },
  },
  output: [{ rssHeadlines: [{ title: 'Eksempel', url: 'https://www.vg.no/nyheter/i/test', outlet: 'VG' }], rssCount: 1 }],
});

const collectAllHeadlines = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Collect all headlines',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: COLLECT_HEADLINES_JS,
    },
  },
  output: [{ headlines: [{ title: 'Eksempel', url: 'https://www.vg.no/nyheter/i/test/a', outlet: 'VG' }], headlineCount: 1 }],
});

const buildAgentInput = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build agent input',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: BUILD_AGENT_INPUT_JS,
    },
  },
  output: [{ headlinesText: '- Eksempel (VG)', skipAgent: false, headlineCount: 1 }],
});

const hasHeadlines = ifElse({
  version: 2.2,
  config: {
    name: 'Has headlines?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
        conditions: [
          {
            leftValue: expr('{{ $json.skipAgent }}'),
            operator: { type: 'boolean', operation: 'false' },
          },
        ],
        combinator: 'and',
      },
    },
  },
});

const generatePromptsAgent = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: {
    name: 'Generate prompts (Ollama)',
    onError: 'continueErrorOutput',
    parameters: {
      promptType: 'define',
      text: expr('{{ $json.headlinesText }}'),
      hasOutputParser: false,
      options: {
        systemMessage: PROMPT_SYSTEM,
        maxIterations: 1,
        enableStreaming: false,
      },
      subnodes: {
        model: ollamaChatModel,
      },
    },
  },
  output: [{ output: '{"prompts":[{"question":"Eksempel?","sensitivity":"low"}]}' }],
});

const moderationRoute = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Moderation + route',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: MODERATION_ROUTE_JS,
    },
  },
  output: [{ sql: 'INSERT INTO public.forum_prompts ...', question: 'Eksempel?', status: 'active' }],
});

const hasSql = ifElse({
  version: 2.2,
  config: {
    name: 'Has SQL?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [
          {
            leftValue: expr('{{ Boolean($json.sql) }}'),
            operator: { type: 'boolean', operation: 'true' },
          },
        ],
        combinator: 'and',
      },
    },
  },
});

const savePrompt = node({
  type: 'n8n-nodes-base.postgres',
  version: 2.6,
  config: {
    name: 'Save prompt',
    credentials: { postgres: newCredential('Fokets Meninger') },
    parameters: {
      operation: 'executeQuery',
      query: expr('{{ $json.sql }}'),
    },
  },
  output: [{ success: true }],
});

sticky(
  '## Forum trending prompts\\n\\nRSS + SearXNG → Ollama (llama3.2:3b-text, evt. qwen3-vl:8b én og én) → forum_prompts. batchLimit i Backfill settings.',
  [scheduleTrigger, webhookTrigger],
  { color: 5 }
);

const ingestPipeline = backfillSettings
  .to(fetchRssHeadlines)
  .to(collectAllHeadlines)
  .to(buildAgentInput)
  .to(hasHeadlines.onTrue(generatePromptsAgent.to(moderationRoute).to(hasSql.onTrue(savePrompt))));

export default workflow(
  'folkets-forum-trending-prompts',
  'Folkets Stemme – Forum trending prompts'
)
  .add(scheduleTrigger)
  .to(ingestPipeline)
  .add(webhookTrigger)
  .to(ingestPipeline);
