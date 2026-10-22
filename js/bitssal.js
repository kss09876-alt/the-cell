// X-005 · 빛쌀 — 한 톨의 쌀을 따라가는 연속 스크롤 이야기
// 사실 서술 출처: 진실·화해를위한과거사정리위원회 「대구10월사건 관련 민간인 희생 사건」(jinsil.go.kr/KoreanWar/30.do),
//                「경산 코발트광산 사건」(jinsil.go.kr/KoreanWar/36.do)
import { sound } from './bitssal-sound.js?v=1';
const SRC1 = '진실·화해를위한과거사정리위원회, 「대구10월사건 관련 민간인 희생 사건」';
const SRC2 = '진실·화해를위한과거사정리위원회, 「경산 코발트광산 사건」';
const RICE = [255, 248, 230], DIM = [92, 86, 76], RED = [200, 56, 47], WARM = [255, 214, 150];

// ---------------- 미디어 (드라이브 공개 폴더) ----------------
const PH = ['15d1sLu91hipfxO8ddm25u4n7qco7alsc','1MY-CUpUsRSLZhghj0w4i4Hs9bEIZyedL','1ngIx4QLpCHLUA4gwIs5opQ3-g_Uvly5F','1TmD4uyMaMPUqZ5cmIoXWmJeug_JH4n-r','1b4IlSDkHVz2AL_8yG5RsFD62BuCJUcxB','1BHTfhpn-EvynJodo8UQmRpupzAh210pR','1eCURrQmRTLJ-FGiTsDyi0gMN497RFX6P','1YffnDcS7W363-XxsYjjfisna8hSVAn-u','1W0tIK-Gyjw_SCmZQllLGlt2v1ApChOTQ','12FADaTqwJsGPUoeIyqiBeXA-f6rMaZZ7'];
const VD = { main: '1IskIt7_532XzkI-EFmp4HIVoULe07rLm', acc: '1IhotvWTDYgaouAzXPX6IeqXgYHuP4oK-', dark: '1LVBEhxrpaSxzqn0ySEGwjK_WLLLcJ6uZ', light: '1sOsHOO04lWBDgpbmUepU-k42aVMKaksF', doc: '1Ri0vh-D6Hi3DG4noeNJVElIxuYVJLzZi',
  p1: '1eUCOhBt45uu0yZlK_c6Vz0jqUCBbeiBr', p2: '1dMtHJBziALi63Wsqe0ZXONfMbJuNlzjD', p3: '1seN9QKF6RN7IsgijglWuXJYn1K-QFpRh', p4: '1lt1-A70xBVklii3ASgWHdZsjNP_c1xo8', p5: '1mHd8BkmPC2keoUjIaxlUcn2Jc024PxXg', p6: '1GI-K6Pog-J2UPQ9Ns4r07qOTaStNG8Kw' };
