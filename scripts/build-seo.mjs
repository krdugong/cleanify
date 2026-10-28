// 동네별 SEO 페이지, 지역 목록 페이지, sitemap.xml, robots.txt를 만듭니다.
// 실행: node scripts/build-seo.mjs
// 지역을 추가하려면 아래 REGIONS에 동네를 넣고 다시 실행하세요.
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://cleanify.kr';
const TODAY = new Date().toISOString().slice(0, 10);
// 구글 애널리틱스 측정 ID (비워두면 GA 코드를 넣지 않음)
const GA_ID = process.env.GA_ID || 'G-H2NSJLMKT4';
const gaTag = () => GA_ID ? `<!-- GA --><script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script><!-- /GA -->` : '';

// ── 지역 ──────────────────────────────────────────────
// prefix: 페이지 제목에 붙는 지역명, note: 페이지마다 다른 소개 문장(선택)
const HANGANG = '한강신도시 아파트 단지가 모여 있는 지역이라 입주·이사 시기에 맞춘 문의가 많습니다.';
const REGIONS = [
  {
    key: 'gimpo', name: '김포', prefix: '김포', areas: [
      ['gurae', '구래동', HANGANG],
      ['masan', '마산동', HANGANG],
      ['janggi', '장기동', HANGANG],
      ['unyang', '운양동', HANGANG],
      ['geolpo', '걸포동'],
      ['bukbyeon', '북변동'],
      ['sau', '사우동'],
      ['pungmu', '풍무동'],
      ['gamjeong', '감정동'],
      ['gochon', '고촌읍'],
      ['yangchon', '양촌읍'],
      ['tongjin', '통진읍'],
      ['daegot', '대곶면'],
      ['wolgot', '월곶면'],
      ['haseong', '하성면'],
    ],
  },
  {
    key: 'seoul', name: '서울', prefix: '서울', areas: [
      ['gangseo', '강서구'], ['yangcheon', '양천구'], ['guro', '구로구'], ['geumcheon', '금천구'],
      ['yeongdeungpo', '영등포구'], ['mapo', '마포구'], ['eunpyeong', '은평구'], ['seodaemun', '서대문구'],
      ['jongno', '종로구'], ['jung', '중구'], ['yongsan', '용산구'], ['seongdong', '성동구'],
      ['gwangjin', '광진구'], ['dongdaemun', '동대문구'], ['seongbuk', '성북구'], ['gangbuk', '강북구'],
      ['dobong', '도봉구'], ['nowon', '노원구'], ['jungnang', '중랑구'], ['gangdong', '강동구'],
      ['songpa', '송파구'], ['gangnam', '강남구'], ['seocho', '서초구'], ['dongjak', '동작구'],
      ['gwanak', '관악구'],
    ],
  },
  {
    key: 'incheon', name: '인천', prefix: '인천', areas: [
      ['seo', '서구', '검단신도시와 청라국제도시를 포함한 지역입니다.'],
      ['gyeyang', '계양구'],
    ],
  },
];

