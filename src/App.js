import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, shaderMaterial, useFBX, Text } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import './App.css';
import './TutorialPopup.css';
import { useKeyboardControls } from './useKeyboardControls';
import { TypingAnimation } from './TypingAnimation';
import { useScrollAnimation } from './useScrollAnimation';
import { ProjectModal } from './ProjectModal';
import { Physics, RigidBody, CapsuleCollider } from '@react-three/rapier';

// 프로젝트 데이터
const projectsData = [
  {
    id: 1,
    category: 'KDT',
    categoryLabel: 'KDT 프로젝트 - 1차',
    title: 'Asura(웹 멀티 격투 게임)',
    description: 'Node.js와 Socket.IO를 활용한 실시간 웹 기반 멀티플레이어 액션 게임',
    image: '/FirstProject.png',
    video: '/FirstProjectGamePlay.mp4',
    tech: ['Node.js', 'Express', 'Socket.IO', 'JavaScript', 'HTML5', 'CSS3', 'Three.js'],
    overview: [
      '[ 개요 ]',
      'Node.js + Socket.IO 기반 실시간 웹 멀티플레이어 3D 격투 게임',
      'Three.js 3인칭 시점, 26종 캐릭터, 20+ 무기, 2개 맵',
      '',
      '[ 기간 ]',
      '2024.07.18 ~ 2024.07.28 (11일)',
      '',
      '[ 주요 기능 ]',
      '실시간 멀티플레이어: 최대 8인 동시 접속, 방 생성/참가 시스템',
      'AI 봇: 3단계 난이도, 상태 머신 기반 전투 AI',
      '무기 시스템: 데미지/넉백강도/공격판정 구간 등 세밀한 무기 데이터',
      '전투: HP 관리, 킬/데스 추적, 스코어보드'
    ],
    achievements: [
      '최대 8인 동시 접속 지원\nSocket.IO 기반 실시간 멀티플레이어 게임 시스템 구현',
      '방 생성/참가 시스템\n공개/비공개 방, 맵/인원/시간 설정 커스터마이징 지원',
      '26종 캐릭터 선택 시스템\nThree.js 활용 360도 회전 프리뷰 및 실시간 3D 렌더링',
      '5단계 상태 머신 AI 봇\n난이도별 차별화된 전투 AI (Easy/Normal/Hard)',
      '20+ 무기 시스템\nweapon_data.json 기반 데미지, 넉백강도/지속시간, 공격판정 구간 등 세밀한 밸런싱',
      '서버 권한 기반 검증\nHP/데미지 서버 검증으로 클라이언트 치팅 완전 차단',
      'AABB 충돌 감지 시스템\n벽 슬라이딩 이동 및 단차 오르기 물리 구현',
      '2개 맵 지원 (도시/아일랜드)\n맵별 경계 시스템 및 환경 데미지 적용',
      '무기 자동 리스폰 시스템\n맵 내 항상 10개 무기 유지로 게임 밸런스 보장',
      '완성도 높은 UI/UX\n킬 피드, 스코어보드, 사망 오버레이, 리스폰 시스템'
    ],
    challenges: [
      {
        title: 'AI 봇 시스템 구현',
        description: '문제: 봇이 단순하고 전략성 부족\n해결책: 5단계 상태 머신(idle/무기탐색/추격/도망/공격), 난이도 3단계, 저체력 타겟 우선 공격, 다수 적 회피\n결과: 지능적인 봇 행동, 난이도별 차별화된 플레이 경험'
      },
      {
        title: '멀티플레이어 동기화',
        description: '문제: 네트워크 지연 및 클라이언트 간 불일치\n해결책: Socket.IO 실시간 브로드캐스트, 서버 권한 HP/데미지 검증, gameUpdate 이벤트 동기화\n결과: 안정적인 8인 멀티플레이어, 치팅 방지'
      },
      {
        title: '무기 시스템 밸런싱',
        description: '문제: 무기 관리 및 균형 조정 필요\n해결책: weapon_data.json 기반 무기별 데미지/넉백강도·지속시간/발사체속도/공격판정 구간(activationWindows) 정의, 자동 리스폰(맵에 항상 10개 유지)\n결과: 무기별 차별화된 전투감, 균형잡힌 게임플레이'
      },
      {
        title: '충돌 감지 시스템',
        description: '문제: 3D 환경에서 정확한 충돌 처리 필요\n해결책: AABB 기반 충돌 감지, X/Z축 개별 테스트로 벽 슬라이딩, 단차 오르기 구현\n결과: 자연스러운 캐릭터 이동, AI 봇 경로 탐색'
      },
      {
        title: '킬 어트리뷰션 정확성',
        description: '문제: 여러 플레이어 공격 시 킬 판정 모호\n해결책: lastHitBy 추적 시스템, killProcessed 플래그로 중복 방지, 서버 권한 스코어보드\n결과: 정확한 킬 부여, 조작 불가능한 스코어 관리'
      }
    ],
    github: 'https://github.com/kimkichan1225/KDTWebGame',
    demo: 'https://kdtwebgame.onrender.com/',
    reports: [
      {
        title: '계획 보고서',
        file: '/FirstProjectPlanReport.pdf'
      },
      {
        title: '완료 보고서',
        file: '/FirstProjectFinishReport.pdf'
      },
      {
        title: '발표 PPT',
        file: '/FirstProjectPowerPoint.pdf'
      }
    ]
  },
  {
    id: 2,
    category: 'KDT',
    categoryLabel: 'KDT 프로젝트 - 2차',
    title: '편의점 종합 솔루션',
    description: 'React 19 + TypeScript로 구축한 실시간 편의점 통합 관리 플랫폼',
    image: '/SecondProject.png',
    video: '/SecondProjectPlay.mov',
    tech: ['React 19', 'TypeScript', 'Vite 6', 'Supabase', 'PostgreSQL', 'TailwindCSS', 'CSS3', 'Zustand', 'TanStack Query'],
    overview: [
      '[ 개요 ]',
      'React 19 + TypeScript + Supabase 실시간 편의점 통합 플랫폼',
      '고객/점주/본사 3개 역할, 17개 테이블, 13개 함수, 15개 트리거',
      '',
      '[ 기간 ]',
      '2024.08.11 ~ 2024.08.22 (12일)',
      '',
      '[ 주요 기능 ]',
      '고객: 지점 검색, 토스페이먼츠 결제, 실시간 주문 추적',
      '점주: 주문/재고 관리, 본사 발주, 매출 분석 대시보드',
      '본사: 전체 지점 모니터링, 상품 마스터 관리, 물류 승인',
      '공통: RLS 정책 기반 역할별 데이터 접근 제어'
    ],
    achievements: [
      '3개 역할 기반 시스템\n고객/점주/본사 완전히 분리된 UI/UX 및 권한 체계 구현',
      '17개 테이블 정규화 ERD\nProfiles, Stores, Products, Orders, Supply 등 완전한 관계형 DB 설계',
      'RLS 정책 기반 보안\nSupabase Row Level Security로 역할별 데이터 접근 완벽 제어',
      'PostgreSQL 자동화 시스템\n13개 함수 + 15개 트리거로 재고 차감, 매출 집계 완전 자동화',
      'Supabase Realtime 구독\n주문/재고 변경 사항 실시간 UI 업데이트',
      '토스페이먼츠 결제 연동\nPaymentKey unique constraint로 중복 결제 완벽 방지',
      'TypeScript Strict Mode\n전체 코드베이스 타입 안전성 보장 및 IDE 자동완성 지원',
      '공급망 관리 워크플로우\n지점 발주 → 본사 승인 → 배송 → 입고 전체 프로세스 구현',
      'TanStack Query 서버 상태 관리\n캐싱, 재시도, 낙관적 업데이트로 최적화된 데이터 패칭',
      'Vite + Express SPA 배포\nNetlify/Render 배포 및 클라이언트 라우팅 완벽 처리'
    ],
    challenges: [
      {
        title: '다중 역할 시스템 설계',
        description: '문제: 고객/점주/본사 3개 역할의 완전히 다른 UI/UX 및 권한 체계 필요\n해결책: Supabase RLS 정책으로 테이블 레벨 접근 제어, profiles.role + auth.uid() 동적 권한 검증, React Router Protected Routes\n결과: 역할별 완벽히 분리된 경험, 데이터 보안 강화'
      },
      {
        title: '중복 결제 방지 시스템',
        description: '문제: 토스페이먼츠 결제 후 네트워크 오류/새로고침으로 중복 주문 발생\n해결책: 3단계 방어 (sessionStorage 상태 추적, PaymentKey unique constraint, 주문 생성 전 체크), PostgreSQL 트랜잭션 원자성 보장\n결과: 중복 결제 완전 차단, 안정적인 결제 프로세스'
      },
      {
        title: '실시간 재고 동기화',
        description: '문제: 주문 시 재고 차감 및 여러 사용자 간 재고 동기화 필요\n해결책: PostgreSQL Trigger로 order_items 삽입 시 자동 재고 차감, inventory_transactions 이력 관리, Supabase Realtime 구독\n결과: 완전 자동화된 재고 관리, 실시간 UI 업데이트'
      },
      {
        title: '공급망 관리 워크플로우',
        description: '문제: 지점 발주부터 입고까지 복잡한 프로세스 관리\n해결책: supply_requests/items/shipments 3개 테이블 연계, 상태별 자동 처리, 배송 완료 시 재고 자동 증가, 실시간 알림\n결과: 완전한 공급망 관리 시스템, 효율적인 물류 처리'
      },
      {
        title: 'TypeScript 타입 안전성',
        description: '문제: 대규모 코드베이스에서 타입 오류 및 개발 생산성 저하\n해결책: Supabase 자동 생성 타입 + 커스텀 타입, Zustand/TanStack Query 제네릭 타입, TypeScript Strict Mode\n결과: 완벽한 타입 추론, IDE 자동완성, null/undefined 안전성 보장'
      }
    ],
    github: 'https://github.com/kimkichan1225/WebConvi',
    demo: 'https://webconvi.netlify.app/',
    reports: [
      {
        title: '계획 보고서',
        file: '/SecondProjectPlanReport.pdf'
      },
      {
        title: '완료 보고서',
        file: '/SecondProjectFinishReport.pdf'
      },
      {
        title: '발표 PPT',
        file: '/SecondProjectPowerPoint.pdf'
      }
    ]
  },
  {
    id: 3,
    category: 'KDT',
    categoryLabel: 'KDT 프로젝트 - 3차',
    title: 'MetaPlaza(위치기반 3D 소셜 메타버스)',
    description: 'React 19 + Three.js + Spring Boot로 구축한 위치기반 3D 소셜 커뮤니티 플랫폼',
    image: '/FourthProject.png',
    video: null,
    tech: ['React 19', 'Three.js', 'React Three Fiber', 'Spring Boot', 'WebSocket', 'MySQL', 'JWT', 'Mapbox'],
    overview: [
      '[ 개요 ]',
      'React 19 + Three.js + Spring Boot 위치기반 3D 소셜 메타버스',
      'GPS 근거리 방 생성, 실시간 캐릭터 렌더링, WebSocket 동기화',
      '',
      '[ 기간 ]',
      '2024.08.11 ~ 2024.08.22 (12일)',
      '',
      '[ 주요 기능 ]',
      '위치기반: Geolocation + Turf.js GPS 근거리 방 생성/필터링',
      '3D 메타버스: Three.js LOD/인스턴싱, 다중 사용자 렌더링',
      '소셜: 친구 시스템, 실시간 채팅, 미니게임, PortOne 결제',
      '백엔드: Spring Security + JWT + Redis 세션 관리'
    ],
    achievements: [
      'Three.js LOD 렌더링\nLevel of Detail + InstancedMesh로 50명 이상 동시 렌더링 60fps 유지',
      'GPS 위치기반 시스템\nGeolocation + Turf.js Haversine 공식으로 반경 내 방 필터링',
      'WebSocket 실시간 동기화\nSocket.io + STOMP로 캐릭터 이동/채팅 양방향 통신',
      'Spring Security + JWT 인증\nAccess/Refresh Token 전략, Stateless 인증 시스템',
      'Redis 세션 캐싱\nToken Blacklist 관리 및 DB 부하 감소',
      'Mapbox API 지도 연동\n생성된 방을 실시간 지도에 마커로 표시',
      'GLTF 3D 캐릭터 시스템\nAnimationMixer 애니메이션 제어, 커스터마이징 시스템',
      'Spring Boot 백엔드\nJPA + MySQL 데이터 관리, RESTful API + DTO 패턴',
      'AWS 프로덕션 배포\nS3(파일) + RDS(DB) + EC2(서버) 인프라 구축',
      'PortOne 결제 연동\n아이템 상점 실제 결제 시스템 구현'
    ],
    challenges: [
      {
        title: '3D 렌더링 최적화',
        description: '문제: 다중 사용자 환경에서 프레임 드롭 발생\n해결책: LOD 시스템으로 거리별 모델 디테일 조절, InstancedMesh 배치 최적화, Frustum Culling\n결과: 50명 이상 동시 렌더링 60fps 유지'
      },
      {
        title: 'GPS 위치 서비스',
        description: '문제: 실시간 위치 기반 방 생성 및 근거리 필터링\n해결책: Geolocation API 위치 추적, Turf.js Haversine 공식으로 거리 계산, 반경 내 방 필터링, 지도 마커 표시\n결과: 정확한 위치 기반 서비스, 근거리 사용자만 접속'
      },
      {
        title: 'WebSocket 실시간 통신',
        description: '문제: 다중 사용자 캐릭터 이동 및 채팅 동기화\n해결책: Socket.io + STOMP 양방향 통신, 클라이언트 예측 + 서버 검증, 재연결 로직, 세션 복구\n결과: 안정적인 실시간 멀티플레이 환경'
      },
      {
        title: 'Spring Boot 인증 시스템',
        description: '문제: 안전한 사용자 인증 및 세션 관리\n해결책: Spring Security + JWT Stateless 인증, Access/Refresh Token 전략, Redis Token Blacklist\n결과: 보안 강화된 인증, 확장 가능한 세션 관리'
      },
      {
        title: '3D 캐릭터 애니메이션',
        description: '문제: 자연스러운 캐릭터 이동 및 애니메이션 전환\n해결책: GLTF 모델 로딩, AnimationMixer 제어, WASD 입력 → 이동/회전 → 애니메이션 전환(Idle/Walk/Run)\n결과: 부드러운 캐릭터 제어, 커스터마이징 시스템'
      }
    ],
    github: 'https://github.com/kimkichan1225/3DCommunity',
    demo: 'https://metaplaza-ashy.vercel.app',
    reports: []
  },
  {
    id: 4,
    category: '대학 졸업작품',
    categoryLabel: '대학 졸업작품',
    title: 'Void(2D Unity Action RPG)',
    description: 'Unity 6로 제작한 2D 액션 RPG 게임 (졸업 프로젝트)',
    image: '/ThirdProject.png',
    video: null,
    tech: ['Unity 6', 'C#', 'Windows'],
    overview: [
      '[ 개요 ]',
      'Unity 6로 제작한 2D 액션 RPG 졸업 프로젝트',
      '실시간 액션 + 턴제 보스전 하이브리드 전투 시스템',
      '3종 무기(검/창/메이스), 다단계 스테이지, RPG 성장 요소',
      '',
      '[ 기간 ]',
      '2025.08 ~ 2025.11 (4개월)',
      '',
      '[ 주요 기능 ]',
      '전투: 실시간 액션(일반), 카드+주사위 턴제(보스)',
      '무기: 검(밸런스), 창(사거리), 메이스(고화력)',
      '시스템: 레벨업, 인벤토리, 상점, 세이브/로드 (3슬롯)'
    ],
    achievements: [
      '직관적인 조작감 구현 (WASD 이동, 대시, 점프, 벽 슬라이딩)',
      '무기별 차별화된 전투 경험 (검: 밸런스형, 창: 사거리, 메이스: 고화력)',
      '보스전 턴제 시스템으로 전략적 깊이 추가 (카드 선택 + 주사위 운)',
      '체계적인 스테이지 진행 구조 (난이도 곡선 설계)',
      '몰입형 UI/UX (체력바, 스탬프 카드, 보스 HP, 턴 타이머)',
      '안정적인 세이브/로드 시스템 (슬롯별 독립 저장)',
      '다양한 적 AI 패턴 구현 (일반 몬스터 + 턴제 보스 전투)',
      '상점/인벤토리/강화 시스템으로 플레이어 성장 경험 제공'
    ],
    challenges: [
      {
        title: '하이브리드 전투 시스템 설계',
        description: '실시간 액션 전투와 턴제 카드 배틀을 하나의 게임에 통합. 일반 몬스터는 실시간 히트박스 판정 및 넉백 시스템으로 빠른 전투감 제공. 보스전은 턴제 카드 선택 + 주사위 메커니즘으로 전환하여 전략적 깊이 추가. 전투 모드 전환 시 UI, 카메라, 입력 시스템을 완전히 교체하여 자연스러운 게임플레이 유지.'
      },
      {
        title: '무기별 밸런싱 및 차별화',
        description: '3종 무기(검/창/메이스)의 공격력, 공격속도, 사거리, 넉백 효과를 세밀하게 조정. 검: 밸런스형(중간 데미지, 빠른 속도), 창: 사거리형(낮은 데미지, 긴 리치), 메이스: 파워형(높은 데미지, 느린 속도, 강한 넉백). 각 무기의 애니메이션, 히트박스, 콤보 시스템을 개별 설계하여 플레이 스타일 차별화. 보스전에서는 무기별로 카드 능력치 보정 적용.'
      },
      {
        title: '턴제 보스 전투 및 주사위 시스템',
        description: '보스전 진입 시 실시간 액션에서 턴제 카드 배틀로 완전 전환. 플레이어와 보스가 번갈아 카드를 선택하고 주사위를 굴려 데미지 결정. 주사위 결과에 따라 카드 효과 증폭 또는 감소 (크리티컬/일반/미스). 턴 타이머, 카드 선택 UI, 주사위 애니메이션, 데미지 계산 로직 구현. 보스 HP가 0이 되면 스테이지 클리어 및 보상 지급.'
      },
      {
        title: '복잡한 스테이지 진행 및 상태 관리',
        description: '튜토리얼 → 숲 맵 → 성 → 최종 보스로 이어지는 다단계 구조 설계. 각 스테이지별 적 배치, 난이도 조정, 보상 설정. 스테이지 간 이동 시 플레이어 상태(HP, 레벨, 인벤토리) 유지. 대장간(무기 강화), 상점(아이템 구매), 라이프맵(스토리 진행) 등 서브 시스템 통합. SceneManager를 활용한 씬 전환 및 데이터 전달.'
      },
      {
        title: '세이브/로드 시스템 및 데이터 직렬화',
        description: 'JSON 기반 세이브 시스템으로 플레이어 데이터(레벨, 스탯, 인벤토리, 스테이지 진행도, 무기 강화 정보) 저장. 3개 세이브 슬롯 지원으로 여러 플레이스루 관리 가능. Application.persistentDataPath에 슬롯별 JSON 파일 저장. 로드 시 저장된 데이터 역직렬화하여 게임 상태 복원. 세이브 파일 무결성 검증 및 버전 관리로 데이터 손실 방지.'
      }
    ],
    github: 'https://github.com/kimkichan1225/2DUnityGame',
    demo: 'https://github.com/kimkichan1225/2DUnityGame/releases/download/v1.0.0/Builds.zip',
    reports: [
      {
        title: '프로젝트 보고서',
        file: '/ThirdProjectReport.pdf'
      },
      {
        title: '발표 PPT',
        file: '/ThirdProjectPowerPoint.pdf'
      }
    ]
  },
  {
    id: 5,
    category: '기타',
    categoryLabel: '기타',
    icon: '📋',
    title: '출석체크 시스템',
    description: 'QR 코드 기반 모바일 친화적 출석 관리 웹 애플리케이션',
    image: null,
    video: null,
    tech: ['React', 'Vite', 'Supabase', 'TailwindCSS'],
    overview: [
      '[ 개요 ]',
      'React 18 + Vite + Supabase QR 기반 출석 관리 시스템',
      '사용자: QR 스캔 출석, 관리자: 회원/출석 관리, 엑셀 내보내기',
      '',
      '[ 주요 기능 ]',
      '사용자: html5-qrcode QR 스캔, 이름 자동완성/저장, 출석 애니메이션',
      '관리자: 회원 등록/삭제, 출석 기록 조회, 수동 출석 처리, 엑셀 내보내기',
      'QR: QR 코드 생성/다운로드/인쇄, 모임 활성화/비활성화',
      '보안: Supabase RLS 정책, Auth 기반 권한 관리'
    ],
    achievements: [
      'QR 코드 출석 시스템\nhtml5-qrcode 카메라 스캔, qrcode.react 코드 생성',
      'Supabase RLS 보안\n역할별 데이터 접근 제어, Public 읽기/삽입, 관리자 전체 권한',
      'PostgreSQL 자동화\nUNIQUE INDEX로 일일 중복 출석 방지, CASCADE 삭제',
      'Supabase Realtime 구독\n새로운 출석/회원 추가 시 실시간 UI 자동 업데이트',
      '엑셀 내보내기 시스템\nxlsx 라이브러리 년도별 시트, 월/일 헤더 형식',
      '모바일 최적화 UI\nTailwind CSS 반응형 디자인, 터치 친화적 인터페이스',
      '이름 자동완성\n로컬 스토리지 저장, 다음 출석 시 자동 입력',
      '관리자 대시보드\n회원/출석 관리, 미출석자 실시간 표시, 검색 기능',
      '회원가입 시 모임 자동 생성\n관리자 계정과 모임 연동, 탈퇴 시 완전 삭제',
      'Netlify 배포\nVite 빌드 최적화, 환경변수 관리'
    ],
    challenges: [
      {
        title: 'QR 출석 시스템 구현',
        description: '문제: QR 스캔부터 출석 기록까지 원활한 플로우 필요\n해결책: html5-qrcode 카메라 스캔, QR 데이터로 이벤트 조회, 이름 입력 자동완성, UNIQUE INDEX로 일일 중복 방지\n결과: 3초 내 출석 완료, 직관적인 사용자 경험'
      },
      {
        title: 'RLS 보안 및 권한 관리',
        description: '문제: 사용자와 관리자 권한 분리 필요\n해결책: Supabase RLS 정책 (Public 읽기/삽입, 관리자 auth.uid() 검증), Service Role Key 관리자 전체 권한\n결과: 테이블 레벨 보안, 안전한 데이터 접근'
      },
      {
        title: '실시간 데이터 동기화',
        description: '문제: 관리자 화면 실시간 업데이트 필요\n해결책: Supabase Realtime 구독, users/attendances 테이블 리스닝, 이벤트 발생 시 자동 리렌더링\n결과: 새 출석/회원 즉시 반영, 실시간 모니터링'
      },
      {
        title: '엑셀 내보내기 최적화',
        description: '문제: 출석 기록을 보기 쉬운 형식으로 제공\n해결책: xlsx 라이브러리, 년도별 시트 분리, 1행 월/2행 일/3행~ 회원별 출석(O/-) 형식\n결과: 직관적인 엑셀 파일, 쉬운 출석 현황 파악'
      },
      {
        title: '모바일 최적화',
        description: '문제: 스마트폰에서 QR 스캔 및 출석 체크\n해결책: Tailwind CSS 모바일 퍼스트 디자인, 터치 최적화 버튼, 카메라 권한 처리\n결과: 모든 디바이스에서 원활한 출석 체크'
      }
    ],
    github: 'https://github.com/kimkichan1225/Attendance',
    demo: 'https://attendancekim.netlify.app/',
    reports: []
  },
  {
    id: 6,
    category: '기타',
    categoryLabel: '기타',
    icon: '📅',
    title: '신년계획 관리 웹 서비스',
    description: '"계획 → 실행 → 회고" 흐름을 구현한 PHP 8 기반 목표 관리 시스템',
    demo: 'https://new-year-plan.up.railway.app/login.php',
    tech: ['PHP 8', 'MySQL 8.0', 'PDO', 'JavaScript', 'HTML5/CSS3'],
    overview: [
      '[ 개요 ]',
      'PHP 8 + MySQL 기반 연간 목표 관리 시스템',
      '목표 자동 분해(12개월), 진행률 자동 계산, 회고 시스템',
      '',
      '[ 기간 ]',
      '2026.01 (개인 프로젝트)',
      '',
      '[ 주요 기능 ]',
      '자동 계획 분해: 목표 생성 시 12개월 계획 자동 생성 및 분기별 그룹화',
      '진행률 계산: 완료된 계획 기반 자동 진행률 계산 및 상태 관리',
      '회고 시스템: 월별/목표별 회고 작성 및 연말 요약',
      '대시보드: 통계 및 진행 상황 시각화'
    ],
    achievements: [
      '자동 계획 분해 시스템\n목표 생성 시 12개월 계획 자동 생성 및 분기별(Q1~Q4) 그룹화',
      '진행률 자동 계산 엔진\n완료된 월 계획 수 / 전체 12개월 × 100 자동 계산, DB 트리거로 실시간 업데이트',
      '회고 시스템\n월별/목표별 회고 작성, 연말(12월) 요약 회고 기능',
      '트랜잭션 기반 데이터 무결성\n목표 생성 + 12개월 계획 생성을 단일 트랜잭션으로 처리',
      '상태 자동 관리\n진행률 기반 목표 상태 자동 전환 (미시작/진행중/완료)',
      '보안 구현\npassword_hash 비밀번호 해싱, PDO Prepared Statements, htmlspecialchars XSS 방지',
      'MVC 패턴 적용\nUser/Goal/GoalPlan/Reflection 모델 분리, PSR-12 코딩 표준 준수',
      '대시보드 통계\n전체 목표 통계, 카테고리별 분포, 진행 상황 시각화'
    ],
    challenges: [
      {
        title: '목표-계획 트랜잭션 처리',
        description: '문제: 목표 생성과 12개월 계획 생성 중 실패 시 데이터 불일치\n해결책: beginTransaction()으로 목표 INSERT와 12개월 계획 INSERT를 묶어 처리, 실패 시 rollback\n결과: 원자성 보장, 목표와 계획의 일관성 유지'
      },
      {
        title: 'DB 트리거를 통한 진행률 자동 계산',
        description: '문제: 계획 완료 체크 시 PHP에서 진행률을 계산하면 동기화 누락 가능\n해결책: tr_update_progress_after_plan_update 트리거로 goal_plans UPDATE 시 자동으로 goals.progress_percentage 재계산\n결과: 실시간 진행률 동기화, 서버 로직 간소화'
      },
      {
        title: '데이터 무결성 보장',
        description: '문제: 동일 목표에 같은 월 계획이 중복 생성될 가능성\n해결책: goal_plans 테이블에 UNIQUE KEY (goal_id, month) 설정\n결과: DB 수준에서 중복 방지, 데이터 무결성 보장'
      }
    ],
    github: 'https://github.com/kimkichan1225/2026plan-php',
    reports: []
  }
];

