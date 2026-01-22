# 3D 인터랙티브 포트폴리오

React와 Three.js를 활용한 듀얼 모드 인터랙티브 포트폴리오입니다. 전통적인 웹 포트폴리오와 3D 게임 환경을 자유롭게 전환하며 경험할 수 있습니다.

**Live Demo**: [https://kichan.site](https://kichan.site)

## 주요 기능

### 듀얼 모드 시스템
- **웹 모드**: 스크롤 기반 포트폴리오 웹사이트
  - 9개 프로젝트 갤러리 (주요 프로젝트 + 전체 프로젝트)
  - 프로젝트 상세 정보 모달 (개요, 성과, 도전 과제, 보고서)
  - 부드러운 스크롤 애니메이션
  - 다크/라이트 테마 토글
  - 떠다니는 파티클 배경 효과

- **게임 모드**: 3D 인터랙티브 환경
  - 4개의 탐험 가능한 레벨
  - 애니메이션 캐릭터 조작 (Idle, Walk, Run)
  - 문을 통한 레벨 전환
  - 인터랙티브 오브젝트 상호작용
  - 실시간 물리 엔진 (Rapier)
  - **실시간 미니맵** (플레이어 위치 + 상호작용 포인트)

### 게임 모드 - 4개의 레벨

#### 레벨 1 - 마을 (Village)
- 자연 풍경이 있는 시작 환경
- Level 2 (프로젝트 갤러리), Level 3 (사무실)로 이동하는 포털 문
- NPC 대화 시스템 (다크/라이트 모드에 따른 대사 변경)
- 그라디언트 바닥 셰이더

#### 레벨 2 - 프로젝트 갤러리 (Gallery)
- 3개의 프로젝트 캐비닛 (Asura, 편의점 솔루션, Void)
- E키로 각 캐비닛 상호작용 시 프로젝트 상세 정보 표시
- Level 1로 돌아가는 문

#### 레벨 3 - 기술 스택 사무실 (Office)
- 4개의 기술 스택 테이블 (Frontend, Backend, Game Dev, Tools)
- 테이블 근처 접근 시 자동으로 프로젝트별 기술 스택 표시
- Level 1과 Level 4로 이동하는 문

#### 레벨 4 - 개인 작업실 (Room)
- 어두운 공간 환경
- CabinetTelevision: 연락처 정보 표시
- Wall: 프로필 정보 표시
- DeskCorner: 포트폴리오 프로젝트 정보 표시
- Level 3로 돌아가는 문

### 미니맵 시스템
- 좌측 하단 200x200px 사각형 미니맵
- 실시간 플레이어 위치 표시 (파란 점)
- 상호작용 포인트 마커:
  - 노란색: 문 (이동 포인트)
  - 녹색: 캐비닛 (프로젝트)
  - 보라색: 테이블 (기술 스택)
  - 주황색: NPC
  - 분홍색: 특별 상호작용 (연락처, 프로필 등)

## 조작법

### 키보드
- **WASD**: 캐릭터 이동
- **Shift**: 달리기
- **E**: 문/오브젝트와 상호작용
- **C**: 캐릭터 위치 로그 (디버그)

### 마우스
- 게임 모드에서 화면 상단에 마우스를 올리면 네비게이션 바 표시

## 기술 스택

### Frontend
- **React 19**: 최신 React로 구축된 UI
- **Three.js**: 3D 그래픽 렌더링
- **React Three Fiber**: React용 Three.js 렌더러
- **@react-three/drei**: Three.js 유틸리티
- **@react-three/rapier**: Rapier 물리 엔진
- **JavaScript/JSX**: 메인 프로그래밍 언어

### 개발 도구
- **Create React App**: 빌드 도구
- **Vercel**: 배포 플랫폼
- **Git LFS**: 대용량 미디어 파일 관리

### 3D Assets
- **캐릭터 모델**: Suit.glb (Ultimate Animated Character Pack)
- **레벨 맵**: Level1Map-v3.glb, Level2Map.glb, Level3Map.glb, Level4Map.glb
- **사운드**: 발소리 (Step2.wav), 문 열림 소리 (opendoor.mp3)

## 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/kimkichan1225/Portfolio.git
cd portfolio-game
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm start
```
브라우저에서 `http://localhost:3000` 자동 실행

## 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```
`build/` 폴더에 최적화된 프로덕션 빌드 생성

### Vercel 배포
GitHub 연결 후 자동 배포 또는:
```bash
vercel --prod
```

## 프로젝트 구조

```
portfolio-game/
├── public/
│   ├── resources/
│   │   ├── GameView/
│   │   │   └── Suit.glb                    # 캐릭터 모델
│   │   │   └── Level1Map-v3.glb            # 레벨 1 맵
│   │   │   └── Level2Map.glb               # 레벨 2 맵
│   │   │   └── Level3Map.glb               # 레벨 3 맵
│   │   │   └── Level4Map.glb               # 레벨 4 맵
│   │   └── Sounds/
│   │       └── Step2.wav                   # 발소리
│   ├── sounds/
│   │   └── opendoor.mp3                    # 문 소리
│   ├── FirstProject.png                    # 프로젝트 이미지들
│   ├── SecondProject.png
│   ├── ThirdProject.png
│   ├── FourthProject.png
│   ├── StarryProject.png
│   ├── WebMMORPGProject.png
│   ├── kimkichan-1.png                     # 프로필 이미지
│   └── *.pdf                               # 프로젝트 보고서
├── src/
│   ├── App.js                              # 메인 애플리케이션 (~5000 lines)
│   ├── App.css                             # 메인 스타일
│   ├── useKeyboardControls.js              # 키보드 입력 훅
│   ├── TypingAnimation.js                  # 타이핑 효과 컴포넌트
│   ├── useScrollAnimation.js               # 스크롤 애니메이션 훅
│   ├── ProjectModal.js                     # 프로젝트 모달
│   ├── ProjectModal.css                    # 모달 스타일
│   └── TutorialPopup.css                   # 튜토리얼 팝업 스타일
├── vercel.json                             # Vercel 배포 설정
├── package.json
└── README.md
```

## 프로젝트 데이터

### 주요 프로젝트 (Featured)
1. **MetaPlaza** - 위치기반 3D 소셜 메타버스 (React 19 + Three.js + Spring Boot)
2. **Starry** - 별자리 기반 성향 시각화 플랫폼 (React 18 + Supabase)
3. **편의점 종합 솔루션** - 실시간 편의점 통합 관리 플랫폼 (React 19 + TypeScript + Supabase)

### 미니 프로젝트
4. **VibeCode Arena** - 멀티 AI 에이전트 기반 바이브코딩 웹 플랫폼

### 전체 프로젝트
5. **Asura** - 웹 멀티 격투 게임 (Node.js + Socket.IO + Three.js)
6. **Void** - 2D Unity Action RPG 졸업작품 (Unity 6 + C#)
7. **출석체크 시스템** - QR 코드 기반 출석 관리 (React + Supabase)
8. **신년계획 관리 웹 서비스** - 목표 관리 시스템 (PHP 8 + MySQL)
9. **Web MMORPG** - 브라우저 기반 2D MMORPG (React 18 + TypeScript + Socket.IO)

## 주요 상수

### 캐릭터 이동
- 걷기 속도: 8
- 달리기 속도: 18
- 발소리 간격: 걷기 0.6초, 달리기 0.45초

### 상호작용
- 상호작용 거리: 7 유닛
- 쿨다운: 500ms

### 카메라
- 오프셋: `(-0.00, 28.35, 19.76)`
- Lerp 속도: 2.0 (일반), 12.0 (타겟 추적)

### 미니맵
- 크기: 200x200px
- 위치: 좌측 하단 (20px, 20px)
- 업데이트 간격: 50ms

## 개발 가이드

### 새 프로젝트 추가 (웹 모드)
1. `projectsData` 배열에 프로젝트 객체 추가 (src/App.js)
2. 프로젝트 이미지/비디오를 `public/` 폴더에 추가
3. 필요시 GitHub/Demo URL 및 PDF 보고서 추가
4. 주요 프로젝트에 추가하려면 featured 배열에 ID 추가

### 새 레벨 추가
1. 새 게임 상태 추가 (예: `playing_level5`)
2. 레벨 컴포넌트 생성 (GLB 파일 로드 및 렌더링)
3. `Model` 컴포넌트에 문 상호작용 로직 추가
4. `setGameStateWithFade`에 스폰 위치 추가
5. `Minimap` 컴포넌트에 레벨 범위 및 상호작용 포인트 추가
6. `App.js`의 Canvas 내부에 레벨 조건부 렌더링 추가

## 배포 설정

### Vercel 설정 (vercel.json)
```json
{
  "buildCommand": "CI=false npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Git LFS
대용량 비디오 파일 (.mp4, .mov)은 Git LFS로 관리됩니다.
Vercel에서 Git LFS 활성화 필요.

## 라이선스

이 프로젝트는 개인 포트폴리오용입니다.

## 개발자

**김기찬**
- Website: [kichan.site](https://kichan.site)
- Email: kimkichan1225@gmail.com
- Phone: +82 10-4225-5388
- GitHub: [github.com/kimkichan1225](https://github.com/kimkichan1225)
- Instagram: [@kim_kichan](https://www.instagram.com/kim_kichan/)

---

**Tip**: 상단 우측의 버튼을 클릭하여 게임 모드로 전환하고 3D 환경을 직접 탐험해보세요!