// ── 서비스 (가격은 ac-form.html / gr-form.html 과 같게 유지) ──
const won = n => n.toLocaleString('ko-KR') + '원';
const SERVICES = {
  aircon: {
    name: '에어컨 세척', short: '에어컨 세척', page: '/ac.html', form: '/ac-form.html',
    eyebrow: 'Air Conditioner Cleaning',
    titleTail: '벽걸이·스탠드·천정형 분해 세척',
    desc: a => `${a} 에어컨 분해 세척. 벽걸이 ${won(80000)}~${won(90000)}, 스탠드 ${won(130000)}, 천정형 ${won(90000)}부터. 온라인으로 바로 견적을 확인하고 방문 일정을 신청하세요.`,
    hero: a => `${a}, 에어컨 속까지<br><span>제대로 세척합니다.</span>`,
    intro: a => `필터 청소만으로는 열교환기와 팬 날개에 쌓인 곰팡이를 없앨 수 없습니다. 클리니파이는 ${a} 가정과 사무실을 방문해 에어컨을 분해하고 내부까지 세척합니다. 벽걸이, 스탠드, 2in1, 천정형 모두 가능합니다.`,
    priceTitle: '에어컨 세척 가격',
    priceNote: '2대 이상은 대당 할인 가격이 적용됩니다. 미켈란젤로·갤러리 등 특별 제품은 별도 가격입니다.',
    prices: [
      ['벽걸이', `1대 ${won(90000)} · 2대 이상 대당 ${won(80000)}`],
      ['스탠드', won(130000)],
      ['2in1 (스탠드+벽걸이)', won(190000)],
      ['천정형 가정용', `1대 ${won(110000)} · 2대 이상 대당 ${won(90000)}`],
      ['천정형 사무용', won(150000)],
    ],
    low: 80000, high: 190000,
    steps: [
      ['견적 신청', '온라인 폼에서 에어컨 종류와 대수를 고르면 가격이 바로 계산됩니다.'],
      ['일정 확정', '연락드려 방문 날짜와 시간을 정합니다.'],
      ['분해 세척', '커버와 부품을 분해해 열교환기·팬 날개까지 세척합니다.'],
      ['조립·확인', '조립 후 작동과 바람 상태를 함께 확인합니다.'],
    ],
    faq: a => [
      [`${a}도 방문 세척이 되나요?`, `네. ${a} 가정과 사무실 모두 방문합니다. 견적 신청서에 아파트명까지 적어주시면 일정을 빠르게 잡을 수 있습니다.`],
      ['필터 청소와 분해 세척은 무엇이 다른가요?', '필터 청소는 앞쪽 먼지만 닦아냅니다. 분해 세척은 열교환기와 팬 날개에 쌓인 곰팡이와 세균까지 제거해 냄새의 원인을 없앱니다.'],
      ['에어컨 여러 대를 한 번에 맡기면 할인되나요?', `벽걸이와 천정형 가정용은 2대 이상이면 대당 가격이 내려갑니다. 벽걸이는 대당 ${won(80000)}, 천정형 가정용은 대당 ${won(90000)}입니다.`],
      ['언제 세척하는 게 좋나요?', '여름에 본격적으로 쓰기 전이나, 켰을 때 퀴퀴한 냄새가 날 때가 좋습니다. 아이가 있는 집은 매년 한 번 세척을 권합니다.'],
    ],
  },
  grout: {
    name: '줄눈 시공', short: '줄눈 시공', page: '/gr.html', form: '/gr-form.html',
    eyebrow: 'Kerapoxy Grout',
    titleTail: '케라폭시 줄눈',
    desc: a => `${a} 줄눈 시공. 이탈리아 Mapei 케라폭시로 변색·곰팡이 없는 줄눈. 현관 ${won(240000)}부터(입주예정 기준). 거주중·입주예정 모두 가능, 온라인으로 바로 견적 확인.`,
    hero: a => `${a} 줄눈 시공,<br><span>케라폭시로 오래가게.</span>`,
    intro: a => `줄눈은 한 번 변색되고 곰팡이가 생기면 청소로 되돌리기 어렵습니다. 클리니파이는 ${a}에서 이탈리아 Mapei의 케라폭시로 줄눈을 시공합니다. 이미 살고 계신 집도, 입주 예정인 집도 가능합니다.`,
    priceTitle: '줄눈 시공 가격',
    priceNote: '구역별 가격이며 여러 구역을 함께 고르면 합산됩니다. 입주예정 / 거주중 순서입니다.',
    prices: [
      ['현관', `${won(240000)} / ${won(300000)}`],
      ['화장실 바닥', `${won(480000)} / ${won(600000)}`],
      ['화장실 벽면', `${won(960000)} / ${won(1200000)}`],
      ['세탁실', `${won(360000)} / ${won(420000)}`],
      ['베란다', `${won(360000)} / ${won(420000)}`],
      ['거실', won(1440000)],
    ],
    low: 240000, high: 1440000,
    steps: [
      ['견적 신청', '거주중·입주예정과 시공 구역을 고르면 가격이 바로 계산됩니다.'],
      ['일정 확정', '연락드려 시공 날짜를 정합니다.'],
      ['기존 줄눈 제거', '오염된 줄눈을 파내고 틈을 정리합니다.'],
      ['케라폭시 시공', 'Mapei 케라폭시를 채우고 마감합니다.'],
    ],
    faq: a => [
      [`${a}도 줄눈 시공이 되나요?`, `네. ${a}도 방문합니다. 견적 신청서에 아파트명까지 적어주시면 일정을 빠르게 잡을 수 있습니다.`],
      ['살고 있는 집도 시공할 수 있나요?', '네. 거주중인 집과 입주예정인 집 모두 시공합니다. 가격은 거주중과 입주예정이 다릅니다.'],
      ['케라폭시는 일반 줄눈과 무엇이 다른가요?', '케라폭시는 이탈리아 Mapei의 에폭시 줄눈재로, 물과 오염에 강해 변색과 곰팡이가 잘 생기지 않습니다.'],
      ['어느 구역부터 하는 게 좋나요?', '물을 가장 많이 쓰는 화장실 바닥과 현관을 많이 고르십니다. 견적 폼에서 구역을 골라 가격을 바로 비교해 보세요.'],
    ],
  },
};