// 웹 모드 콘텐츠 컴포넌트
function WebModeContent({ onToggleMode, isDarkMode }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [homeRef, homeVisible] = useScrollAnimation();
  const [aboutRef, aboutVisible] = useScrollAnimation();
  const [projectsRef, projectsVisible] = useScrollAnimation();
  const [contactRef, contactVisible] = useScrollAnimation();

  // 이메일 복사 함수
  const handleCopyEmail = async (e) => {
    e.preventDefault();
    const email = 'kimkichan1225@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      showCustomPopup('이메일이 복사되었습니다! 📋');
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  return (
    <>
      <div className="web-mode-content">
        <section id="home" className="section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Floating Particles */}
          <div className="floating-particles">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${8 + Math.random() * 7}s`,
                }}
              />
            ))}
          </div>

          <div ref={homeRef} className={`fade-in ${homeVisible ? 'visible' : ''}`} style={{ textAlign: 'center', maxWidth: '900px', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              <span className="highlight">
                <TypingAnimation
                  text="안녕하세요! 김기찬입니다."
                  speed={150}
                />
              </span>
            </h2>
            <div style={{ fontSize: '1rem', color: '#666', lineHeight: '1.6' }}>
              <p><strong>Full-stack & Game Developer</strong></p>
              <p style={{ marginTop: '1.5rem', lineHeight: '1.8' }}>
                실시간 웹 애플리케이션부터 3D 인터랙티브 경험까지,<br />
                다양한 기술 스택으로 창의적인 아이디어를<br />
                실제 동작하는 서비스로 구현하는 개발자입니다.
              </p>
              <p style={{ marginTop: '1.5rem', lineHeight: '1.8', color: '#5B7FFF', fontWeight: '500' }}>
                매일 1%씩 성장하며, 경험을 통해 더 나은 답을 찾아갑니다.
              </p>

              <div style={{
                marginTop: '3rem',
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '1px solid rgba(91, 127, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ color: '#5B7FFF', marginBottom: '1rem', fontSize: '1.3rem' }}>
                  🎮 인터랙티브 포트폴리오
                </h3>
                <p style={{ lineHeight: '1.8', color: '#555' }}>
                  이 포트폴리오는 <strong>웹 모드</strong>와 <strong>게임 모드</strong> 두 가지로 구성되어 있습니다.<br />
                  <span style={{ color: '#667eea', fontWeight: '500' }}>웹 모드</span>에서는 프로젝트와 정보를 편리하게 탐색하고,<br />
                  <span style={{ color: '#667eea', fontWeight: '500' }}>게임 모드</span>에서는 3D 환경에서 직접 캐릭터를 조작하며 인터랙티브하게 경험할 수 있습니다.
                </p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>
                  💡 상단 우측의 <strong>🎮 버튼</strong>을 클릭하여 게임 모드로 전환해보세요!
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div ref={aboutRef} className={`fade-in ${aboutVisible ? 'visible' : ''}`} style={{ width: '100%', maxWidth: '1200px' }}>
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', marginBottom: '4rem', marginLeft: '4rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="profile-image-container" style={{ border: 'none', boxShadow: 'none', borderRadius: '10px', flexShrink: 0 }}>
                  <img src="/Kimkichan-1.png" alt="김기찬" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', border: 'none' }} />
                </div>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>📅 2001.12.25</p>
              </div>

              <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'left' }}>안녕하세요, 김기찬입니다!</h3>
                <p style={{ lineHeight: '1.7', color: '#666', marginBottom: '1rem', textAlign: 'justify', wordBreak: 'keep-all' }}>
                  <strong style={{ color: '#5B7FFF' }}>"어떻게 하면 더 재미있는 경험을 만들 수 있을까?"</strong>라는 질문에서 시작해, <strong>웹과 게임 개발의 경계를 넘나드는</strong> 프로젝트들을 만들어왔습니다.
                </p>
                <p style={{ lineHeight: '1.7', color: '#666', marginBottom: '1rem', textAlign: 'justify', wordBreak: 'keep-all' }}>
                  <strong style={{ color: '#5B7FFF' }}>Socket.IO</strong>로 구현한 <strong>멀티플레이어 액션 게임</strong>에서는 수십 명이 동시에 플레이하며 실시간으로 상호작용하는 시스템을, <strong style={{ color: '#5B7FFF' }}>React 19</strong>과 <strong style={{ color: '#5B7FFF' }}>Supabase</strong>를 활용한 편의점 솔루션에서는 실무에 바로 적용 가능한 <strong>통합 관리 시스템</strong>을 구축했습니다. <strong style={{ color: '#5B7FFF' }}>Unity</strong>로 제작한 <strong>2D RPG</strong>에서는 턴제 전투와 주사위 메커니즘이라는 독특한 조합을 시도했죠.
                </p>
                <p style={{ lineHeight: '1.7', color: '#666', marginBottom: '1rem', textAlign: 'justify', wordBreak: 'keep-all' }}>
                  지금 보고 계신 이 포트폴리오 역시 단순한 소개 페이지가 아닌, <strong style={{ color: '#5B7FFF' }}>Three.js</strong> 기반의 <strong>3D 게임 세계를 직접 탐험할 수 있는 인터랙티브 경험</strong>입니다. <strong style={{ color: '#5B7FFF' }}>TypeScript</strong>, <strong style={{ color: '#5B7FFF' }}>React Three Fiber</strong>, <strong style={{ color: '#5B7FFF' }}>커스텀 GLSL 셰이더</strong>까지 활용해 웹에서도 몰입감 있는 3D 환경을 구현했습니다.
                </p>
                <p style={{ lineHeight: '1.7', color: '#666', textAlign: 'justify', wordBreak: 'keep-all' }}>
                  <strong style={{ color: '#5B7FFF' }}>AI 개발 도구</strong>를 단순히 '사용'하는 것을 넘어, 이를 통해 <strong>개발 워크플로우 자체를 재설계</strong>하고 있습니다. 빠른 프로토타이핑과 반복적인 개선 사이클로 <strong>아이디어를 현실로 만드는 속도</strong>를 높이고, 더 많은 시간을 <strong>창의적인 문제 해결</strong>에 투자합니다.
                </p>
              </div>
            </div>

            <h3 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>핵심 역량</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(91, 127, 255, 0.05)', borderRadius: '15px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</div>
                <h4 style={{ color: '#5B7FFF', marginBottom: '1rem', fontSize: '1.2rem' }}>게임 개발</h4>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.9rem' }}>
                  Unity 2D/3D 게임 개발 및 Three.js를 활용한 웹 기반 3D 인터랙티브 경험 구현
                </p>
              </div>

              <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(91, 127, 255, 0.05)', borderRadius: '15px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💻</div>
                <h4 style={{ color: '#5B7FFF', marginBottom: '1rem', fontSize: '1.2rem' }}>풀스택 개발</h4>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.9rem' }}>
                  React, TypeScript, Node.js 등을 활용한 현대적인 웹 애플리케이션 풀스택 개발
                </p>
              </div>

              <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(91, 127, 255, 0.05)', borderRadius: '15px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <h4 style={{ color: '#5B7FFF', marginBottom: '1rem', fontSize: '1.2rem' }}>실시간 시스템</h4>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.9rem' }}>
                  Socket.IO 기반 실시간 멀티플레이어 시스템 및 실시간 데이터 동기화 구현
                </p>
              </div>

              <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(91, 127, 255, 0.05)', borderRadius: '15px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                <h4 style={{ color: '#5B7FFF', marginBottom: '1rem', fontSize: '1.2rem' }}>AI 도구 활용</h4>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.9rem' }}>
                  Claude Code, Cursor 등 AI 코딩 도구를 활용한 효율적인 개발 워크플로우 구축
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="section">
          <div ref={projectsRef} className={`fade-in ${projectsVisible ? 'visible' : ''}`} style={{ width: '100%', maxWidth: '1200px' }}>
            <h2>Projects</h2>

            {/* 대학 졸업작품 카테고리 */}
            <div className="project-category">
              <div className="category-header">
                <div className="category-title">
                  <span className="category-icon">🎓</span>
                  <h3>대학 졸업작품</h3>
                </div>
              </div>
              <div className="projects-grid">
                {projectsData
                  .filter(project => project.category === '대학 졸업작품')
                  .map((project, index) => (
                    <div
                      key={project.id}
                      className={`project-card scale-in ${projectsVisible ? 'visible' : ''}`}
                      style={{ transitionDelay: `${index * 0.1}s` }}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="project-badge graduation">{project.categoryLabel}</div>
                      {project.image && (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="project-card-image"
                        />
                      )}
                      {!project.image && (
                        <div className="project-card-image"></div>
                      )}
                      <div className="project-card-content">
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        {project.tech && (
                          <div className="project-card-tech">
                            {project.tech.slice(0, 5).map((tech, idx) => (
                              <span key={idx} className="project-tech-tag">
                                {tech}
                              </span>
                            ))}
                            {project.tech.length > 5 && (
                              <span className="project-tech-tag more">+{project.tech.length - 5}</span>
                            )}
                          </div>
                        )}
                        {(project.github || project.demo) && (
                          <div className="project-card-links">
                            {project.github && (
                              <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-card-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                GitHub
                              </a>
                            )}
                            {project.demo && (
                              <a
                                href={project.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-card-link demo"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {project.demo.includes('releases/download') ? 'Download Game' : 'Live Demo'}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* KDT 프로젝트 카테고리 */}
            <div className="project-category">
              <div className="category-header">
                <div className="category-title">
                  <span className="category-icon">💼</span>
                  <h3>KDT 프로젝트</h3>
                </div>
              </div>
              <div className="projects-grid">
                {projectsData
                  .filter(project => project.category === 'KDT')
                  .map((project, index) => (
                    <div
                      key={project.id}
                      className={`project-card scale-in ${projectsVisible ? 'visible' : ''}`}
                      style={{ transitionDelay: `${index * 0.1}s` }}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="project-badge">{project.categoryLabel}</div>
                      {project.image && (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="project-card-image"
                        />
                      )}
                      {!project.image && (
                        <div className="project-card-image"></div>
                      )}
                      <div className="project-card-content">
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        {project.tech && (
                          <div className="project-card-tech">
                            {project.tech.slice(0, 5).map((tech, idx) => (
                              <span key={idx} className="project-tech-tag">
                                {tech}
                              </span>
                            ))}
                            {project.tech.length > 5 && (
                              <span className="project-tech-tag more">+{project.tech.length - 5}</span>
                            )}
                          </div>
                        )}
                        {(project.github || project.demo) && (
                          <div className="project-card-links">
                            {project.github && (
                              <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-card-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                GitHub
                              </a>
                            )}
                            {project.demo && (
                              <a
                                href={project.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-card-link demo"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {project.demo.includes('releases/download') ? 'Download Game' : 'Live Demo'}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 개인 프로젝트 카테고리 */}
            <div className="project-category">
              <div className="category-header">
                <div className="category-title">
                  <span className="category-icon">💻</span>
                  <h3>개인(팀) 프로젝트</h3>
                </div>
              </div>
              <div className="projects-grid">
                {projectsData
                  .filter(project => project.category === '개인')
                  .map((project, index) => (
                    <div
                      key={project.id}
                      className={`project-card scale-in ${projectsVisible ? 'visible' : ''}`}
                      style={{ transitionDelay: `${index * 0.1}s` }}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="project-badge personal">{project.categoryLabel}</div>
                      {project.image && (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="project-card-image"
                        />
                      )}
                      {!project.image && (
                        <div className="project-card-image"></div>
                      )}
                      <div className="project-card-content">
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        {project.tech && (
                          <div className="project-card-tech">
                            {project.tech.slice(0, 5).map((tech, idx) => (
                              <span key={idx} className="project-tech-tag">
                                {tech}
                              </span>
                            ))}
                            {project.tech.length > 5 && (
                              <span className="project-tech-tag more">+{project.tech.length - 5}</span>
                            )}
                          </div>
                        )}
                        {(project.github || project.demo) && (
                          <div className="project-card-links">
                            {project.github && (
                              <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-card-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                GitHub
                              </a>
                            )}
                            {project.demo && (
                              <a
                                href={project.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-card-link demo"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {project.demo.includes('releases/download') ? 'Download Game' : 'Live Demo'}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 기타 프로젝트 카테고리 */}
            <div className="project-category">
              <div className="category-header">
                <div className="category-title">
                  <span className="category-icon">📦</span>
                  <h3>미니 프로젝트</h3>
                </div>
              </div>
              <div className="projects-grid">
                {projectsData
                  .filter(project => project.category === '기타')
                  .map((project, index) => (
                    <div
                      key={project.id}
                      className={`project-card scale-in ${projectsVisible ? 'visible' : ''}`}
                      style={{ transitionDelay: `${index * 0.1}s` }}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="project-badge other">{project.categoryLabel}</div>
                      <div className="project-card-icon-area">
                        <span className="project-card-icon">{project.icon || '📦'}</span>
                      </div>
                      <div className="project-card-content">
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        {project.tech && (
                          <div className="project-card-tech">
                            {project.tech.slice(0, 5).map((tech, idx) => (
                              <span key={idx} className="project-tech-tag">
                                {tech}
                              </span>
                            ))}
                            {project.tech.length > 5 && (
                              <span className="project-tech-tag more">+{project.tech.length - 5}</span>
                            )}
                          </div>
                        )}
                        {(project.github || project.demo) && (
                          <div className="project-card-links">
                            {project.github && (
                              <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-card-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                GitHub
                              </a>
                            )}
                            {project.demo && (
                              <a
                                href={project.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-card-link demo"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {project.demo.includes('releases/download') ? 'Download Game' : 'Live Demo'}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="section">
          <div ref={contactRef} className="contact-skills-container">
            <h2 className="contact-skills-title">Contact & Skills</h2>

            <div className="contact-skills-grid">
              <div className="contact-box">
                <h3>연락처</h3>

                <div className="skill-category">
                  <h4>Email</h4>
                  <div className="skill-tags">
                    <span onClick={handleCopyEmail} className="skill-tag contact-link" style={{ cursor: 'pointer' }}>kimkichan1225@gmail.com</span>
                  </div>
                </div>

                <div className="skill-category">
                  <h4>Phone</h4>
                  <div className="skill-tags">
                    <span className="skill-tag">+82 10-4225-5388</span>
                  </div>
                </div>

                <div className="skill-category">
                  <h4>GitHub</h4>
                  <div className="skill-tags">
                    <a href="https://github.com/kimkichan1225" target="_blank" rel="noopener noreferrer" className="skill-tag contact-link">github.com/kimkichan1225</a>
                  </div>
                </div>

                <div className="skill-category">
                  <h4>Instagram</h4>
                  <div className="skill-tags">
                    <a href="https://www.instagram.com/kim_kichan/#" target="_blank" rel="noopener noreferrer" className="skill-tag contact-link">@kim_kichan</a>
                  </div>
                </div>
              </div>

              <div className="skills-box">
                <h3>기술 스택</h3>

                <div className="skill-category">
                  <h4>Frontend</h4>
                  <div className="skill-tags">
                    <span className="skill-tag">React 19</span>
                    <span className="skill-tag">TypeScript</span>
                    <span className="skill-tag">JavaScript</span>
                    <span className="skill-tag">Three.js</span>
                    <span className="skill-tag">HTML5</span>
                    <span className="skill-tag">CSS3</span>
                    <span className="skill-tag">TailwindCSS</span>
                  </div>
                </div>

                <div className="skill-category">
                  <h4>Backend</h4>
                  <div className="skill-tags">
                    <span className="skill-tag">Node.js</span>
                    <span className="skill-tag">Express</span>
                    <span className="skill-tag">Socket.IO</span>
                    <span className="skill-tag">Supabase</span>
                    <span className="skill-tag">PostgreSQL</span>
                  </div>
                </div>

                <div className="skill-category">
                  <h4>Game Development</h4>
                  <div className="skill-tags">
                    <span className="skill-tag">Unity 6</span>
                    <span className="skill-tag">C#</span>
                    <span className="skill-tag">React Three Fiber</span>
                  </div>
                </div>

                <div className="skill-category">
                  <h4>Tools</h4>
                  <div className="skill-tags">
                    <span className="skill-tag">Git</span>
                    <span className="skill-tag">GitHub</span>
                    <span className="skill-tag">Vite</span>
                    <span className="skill-tag">Netlify</span>
                    <span className="skill-tag">Render</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}

// 네비게이션 바 컴포넌트
function NavigationBar({ isWebMode, onToggleMode, isDarkMode, onToggleDarkMode }) {
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseY(e.clientY);
    };

    if (!isWebMode) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isWebMode]);

  const shouldShow = isWebMode || mouseY < 80;

  return (
    <nav
      className={`navigation-bar ${shouldShow ? 'visible' : 'hidden'}`}
    >
      <div className="nav-content">
        <div className="nav-left">
          <h1 className="nav-logo">3D Portfolio</h1>
        </div>
        <div className="nav-center">
          <a href="#home" className="nav-link">Home</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#projects" className="nav-link">Projects</a>
          <a href="#contact" className="nav-link">Contact & Skills</a>
        </div>
        <div className="nav-right">
          <button
            className="dark-mode-toggle"
            onClick={onToggleDarkMode}
            title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            <span className="toggle-icon">
              {isDarkMode ? '☀️' : '🌙'}
            </span>
          </button>
          <button
            className={`mode-toggle ${isWebMode ? 'web' : 'game'}`}
            onClick={onToggleMode}
            title={isWebMode ? '게임 모드로 전환' : '웹 모드로 전환'}
          >
            <span className="toggle-icon">
              {isWebMode ? '🎮' : '🌐'}
            </span>
            <span className="toggle-text">
              {isWebMode ? 'Game' : 'Web'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

// 커스텀 팝업 함수
function showCustomPopup(message) {
  // 기존 팝업이 있다면 제거
  const existingPopup = document.getElementById('custom-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // 팝업 컨테이너 생성
  const popup = document.createElement('div');
  popup.id = 'custom-popup';
  popup.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    font-family: 'Arial', sans-serif;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    z-index: 10000;
    border: 2px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    animation: popupSlideIn 0.3s ease-out;
    min-width: 300px;
  `;

  // 애니메이션 CSS 추가
  const style = document.createElement('style');
  style.textContent = `
    @keyframes popupSlideIn {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
    @keyframes popupSlideOut {
      from {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      to {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
    }
  `;
  document.head.appendChild(style);

  popup.textContent = message;
  document.body.appendChild(popup);

  // 2초 후 자동으로 사라지게 하기
  setTimeout(() => {
    popup.style.animation = 'popupSlideOut 0.3s ease-in';
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 300);
  }, 2000);
}

// 그라데이션 바닥을 위한 셰이더 머티리얼 (그림자 지원)
const GradientFloorMaterial = shaderMaterial(
  // Uniforms
  {
    uColorStart: new THREE.Color('#90EE90'), // 연두색 시작
    uColorEnd: new THREE.Color('#E0FFE0'),   // 훨씬 더 밝은 연두색 끝
  },
  // Vertex Shader
  `
  #include <common>
  #include <shadowmap_pars_vertex>
  
  varying vec4 vScreenPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;
    
    // 스크린 좌표를 varying으로 전달
    vScreenPosition = gl_Position;
    
    #include <shadowmap_vertex>
  }
  `,
  // Fragment Shader
  `
  #include <common>
  #include <packing>
  #include <lights_pars_begin>
  #include <shadowmap_pars_fragment>
  
  uniform vec3 uColorStart;
  uniform vec3 uColorEnd;
  varying vec4 vScreenPosition;
  varying vec3 vWorldPosition;

  void main() {
    // 스크린 좌표를 0-1 범위로 정규화
    vec2 screenUV = (vScreenPosition.xy / vScreenPosition.w) * 0.5 + 0.5;
    
    // 화면 기준 오른쪽 아래로 갈수록 밝아지는 그라데이션
    float gradient = (screenUV.x + (1.0 - screenUV.y)) * 0.5;
    vec3 baseColor = mix(uColorStart, uColorEnd, gradient);
    
    // 그림자 계산
    float shadow = getShadow(directionalShadowMap[0], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[0]);
    
    // 그림자를 기본 색상에 적용
    vec3 finalColor = baseColor * (0.3 + 0.7 * shadow);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
  `
);

extend({ GradientFloorMaterial });

// 하늘을 위한 컴포넌트
function Sky({ isDarkMode }) {
  return (
    <mesh>
      <sphereGeometry args={[400, 32, 32]} />
      <meshBasicMaterial color={isDarkMode ? "#0B1026" : "#87CEFA"} side={THREE.BackSide} />
    </mesh>
  );
}

function CameraLogger() {
  const { log } = useKeyboardControls();
  const { camera } = useThree();
  const logRef = useRef(false);

  useEffect(() => {
    // Log only when 'c' is pressed (rising edge)
    if (log && !logRef.current) {
      const pos = camera.position.toArray().map(p => p.toFixed(2));
      const rot = camera.rotation.toArray().slice(0, 3).map(r => r.toFixed(2)); // Fixed: slice to get only numbers
      console.log(`Camera Position: [${pos.join(', ')}]`);
      console.log(`Camera Rotation: [${rot.join(', ')}]`);
    }
    logRef.current = log;
  }, [log, camera]);

  return null;
}



function CameraController({ gameState, characterRef }) {
  const { camera } = useThree();
  const cameraOffset = new THREE.Vector3(-0.00, 28.35, 19.76); // 고정된 카메라 오프셋
  const targetPositionRef = useRef(new THREE.Vector3());
  const prevGameStateRef = useRef(gameState);

  // 레벨 전환 시 카메라 즉시 리셋
  useEffect(() => {
    if (prevGameStateRef.current !== gameState && characterRef.current) {
      // 캐릭터 위치가 업데이트된 후 카메라 리셋
      requestAnimationFrame(() => {
        if (!characterRef.current) return;

        const worldPosition = new THREE.Vector3();
        characterRef.current.getWorldPosition(worldPosition);

        // 타겟 위치 즉시 설정
        targetPositionRef.current.copy(worldPosition);

        // 카메라 위치 즉시 설정
        const targetCameraPosition = worldPosition.clone().add(cameraOffset);
        camera.position.copy(targetCameraPosition);
        camera.lookAt(worldPosition);
      });

      prevGameStateRef.current = gameState;
    }
  }, [gameState, characterRef, camera, cameraOffset]);

  useFrame((state, delta) => {
    if (!characterRef.current) return;

    // 월드 position 가져오기
    const worldPosition = new THREE.Vector3();
    characterRef.current.getWorldPosition(worldPosition);

    if (gameState === 'playing_level1' || gameState === 'playing_level2' || gameState === 'playing_level3' || gameState === 'playing_level4' || gameState === 'returning_to_level1' || gameState === 'returning_to_level1_from_level3' || gameState === 'returning_to_level3_from_level4') {
      // 타겟 위치를 부드럽게 보간 (떨림 방지)
      targetPositionRef.current.lerp(worldPosition, delta * 12.0);

      // 타겟 위치에 고정된 오프셋을 더해서 카메라 위치 계산
      const targetCameraPosition = targetPositionRef.current.clone().add(cameraOffset);

      // 부드러운 카메라 이동 (속도 감소)
      camera.position.lerp(targetCameraPosition, delta * 2.0);

      // 타겟을 바라보도록 설정
      camera.lookAt(targetPositionRef.current);
    }
  });

  return null;
}

function Model({ characterRef, gameState, setGameState, setGameStateWithFade, doorPosition, setIsNearDoor, door2Position, setIsNearDoor2, door3Position, setIsNearDoor3, doorPositionLevel2, setIsNearDoorLevel2, doorPositionLevel3, setIsNearDoorLevel3, doorPositionLevel4, setIsNearDoorLevel4, cabinetTVPosition, setIsNearCabinetTV, setShowContactInfo, wallPosition, setIsNearWall, setShowProfile, asuraCabinetPosition, setIsNearAsuraCabinet, setShowFirstProject, conviCabinetPosition, setIsNearConviCabinet, setShowSecondProject, voidCabinetPosition, setIsNearVoidCabinet, setShowThirdProject, frontendTablePosition, setIsNearFrontendTable, backendTablePosition, setIsNearBackendTable, gamedevTablePosition, setIsNearGamedevTable, toolsTablePosition, setIsNearToolsTable, deskCornerPosition, setIsNearDeskCorner, setShowPortfolioPopup, spawnPosition }) {
  const { scene, animations } = useGLTF('/resources/GameView/Suit.glb');
  const { actions } = useAnimations(animations, characterRef);

  const { forward, backward, left, right, shift, e, log } = useKeyboardControls();
  const [currentAnimation, setCurrentAnimation] = useState('none');

  // 발걸음 소리를 위한 오디오 시스템
  const stepAudioRef = useRef(null);
  const lastStepTimeRef = useRef(0);
  const stepIntervalRef = useRef(0.5); // 발걸음 간격 (초)

  // 문 열림 소리를 위한 오디오 시스템
  const doorAudioRef = useRef(null);
  const doorInteractionDistance = 7; // 문과 상호작용 가능한 거리
  const lastDoorInteractionTimeRef = useRef(0); // E키 쿨다운 (5초)
  const doorCooldownDuration = 500; // 5초 쿨다운 (밀리초)

  // 안전한 참조를 위한 useRef
  const rigidBodyRef = useRef(); // Rapier RigidBody 참조
  const currentRotationRef = useRef(new THREE.Quaternion()); // 현재 회전 저장 (모델용)
  const modelGroupRef = useRef(); // 캐릭터 모델 그룹 참조

  // 발걸음 소리 로드 및 재생 함수
  useEffect(() => {
    // 발걸음 소리 로드 (여러 경로 시도, .wav 파일 우선)
    const audioPaths = [
      '/resources/Sounds/Step2.wav',
      '/resources/Sounds/step2.wav',
      '/Sounds/Step2.wav',
      '/resources/Sounds/Step2.mp3',
      '/resources/Sounds/step2.mp3',
      '/Sounds/Step2.mp3'
    ];
    
    // 첫 번째 경로로 시도
    stepAudioRef.current = new Audio(audioPaths[0]);
    stepAudioRef.current.volume = 1.0; // 볼륨을 최대로 설정
    stepAudioRef.current.preload = 'auto';
    
    // 오디오 로드 확인
    stepAudioRef.current.addEventListener('canplaythrough', () => {
      // 발걸음 소리 로드 완료
    });
    
    stepAudioRef.current.addEventListener('error', (e) => {
      // 다른 경로 시도
      for (let i = 1; i < audioPaths.length; i++) {
        const newAudio = new Audio(audioPaths[i]);
        newAudio.volume = 1.0;
        newAudio.preload = 'auto';
        
        newAudio.addEventListener('canplaythrough', () => {
          stepAudioRef.current = newAudio;
        });
        
        newAudio.addEventListener('error', () => {
          // 발걸음 소리 로드 실패
        });
      }
    });
  }, []);

  // 문 열림 소리 로드
  useEffect(() => {
    const doorAudioPath = '/sounds/opendoor.mp3';
    doorAudioRef.current = new Audio(doorAudioPath);
    doorAudioRef.current.volume = 0.8;
    doorAudioRef.current.preload = 'auto';
  }, []);

  // 발걸음 소리 재생 함수
  const playStepSound = () => {
    if (stepAudioRef.current) {
      stepAudioRef.current.currentTime = 0; // 처음부터 재생
      stepAudioRef.current.play().catch(e => {
        // 발걸음 소리 재생 실패
      });
    }
  };

  // 문 열림 소리 재생 함수
  const playDoorSound = () => {
    if (doorAudioRef.current) {
      doorAudioRef.current.currentTime = 0;
      doorAudioRef.current.play().catch(e => {
        console.error('문 열림 소리 재생 실패:', e);
      });
    }
  };

  useEffect(() => {
    // Enable shadows on all meshes in the character model
    if (characterRef.current) {
      characterRef.current.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }

    // characterRef를 modelGroupRef로 설정 (카메라가 추적할 수 있도록)
    if (modelGroupRef.current) {
      characterRef.current = modelGroupRef.current;
    }
  }, []);

  useEffect(() => {
    let animToPlay = 'Idle';
    if (gameState === 'playing_level1' || gameState === 'playing_level2' || gameState === 'playing_level3' || gameState === 'playing_level4' || gameState === 'returning_to_level1' || gameState === 'returning_to_level1_from_level3' || gameState === 'returning_to_level3_from_level4') {
      if (forward || backward || left || right) {
        animToPlay = shift ? 'Run' : 'Walk';
      }
    }

    if (currentAnimation !== animToPlay) {
      const oldAction = actions[currentAnimation];
      const newAction = actions[animToPlay];

      if (oldAction) oldAction.fadeOut(0.5);
      if (newAction) newAction.reset().fadeIn(0.5).play();

      setCurrentAnimation(animToPlay);

      // 걷기/뛰기 애니메이션 시작 시 발걸음 소리 시작
      if (animToPlay === 'Walk' || animToPlay === 'Run') {
        lastStepTimeRef.current = Date.now();
        stepIntervalRef.current = animToPlay === 'Run' ? 0.45 : 0.6; // 더 빠른 발걸음 간격
      }
    }
  }, [forward, backward, left, right, shift, actions, currentAnimation, gameState]);

  useFrame((state, delta) => {
    if (!rigidBodyRef.current || !modelGroupRef.current) return;

    if (gameState !== 'playing_level1' && gameState !== 'playing_level2' && gameState !== 'playing_level3' && gameState !== 'playing_level4') return;

    const speed = shift ? 18 : 8; // 물리 기반 속도 (걷기: 8, 뛰기: 18)
    const direction = new THREE.Vector3();

    if (forward) direction.z -= 1;
    if (backward) direction.z += 1;
    if (left) direction.x -= 1;
    if (right) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize();

      // 회전 처리 - 부드럽게 회전 (모델만)
      const targetAngle = Math.atan2(direction.x, direction.z);
      const targetQuaternion = new THREE.Quaternion();
      targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle);

      // 현재 회전에서 목표 회전으로 부드럽게 보간 (slerp)
      currentRotationRef.current.slerp(targetQuaternion, 0.25);

      // 물리 기반 이동 (setLinvel 사용)
      // Y축 속도만 먼저 추출 (참조를 즉시 해제하기 위해)
      const currentY = rigidBodyRef.current.linvel().y;
      rigidBodyRef.current.setLinvel({
        x: direction.x * speed,
        y: currentY, // Y축은 중력 유지
        z: direction.z * speed
      });

      // 발걸음 소리 재생
      if (currentAnimation === 'Walk' || currentAnimation === 'Run') {
        const currentTime = Date.now();
        if (currentTime - lastStepTimeRef.current > stepIntervalRef.current * 1000) {
          playStepSound();
          lastStepTimeRef.current = currentTime;
        }
      }
    } else {
      // 정지 시 속도 0
      // Y축 속도만 먼저 추출 (참조를 즉시 해제하기 위해)
      const currentY = rigidBodyRef.current.linvel().y;
      rigidBodyRef.current.setLinvel({ x: 0, y: currentY, z: 0 });
    }

    // RigidBody의 위치를 모델에 동기화
    const rbPosition = rigidBodyRef.current.translation();
    const posX = rbPosition.x; // 값을 즉시 복사하여 Rust 참조 해제
    const posY = rbPosition.y;
    const posZ = rbPosition.z;
    modelGroupRef.current.position.set(posX, posY, posZ);

    // 모델의 회전은 입력에 의한 회전만 적용
    modelGroupRef.current.quaternion.copy(currentRotationRef.current);

    const currentTime = Date.now();
    const onCooldown = (currentTime - lastDoorInteractionTimeRef.current) < doorCooldownDuration;

    // door001 상호작용 감지 (Level1에서만)
    if (gameState === 'playing_level1' && doorPosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(doorPosition);

      if (distance < doorInteractionDistance) {
        if (onCooldown) {
          setIsNearDoor(false);
        } else {
          setIsNearDoor(true);
          if (e) {
            playDoorSound();
            setGameStateWithFade('playing_level2');
            lastDoorInteractionTimeRef.current = currentTime;
          }
        }
      } else {
        setIsNearDoor(false);
      }
    } else {
      setIsNearDoor(false);
    }

    // door 상호작용 감지 (Level1에서만 - Level3로 가는 문)
    if (gameState === 'playing_level1' && door2Position) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(door2Position);

      if (distance < doorInteractionDistance) {
        if (onCooldown) {
          setIsNearDoor2(false);
        } else {
          setIsNearDoor2(true);
          if (e) {
            playDoorSound();
            setGameStateWithFade('playing_level3');
            lastDoorInteractionTimeRef.current = currentTime;
          }
        }
      } else {
        setIsNearDoor2(false);
      }
    } else {
      setIsNearDoor2(false);
    }

    // door001 상호작용 감지 (Level2에서만)
    if (gameState === 'playing_level2' && doorPositionLevel2) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(doorPositionLevel2);

      if (distance < doorInteractionDistance) {
        if (onCooldown) {
          setIsNearDoorLevel2(false);
        } else {
          setIsNearDoorLevel2(true);
          if (e) {
            playDoorSound();
            setGameStateWithFade('returning_to_level1');
            lastDoorInteractionTimeRef.current = currentTime;
          }
        }
      } else {
        setIsNearDoorLevel2(false);
      }
    } else {
      setIsNearDoorLevel2(false);
    }

    // door 상호작용 감지 (Level3에서만 - Level1로 돌아가는 문)
    if (gameState === 'playing_level3' && doorPositionLevel3) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(doorPositionLevel3);

      if (distance < doorInteractionDistance) {
        if (onCooldown) {
          setIsNearDoorLevel3(false);
        } else {
          setIsNearDoorLevel3(true);
          if (e) {
            playDoorSound();
            setGameStateWithFade('returning_to_level1_from_level3');
            lastDoorInteractionTimeRef.current = currentTime;
          }
        }
      } else {
        setIsNearDoorLevel3(false);
      }
    } else {
      setIsNearDoorLevel3(false);
    }

    // door002 상호작용 감지 (Level3에서만 - Level4로 가는 문)
    if (gameState === 'playing_level3' && door3Position) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(door3Position);

      if (distance < doorInteractionDistance) {
        if (onCooldown) {
          setIsNearDoor3(false);
        } else {
          setIsNearDoor3(true);
          if (e) {
            playDoorSound();
            setGameStateWithFade('playing_level4');
            lastDoorInteractionTimeRef.current = currentTime;
          }
        }
      } else {
        setIsNearDoor3(false);
      }
    } else {
      setIsNearDoor3(false);
    }

    // door002 상호작용 감지 (Level4에서만 - Level3로 돌아가는 문)
    if (gameState === 'playing_level4' && doorPositionLevel4) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(doorPositionLevel4);

      if (distance < doorInteractionDistance) {
        if (onCooldown) {
          setIsNearDoorLevel4(false);
        } else {
          setIsNearDoorLevel4(true);
          if (e) {
            playDoorSound();
            setGameStateWithFade('returning_to_level3_from_level4');
            lastDoorInteractionTimeRef.current = currentTime;
          }
        }
      } else {
        setIsNearDoorLevel4(false);
      }
    } else {
      setIsNearDoorLevel4(false);
    }

    // cabinetTelevision 상호작용 감지 (Level4에서만)
    if (gameState === 'playing_level4' && cabinetTVPosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(cabinetTVPosition);

      if (distance < doorInteractionDistance) {
        setIsNearCabinetTV(true);
        if (e && !onCooldown) {
          setShowContactInfo(true);
          lastDoorInteractionTimeRef.current = currentTime;
        }
      } else {
        setIsNearCabinetTV(false);
      }
    } else {
      setIsNearCabinetTV(false);
    }

    // wall 상호작용 감지 (Level4에서만)
    if (gameState === 'playing_level4' && wallPosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(wallPosition);

      if (distance < doorInteractionDistance) {
        setIsNearWall(true);
        if (e && !onCooldown) {
          setShowProfile(true);
          lastDoorInteractionTimeRef.current = currentTime;
        }
      } else {
        setIsNearWall(false);
      }
    } else {
      setIsNearWall(false);
    }

    // AsuraCabinet 상호작용 감지 (Level2에서만)
    if (gameState === 'playing_level2' && asuraCabinetPosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(asuraCabinetPosition);

      if (distance < doorInteractionDistance) {
        setIsNearAsuraCabinet(true);
        if (e && !onCooldown) {
          setShowFirstProject(true);
          lastDoorInteractionTimeRef.current = currentTime;
        }
      } else {
        setIsNearAsuraCabinet(false);
      }
    } else {
      setIsNearAsuraCabinet(false);
    }

    // ConviCabinet 상호작용 감지 (Level2에서만)
    if (gameState === 'playing_level2' && conviCabinetPosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(conviCabinetPosition);

      if (distance < doorInteractionDistance) {
        setIsNearConviCabinet(true);
        if (e && !onCooldown) {
          setShowSecondProject(true);
          lastDoorInteractionTimeRef.current = currentTime;
        }
      } else {
        setIsNearConviCabinet(false);
      }
    } else {
      setIsNearConviCabinet(false);
    }

    // VoidCabinet 상호작용 감지 (Level2에서만)
    if (gameState === 'playing_level2' && voidCabinetPosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(voidCabinetPosition);

      if (distance < doorInteractionDistance) {
        setIsNearVoidCabinet(true);
        if (e && !onCooldown) {
          setShowThirdProject(true);
          lastDoorInteractionTimeRef.current = currentTime;
        }
      } else {
        setIsNearVoidCabinet(false);
      }
    } else {
      setIsNearVoidCabinet(false);
    }

    // FrontendTable 근접 감지 (Level3에서만, 자동 표시)
    if (gameState === 'playing_level3' && frontendTablePosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(frontendTablePosition);

      if (distance < doorInteractionDistance) {
        setIsNearFrontendTable(true);
      } else {
        setIsNearFrontendTable(false);
      }
    } else {
      setIsNearFrontendTable(false);
    }

    // BackendTable 근접 감지 (Level3에서만, 자동 표시)
    if (gameState === 'playing_level3' && backendTablePosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(backendTablePosition);

      if (distance < doorInteractionDistance) {
        setIsNearBackendTable(true);
      } else {
        setIsNearBackendTable(false);
      }
    } else {
      setIsNearBackendTable(false);
    }

    // GamedevTable 근접 감지 (Level3에서만, 자동 표시)
    if (gameState === 'playing_level3' && gamedevTablePosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(gamedevTablePosition);

      if (distance < doorInteractionDistance) {
        setIsNearGamedevTable(true);
      } else {
        setIsNearGamedevTable(false);
      }
    } else {
      setIsNearGamedevTable(false);
    }

    // ToolsTable 근접 감지 (Level3에서만, 자동 표시)
    if (gameState === 'playing_level3' && toolsTablePosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(toolsTablePosition);

      if (distance < doorInteractionDistance) {
        setIsNearToolsTable(true);
      } else {
        setIsNearToolsTable(false);
      }
    } else {
      setIsNearToolsTable(false);
    }

    // deskCorner 근접 감지 (Level4에서만, E키 상호작용)
    if (gameState === 'playing_level4' && deskCornerPosition) {
      const charPos = new THREE.Vector3(posX, posY, posZ);
      const distance = charPos.distanceTo(deskCornerPosition);

      if (distance < doorInteractionDistance) {
        setIsNearDeskCorner(true);
        const now = Date.now();
        if (e && (now - lastDoorInteractionTimeRef.current > doorCooldownDuration)) {
          // E키 눌렀을 때 포트폴리오 팝업 표시
          setShowPortfolioPopup(true);
          lastDoorInteractionTimeRef.current = now;
        }
      } else {
        setIsNearDeskCorner(false);
      }
    } else {
      setIsNearDeskCorner(false);
    }

    // C키로 캐릭터 위치 로그 (디버그)
    if (log) {
      const debugPosition = rigidBodyRef.current.translation();
      const debugX = debugPosition.x;
      const debugY = debugPosition.y;
      const debugZ = debugPosition.z;
      console.log('=== 캐릭터 위치 ===');
      console.log(`Position: x=${debugX.toFixed(2)}, y=${debugY.toFixed(2)}, z=${debugZ.toFixed(2)}`);
      console.log(`GameState: ${gameState}`);
      console.log('Level1 doorPosition:', doorPosition);
      console.log('Level2 doorPosition:', doorPositionLevel2);
    }
  });

  return (
    <>
      {/* 물리 충돌용 RigidBody (보이지 않음) */}
      <RigidBody
        ref={rigidBodyRef}
        type="dynamic"
        colliders={false}
        mass={1}
        linearDamping={2.0} // 증가: 더 빠르게 감속 (떨림 방지)
        angularDamping={1.0} // 회전 감쇠 추가
        enabledRotations={[false, false, false]} // 물리적 회전 완전 잠금
        position={spawnPosition} // 동적 스폰 위치
        lockRotations={true} // 회전 완전 잠금
        canSleep={false} // 절대 sleep 상태로 전환되지 않음 (플레이어 캐릭터용)
      >
        <CapsuleCollider args={[2, 1.3]} position={[0, 3.2, 0]} />
      </RigidBody>

      {/* 캐릭터 모델 (RigidBody와 분리) */}
      <group ref={modelGroupRef}>
        <primitive
          ref={characterRef}
          object={scene}
          scale={2}
          castShadow
          receiveShadow
        />
      </group>
    </>
  );
}

