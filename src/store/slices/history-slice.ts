import type { StateCreator } from "zustand"
import type { HistoryState } from "@/types"
import { HistoryAPI } from "@/services/api/history"

export interface HistorySlice extends HistoryState {
  fetchHistory: () => Promise<void>
  refreshHistory: () => Promise<void>
  getTotalSpent: () => Promise<number>
}

export const createHistorySlice: StateCreator<HistorySlice> = (set, get) => ({
  history: [],
  isLoading: false,
  error: null,

  fetchHistory: async () => {
    if (get().isLoading) return

    set({ isLoading: true, error: null })

    try {
      console.log("Starting to fetch history...")
      const history = await HistoryAPI.getHistory()
      console.log("History fetched successfully:", history.length, "items")
      set({ history, isLoading: false })
    } catch (error) {
      console.error("Error in fetchHistory:", error)
      set({
        error: error instanceof Error ? error.message : "Failed to fetch history",
        isLoading: false,
      })
    }
  },

  refreshHistory: async () => {
    set({ history: [], isLoading: true, error: null })

    try {
      const history = await HistoryAPI.getHistory()
      set({ history, isLoading: false })
    } catch (error) {
      console.error("Error in refreshHistory:", error)
      set({
        error: error instanceof Error ? error.message : "Failed to refresh history",
        isLoading: false,
      })
    }
  },

  getTotalSpent: async () => {
    try {
      return await HistoryAPI.getTotalSpent()
    } catch (error) {
      console.error("Failed to calculate total spent:", error)
      return 0
    }
  },
})
