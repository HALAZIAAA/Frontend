import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 배포 빌드에서 백엔드 주소를 빠뜨리면 localhost/잘못된 주소로 조용히 나가므로 빌드를 막는다.
  // 같은 도메인 배포를 위해 빈 문자열(VITE_BACKEND_ORIGIN=)로 명시한 경우는 통과시킨다.
  if (command === 'build' && mode === 'production') {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    if (env.VITE_BACKEND_ORIGIN === undefined) {
      throw new Error(
        'VITE_BACKEND_ORIGIN이 정의되지 않았습니다. .env.production 또는 배포 환경변수에 설정하세요. ' +
          '(같은 도메인 배포면 VITE_BACKEND_ORIGIN= 처럼 빈 값으로 명시)',
      )
    }
  }

  return {
    plugins: [react()],
  }
})
