import posthog from 'posthog-js'

// PostHog configuration
export const initPostHog = () => {
  // Only initialize PostHog in production or when explicitly enabled
  const isProduction = import.meta.env.MODE === 'production'
  const enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  
  if (isProduction || enableAnalytics) {
    posthog.init(
      import.meta.env.VITE_POSTHOG_KEY,
      {
        api_host: import.meta.env.VITE_POSTHOG_HOST,
        // Disable in development unless explicitly enabled
        loaded: (posthog) => {
          if (import.meta.env.MODE === 'development') {
            posthog.debug()
          }
        },
        // Privacy settings
        capture_pageview: true,
        capture_pageleave: true,
        // Respect user's privacy preferences
        respect_dnt: true,
        // Session recording settings (optional)
        disable_session_recording: false,
        // Other useful options
        autocapture: true,
        cross_subdomain_cookie: false
      }
    )

    // Identify user if you have user information
    // posthog.identify('user_id', { email: 'user@example.com' })
    
    console.log('PostHog initialized')
  } else {
    console.log('PostHog disabled in development mode')
  }
}

// Utility functions for tracking events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof posthog !== 'undefined' && posthog.__loaded) {
    posthog.capture(eventName, properties)
  }
}

export const trackPageView = (pageName?: string) => {
  if (typeof posthog !== 'undefined' && posthog.__loaded) {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      page_name: pageName
    })
  }
}

export const trackCommandUsage = (command: string, success: boolean = true) => {
  trackEvent('terminal_command_used', {
    command,
    success,
    timestamp: new Date().toISOString()
  })
}

export const trackButtonClick = (buttonType: 'close' | 'minimize' | 'maximize') => {
  trackEvent('terminal_button_clicked', {
    button_type: buttonType,
    timestamp: new Date().toISOString()
  })
}

export const trackTerminalSession = (action: 'start' | 'restart') => {
  trackEvent('terminal_session', {
    action,
    timestamp: new Date().toISOString()
  })
}

// Export posthog instance for direct use if needed
export { posthog }