// ── HTML 조각 ─────────────────────────────────────────
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// 받침 있으면 '은', 없으면 '는'
const josa = w => ((w.charCodeAt(w.length - 1) - 0xac00) % 28 ? '은' : '는');
const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const LOGO_SVG = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3C7 3 5 5.5 5 8c0 3 3 6 5 8 2-2 5-5 5-8 0-2.5-2-5-5-5z" fill="white" opacity="0.9"/><circle cx="10" cy="8" r="2" fill="#1D9E75"/></svg>`;
const BUSINESS = { '@type': 'HomeAndConstructionBusiness', name: '클리니파이', alternateName: 'CLEANIFY', url: SITE + '/' };

function head({ title, desc, path, extra = '' }) {
  const url = SITE + path;
  return `<!DOCTYPE html>
<html lang="ko">
<head>
${gaTag()}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${url}">
<meta property="og:locale" content="ko_KR">
<meta property="og:type" content="website">
<meta property="og:site_name" content="클리니파이 CLEANIFY">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧹</text></svg>">
<link rel="stylesheet" href="/assets/seo.css?v=${TODAY.replace(/-/g, '')}">
${extra}
</head>
<body>`;
}

const hero = (eyebrow, titleHtml, sub) => `
<header class="hero">
  <a href="/" class="hero-logo"><span class="hero-logo-icon">${LOGO_SVG}</span><span class="hero-logo-text">CLEANIFY</span></a>
  <div class="hero-eyebrow">${eyebrow}</div>
  <h1 class="hero-title">${titleHtml}</h1>
  ${sub ? `<p class="hero-sub">${sub}</p>` : ''}
</header>`;

const crumbs = items => `<nav class="crumbs" aria-label="현재 위치">${items.map(([n, p], i) =>
  i === items.length - 1 ? `<span>${esc(n)}</span>` : `<a href="${p}">${esc(n)}</a>`).join(' › ')}</nav>`;

const crumbLd = items => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([n, p], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + p })),
});

const footer = () => `
<footer class="foot">
  <a href="/">클리니파이 홈</a> · <a href="/ac.html">에어컨 세척</a> · <a href="/gr.html">줄눈 시공</a> · <a href="/area/">서비스 지역</a>
  <p>© CLEANIFY</p>
</footer>
</body>
</html>
`;

const areaLabel = (r, a) => `${r.prefix} ${a[1]}`;
const areaPath = (svcKey, r, a) => `/${svcKey}/${r.key}-${a[0]}/`;

