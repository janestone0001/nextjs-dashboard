'use server'

import { getServerSession } from 'next-auth'

import { In } from 'typeorm'

import { AppDataSource } from '@/db/data-source'

import { Device } from '@db/entities/device.entity'
import { User } from '@db/entities/user.entity'


import { authOptions } from '@/libs/auth'

export const getOwnDeviceData = async () => {
  const session = await getServerSession(authOptions);

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  try {
    const userRepository = AppDataSource.getRepository(User)

    if(session?.user?.email) {
      const user: User | null = await userRepository.findOne({ where: { email: session?.user?.email } })

      if(user) {
        const linkedmobiles = JSON.parse(user?.mobile);

        const deviceRepository = AppDataSource.getRepository(Device)

        const mobiles: Device[] | null = await deviceRepository.findBy({
          id: In(linkedmobiles)
        })

        await AppDataSource.destroy()

        return JSON.parse(JSON.stringify(mobiles))
      }
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}
