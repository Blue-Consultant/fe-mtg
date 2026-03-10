'use client'
import { useState, useEffect } from 'react'

import dynamic from 'next/dynamic'

// React Imports
// React redux imports
import { useSelector } from 'react-redux'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

// Component Imports
import UserProfileHeader from './UserProfileHeader'
import CustomTabList from '@core/components/mui/TabList'
import { dataUser as getProfileData } from '@/views/user-profile/userProfile'

const ProfileTab = dynamic(() => import('@views/user-profile/profile/index'))
const TeamsTab = dynamic(() => import('@views/user-profile/teams/index'))
const ProjectsTab = dynamic(() => import('@views/user-profile/projects/index'))
const ConnectionsTab = dynamic(() => import('@views/user-profile/connections/index'))

const UserProfile = () => {
  // States
  const [activeTab, setActiveTab] = useState('profile')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const user = useSelector(state => state.loginReducer.user)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar que user existe antes de procesar los datos
        if (!user) {
          setLoading(false)
          return
        }

        const fetchedData = getProfileData(user)

        setData(fetchedData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  // Vars
  const tabContentList = data => ({
    profile: <ProfileTab data={data?.users.profile} />

    // teams: <TeamsTab data={data?.users.teams} />,
    // projects: <ProjectsTab data={data?.users.projects} />,
    // connections: <ConnectionsTab data={data?.users.connections} />
  })

  if (loading) {
    return (
      <Grid container spacing={-50} xs={12} justifyContent='center' alignItems='center'>
        <CircularProgress size={20} color='inherit' />
      </Grid>
    )
  }

  // Si no hay usuario después de cargar, no mostrar nada
  if (!user) {
    return (
      <Grid container spacing={6} xs={12} justifyContent='center' alignItems='center'>
        <Typography variant='h6' color='text.secondary'>
          No se pudo cargar la información del usuario
        </Typography>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserProfileHeader data={data?.profileHeader} />
      </Grid>
      {activeTab === undefined ? null : (
        <Grid item xs={12} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='ri-user-3-line text-lg' />
                    Perfil
                  </div>
                }
                value='profile'
              />
              {/* <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='ri-team-line text-lg' />
                    Teams
                  </div>
                }
                value='teams'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='ri-computer-line text-lg' />
                    Projects
                  </div>
                }
                value='projects'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='ri-link-m text-lg' />
                    Connections
                  </div>
                }
                value='connections'
              /> */}
            </CustomTabList>

            <TabPanel value={activeTab} className='p-0'>
              {tabContentList(data)[activeTab]}
            </TabPanel>
          </TabContext>
        </Grid>
      )}
    </Grid>
  )
}

export default UserProfile
