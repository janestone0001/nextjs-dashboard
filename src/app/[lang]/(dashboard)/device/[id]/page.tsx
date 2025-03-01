import { redirect } from 'next/navigation'

import { isOwnDevice } from '@/app/server/user/device/actions'
import { Device } from '@views/user/device/device'


const Page = async ({ params }: {params: Promise<{id: number}>}) => {
  const { id } = await params;

  const device = await isOwnDevice(Number(id))

  if(!device) redirect('/pages/misc/401-not-authorized')

  return <Device device={device} />
}

export default Page
