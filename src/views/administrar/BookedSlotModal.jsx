'use client'

import { useEffect, useState } from 'react'

import { createPortal } from 'react-dom'

import { loadBookedSlot } from './admin-api'
import styles from './admin-board.module.css'
import { formatLongDate } from './schedule-model'

const RESERVA = {
  confirmada: 'Confirmada',
  validando: 'Por confirmar',
  pendiente: 'Pago pendiente',
  cancelada: 'Cancelada'
}

const PAGO = {
  confirmada: 'Confirmado',
  pendiente: 'Pendiente',
  cancelada: 'Cancelado'
}

function endLabel(start, end) {
  if ((end === '00:00' || end === '24:00') && start && start !== '00:00') return '24:00'

  return end
}

function money(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`
}

export default function BookedSlotModal({ courtId, date, hora, onClose }) {
  const [mounted, setMounted] = useState(false)
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    setDetail(null)
    setError('')
    loadBookedSlot(courtId, date, hora)
      .then(data => {
        if (!cancelled) setDetail(data)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar la reserva de esa hora.')
      })

    return () => {
      cancelled = true
    }
  }, [courtId, date, hora])

  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!mounted) return null

  const cliente = detail?.cliente
  const pago = detail?.pago
  const when = detail
    ? `${formatLongDate(detail.fecha)} · ${detail.hora_inicio}–${endLabel(detail.hora_inicio, detail.hora_fin)}`
    : ''

  return createPortal(
    <div className={styles.modalBackdrop} role='presentation' onClick={onClose}>
      <div
        className={styles.modal}
        role='dialog'
        aria-modal='true'
        aria-labelledby='reserva-hora'
        onClick={event => event.stopPropagation()}
      >
        <h2 id='reserva-hora'>Reserva de esta hora</h2>
        {!detail && !error ? <p className={styles.walkNote}>Cargando…</p> : null}
        {error ? <p className={styles.receiptError}>{error}</p> : null}
        {detail ? (
          <dl className={styles.detailList}>
            <div>
              <dt>Quién reservó</dt>
              <dd>{cliente?.nombre || 'Cliente'}</dd>
            </div>
            {cliente?.dni ? (
              <div>
                <dt>DNI</dt>
                <dd>{cliente.dni}</dd>
              </div>
            ) : null}
            {cliente?.telefono ? (
              <div>
                <dt>Teléfono</dt>
                <dd>
                  <a href={`tel:${cliente.telefono}`}>{cliente.telefono}</a>
                </dd>
              </div>
            ) : null}
            {cliente?.email ? (
              <div>
                <dt>Correo</dt>
                <dd>{cliente.email}</dd>
              </div>
            ) : null}
            <div>
              <dt>Horario</dt>
              <dd>{when}</dd>
            </div>
            <div>
              <dt>Monto</dt>
              <dd>{money(detail.total)}</dd>
            </div>
            <div>
              <dt>Reserva</dt>
              <dd>{RESERVA[(detail.estado_reserva || '').toLowerCase()] || detail.estado_reserva || '—'}</dd>
            </div>
            <div>
              <dt>Pago</dt>
              <dd>
                {pago ? PAGO[(pago.estado || '').toLowerCase()] || pago.estado : 'Sin pago'}
                {detail.origen === 'manual' || pago?.metodo_pago === 'En cancha'
                  ? ' · En cancha'
                  : pago?.metodo_pago
                    ? ` · ${pago.metodo_pago}`
                    : ''}
              </dd>
            </div>
          </dl>
        ) : null}
        {pago?.comprobante_url ? <img className={styles.detailShot} src={pago.comprobante_url} alt='Comprobante de la reserva' /> : null}
        <div className={styles.walkActions}>
          <button type='button' className={styles.walkCancel} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
