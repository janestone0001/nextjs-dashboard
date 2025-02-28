// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
import CustomChip from '@core/components/mui/Chip'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
// import menuData from '@/data/navigation/verticalMenuData'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void,
  role: string | undefined
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu, role }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        openSubmenu={[]}
      >
        <SubMenu
          label={dictionary['navigation'].dashboard}
          icon={<i className='tabler-user' />}
          suffix={<CustomChip label='5' size='small' color='error' round='true' />}
        >
          <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].advancedSearch}</MenuItem>
          <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].subscription}</MenuItem>
          <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].support}</MenuItem>
          <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].privacyPolicy}</MenuItem>
          <SubMenu label={dictionary['navigation'].userAccount}>
          </SubMenu>
        </SubMenu>
        {
          role === "admin" && (
            <>
              <MenuSection label={dictionary['navigation'].mamageDevices}>
                <MenuItem icon={<i className='tabler-devices' /> } href={`/${locale}/admin/devices/list`}>{dictionary['navigation'].manageDevice}</MenuItem>
              </MenuSection>
              <MenuSection label={dictionary['navigation'].adminPanel}>
                <SubMenu label={dictionary['navigation'].administrator} icon={<i className='tabler-lock' />}>
                  <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].settings}</MenuItem>
                  <MenuItem href={`/${locale}/admin/user/list`}>{dictionary['navigation'].userManagement}</MenuItem>
                  <MenuItem href={`/${locale}/#`}>
                    {dictionary['navigation'].affiliateSettings}
                  </MenuItem>
                  <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].content}</MenuItem>
                  <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].notification}</MenuItem>
                  <MenuItem href={`/${locale}/#`}>{dictionary['navigation'].logs}</MenuItem>
                </SubMenu>
              </MenuSection>
            </>
          )
        }
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
