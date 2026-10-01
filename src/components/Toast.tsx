import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

const ToastCtx = createContext<(msg: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null)
  const show = useCallback((m: string) => {
    setMsg(m)
    window.setTimeout(() => setMsg((cur) => (cur === m ? null : cur)), 2200)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[100] px-4 py-2.5 rounded-full bg-ink text-bg text-sm font-medium shadow-card max-w-[90vw]" role="status">
          {msg}
        </div>
      )}
    </ToastCtx.Provider>
  )
}
