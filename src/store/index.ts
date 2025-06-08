import { create } from "zustand"
import { persist, devtools } from "zustand/middleware"
import { createProductSlice, type ProductSlice } from "./slices/product-slice"
import { createCartSlice, type CartSlice } from "./slices/cart-slice"
import { createHistorySlice, type HistorySlice } from "./slices/history-slice"
import { createUISlice, type UISlice } from "./slices/ui-slice"

type StoreState = ProductSlice & CartSlice & HistorySlice & UISlice

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createProductSlice(...a),
        ...createCartSlice(...a),
        ...createHistorySlice(...a),
        ...createUISlice(...a),
      }),
      {
        name: "not-store-storage",
        partialize: (state) => ({
          items: state.items,
          total: state.total,
          theme: state.theme,
        }),
      },
    ),
    { name: "not-store" },
  ),
)