// ── 동네 × 서비스 페이지 ────────────────────────────────
function areaPage(svcKey, r, a) {
  const s = SERVICES[svcKey];
  const label = areaLabel(r, a);
  const path = areaPath(svcKey, r, a);
  const otherKey = svcKey === 'aircon' ? 'grout' : 'aircon';
  const title = `${label} ${s.name} | ${s.titleTail} - 클리니파이`;
  const desc = s.desc(label);
  const formUrl = `${s.form}?region=${encodeURIComponent(label + ' ')}`;
  const bc = [['클리니파이', '/'], [s.name, s.page], ['서비스 지역', '/area/'], [`${label} ${s.name}`, path]];
  const faq = s.faq(label);
  const siblings = r.areas.filter(x => x !== a);

  const extra = [
    ld({
      '@context': 'https://schema.org', '@type': 'Service', name: `${label} ${s.name}`, serviceType: s.name,
      description: desc, url: SITE + path, provider: BUSINESS,
      areaServed: { '@type': 'Place', name: label },
      offers: { '@type': 'AggregateOffer', priceCurrency: 'KRW', lowPrice: s.low, highPrice: s.high, url: SITE + s.form },
    }),
    ld(crumbLd(bc)),
    ld({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map(([q, ans]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: ans } })),
    }),
  ].join('\n');

  return head({ title, desc, path, extra }) + hero(s.eyebrow, s.hero(label), esc(s.intro(label))) + `
<main>
${crumbs(bc)}
<section class="section">
  <div class="section-eyebrow">Service Area</div>
  <h2 class="section-title">${esc(label)} ${s.name}, 이렇게 진행합니다</h2>
  <p class="section-desc">${a[2] ? `${esc(a[1] + josa(a[1]))} ${esc(a[2])} ` : ''}${esc(label)} 어디든 방문하니, 원하시는 날짜가 있다면 미리 신청해 주세요.</p>
  <ol class="steps">
    ${s.steps.map(([t, d], i) => `<li><span class="step-num">0${i + 1}</span><strong>${t}</strong><p>${d}</p></li>`).join('\n    ')}
  </ol>
</section>

<section class="section soft">
  <div class="section-eyebrow">Price</div>
  <h2 class="section-title">${esc(label)} ${s.priceTitle}</h2>
  <table class="price">
    <tbody>
      ${s.prices.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('\n      ')}
    </tbody>
  </table>
  <p class="note">${s.priceNote}</p>
  <a class="cta" href="${formUrl}">${esc(label)} ${s.short} 견적 받기 →</a>
</section>

<section class="section">
  <div class="section-eyebrow">FAQ</div>
  <h2 class="section-title">자주 묻는 질문</h2>
  ${faq.map(([q, ans]) => `<details class="faq"><summary>${esc(q)}</summary><p>${esc(ans)}</p></details>`).join('\n  ')}
</section>

<section class="section soft">
  <div class="section-eyebrow">Nearby</div>
  <h2 class="section-title">${r.name} 다른 지역 ${s.name}</h2>
  <ul class="chips">
    ${siblings.map(x => `<li><a href="${areaPath(svcKey, r, x)}">${esc(areaLabel(r, x))}</a></li>`).join('\n    ')}
  </ul>
  <p class="note"><a href="${areaPath(otherKey, r, a)}">${esc(label)} ${SERVICES[otherKey].name}</a>도 함께 신청할 수 있습니다. <a href="/area/">전체 서비스 지역 보기</a></p>
</section>
</main>
<a class="sticky-cta" href="${formUrl}">${s.short} 무료 견적 신청</a>
` + footer();
}

