import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_SERVER_API || 'http://localhost:5100'

export async function GET() {
  try {
    console.log('Fetching submodules from:', `${API_URL}/sub-modules/find-all/sub-module/true`)
    
    // Llamada directa al backend
    const response = await axios.get(`${API_URL}/sub-modules/find-All/sub-module/true`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Submodules response:', response.data)
    
    return Response.json(response.data)
  } catch (error) {
    console.error('ERROR: API submodules route', error.message)
    console.error('ERROR Details:', error.response?.data || error)
    
    return Response.json({ 
      error: 'Error al obtener submódulos',
      details: error.message,
      apiUrl: API_URL 
    }, { status: 500 })
  }
}