import { getServerSession } from 'next-auth'

import { Profile } from '@views/user/profile/profile'

import { authOptions } from '@/libs/auth'

const Page = async () => {
  const session = await getServerSession(authOptions);

  return <Profile session={session} />
}

export default Page