const WORK = '진시영 · 김동선, 《빛쌀》, 2026';
const img = (id, w = 1400) => `https://lh3.googleusercontent.com/d/${id}=w${w}`;
const thumb = (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
const photo = (k, cap) => ({ kind: 'photo', id: PH[k], cap: cap || `작품 사진 — ${WORK}` });
const vid = (id, cap, title) => ({ kind: 'vid', id, cap, title });

// ---------------- 장면 정의 ----------------
// cards: at = 장면 안에서의 위치(0~1), kind = text | record | reveal | correct | choice | input | photo | vid | carousel | archive
const SCENES = [
  { id: 'prologue', title: '한 톨', h: 170, cards: [
    { at: 0.06, html: '<p class="kicker">X-005 · 진시영 · 김동선 《빛쌀》</p><h1>빛쌀</h1><p class="lead">한 톨의 쌀.<br>당신에게는 어떤 의미인가요?</p><p class="hint">어둠 속 쌀알에 커서를 가져가 보세요. 눌러서 따라가면 이야기가 시작됩니다.</p>' },
    { at: 0.55, html: '<p>이 쌀알은 유리 조형물 《빛쌀》의 맨 위, 넓은 밥상에서 출발합니다. 좁은 유리 통로를 지나 아래의 둥근 그릇에 닿기까지, 이 전시는 한 톨이 지나온 길을 따라갑니다.</p><p class="note">1946년 대구10월사건과 1950년 경산 코발트광산 사건은 서로 다른 사건입니다. 이 전시는 두 사건을 구분해 전합니다.</p>' },
  ] },
  { id: 'work', title: '작품', h: 230, cards: [
    { at: 0.05, html: '<p class="kicker">작품 《빛쌀》</p><h2>유리 위에 맺힌 빛</h2><p>유리 조형물 위로 쌀과 빛의 영상이 흐릅니다. 사진을 넘기며 작품의 네 부분을 먼저 둘러보세요.</p>' },
    { at: 0.28, kind: 'carousel', items: [
      { id: PH[0], t: '01 · 밥상', d: '넓은 윗부분. 쌀알이 모여 한 사람의 하루가 되는 자리.' },
      { id: PH[1], t: '02 · 통로', d: '좁아지는 유리 목. 삶이 좁은 길로 내몰리는 시간.' },
      { id: PH[2], t: '03 · 어둠', d: '아래로 이어지는 깊은 몸체.' },
      { id: PH[3], t: '04 · 그릇', d: '바닥의 둥근 그릇. 남겨진 빛이 고이는 곳.' },
    ] },
    { at: 0.66, ...vid(VD.main, `${WORK}, 가변 크기, 유리 오브제 위 단채널 영상 프로젝션`, '작품 영상') },
  ] },
  { id: 'life', title: '밥상', h: 250, cards: [
    { at: 0.06, html: '<p class="chap">01 · 한 톨의 삶</p><h2>1946년, 대구</h2><p>해방 이듬해. 쌀 한 톨은 곧 한 사람의 하루였습니다. 밥을 짓고, 도시락을 싸고, 함께 둘러앉는 평범한 밥상.</p>' },
    { at: 0.34, html: '<p><b>그릇을 눌러 밥을 담아 보세요.</b> 열 개의 그릇이 모두 차면 한 집의 하루가 됩니다.</p><p class="legend share">차린 그릇 <b class="bowl-n">0</b> / 10</p><p class="note">밥상 장면은 이해를 돕기 위한 일러스트입니다.</p>' },
    { at: 0.66, ...photo(4) },
  ] },
  { id: 'hunger', title: '굶주림', h: 300, cards: [
    { at: 0.04, html: '<p class="chap">02 · 해방 이후, 굶주림</p><h2>그릇이 비어 갑니다</h2><p>스크롤을 내리면 그릇의 쌀이 하나씩 빠져나갑니다.</p><p class="try">화면을 <b>길게 누르고</b> 있으면 쌀을 붙잡을 수 있습니다. 그러나 오래 버티지는 못합니다.</p>' },
    { at: 0.26, kind: 'record', title: '미곡수집령', html: '<p>미군정은 「미곡수집령」을 발표해 쌀을 거두고 제한 배급을 실시했다. 여름 보리(하곡)까지 수집했고, 경북에서는 양곡 수집이 특히 강압적으로 진행되었다.</p>', src: SRC1 },
    { at: 0.43, kind: 'record', title: '돌아온 사람들', html: '<p>해외에서 돌아온 동포가 늘면서 식량난은 더 심해졌다.</p>', src: SRC1 },
    { at: 0.58, kind: 'record', title: '콜레라와 수해', html: '<p>1946년 5월 콜레라가 퍼지고 6월에는 수해가 겹쳤다. 방역을 위한 교통 차단으로 많은 주민이 기아 상태에 놓였고, 청송 등 북부 산간지역에서는 굶어 죽는 사람도 나왔다.</p>', src: SRC1 },
    { at: 0.76, ...vid(VD.acc, '작품 영상 — 쌀의 축적과 부족. 작품의 장면이며 당시 기록 영상이 아닙니다.', '쌀의 축적과 부족') },
  ] },
  { id: 'demand', title: '요구', h: 320, cards: [
    { at: 0.05, html: '<p class="chap">03 · 우리는 쌀을 원했다</p><h2>흩어진 쌀알이 모입니다</h2><p>커서를 움직여 보세요. 쌀알들이 당신 쪽으로 모여듭니다.</p><p class="legend"><i></i> 쌀알 하나 = 10명</p>' },
    { at: 0.24, html: '<p>당신의 한 톨도 보탤 수 있습니다.</p><button class="act-btn add-voice">한 톨 보태기</button><p class="legend share">보탠 쌀알 <b class="voice-n">0</b></p>' },
    { at: 0.42, kind: 'record', title: '1946년 9월', html: '<p>9월 23일 대구의 노동조합들이 파업에 들어갔고, 27일 남조선총파업대구시투쟁위원회가 결성되었다. 미군정은 경찰과 우익청년단 등을 동원해 진압하고 노동자 약 1,200명을 검거했다.</p>', src: SRC1 },
    { at: 0.58, kind: 'record', title: '10월 1일 오전, 대구부청 앞', html: '<p>시민 1,000여 명이 쌀을 요구하는 시위를 벌였다.</p>', src: SRC1 },
    { at: 0.72, kind: 'record', title: '10월 1일, 대구역 앞', html: '<p>노동자들의 시위대는 대구역과 공회당 주변에 모였고, 그 수는 수천 명에서 1만 5천 명으로 불어났다.</p>', src: SRC1 },
    { at: 0.86, ...photo(6) },
  ] },
  { id: 'street', title: '거리', h: 470, cards: [
    { at: 0.03, html: '<p class="chap">04 · 1946년 10월, 거리</p><h2>시간을 따라 걷습니다</h2><p>스크롤이 시계가 됩니다. 지도 위 장소를 누르면 그곳의 기록이 열립니다.</p><p class="note">지도는 위치 관계를 단순화한 약도입니다.</p>' },
    { at: 0.18, ...photo(7) },
    { at: 0.38, kind: 'record', title: '10월 1일 오후 7시쯤', html: '<p>대구역 앞에서 경찰과 철도노조원이 충돌한 뒤, 경찰이 발포해 철도노조원 김용태 등 두 명이 사망했다.</p><p class="quiet">이 전시는 그 순간을 재현하지 않습니다. 잠시 멈춥니다.</p>', src: SRC1, tone: 'red' },
    { at: 0.56, kind: 'record', title: '10월 2일', html: '<p>대구의전 학생들이 숨진 노동자의 시신을 들것에 싣고 대구경찰서로 행진했다. 학생대표단은 구금자 석방과 발포 중지를 요구했고, 경찰서장이 무력 해산 명령을 거부하자 경찰은 철수했다. 군중은 경찰서를 점거했다.</p>', src: SRC1 },
    { at: 0.76, kind: 'record', title: '10월 2일 오후', html: '<p>미군의 명령을 받은 경찰이 발포해 민간인 17~18명과 경찰 4명이 사망했다.</p>', src: SRC1, tone: 'red' },
    { at: 0.9, kind: 'record', title: '오후 5시, 계엄령', html: '<p>미군은 장갑차와 기관총 부대를 투입하고 오후 5시 계엄령을 선포했다. 저녁 7시부터 통행금지가 시행되었다.</p>', src: SRC1 },
  ] },
  { id: 'spread', title: '확산', h: 280, cards: [
    { at: 0.06, html: '<p class="chap">04 · 1946년 가을</p><h2>번져 간 불빛</h2><p>스크롤하면 날짜가 흐르고, 사건이 번진 지역에 불이 켜집니다. 지역 이름을 누르면 날짜로 이동합니다.</p><p class="note">점의 개수는 지역별 규모를 뜻하지 않습니다.</p>' },
    { at: 0.45, kind: 'record', title: '10월 1일~3일', html: '<p>달성군에서 시작해 칠곡·고령, 성주·영일 등 경북 19개 군으로 번졌다.</p>', src: SRC1 },
    { at: 0.8, kind: 'record', title: '12월 중순까지', html: '<p>경남, 충남·충북, 경기·황해, 강원, 전남, 전북으로 확산되었고, 농민들의 추수봉기와 결합해 12월 중순까지 전국 73개 시군으로 퍼졌다.</p>', src: SRC1 },
  ] },
  { id: 'erased', title: '지워진 이름', h: 320, cards: [
    { at: 0.05, html: '<p class="chap">05 · 항쟁 이후, 지워진 이름</p><h2>흐려진 기록을 읽습니다</h2><p>거리의 충돌 뒤에도 탄압과 감시는 이어졌습니다.</p><p class="try">오른쪽 문서 위를 <b>커서로 문질러</b> 흐려진 글줄을 되살려 보세요. 아래 기록 카드도 눌러 읽을 수 있습니다.</p>' },
    { at: 0.26, kind: 'reveal', title: '진압과 토벌', html: '<p>사건 관련자들은 현장에서 살해되거나 검거되어 감옥에 갔고, 일부는 산으로 들어갔다. 1948년 정부 수립 때까지 토벌이 이어졌고, 그 과정에서 관련 없는 주민도 희생되었다.</p>', src: SRC1 },
    { at: 0.46, kind: 'correct', title: '1946년 10월 5일, 칠곡 금암동', html: '<p>경찰이 마을로 총을 쏘며 들어와 주민 박○도를 사살했다. 그는 이후 신원조사 기록에 <s class="wrong">남로당 가입자</s>로 기재되었다.</p>', fix: '이 기록은 잘못 기재된 것이었습니다.', src: SRC1 },
    { at: 0.66, kind: 'reveal', title: '2010년 3월 30일, 진실규명 결정', html: '<p>진실화해위원회는 대구·칠곡·영천·경주의 일부만 조사했음에도 민간인 60명 정도의 희생을 추산했고, 실제 희생자는 더 많을 것으로 보았다.</p>', src: SRC1 },
    { at: 0.84, ...photo(8) },
  ] },
  { id: 'boundary', title: '1950', h: 200, cards: [
    { at: 0.15, html: '<h2 class="big">4년 뒤,<br>다른 사건</h2><p>1946년 대구10월사건과 1950년 경산 코발트광산 사건은 시점과 피해 대상, 가해 구조가 다릅니다.</p><p>한국전쟁이 일어난 뒤 10월사건 관련자와 그 가족 일부가 보도연맹원으로 예비검속되어 희생되기도 했습니다. 그러나 이 연결을 모든 희생자에게 일반화하지 않습니다.</p>' },
    { at: 0.6, kind: 'choice', html: '<p class="warn">다음 장은 민간인 집단희생을 다룹니다.</p><p>사진이나 잔혹한 장면 없이 공식 조사 기록으로 전합니다.</p>', summary: '1950년 7~8월, 경북 경산 코발트광산 등지에서 국민보도연맹원·요시찰 대상자·대구형무소 재소자 등이 적법한 절차 없이 집단 희생되었습니다. 진실화해위원회는 2009년 11월 17일 진실규명을 결정했습니다.' },
  ] },
  { id: 'mine', title: '광산', h: 520, cards: [
    { at: 0.03, html: '<p class="chap">06 · 바닥 없는 어둠</p><h2>좁은 통로 아래로</h2><p>스크롤할수록 깊이 내려갑니다. 관람객이 무언가를 떨어뜨리는 조작은 없습니다.</p><p class="try">어둠 속에서는 <b>커서가 손전등</b>이 됩니다. 비추는 곳에서만 빛이 보입니다.</p>' },
    { at: 0.17, kind: 'record', title: '시기와 장소', html: '<p>1950년 7월 중·하순부터 8월 중순경까지. 경북 경산시 평산동의 코발트광산. 일제강점기에 개발된 광산으로 수직굴과 수평갱도가 이어져 있었다.</p>', src: SRC2 },
    { at: 0.31, kind: 'record', title: '끌려온 사람들', html: '<p>경산·청도·영동, 대구형무소 등지에서 끌려온 국민보도연맹원과 요시찰 대상자, 그리고 대구형무소 재소자 상당수가 희생되었다.</p>', src: SRC2 },
    { at: 0.44, kind: 'record', title: '가해 주체', html: '<p>경산·청도 지역 경찰, 경북지구CIC 경산·청도 파견대, 국군 제22헌병대.</p>', src: SRC2 },
    { at: 0.58, kind: 'record', title: '희생 규모', html: '<p>진실화해위원회는 1,800명을 웃돌 것으로 추정했지만 정확한 전체 수는 확인되지 않았다. 유족회와 시민사회는 3,500명 이상으로 추정한다. 신원이 확인된 사람은 127명이다.</p><p class="quiet">희미한 점은 추정치, 밝은 점은 신원이 확인된 사람입니다. 두 숫자는 서로 다른 지표입니다.</p>', src: SRC2 },
    { at: 0.73, ...vid(VD.dark, '작품 영상 — 원형 시점과 어둠. 실제 장소가 아닌 작품의 상징적 장면입니다.', '원형 시점과 어둠') },
    { at: 0.92, html: '<p class="center">확인되지 않은 이름까지,<br>기억의 밖에 둘 수는 없습니다.</p><p class="note center">전시 문안</p>' },
  ] },
  { id: 'truth', title: '진실규명', h: 330, cards: [
    { at: 0.05, html: '<p class="chap">07 · 묻혀 있던 진실</p><h2>오래 걸린 시간</h2><p>연도를 지날 때마다 바닥의 빛이 조금씩 떠오릅니다. 위쪽의 연도를 눌러도 됩니다.</p>' },
    { at: 0.22, kind: 'record', title: '1993년', html: '<p>지역 언론이 사건을 알리기 시작했다.</p>', src: SRC2 },
    { at: 0.36, kind: 'record', title: '2000년 · 2001년', html: '<p>2000년 경산유족회가 결성되었다. 2001년 시멘트로 봉인된 갱도 입구가 열렸고, 3일간 유해 40구를 수습했다.</p>', src: SRC2 },
    { at: 0.52, kind: 'record', title: '2007년 · 2009년', html: '<p>2007년 진실화해위원회의 공식 유해 발굴 조사가 시작되었고, 2009년 11월 17일 진실규명이 결정되었다.</p>', src: SRC2 },
    { at: 0.68, ...photo(1) },
    { at: 0.88, html: '<p>그러나 지금까지도 모든 유해를 수습하지 못했습니다. 바닥에 남은 빛은 아직 돌아오지 못한 사람들입니다.</p>' },
  ] },
  { id: 'share', title: '나눔', h: 250, cards: [
    { at: 0.06, html: '<p class="chap">08 · 쌀은 다시 나눔이 되었다</p><h2>대구에서 광주로</h2><p>대구에서 삶을 위해 요구했던 쌀은, 1980년 5월 광주에서 시민들이 서로를 살리기 위해 나누는 주먹밥이 되었습니다.</p>' },
    { at: 0.4, html: '<p>주먹밥을 눌러 옆 사람에게 건네 보세요.</p><p class="legend share">나눈 주먹밥 <b class="share-n">0</b>개</p>' },
    { at: 0.72, html: '<blockquote>대구에서 삶을 위해 요구했던 쌀은 광주에서 서로를 살리기 위해 나누는 음식이 되었다.</blockquote><p class="note">진시영 · 김동선, 《빛쌀》 작업노트 중에서</p>' },
  ] },
  { id: 'light', title: '빛', h: 360, cards: [
    { at: 0.04, html: '<p class="chap">08 · 기억은 다시 빛이 된다</p><h2>처음 보았던 한 톨이,<br>지금은 어떻게 보이나요?</h2><p class="try">어둠 어디든 <b>눌러서</b> 작은 빛을 켤 수 있습니다.</p><p class="legend share">켜진 빛 <b class="lamp-n">0</b></p>' },
    { at: 0.24, kind: 'input' },
    { at: 0.45, ...vid(VD.light, '작품 영상 — 입자의 확산과 빛', '입자의 확산과 빛') },
    { at: 0.66, ...photo(3) },
    { at: 0.88, html: '<p class="center big-quote">LIFE remains in LIGHT.</p><p class="note center">어둠 속에 묻힌 삶은 기억하는 사람들의 빛 속에서 다시 한 톨의 이름이 된다 — 《빛쌀》 설치계획 중에서</p>' },
  ] },
  { id: 'archive', title: '아카이브', h: 270, cards: [
    { at: 0.06, kind: 'archive' },
  ] },
];
const CREDITS = `<footer class="bs-credits"><div>
  <h3>출처와 안내</h3>
  <p>역사 서술: ${SRC1}(jinsil.go.kr/KoreanWar/30.do), ${SRC2}(jinsil.go.kr/KoreanWar/36.do)</p>
  <p>밥상·약도·광산 통로 장면은 이해를 돕기 위한 일러스트이며 실제 장소나 인물을 재현하지 않습니다. ‘전시 문안’으로 표시된 문장은 창작 문안으로, 희생자나 유족의 실제 발언이 아닙니다.</p>
  <p>작품: 진시영 · 김동선, 《빛쌀》, 2026 · 기획: XPACE (VALIX LAB)</p>
  <a class="bs-back" href="./">← XPACE 행성계로 돌아가기</a></div></footer>`;

// ---------------- DOM 구성 ----------------
const story = document.getElementById('story');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
story.innerHTML = SCENES.map((s, si) => `<section class="scene" id="s-${s.id}" data-i="${si}" style="height:${s.h}vh">${s.cards.map((c, ci) => cardHTML(s, c, si, ci)).join('')}</section>`).join('') + CREDITS;

function cardHTML(s, c, si, ci) {
  const pos = `style="top:${c.at * 100}%"`;
  const src = c.src ? `<p class="src">출처: ${esc(c.src)}</p>` : '';
  if (c.kind === 'record') return `<article class="card rec ${c.tone || ''}" ${pos}><p class="rec-label">기록</p><h3>${esc(c.title)}</h3>${c.html}${src}</article>`;
  if (c.kind === 'reveal') return `<article class="card rec reveal-rec" ${pos}><p class="rec-label">기록</p><h3>${esc(c.title)}</h3><div class="blur">${c.html}</div><button class="rv-btn">기록 읽기</button>${src}</article>`;
  if (c.kind === 'correct') return `<article class="card rec reveal-rec correct" ${pos}><p class="rec-label">기록</p><h3>${esc(c.title)}</h3><div class="blur">${c.html}</div><button class="rv-btn">기록 읽기</button><button class="fix-btn" hidden>기록 바로잡기</button><p class="fix-note" hidden>${esc(c.fix)}</p>${src}</article>`;
  if (c.kind === 'choice') return `<article class="card choice" ${pos}>${c.html}<div class="ch-btns"><button data-go="mine">계속 보기</button><button data-sum>요약만 보기</button><button data-go="truth">다음 장으로</button></div><div class="ch-sum" hidden><p>${esc(c.summary)}</p></div></article>`;
  if (c.kind === 'input') return `<article class="card mem" ${pos}><h3>기억을 위한 한 문장</h3><p>한 문장을 남기면 작은 빛이 되어 떠오릅니다. 쓰지 않아도 끝까지 볼 수 있어요.</p><form class="mem-f"><textarea maxlength="120" rows="2" placeholder="오늘 기억하고 싶은 것 (120자 이내, 이름은 적지 않아도 됩니다)" aria-label="기억을 위한 한 문장"></textarea><div class="mem-r"><span class="mem-n">0 / 120</span><button type="submit">빛으로 남기기</button></div></form><p class="note">남긴 문장은 이 브라우저에만 저장되며 공개되지 않습니다.</p></article>`;
  if (c.kind === 'photo') return `<figure class="card ph" ${pos}><button class="ph-btn" data-lb-img="${c.id}" aria-label="사진 크게 보기"><img src="${img(c.id, 1000)}" alt="${esc(c.cap)}" loading="lazy"></button><figcaption>${esc(c.cap)}</figcaption></figure>`;
  if (c.kind === 'vid') return `<figure class="card vd" ${pos}>${vidHTML(c.id, c.title)}<figcaption>${esc(c.cap)}</figcaption></figure>`;
  if (c.kind === 'carousel') return `<div class="card car" ${pos}><div class="car-view">${c.items.map((it, k) => `<button class="car-slide${k ? '' : ' on'}" data-lb-img="${it.id}" aria-label="${esc(it.t)} 크게 보기"><img src="${img(it.id, 1200)}" alt="${esc(it.t)}" loading="lazy"></button>`).join('')}</div>
    <div class="car-txt">${c.items.map((it, k) => `<div class="car-cap${k ? '' : ' on'}"><b>${esc(it.t)}</b><span>${esc(it.d)}</span></div>`).join('')}</div>
    <div class="car-nav"><button class="car-prev" aria-label="이전 사진">←</button>${c.items.map((_, k) => `<i class="${k ? '' : 'on'}"></i>`).join('')}<button class="car-next" aria-label="다음 사진">→</button></div><p class="note">작품 사진 — ${WORK} · 사진을 누르면 크게 볼 수 있습니다.</p></div>`;
  if (c.kind === 'archive') return `<div class="card arch" ${pos}><p class="kicker">ARCHIVE</p><h2>작품의 기록</h2><p>《빛쌀》이 만들어진 과정과 다큐멘터리, 작업 영상과 사진을 모았습니다. 눌러서 재생하세요.</p>
    <div class="arch-doc">${vidHTML(VD.doc, '《빛쌀》 다큐멘터리')}<p class="note">《빛쌀》 다큐멘터리 · 용량이 커서 재생까지 시간이 걸릴 수 있습니다.</p></div>
    <h3>작업 영상</h3><div class="arch-grid">${['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].map((k, i) => `<button class="arch-v" data-lb-vid="${VD[k]}"><img src="${thumb(VD[k])}" alt="" loading="lazy" onerror="this.remove()"><span>▶ 작업 영상 ${String(i + 1).padStart(2, '0')}</span></button>`).join('')}</div>
    <h3>사진</h3><div class="arch-grid ph6">${PH.map((id, i) => `<button class="arch-p" data-lb-img="${id}" aria-label="작품 사진 ${i + 1} 크게 보기"><img src="${img(id, 500)}" alt="" loading="lazy"></button>`).join('')}</div>
    <p class="note">영상·사진: ${WORK}</p></div>`;
  return `<article class="card ${c.kind || ''}" ${pos}>${c.html}</article>`;
}
function vidHTML(id, title) {
  return `<div class="bs-video" data-vid="${id}"><img src="${thumb(id)}" alt="" loading="lazy" onerror="this.remove()"><button class="vplay"><span>▶</span>${esc(title || '영상 재생')}</button></div>`;
}

// 사운드: 첫 터치/클릭/키 입력에서 시작 (브라우저 자동재생 정책), 상단 버튼으로 켜고 끄기
const sndBtn = document.querySelector('.bs-snd');
let sndUserOff = false;
function sndUI() { sndBtn.classList.toggle('on', sound.on); sndBtn.setAttribute('aria-pressed', String(sound.on)); sndBtn.querySelector('span').textContent = sound.on ? '소리 켜짐' : '소리 켜기'; }
sndBtn.addEventListener('click', (e) => { e.stopPropagation(); const v = sound.toggle(); sndUserOff = !v; setTimeout(sndUI, 30); });
const GEST = ['pointerdown', 'keydown', 'touchstart'];
const firstGesture = (e) => {
  if (e.target && e.target.closest && e.target.closest('.bs-snd')) return; // 버튼은 자체 처리
  GEST.forEach((ev) => removeEventListener(ev, firstGesture));
  if (!sndUserOff && !sound.on) sound.start().then(sndUI).catch(() => {});
};
GEST.forEach((ev) => addEventListener(ev, firstGesture, { passive: true }));

// 목차 / 진행 막대
const menu = document.getElementById('bs-menu'), menuBtn = document.querySelector('.bs-menu-btn');
menu.innerHTML = `<ol>${SCENES.map((s, i) => `<li><a href="#s-${s.id}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.title)}</a></li>`).join('')}</ol>`;
menuBtn.addEventListener('click', () => { menu.hidden = !menu.hidden; menuBtn.setAttribute('aria-expanded', String(!menu.hidden)); });
menu.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); jump(a.getAttribute('href').slice(3)); menu.hidden = true; });
const prog = document.querySelector('.bs-progress');
prog.style.gridTemplateColumns = `repeat(${SCENES.length}, 1fr)`;
prog.innerHTML = SCENES.map((s, i) => `<button title="${esc(s.title)}" data-id="${s.id}"><i></i></button>`).join('');
prog.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) jump(b.dataset.id); });
function jump(id) { const el = document.getElementById('s-' + id); if (el) window.scrollTo({ top: el.offsetTop + 2, behavior: 'smooth' }); }