function SpeechBubble({ position, text, ...props }) {
  const meshRef = useRef();
  const { camera } = useThree();
  const [isVisible, setIsVisible] = useState(false);

  // 텍스트 로딩을 위한 딜레이 - 프리로드된 텍스트가 있으므로 더 빠르게
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={meshRef} position={position} {...props}>
      {/* 말풍선 테두리 */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[4.2, 1.7]} />
        <meshBasicMaterial color="black" transparent opacity={0.8} />
      </mesh>
      {/* 말풍선 배경 */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[4, 1.5]} />
        <meshBasicMaterial color="white" transparent opacity={0.95} />
      </mesh>
      {/* 텍스트 - 짧은 딜레이 후 표시 */}
      {isVisible && (
        <Suspense fallback={null}>
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.4}
            color="black"
            anchorX="center"
            anchorY="middle"
            maxWidth={3.5}
            textAlign="center"
          >
            {text}
          </Text>
        </Suspense>
      )}
    </group>
  );
}

function PathStone(props) {
  const { scene } = useGLTF('/resources/Nature-Kit/Models/GLTF-format/path_stone.glb');
  
  // 패스스톤의 모든 메시에 그림자 속성 추가
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  
  return <primitive object={scene} {...props} />;
}

useGLTF.preload('/resources/Nature-Kit/Models/GLTF-format/path_stone.glb');

