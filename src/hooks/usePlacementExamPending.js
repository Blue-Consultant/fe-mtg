'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useRouter, usePathname } from 'next/navigation'
import axios from '@/utils/axios'
import { toast } from 'react-toastify'

const EXAM_COMPLETED_KEY = 'placement_exam_completed'
const EXAM_REDIRECT_NOTICE_KEY = 'placement_exam_redirect_notice'

const getExamCompletedStatus = (userId) => {
  try {
    const stored = sessionStorage.getItem(`${EXAM_COMPLETED_KEY}_${userId}`)
    return stored === 'true'
  } catch {
    return false
  }
}

const setExamCompletedStatus = (userId, completed) => {
  try {
    if (completed) {
      sessionStorage.setItem(`${EXAM_COMPLETED_KEY}_${userId}`, 'true')
    } else {
      sessionStorage.removeItem(`${EXAM_COMPLETED_KEY}_${userId}`)
    }
  } catch {}
}

const getRedirectNoticeStatus = (userId) => {
  try {
    const stored = sessionStorage.getItem(`${EXAM_REDIRECT_NOTICE_KEY}_${userId}`)
    return stored === 'true'
  } catch {
    return false
  }
}

const setRedirectNoticeStatus = (userId, shown) => {
  try {
    if (shown) {
      sessionStorage.setItem(`${EXAM_REDIRECT_NOTICE_KEY}_${userId}`, 'true')
    } else {
      sessionStorage.removeItem(`${EXAM_REDIRECT_NOTICE_KEY}_${userId}`)
    }
  } catch {}
}

export const usePlacementExamPending = () => {
  const router = useRouter()
  const pathname = usePathname()
  const user = useSelector(state => state.loginReducer.user)
 
  const [pendingExam, setPendingExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showExamModal, setShowExamModal] = useState(false)
 
  const isCheckingRef = useRef(false)
  const lastCheckRef = useRef(0)
  const abortControllerRef = useRef(null)
  const pollingIntervalRef = useRef(null)

  const allowedPaths = ['/placement-exam', '/login', '/logout']

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isAllowedPath = useCallback((path) => {
    return allowedPaths.some(allowed => path.includes(allowed))
  }, [])

  const isStudent = useCallback(() => {
    try {
      const storedRoles = localStorage.getItem('userRoles')
      if (storedRoles) {
        const roles = JSON.parse(storedRoles)
        return roles.some(r =>
          r.roleName?.toLowerCase() === 'student' ||
          r.roleName?.toLowerCase() === 'estudiante'
        )
      }
    } catch (e) {
      console.error('Error parsing roles:', e)
    }
   
    const roleName = user?.role?.name?.toLowerCase() ||
                     user?.roleName?.toLowerCase() ||
                     user?.Branches_users?.[0]?.Roles?.name?.toLowerCase()
   
    return roleName === 'student' || roleName === 'estudiante'
  }, [user])

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  const checkPendingExam = useCallback(async (force = false) => {
    if (isCheckingRef.current) return

    const now = Date.now()
    if (!force && now - lastCheckRef.current < 2000) return

    if (!user?.id) {
      setLoading(false)
      return
    }

    if (getExamCompletedStatus(user.id)) {
      setLoading(false)
      setPendingExam(null)
      return
    }

    if (!isStudent()) {
      setLoading(false)
      return
    }

    try {
      isCheckingRef.current = true
      lastCheckRef.current = now

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      const response = await axios.get('/placement-exams/my-pending', {
        signal: abortControllerRef.current.signal
      })
      const exam = response.data

      if (exam && exam.id) {
        setPendingExam(exam)
        const currentPath = window.location.pathname || pathname || ''
        const isOnExamPage = currentPath.includes('/placement-exam/take')
       
        if (!isOnExamPage) {
          const lang = currentPath.split('/')[1] || pathname?.split('/')[1] || 'es'

          // Aviso UX (una sola vez por sesión) para que el estudiante entienda el redirect
          if (!getRedirectNoticeStatus(user.id)) {
            setRedirectNoticeStatus(user.id, true)
            toast.info('Tienes un examen de ubicación pendiente. Te estamos redirigiendo para iniciarlo.')
          }

          router.replace(`/${lang}/placement-exam/take`)
        }
        setShowExamModal(false)
      } else {
        setPendingExam(null)
        setShowExamModal(false)
        setExamCompletedStatus(user.id, true)
        stopPolling()
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') return

      console.error('Error checking pending placement exam:', err)
      setError(err.message)
      if (err.response?.status === 404) {
        setExamCompletedStatus(user.id, true)
        stopPolling()
      }
    } finally {
      setLoading(false)
      isCheckingRef.current = false
      abortControllerRef.current = null
    }
  }, [user?.id, isStudent, router, pathname, stopPolling])

  const startPolling = useCallback(() => {
    stopPolling()
    pollingIntervalRef.current = setInterval(() => {
      checkPendingExam()
    }, 30000)
  }, [checkPendingExam, stopPolling])

  useEffect(() => {
    if (user?.id) {
      checkPendingExam(true)
    }
  }, [user?.id, checkPendingExam])

  useEffect(() => {
    if (!user?.id || pathname?.includes('/placement-exam/take') || getExamCompletedStatus(user.id)) {
      return
    }
    checkPendingExam()
  }, [pathname, user?.id, checkPendingExam])

  useEffect(() => {
    if (!user?.id || 
        pathname?.includes('/placement-exam/take') || 
        getExamCompletedStatus(user.id) || 
        !pendingExam) {
      stopPolling()
      return
    }

    const handleFocus = () => checkPendingExam()

    window.addEventListener('focus', handleFocus, { passive: true })
    startPolling()

    return () => {
      window.removeEventListener('focus', handleFocus)
      stopPolling()
    }
  }, [pathname, pendingExam, user?.id, checkPendingExam, startPolling, stopPolling])

  useEffect(() => {
    if (pathname?.includes('/placement-exam/take')) {
      setShowExamModal(false)
    }
  }, [pathname])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      stopPolling()
    }
  }, [stopPolling])

  const startExam = useCallback(() => {
    if (pendingExam) {
      const lang = pathname.split('/')[1] || 'es'
      router.push(`/${lang}/placement-exam/take`)
    }
  }, [pendingExam, pathname, router])

  const refreshExamStatus = useCallback(() => {
    if (user?.id) {
      setExamCompletedStatus(user.id, false)
      checkPendingExam(true)
    }
  }, [checkPendingExam, user?.id])

  const markExamCompleted = useCallback(() => {
    if (user?.id) {
      setExamCompletedStatus(user.id, true)
      setPendingExam(null)
      stopPolling()
    }
  }, [user?.id, stopPolling])

  return {
    pendingExam,
    loading,
    error,
    showExamModal,
    setShowExamModal,
    startExam,
    refreshExamStatus,
    markExamCompleted,
    hasPendingExam: !!pendingExam,
  }
}

export default usePlacementExamPending
