// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { UsersType } from '@/types/admin/userTypes'

// Component Imports
import UserListTable from './UserListTable'
import type { DeviceTypes } from '@/types/admin/deviceTypes'

// import UserListCards from './UserListCards'

const UserList = ({ userData, deviceData }: { userData?: UsersType[]; deviceData: DeviceTypes[] }) => {
  return (
    <Grid container spacing={6}>
      {/*<Grid size={{ xs: 12 }}>*/}
      {/*  <UserListCards />*/}
      {/*</Grid>*/}
      <Grid size={{ xs: 12 }}>
        <UserListTable tableData={userData} deviceData={deviceData} />
      </Grid>
    </Grid>
  )
}

export default UserList