// ── 서비스 지역 목록 페이지 ─────────────────────────────
function areaIndex() {
  const title = '서비스 지역 - 에어컨 세척·줄눈 시공 | 클리니파이';
  const desc = '클리니파이 에어컨 세척과 케라폭시 줄눈 시공 서비스 지역. 김포 구래동·마산동·장기동·운양동, 서울 전 지역, 인천 서구·계양구까지 방문합니다.';
  const bc = [['클리니파이', '/'], ['서비스 지역', '/area/']];
  return head({ title, desc, path: '/area/', extra: ld(crumbLd(bc)) }) +
    hero('Service Area', '어디든<br><span>찾아갑니다.</span>', '동네를 고르면 에어컨 세척과 줄눈 시공 가격, 진행 방법을 바로 볼 수 있습니다.') + `
<main>
${crumbs(bc)}
${REGIONS.map(r => `
<section class="section">
  <h2 class="section-title">${r.name}</h2>
  <div class="area-table">
    ${r.areas.map(a => `<div class="area-row"><span>${esc(areaLabel(r, a))}</span><a href="${areaPath('aircon', r, a)}">에어컨 세척</a><a href="${areaPath('grout', r, a)}">줄눈 시공</a></div>`).join('\n    ')}
  </div>
</section>`).join('\n')}
</main>
` + footer();
}

// 다른 페이지(index, ac, gr)에 넣는 지역 링크 묶음
export function areaLinksHtml(svcKey) {
  const s = SERVICES[svcKey];
  return REGIONS.map(r => `<p class="area-links-group"><strong>${r.name}</strong> ${r.areas.map(a =>
    `<a href="${areaPath(svcKey, r, a)}">${esc(a[1])}</a>`).join(' ')}</p>`).join('\n') +
    `\n<p class="area-links-group"><a href="/area/">전체 서비스 지역 보기 →</a></p>`;
}

// ── 쓰기 ──────────────────────────────────────────────
const write = (rel, content) => {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

for (const svcKey of Object.keys(SERVICES)) {
  const dir = join(ROOT, svcKey);
  if (existsSync(dir)) rmSync(dir, { recursive: true });
}

const urls = [
  ['/', '1.0'], ['/ac.html', '0.9'], ['/gr.html', '0.9'], ['/ac-form.html', '0.6'], ['/gr-form.html', '0.6'], ['/area/', '0.8'],
];
write('area/index.html', areaIndex());
for (const svcKey of Object.keys(SERVICES)) {
  for (const r of REGIONS) {
    for (const a of r.areas) {
      const p = areaPath(svcKey, r, a);
      write(p.slice(1) + 'index.html', areaPage(svcKey, r, a));
      urls.push([p, '0.7']);
    }
  }
}

write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, pr]) => `  <url><loc>${SITE}${p}</loc><lastmod>${TODAY}</lastmod><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`);

write('robots.txt', `User-agent: *
Allow: /
Disallow: /form.html

Sitemap: ${SITE}/sitemap.xml
`);

// 링크 묶음을 index/ac/gr 에 끼워 넣습니다 (<!-- AREA_LINKS:서비스 --> 표시 사이)
import { readFileSync } from 'node:fs';
for (const file of ['index.html', 'ac.html', 'gr.html', 'ac-form.html', 'gr-form.html', 'form.html']) {
  const p = join(ROOT, file);
  let html = readFileSync(p, 'utf8');
  // GA 코드: 기존 것은 지우고 <head> 바로 뒤에 다시 넣기
  html = html.replace(/\n?<!-- GA -->[\s\S]*?<!-- \/GA -->/, '');
  if (GA_ID) html = html.replace('<head>', '<head>\n' + gaTag());
  for (const svcKey of Object.keys(SERVICES)) {
    const re = new RegExp(`(<!-- AREA_LINKS:${svcKey} -->)[\\s\\S]*?(<!-- /AREA_LINKS -->)`);
    html = html.replace(re, `$1\n${areaLinksHtml(svcKey)}\n$2`);
  }
  writeFileSync(p, html);
}

console.log(`페이지 ${urls.length - 6}개 + 지역 목록 + sitemap(${urls.length}개 URL) 생성`);
