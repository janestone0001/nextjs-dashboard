// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { DeviceTypes } from '@/types/admin/deviceTypes'

// Component Imports
import DeviceListTable from './DeviceListTable'

// import UserListCards from './UserListCards'

const DeviceList = ({ deviceData }: { deviceData: DeviceTypes[] | any[] }) => {
  return (
    <Grid container spacing={6}>
      {/*<Grid size={{ xs: 12 }}>*/}
      {/*  <UserListCards />*/}
      {/*</Grid>*/}
      <Grid size={{ xs: 12 }}>
        <DeviceListTable tableData={deviceData} />
      </Grid>
    </Grid>
  )
}

export default DeviceList
