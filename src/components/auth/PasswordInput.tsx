import { useState, type ChangeEvent } from 'react'
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react'

type PasswordInputProps = {
  id: string
  name: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  autoComplete: 'current-password' | 'new-password'
  invalid?: boolean
  describedBy?: string
  // 버튼 이름에 들어갈 칸 이름. 예: '비밀번호', '비밀번호 확인'
  label: string
}

// 비밀번호 입력칸 + '보기' 버튼. 입력한 글자를 확인할 수 있어야 저시력·운동 장애 사용자의 오타가 줄어든다.
function PasswordInput({ id, name, value, onChange, autoComplete, invalid, describedBy, label }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-field">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        className="auth-input"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      />
      {/* 눌린 상태(aria-pressed)로 지금 보이는지 숨겨졌는지 알린다. 이름은 바뀌지 않는다. */}
      <button
        type="button"
        className="password-toggle"
        aria-pressed={visible}
        aria-controls={id}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? <EyeSlashIcon aria-hidden="true" size={20} /> : <EyeIcon aria-hidden="true" size={20} />}
        <span className="sr-only">{label} 보기</span>
      </button>
    </div>
  )
}

export default PasswordInput
