// 변환 결과 TXT를 줄 그대로 보여 준다. 앞 공백(제목 8칸·본문 2칸 들여쓰기)을 살리고,
// 페이지 표시(@@p3)와 구간 표시([그림 시작] 등)는 흐리게, 제목 줄은 굵게 그린다.
function lineClass(line: string): string {
  if (/^@@p\d+$/.test(line)) return 'demo-txt-page'
  if (/^\[(그림|표) (시작|끝)\]$/.test(line)) return 'demo-txt-boundary'
  if (line.startsWith('      ')) return 'demo-txt-title'
  return ''
}

function TxtView({ lines }: { lines: string[] }) {
  return (
    <pre className="demo-txt">
      {lines.map((line, index) => (
        <span key={index} className={lineClass(line)}>
          {line}
          {'\n'}
        </span>
      ))}
    </pre>
  )
}

export default TxtView
