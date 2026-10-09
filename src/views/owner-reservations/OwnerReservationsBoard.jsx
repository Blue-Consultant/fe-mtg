'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useLiveCourt } from '@/views/hoy/useLiveCourt'

import styles from './board.module.css'
import { useOwnerReservations } from './hooks/useOwnerReservations'

const TABS = [
  { id: 'por_aceptar', label: 'Por aceptar', title: 'Reservas pendientes de aceptar', empty: 'No tienes reservas por confirmar.' },
  { id: 'jugando', label: 'Jugando ahora', title: 'Jugando ahora', empty: 'Nadie está jugando en este momento.' },
  { id: 'reservadas', label: 'Próximas', title: 'Próximas', empty: 'No hay más reservas confirmadas para hoy.' },
  { id: 'terminaron', label: 'Finalizadas', title: 'Finalizadas', empty: 'Todavía no termina ninguna reserva de hoy.' }
]

function money(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`
}

function playerName(cliente) {
  return [cliente?.first_name, cliente?.last_name].filter(Boolean).join(' ').trim() || 'Jugador'
}

function phoneHref(phone) {
  const digits = String(phone || '').replace(/\D/g, '')

  if (!digits) return ''
  if (digits.startsWith('51')) return `tel:+${digits}`

  return `tel:+51${digits}`
}

function prettyPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  const local = digits.startsWith('51') ? digits.slice(2) : digits

  if (local.length !== 9) return phone || ''

  return `+51 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
}

