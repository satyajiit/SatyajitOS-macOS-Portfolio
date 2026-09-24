import { track } from '@/lib/analytics'

export type Platform = 'desktop' | 'ios'

/** Named events used across the app. All are no-ops unless analytics is configured. */
export function useAnalytics() {
  return {
    trackPageView: (pageName: string, pageTitle?: string) =>
      track('page_view', {
        page_title: pageTitle ?? pageName,
        page_location: window.location.href,
        page_path: window.location.pathname,
      }),
    trackEvent: (name: string, params?: Record<string, string | number | boolean>) =>
      track(name, params),
    trackAppOpen: (appName: string) => track('app_open', { app_name: appName }),
    trackAppClose: (appName: string, durationSeconds?: number) =>
      track('app_close', { app_name: appName, duration_seconds: durationSeconds }),
    trackFileAction: (action: string, fileType?: string, fileName?: string) =>
      track('file_action', { action, file_type: fileType, file_name: fileName }),
    // Only the command name, never its arguments.
    trackTerminalCommand: (command: string, platform: Platform) =>
      track('terminal_command', { command: command.split(' ')[0], platform }),
    trackPlatformSwitch: (from: string, to: string) =>
      track('platform_switch', { from_platform: from, to_platform: to }),
    trackPWAInstall: () => track('pwa_install'),
    trackEngagement: (action: string, value?: number) => track('engagement', { action, value }),
  }
}