// 카드 등장
const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('in', e.isIntersecting)), { rootMargin: '-12% 0px -12% 0px' });
document.querySelectorAll('.card').forEach((c) => io.observe(c));

// 기록 읽기 / 바로잡기
document.querySelectorAll('.reveal-rec').forEach((c) => {
  const rv = c.querySelector('.rv-btn'), fix = c.querySelector('.fix-btn');
  rv.addEventListener('click', () => { sound.ping('reveal'); c.classList.add('open'); rv.hidden = true; if (fix) fix.hidden = false; });
  fix && fix.addEventListener('click', () => { sound.ping('fix'); c.classList.add('fixed'); fix.hidden = true; c.querySelector('.fix-note').hidden = false; });
});
// 선택 카드
document.querySelectorAll('.choice').forEach((c) => {
  c.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => jump(b.dataset.go)));
  c.querySelector('[data-sum]').addEventListener('click', (e) => { const s = c.querySelector('.ch-sum'); s.hidden = !s.hidden; e.target.textContent = s.hidden ? '요약만 보기' : '요약 닫기'; });
});

// 영상: 눌렀을 때만 불러오기
document.querySelectorAll('.bs-video').forEach((v) => v.querySelector('.vplay').addEventListener('click', () => {
  v.innerHTML = `<iframe src="https://drive.google.com/file/d/${v.dataset.vid}/preview" allow="autoplay; fullscreen" allowfullscreen title="영상"></iframe>`; v.classList.add('playing'); sound.duck(0.15);
}));
// 라이트박스
const lb = document.createElement('div'); lb.className = 'lb'; lb.hidden = true; lb.innerHTML = '<button class="lb-x" aria-label="닫기">×</button><div class="lb-in"></div>'; document.body.appendChild(lb);
function openLB(html) { lb.querySelector('.lb-in').innerHTML = html; lb.hidden = false; document.body.classList.add('lb-open'); }
function closeLB() { sound.duck(1); lb.hidden = true; lb.querySelector('.lb-in').innerHTML = ''; document.body.classList.remove('lb-open'); }
lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.lb-x')) closeLB(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLB(); });
document.addEventListener('click', (e) => {
  const i = e.target.closest('[data-lb-img]'), v = e.target.closest('[data-lb-vid]');
  if (i) openLB(`<img src="${img(i.dataset.lbImg, 2200)}" alt="작품 사진"><p>작품 사진 — ${WORK}</p>`);
  if (v) sound.duck(0.15);
  if (v) openLB(`<div class="lb-vid"><iframe src="https://drive.google.com/file/d/${v.dataset.lbVid}/preview" allow="autoplay; fullscreen" allowfullscreen title="작업 영상"></iframe></div><p>작업 영상 — ${WORK}</p>`);
});
// 캐러셀
document.querySelectorAll('.car').forEach((c) => {
  const sl = [...c.querySelectorAll('.car-slide')], cp = [...c.querySelectorAll('.car-cap')], dots = [...c.querySelectorAll('.car-nav i')]; let k = 0;
  const go = (n) => { k = (n + sl.length) % sl.length; [sl, cp, dots].forEach((arr) => arr.forEach((el, j) => el.classList.toggle('on', j === k))); state.carK = k; sound.ping('slide'); };
  c.querySelector('.car-prev').addEventListener('click', () => go(k - 1)); c.querySelector('.car-next').addEventListener('click', () => go(k + 1));
  dots.forEach((d, j) => d.addEventListener('click', () => go(j)));
  let sx = null; const v = c.querySelector('.car-view');
  v.addEventListener('pointerdown', (e) => (sx = e.clientX)); v.addEventListener('pointerup', (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 40) { go(k + (e.clientX < sx ? 1 : -1)); c._sw = true; } sx = null; });
  v.addEventListener('click', (e) => { if (c._sw) { c._sw = false; e.stopPropagation(); e.preventDefault(); } }, true);
});
// 한 톨 보태기
document.querySelectorAll('.add-voice').forEach((b) => b.addEventListener('click', () => { state.voice = Math.min(200, state.voice + 1); sound.ping('voice'); document.querySelectorAll('.voice-n').forEach((n) => (n.textContent = state.voice)); }));