function SmallStoneFlatA(props) {
  const { scene } = useGLTF('/resources/Nature-Kit/Models/GLTF-format/stone_smallFlatA.glb');
  
  // 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);
  
  return <primitive object={clonedScene} {...props} />;
}

useGLTF.preload('/resources/Nature-Kit/Models/GLTF-format/stone_smallFlatA.glb');

function PalmTree(props) {
  const fbx = useFBX('/resources/Ultimate Nature Pack - Jun 2019/FBX/PalmTree_4.fbx');
  
  // 팜트리 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedTree = useMemo(() => {
    const cloned = fbx.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [fbx]);
  
  return <primitive object={clonedTree} {...props} />;
}

// FBX 파일은 preload 방식이 다름
// useFBX.preload('/resources/Ultimate Nature Pack - Jun 2019/FBX/PalmTree_1.fbx');

// 둥근 모서리를 가진 정육면체 컴포넌트
function RoundedCube({ position, scale, ...props }) {
  const geometry = useMemo(() => {
    // RoundedBoxGeometry를 사용하여 둥근 모서리 정육면체 생성
    return new THREE.BoxGeometry(1, 1, 1, 2, 2, 2, 0.1); // 마지막 매개변수가 둥근 정도
  }, []);

  return (
    <mesh geometry={geometry} position={position} scale={scale} {...props}>
      <meshStandardMaterial 
        color="white" 
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

// GitHub Cat 컴포넌트 추가
function GitHubCat(props) {
  const { scene } = useGLTF('/githubcat.glb');
  
  // GitHub Cat 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // 동상처럼 어두운 회색 재질 적용
        child.material = new THREE.MeshStandardMaterial({
          color: '#404040', // 더 어두운 회색
          roughness: 0.8,
          metalness: 0.2
        });
      }
    });
    return cloned;
  }, [scene]);
  
  return <primitive object={clonedScene} {...props} />;
}

