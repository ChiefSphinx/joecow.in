type PostHogInstance = typeof import('posthog-js').default

let posthogInstance: PostHogInstance | null = null
let isLoading = false
let isInitialized = false

const initPostHog = async () => {
  if (isInitialized || isLoading) return
  isLoading = true

  const isProduction = import.meta.env.MODE === 'production'
  const enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'

  if (!isProduction && !enableAnalytics) {
    console.log('PostHog disabled in development mode')
    isLoading = false
    return
  }

  try {
    const posthog = await import('posthog-js')
    posthogInstance = posthog.default

    posthogInstance.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST,
      loaded: ph => {
        if (import.meta.env.MODE === 'development') {
          ph.debug()
        }
      },
      capture_pageview: true,
      capture_pageleave: true,
      respect_dnt: true,
      disable_session_recording: false,
      autocapture: true,
      cross_subdomain_cookie: false,
    })

    isInitialized = true
    console.log('PostHog initialized')
  } catch (error) {
    console.error('Failed to load PostHog:', error)
  } finally {
    isLoading = false
  }
}

const getPostHog = (): PostHogInstance | null => {
  return posthogInstance
}

const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (posthogInstance && isInitialized) {
    posthogInstance.capture(eventName, properties)
  }
}

const trackPageView = (pageName?: string) => {
  if (posthogInstance && isInitialized) {
    posthogInstance.capture('$pageview', {
      $current_url: window.location.href,
      page_name: pageName,
    })
  }
}

const trackCommandUsage = (command: string, success: boolean = true) => {
  trackEvent('terminal_command_used', {
    command,
    success,
    timestamp: new Date().toISOString(),
  })
}

const trackButtonClick = (buttonType: 'close' | 'minimize' | 'maximize') => {
  trackEvent('terminal_button_clicked', {
    button_type: buttonType,
    timestamp: new Date().toISOString(),
  })
}

const trackTerminalSession = (action: 'start' | 'restart') => {
  trackEvent('terminal_session', {
    action,
    timestamp: new Date().toISOString(),
  })
}

export {
  initPostHog,
  getPostHog,
  trackEvent,
  trackPageView,
  trackCommandUsage,
  trackButtonClick,
  trackTerminalSession,
}