// ---------------- 캔버스 / 입자 ----------------
const cv = document.getElementById('stage'), g = cv.getContext('2d');
const glass = document.getElementById('glass');
const hud = { clock: document.querySelector('.hud-clock'), count: document.querySelector('.hud-count'), year: document.querySelector('.hud-year'), depth: document.querySelector('.hud-depth'), tip: document.querySelector('.hud-tip') };
const labelsEl = document.getElementById('labels');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let W = 0, H = 0, DPR = Math.min(devicePixelRatio, 2), CX = 0, CY = 0, R = 0, mobile = false;
function resize() {
  W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
  mobile = W < 820; CX = mobile ? W / 2 : W * 0.64; CY = mobile ? H * 0.42 : H * 0.5; R = Math.min(mobile ? W * 0.42 : W * 0.3, H * 0.36);
}
resize(); addEventListener('resize', resize);

const N = 1900;
const X = new Float32Array(N), Y = new Float32Array(N), A = new Float32Array(N), ROT = new Float32Array(N);
const TX = new Float32Array(N), TY = new Float32Array(N), TA = new Float32Array(N);
const C = new Uint8Array(N), R1 = new Float32Array(N), R2 = new Float32Array(N), R3 = new Float32Array(N);
for (let i = 0; i < N; i++) { R1[i] = Math.random(); R2[i] = Math.random(); R3[i] = Math.random(); X[i] = Math.random() * innerWidth; Y[i] = Math.random() * innerHeight; ROT[i] = Math.random() * 6.28; }
const COLORS = [RICE, DIM, RED, WARM];

const ptr = { x: -1, y: -1, in: false };
addEventListener('pointermove', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.in = true; });
document.addEventListener('pointerleave', () => { ptr.in = false; });

const sm = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (p, a, b) => sm((p - a) / (b - a));

// 상태 (인터랙션)
const state = { entered: false, share: 0, balls: [], memories: [], bowls: new Array(10).fill(0), voice: 0, hold: 0, lamps: [], rub: new Float32Array(900), carK: 0 };
let ptrDown = false;
addEventListener('pointerdown', (e) => { if (!e.target.closest('.card, .bs-top, .bs-menu, .bs-progress, .lab, .lb')) ptrDown = true; });
addEventListener('pointerup', () => (ptrDown = false)); addEventListener('pointercancel', () => (ptrDown = false));
try { state.memories = JSON.parse(localStorage.getItem('xpace-bitssal-v2') || '[]'); } catch (e) {}