// Mailbox 컴포넌트 추가
function Mailbox(props) {
  const { scene } = useGLTF('/mailbox.glb');
  
  // Mailbox 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // 동상처럼 어두운 회색 재질 적용
        child.material = new THREE.MeshStandardMaterial({
          color: '#404040', // 더 어두운 회색
          roughness: 0.8,
          metalness: 0.2
        });
      }
    });
    return cloned;
  }, [scene]);
  
  return <primitive object={clonedScene} {...props} />;
}

// GitHub Cat과 RoundedCube를 묶는 그룹 컴포넌트
function GitHubCatGroup({ position = [0, 0, 0], characterRef, level = 1, ...props }) {
  const [isPlayerNear, setIsPlayerNear] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [portalScale, setPortalScale] = useState(0);
  const { enter } = useKeyboardControls();
  const lastEnterState = useRef(false);
  const portalMaterialRef = useRef();
  
  // Enter키 처리 - level에 따라 다른 링크 사용
  useEffect(() => {
    if (enter && !lastEnterState.current && showPortal) {
      // level에 따라 다른 GitHub URL을 새 탭에서 열기
      const githubUrl = level === 3 
        ? 'https://github.com/kimkichan-1/kdt-game'  // level3: KDT-Game 프로젝트
        : 'https://github.com/kimkichan-1';          // level1: 프로필 페이지
      window.open(githubUrl, '_blank');
    }
    lastEnterState.current = enter;
  }, [enter, isPlayerNear, showPortal, level]);
  
  // 플레이어와의 거리 체크 (흰색 사각형 기준) 및 포탈 애니메이션
  useFrame((state, delta) => {
    // 포탈 애니메이션 업데이트
    if (portalMaterialRef.current) {
      portalMaterialRef.current.uTime = state.clock.getElapsedTime();
    }
    
    if (characterRef?.current) {
      // 흰색 사각형의 위치 계산 (정육면체 앞 5 유닛)
      const groupPosition = new THREE.Vector3(...position);
      const squarePosition = groupPosition.clone().add(new THREE.Vector3(0, 0, 5));
      
      const playerPosition = characterRef.current.position;
      const distance = squarePosition.distanceTo(playerPosition);
      
      const maxDistance = 5; // 포탈이 보이기 시작하는 최대 거리
      const minDistance = 3; // 포탈이 최대 크기가 되는 최소 거리
      const nearDistance = 3; // Enter키가 작동하는 거리
      
      // 거리에 따른 포탈 크기 계산 (0에서 1 사이)
      const normalizedDistance = Math.max(0, Math.min(1, (distance - minDistance) / (maxDistance - minDistance)));
      const scale = 1 - normalizedDistance; // 가까울수록 1, 멀수록 0
      
      // 포탈 표시 여부 결정
      const shouldShowPortal = distance < maxDistance;
      const wasNear = isPlayerNear;
      const nowNear = distance < nearDistance;
      
      if (shouldShowPortal !== showPortal) {
        setShowPortal(shouldShowPortal);
      }
      
      if (wasNear !== nowNear) {
        setIsPlayerNear(nowNear);
      }
      
      // 포탈 크기 업데이트 (부드러운 전환)
      setPortalScale(scale);
    }
  });
  
  return (
    <group position={position} {...props}>
      {/* 둥근 정육면체 (GitHub Cat의 받침대) */}
      <RoundedCube 
        position={[0, 2, 0]} 
        scale={[4, 4, 4]}
        castShadow
        receiveShadow
      />
      
      {/* 정육면체 앞 바닥에 흰색 테두리 사각형 */}
      <mesh position={[0, 0.01, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <ringGeometry args={[3, 3.5, 4]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
      </mesh>
      
             {/* 포탈 효과 - 플레이어가 가까이 있을 때만 표시 */}
       {showPortal && (
         <group position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
           {/* PortalVortex와 같은 스타일의 포탈 - 거리에 따라 크기 변화 */}
           <mesh scale={[4.9 * portalScale, 4.9 * portalScale, 1]}>
             <planeGeometry args={[1, 1]} />
             <vortexMaterial 
               ref={portalMaterialRef}
               transparent={true}
               opacity={portalScale} // 거리에 따라 투명도도 변화
               uColorStart={new THREE.Color('#FFFFFF')}  // 흰색
               uColorEnd={new THREE.Color('#E0E0E0')}    // 밝은 회색
             />
           </mesh>
         </group>
       )}
      
      {/* 정육면체 앞면에 "Github" 텍스트 */}
      <Text
        position={[0, 2, 2.1]} // 정육면체 가운데에 위치
        fontSize={1.2}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
      >
        Github
      </Text>
      
      {/* GitHub Cat 모델 */}
      <GitHubCat 
        position={[0, 6.2, 0]} 
        scale={[2.3, 2.3, 2.3]} 
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

// Instagram Logo 컴포넌트 추가
function InstagramLogo(props) {
  const { scene } = useGLTF('/instagramlogo.glb');
  
  // Instagram Logo 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // 원래 색상 유지 (재질 변경하지 않음)
      }
    });
    return cloned;
  }, [scene]);
  
  return <primitive object={clonedScene} {...props} />;
}

// Mailbox와 RoundedCube를 묶는 그룹 컴포넌트
function MailboxGroup({ position = [0, 0, 0], characterRef, ...props }) {
  const [isPlayerNear, setIsPlayerNear] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [portalScale, setPortalScale] = useState(0);
  const { enter } = useKeyboardControls();
  const lastEnterState = useRef(false);
  const portalMaterialRef = useRef();
  
  // Enter키 처리 - 이메일 주소 복사
  useEffect(() => {
    if (enter && !lastEnterState.current && showPortal) {
      // 이메일 주소를 클립보드에 복사
      navigator.clipboard.writeText('vxbc52@gmail.com').then(() => {
        // 복사 완료 팝업 표시
        showCustomPopup('vxbc52@gmail.com이 복사되었습니다.');
      }).catch(() => {
        // 클립보드 복사 실패 시 대체 방법
        const textArea = document.createElement('textarea');
        textArea.value = 'vxbc52@gmail.com';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCustomPopup('vxbc52@gmail.com이 복사되었습니다.');
      });
    }
    lastEnterState.current = enter;
  }, [enter, isPlayerNear, showPortal]);
  
  // 플레이어와의 거리 체크 (흰색 사각형 기준) 및 포탈 애니메이션
  useFrame((state, delta) => {
    // 포탈 애니메이션 업데이트
    if (portalMaterialRef.current) {
      portalMaterialRef.current.uTime = state.clock.getElapsedTime();
    }
    
    if (characterRef?.current) {
      // 흰색 사각형의 위치 계산 (정육면체 앞 5 유닛)
      const groupPosition = new THREE.Vector3(...position);
      const squarePosition = groupPosition.clone().add(new THREE.Vector3(0, 0, 5));
      
      const playerPosition = characterRef.current.position;
      const distance = squarePosition.distanceTo(playerPosition);
      
      const maxDistance = 5; // 포탈이 보이기 시작하는 최대 거리
      const minDistance = 3; // 포탈이 최대 크기가 되는 최소 거리
      const nearDistance = 3; // Enter키가 작동하는 거리
      
      // 거리에 따른 포탈 크기 계산 (0에서 1 사이)
      const normalizedDistance = Math.max(0, Math.min(1, (distance - minDistance) / (maxDistance - minDistance)));
      const scale = 1 - normalizedDistance; // 가까울수록 1, 멀수록 0
      
      // 포탈 표시 여부 결정
      const shouldShowPortal = distance < maxDistance;
      const wasNear = isPlayerNear;
      const nowNear = distance < nearDistance;
      
      if (shouldShowPortal !== showPortal) {
        setShowPortal(shouldShowPortal);
      }
      
      if (wasNear !== nowNear) {
        setIsPlayerNear(nowNear);
      }
      
      // 포탈 크기 업데이트 (부드러운 전환)
      setPortalScale(scale);
    }
  });
  
  return (
    <group position={position} {...props}>
      {/* 둥근 정육면체 (Mailbox의 받침대) */}
      <RoundedCube 
        position={[0, 2, 0]} 
        scale={[4, 4, 4]}
        castShadow
        receiveShadow
      />
      
      {/* 정육면체 앞 바닥에 흰색 테두리 사각형 */}
      <mesh position={[0, 0.01, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <ringGeometry args={[3, 3.5, 4]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
      </mesh>
      
      {/* 포탈 효과 - 플레이어가 가까이 있을 때만 표시 */}
      {showPortal && (
        <group position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          {/* PortalVortex와 같은 스타일의 포탈 - 거리에 따라 크기 변화 */}
          <mesh scale={[4.9 * portalScale, 4.9 * portalScale, 1]}>
            <planeGeometry args={[1, 1]} />
            <vortexMaterial 
              ref={portalMaterialRef}
              transparent={true}
              opacity={portalScale} // 거리에 따라 투명도도 변화
              uColorStart={new THREE.Color('#FFFFFF')}  // 흰색
              uColorEnd={new THREE.Color('#E0E0E0')}    // 밝은 회색
            />
          </mesh>
        </group>
      )}
      
      {/* 정육면체 앞면에 "Mail" 텍스트 */}
      <Text
        position={[0, 2, 2.1]} // 정육면체 가운데에 위치
        fontSize={1.2}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
      >
        Mail
      </Text>
      
      {/* Mailbox 모델 */}
      <Mailbox 
        position={[0, 6, 0]} 
        scale={[2.3, 2.3, 2.3]} 
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

// 공사장 바리게이트 펜스 컴포넌트
function ConstructionBarrier({ position = [0, 0, 0], ...props }) {
  return (
    <group position={position} scale={1.6} {...props}>
      {/* 바리게이트 지지대들 */}
      {[-6, -3, 0, 3, 6].map((x, index) => (
        <mesh key={`support-${index}`} position={[x, 1.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.12, 3]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      ))}
      
      {/* 상단 가로 막대 */}
      <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[12.5, 0.15, 0.15]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* 중간 가로 막대 */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[12.5, 0.15, 0.15]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* 하단 가로 막대 */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[12.5, 0.15, 0.15]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* 경고 텍스트 "개발 중" */}
      <Text
        position={[0, 2.7, 0.15]}
        fontSize={0.6}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
        fontWeight="bold"
      >
        개발 중
      </Text>
      
      {/* 경고 텍스트 "UNDER CONSTRUCTION" */}
      <Text
        position={[0, 2.4, 0.15]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
        fontWeight="bold"
      >
        UNDER CONSTRUCTION
      </Text>
      
      {/* 경고 텍스트 "KEEP OUT" */}
      <Text
        position={[0, 2.1, 0.15]}
        fontSize={0.3}
        color="red"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
        fontWeight="bold"
      >
        KEEP OUT
      </Text>
      
      {/* 경고 아이콘들 (느낌표) */}
      {[-4.5, -1.5, 1.5, 4.5].map((x, index) => (
        <Text
          key={`warning-${index}`}
          position={[x, 2.7, 0.15]}
          fontSize={0.45}
          color="red"
          anchorX="center"
          anchorY="middle"
          rotation={[0, 0, 0]}
          fontWeight="bold"
        >
          !
        </Text>
      ))}
    </group>
  );
}

// Game Start 버튼 컴포넌트
function GameStartButton({ position = [0, 0, 0], characterRef, ...props }) {
  const [isPlayerNear, setIsPlayerNear] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [portalScale, setPortalScale] = useState(0);
  const { enter } = useKeyboardControls();
  const lastEnterState = useRef(false);
  const portalMaterialRef = useRef();
  
  // Enter키 처리 - 게임 사이트로 이동
  useEffect(() => {
    if (enter && !lastEnterState.current && showPortal) {
      // 게임 사이트를 새 탭에서 열기
      window.open('https://kdtwebgame.onrender.com/', '_blank');
    }
    lastEnterState.current = enter;
  }, [enter, isPlayerNear, showPortal]);
  
  // 플레이어와의 거리 체크 및 포탈 애니메이션
  useFrame((state, delta) => {
    // 포탈 애니메이션 업데이트
    if (portalMaterialRef.current) {
      portalMaterialRef.current.uTime = state.clock.getElapsedTime();
    }
    
    if (characterRef?.current) {
      // 흰색 사각형의 위치 계산 (버튼 앞 5 유닛)
      const groupPosition = new THREE.Vector3(...position);
      const squarePosition = groupPosition.clone().add(new THREE.Vector3(0, 0, 5));
      
      const playerPosition = characterRef.current.position;
      const distance = squarePosition.distanceTo(playerPosition);
      
      const maxDistance = 5; // 포탈이 보이기 시작하는 최대 거리
      const minDistance = 3; // 포탈이 최대 크기가 되는 최소 거리
      const nearDistance = 3; // Enter키가 작동하는 거리
      
      // 거리에 따른 포탈 크기 계산 (0에서 1 사이)
      const normalizedDistance = Math.max(0, Math.min(1, (distance - minDistance) / (maxDistance - minDistance)));
      const scale = 1 - normalizedDistance; // 가까울수록 1, 멀수록 0
      
      // 포탈 표시 여부 결정
      const shouldShowPortal = distance < maxDistance;
      const wasNear = isPlayerNear;
      const nowNear = distance < nearDistance;
      
      if (shouldShowPortal !== showPortal) {
        setShowPortal(shouldShowPortal);
      }
      
      if (wasNear !== nowNear) {
        setIsPlayerNear(nowNear);
      }
      
      // 포탈 크기 업데이트 (부드러운 전환)
      setPortalScale(scale);
    }
  });
  
  return (
    <group position={position} {...props}>
      {/* 게임 시작 버튼 사각형 */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 3, 0.8]} />
        <meshStandardMaterial 
          color="#4CAF50" 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* 버튼 앞면에 "Game Start" 텍스트 */}
      <Text
        position={[0, 1.5, 0.41]} // 버튼 앞면에 위치
        fontSize={1.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
      >
        Game Start
      </Text>
      
      {/* 바닥에 흰색 테두리 사각형 */}
      <mesh position={[0, 0.01, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <ringGeometry args={[5, 5.5, 4]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
      </mesh>
      
      {/* 포탈 효과 - 플레이어가 가까이 있을 때만 표시 */}
      {showPortal && (
        <group position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          {/* PortalVortex와 같은 스타일의 포탈 - 거리에 따라 크기 변화 */}
          <mesh scale={[8.2 * portalScale, 8.2 * portalScale, 1]}>
            <planeGeometry args={[1, 1]} />
            <vortexMaterial 
              ref={portalMaterialRef}
              transparent={true}
              opacity={portalScale} // 거리에 따라 투명도도 변화
              uColorStart={new THREE.Color('#4CAF50')}  // 초록색
              uColorEnd={new THREE.Color('#81C784')}    // 밝은 초록색
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Instagram Logo와 RoundedCube를 묶는 그룹 컴포넌트
function InstagramGroup({ position = [0, 0, 0], characterRef, ...props }) {
  const [isPlayerNear, setIsPlayerNear] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [portalScale, setPortalScale] = useState(0);
  const { enter } = useKeyboardControls();
  const lastEnterState = useRef(false);
  const portalMaterialRef = useRef();
  
  // Enter키 처리 - Instagram URL 열기
  useEffect(() => {
    if (enter && !lastEnterState.current && showPortal) {
      // Instagram URL을 새 탭에서 열기
      window.open('https://www.instagram.com/kim_kichan/#', '_blank');
    }
    lastEnterState.current = enter;
  }, [enter, isPlayerNear, showPortal]);
  
  // 플레이어와의 거리 체크 (흰색 사각형 기준) 및 포탈 애니메이션
  useFrame((state, delta) => {
    // 포탈 애니메이션 업데이트
    if (portalMaterialRef.current) {
      portalMaterialRef.current.uTime = state.clock.getElapsedTime();
    }
    
    if (characterRef?.current) {
      // 흰색 사각형의 위치 계산 (정육면체 앞 5 유닛)
      const groupPosition = new THREE.Vector3(...position);
      const squarePosition = groupPosition.clone().add(new THREE.Vector3(0, 0, 5));
      
      const playerPosition = characterRef.current.position;
      const distance = squarePosition.distanceTo(playerPosition);
      
      const maxDistance = 5; // 포탈이 보이기 시작하는 최대 거리
      const minDistance = 3; // 포탈이 최대 크기가 되는 최소 거리
      const nearDistance = 3; // Enter키가 작동하는 거리
      
      // 거리에 따른 포탈 크기 계산 (0에서 1 사이)
      const normalizedDistance = Math.max(0, Math.min(1, (distance - minDistance) / (maxDistance - minDistance)));
      const scale = 1 - normalizedDistance; // 가까울수록 1, 멀수록 0
      
      // 포탈 표시 여부 결정
      const shouldShowPortal = distance < maxDistance;
      const wasNear = isPlayerNear;
      const nowNear = distance < nearDistance;
      
      if (shouldShowPortal !== showPortal) {
        setShowPortal(shouldShowPortal);
      }
      
      if (wasNear !== nowNear) {
        setIsPlayerNear(nowNear);
      }
      
      // 포탈 크기 업데이트 (부드러운 전환)
      setPortalScale(scale);
    }
  });
  
  return (
    <group position={position} {...props}>
      {/* 둥근 정육면체 (Instagram Logo의 받침대) */}
      <RoundedCube 
        position={[0, 2, 0]} 
        scale={[4, 4, 4]}
        castShadow
        receiveShadow
      />
      
      {/* 정육면체 앞 바닥에 흰색 테두리 사각형 */}
      <mesh position={[0, 0.01, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <ringGeometry args={[3, 3.5, 4]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
      </mesh>
      
      {/* 포탈 효과 - 플레이어가 가까이 있을 때만 표시 */}
      {showPortal && (
        <group position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          {/* PortalVortex와 같은 스타일의 포탈 - 거리에 따라 크기 변화 */}
          <mesh scale={[4.9 * portalScale, 4.9 * portalScale, 1]}>
            <planeGeometry args={[1, 1]} />
            <vortexMaterial 
              ref={portalMaterialRef}
              transparent={true}
              opacity={portalScale} // 거리에 따라 투명도도 변화
              uColorStart={new THREE.Color('#FFFFFF')}  // 흰색
              uColorEnd={new THREE.Color('#E0E0E0')}    // 밝은 회색
            />
          </mesh>
        </group>
      )}
      
      {/* 정육면체 앞면에 "SNS" 텍스트 */}
      <Text
        position={[0, 2, 2.1]} // 정육면체 가운데에 위치
        fontSize={1.2}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
      >
        SNS
      </Text>
      
      {/* Instagram Logo 모델 */}
      <InstagramLogo 
        position={[0, 6.2, 0]} 
        scale={[6, 6, 6]} 
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

// Toolbox 컴포넌트 추가
function Toolbox(props) {
  const { scene } = useGLTF('/toolbox.glb');
  
  // Toolbox 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // 원래 재질 유지 (색상 변경하지 않음)
      }
    });
    return cloned;
  }, [scene]);
  
  return <primitive object={clonedScene} {...props} />;
}

useGLTF.preload('/githubcat.glb');
useGLTF.preload('/mailbox.glb');
useGLTF.preload('/instagramlogo.glb');
useGLTF.preload('/toolbox.glb');

function Level1Map({ onDoorPositionFound, onDoor2PositionFound, onStreetlightPositionsFound, onRedlightPositionsFound, onGreenlightPositionsFound, onRedlight2PositionsFound, onYellowlightPositionsFound, onStarLightPositionFound, ...props }) {
  const { scene } = useGLTF('/resources/GameView/Level1Map-v3.glb');

  // Level1Map 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    const streetlightPositions = [];
    const redlightPositions = [];
    const greenlightPositions = [];
    const redlight2Positions = [];
    const yellowlightPositions = [];
    let starLightPosition = null;

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      // door001 오브젝트 찾기 (Level2로 가는 문)
      if (child.name === 'door001') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onDoorPositionFound) {
          onDoorPositionFound(worldPos);
        }
      }
      // door 오브젝트 찾기 (Level3로 가는 문)
      if (child.name === 'door') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onDoor2PositionFound) {
          onDoor2PositionFound(worldPos);
        }
      }
      // Streetlight 오브젝트들 찾기
      if (child.name && child.name.startsWith('Streetlight')) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        streetlightPositions.push({
          name: child.name,
          position: worldPos
        });
      }
      // Redlight 오브젝트들 찾기 (Redlight004~009만)
      if (child.name && (
        child.name === 'Redlight004' ||
        child.name === 'Redlight005' ||
        child.name === 'Redlight006' ||
        child.name === 'Redlight007' ||
        child.name === 'Redlight008' ||
        child.name === 'Redlight009'
      )) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        redlightPositions.push({
          name: child.name,
          position: worldPos
        });
      }
      // Greenlight 오브젝트들 찾기 (Greenlight004~009만)
      if (child.name && (
        child.name === 'Greenlight' ||
        child.name === 'Greenlight001' ||
        child.name === 'Greenlight002' ||
        child.name === 'Greenlight003' 
      )) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        greenlightPositions.push({
          name: child.name,
          position: worldPos
        });
      }
      // Redlight 오브젝트들 찾기 (Redlight, Redlight001~003)
      if (child.name && (
        child.name === 'Redlight' ||
        child.name === 'Redlight001' ||
        child.name === 'Redlight002' ||
        child.name === 'Redlight003'
      )) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        redlight2Positions.push({
          name: child.name,
          position: worldPos
        });
      }
      // Yellowlight 오브젝트들 찾기 (Yellowlight, Yellowlight001~002)
      if (child.name && (
        child.name === 'Yellowlight' ||
        child.name === 'Yellowlight001' ||
        child.name === 'Yellowlight002'
      )) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        yellowlightPositions.push({
          name: child.name,
          position: worldPos
        });
      }
      // Yellowlight003 오브젝트 찾기 (크리스마스 트리 별 장식)
      if (child.name === 'Yellowlight003') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        starLightPosition = worldPos;
      }
    });

    // 가로등 위치들 전달
    if (onStreetlightPositionsFound && streetlightPositions.length > 0) {
      onStreetlightPositionsFound(streetlightPositions);
    }
    // 빨간 불빛 위치들 전달 (Redlight004~009)
    if (onRedlightPositionsFound && redlightPositions.length > 0) {
      onRedlightPositionsFound(redlightPositions);
    }
    // 초록 불빛 위치들 전달 (Greenlight004~009)
    if (onGreenlightPositionsFound && greenlightPositions.length > 0) {
      onGreenlightPositionsFound(greenlightPositions);
    }
    // 빨간 불빛 위치들 전달 (Redlight, Redlight001~003)
    if (onRedlight2PositionsFound && redlight2Positions.length > 0) {
      onRedlight2PositionsFound(redlight2Positions);
    }
    // 노란 불빛 위치들 전달 (Yellowlight, Yellowlight001~002)
    if (onYellowlightPositionsFound && yellowlightPositions.length > 0) {
      onYellowlightPositionsFound(yellowlightPositions);
    }
    // 별 장식 위치 전달 (Yellowlight003)
    if (onStarLightPositionFound && starLightPosition) {
      onStarLightPositionFound(starLightPosition);
    }

    return cloned;
  }, [scene, onDoorPositionFound, onDoor2PositionFound, onStreetlightPositionsFound, onRedlightPositionsFound, onGreenlightPositionsFound, onRedlight2PositionsFound, onYellowlightPositionsFound, onStarLightPositionFound]);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={clonedScene} {...props} />
    </RigidBody>
  );
}