function reservationDay(value) {
  const raw = String(value || '').slice(0, 10)
  const date = new Date(`${raw}T12:00:00`)

  if (!raw || Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function dayLabel(ymd, today) {
  if (!ymd) return ''
  if (String(ymd).slice(0, 10) === today) return 'Hoy'

  return reservationDay(ymd) || ymd
}

function endLabel(start, end) {
  if (end === '00:00' && start && start !== '00:00') return '24:00'

  return end
}

function reservaLabel(value) {
  const name = String(value || '').toLowerCase()

  if (name === 'validando') return 'Por aceptar'
  if (name === 'confirmada') return 'Confirmada'
  if (name === 'pendiente') return 'Pendiente'
  if (name === 'cancelada') return 'Cancelada'

  return value || '—'
}

function pagoLabel(value) {
  const name = String(value || '').toLowerCase()

  if (name === 'confirmada') return 'Confirmado'
  if (name === 'pendiente') return 'Pendiente'
  if (name === 'cancelada') return 'Cancelado'

  return value || '—'
}

function chipClass(value) {
  const name = String(value || '').toLowerCase()

  if (name === 'confirmada') return styles.chipOk
  if (name === 'pendiente' || name === 'validando') return styles.chipWait

  return styles.chipOff
}

function isManual(item) {
  return item?.origen === 'manual' || item?.pago?.metodo_pago === 'En cancha' || item?.pagos?.[0]?.metodo_pago === 'En cancha'
}

function Actions({ busy, onAccept, onReject, manual }) {
  const [confirmReject, setConfirmReject] = useState(false)

  if (confirmReject) {
    return (
      <div className={styles.actions}>
        <p>{manual ? 'Si no confirmas el pago, esa hora queda libre.' : 'Si lo rechazas, esa hora queda libre.'}</p>
        <button type='button' className={styles.reject} disabled={busy} onClick={onReject}>
          {manual ? 'Sí, no confirmar' : 'Sí, rechazar'}
        </button>
        <button type='button' className={styles.quiet} disabled={busy} onClick={() => setConfirmReject(false)}>
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div className={styles.actions}>
      <button type='button' className={styles.accept} disabled={busy} onClick={onAccept}>
        <i className='ri-check-line' /> {manual ? 'Confirmar pago' : 'Aceptar'}
      </button>
      <button type='button' className={styles.reject} disabled={busy} onClick={() => setConfirmReject(true)}>
        <i className='ri-close-line' /> {manual ? 'No confirmar' : 'Rechazar'}
      </button>
    </div>
  )
}

function clampScale(value) {
  return Math.min(5, Math.max(1, Math.round(value * 100) / 100))
}

function captureFileName(name, type) {
  const base =
    String(name || 'jugador')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'jugador'
  const ext = String(type || '').includes('png') ? 'png' : String(type || '').includes('webp') ? 'webp' : 'jpg'

  return `yape-${base}.${ext}`
}

function ShotPreview({ url, name, onClose, caption }) {
  const stageRef = useRef(null)
  const drag = useRef(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  const changeScale = useCallback(next => {
    setScale(current => clampScale(typeof next === 'function' ? next(current) : next))
  }, [])

  useEffect(() => {
    if (scale === 1) setOffset({ x: 0, y: 0 })
  }, [scale])

  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape') onClose()
      if (event.key === '+' || event.key === '=') changeScale(current => current + 0.25)
      if (event.key === '-' || event.key === '_') changeScale(current => current - 0.25)
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, changeScale])

  useEffect(() => {
    const node = stageRef.current

    if (!node) return undefined

    const onWheel = event => {
      event.preventDefault()
      changeScale(current => current + (event.deltaY < 0 ? 0.2 : -0.2))
    }

    node.addEventListener('wheel', onWheel, { passive: false })

    return () => node.removeEventListener('wheel', onWheel)
  }, [changeScale])

  const onPointerDown = event => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y }
    setDragging(true)
  }

  const onPointerMove = event => {
    if (!drag.current) return
    setOffset({
      x: drag.current.ox + (event.clientX - drag.current.x),
      y: drag.current.oy + (event.clientY - drag.current.y)
    })
  }

  const onPointerUp = () => {
    drag.current = null
    setDragging(false)
  }

  const download = async () => {
    setDownloading(true)
    setDownloadError('')

    try {
      const response = await fetch(`/api/comprobante?url=${encodeURIComponent(url)}`)

      if (!response.ok) throw new Error('download')

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = objectUrl
      link.download = captureFileName(name, blob.type)
      link.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      setDownloadError('No se pudo descargar la captura.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      className={styles.previewBackdrop}
      role='presentation'
      onClick={event => {
        event.stopPropagation()
        onClose()
      }}
    >
      <div
        className={styles.preview}
        role='dialog'
        aria-modal='true'
        aria-label={caption || `Captura de Yape de ${name}`}
        onClick={event => event.stopPropagation()}
      >
        <div className={styles.viewerBar}>
          <button type='button' className={styles.quiet} onClick={() => changeScale(current => current - 0.25)}>
            Alejar
          </button>
          <span className={styles.viewerScale}>{Math.round(scale * 100)}%</span>
          <button type='button' className={styles.quiet} onClick={() => changeScale(current => current + 0.25)}>
            Acercar
          </button>
          <button type='button' className={styles.quiet} onClick={() => changeScale(1)}>
            Ajustar
          </button>
          <button type='button' className={styles.quiet} disabled={downloading} onClick={download}>
            {downloading ? 'Descargando…' : 'Descargar'}
          </button>
          <button type='button' className={styles.quiet} onClick={onClose}>
            Cerrar
          </button>
        </div>
        {downloadError ? <p className={styles.viewerError}>{downloadError}</p> : null}
        <div
          ref={stageRef}
          className={dragging ? styles.viewerDragging : styles.viewerStage}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <img
            src={url}
            alt={caption || `Captura de Yape de ${name}`}
            draggable={false}
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
          />
        </div>
        <p className={styles.viewerHint}>Usa la rueda del mouse para acercar. Arrastra la imagen para moverla.</p>
      </div>
    </div>
  )
}

function Capture({ item, name }) {
  const [open, setOpen] = useState(false)
  const url = item.pago?.comprobante_url
  const manual = isManual(item)
  const caption = manual ? `Comprobante de ${name}` : `Captura de Yape de ${name}`

  if (!url) return null

  return (
    <>
      <button type='button' className={styles.shot} onClick={() => setOpen(true)}>
        <img src={url} alt='' />
        <span className={styles.shotText}>
          {manual ? 'Ver comprobante' : 'Ver captura'}
          <small>{manual ? `De ${name}` : `Yape de ${name}`}</small>
        </span>
      </button>
      {open ? <ShotPreview url={url} name={name} caption={caption} onClose={() => setOpen(false)} /> : null}
    </>
  )
}

function ReservationBody({ item, today, actions }) {
  const name = playerName(item.cliente)
  const phone = phoneHref(item.cliente?.phone_number)
  const when = `${dayLabel(item.fecha, today)} · ${item.hora_inicio}–${endLabel(item.hora_inicio, item.hora_fin)}`
  const place = item.cancha?.sede || ''

  return (
    <>
      <div className={styles.identity}>
        <span className={styles.sport} aria-hidden='true'>
          <i className='ri-basketball-line' />
        </span>
        <div>
          <h3 className={styles.court}>{item.cancha?.nombre || 'Cancha'}</h3>
          <p className={styles.client}>{name}</p>
          <p className={styles.metaLine}>
            <span>{when}</span>
            {place ? <span>{place}</span> : null}
          </p>
        </div>
      </div>
      <div className={styles.pay}>
        <div className={styles.payTop}>
          <p className={styles.amount}>{money(item.total)}</p>
          {item.pago?.estado ? <span className={chipClass(item.pago.estado)}>Pago {pagoLabel(item.pago.estado).toLowerCase()}</span> : null}
          {isManual(item) ? <span className={chipClass('validando')}>En cancha</span> : null}
        </div>
        {phone ? (
          <a className={styles.call} href={phone}>
            <i className='ri-phone-line' />
            Llamar
            <span className={styles.callNumber}>{prettyPhone(item.cliente?.phone_number)}</span>
          </a>
        ) : null}
      </div>
      <div className={styles.side}>
        <Capture item={item} name={name} />
        {actions}
      </div>
    </>
  )
}

function HistoryDetail({ row, onClose }) {
  const [shot, setShot] = useState(false)

  if (!row) return null
  const pago = row.pagos?.[0]
  const phone = phoneHref(row.cliente?.phone_number)
  const name = playerName(row.cliente)

  return (
    <div className={styles.backdrop} role='presentation' onClick={onClose}>
      <div className={styles.detail} role='dialog' aria-modal='true' aria-labelledby='reserva-detalle' onClick={event => event.stopPropagation()}>
        <h2 id='reserva-detalle'>Reserva de {playerName(row.cliente)}</h2>
        <p>
          {row.cancha?.nombre || 'Cancha'}
          {row.cancha?.sede?.name ? ` · ${row.cancha.sede.name}` : ''}
        </p>
        <p>
          {reservationDay(row.fecha) || 'Sin fecha'} · {row.hora_inicio}–{endLabel(row.hora_inicio, row.hora_fin)}
        </p>
        <p className={styles.amount}>{money(row.total)}</p>
        <p>
          <span className={chipClass(row.estado_reserva)}>{reservaLabel(row.estado_reserva)}</span>{' '}
          <span className={chipClass(pago?.estado)}>{pago?.estado ? `Pago ${pagoLabel(pago.estado).toLowerCase()}` : 'Sin pago'}</span>
          {isManual(row) ? <span className={chipClass('validando')}>En cancha</span> : null}
        </p>
        {isManual(row) ? <p>Registrada en la cancha. La hora queda reservada al confirmar el pago.</p> : null}
        {row.cliente?.email ? <p>{row.cliente.email}</p> : null}
        <div className={styles.detailActions}>
          {phone ? (
            <a className={styles.call} href={phone}>
              Llamar
            </a>
          ) : null}
          {pago?.comprobante_url ? (
            <button type='button' className={styles.call} onClick={() => setShot(true)}>
              {isManual(row) ? 'Ver comprobante' : 'Ver captura'}
            </button>
          ) : null}
          <button type='button' className={styles.quiet} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
      {shot && pago?.comprobante_url ? (
        <ShotPreview
          url={pago.comprobante_url}
          name={name}
          caption={isManual(row) ? `Comprobante de ${name}` : `Captura de Yape de ${name}`}
          onClose={() => setShot(false)}
        />
      ) : null}
    </div>
  )
}

export default function OwnerReservationsBoard() {
  const { board, loading, error, busyId, actionError, review } = useLiveCourt()
  const history = useOwnerReservations()
  const [tab, setTab] = useState('por_aceptar')
  const [selected, setSelected] = useState(null)
  const pendingSeen = useRef(null)
  const current = TABS.find(item => item.id === tab) || TABS[0]
  const items = board[current.id] || []
  const pending = board.por_aceptar || []
  const manualCount = pending.filter(isManual).length
  const rows = history.list.rows || []
  const totalPages = Math.max(1, history.list.totalPages || 1)

  useEffect(() => {
    if (loading) return
    const count = pending.length

    if (pendingSeen.current != null && count > pendingSeen.current) setTab('por_aceptar')
    pendingSeen.current = count
  }, [loading, pending.length])

  const decide = async (id, decision) => {
    const ok = await review(id, decision)

    if (ok) history.refetch()
  }

  return (
    <div className={pending.length ? styles.layout : `${styles.layout} ${styles.layoutSolo}`}>
      <div className={styles.main}>
        <header className={styles.head}>
          <h1>Reservas</h1>
          <p className={styles.lead}>
            Atiende lo pendiente, mira quién juega y consulta pagos y fechas.
            {board.now ? ` Son las ${board.now}.` : ''}
          </p>
        </header>

        {error ? <p className={styles.error}>{error}</p> : null}
        {actionError ? <p className={styles.error}>{actionError}</p> : null}

        <section className={`${styles.block} ${styles.panel}`}>
          <div className={styles.panelHead}>
            <i className='ri-wallet-3-line' />
            Recaudación
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span>Hoy</span>
              <strong>{history.loadingCollections ? '…' : money(history.collections.today)}</strong>
            </div>
            <div className={styles.stat}>
              <span>Últimos 7 días</span>
              <strong>{history.loadingCollections ? '…' : money(history.collections.last_7_days)}</strong>
            </div>
            <div className={styles.stat}>
              <span>Este mes</span>
              <strong>{history.loadingCollections ? '…' : money(history.collections.month_to_date)}</strong>
            </div>
          </div>
        </section>

        <div className={styles.filters}>
          <label className={styles.search}>
            <i className='ri-search-line' />
            <input
              value={history.searchInput}
              placeholder='Cliente (nombre o email)'
              onChange={event => history.setSearchInput(event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Cancha</span>
            <select value={history.canchaId} onChange={event => history.setCanchaId(event.target.value)}>
              <option value=''>Todas</option>
              {history.courtsList.map(court => (
                <option key={court.id} value={String(court.id)}>
                  {court.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Estado de la reserva</span>
            <select value={history.estadoReserva} onChange={event => history.setEstadoReserva(event.target.value)}>
              <option value=''>Todos</option>
              <option value='validando'>Por aceptar</option>
              <option value='confirmada'>Confirmada</option>
              <option value='pendiente'>Pendiente</option>
              <option value='cancelada'>Cancelada</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Estado del pago</span>
            <select value={history.estadoPago} onChange={event => history.setEstadoPago(event.target.value)}>
              <option value=''>Todos</option>
              <option value='pendiente'>Pendiente</option>
              <option value='confirmada'>Confirmado</option>
              <option value='cancelada'>Cancelado</option>
            </select>
          </label>
          <button type='button' className={styles.clear} onClick={history.handleResetFilters}>
            <i className='ri-filter-off-line' /> Limpiar
          </button>
        </div>

        <div className={styles.tabs} role='tablist' aria-label='Reservas de hoy'>
          {TABS.map(item => {
            const count = (board[item.id] || []).length
            const on = tab === item.id

            return (
              <button
                key={item.id}
                type='button'
                role='tab'
                aria-selected={on}
                className={on ? styles.tabOn : styles.tab}
                onClick={() => setTab(item.id)}
              >
                <span className={on ? styles.countOn : styles.count}>{count}</span>
                {item.label}
              </button>
            )
          })}
        </div>

        <section className={styles.block} role='tabpanel'>
          <h2>{current.title}</h2>
          {loading ? <p className={styles.hint}>Cargando las reservas…</p> : null}
          {!loading && items.length === 0 ? <p className={styles.hint}>{current.empty}</p> : null}
          {!loading && items.length > 0 ? (
            <div className={styles.cards}>
              {items.map(item => (
                <article key={item.id} className={current.id === 'por_aceptar' ? styles.pending : styles.plain}>
                  <ReservationBody
                    item={item}
                    today={board.today}
                    actions={
                      current.id === 'por_aceptar' ? (
                        <Actions
                          manual={isManual(item)}
                          busy={busyId === item.id}
                          onAccept={() => decide(item.id, 'aceptar')}
                          onReject={() => decide(item.id, 'rechazar')}
                        />
                      ) : null
                    }
                  />
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <section className={styles.block}>
          <h2>Historial de reservas</h2>
          <p className={styles.hint}>Los filtros de arriba se aplican a esta tabla.</p>
          <div className={styles.tableWrap}>
            {history.loading ? (
              <p className={styles.empty}>Cargando el historial…</p>
            ) : rows.length === 0 ? (
              <p className={styles.empty}>
                <i className='ri-file-search-line' />
                No hay reservas con esos filtros.
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Cancha</th>
                    <th>Fecha</th>
                    <th>Horas de reserva</th>
                    <th>Monto</th>
                    <th>Estado de la reserva</th>
                    <th>Estado del pago</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => {
                    const pago = row.pagos?.[0]

                    return (
                      <tr key={row.id} onClick={() => setSelected(row)}>
                        <td>
                          <span className={styles.person}>{playerName(row.cliente)}</span>
                          {row.origen === 'manual' ? (
                            <span className={styles.mail}>En cancha</span>
                          ) : row.cliente?.email ? (
                            <span className={styles.mail}>{row.cliente.email}</span>
                          ) : null}
                        </td>
                        <td>{row.cancha?.nombre || '—'}</td>
                        <td>{reservationDay(row.fecha) || 'Sin fecha'}</td>
                        <td>
                          {row.hora_inicio}–{endLabel(row.hora_inicio, row.hora_fin)}
                        </td>
                        <td>{money(row.total)}</td>
                        <td>
                          <span className={chipClass(row.estado_reserva)}>{reservaLabel(row.estado_reserva)}</span>
                        </td>
                        <td>
                          <span className={chipClass(pago?.estado)}>{pagoLabel(pago?.estado)}</span>
                          {pago?.metodo_pago === 'En cancha' ? <span className={styles.mail}>En cancha</span> : null}
                        </td>
                        <td>
                          <button
                            type='button'
                            className={styles.linkish}
                            onClick={event => {
                              event.stopPropagation()
                              setSelected(row)
                            }}
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          {!history.loading && totalPages > 1 ? (
            <div className={styles.pager}>
              <button
                type='button'
                className={styles.quiet}
                disabled={history.pagination.currentPage <= 1}
                onClick={() => history.handlePageChange(history.pagination.currentPage - 1)}
              >
                Anterior
              </button>
              <span className={styles.hint}>
                {history.pagination.currentPage} de {totalPages}
              </span>
              <button
                type='button'
                className={styles.quiet}
                disabled={history.pagination.currentPage >= totalPages}
                onClick={() => history.handlePageChange(history.pagination.currentPage + 1)}
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </section>
      </div>

      {pending.length ? (
      <aside className={styles.rail}>
        <h2>Reservas que requieren atención</h2>
        <div className={styles.notice}>
          <span className={styles.yapeMark} aria-hidden='true'>
            <svg viewBox='0 0 24 24' width='22' height='22'>
              <rect x='6' y='2.5' width='12' height='19' rx='2.5' fill='none' stroke='currentColor' strokeWidth='1.8' />
              <path d='M9 6.5h6M9 10h6M9 13.5h3.5' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
              <circle cx='12' cy='17.2' r='0.9' fill='currentColor' />
            </svg>
          </span>
          <p>
            <strong>
              {manualCount === pending.length
                ? 'Pagos en cancha por confirmar.'
                : manualCount === 0
                  ? 'Yape que todavía tienes que revisar.'
                  : 'Reservas por confirmar.'}
            </strong>
            <span>Siguen aquí hasta que aceptes o rechaces el pago.</span>
          </p>
        </div>
        {pending.map(item => (
          <article key={item.id} className={styles.attention}>
            <strong>{item.cancha?.nombre || 'Cancha'}</strong>
            <span className={styles.line}>
              <i className='ri-user-line' /> {playerName(item.cliente)}
            </span>
            <span className={styles.line}>
              <i className='ri-calendar-line' /> {dayLabel(item.fecha, board.today)} · {item.hora_inicio}–{endLabel(item.hora_inicio, item.hora_fin)}
            </span>
            <span className={styles.line}>
              <i className='ri-wallet-3-line' /> {money(item.total)}
              {item.cancha?.sede ? ` · ${item.cancha.sede}` : ''}
            </span>
            {phoneHref(item.cliente?.phone_number) ? (
              <a className={styles.call} href={phoneHref(item.cliente?.phone_number)}>
                <i className='ri-phone-line' /> Llamar {prettyPhone(item.cliente?.phone_number)}
              </a>
            ) : null}
            {isManual(item) ? <span className={styles.line}>Pago en cancha</span> : null}
            <Capture item={item} name={playerName(item.cliente)} />
            <Actions
              manual={isManual(item)}
              busy={busyId === item.id}
              onAccept={() => decide(item.id, 'aceptar')}
              onReject={() => decide(item.id, 'rechazar')}
            />
          </article>
        ))}
      </aside>
      ) : null}

      <HistoryDetail row={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
