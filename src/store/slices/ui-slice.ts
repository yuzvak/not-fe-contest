import type { StateCreator } from "zustand"
import type { UIState, Notification } from "@/types"

export interface UISlice extends UIState {
  setTheme: (theme: "light" | "dark") => void
  toggleTheme: () => void
  setSearchOpen: (open: boolean) => void
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const createUISlice: StateCreator<UISlice> = (set, get) => ({
  theme: "dark",
  isSearchOpen: false,
  notifications: [],

  setTheme: (theme) => {
    set({ theme })
    document.documentElement.classList.toggle("dark", theme === "dark")
  },

  toggleTheme: () => {
    const { theme } = get()
    const newTheme = theme === "light" ? "dark" : "light"
    get().setTheme(newTheme)
  },

  setSearchOpen: (open) => set({ isSearchOpen: open }),

  addNotification: (notification) => {
    const { notifications } = get()
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
    }
    set({ notifications: [...notifications, newNotification] })

    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(newNotification.id)
      }, notification.duration || 3000)
    }
  },

  removeNotification: (id) => {
    const { notifications } = get()
    set({ notifications: notifications.filter((n) => n.id !== id) })
  },

  clearNotifications: () => set({ notifications: [] }),
})
