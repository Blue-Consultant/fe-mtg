'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { Button, Grid, Typography, Chip } from '@mui/material'

// Third-party Imports
import { OTPInput } from 'input-otp'
import classnames from 'classnames'

import Link from '@components/Link'
import { generateCodeOtp, verifyCodeOtp } from './ApiRegister'

// Component Imports
import Form from '@components/Form'
import ForgotPasswordCard from '../Login/components/ForgotPasswordCard'

// Style Imports
import styles from '@/libs/styles/inputOtp.module.css'

const Slot = props => {
  return (
    <div className={classnames(styles.slot, { [styles.slotActive]: props.isActive })}>
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  )
}

const FakeCaret = () => {
  return (
    <div className={styles.fakeCaret}>
      <div className='w-px h-5 bg-textPrimary' />
    </div>
  )
}

const VerifyAccount = ({
  mode,
  isForgotPassword,
  userdata,
  mailMessage,
  handleOutcomeAction,
  userRole,
  memoizedDictionary
}) => {
  const t = memoizedDictionary || {}
  const reg = t.modules?.register || {}

  // States
  const [otp, setOtp] = useState(null)
  const [loadingOtp, setLoadingOtp] = useState(false)

  const [error, setError] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [counterEnabled, setCounterEnabled] = useState(0)
  const [toggleCompVerified, settoggleCompVerified] = useState(false)
  const router = useRouter()

  const { lang: locale } = useParams()

  useEffect(() => {
    counterEnabled > 0 && setTimeout(() => setCounterEnabled(counterEnabled - 1), 1000)

    if (counterEnabled == 0) {
      setResendMessage('')
      setLoadingOtp(false)
    }
  }, [counterEnabled])

  useEffect(() => {
    resendOtpCode(event)
  }, [userdata])

  /*________________________________
  │   * METHOD VALIDATE CODE OTP    │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const handleSubmit = () => {
    if (!otp || otp.length !== 6) {
      setOtp('')
      setError(true)
    } else {
      setError(false)
      verifyOtpCode()
    }
  }

  /*______________________________
  │   * METHOD RESEND CODE OTP    │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const resendOtpCode = async event => {
    event.preventDefault()

    if (loadingOtp) return
    setLoadingOtp(true)

    try {
      if (counterEnabled > 0) return
      setOtp('')
      const response = await generateCodeOtp(userdata, mailMessage)

      if (response?.data) {
        const { expiresIn } = response.data

        setCounterEnabled(expiresIn || 30)
      } else {
        setCounterEnabled(30)
      }

      setResendMessage(reg.messages?.verifyEmail || 'Please check your email 📧')
      setLoadingOtp(false)
    } catch (e) {
      console.error(e)
    }
  }

  /*_____________________________
  │   * METHOD ACCOUNT VERIFY    │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const verifyOtpCode = async () => {
    try {
      const { data } = await verifyCodeOtp(userdata, otp)

      if (data !== '') {
        setError(false)
        setResendMessage('')
        setOtp('')
        settoggleCompVerified(true)
        handleOutcomeAction(
          userRole === 'HOLDER'
            ? { type: 'HOLDER_REGISTERED', role: 'HOLDER' }
            : { type: 'STUDENT_REGISTERED', role: 'STUDENT' }
        )
      } else {
        setOtp('')
        setResendMessage(reg.messages?.incorrectCode || 'Código de validación incorrecto.')
      }
    } catch (e) {
      console.error(e)
    }
  }

  /*_____________________________
  │   * METHOD ACCOUNT VERIFY    │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const directLogin = () => {
    const currentUrl = window.location

    if (currentUrl.pathname === `/${locale}/login`) {
      window.location.reload()
    } else {
      router.push(`/${locale}/login`)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        {!toggleCompVerified ? (
          <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
            <div className='flex flex-col gap-1'>
              <Typography className='text-center mb-4 mt-4' variant='h4'>
                {reg.messages?.verifyAccount || 'Verifica tu cuenta 🛡️'}
              </Typography>
              <Typography>
                {reg.messages?.sendedCodeMessage ||
                  'Te enviamos un código de verificación a tu correo electrónico. Ingresa el código en el campo de abajo..'}
              </Typography>
            </div>
            <Form noValidate autoComplete='off' className='flex flex-col gap-5'>
              <div className='flex flex-col gap-2'>
                <Typography>{reg.actions?.writeCode || 'Escriba su código de seguridad de 6 dígitos'}</Typography>
                <OTPInput
                  onChange={setOtp}
                  value={otp ?? ''}
                  maxLength={6}
                  containerClassName='group flex items-center'
                  render={({ slots }) => (
                    <div className='flex items-center justify-between w-full gap-4'>
                      {slots.slice(0, 6).map((slot, idx) => (
                        <Slot key={idx} {...slot} />
                      ))}
                    </div>
                  )}
                />
              </div>
              {error && (
                <div className='flex justify-center items-center'>
                  <Typography component={Link} color='error'>
                    {reg.actions?.writeOtpCode || 'Ingrese un código OTP válido de 6 dígitos'}
                  </Typography>
                </div>
              )}
              <Button fullWidth variant='contained' onClick={handleSubmit}>
                {reg.actions?.verify || 'Verificar'}
              </Button>

              <Grid item xs={12}>
                <Typography component='div' className='text-center mt-0' color='error'>
                  {resendMessage === 'Incorrect code validation.' ? (
                    <Chip label={reg.messages?.incorrectCode || resendMessage} color='error' variant='tonal' />
                  ) : resendMessage ? (
                    <Chip label={resendMessage} color='primary' variant='tonal' />
                  ) : (
                    ''
                  )}
                </Typography>
              </Grid>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>{reg.messages?.notReceiveCode || '¿No recibiste el código?'}</Typography>
                <Typography
                  color={counterEnabled == 0 ? 'primary' : 'error'}
                  component={Link}
                  onClick={e => resendOtpCode(e)}
                >
                  {reg.actions?.resend || 'Reenviar'}{' '}
                  {!resendMessage && counterEnabled >= 0 ? '' : `(${counterEnabled})`}
                </Typography>
              </div>
            </Form>
          </div>
        ) : isForgotPassword ? (
          <ForgotPasswordCard directLogin={directLogin} userEmail={userdata} />
        ) : // <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
        //   <div className='flex flex-col gap-1'>
        //     <Typography className='text-center mb-4' variant='h4'>
        //       Cuenta activada 🚀
        //     </Typography>
        //   </div>
        //   <Button fullWidth variant='contained' onClick={directLogin}>
        //     Inicia sesión
        //   </Button>
        // </div>
        null}
      </div>
    </div>
  )
}

export default VerifyAccount