// 지도 노드 (약도, 상대 좌표)
const DAEGU = [
  { k: 'station', name: '대구역', x: -0.15, y: -0.55, text: '10월 1일 저녁, 경찰과 철도노조원이 충돌하고 경찰이 발포한 곳.' },
  { k: 'hall', name: '공회당 · 시투 사무실', x: 0.35, y: -0.25, text: '노동자 시위대가 모여든 곳. 10월 2일 오후에도 이 일대에서 발포가 있었다.' },
  { k: 'city', name: '대구부청', x: -0.6, y: 0.1, text: '10월 1일 오전, 시민 1,000여 명이 쌀을 요구한 곳.' },
  { k: 'police', name: '대구경찰서', x: 0.15, y: 0.42, text: '10월 2일, 학생과 시민이 행진해 점거한 곳.' },
];
const REGIONS = [
  { name: '경북', x: 0.38, y: 0.02, day: 1 }, { name: '경남', x: 0.2, y: 0.55, day: 7 },
  { name: '충북', x: -0.02, y: -0.3, day: 17 }, { name: '충남', x: -0.45, y: -0.25, day: 17 },
  { name: '경기 · 황해', x: -0.35, y: -0.75, day: 20 }, { name: '강원', x: 0.3, y: -0.7, day: 29 },
  { name: '전남', x: -0.5, y: 0.6, day: 29 }, { name: '전북', x: -0.5, y: 0.18, day: 79 },
];
const YEARS = [{ y: 1993, at: 0.25 }, { y: 2000, at: 0.36 }, { y: 2001, at: 0.44 }, { y: 2007, at: 0.6 }, { y: 2009, at: 0.68 }];
const labelEls = {};
function label(key, text, cls = '') {
  if (!labelEls[key]) { const d = document.createElement('button'); d.className = 'lab ' + cls; d.textContent = text; labelsEl.appendChild(d); labelEls[key] = d; }
  return labelEls[key];
}
DAEGU.forEach((n) => { const l = label('d-' + n.k, n.name, 'node'); l.addEventListener('click', () => showTip(n.name, n.text, l)); });
REGIONS.forEach((r) => { const l = label('r-' + r.name, r.name, 'region'); l.addEventListener('click', () => { const s = document.getElementById('s-spread'); const at = 0.1 + ((r.day - 1) / 79) * 0.82 + 0.01; window.scrollTo({ top: s.offsetTop + s.offsetHeight * at - innerHeight * 0.5, behavior: 'smooth' }); }); });
YEARS.forEach((yy) => { const l = label('y-' + yy.y, String(yy.y), 'year'); l.addEventListener('click', () => { const s = document.getElementById('s-truth'); window.scrollTo({ top: s.offsetTop + (s.offsetHeight - innerHeight) * yy.at + innerHeight * 0.5 - innerHeight / 2, behavior: 'smooth' }); }); });
let tipTimer;
function showTip(title, text, el) {
  hud.tip.innerHTML = `<b>${esc(title)}</b><span>${esc(text)}</span>`;
  const r = el ? el.getBoundingClientRect() : { left: ptr.x, top: ptr.y, width: 0 };
  hud.tip.style.left = Math.min(W - 280, Math.max(12, r.left)) + 'px'; hud.tip.style.top = (r.top + 34) + 'px';
  hud.tip.classList.add('on'); clearTimeout(tipTimer); tipTimer = setTimeout(() => hud.tip.classList.remove('on'), 4200);
}

// 밥상 그릇 (일러스트)
const BOWLS = ['아침 밥상', '도시락', '장터의 국밥', '공장 점심', '아이의 밥그릇', '제삿밥', '새참', '저녁 밥상', '나눠 먹는 한 그릇', '빈 그릇'].map((t, k) => ({ t, a: (k / 10) * Math.PI * 2 - Math.PI / 2 }));
const bowlPos = (k) => ({ x: CX + Math.cos(BOWLS[k].a) * R * 0.85, y: CY + Math.sin(BOWLS[k].a) * R * 0.62 });
// 주먹밥
function initBalls() { state.balls = Array.from({ length: 10 }, (_, k) => ({ a: (k / 10) * Math.PI * 2, r: 0.75, tr: 0.75, ta: (k / 10) * Math.PI * 2, size: 1 })); }
initBalls();

// ---------------- 장면별 목표 위치 ----------------
function setT(i, x, y, a, c) { TX[i] = x; TY[i] = y; TA[i] = a; C[i] = c; }
function hideAll(from = 0, x = CX, y = CY) { for (let i = from; i < N; i++) setT(i, x + (R1[i] - 0.5) * W * 1.4, y + (R2[i] - 0.5) * H * 1.4, 0, 0); }

