import { API_ENDPOINTS } from "@/lib/constants"
import type { HistoryItem, ApiResponse } from "@/types"

export class HistoryAPI {
  static async getHistory(): Promise<HistoryItem[]> {
    try {
      console.log("🚀 Fetching history from:", API_ENDPOINTS.HISTORY)
      let response = await fetch(API_ENDPOINTS.HISTORY)

      console.log("📡 History response:")
      console.log("- Status:", response.status)
      console.log("- OK:", response.ok)

      if (!response.ok) {
        console.log("🔄 Trying no_history endpoint...")
        response = await fetch(API_ENDPOINTS.NO_HISTORY)
        console.log("- No History Status:", response.status)
        console.log("- No History OK:", response.ok)
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      console.log("📄 History raw response (first 200 chars):", text.substring(0, 200))

      let data: ApiResponse<HistoryItem[]>
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("❌ History JSON Parse Error:", parseError)
        throw new Error("Invalid JSON response from history API")
      }

      console.log("✅ History parsed data:", data)

      if (!data.ok) {
        throw new Error(data.error || "History API returned error")
      }

      console.log("🎉 Successfully fetched", data.data?.length || 0, "history items")
      return data.data || []
    } catch (error) {
      console.error("💥 History API Error:", error)
      console.log("📦 Using fallback history data")
      return this.getFallbackHistory()
    }
  }

  static getFallbackHistory(): HistoryItem[] {
    console.log("📦 Loading fallback history...")
    return [
      {
        timestamp: 1743132821,
        id: 1,
        total: 42282,
        currency: "NOT",
      },
      {
        timestamp: 1745627409,
        id: 3,
        total: 37050,
        currency: "NOT",
      },
      {
        timestamp: 1737113822,
        id: 4,
        total: 30419,
        currency: "NOT",
      },
      {
        timestamp: 1745561520,
        id: 3,
        total: 26149,
        currency: "NOT",
      },
      {
        timestamp: 1736899580,
        id: 6,
        total: 39110,
        currency: "NOT",
      },
    ]
  }

  static async getHistoryByDateRange(startDate: Date, endDate: Date): Promise<HistoryItem[]> {
    const history = await this.getHistory()

    const startTimestamp = Math.floor(startDate.getTime() / 1000)
    const endTimestamp = Math.floor(endDate.getTime() / 1000)

    return history.filter((item) => item.timestamp >= startTimestamp && item.timestamp <= endTimestamp)
  }

  static async getTotalSpent(): Promise<number> {
    const history = await this.getHistory()
    return history.reduce((total, item) => total + item.total, 0)
  }
}
