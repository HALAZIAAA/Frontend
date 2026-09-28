import { useRef, useState } from 'react'
import { uploadPostImage } from '../../api/communityApi'
import type { PostImage } from '../../types/community'

const MAX_IMAGES = 5

type ImageAttacherProps = {
  images: PostImage[]
  onChange: (images: PostImage[]) => void
}

function ImageAttacher({ images, onChange }: ImageAttacherProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(event.target.files ?? [])
    // 같은 파일을 다시 고를 수 있게 input을 비워둔다.
    event.target.value = ''
    if (files.length === 0) return

    if (images.length + files.length > MAX_IMAGES) {
      setError(`이미지는 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`)
      return
    }

    setError('')
    setUploading(true)

    const uploaded: PostImage[] = []
    try {
      for (const file of files) {
        uploaded.push(await uploadPostImage(file))
      }
      onChange([...images, ...uploaded])
    } catch (err) {
      // 일부라도 올라간 건 살려둔다.
      if (uploaded.length > 0) onChange([...images, ...uploaded])
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (imageId: number) => {
    onChange(images.filter((image) => image.id !== imageId))
  }

  return (
    <div className="form-field">
      <label className="form-label">이미지 첨부</label>
      <p className="image-attacher-hint">
        jpg, png, gif, webp / 장당 5MB / 최대 {MAX_IMAGES}장 · 본문 아래에 표시됩니다.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        className="image-attacher-input"
        onChange={handleSelect}
        aria-label="이미지 선택"
      />

      <button
        type="button"
        className="image-attacher-button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || images.length >= MAX_IMAGES}
      >
        {uploading ? '올리는 중...' : `이미지 선택 (${images.length}/${MAX_IMAGES})`}
      </button>

      {error && <p className="image-attacher-error">{error}</p>}

      {images.length > 0 && (
        <ul className="image-attacher-list">
          {images.map((image) => (
            <li key={image.id} className="image-attacher-item">
              <img src={image.url} alt="첨부 이미지 미리보기" />
              <button
                type="button"
                className="image-attacher-remove"
                onClick={() => handleRemove(image.id)}
                aria-label="이미지 제거"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ImageAttacher
