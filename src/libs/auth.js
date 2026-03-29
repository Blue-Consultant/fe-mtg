// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        // El token real está en cookies httpOnly
        // NextAuth solo maneja el estado de la sesión del cliente
        return {
          id: credentials.id,
          name: credentials.name,
          email: credentials.email,
          image: credentials.image
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 1 * 60 * 60, // 1 hora - sincronizado con REFRESH_TOKEN_EXPIRATION del backend
    updateAge: 15 * 60 // Actualiza la sesión cada 15 minutos
  },
  pages: {
    signIn: '/es/login'
  },
  callbacks: {
    /**
     * Evita 500 en POST /api/auth/signout si callbackUrl es inválida (p. ej. URL mal formada en env).
     * El callback por defecto de NextAuth hace new URL(url) sin try/catch.
     */
    async redirect({ url, baseUrl }) {
      try {
        if (url.startsWith('/')) return `${baseUrl}${url}`
        if (new URL(url).origin === baseUrl) return url
      } catch {
        // ignorar URL inválida
      }
      return baseUrl
    },
    async jwt({ token, user }) {
      if (user) {
        // Solo guardamos información no sensible del usuario
        token.id = user.id || null
        token.name = user.name || null
        token.email = user.email || null
        token.image = user.image || null
      }

      return token
    },
    async session({ session, token }) {
      // El accessToken real está en cookies httpOnly, no lo exponemos aquí
      session.user.id = token.id || null
      session.user.name = token.name || null
      session.user.email = token.email || null
      session.user.image = token.image || null

      return session
    }
  }
}
