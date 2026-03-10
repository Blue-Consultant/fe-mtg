// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports dashboards/ecommerce/Congratulations
import Congratulations from '@views/dashboard/Congratulations'
import CardStatVertical from '@components/card-statistics/Vertical'
import TotalProfitStackedBar from '@views/dashboard/TotalProfitStackedBar'
import TotalSales from '@views/dashboard/TotalSales'
import LineChartWithShadow from '@views/dashboard/LineChartWithShadow'
import RadialBarChart from '@views/dashboard/RadialBarChart'

import { getDictionary } from '@/utils/getDictionary'

//ESTE CAMBIO SE DEPLOYA

const Dashboard = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={8} className='self-end'>
        <Congratulations dictionary={dictionary} />
      </Grid>
      <Grid item xs={12} md={4}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <CardStatVertical
              title='Revenue'
              stats='$95k'
              avatarIcon='ri-money-dollar-circle-line'
              avatarColor='success'
              subtitle='Revenue Increase'
              trendNumber='12%'
              trend='positive'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardStatVertical
              title='Transactions'
              stats='12.1k'
              avatarIcon='ri-bank-card-line'
              avatarColor='info'
              subtitle='Daily Transactions'
              trendNumber='38%'
              trend='positive'
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={8}>
        <TotalProfitStackedBar />
      </Grid>
      <Grid item xs={12} md={4}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <TotalSales />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LineChartWithShadow />
          </Grid>
          <Grid item xs={12} sm={6}>
            <RadialBarChart />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Dashboard
