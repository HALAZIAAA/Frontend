// [DEMO] 이미지 텍스트 변환 단계에서 순차 표시할 슬라이드
// 백엔드 연결 시 이 파일 삭제 + UploadSection.tsx 의 [DEMO] 슬라이드 import 제거
//
// assets 에 아래 이름으로 이미지 파일을 넣어주세요:
//   demo-1.png  →  건강
//   demo-2.png  →  피곤한 남자
//   demo-3.png  →  숙취 쩔어
//   demo-4.png  →  두통
//   demo-5.png  →  병원가봐요

import slide1 from '../assets/demo-1.png'
import slide2 from '../assets/demo-2.png'
import slide3 from '../assets/demo-3.png'
import slide4 from '../assets/demo-4.png'
import slide5 from '../assets/demo-5.png'

export const DEMO_SLIDES: string[] = [slide1, slide2, slide3, slide4, slide5]
