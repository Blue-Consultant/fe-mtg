'use client'

// React
import { createContext, useEffect, useMemo, useState } from 'react'

// Redux
import { useSelector } from 'react-redux'

// Config Imports
import themeConfig from '@configs/themeConfig'
import primaryColorConfig from '@configs/primaryColorConfig'

// Hook Imports
import { useObjectCookie } from '@core/hooks/useObjectCookie'

// Initial Settings Context
export const SettingsContext = createContext(null)

// Fetch to api
import { getUserSettings } from '../components/customizer/ApiCustomizer'

// Settings Provider
export const SettingsProvider = props => {
  const userData = useSelector(state => state.loginReducer.user)

  // Initial Settings
  const initialSettings = {
    mode: themeConfig.mode,
    skin: themeConfig.skin,
    semiDark: themeConfig.semiDark,
    layout: themeConfig.layout,
    navbarContentWidth: themeConfig.navbar.contentWidth,
    contentWidth: themeConfig.contentWidth,
    footerContentWidth: themeConfig.footer.contentWidth,
    primaryColor: primaryColorConfig[0].main
  }

  const updatedInitialSettings = {
    ...initialSettings,
    mode: props.mode || themeConfig.mode
  }

  // Cookies
  const [settingsCookie, updateSettingsCookie] = useObjectCookie(
    themeConfig.settingsCookieName,
    JSON.stringify(props.settingsCookie) !== '{}' ? props.settingsCookie : updatedInitialSettings
  )

  // State
  const [_settingsState, _updateSettingsState] = useState(updatedInitialSettings)
  // JSON.stringify(settingsCookie) !== '{}' ? settingsCookie :
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  const updateSettings = (settings, options) => {
    // const { updateCookie = true } = options || {}
    _updateSettingsState(prev => {
      const newSettings = { ...prev, ...settings }
      // if (updateCookie) updateSettingsCookie(newSettings)
      return newSettings
    })
  }

  /**
   * Updates the settings for page with the provided settings object.
   * Updated settings won't be saved to cookie hence will be reverted once navigating away from the page.
   *
   * @param settings - The partial settings object containing the properties to update.
   * @returns A function to reset the page settings.
   *
   * @example
   * useEffect(() => {
   *     return updatePageSettings({ theme: 'dark' });
   * }, []);
   */
  const updatePageSettings = settings => {
    updateSettings(settings, { updateCookie: false })

    // Returns a function to reset the page settings
    return () => updateSettings(settingsCookie, { updateCookie: false })
  }

  const resetSettings = () => {
    updateSettings(initialSettings)
  }

  const isSettingsChanged = useMemo(
    () => JSON.stringify(initialSettings) !== JSON.stringify(_settingsState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [_settingsState]
  )

  const mapUserSettings = apiSettings => ({
    mode: apiSettings?.theme_mode || themeConfig.mode,
    skin: apiSettings?.theme_skin || themeConfig.skin,
    semiDark: apiSettings?.theme_semi_dark || themeConfig.semiDark,
    layout: apiSettings?.layout || themeConfig.layout,
    navbarContentWidth: apiSettings?.layout_content || themeConfig.navbar.contentWidth,
    contentWidth: apiSettings?.layout_content || themeConfig.navbar.contentWidth,
    footerContentWidth: apiSettings?.layout_content || themeConfig.footer.contentWidth,
    primaryColor: apiSettings?.theme_primary_color || primaryColorConfig[0].main
  })

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const userSettings = await getUserSettings(userData.id)
        const parsedSettings = mapUserSettings(userSettings)

        updateSettings(parsedSettings)
      } catch (error) {
        console.error('Error fetching user settings:', error)
      }
    }

    if (userData?.id) fetchUserSettings()

    setIsLoadingSettings(false)
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        settings: _settingsState,
        updateSettings,
        isSettingsChanged,
        resetSettings,
        updatePageSettings
      }}
    >
      {isLoadingSettings ? <div></div> : props.children}
    </SettingsContext.Provider>
  )
}
