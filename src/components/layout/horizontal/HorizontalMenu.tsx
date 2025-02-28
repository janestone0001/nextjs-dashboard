// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import HorizontalNav, { Menu, SubMenu, MenuItem } from '@menu/horizontal-menu'
import VerticalNavContent from './VerticalNavContent'
import CustomChip from '@core/components/mui/Chip'

// import { GenerateHorizontalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalMenuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
// import menuData from '@/data/navigation/horizontalMenuData'

type RenderExpandIconProps = {
  level?: number
}

type RenderVerticalExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ level }: RenderExpandIconProps) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='tabler-chevron-right' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }: RenderVerticalExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const HorizontalMenu = ({ dictionary, role }: { dictionary: Awaited<ReturnType<typeof getDictionary>>; role: string | undefined }) => {
  // Hooks
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  const params = useParams()

  // Vars
  const { transitionDuration } = verticalNavOptions
  const { lang: locale } = params

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={VerticalNavContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor: 'var(--mui-palette-background-paper)'
      }}
    >
      <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        menuItemStyles={menuItemStyles(theme, 'tabler-circle')}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 14 : 12),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='tabler-circle text-xs' /> },
          menuSectionStyles: verticalMenuSectionStyles(verticalNavOptions, theme)
        }}
      >
        <SubMenu
          label={dictionary['navigation'].dashboard}
          icon={<i className='tabler-user' />}
          suffix={<CustomChip label='5' size='small' color='error' round='true' />}
        >
          <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].myDevice}</MenuItem>
          <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].subscription}</MenuItem>
          <SubMenu label={dictionary['navigation'].userAccount}>
          </SubMenu>
        </SubMenu>
        {
          role === 'admin' && (
            <>
              <SubMenu label={dictionary['navigation'].administrator} icon={<i className='tabler-lock' />}>
                <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].settings}</MenuItem>
                <MenuItem href={`/${locale}/admin/user/list`}>{dictionary['navigation'].userManagement}</MenuItem>
                <MenuItem href={`/${locale}/admin/devices/list`}>{dictionary['navigation'].manageDevice}</MenuItem>
                <MenuItem href={`/${locale}/#`}>
                  {dictionary['navigation'].affiliateSettings}
                </MenuItem>
                <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].content}</MenuItem>
                <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].notification}</MenuItem>
                <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].logs}</MenuItem>
              </SubMenu>
            </>
          )
        }
      </Menu>
    </HorizontalNav>
  )
}

export default HorizontalMenu