const TARGETS = {
  prologue(p) {
    if (!state.entered) {
      const fx = ptr.in ? ptr.x : CX, fy = ptr.in ? ptr.y : CY - R * 0.2;
      setT(0, fx, fy, 1, 0);
    } else setT(0, CX, CY - R * 0.95, 1, 0);
    hideAll(1, CX, CY - R * 0.95);
    for (let i = 1; i < 140; i++) setT(i, CX + (R1[i] - 0.5) * R * 1.6, CY - R * 0.95 + (R2[i] - 0.5) * 18, seg(p, 0.75, 1) * 0.9, 0);
  },
  work(p) {
    // 유리 조형물 실루엣을 따라 흐르는 쌀알 (윗 접시 → 좁은 목 → 아래 그릇)
    const t = performance.now() / 1000, sc = R / 260;
    for (let i = 0; i < 900; i++) {
      const u = (R1[i] + t * 0.03 * (0.5 + R3[i])) % 1; let x, y;
      if (u < 0.25) { const a = R2[i] * 6.28, r = Math.sqrt(u / 0.25); x = Math.cos(a) * 130 * r; y = -230 + Math.sin(a) * 18 * r; }
      else if (u < 0.75) { const v = (u - 0.25) / 0.5; const w = lerp(120, 10, Math.min(1, v * 3)) * (R2[i] - 0.5) * 2; x = w; y = -220 + v * 380; }
      else { const v = (u - 0.75) / 0.25, a = R2[i] * Math.PI; x = Math.cos(a + Math.PI) * 90 * Math.sqrt(R3[i]); y = 170 + Math.sin(a) * 30 * v; }
      setT(i, CX + x * sc, CY + y * sc, 0.35 + 0.65 * (state.carK === (u < 0.2 ? 0 : u < 0.5 ? 1 : u < 0.75 ? 2 : 3) ? 1 : 0.4), state.carK === 3 && u >= 0.75 ? 3 : 0);
    }
    hideAll(900);
  },
  life(p) {
    const k = seg(p, 0, 0.3);
    let gi = 0;
    for (let i = 0; i < 140; i++, gi++) {
      const b = bowlPos(i % 10), ang = R2[i] * 6.28, rr = Math.sqrt(R3[i]) * 16;
      setT(i, lerp(CX + (R1[i] - 0.5) * R * 1.6, b.x + Math.cos(ang) * rr, k), lerp(CY - R * 0.95, b.y + Math.sin(ang) * rr * 0.6, k), 1, 0);
    }
    // 눌러서 담은 밥 (그릇마다 최대 40알)
    for (let b = 0; b < 10; b++) {
      const q = bowlPos(b), n = Math.round(state.bowls[b] * 40);
      for (let j = 0; j < 40; j++, gi++) { const ang = R2[gi] * 6.28, rr = Math.sqrt(R3[gi]) * 20; setT(gi, j < n ? q.x + Math.cos(ang) * rr : q.x, j < n ? q.y - 6 + Math.sin(ang) * rr * 0.5 - (1 - Math.sqrt(R3[gi])) * 8 : q.y - 260, j < n ? 1 : 0, j < n ? 3 : 0); }
    }
    hideAll(gi);
  },
  hunger(p) {
    state.hold = ptrDown ? Math.min(1, state.hold + 0.02) : Math.max(0, state.hold - 0.03);
    const gone = Math.max(0, seg(p, 0.1, 0.9) - 0.25 * state.hold * (1 - seg(p, 0.6, 0.9))), sx = CX + R * 1.05, sy = CY + R * 0.75;
    for (let i = 0; i < 140; i++) {
      const b = bowlPos(i % 10), ang = R2[i] * 6.28, rr = Math.sqrt(R3[i]) * 16;
      if (R1[i] < gone) setT(i, sx + (R2[i] - 0.5) * 50, sy + (R3[i] - 0.5) * 30, 0.35, 1);
      else setT(i, b.x + Math.cos(ang) * rr, b.y + Math.sin(ang) * rr * 0.6, 1, 0);
    }
    hideAll(140);
  },
  demand(p) {
    const n = Math.round(lerp(100, 1500, seg(p, 0.55, 0.85)));
    const ax = ptr.in && !mobile && ptr.x > W * 0.38 ? lerp(CX, ptr.x, 0.55) : CX, ay = ptr.in && !mobile && ptr.x > W * 0.38 ? lerp(CY, ptr.y, 0.55) : CY;
    const rc = R * 0.92 * Math.sqrt(n / 1500) + 14;
    for (let i = 0; i < N; i++) {
      if (i < n) { const r = Math.sqrt((i + 0.5) / n) * rc, a = i * 2.39996; setT(i, ax + Math.cos(a) * r, ay + Math.sin(a) * r, 1, 0); }
      else { const a = R1[i] * 6.28; setT(i, CX + Math.cos(a) * Math.max(W, H), CY + Math.sin(a) * Math.max(W, H), 0, 0); }
    }
    for (let j = 0; j < state.voice; j++) { const i = 1500 + j, a = j * 2.39996 + 0.7, r = Math.sqrt((j + 0.5) / 200) * rc * 0.6; setT(i, ax + Math.cos(a) * r, ay + Math.sin(a) * r, 1, 3); }
    hud.count.innerHTML = `<b>${(n * 10).toLocaleString()}</b>명 <small>${n < 400 ? '10월 1일 오전 · 대구부청 앞' : '10월 1일 · 대구역 앞'}</small>`;
  },
  street(p) {
    const node = (k) => { const n = DAEGU.find((d) => d.k === k); return { x: CX + n.x * R, y: CY + n.y * R }; };
    const st = node('station'), hl = node('hall'), ct = node('city'), pl = node('police');
    let cA = ct, cB = st, nB = 1500;
    const fire1 = p >= 0.36 && p < 0.47, march = seg(p, 0.48, 0.66), fire2 = p >= 0.72, curfew = seg(p, 0.86, 0.98);
    for (let i = 0; i < 1500; i++) {
      let x, y;
      const a = i * 2.39996, r = Math.sqrt((i + 0.5) / nB) * R * 0.3;
      if (p < 0.12 && i < 100) { const r2 = Math.sqrt((i + 0.5) / 100) * R * 0.14; x = ct.x + Math.cos(a) * r2; y = ct.y + Math.sin(a) * r2; }
      else {
        const mid = { x: lerp(st.x, hl.x, 0.5), y: lerp(st.y, hl.y, 0.5) };
        x = lerp(mid.x, pl.x, march) + Math.cos(a) * r; y = lerp(mid.y, pl.y, march) + Math.sin(a) * r * 0.8;
      }
      let alpha = p < 0.12 && i >= 100 ? seg(p, 0.02, 0.12) * (i < 1500 ? 1 : 0) : 1;
      let col = 0;
      if (p >= 0.38 && i < 2) { col = 2; alpha = 0.9; x = st.x + (i ? 10 : -10); y = st.y + 22; }
      if (fire2 && i >= 2 && i < 2 + 21) { col = 2; alpha = 0.85; x = hl.x + ((i - 2) % 7 - 3) * 11; y = hl.y + 26 + Math.floor((i - 2) / 7) * 11; }
      alpha *= 1 - curfew * 0.85;
      setT(i, x, y, alpha, col);
    }
    hideAll(1500);
    state.freeze = fire1;
    // 시계
    const T = [[0, '10월 1일', '오전'], [0.12, '10월 1일', '낮'], [0.3, '10월 1일', '오후 6시'], [0.36, '10월 1일', '오후 7시'], [0.48, '10월 2일', '아침'], [0.66, '10월 2일', '경찰서 점거'], [0.72, '10월 2일', '오후'], [0.86, '10월 2일', '오후 5시 · 계엄령'], [0.94, '10월 2일', '저녁 7시 · 통행금지']];
    let cur = T[0]; T.forEach((t) => { if (p >= t[0]) cur = t; });
    hud.clock.innerHTML = `<small>1946년</small><b>${cur[1]}</b><span>${cur[2]}</span>`;
    hud.clock.classList.toggle('red', fire1 || (p >= 0.72 && p < 0.86));
  },
  spread(p) {
    const day = Math.round(lerp(1, 80, seg(p, 0.1, 0.92)));
    let gi = 0;
    REGIONS.forEach((rg, k) => {
      const on = day >= rg.day, cx = CX + rg.x * R, cy = CY + rg.y * R;
      for (let j = 0; j < 40; j++, gi++) { const a = R1[gi] * 6.28, r = Math.sqrt(R2[gi]) * R * 0.16; setT(gi, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, on ? 0.95 : 0.18, on ? 0 : 1); }
    });
    hideAll(gi);
    const d = new Date(1946, 9, day);
    hud.clock.innerHTML = `<small>1946년</small><b>${d.getMonth() + 1}월 ${d.getDate()}일</b><span>${day >= 76 ? '전국 73개 시군' : REGIONS.filter((r) => day >= r.day).length + '개 지역'}</span>`;
    hud.clock.classList.remove('red');
  },
  erased(p) {
    // 쌀알이 기록 문서의 글줄이 됨
    const bx = CX - R * 0.75, bw = R * 1.5, by = CY - R * 0.85;
    for (let i = 0; i < 900; i++) {
      const line = Math.floor(i / 36), col = i % 36;
      const x = bx + (col / 36) * bw * (line % 4 === 3 ? 0.6 : 1), y = by + line * (R * 1.7 / 25);
      if (ptr.in && Math.hypot(ptr.x - x, ptr.y - y) < 46) state.rub[i] = Math.min(1, state.rub[i] + 0.12);
      const rb = state.rub[i];
      setT(i, x, y, Math.min(1, 0.25 + seg(p, 0.2, 0.9) * 0.35 * (R1[i] > 0.3 ? 1 : 0) + rb * 0.75), rb > 0.5 ? 0 : 1);
    }
    hideAll(900);
  },
  boundary(p) {
    for (let i = 0; i < N; i++) setT(i, CX + (R1[i] - 0.5) * W * 0.9, H + 40 + R2[i] * 60, 0, 1);
    const y = Math.round(lerp(1946, 1950, seg(p, 0.05, 0.45)));
    hud.year.innerHTML = `<b>${y}</b>`;
  },
  mine(p) {
    const shown = Math.round(lerp(0, 1800, seg(p, 0.08, 0.8)));
    const hy = CY + R * 0.8, hw = R * 0.85;
    for (let i = 0; i < 1800; i++) {
      // 127개는 밝게(신원 확인), 나머지는 희미하게(추정)
      const lit = i % 14 === 0 && i / 14 < 127;
      if (i < shown) { const a = R1[i] * Math.PI, r = Math.sqrt(R2[i]); setT(i, CX + Math.cos(a + Math.PI) * hw * r, hy - Math.sin(a) * R * 0.28 * r, lit ? 1 : 0.32, lit ? 3 : 1); }
      else setT(i, CX + (R1[i] - 0.5) * 16, -20, 0, 1);
    }
    hideAll(1800);
    hud.depth.innerHTML = `<small>깊이</small><b>${Math.round(seg(p, 0, 0.9) * 100)}</b>`;
    state.torch = seg(p, 0.05, 0.2);
  },
  truth(p) {
    const hy = CY + R * 0.8, hw = R * 0.85;
    const rise = p > 0.44 ? seg(p, 0.44, 0.56) : 0, line = seg(p, 0.66, 0.74);
    let lifted = 0;
    for (let i = 0; i < 1800; i++) {
      const lit = i % 14 === 0 && i / 14 < 127;
      const a = R1[i] * Math.PI, r = Math.sqrt(R2[i]);
      let x = CX + Math.cos(a + Math.PI) * hw * r, y = hy - Math.sin(a) * R * 0.28 * r, al = lit ? 1 : 0.3, c = lit ? 3 : 1;
      if (!lit && lifted < 40 && R3[i] < 0.05) { lifted++; y = lerp(y, CY - R * 0.85 + R3[i] * 200, rise); x = lerp(x, CX + (R1[i] - 0.5) * R * 1.4, rise); al = lerp(al, 1, rise); c = rise > 0.5 ? 3 : 1; }
      setT(i, x, y, al, c);
    }
    hideAll(1800);
    state.truthLine = line;
  },
  share(p) {
    const k = seg(p, 0.05, 0.35);
    for (let i = 0; i < 600; i++) {
      const b = state.balls[i % 10], ang = R2[i] * 6.28, rr = Math.sqrt(R3[i]) * 22 * b.size;
      const bx = CX + Math.cos(b.a) * R * b.r, by = CY + Math.sin(b.a) * R * b.r * 0.75;
      setT(i, lerp(CX + (R1[i] - 0.5) * R * 2, bx + Math.cos(ang) * rr, k), lerp(CY + (R2[i] - 0.5) * R * 2, by + Math.sin(ang) * rr, k), 1, 0);
    }
    hideAll(600);
  },
  light(p) {
    const n = 700 + state.memories.length * 30;
    for (let i = 0; i < Math.min(N, n); i++) {
      const f = i % 7, fc = { x: CX + Math.cos(f / 7 * 6.28) * R * 0.75, y: CY + Math.sin(f / 7 * 6.28) * R * 0.6 - seg(p, 0, 1) * 40 };
      const th = R1[i] * 6.28, rr = Math.abs(Math.cos(2.5 * th)) * 46 * (0.4 + 0.6 * seg(p, 0, 0.4));
      setT(i, fc.x + Math.cos(th) * rr, fc.y + Math.sin(th) * rr, 0.85, i % 9 === 0 ? 3 : 0);
    }
    hideAll(Math.min(N, n));
  },
  archive(p) {
    for (let i = 0; i < 400; i++) { const a = R1[i] * 6.28, r = R * (0.9 + R2[i] * 0.6); setT(i, CX + Math.cos(a) * r, CY + Math.sin(a) * r * 0.7, 0.25, 0); }
    hideAll(400);
  },
};

// ---------------- 진행 계산 ----------------
let cur = 0, curP = 0;
const sections = [...document.querySelectorAll('.scene')];
function measure() {
  const mid = innerHeight * 0.5;
  for (let i = 0; i < sections.length; i++) {
    const r = sections[i].getBoundingClientRect();
    if (r.top <= mid && r.bottom > mid) { cur = i; curP = (mid - r.top) / r.height; return; }
  }
  if (sections[sections.length - 1].getBoundingClientRect().bottom <= mid) { cur = sections.length - 1; curP = 1; }
}