useGLTF.preload('/resources/GameView/Suit.glb');
useGLTF.preload('/resources/GameView/Level1Map-v3.glb');

function Level2Map({ onDoorPositionFound, onAsuraCabinetPositionFound, onConviCabinetPositionFound, onVoidCabinetPositionFound, ...props }) {
  const { scene } = useGLTF('/resources/GameView/Level2Map-v2.glb');

  // Level2Map 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        // Gradmain_Sword, GradMain_Mace, Gradmain_Lance는 그림자 제외
        if (child.name === 'Gradmain_Sword' || child.name === 'GradMain_Mace' || child.name === 'Gradmain_Lance') {
          child.castShadow = false;
          child.receiveShadow = false;
        } else {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      }
      // door001 오브젝트 찾기
      if (child.name === 'door001') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onDoorPositionFound) {
          onDoorPositionFound(worldPos);
        }
      }
      // AsuraCabinet 오브젝트 찾기
      if (child.name === 'AsuraCabinet') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onAsuraCabinetPositionFound) {
          onAsuraCabinetPositionFound(worldPos);
        }
      }
      // ConviCabinet 오브젝트 찾기
      if (child.name === 'ConviCabinet') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onConviCabinetPositionFound) {
          onConviCabinetPositionFound(worldPos);
        }
      }
      // VoidCabinet 오브젝트 찾기
      if (child.name === 'VoidCabinet') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onVoidCabinetPositionFound) {
          onVoidCabinetPositionFound(worldPos);
        }
      }
    });
    return cloned;
  }, [scene, onDoorPositionFound, onAsuraCabinetPositionFound, onConviCabinetPositionFound, onVoidCabinetPositionFound]);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={clonedScene} {...props} />
    </RigidBody>
  );
}

useGLTF.preload('/resources/GameView/Level2Map-v2.glb');

function Level3Map({ onDoorPositionFound, onDoor2PositionFound, onFrontendTablePositionFound, onBackendTablePositionFound, onGamedevTablePositionFound, onToolsTablePositionFound, ...props }) {
  const { scene } = useGLTF('/resources/GameView/Level3Map-v2.glb');

  // Level3Map 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      // door 오브젝트 찾기 (Level1로 돌아가는 문)
      if (child.name === 'door') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onDoorPositionFound) {
          onDoorPositionFound(worldPos);
        }
      }
      // door002 오브젝트 찾기 (Level4로 가는 문)
      if (child.name === 'door002') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onDoor2PositionFound) {
          onDoor2PositionFound(worldPos);
        }
      }
      // FrontendTable 오브젝트 찾기
      if (child.name === 'FrontendTable' || child.name.includes('Frontend')) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onFrontendTablePositionFound) {
          onFrontendTablePositionFound(worldPos);
        }
      }
      // BackendTable 오브젝트 찾기
      if (child.name === 'BackendTable' || child.name.includes('Backend')) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onBackendTablePositionFound) {
          onBackendTablePositionFound(worldPos);
        }
      }
      // GamedevTable 오브젝트 찾기
      if (child.name === 'GamedevTable' || child.name.includes('Gamedev')) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onGamedevTablePositionFound) {
          onGamedevTablePositionFound(worldPos);
        }
      }
      // ToolsTable 오브젝트 찾기
      if (child.name === 'ToolsTable' || child.name.includes('Tools')) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onToolsTablePositionFound) {
          onToolsTablePositionFound(worldPos);
        }
      }
    });
    return cloned;
  }, [scene, onDoorPositionFound, onDoor2PositionFound, onFrontendTablePositionFound, onBackendTablePositionFound, onGamedevTablePositionFound, onToolsTablePositionFound]);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={clonedScene} {...props} />
    </RigidBody>
  );
}

useGLTF.preload('/resources/GameView/Level3Map-v2.glb');

function Level4Map({ onDoorPositionFound, onCabinetTVPositionFound, onWallPositionFound, onDeskCornerPositionFound, ...props }) {
  const { scene } = useGLTF('/resources/GameView/Level4Map-v2.glb');

  // Level4Map 모델을 복사해서 각 인스턴스가 독립적으로 작동하도록 함
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      // door002 오브젝트 찾기 (Level3로 돌아가는 문)
      if (child.name === 'door002') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onDoorPositionFound) {
          onDoorPositionFound(worldPos);
        }
      }
      // cabinetTelevision 오브젝트 찾기
      if (child.name === 'cabinetTelevision') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onCabinetTVPositionFound) {
          onCabinetTVPositionFound(worldPos);
        }
      }
      // wall 오브젝트 찾기
      if (child.name === 'wall') {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onWallPositionFound) {
          onWallPositionFound(worldPos);
        }
      }
      // deskCorner 오브젝트 찾기
      if (child.name === 'deskCorner' || child.name.includes('deskCorner')) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        if (onDeskCornerPositionFound) {
          onDeskCornerPositionFound(worldPos);
        }
      }
    });
    return cloned;
  }, [scene, onDoorPositionFound, onCabinetTVPositionFound, onWallPositionFound, onDeskCornerPositionFound]);

  // Cleanup 함수 추가
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 리소스 정리
      if (clonedScene) {
        clonedScene.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [clonedScene]);

  return (
    <RigidBody type="fixed" colliders="trimesh" key="level4-map-rigidbody">
      <primitive object={clonedScene} {...props} />
    </RigidBody>
  );
}

useGLTF.preload('/resources/GameView/Level4Map-v2.glb');

