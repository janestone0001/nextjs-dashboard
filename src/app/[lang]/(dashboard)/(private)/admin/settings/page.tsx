import { getEndpointSettings } from '@/app/server/admin/settings/actions'
import { Settings } from '@views/admin/settings/settings'


const Page = async () => {
  const settings: any = await getEndpointSettings()

  return <Settings settings={settings} />
}

export default Page
