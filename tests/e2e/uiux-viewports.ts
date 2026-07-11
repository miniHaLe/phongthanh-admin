export interface UiuxViewport {
  name: string
  width: number
  height: number
}

export const UIUX_VIEWPORTS: UiuxViewport[] = [
  { name: 'phone-375', width: 375, height: 812 },
  { name: 'phone-480', width: 480, height: 854 },
  { name: 'landscape-854', width: 854, height: 480 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1366', width: 1366, height: 768 },
  { name: 'desktop-1536', width: 1536, height: 864 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-2560', width: 2560, height: 1440 },
  { name: 'desktop-4k', width: 3840, height: 2160 },
]

export const MOBILE_VIEWPORTS = UIUX_VIEWPORTS.filter((v) => v.width < 768)
export const DASHBOARD_VIEWPORTS = UIUX_VIEWPORTS.filter((v) => v.width >= 1366)