function Level1({ characterRef, onDoorPositionFound, onDoor2PositionFound, isDarkMode }) {
  const [streetlightPositions, setStreetlightPositions] = useState([]);
  const [redlightPositions, setRedlightPositions] = useState([]);
  const [greenlightPositions, setGreenlightPositions] = useState([]);
  const [redlight2Positions, setRedlight2Positions] = useState([]);
  const [yellowlightPositions, setYellowlightPositions] = useState([]);
  const [starLightPosition, setStarLightPosition] = useState(null);
  const [showRedLights, setShowRedLights] = useState(true);

  // 불빛 깜빡임 효과
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    // 1초마다 전환 (0.5초 빨강, 0.5초 초록 / 0.5초 빨강, 0.5초 노랑)
    const isRed = Math.floor(time * 2) % 2 === 0;
    setShowRedLights(isRed);
  });

  return (
    <>
      <Sky isDarkMode={isDarkMode} />

      {/* Level1 Map - 크리스마스 마을 */}
      <Level1Map
        onDoorPositionFound={onDoorPositionFound}
        onDoor2PositionFound={onDoor2PositionFound}
        onStreetlightPositionsFound={setStreetlightPositions}
        onRedlightPositionsFound={setRedlightPositions}
        onGreenlightPositionsFound={setGreenlightPositions}
        onRedlight2PositionsFound={setRedlight2Positions}
        onYellowlightPositionsFound={setYellowlightPositions}
        onStarLightPositionFound={setStarLightPosition}
        position={[0, 0, 0]}
        scale={1}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />

      {/* 가로등 불빛 - 다크 모드에서만 활성화 */}
      {isDarkMode && streetlightPositions.map((light, index) => (
        <group key={`streetlight-${index}`} position={[light.position.x, light.position.y, light.position.z]}>
          {/* 중심부 포인트 라이트 - 매우 강한 강도로 모델을 뚫고 나오도록 */}
          <pointLight
            color="#FFD700"
            intensity={100}
            distance={30}
            decay={1}
            castShadow={false}
          />
          {/* 위쪽 포인트 라이트 - 가로등 위에서도 빛이 나오도록 */}
          <pointLight
            position={[0, 0, 0]}
            color="#FFE4B5"
            intensity={200}
            distance={35}
            decay={1.2}
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
        </group>
      ))}

      {/* 빨간 불빛 장식 - 다크 모드이고 showRedLights가 true일 때만 표시 */}
      {isDarkMode && showRedLights && redlightPositions.map((light, index) => (
        <group key={`redlight-${index}`} position={[light.position.x, light.position.y, light.position.z]}>
          {/* 빨간 포인트 라이트 */}
          <pointLight
            color="#FF0000"
            intensity={100}
            distance={10}
            decay={2}
            castShadow={false}
          />
          {/* 불빛 시각화 */}
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#FF0000" transparent opacity={0.9} />
          </mesh>
          {/* 글로우 효과 */}
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#FF6666" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* 초록 불빛 장식 - 다크 모드이고 showRedLights가 false일 때만 표시 */}
      {isDarkMode && !showRedLights && greenlightPositions.map((light, index) => (
        <group key={`greenlight-${index}`} position={[light.position.x, light.position.y, light.position.z]}>
          {/* 초록 포인트 라이트 */}
          <pointLight
            color="#00FF00"
            intensity={80}
            distance={10}
            decay={2}
            castShadow={false}
          />
          {/* 불빛 시각화 */}
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#00FF00" transparent opacity={0.9} />
          </mesh>
          {/* 글로우 효과 */}
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#66FF66" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* 빨간 불빛 장식2 (Redlight, Redlight001~003) - 다크 모드이고 showRedLights가 true일 때만 표시 */}
      {isDarkMode && showRedLights && redlight2Positions.map((light, index) => (
        <group key={`redlight2-${index}`} position={[light.position.x, light.position.y, light.position.z]}>
          {/* 빨간 포인트 라이트 */}
          <pointLight
            color="#FF0000"
            intensity={90}
            distance={10}
            decay={2}
            castShadow={false}
          />
          {/* 불빛 시각화 */}
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#FF0000" transparent opacity={0.9} />
          </mesh>
          {/* 글로우 효과 */}
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#FF6666" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* 노란 불빛 장식 (Yellowlight, Yellowlight001~002) - 다크 모드이고 showRedLights가 false일 때만 표시 */}
      {isDarkMode && !showRedLights && yellowlightPositions.map((light, index) => (
        <group key={`yellowlight-${index}`} position={[light.position.x, light.position.y, light.position.z]}>
          {/* 노란 포인트 라이트 */}
          <pointLight
            color="#FFFF00"
            intensity={90}
            distance={10}
            decay={2}
            castShadow={false}
          />
          {/* 불빛 시각화 */}
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#FFFF00" transparent opacity={0.9} />
          </mesh>
          {/* 글로우 효과 */}
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#FFFF99" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* 크리스마스 트리 별 장식 불빛 (Yellowlight003) - 다크 모드에서만 활성화, 항상 켜져있음 */}
      {isDarkMode && starLightPosition && (
        <group position={[starLightPosition.x, starLightPosition.y + 1, starLightPosition.z]}>
          {/* 별 장식 포인트 라이트 - 더 밝고 멀리 비춤 */}
          <pointLight
            color="#FFD700"
            intensity={300}
            distance={30}
            decay={1.5}
            castShadow={false}
          />
        </group>
      )}

      {/* 숨겨진 텍스트로 프리로드 - 화면 밖에 배치 */}
      <Text
        position={[1000, 1000, 1000]}
        fontSize={0.4}
        color="black"
        visible={false}
      >
        첫번쨰 프로젝트에 오신걸 환영합니다! 🎉
      </Text>
    </>
  );
}

function Level2({ characterRef, onDoorPositionFound, onAsuraCabinetPositionFound, onConviCabinetPositionFound, onVoidCabinetPositionFound }) {
  const { scene } = useThree();

  // Level2 배경을 검정색으로 설정
  useEffect(() => {
    scene.background = new THREE.Color('#000000');

    // cleanup: Level2를 벗어날 때 배경 제거
    return () => {
      scene.background = null;
    };
  }, [scene]);

  return (
    <>
      {/* Level2 중앙 태양 - 위에서 비추는 조명 */}
      <directionalLight
        position={[0, 50, 0]}
        intensity={3}
        castShadow
        shadow-mapSize-width={8192}
        shadow-mapSize-height={8192}
        shadow-camera-far={1000}
        shadow-camera-left={-500}
        shadow-camera-right={500}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />

      {/* 태양 시각화 - 중앙 위 */}
      <mesh position={[0, 50, 0]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>

      {/* Level2 Map */}
      <Level2Map
        onDoorPositionFound={onDoorPositionFound}
        onAsuraCabinetPositionFound={onAsuraCabinetPositionFound}
        onConviCabinetPositionFound={onConviCabinetPositionFound}
        onVoidCabinetPositionFound={onVoidCabinetPositionFound}
        position={[0, 0, 0]}
        scale={1}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />

      {/* 숨겨진 텍스트로 프리로드 - 화면 밖에 배치 */}
      <Text
        position={[1000, 1000, 1000]}
        fontSize={0.4}
        color="black"
        visible={false}
      >
        Level 2에 오신걸 환영합니다! 🎉
      </Text>
    </>
  );
}

function Level3({ characterRef, onDoorPositionFound, onDoor2PositionFound, onFrontendTablePositionFound, onBackendTablePositionFound, onGamedevTablePositionFound, onToolsTablePositionFound }) {
  const { scene } = useThree();

  // Level3 배경을 검정색으로 설정
  useEffect(() => {
    scene.background = new THREE.Color('#000000');

    // cleanup: Level3를 벗어날 때 배경 제거
    return () => {
      scene.background = null;
    };
  }, [scene]);

  return (
    <>
      {/* Level3 중앙 태양 - 위에서 비추는 조명 */}
      <directionalLight
        position={[0, 50, 0]}
        intensity={3}
        castShadow
        shadow-mapSize-width={8192}
        shadow-mapSize-height={8192}
        shadow-camera-far={1000}
        shadow-camera-left={-500}
        shadow-camera-right={500}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />

      {/* 태양 시각화 - 중앙 위 */}
      <mesh position={[0, 50, 0]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>

      {/* Level3 Map */}
      <Level3Map
        onDoorPositionFound={onDoorPositionFound}
        onDoor2PositionFound={onDoor2PositionFound}
        onFrontendTablePositionFound={onFrontendTablePositionFound}
        onBackendTablePositionFound={onBackendTablePositionFound}
        onGamedevTablePositionFound={onGamedevTablePositionFound}
        onToolsTablePositionFound={onToolsTablePositionFound}
        position={[0, 0, 0]}
        scale={1}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />

      {/* 숨겨진 텍스트로 프리로드 - 화면 밖에 배치 */}
      <Text
        position={[1000, 1000, 1000]}
        fontSize={0.4}
        color="black"
        visible={false}
      >
        Level 3에 오신걸 환영합니다! 🎉
      </Text>
    </>
  );
}

function Level4({ characterRef, onDoorPositionFound, onCabinetTVPositionFound, onWallPositionFound, onDeskCornerPositionFound }) {
  const { scene } = useThree();

  // Level4 배경을 검정색으로 설정
  useEffect(() => {
    scene.background = new THREE.Color('#000000');

    // cleanup: Level4를 벗어날 때 배경 제거
    return () => {
      scene.background = null;
    };
  }, [scene]);

  return (
    <>
      {/* Level4 중앙 태양 - 위에서 비추는 조명 */}
      <directionalLight
        position={[0, 50, 0]}
        intensity={3}
        castShadow
        shadow-mapSize-width={8192}
        shadow-mapSize-height={8192}
        shadow-camera-far={1000}
        shadow-camera-left={-500}
        shadow-camera-right={500}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />

      {/* 태양 시각화 - 중앙 위 */}
      <mesh position={[0, 50, 0]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>

      {/* Level4 Map */}
      <Level4Map
        onDoorPositionFound={onDoorPositionFound}
        onCabinetTVPositionFound={onCabinetTVPositionFound}
        onWallPositionFound={onWallPositionFound}
        onDeskCornerPositionFound={onDeskCornerPositionFound}
        position={[0, 0, 0]}
        scale={1}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />

      {/* 숨겨진 텍스트로 프리로드 - 화면 밖에 배치 */}
      <Text
        position={[1000, 1000, 1000]}
        fontSize={0.4}
        color="black"
        visible={false}
      >
        Level 4에 오신걸 환영합니다! 🎉
      </Text>
    </>
  );
}

// 튜토리얼 팝업 컴포넌트
function TutorialPopup({ onClose, onDoNotShowAgain }) {
  const [currentPage, setCurrentPage] = useState(0); // 0: 조작법, 1: 미니맵

  const nextPage = () => {
    if (currentPage < 1) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-popup">
        <h2>🎮 포트폴리오 마을에 오신 것을 환영합니다!</h2>

        {/* 페이지 인디케이터 */}
        <div className="tutorial-page-indicator">
          <span className={currentPage === 0 ? 'active' : ''}>●</span>
          <span className={currentPage === 1 ? 'active' : ''}>●</span>
        </div>

        {/* 좌우 화살표 */}
        <button
          className={`tutorial-arrow tutorial-arrow-left ${currentPage === 0 ? 'disabled' : ''}`}
          onClick={prevPage}
          disabled={currentPage === 0}
        >
          ←
        </button>
        <button
          className={`tutorial-arrow tutorial-arrow-right ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={nextPage}
          disabled={currentPage === 1}
        >
          →
        </button>

        {/* 페이지 1: 조작법 */}
        {currentPage === 0 && (
          <div className="tutorial-content tutorial-page">
            <h3>조작법:</h3>
            <ul>
              <li><strong>WASD</strong>: 이동</li>
              <li><strong>Shift</strong>: 달리기</li>
              <li><strong>E</strong>: 상호작용</li>
            </ul>

            <p className="tutorial-description">
              마을을 돌아다니며 프로젝트를 탐험해보세요!
            </p>
          </div>
        )}

        {/* 페이지 2: 미니맵 */}
        {currentPage === 1 && (
          <div className="tutorial-content tutorial-page">
            <h3>마을 지도:</h3>
            <div className="tutorial-minimap">
              <img
                src="/resources/GameView/Level1Map-v2.png"
                alt="Level 1 Map"
                className="minimap-image"
              />
            </div>
            <p className="tutorial-description">
              지도를 참고하여 마을을 탐험해보세요!
            </p>
          </div>
        )}

        {/* 버튼은 2페이지(미니맵)에서만 표시 */}
        {currentPage === 1 && (
          <div className="tutorial-buttons">
            <button className="tutorial-btn tutorial-btn-primary" onClick={onClose}>
              시작하기
            </button>
            <button className="tutorial-btn tutorial-btn-secondary" onClick={onDoNotShowAgain}>
              다시 보지 않기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [gameState, setGameState] = useState('playing_level1'); // 게임 상태
  const characterRef = useRef();
  const [isWebMode, setIsWebMode] = useState(true); // 웹/게임 모드 상태 - 웹 모드로 시작
  const [isDarkMode, setIsDarkMode] = useState(false); // 다크 모드 상태
  const [showTutorial, setShowTutorial] = useState(false); // 튜토리얼 팝업 상태
  const [doorPosition, setDoorPosition] = useState(null); // Level1 door001 위치 (Level2로 가는 문)
  const [door2Position, setDoor2Position] = useState(null); // Level1 door 위치 (Level3로 가는 문)
  const [door3Position, setDoor3Position] = useState(null); // Level3 door002 위치 (Level4로 가는 문)
  const [doorPositionLevel2, setDoorPositionLevel2] = useState(null); // Level2 door001 위치
  const [doorPositionLevel3, setDoorPositionLevel3] = useState(null); // Level3 door 위치
  const [doorPositionLevel4, setDoorPositionLevel4] = useState(null); // Level4 door002 위치
  const [isNearDoor, setIsNearDoor] = useState(false); // Level1 door001 근처에 있는지 여부
  const [isNearDoor2, setIsNearDoor2] = useState(false); // Level1 door 근처에 있는지 여부
  const [isNearDoor3, setIsNearDoor3] = useState(false); // Level3 door002 근처에 있는지 여부
  const [isNearDoorLevel2, setIsNearDoorLevel2] = useState(false); // Level2 문 근처에 있는지 여부
  const [isNearDoorLevel3, setIsNearDoorLevel3] = useState(false); // Level3 문 근처에 있는지 여부
  const [isNearDoorLevel4, setIsNearDoorLevel4] = useState(false); // Level4 문 근처에 있는지 여부
  const [cabinetTVPosition, setCabinetTVPosition] = useState(null); // Level4 cabinetTelevision 위치
  const [isNearCabinetTV, setIsNearCabinetTV] = useState(false); // cabinetTelevision 근처에 있는지 여부
  const [showContactInfo, setShowContactInfo] = useState(false); // 연락처 정보 모달 표시 여부
  const [wallPosition, setWallPosition] = useState(null); // Level4 wall 위치
  const [isNearWall, setIsNearWall] = useState(false); // wall 근처에 있는지 여부
  const [showProfile, setShowProfile] = useState(false); // 프로필 모달 표시 여부
  const [asuraCabinetPosition, setAsuraCabinetPosition] = useState(null); // Level2 AsuraCabinet 위치
  const [isNearAsuraCabinet, setIsNearAsuraCabinet] = useState(false); // AsuraCabinet 근처에 있는지 여부
  const [showFirstProject, setShowFirstProject] = useState(false); // 첫 번째 프로젝트 모달 표시 여부
  const [conviCabinetPosition, setConviCabinetPosition] = useState(null); // Level2 ConviCabinet 위치
  const [isNearConviCabinet, setIsNearConviCabinet] = useState(false); // ConviCabinet 근처에 있는지 여부
  const [showSecondProject, setShowSecondProject] = useState(false); // 두 번째 프로젝트 모달 표시 여부
  const [voidCabinetPosition, setVoidCabinetPosition] = useState(null); // Level2 VoidCabinet 위치
  const [isNearVoidCabinet, setIsNearVoidCabinet] = useState(false); // VoidCabinet 근처에 있는지 여부
  const [showThirdProject, setShowThirdProject] = useState(false); // 세 번째 프로젝트 모달 표시 여부
  const [frontendTablePosition, setFrontendTablePosition] = useState(null); // Level3 FrontendTable 위치
  const [isNearFrontendTable, setIsNearFrontendTable] = useState(false); // FrontendTable 근처에 있는지 여부
  const [backendTablePosition, setBackendTablePosition] = useState(null); // Level3 BackendTable 위치
  const [isNearBackendTable, setIsNearBackendTable] = useState(false); // BackendTable 근처에 있는지 여부
  const [gamedevTablePosition, setGamedevTablePosition] = useState(null); // Level3 GamedevTable 위치
  const [isNearGamedevTable, setIsNearGamedevTable] = useState(false); // GamedevTable 근처에 있는지 여부
  const [toolsTablePosition, setToolsTablePosition] = useState(null); // Level3 ToolsTable 위치
  const [isNearToolsTable, setIsNearToolsTable] = useState(false); // ToolsTable 근처에 있는지 여부
  const [deskCornerPosition, setDeskCornerPosition] = useState(null); // Level4 deskCorner 위치
  const [isNearDeskCorner, setIsNearDeskCorner] = useState(false); // deskCorner 근처에 있는지 여부
  const [showPortfolioPopup, setShowPortfolioPopup] = useState(false); // 포트폴리오 팝업 표시 여부
  const [isFading, setIsFading] = useState(false); // 페이드 전환 상태
  const [spawnPosition, setSpawnPosition] = useState([0, 2, 0]); // 캐릭터 스폰 위치

  // 페이드 효과와 함께 레벨 전환
  const setGameStateWithFade = (newState) => {
    setIsFading(true); // 페이드 아웃 시작

    // 페이드 아웃 후 레벨 전환 및 스폰 위치 설정
    setTimeout(() => {
      // 레벨 복귀 시 스폰 위치 설정 및 목적지 상태로 즉시 전환
      if (newState === 'returning_to_level1') {
        setSpawnPosition([9.96, 0.29, -61.47]); // Level2에서 Level1로
        setGameState('playing_level1');
      } else if (newState === 'returning_to_level1_from_level3') {
        setSpawnPosition([-41.16, 0.29, -26.00]); // Level3에서 Level1로
        setGameState('playing_level1');
      } else if (newState === 'returning_to_level3_from_level4') {
        setSpawnPosition([-40.53, 0.32, -16.26]); // Level4에서 Level3로
        setGameState('playing_level3');
      } else if (newState === 'playing_level2') {
        setSpawnPosition([0, 2, 0]); // Level2 초기 스폰
        setGameState('playing_level2');
      } else if (newState === 'playing_level3') {
        setSpawnPosition([0, 2, 0]); // Level3 초기 스폰
        setGameState('playing_level3');
      } else if (newState === 'playing_level4') {
        setSpawnPosition([0, 2, 0]); // Level4 초기 스폰
        setGameState('playing_level4');
      } else if (newState === 'playing_level1') {
        setSpawnPosition([0, 2, 0]); // Level1 초기 스폰
        setGameState('playing_level1');
      }
    }, 400); // 0.4초 페이드 아웃

    // 전체 애니메이션 완료 후 오버레이 제거
    setTimeout(() => {
      setIsFading(false);
    }, 1800); // 1.8초 애니메이션 완료 후
  };

  const toggleMode = () => {
    const newMode = !isWebMode;
    setIsWebMode(newMode);

    // 웹 모드에서 게임 모드로 전환 시 튜토리얼 팝업 확인
    if (!newMode) { // 게임 모드로 전환
      const doNotShow = localStorage.getItem('hideGameTutorial');
      if (!doNotShow) {
        setShowTutorial(true);
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
  };

  const handleDoNotShowAgain = () => {
    localStorage.setItem('hideGameTutorial', 'true');
    setShowTutorial(false);
  };

  // 다크 모드 클래스 적용
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Physics key - spawnPosition이 변경되면 Physics를 재생성
  const getPhysicsKey = () => {
    // spawnPosition을 문자열로 변환하여 key로 사용
    return `${gameState}-${spawnPosition.join(',')}`;
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <NavigationBar isWebMode={isWebMode} onToggleMode={toggleMode} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

      {/* 튜토리얼 팝업 */}
      {showTutorial && !isWebMode && (
        <TutorialPopup
          onClose={handleCloseTutorial}
          onDoNotShowAgain={handleDoNotShowAgain}
        />
      )}

      {isWebMode ? (
        // 웹 모드: 포트폴리오 웹사이트
        <WebModeContent onToggleMode={toggleMode} isDarkMode={isDarkMode} />
      ) : (
        // 게임 모드: 3D 게임
        <Canvas 
          camera={{ position: [-0.00, 28.35, 19.76], rotation: [-0.96, -0.00, -0.00] }}
          shadows
        >
        <ambientLight intensity={0.5} />

        {/* Level1 전용 태양/달 */}
        {gameState === 'playing_level1' && (
          <>
            <directionalLight
              position={[50, 50, 25]}
              intensity={isDarkMode ? 2 : 6}
              color={isDarkMode ? "#C0D0F0" : "#FFFFFF"}
              castShadow
              shadow-mapSize-width={8192}
              shadow-mapSize-height={8192}
              shadow-camera-far={1000}
              shadow-camera-left={-500}
              shadow-camera-right={500}
              shadow-camera-top={500}
              shadow-camera-bottom={-500}
              shadow-bias={-0.0001}
              shadow-normalBias={0.02}
              shadow-radius={4}
            />
            {/* 태양/달 시각화 */}
            <mesh position={[50, 50, 25]}>
              <sphereGeometry args={[3, 16, 16]} />
              <meshBasicMaterial color={isDarkMode ? "#E8EAF6" : "#FDB813"} />
            </mesh>
            {/* 다크 모드에서 주변 조명 추가 (달빛 분위기) */}
            {isDarkMode && (
              <ambientLight intensity={0.3} color="#4A5A8A" />
            )}
          </>
        )}

        <Suspense fallback={null}>
          <Physics key={getPhysicsKey()} gravity={[0, -40, 0]}>
            <Model characterRef={characterRef} gameState={gameState} setGameState={setGameState} setGameStateWithFade={setGameStateWithFade} doorPosition={doorPosition} setIsNearDoor={setIsNearDoor} door2Position={door2Position} setIsNearDoor2={setIsNearDoor2} door3Position={door3Position} setIsNearDoor3={setIsNearDoor3} doorPositionLevel2={doorPositionLevel2} setIsNearDoorLevel2={setIsNearDoorLevel2} doorPositionLevel3={doorPositionLevel3} setIsNearDoorLevel3={setIsNearDoorLevel3} doorPositionLevel4={doorPositionLevel4} setIsNearDoorLevel4={setIsNearDoorLevel4} cabinetTVPosition={cabinetTVPosition} setIsNearCabinetTV={setIsNearCabinetTV} setShowContactInfo={setShowContactInfo} wallPosition={wallPosition} setIsNearWall={setIsNearWall} setShowProfile={setShowProfile} asuraCabinetPosition={asuraCabinetPosition} setIsNearAsuraCabinet={setIsNearAsuraCabinet} setShowFirstProject={setShowFirstProject} conviCabinetPosition={conviCabinetPosition} setIsNearConviCabinet={setIsNearConviCabinet} setShowSecondProject={setShowSecondProject} voidCabinetPosition={voidCabinetPosition} setIsNearVoidCabinet={setIsNearVoidCabinet} setShowThirdProject={setShowThirdProject} frontendTablePosition={frontendTablePosition} setIsNearFrontendTable={setIsNearFrontendTable} backendTablePosition={backendTablePosition} setIsNearBackendTable={setIsNearBackendTable} gamedevTablePosition={gamedevTablePosition} setIsNearGamedevTable={setIsNearGamedevTable} toolsTablePosition={toolsTablePosition} setIsNearToolsTable={setIsNearToolsTable} deskCornerPosition={deskCornerPosition} setIsNearDeskCorner={setIsNearDeskCorner} setShowPortfolioPopup={setShowPortfolioPopup} spawnPosition={spawnPosition} />
            <CameraController gameState={gameState} characterRef={characterRef} />
            <CameraLogger />
            {gameState === 'playing_level1' && (
              <Level1 key="level1" characterRef={characterRef} onDoorPositionFound={setDoorPosition} onDoor2PositionFound={setDoor2Position} isDarkMode={isDarkMode} />
            )}
            {gameState === 'playing_level2' && (
              <Level2 key="level2" characterRef={characterRef} onDoorPositionFound={setDoorPositionLevel2} onAsuraCabinetPositionFound={setAsuraCabinetPosition} onConviCabinetPositionFound={setConviCabinetPosition} onVoidCabinetPositionFound={setVoidCabinetPosition} />
            )}
            {gameState === 'playing_level3' && (
              <Level3 key="level3" characterRef={characterRef} onDoorPositionFound={setDoorPositionLevel3} onDoor2PositionFound={setDoor3Position} onFrontendTablePositionFound={setFrontendTablePosition} onBackendTablePositionFound={setBackendTablePosition} onGamedevTablePositionFound={setGamedevTablePosition} onToolsTablePositionFound={setToolsTablePosition} />
            )}
            {gameState === 'playing_level4' && (
              <Level4 key="level4" characterRef={characterRef} onDoorPositionFound={setDoorPositionLevel4} onCabinetTVPositionFound={setCabinetTVPosition} onWallPositionFound={setWallPosition} onDeskCornerPositionFound={setDeskCornerPosition} />
            )}
          </Physics>
        </Suspense>
        </Canvas>
      )}

      {/* 문 상호작용 UI - Level1 door001 (Level2로) */}
      {!isWebMode && isNearDoor && gameState === 'playing_level1' && (
        <div className="door-interaction-ui">
          🚪 E키를 눌러 프로젝트 갤러리로 입장
        </div>
      )}

      {/* 문 상호작용 UI - Level1 door (Level3로) */}
      {!isWebMode && isNearDoor2 && gameState === 'playing_level1' && (
        <div className="door-interaction-ui">
          🚪 E키를 눌러 기술 스택 사무실로 입장
        </div>
      )}

      {/* 문 상호작용 UI - Level2 */}
      {!isWebMode && isNearDoorLevel2 && gameState === 'playing_level2' && (
        <div className="door-interaction-ui">
          🚪 E키를 눌러 마을로 돌아가기
        </div>
      )}

      {/* 문 상호작용 UI - Level3 door (Level1로) */}
      {!isWebMode && isNearDoorLevel3 && gameState === 'playing_level3' && (
        <div className="door-interaction-ui">
          🚪 E키를 눌러 마을로 돌아가기
        </div>
      )}

      {/* 문 상호작용 UI - Level3 door002 (Level4로) */}
      {!isWebMode && isNearDoor3 && gameState === 'playing_level3' && (
        <div className="door-interaction-ui">
          🚪 E키를 눌러 개인 작업실로 이동
        </div>
      )}

      {/* 문 상호작용 UI - Level4 */}
      {!isWebMode && isNearDoorLevel4 && gameState === 'playing_level4' && (
        <div className="door-interaction-ui">
          🚪 E키를 눌러 사무실로 돌아가기
        </div>
      )}

      {/* cabinetTelevision 상호작용 UI - Level4 */}
      {!isWebMode && isNearCabinetTV && gameState === 'playing_level4' && (
        <div className="door-interaction-ui">
          📺 E키를 눌러 연락처 보기
        </div>
      )}

      {/* wall 상호작용 UI - Level4 */}
      {!isWebMode && isNearWall && gameState === 'playing_level4' && (
        <div className="door-interaction-ui">
          🖼️ E키를 눌러 프로필 보기
        </div>
      )}

      {/* AsuraCabinet 상호작용 UI - Level2 */}
      {!isWebMode && isNearAsuraCabinet && gameState === 'playing_level2' && (
        <div className="door-interaction-ui">
          🎮 E키를 눌러 Asura 프로젝트 보기
        </div>
      )}

      {/* ConviCabinet 상호작용 UI - Level2 */}
      {!isWebMode && isNearConviCabinet && gameState === 'playing_level2' && (
        <div className="door-interaction-ui">
          🏪 E키를 눌러 Convi 프로젝트 보기
        </div>
      )}

      {/* VoidCabinet 상호작용 UI - Level2 */}
      {!isWebMode && isNearVoidCabinet && gameState === 'playing_level2' && (
        <div className="door-interaction-ui">
          🎯 E키를 눌러 Void 프로젝트 보기
        </div>
      )}

      {/* deskCorner 상호작용 UI - Level4 */}
      {!isWebMode && isNearDeskCorner && gameState === 'playing_level4' && !showPortfolioPopup && (
        <div className="door-interaction-ui">
          💼 E키를 눌러 포트폴리오 프로젝트 보기
        </div>
      )}

      {/* 페이드 전환 오버레이 */}
      {isFading && (
        <div className="fade-overlay" />
      )}

      {/* 연락처 정보 모달 */}
      {showContactInfo && (
        <div className="contact-info-modal-overlay" onClick={() => setShowContactInfo(false)}>
          <div className="contact-info-modal" onClick={(e) => e.stopPropagation()}>
            <button className="contact-info-close" onClick={() => setShowContactInfo(false)}>
              ✕
            </button>
            <h2>연락처 정보</h2>
            <div className="contact-info-content">
              <div className="contact-info-item">
                <span className="contact-info-icon">📧</span>
                <div className="contact-info-details">
                  <div className="contact-info-label">Email</div>
                  <div className="contact-info-value">kimkichan1225@gmail.com</div>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="contact-info-icon">📱</span>
                <div className="contact-info-details">
                  <div className="contact-info-label">Phone</div>
                  <div className="contact-info-value">+82 10-4225-5388</div>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="contact-info-icon">💻</span>
                <div className="contact-info-details">
                  <div className="contact-info-label">GitHub</div>
                  <a href="https://github.com/kimkichan1225" target="_blank" rel="noopener noreferrer" className="contact-info-value contact-info-link">
                    github.com/kimkichan1225
                  </a>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="contact-info-icon">📷</span>
                <div className="contact-info-details">
                  <div className="contact-info-label">Instagram</div>
                  <a href="https://www.instagram.com/kim_kichan/#" target="_blank" rel="noopener noreferrer" className="contact-info-value contact-info-link">
                    @kim_kichan
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 프로필 모달 */}
      {showProfile && (
        <div className="profile-modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={() => setShowProfile(false)}>
              ✕
            </button>
            <h2>About Me</h2>
            <div className="profile-modal-content">
              <div className="profile-image-section">
                <img src="/Kimkichan-1.png" alt="김기찬" className="profile-modal-image" />
                <p className="profile-birthday">📅 2001.12.25</p>
              </div>
              <div className="profile-text-section">
                <h3>안녕하세요, 김기찬입니다!</h3>
                <p>
                  <strong className="highlight">"어떻게 하면 더 재미있는 경험을 만들 수 있을까?"</strong>라는 질문에서 시작해, <strong>웹과 게임 개발의 경계를 넘나드는</strong> 프로젝트들을 만들어왔습니다.
                </p>
                <p>
                  <strong className="highlight">Socket.IO</strong>로 구현한 <strong>멀티플레이어 액션 게임</strong>에서는 수십 명이 동시에 플레이하며 실시간으로 상호작용하는 시스템을, <strong className="highlight">React 19</strong>과 <strong className="highlight">Supabase</strong>를 활용한 편의점 솔루션에서는 실무에 바로 적용 가능한 <strong>통합 관리 시스템</strong>을 구축했습니다. <strong className="highlight">Unity</strong>로 제작한 <strong>2D RPG</strong>에서는 턴제 전투와 주사위 메커니즘이라는 독특한 조합을 시도했죠.
                </p>
                <p>
                  지금 보고 계신 이 포트폴리오 역시 단순한 소개 페이지가 아닌, <strong className="highlight">Three.js</strong> 기반의 <strong>3D 게임 세계를 직접 탐험할 수 있는 인터랙티브 경험</strong>입니다. <strong className="highlight">TypeScript</strong>, <strong className="highlight">React Three Fiber</strong>, <strong className="highlight">커스텀 GLSL 셰이더</strong>까지 활용해 웹에서도 몰입감 있는 3D 환경을 구현했습니다.
                </p>
                <p>
                  <strong className="highlight">AI 개발 도구</strong>를 단순히 '사용'하는 것을 넘어, 이를 통해 <strong>개발 워크플로우 자체를 재설계</strong>하고 있습니다. 빠른 프로토타이핑과 반복적인 개선 사이클로 <strong>아이디어를 현실로 만드는 속도</strong>를 높이고, 더 많은 시간을 <strong>창의적인 문제 해결</strong>에 투자합니다.
                </p>
              </div>
            </div>
            <div className="profile-skills-grid">
              <div className="profile-skill-card">
                <div className="profile-skill-icon">🎮</div>
                <h4>게임 개발</h4>
                <p>Unity 2D/3D 게임 개발 및 Three.js를 활용한 웹 기반 3D 인터랙티브 경험 구현</p>
              </div>
              <div className="profile-skill-card">
                <div className="profile-skill-icon">💻</div>
                <h4>풀스택 개발</h4>
                <p>React, TypeScript, Node.js 등을 활용한 현대적인 웹 애플리케이션 풀스택 개발</p>
              </div>
              <div className="profile-skill-card">
                <div className="profile-skill-icon">👥</div>
                <h4>실시간 시스템</h4>
                <p>Socket.IO 기반 실시간 멀티플레이어 시스템 및 실시간 데이터 동기화 구현</p>
              </div>
              <div className="profile-skill-card">
                <div className="profile-skill-icon">🤖</div>
                <h4>AI 도구 활용</h4>
                <p>Claude Code, Cursor 등 AI 코딩 도구를 활용한 효율적인 개발 워크플로우 구축</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 첫 번째 프로젝트 모달 */}
      {showFirstProject && (
        <ProjectModal
          project={projectsData[0]}
          onClose={() => setShowFirstProject(false)}
        />
      )}

      {/* 두 번째 프로젝트 모달 */}
      {showSecondProject && (
        <ProjectModal
          project={projectsData[1]}
          onClose={() => setShowSecondProject(false)}
        />
      )}

      {/* 세 번째 프로젝트 모달 */}
      {showThirdProject && (
        <ProjectModal
          project={projectsData[2]}
          onClose={() => setShowThirdProject(false)}
        />
      )}

      {/* 포트폴리오 프로젝트 팝업 - Level4 deskCorner (게임뷰 전용) */}
      {showPortfolioPopup && !isWebMode && (
        <div className="portfolio-popup-overlay" onClick={() => setShowPortfolioPopup(false)}>
          <div className="portfolio-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="portfolio-popup-close" onClick={() => setShowPortfolioPopup(false)}>✕</button>

            <h2 className="portfolio-popup-title">💼 3D Interactive Portfolio</h2>
            <p className="portfolio-popup-description">React Three Fiber로 구축한 3D 인터랙티브 포트폴리오 웹사이트</p>

            <div className="portfolio-popup-section">
              <h3>🛠️ 기술 스택</h3>
              <div className="portfolio-tech-tags">
                <span className="portfolio-tech-tag">React 19</span>
                <span className="portfolio-tech-tag">Three.js</span>
                <span className="portfolio-tech-tag">React Three Fiber</span>
                <span className="portfolio-tech-tag">JavaScript</span>
                <span className="portfolio-tech-tag">HTML5</span>
                <span className="portfolio-tech-tag">CSS3</span>
                <span className="portfolio-tech-tag">Vite</span>
                <span className="portfolio-tech-tag">Netlify</span>
              </div>
            </div>

            <div className="portfolio-popup-section">
              <h3>📋 주요 기능</h3>
              <ul className="portfolio-feature-list">
                <li>웹 모드와 게임 모드 간 원활한 전환 (듀얼 모드 시스템)</li>
                <li>4개의 독특한 3D 레벨 (자연 마을, 도시 레이싱, 오피스, 우주 공간)</li>
                <li>GLTF 애니메이션 캐릭터 컨트롤 (Idle, Walk, Run)</li>
                <li>Rapier 물리 엔진 기반 캐릭터 이동 및 충돌 감지</li>
                <li>레벨 간 포털/도어 상호작용 시스템</li>
                <li>드라이브 가능한 차량 시스템 (Level 2)</li>
                <li>프로젝트별 기술 스택 팝업 시스템</li>
                <li>커스텀 GLSL 셰이더 (그라디언트 바닥, 포털 볼텍스)</li>
              </ul>
            </div>

            <div className="portfolio-popup-section">
              <h3>🎯 주요 성과</h3>
              <ul className="portfolio-achievement-list">
                <li>웹과 게임을 하나로 통합한 독창적인 UX</li>
                <li>Three.js와 React의 완벽한 통합</li>
                <li>물리 기반 캐릭터 컨트롤러 구현</li>
                <li>4개 레벨 간 원활한 전환 시스템</li>
                <li>Rapier RigidBody 재생성 패턴으로 오류 해결</li>
                <li>근접 감지 기반 인터랙션 시스템</li>
              </ul>
            </div>

            <div className="portfolio-popup-links">
              <a href="https://github.com/kimkichan1225/Portfolio" target="_blank" rel="noopener noreferrer" className="portfolio-link-button github-button">
                <span>GitHub</span>
              </a>
              <a href="https://kichan.site/" target="_blank" rel="noopener noreferrer" className="portfolio-link-button demo-button">
                <span>Live Demo</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 프론트엔드 기술 팝업 - Level3 FrontendTable 근처 */}
      {!isWebMode && isNearFrontendTable && gameState === 'playing_level3' && (
        <div className="frontend-tech-popup">
          <div className="frontend-tech-content">
            <h2>🎨 프로젝트별 Frontend 기술 스택</h2>
            <div className="frontend-tech-list">
              {projectsData.map((project, index) => {
                // Frontend 관련 기술만 필터링 (웹뷰 기준: React 19, TypeScript, JavaScript, Three.js, HTML5, CSS3, TailwindCSS)
                const frontendTechs = project.tech.filter(tech =>
                  ['React 19', 'React', 'TypeScript', 'JavaScript', 'Three.js', 'HTML5', 'HTML', 'CSS3', 'CSS', 'TailwindCSS'].some(
                    frontendKeyword => tech.includes(frontendKeyword)
                  )
                );

                if (frontendTechs.length === 0) return null;

                return (
                  <div key={project.id} className="frontend-project-item">
                    <h3>{project.title}</h3>
                    <div className="tech-tags">
                      {frontendTechs.map((tech, techIndex) => (
                        <span key={techIndex} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 백엔드 기술 팝업 - Level3 BackendTable 근처 */}
      {!isWebMode && isNearBackendTable && gameState === 'playing_level3' && (
        <div className="backend-tech-popup">
          <div className="backend-tech-content">
            <h2>⚙️ 프로젝트별 Backend 기술 스택</h2>
            <div className="backend-tech-list">
              {projectsData.map((project, index) => {
                // Backend 관련 기술만 필터링 (웹뷰 기준: Node.js, Express, Socket.IO, Supabase, PostgreSQL)
                const backendTechs = project.tech.filter(tech =>
                  ['Node.js', 'Express', 'Socket.IO', 'Supabase', 'PostgreSQL'].some(
                    backendKeyword => tech.includes(backendKeyword)
                  )
                );

                if (backendTechs.length === 0) return null;

                return (
                  <div key={project.id} className="backend-project-item">
                    <h3>{project.title}</h3>
                    <div className="tech-tags">
                      {backendTechs.map((tech, techIndex) => (
                        <span key={techIndex} className="tech-tag backend-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 게임 개발 기술 팝업 - Level3 GamedevTable 근처 */}
      {!isWebMode && isNearGamedevTable && gameState === 'playing_level3' && (
        <div className="gamedev-tech-popup">
          <div className="gamedev-tech-content">
            <h2>🎮 프로젝트별 Game Dev 기술 스택</h2>
            <div className="gamedev-tech-list">
              {projectsData.map((project, index) => {
                // Game Dev 관련 기술만 필터링 (웹뷰 기준: Unity 6, C#, React Three Fiber)
                const gamedevTechs = project.tech.filter(tech =>
                  ['Unity 6', 'Unity', 'C#', 'React Three Fiber'].some(
                    gamedevKeyword => tech.includes(gamedevKeyword)
                  )
                );

                if (gamedevTechs.length === 0) return null;

                return (
                  <div key={project.id} className="gamedev-project-item">
                    <h3>{project.title}</h3>
                    <div className="tech-tags">
                      {gamedevTechs.map((tech, techIndex) => (
                        <span key={techIndex} className="tech-tag gamedev-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 도구 팝업 - Level3 ToolsTable 근처 */}
      {!isWebMode && isNearToolsTable && gameState === 'playing_level3' && (
        <div className="tools-tech-popup">
          <div className="tools-tech-content">
            <h2>🛠️ Tools & 개발 도구</h2>
            <div className="tools-general-list">
              <div className="tools-general-item">
                <h3>사용하는 도구</h3>
                <div className="tech-tags">
                  <span className="tech-tag tools-tag">Git</span>
                  <span className="tech-tag tools-tag">GitHub</span>
                  <span className="tech-tag tools-tag">Vite</span>
                  <span className="tech-tag tools-tag">Netlify</span>
                  <span className="tech-tag tools-tag">Render</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;