// 쌀알 그리기
function grain(x, y, rot, a, col, s = 1) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`;
  g.beginPath(); g.ellipse(0, 0, 3.4 * s, 1.5 * s, 0, 0, 6.283); g.fill();
  g.restore();
}

// ---------------- 장면별 배경 일러스트 ----------------
function drawBackdrop(id, p, t) {
  g.lineWidth = 1;
  if (id === 'life' || id === 'hunger') {
    // 밥상(원형 상) + 그릇
    g.strokeStyle = 'rgba(255,248,230,.12)'; g.beginPath(); g.ellipse(CX, CY, R * 1.12, R * 0.82, 0, 0, 6.283); g.stroke();
    BOWLS.forEach((b, k) => {
      const q = bowlPos(k);
      g.strokeStyle = 'rgba(255,248,230,.35)'; g.beginPath(); g.ellipse(q.x, q.y, 26, 14, 0, 0, 6.283); g.stroke();
      g.beginPath(); g.ellipse(q.x, q.y + 4, 18, 9, 0, 0, Math.PI); g.stroke();
    });
    if (id === 'hunger') {
      const sx = CX + R * 1.05, sy = CY + R * 0.75, k = seg(p, 0.05, 0.3);
      g.strokeStyle = `rgba(255,248,230,${0.45 * k})`;
      g.beginPath(); g.moveTo(sx - 36, sy - 30); g.quadraticCurveTo(sx - 46, sy + 30, sx, sy + 34); g.quadraticCurveTo(sx + 46, sy + 30, sx + 36, sy - 30); g.closePath(); g.stroke();
      g.fillStyle = `rgba(255,248,230,${0.55 * k})`; g.font = '12px Pretendard, sans-serif'; g.textAlign = 'center'; g.fillText('수집', sx, sy - 40);
      // 콜레라·수해: 물결 (p 0.6~)
      const wv = seg(p, 0.6, 0.8);
      if (wv > 0) { g.strokeStyle = `rgba(150,180,200,${0.25 * wv})`; for (let k2 = 0; k2 < 4; k2++) { g.beginPath(); for (let x = 0; x <= W; x += 12) g.lineTo(x, H - 30 - k2 * 14 + Math.sin(x / 40 + t * 1.5 + k2) * 5); g.stroke(); } }
    }
  }
  if (id === 'work') {
    // 유리 조형물 윤곽 (일러스트)
    const sc = R / 260, P = (x, y) => [CX + x * sc, CY + y * sc];
    g.strokeStyle = 'rgba(255,248,230,.22)'; g.lineWidth = 1.2;
    g.beginPath(); g.ellipse(CX, CY - 230 * sc, 140 * sc, 20 * sc, 0, 0, 6.283); g.stroke();
    [-1, 1].forEach((sg) => { g.beginPath(); g.moveTo(...P(sg * 140, -226)); g.quadraticCurveTo(...P(sg * 20, -150), ...P(sg * 12, -100)); g.lineTo(...P(sg * 14, 120)); g.quadraticCurveTo(...P(sg * 100, 150), ...P(sg * 100, 175)); g.stroke(); });
    g.beginPath(); g.moveTo(...P(-100, 175)); g.quadraticCurveTo(...P(0, 260), ...P(100, 175)); g.stroke();
    const parts = [[-230, '밥상'], [-60, '통로'], [90, '어둠'], [205, '그릇']];
    g.font = '12px Pretendard, sans-serif'; g.textAlign = 'left';
    parts.forEach(([yy, nm], k) => { const on = state.carK === k; g.fillStyle = `rgba(255,248,230,${on ? 0.95 : 0.35})`; g.fillText(`0${k + 1} ${nm}`, CX + 160 * sc, CY + yy * sc + 4); g.strokeStyle = `rgba(255,248,230,${on ? 0.6 : 0.15})`; g.beginPath(); g.moveTo(CX + 150 * sc, CY + yy * sc); g.lineTo(CX + 110 * sc, CY + yy * sc); g.stroke(); });
    g.lineWidth = 1;
  }
  if (id === 'street') {
    // 약도: 거리 선
    g.strokeStyle = 'rgba(255,248,230,.08)';
    for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(CX - R * 1.2, CY + k * R * 0.28); g.lineTo(CX + R * 1.2, CY + k * R * 0.28 + 20); g.stroke(); g.beginPath(); g.moveTo(CX + k * R * 0.3, CY - R); g.lineTo(CX + k * R * 0.3 + 30, CY + R); g.stroke(); }
    g.strokeStyle = 'rgba(255,248,230,.18)'; g.setLineDash([4, 6]);
    g.beginPath(); g.moveTo(CX - R * 1.2, CY - R * 0.62); g.lineTo(CX + R * 1.2, CY - R * 0.5); g.stroke(); g.setLineDash([]);
    if (state.freeze || (p >= 0.72 && p < 0.86)) { g.fillStyle = `rgba(200,56,47,${0.06 + 0.04 * Math.sin(t * 2)})`; g.fillRect(0, 0, W, H); }
    const cf = seg(p, 0.86, 0.98); if (cf > 0) { g.fillStyle = `rgba(0,0,0,${cf * 0.6})`; g.fillRect(0, 0, W, H); }
  }
  if (id === 'spread') {
    REGIONS.forEach((rg) => {
      const day = Math.round(lerp(1, 80, seg(p, 0.1, 0.92))), on = day >= rg.day, x = CX + rg.x * R, y = CY + rg.y * R;
      const gr = g.createRadialGradient(x, y, 0, x, y, R * 0.3); gr.addColorStop(0, on ? 'rgba(255,214,150,.22)' : 'rgba(255,255,255,.03)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, R * 0.3, 0, 6.283); g.fill();
    });
    // 대구 표시
    const dx = CX + 0.3 * R, dy = CY + 0.08 * R; g.strokeStyle = 'rgba(200,56,47,.8)'; g.beginPath(); g.arc(dx, dy, 6 + Math.sin(t * 3) * 2, 0, 6.283); g.stroke();
  }
  if (id === 'erased') {
    g.strokeStyle = 'rgba(255,248,230,.1)'; g.strokeRect(CX - R * 0.85, CY - R * 0.95, R * 1.7, R * 1.9);
  }
  if (id === 'mine' || id === 'truth') {
    // 수직 통로와 바닥 그릇
    const top = id === 'mine' ? -40 : -40, hy = CY + R * 0.8;
    g.strokeStyle = 'rgba(255,248,230,.2)';
    g.beginPath(); g.moveTo(CX - 14, top); g.bezierCurveTo(CX - 20, CY * 0.6, CX - 8, CY, CX - 16, hy - R * 0.35); g.stroke();
    g.beginPath(); g.moveTo(CX + 14, top); g.bezierCurveTo(CX + 20, CY * 0.6, CX + 8, CY, CX + 16, hy - R * 0.35); g.stroke();
    g.beginPath(); g.moveTo(CX - R * 0.95, hy - R * 0.32); g.quadraticCurveTo(CX, hy + R * 0.3, CX + R * 0.95, hy - R * 0.32); g.stroke();
    g.beginPath(); g.ellipse(CX, hy - R * 0.32, R * 0.95, 10, 0, 0, 6.283); g.stroke();
    if (id === 'mine') { const d = seg(p, 0, 0.9); g.fillStyle = `rgba(0,0,0,${0.15 + d * 0.35})`; g.fillRect(0, 0, W, H); }
    if (id === 'truth' && state.truthLine > 0) { const y = CY - R * 0.95; g.strokeStyle = `rgba(255,214,150,${0.6 * state.truthLine})`; g.beginPath(); g.moveTo(CX - R * state.truthLine, y); g.lineTo(CX + R * state.truthLine, y); g.stroke(); }
  }
  if (id === 'share') {
    state.balls.forEach((b) => { b.a += (b.ta - b.a) * 0.05; b.r += (b.tr - b.r) * 0.05; });
  }
  if (id === 'light') {
    const gr = g.createRadialGradient(CX, CY, 0, CX, CY, R * 1.4); gr.addColorStop(0, 'rgba(255,240,215,.08)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    state.memories.forEach((m, k) => { const x = CX + Math.cos(k * 2.4) * R * 0.9, y = CY - R * 0.9 - ((t * 8 + k * 40) % (H * 0.3)); const gg = g.createRadialGradient(x, y, 0, x, y, 18); gg.addColorStop(0, 'rgba(255,250,235,.95)'); gg.addColorStop(1, 'rgba(255,250,235,0)'); g.fillStyle = gg; g.beginPath(); g.arc(x, y, 18, 0, 6.283); g.fill(); m._x = x; m._y = y; });
  }
}

// ---------------- 라벨 위치 ----------------
function placeLabels(id, p) {
  Object.values(labelEls).forEach((l) => (l.style.opacity = 0, l.style.pointerEvents = 'none'));
  const put = (key, x, y, op = 1) => { const l = labelEls[key]; l.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`; l.style.opacity = op; l.style.pointerEvents = op > 0.3 ? 'auto' : 'none'; };
  if (id === 'street') DAEGU.forEach((n) => put('d-' + n.k, CX + n.x * R, CY + n.y * R - 30, 1 - seg(p, 0.9, 1)));
  if (id === 'spread') { const day = Math.round(lerp(1, 80, seg(p, 0.1, 0.92))); REGIONS.forEach((r) => put('r-' + r.name, CX + r.x * R, CY + r.y * R - R * 0.2, day >= r.day ? 1 : 0.35)); }
  if (id === 'truth') YEARS.forEach((yy, k) => put('y-' + yy.y, CX - R + (k / (YEARS.length - 1)) * R * 2, CY - R * 1.08, p >= yy.at ? 1 : 0.4));
}

