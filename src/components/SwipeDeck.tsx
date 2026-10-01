import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from 'react'

export type SwipeDir = 'like' | 'pass'
export interface SwipeDeckHandle {
  swipe: (dir: SwipeDir) => void
}

interface Props<T extends { id: string }> {
  items: T[]
  renderCard: (item: T) => ReactNode
  onSwipe: (item: T, dir: SwipeDir) => void
  onOpen?: (item: T) => void
}

const THRESHOLD = 110
const VELOCITY = 500

interface TopProps {
  children: ReactNode
  onDecide: (dir: SwipeDir) => void
  onOpen?: () => void
  register: (fn: (dir: SwipeDir) => void) => void
}

function TopCard({ children, onDecide, onOpen, register }: TopProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-260, 0, 260], [-12, 0, 12])
  const likeOpacity = useTransform(x, [15, 110], [0, 1])
  const passOpacity = useTransform(x, [-110, -15], [1, 0])
  const busy = useRef(false)

  const fly = async (dir: SwipeDir) => {
    if (busy.current) return
    busy.current = true
    await animate(x, dir === 'like' ? 640 : -640, { duration: 0.28, ease: 'easeOut' })
    onDecide(dir)
  }

  useEffect(() => {
    register(fly)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEnd = (_: PointerEvent, info: PanInfo) => {
    if (busy.current) return
    if (info.offset.x > THRESHOLD || info.velocity.x > VELOCITY) fly('like')
    else if (info.offset.x < -THRESHOLD || info.velocity.x < -VELOCITY) fly('pass')
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
      style={{ x, rotate, touchAction: 'pan-y' }}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.85}
      dragMomentum={false}
      onDragEnd={handleEnd}
      onTap={() => onOpen?.()}
      whileDrag={{ scale: 1.02 }}
    >
      {children}
      <motion.div
        className="absolute top-6 left-6 px-4 py-1.5 rounded-xl border-[3px] font-extrabold tracking-widest text-xl -rotate-12 pointer-events-none"
        style={{ opacity: likeOpacity, color: 'var(--c-good)', borderColor: 'var(--c-good)', background: 'color-mix(in srgb, var(--c-surface) 85%, transparent)' }}
      >
        LIKE
      </motion.div>
      <motion.div
        className="absolute top-6 right-6 px-4 py-1.5 rounded-xl border-[3px] font-extrabold tracking-widest text-xl rotate-12 pointer-events-none"
        style={{ opacity: passOpacity, color: 'var(--c-bad)', borderColor: 'var(--c-bad)', background: 'color-mix(in srgb, var(--c-surface) 85%, transparent)' }}
      >
        PASS
      </motion.div>
    </motion.div>
  )
}

function SwipeDeckInner<T extends { id: string }>({ items, renderCard, onSwipe, onOpen }: Props<T>, ref: React.ForwardedRef<SwipeDeckHandle>) {
  const flyRef = useRef<(d: SwipeDir) => void>(() => {})
  const top = items[0]
  const next = items[1]
  const third = items[2]

  useImperativeHandle(ref, () => ({ swipe: (d) => flyRef.current(d) }), [])

  // Стрелки на клавиатуре (desktop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return
      if (e.key === 'ArrowRight') flyRef.current('like')
      if (e.key === 'ArrowLeft') flyRef.current('pass')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!top) return null
  return (
    <div className="relative w-full h-full">
      {third && (
        <div className="absolute inset-0 pointer-events-none" style={{ transform: 'scale(0.9) translateY(26px)', opacity: 0.5 }}>
          {renderCard(third)}
        </div>
      )}
      {next && (
        <div className="absolute inset-0 pointer-events-none" style={{ transform: 'scale(0.95) translateY(13px)', opacity: 0.8 }}>
          {renderCard(next)}
        </div>
      )}
      <TopCard
        key={top.id}
        register={(fn) => (flyRef.current = fn)}
        onDecide={(dir) => onSwipe(top, dir)}
        onOpen={onOpen ? () => onOpen(top) : undefined}
      >
        {renderCard(top)}
      </TopCard>
    </div>
  )
}

export const SwipeDeck = forwardRef(SwipeDeckInner) as <T extends { id: string }>(
  p: Props<T> & { ref?: React.Ref<SwipeDeckHandle> },
) => ReturnType<typeof SwipeDeckInner>
