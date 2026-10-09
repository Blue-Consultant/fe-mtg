'use client'

import { useEffect, useState } from 'react'

import { createPortal } from 'react-dom'

import { createManualReservation, lookupClientByDni, notifyFailed, notifySaved } from './admin-api'
import styles from './admin-board.module.css'
import { formatLongDate, minutesToTime } from './schedule-model'

const MAX_BYTES = 5 * 1024 * 1024

function endLabel(end) {
  return end >= 24 * 60 ? '24:00' : minutesToTime(end)
}

function clientName(cliente) {
  return [cliente?.first_name, cliente?.last_name].filter(Boolean).join(' ').trim()
}

export default function WalkInForm({ courtId, date, range, onSaved, onCancel }) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState('dni')
  const [dni, setDni] = useState('')
  const [known, setKnown] = useState(null)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [total, setTotal] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [fileError, setFileError] = useState('')
  const [saving, setSaving] = useState(false)
  const when = `${formatLongDate(date)} · ${minutesToTime(range.start)}–${endLabel(range.end)}`

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!file) {
      setPreview('')

      return undefined
    }

    const url = URL.createObjectURL(file)

    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape' && !saving) onCancel()
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel, saving])

  const pickFile = event => {
    const next = event.target.files?.[0] || null

    event.target.value = ''

    if (!next) return

    if (!next.type.startsWith('image/')) {
      setFile(null)
      setFileError('El comprobante tiene que ser una imagen.')

      return
    }

    if (next.size > MAX_BYTES) {
      setFile(null)
      setFileError('La imagen pesa más de 5 MB.')

      return
    }

    setFileError('')
    setFile(next)
  }

  const searchDni = async event => {
    event.preventDefault()
    if (saving) return

    const clean = dni.replace(/\D/g, '')

    if (!/^\d{8}$/.test(clean)) {
      notifyFailed(null, 'El DNI debe tener 8 dígitos.')

      return
    }

    setSaving(true)

    try {
      const data = await lookupClientByDni(clean)

      setDni(clean)

      if (data?.found && data.cliente) {
        setKnown(data.cliente)
        setNombre(clientName(data.cliente) || 'Cliente')
        setTelefono(data.cliente.phone_number || '')
        setEmail(data.cliente.email || '')
      } else {
        setKnown(null)
        setNombre('')
        setTelefono('')
        setEmail('')
      }

      setStep('datos')
    } catch (error) {
      notifyFailed(error, 'No se pudo buscar el DNI.')
    } finally {
      setSaving(false)
    }
  }

  const submit = async event => {
    event.preventDefault()
    if (saving) return

    setSaving(true)

    try {
      await createManualReservation(
        {
          courtId: String(courtId),
          fecha: date,
          hora_inicio: minutesToTime(range.start),
          hora_fin: endLabel(range.end),
          dni,
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          email: known ? '' : email.trim(),
          total: Number(String(total).replace(',', '.'))
        },
        file
      )
      notifySaved(
        known
          ? 'Quedó por confirmar. En Reservas, confirma el pago para que la hora pase a reservada.'
          : 'Se creó la cuenta y la reserva quedó por confirmar. Confirma el pago en Reservas.'
      )
      onSaved()
    } catch (error) {
      notifyFailed(error, 'No se pudo registrar la reserva.')
    } finally {
      setSaving(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div className={styles.modalBackdrop} role='presentation' onClick={() => !saving && onCancel()}>
      <div
        className={styles.modal}
        role='dialog'
        aria-modal='true'
        aria-labelledby='registrar-reserva'
        onClick={event => event.stopPropagation()}
      >
        <h2 id='registrar-reserva'>Registrar reserva</h2>
        <p className={styles.walkWhen}>{when}</p>
        {step === 'dni' ? (
          <form className={styles.walkForm} onSubmit={searchDni}>
            <label>
              DNI
              <input
                value={dni}
                inputMode='numeric'
                maxLength={8}
                required
                autoFocus
                onChange={event => setDni(event.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder='8 dígitos'
              />
            </label>
            <p className={styles.walkNote}>Si ya tiene cuenta, se cargan sus datos. Si no, se crea.</p>
            <div className={styles.walkActions}>
              <button type='submit' className={styles.markDay} disabled={saving}>
                {saving ? 'Buscando…' : 'Continuar'}
              </button>
              <button type='button' className={styles.walkCancel} disabled={saving} onClick={onCancel}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <form className={styles.walkForm} onSubmit={submit}>
            <p className={styles.walkWhen}>DNI {dni}</p>
            {known ? (
              <div className={styles.known}>
                <strong>{clientName(known) || 'Cliente'}</strong>
                <span>{known.phone_number || 'Sin teléfono'}</span>
                <span>{known.email}</span>
              </div>
            ) : (
              <>
                <p className={styles.walkNote}>No tiene cuenta. Completa sus datos para crearla.</p>
                <label>
                  Nombre
                  <input value={nombre} maxLength={80} required onChange={event => setNombre(event.target.value)} placeholder='Nombre y apellido' />
                </label>
                <label>
                  Teléfono
                  <input value={telefono} inputMode='numeric' maxLength={15} required onChange={event => setTelefono(event.target.value)} placeholder='9 dígitos' />
                </label>
                <label>
                  Correo
                  <input value={email} type='email' required onChange={event => setEmail(event.target.value)} placeholder='Para entrar a su cuenta' />
                </label>
              </>
            )}
            <label>
              Monto cobrado
              <input value={total} inputMode='decimal' required onChange={event => setTotal(event.target.value)} placeholder='S/' />
            </label>
            <div className={styles.receipt}>
              <span>Comprobante</span>
              <label className={styles.receiptPick}>
                <input type='file' accept='image/jpeg,image/png,image/webp,image/heic,image/heif' onChange={pickFile} />
                {file ? 'Cambiar imagen' : 'Subir imagen'}
              </label>
              <small>Opcional. JPG, PNG o WEBP, hasta 5 MB.</small>
              {fileError ? <p className={styles.receiptError}>{fileError}</p> : null}
              {preview ? (
                <button type='button' className={styles.receiptPreview} onClick={() => setFile(null)}>
                  <img src={preview} alt='Comprobante elegido' />
                  <span>Quitar imagen</span>
                </button>
              ) : null}
            </div>
            <p className={styles.walkNote}>La hora se aparta si está libre. Pasa a reservada cuando confirmes el pago en Reservas.</p>
            <div className={styles.walkActions}>
              <button type='submit' className={styles.markDay} disabled={saving}>
                {saving ? 'Registrando…' : 'Registrar reserva'}
              </button>
              <button
                type='button'
                className={styles.walkCancel}
                disabled={saving}
                onClick={() => {
                  setStep('dni')
                  setKnown(null)
                }}
              >
                Cambiar DNI
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}
