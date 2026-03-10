// Next Imports
import { headers } from 'next/headers'

import 'react-perfect-scrollbar/dist/css/styles.css'
import TranslationWrapper from '@/hocs/TranslationWrapper'
import { i18n } from '@configs/i18n'
import 'nprogress/nprogress.css'
import '@/app/globals.css'
import '@assets/iconify-icons/generated-icons.css'
import '@measured/puck/puck.css'
import 'animate.css'
import { SpeechSDKScript } from '@/components/SpeechSDKScript'

export const metadata = {
  title: 'MTG - Calendar App',
  description: 'Planner, Schedules, Calendar, Appointments'
}

const RootLayout = async ({ children, params }) => {
  const headersList = await headers()
  const direction = i18n.langDirection[params.lang]

  return (
    <TranslationWrapper headersList={headersList} lang={params.lang}>
      <html id='__next' lang={params.lang} dir={direction}>
        <body className='flex is-full min-bs-full flex-auto flex-col'>
          <SpeechSDKScript />
          {children}
        </body>
      </html>
    </TranslationWrapper>
  )
}

export default RootLayout