// ---------------- 루프 ----------------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
  measure();
  const sc = SCENES[cur], id = sc.id, p = curP;
  TARGETS[id](p);
  document.body.dataset.scene = id;
  // HUD 가시성
  hud.clock.classList.toggle('on', id === 'street' || id === 'spread');
  hud.count.classList.toggle('on', id === 'demand');
  hud.year.classList.toggle('on', id === 'boundary');
  hud.depth.classList.toggle('on', id === 'mine');
  glass.classList.toggle('on', id === 'prologue' && state.entered);
  glass.style.opacity = id === 'prologue' ? seg(p, 0.2, 0.55) * (state.entered ? 0.9 : 0.5) : 0;
  [...prog.children].forEach((b, i) => b.classList.toggle('on', i <= cur));
  prog.children[cur].querySelector('i').style.width = Math.round(p * 100) + '%';

  g.fillStyle = id === 'mine' ? '#020202' : '#050505'; g.fillRect(0, 0, W, H);
  drawBackdrop(id, p, t);
  const torch = id === 'mine' && ptr.in ? state.torch || 0 : 0, tx = ptr.x, ty = ptr.y;
  const ease = reduced ? 1 : state.freeze ? 0 : id === 'mine' ? 0.035 : 0.075;
  for (let i = 0; i < N; i++) {
    X[i] += (TX[i] - X[i]) * ease; Y[i] += (TY[i] - Y[i]) * ease; A[i] += (TA[i] - A[i]) * 0.08;
    if (A[i] < 0.01) continue;
    if (!state.freeze) ROT[i] += (R3[i] - 0.5) * 0.01;
    let al = A[i];
    if (torch > 0) { const d = Math.hypot(X[i] - tx, Y[i] - ty); al *= lerp(1, d < 150 ? 1.25 - d / 300 : 0.12, torch); }
    if (al < 0.01) continue;
    grain(X[i], Y[i], ROT[i], Math.min(1, al), COLORS[C[i]], i === 0 && id === 'prologue' ? 3 : 1);
  }
  if (id === 'prologue') { // 첫 쌀알의 빛
    const hg = g.createRadialGradient(X[0], Y[0], 0, X[0], Y[0], 120); hg.addColorStop(0, 'rgba(255,240,210,.22)'); hg.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = hg; g.fillRect(X[0] - 120, Y[0] - 120, 240, 240);
  }
  if (torch > 0) { const tg = g.createRadialGradient(tx, ty, 0, tx, ty, 170); tg.addColorStop(0, `rgba(255,236,200,${0.1 * torch})`); tg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = tg; g.fillRect(tx - 170, ty - 170, 340, 340); }
  if (id === 'light') state.lamps.forEach((l) => { l.y -= l.v; l.x += Math.sin(t + l.ph) * 0.3; const r = 10 + Math.sin(t * 3 + l.ph) * 2; const lg = g.createRadialGradient(l.x, l.y, 0, l.x, l.y, r * 2.4); lg.addColorStop(0, 'rgba(255,240,205,.95)'); lg.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = lg; g.beginPath(); g.arc(l.x, l.y, r * 2.4, 0, 6.283); g.fill(); if (l.y < -40) l.y = H + 40; });
  if (id === 'hunger' && state.hold > 0.05) { g.strokeStyle = `rgba(255,248,230,${0.5 * state.hold})`; g.beginPath(); g.arc(ptr.x, ptr.y, 26 + state.hold * 10, -Math.PI / 2, -Math.PI / 2 + state.hold * 6.283); g.stroke(); }
  sound.update(id, p, { freeze: state.freeze, lamps: state.lamps.length });
  placeLabels(id, p);
  requestAnimationFrame(frame);
}

// ---------------- 캔버스 인터랙션 ----------------
addEventListener('click', (e) => {
  if (e.target.closest('.card, .bs-top, .bs-menu, .bs-progress, .lab, .bs-credits, .lb')) return;
  const id = SCENES[cur].id;
  if (id === 'prologue' && Math.hypot(e.clientX - X[0], e.clientY - Y[0]) < 60) { state.entered = true; sound.ping('enter'); setTimeout(() => window.scrollTo({ top: sections[0].offsetTop + sections[0].offsetHeight * 0.55, behavior: 'smooth' }), 300); }
  if (id === 'life') {
    BOWLS.forEach((b, k) => { const q = bowlPos(k); if (Math.hypot(e.clientX - q.x, e.clientY - q.y) < 36 && state.bowls[k] < 1) { state.bowls[k] = Math.min(1, state.bowls[k] + 0.5); const done = state.bowls.filter((v) => v >= 1).length; sound.ping(done === 10 && state.bowls[k] >= 1 ? 'bowlsDone' : 'bowl'); document.querySelectorAll('.bowl-n').forEach((n) => (n.textContent = done)); if (done === 10) showTip('한 집의 하루', '열 그릇이 모두 찼습니다. 이 평범한 밥상이 다음 장면에서 비어 갑니다.', { getBoundingClientRect: () => ({ left: CX - 120, top: CY + R * 0.7 }) }); else showTip(b.t, state.bowls[k] >= 1 ? '한 그릇을 다 담았습니다.' : '한 번 더 누르면 가득 찹니다.', { getBoundingClientRect: () => ({ left: q.x - 40, top: q.y - 10 }) }); } });
  }
  if (id === 'light' && state.lamps.length < 60) { sound.ping('lamp'); state.lamps.push({ x: e.clientX, y: e.clientY, v: 0.25 + Math.random() * 0.35, ph: Math.random() * 6 }); document.querySelectorAll('.lamp-n').forEach((n) => (n.textContent = state.lamps.length)); }
  if (id === 'share') {
    // 가장 가까운 주먹밥을 옆 자리로 건넴
    let best = null, bd = 1e9;
    state.balls.forEach((b) => { const x = CX + Math.cos(b.a) * R * b.r, y = CY + Math.sin(b.a) * R * b.r * 0.75, d = Math.hypot(e.clientX - x, e.clientY - y); if (d < bd) { bd = d; best = b; } });
    if (best && bd < 70) { best.ta += Math.PI * 2 / 10 * (1 + Math.floor(Math.random() * 3)); best.tr = 0.55 + Math.random() * 0.35; state.share++; sound.ping('share'); document.querySelectorAll('.share-n').forEach((n) => (n.textContent = state.share)); }
  }
});
addEventListener('pointermove', (e) => {
  const id = SCENES[cur].id;
  if (id === 'life') {
    BOWLS.forEach((b, k) => { const q = bowlPos(k); if (Math.hypot(e.clientX - q.x, e.clientY - q.y) < 30 && hud._last !== k) { hud._last = k; showTip(b.t, '그해의 평범한 한 끼 (일러스트) · 눌러서 밥을 담아 보세요', { getBoundingClientRect: () => ({ left: q.x - 40, top: q.y - 10 }) }); } });
  }
  if (id === 'mine' || id === 'truth') {
    for (let i = 0; i < 1800; i += 14) { if (C[i] === 3 && A[i] > 0.5 && Math.hypot(e.clientX - X[i], e.clientY - Y[i]) < 8) { if (hud._last !== i) { hud._last = i; showTip('신원이 확인된 사람', '127명 가운데 한 사람입니다. 이 전시는 이름을 표시하지 않습니다.', { getBoundingClientRect: () => ({ left: X[i] - 20, top: Y[i] }) }); } break; } }
  }
  if (id === 'light') state.memories.forEach((m) => { if (m._x && Math.hypot(e.clientX - m._x, e.clientY - m._y) < 20) showTip('남긴 문장', m.text, { getBoundingClientRect: () => ({ left: m._x - 60, top: m._y }) }); });
});
// 첫 쌀알 호버 시 안내
addEventListener('keydown', (e) => { if (SCENES[cur].id === 'prologue' && (e.key === 'Enter' || e.key === ' ') && !e.target.closest('textarea, button, a')) { state.entered = true; } });

// 기억 입력
document.querySelectorAll('.mem-f').forEach((f) => {
  const ta = f.querySelector('textarea'), n = f.querySelector('.mem-n');
  ta.addEventListener('input', () => (n.textContent = `${ta.value.length} / 120`));
  f.addEventListener('submit', (e) => {
    e.preventDefault(); const text = ta.value.trim().slice(0, 120); if (!text) return ta.focus();
    state.memories.push({ text }); sound.ping('memory'); try { localStorage.setItem('xpace-bitssal-v2', JSON.stringify(state.memories.slice(-20).map((m) => ({ text: m.text })))); } catch (e2) {}
    ta.value = ''; n.textContent = '0 / 120';
    f.parentElement.querySelector('.note').textContent = '당신의 문장이 빛이 되어 떠올랐습니다. 빛 위에 커서를 올리면 다시 볼 수 있어요. (이 브라우저에만 저장)';
  });
});

// 시작
document.fonts.ready.catch(() => {}).then(() => { document.querySelector('.bs-loader').classList.add('done'); requestAnimationFrame(frame); });
