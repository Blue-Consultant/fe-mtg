'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import CustomTabList from '@/@core/components/mui/TabList'

const TabsContainer = ({ tabs }) => {
  // State para manejar la pestaña activa
  const [value, setValue] = useState(tabs[0]?.value || '1')

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <TabContext value={value}>
      <CustomTabList
        pill='true'
        onChange={handleChange}
        aria-label='orange tabs example'
        sx={{
          '& .MuiTab-root': {
            color: 'black',
            '&.Mui-selected': {
              backgroundColor: '#ff9800',
              color: '#fff',
              borderRadius: '8px'
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#ff9800'
          }
        }}
      >
        {tabs.map((tab, index) => (
          <Tab key={index} value={tab.value} label={tab.label} />
        ))}
      </CustomTabList>

      {tabs.map((tab, index) => (
        <TabPanel key={index} value={tab.value}>
          {tab.component}
        </TabPanel>
      ))}
    </TabContext>
  )
}

export default TabsContainer
