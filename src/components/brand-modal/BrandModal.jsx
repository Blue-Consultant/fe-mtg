'use client'

import { useId } from 'react'

import Dialog from '@mui/material/Dialog'

import styles from './brand-modal.module.css'

const DEFAULT_IMAGE = '/images/sidebar/banner-image.png'

const headerBackground = image =>
  `linear-gradient(100deg, rgba(6, 16, 10, 0.82) 0%, rgba(6, 16, 10, 0.55) 46%, rgba(6, 16, 10, 0.28) 100%), url('${image}')`

export default function BrandModal({
  open,
  onClose,
  title,
  kicker,
  image = DEFAULT_IMAGE,
  imagePosition = 'center 62%',
  children,
  actions = [],
  maxWidth = 'xs'
}) {
  const titleId = useId()

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth} aria-labelledby={titleId} PaperProps={{ className: styles.paper }}>
      <header
        className={styles.hero}
        style={{
          backgroundImage: headerBackground(image),
          backgroundPosition: `center, ${imagePosition}`
        }}
      >
        <button type='button' className={styles.close} aria-label='Cerrar' onClick={onClose}>
          <i className='ri-close-line' />
        </button>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
      </header>
      {children ? <div className={styles.body}>{children}</div> : null}
      {actions.length > 0 ? (
        <footer className={styles.actions}>
          {actions.map(action => {
            const className = action.variant === 'primary' ? styles.actionPrimary : styles.action

            if (action.href) {
              return (
                <a
                  key={action.label}
                  className={className}
                  href={action.href}
                  target={action.external ? '_blank' : undefined}
                  rel={action.external ? 'noopener noreferrer' : undefined}
                >
                  {action.icon ? <i className={action.icon} aria-hidden /> : null}
                  {action.label}
                </a>
              )
            }

            return (
              <button key={action.label} type='button' className={className} onClick={action.onClick}>
                {action.icon ? <i className={action.icon} aria-hidden /> : null}
                {action.label}
              </button>
            )
          })}
        </footer>
      ) : null}
    </Dialog>
  )
}
