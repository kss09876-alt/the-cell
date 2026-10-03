# THE CELL — Online Interactive Exhibition

큐브 하나가 하나의 전시가 되는 온라인 전시 플랫폼.

- **프론트엔드**: GitHub Pages (정적 HTML/JS, 빌드 없음, Three.js CDN)
- **콘텐츠 서버(CMS)**: Google Drive `THE CELL (online exhibition)` 폴더
  - `THE_CELL_cells` 시트 — 셀(전시) 목록
  - `THE_CELL_blocks` 시트 — 각 셀의 스크롤 스토리 블록
  - `images` 폴더 — 전시 이미지/영상 원본

시트를 고치면 **재배포 없이** 사이트에 바로 반영됩니다 (새로고침).
시트를 읽지 못하면 `data/cells.json` 백업 데이터로 표시됩니다.

## 구조

```
index.html     메인 — 3D 큐브 그리드 (큐브 클릭 → 전시 입장)
cell.html      전시 페이지 — ?id=c001
js/config.js   시트 ID 설정
js/data.js     드라이브 시트 로더 + 이미지/영상 URL 변환
js/main.js     큐브 그리드 (Three.js)
js/cell.js     스크롤 인터랙션 + 블록 렌더러
css/style.css  디자인
data/cells.json  백업 데이터
```

## THE_CELL_cells 컬럼

| 컬럼 | 설명 |
|---|---|
| id | 고유 ID (예: c001). 블록 시트의 cell_id와 연결 |
| order | 그리드 순서 |
| status | `open` 공개 / `coming` 예정(반투명 큐브) / `hidden` 숨김 |
| title, subtitle, artist, period, summary | 표시 텍스트 |
| color | 큐브·포인트 색 (#hex) |
| thumbnail | 큐브 앞면 이미지 (드라이브 파일 ID 또는 공유 링크) |
| bgm | 배경음악. Spotify 앨범·트랙·플레이리스트 링크(공식 임베드 플레이어) 또는 **사용 허락을 받은** 오디오 파일(드라이브 링크/mp3 URL), 또는 `ambient:cosmos`(브라우저에서 실시간 합성하는 오리지널 앰비언트) |
| fx | 메인 그리드 큐브 효과. `stars` = 별빛 큐브(발광·후광·별가루) |

## THE_CELL_blocks 컬럼

| 컬럼 | 설명 |
|---|---|
| cell_id | 소속 셀 id |
| order | 셀 안에서의 순서 |
| type | `cover` `text` `image` `gallery` `quote` `video` `sticky` `wave` `timeline` `piano` `cosmos` `quantum` `end` (cover의 align=`cosmos`는 별 배경) |
| title / body | 제목 / 본문 (줄바꿈 가능, `sticky`는 단계를 `\|`로 구분) |
| media | 드라이브 파일 ID·링크 / YouTube·Vimeo URL. `gallery`·`sticky`는 쉼표로 여러 개 |
| caption | 캡션·인용 출처 |
| bg | 섹션 배경색 (#hex, 선택) |
| align | `text`: center / `image`: full (화면 꽉 채움) |

## 이미지 올리는 법

1. 드라이브 `images` 폴더에 업로드 (폴더가 링크 공개 상태여야 함)
2. 파일 우클릭 → 링크 복사 → 시트 `media` 칸에 붙여넣기

## 새 연출 추가

`js/cell.js`의 `R` 객체에 타입을 추가하고 `css/style.css`에 스타일을 더하면 됩니다.
