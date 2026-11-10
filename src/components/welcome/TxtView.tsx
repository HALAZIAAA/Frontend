// 변환 결과 TXT를 줄 그대로 보여 준다. 앞 공백(제목 8칸·본문 2칸 들여쓰기)을 살리고,
// 페이지 표시(@@p3)와 구간 표시([그림 시작] 등)는 흐리게, 제목 줄은 굵게 그린다.
// 제목은 페이지 표시 바로 뒤에 이어지는 들여 쓴 줄만이다. 본문 속 코드나 터미널 글자도
// 앞 공백이 많을 수 있어서 들여쓰기만으로는 제목인지 알 수 없다.
function lineClasses(lines: string[]): string[] {
  let inHeading = false
  return lines.map((line) => {
    if (/^\s*@@p\d+$/.test(line)) {
      inHeading = true
      return 'demo-txt-page'
    }
    if (inHeading && line.startsWith('      ')) return 'demo-txt-title'
    inHeading = false
    if (/^\[((그림|표) (시작|끝)|구분선)\]$/.test(line)) return 'demo-txt-boundary'
    return ''
  })
}

function TxtView({ lines }: { lines: string[] }) {
  const classes = lineClasses(lines)
  return (
    <pre className="demo-txt">
      {lines.map((line, index) => (
        <span key={index} className={classes[index]}>
          {line}
          {'\n'}
        </span>
      ))}
    </pre>
  )
}

export default TxtView
