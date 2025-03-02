'use server'

import { getServerSession } from 'next-auth'

import { In } from 'typeorm'

import { AppDataSource } from '@/db/data-source'

import { Device } from '@db/entities/device.entity'
import { User } from '@db/entities/user.entity'


import { authOptions } from '@/libs/auth'
import type { DeviceTypes } from '@/types/admin/deviceTypes'
import { getEndpointSettings } from '@/app/server/admin/settings/actions'

export const isOwnDevice = async (id: number) => {
  const devices = await getOwnDeviceData()

  return devices.find((device: DeviceTypes) => device.id === id)
}

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

export const getMobilesStatus = async () => {
  const mobileEndpoint: any = await getEndpointSettings()

  try {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => controller.abort(), 3000); // 5 seconds timeout

    const res = await fetch(`http://${mobileEndpoint?.endpoint}:9991/api`, {
      method: 'POST',
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        "data": {},
        "fun": "get_device_list",
        "msgid": 0
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        message: "Server not connected",
      }
    }

    const devicesStatus = await res.json();

    return {
      ...devicesStatus,
      success: true,
    };
  } catch (e: any) {
    return {
      success: false,
      message: "Server not connected",
    }
  }
}
