import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  message: string
  variant?: "default" | "destructive" | "success"
  duration?: number
  onClose?: () => void
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = "default",
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onClose?.()
      }, 300) // Aguarda a animação de saída
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={cn(
        "relative min-w-[300px] max-w-md rounded-lg border p-4 shadow-lg transition-all duration-300",
        {
          "bg-white border-gray-200 text-gray-900": variant === "default",
          "bg-red-50 border-red-200 text-red-800": variant === "destructive",
          "bg-green-50 border-green-200 text-green-800": variant === "success",
        },
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose?.(), 300)
          }}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Hook para gerenciar toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>([])

  const showToast = (toast: Omit<ToastProps, "onClose">) => {
    const id = Math.random().toString(36).substring(7)
    console.log('showToast chamado:', { message: toast.message, variant: toast.variant, id })
    setToasts((prev) => {
      const newToasts = [...prev, { ...toast, id }]
      console.log('Toasts atualizados:', newToasts.length)
      return newToasts
    })
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            variant={toast.variant}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )

  return { showToast, ToastContainer }
}

