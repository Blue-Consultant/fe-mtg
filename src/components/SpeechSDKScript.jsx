'use client'

import Script from 'next/script'

/**
 * Componente para cargar el SDK de Azure Speech en el layout
 * Se carga antes de que la página sea interactiva para evitar problemas de CORS
 */
export const SpeechSDKScript = () => {
  // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- necesario para Azure Speech SDK
  return <Script src='https://aka.ms/csspeech/jsbrowserpackageraw' strategy='beforeInteractive' />
}
