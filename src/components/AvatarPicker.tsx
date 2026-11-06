import { Camera, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { imageToAvatar } from '../utils/image'
import { Avatar, CompanyLogo } from './ui'
import { useToast } from './Toast'

interface Props {
  name: string
  value?: string
  onChange: (dataUrl: string | undefined) => void
  /** для компании — квадратный логотип с цветом */
  logoColor?: string
  label?: string
}

/** Выбор аватарки/логотипа: нажмите на картинку, выберите фото — оно обрежется и сожмётся. */
export function AvatarPicker({ name, value, onChange, logoColor, label = 'Фото профиля' }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const pick = async (file?: File) => {
    if (!file) return
    try {
      onChange(await imageToAvatar(file))
    } catch (e) {
      toast((e as Error).message)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={() => input.current?.click()} className="relative shrink-0 active:scale-95 transition" aria-label={`${label}: выбрать файл`}>
        {logoColor ? <CompanyLogo name={name || '·'} color={logoColor} size={84} src={value} /> : <Avatar name={name || '·'} src={value} size={84} ring />}
        <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full btn-primary text-accent-ink border-2 border-surface flex items-center justify-center">
          <Camera size={15} />
        </span>
      </button>
      <div className="min-w-0">
        <div className="font-semibold text-[15px]">{label}</div>
        <div className="text-xs text-hint mb-2">JPG или PNG. Фото обрежется до квадрата.</div>
        <div className="flex gap-2">
          <button type="button" onClick={() => input.current?.click()} className="h-9 px-3 rounded-xl bg-accent-soft text-accent text-sm font-semibold">
            {value ? 'Заменить' : 'Загрузить'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange(undefined)} aria-label="Удалить фото" className="h-9 w-9 rounded-xl border border-line text-hint flex items-center justify-center">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
