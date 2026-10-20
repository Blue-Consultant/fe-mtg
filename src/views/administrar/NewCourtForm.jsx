'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { listBranchesByOwner } from '@/views/branches/api'
import { createCourt, uploadCourtImage } from '@/views/courts/api'
import { getCourtTypes } from '@/views/court-types/api'

import styles from './admin-board.module.css'

const ENDPOINT = (process.env.NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT || '').replace(/\/+$/, '')

function venuesFromOwnerRows(rows) {
  if (!Array.isArray(rows)) return []

  const venues = rows
    .map(item => item.SportsVenue || item.Branches)
    .filter(Boolean)
    .map(venue => ({
      id: venue.id,
      name: venue.name,
      company: venue.company_name
    }))

  return venues.filter((venue, index, list) => list.findIndex(item => item.id === venue.id) === index)
}

function previewSrc(keyOrUrl) {
  if (!keyOrUrl) return null
  if (/^(https?:|blob:|data:)/i.test(keyOrUrl)) return keyOrUrl
  if (!ENDPOINT) return null

  return `${ENDPOINT}/${String(keyOrUrl).replace(/^\/+/, '')}`
}

export default function NewCourtForm({ userId, onCreated, onCancel }) {
  const { lang } = useParams()
  const [venues, setVenues] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [nombre, setNombre] = useState('')
  const [sedeId, setSedeId] = useState('')
  const [typeId, setTypeId] = useState('')
  const [imagenKey, setImagenKey] = useState('')
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)

      const [branchRows, typeRows] = await Promise.all([listBranchesByOwner(userId), getCourtTypes(true)])

      if (cancelled) return

      const nextVenues = venuesFromOwnerRows(branchRows)

      setVenues(nextVenues)
      setTypes(Array.isArray(typeRows) ? typeRows : [])
      setSedeId(nextVenues.length === 1 ? String(nextVenues[0].id) : '')
      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [userId])

  const onPickImage = async event => {
    const input = event.target
    const file = input.files?.[0]

    if (!file) return

    if (!/^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG, WEBP o GIF.')
      input.value = ''

      return
    }

    if (file.size > 800 * 1024) {
      setError('La imagen no puede superar 800 KB.')
      input.value = ''

      return
    }

    const localUrl = URL.createObjectURL(file)

    setPreview(localUrl)
    setUploading(true)
    setError('')

    try {
      const { objectKey } = await uploadCourtImage(file)

      setImagenKey(objectKey)
    } catch (err) {
      setImagenKey('')
      setPreview('')
      setError(err?.message || 'No se pudo subir la imagen.')
    } finally {
      setUploading(false)
      input.value = ''
    }
  }

  const clearImage = () => {
    setImagenKey('')
    setPreview('')
  }

  const submit = async event => {
    event.preventDefault()

    const name = nombre.trim()

    if (!name) {
      setError('Escribe cómo se llama la cancha.')

      return
    }

    if (!sedeId) {
      setError('Elige la sede donde está la cancha.')

      return
    }

    if (uploading) {
      setError('Espera a que termine de subir la imagen.')

      return
    }

    setSaving(true)
    setError('')

    try {
      const created = await createCourt({
        sede_id: Number(sedeId),
        nombre: name,
        court_type_id: typeId ? Number(typeId) : null,
        estado: true,
        imagen: imagenKey || null
      })

      onCreated(created)
    } catch {
      setError('No se pudo crear la cancha. Revisa el nombre y vuelve a intentar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className={styles.formNote}>Cargando tus sedes…</p>

  if (venues.length === 0) {
    return (
      <div className={styles.newCourt}>
        <p>Para agregar una cancha primero necesitas una sede.</p>
        <Link href={`/${lang}/branches`}>Ir a Sucursales</Link>
        {onCancel ? (
          <button type='button' onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    )
  }

  const onlyVenue = venues.length === 1 ? venues[0] : null
  const imageSrc = preview || previewSrc(imagenKey)

  return (
    <form className={styles.newCourt} onSubmit={submit}>
      <p>Nueva cancha</p>

      <div className={styles.imageUpload}>
        <div className={styles.imagePreview}>
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt='Vista previa de la cancha' />
          ) : (
            <span className={styles.imageEmpty}>
              <i className='ri-image-add-line' aria-hidden />
              Sin foto
            </span>
          )}
        </div>
        <div className={styles.imageActions}>
          <label className={styles.imageBtn}>
            {uploading ? 'Subiendo…' : 'Subir imagen'}
            <input
              hidden
              type='file'
              accept='image/png,image/jpeg,image/webp,image/gif'
              disabled={uploading || saving}
              onChange={onPickImage}
            />
          </label>
          {imageSrc ? (
            <button type='button' className={styles.imageBtnGhost} onClick={clearImage} disabled={uploading || saving}>
              Quitar
            </button>
          ) : null}
          <span className={styles.formNote}>JPG, PNG o WEBP. Máx. 800 KB.</span>
        </div>
      </div>

      <label>
        Cómo se llama
        <input
          value={nombre}
          onChange={event => setNombre(event.target.value)}
          placeholder='Por ejemplo, Fútbol 5 — Cancha techada'
          maxLength={120}
          autoFocus
        />
      </label>
      {onlyVenue ? (
        <p className={styles.formNote}>Se crea en {onlyVenue.name}.</p>
      ) : (
        <label>
          En qué sede
          <select value={sedeId} onChange={event => setSedeId(event.target.value)}>
            <option value=''>Elige la sede</option>
            {venues.map(venue => (
              <option key={venue.id} value={venue.id}>
                {venue.company ? `${venue.name} — ${venue.company}` : venue.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {types.length > 0 ? (
        <label>
          Deporte, si quieres indicarlo
          <select value={typeId} onChange={event => setTypeId(event.target.value)}>
            <option value=''>Sin tipo</option>
            {types.map(type => (
              <option key={type.id} value={type.id}>
                {type.nombre}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {error ? <p className={styles.formError}>{error}</p> : null}
      <div className={styles.formActions}>
        <button type='submit' className={styles.formSave} disabled={saving || uploading}>
          {saving ? 'Creando…' : 'Crear cancha'}
        </button>
        {onCancel ? (
          <button type='button' className={styles.formCancel} onClick={onCancel} disabled={saving || uploading}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}
