// THE CELL — 데이터 소스 설정
// 구글 드라이브 'THE CELL (online exhibition)' 폴더의 시트 2개를 CMS로 사용합니다.
// 시트(또는 상위 폴더)는 '링크가 있는 모든 사용자 → 뷰어'로 공유되어 있어야 합니다.
export const CONFIG = {
  siteTitle: 'THE CELL',
  cellsSheetId: '1hezkf49jcPnoKdPU2gehtd-QzKsiqfDi4zNe1_RGAjY',   // THE_CELL_cells
  blocksSheetId: '1-l-01Syw0RUxzIoZRDQaQzDjMHttL5gLlRBPUZyfzTk',  // THE_CELL_blocks
  // 시트를 읽지 못할 때 쓰는 저장소 내 백업 데이터
  fallbackUrl: 'data/cells.json',
  // 메인 그리드 최소 큐브 수 (모자라면 빈 셀로 채움)
  minCubes: 12,
};
