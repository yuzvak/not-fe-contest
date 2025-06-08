declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        enableClosingConfirmation: () => void
        disableClosingConfirmation: () => void
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        colorScheme: "light" | "dark"
        themeParams: {
          accent_text_color?: string
          bg_color?: string
          button_color?: string
          button_text_color?: string
          bottom_bar_bg_color?: string
          destructive_text_color?: string
          header_bg_color?: string
          hint_color?: string
          link_color?: string
          secondary_bg_color?: string
          section_bg_color?: string
          section_header_text_color?: string
          subtitle_text_color?: string
          text_color?: string
        }
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
            photo_url?: string
          }
          chat_type?: string
          auth_date?: number
          hash?: string
        }
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          isProgressVisible: boolean
          setText: (text: string) => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
          showProgress: (leaveActive?: boolean) => void
          hideProgress: () => void
          setParams: (params: {
            text?: string
            color?: string
            text_color?: string
            is_active?: boolean
            is_visible?: boolean
          }) => void
        }
        BackButton: {
          isVisible: boolean
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
        }
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void
          notificationOccurred: (type: "error" | "success" | "warning") => void
          selectionChanged: () => void
        }
        onEvent: (eventType: string, eventHandler: (data?: any) => void) => void
        offEvent: (eventType: string, eventHandler: (data?: any) => void) => void
        sendData: (data: string) => void
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void
        openTelegramLink: (url: string) => void
        showPopup: (
          params: {
            title?: string
            message: string
            buttons?: Array<{
              id?: string
              type?: "default" | "ok" | "close" | "cancel" | "destructive"
              text?: string
            }>
          },
          callback?: (buttonId: string) => void,
        ) => void
        showAlert: (message: string, callback?: () => void) => void
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
        showScanQrPopup: (
          params: {
            text?: string
          },
          callback?: (text: string) => boolean,
        ) => void
        closeScanQrPopup: () => void
        requestTheme?: () => void
        setHeaderColor?: (color: string) => void
        setBackgroundColor?: (color: string) => void
        shareMessage?: (msgId: string, callback?: (success: boolean) => void) => void
      }
    }
  }
}

export {}
