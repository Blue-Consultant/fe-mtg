'use client'

import { useEffect, useId, useRef, useState } from 'react'

import styles from './conversation.module.css'

function Receipt({ receipt }) {
  return (
    <div className={`${styles.bubble} ${styles.receipt}`}>
      {receipt.rows.map(row => (
        <p key={row.label} className={styles.receiptRow}>
          <span>{row.label}</span>
          <strong>{row.value}</strong>
        </p>
      ))}
      <p className={styles.receiptTotal}>
        <span>Total</span>
        <strong>{receipt.total}</strong>
      </p>
    </div>
  )
}

function Bubble({ message }) {
  if (message.kind === 'receipt' && message.receipt) return <Receipt receipt={message.receipt} />

  if (message.kind === 'image' && message.imageUrl) {
    return (
      <div className={styles.bubble}>
        <img src={message.imageUrl} alt='Captura de Yape' className={styles.shot} />
        {message.text ? <p className={styles.shotName}>{message.text}</p> : null}
      </div>
    )
  }

  return <p className={styles.bubble}>{message.text}</p>
}

function Alternatives({ choices, disabled, onChoice }) {
  if (!choices?.length) return null

  return (
    <div className={styles.alternatives}>
      {choices.map(choice => (
        <button
          key={choice.id}
          type='button'
          className={styles.alternative}
          disabled={disabled}
          onClick={() => onChoice(choice)}
        >
          {choice.label}
        </button>
      ))}
    </div>
  )
}

function Composer({ composer, disabled, onChoice, onText, onFile }) {
  const inputId = useId()
  const fieldRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const revealKey = `${composer?.placeholder || ''}|${composer?.autoComplete || ''}|${composer?.secret ? 1 : 0}`

  useEffect(() => {
    setVisible(false)
  }, [revealKey])

  useEffect(() => {
    if (composer?.type === 'text') fieldRef.current?.focus()
  }, [composer])

  if (!composer || disabled) return null

  if (composer.type === 'choices') {
    return (
      <div className={styles.composer}>
        {composer.choices.map(choice => (
          <button
            key={choice.id}
            type='button'
            className={choice.primary ? styles.choicePrimary : styles.choice}
            disabled={disabled}
            onClick={() => onChoice(choice)}
          >
            {choice.label}
          </button>
        ))}
      </div>
    )
  }

  if (composer.type === 'file') {
    return (
      <form
        className={styles.composer}
        onSubmit={event => {
          event.preventDefault()
        }}
      >
        <label className={styles.fileLabel}>
          <i className='ri-image-add-line' aria-hidden />
          {composer.submitLabel || 'Subir captura'}
          <input
            className={styles.fileInput}
            type='file'
            accept={composer.accept || 'image/*'}
            disabled={disabled}
            onChange={event => {
              const file = event.target.files?.[0]

              event.target.value = ''
              if (file) onFile(file)
            }}
          />
        </label>
      </form>
    )
  }

  return (
    <form
      className={styles.composer}
      onSubmit={event => {
        event.preventDefault()
        const value = fieldRef.current?.value || ''

        if (!value.trim()) return
        onText(value)
        if (fieldRef.current) fieldRef.current.value = ''
      }}
    >
      <div className={styles.form}>
        {composer.prefix ? <span className={styles.prefix}>{composer.prefix}</span> : null}
        <div className={styles.field}>
          <input
            ref={fieldRef}
            id={inputId}
            className={styles.input}
            name='message'
            type={composer.secret && !visible ? 'password' : 'text'}
            placeholder={composer.placeholder || 'Escribe aquí'}
            autoComplete={composer.autoComplete || 'off'}
            inputMode={composer.inputMode}
            disabled={disabled}
            aria-label={composer.placeholder || 'Respuesta'}
          />
          {composer.secret ? (
            <button
              type='button'
              className={styles.reveal}
              aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
              onClick={() => {
                setVisible(current => !current)
                fieldRef.current?.focus()
              }}
            >
              <i className={visible ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden />
            </button>
          ) : null}
        </div>
        <button type='submit' className={styles.send} disabled={disabled}>
          Enviar
        </button>
      </div>
      <Alternatives choices={composer.alternatives} disabled={disabled} onChoice={onChoice} />
    </form>
  )
}

export default function Conversation({
  title,
  kicker = 'Conversación',
  onClose,
  messages,
  isTyping,
  busy = false,
  composer,
  onChoice,
  onText,
  onFile
}) {
  const logRef = useRef(null)

  useEffect(() => {
    const node = logRef.current

    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [messages, isTyping])

  return (
    <section className={styles.panel} aria-label={title}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.kicker}>{kicker}</p>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <button type='button' className={styles.close} aria-label='Cerrar' onClick={onClose}>
          <i className='ri-close-line' />
        </button>
      </header>
      <div ref={logRef} className={styles.log} role='log' aria-live='polite' aria-relevant='additions'>
        {messages.map(message => (
          <div key={message.id} className={`${styles.row} ${message.role === 'user' ? styles.user : styles.assistant}`}>
            <Bubble message={message} />
          </div>
        ))}
        {isTyping ? (
          <div className={`${styles.row} ${styles.assistant}`}>
            <p className={styles.bubble}>
              <span className={styles.typing} aria-label='Escribiendo'>
                <span />
                <span />
                <span />
              </span>
            </p>
          </div>
        ) : null}
      </div>
      <Composer composer={composer} disabled={isTyping || busy} onChoice={onChoice} onText={onText} onFile={onFile} />
    </section>
  )
}
