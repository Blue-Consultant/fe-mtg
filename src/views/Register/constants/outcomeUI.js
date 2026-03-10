export const OUTCOME_UI = (t) => ({
  STUDENT_LINKED: {
    message: t ? t.modules.register.outcome.studentLinked : 'Ya existe una cuenta Estudiante asociada a este correo o DNI.',
    actions: [{ label: t ? t.common.login : 'Iniciar sesión', href: '/login', variant: 'contained', color: 'primary' }]
  },
  HOLDER_LINKED_NO_CODES: {
    message: t ? t.modules.register.outcome.holderLinkedNoCodes : 'Ya existe una cuenta titular asociada a este correo o DNI y no cuenta con códigos para asociar estudiante.',
    actions: [{ label: t ? t.common.login : 'Iniciar sesión', href: '/login', variant: 'contained', color: 'primary' }]
  },
  HOLDER_NOT_LINKED: {
    message: t ? t.modules.register.outcome.holderNotLinked : 'Ya existe una cuenta titular asociada a este correo o DNI y aun cuenta con códigos para asociar estudiante.',
    actions: [
      { label: t ? t.modules.register.actions.linkStudent : 'Asociar estudiante', intent: { type: 'CREATE_USER', role: 'STUDENT' }, variant: 'contained', color: 'primary' },
      { label: t ? t.common.login : 'Iniciar sesión', href: '/login', variant: 'outlined', color: 'primary' }
    ]
  },
  NOT_REGISTERED: {
    message: t ? t.modules.register.outcome.notRegistered : 'No encontramos una cuenta asociada a este correo o DNI.',
    actions: [
      { label: t ? t.modules.register.actions.registerHolder : 'Registrar Titular',   intent: { type: 'CREATE_USER', role: 'HOLDER' },  variant: 'contained', color: 'primary' },
      { label: t ? t.modules.register.actions.registerStudent : 'Registrar Estudiante', intent: { type: 'CREATE_USER', role: 'STUDENT' }, variant: 'contained', color: 'primary' }
    ]
  },
  STUDENT_REGISTERED: {
    message: t ? t.modules.register.outcome.studentRegistered : 'Estudiante creado con éxito. 🚀',
    actions: [{ label: t ? t.common.login : 'Iniciar sesión', href: '/login', variant: 'outlined', color: 'primary' }]
  },
  HOLDER_REGISTERED: {
    message: t ? t.modules.register.outcome.holderRegistered : 'Titular creado con éxito. 🚀',
    actions: [
      { label: t ? t.modules.register.actions.linkStudent : 'Asociar estudiante', intent: { type: 'CREATE_USER', role: 'STUDENT' }, variant: 'contained', color: 'primary' },
      { label: t ? t.common.login : 'Iniciar sesión', href: '/login', variant: 'outlined', color: 'primary' }
    ]
  },
  USER_ALREADY_REGISTERED: {
    message: t ? t.modules.register.outcome.userAlreadyRegistered : 'Ya existe una cuenta asociada a este correo o DNI.',
    actions: [
      { label: t ? t.common.login : 'Iniciar sesión', href: '/login', variant: 'contained', color: 'primary' }
    ]
  }
});
