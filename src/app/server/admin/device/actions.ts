'use server'

import { getServerSession } from 'next-auth'

import type { DeviceTypes } from '@/types/admin/deviceTypes'
import { AppDataSource } from '@/db/data-source'

import { Device } from '@db/entities/device.entity'


import { authOptions } from '@/libs/auth'

export const getDeviceData = async () => {
  const session = await getServerSession(authOptions);

  if (!session || session?.user?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const deviceRepository = AppDataSource.getRepository(Device)

  const users: Device[] | null = await deviceRepository.find()

  await AppDataSource.destroy()

  return JSON.parse(JSON.stringify(users))
}

export const createDeviceData = async (newDevice: DeviceTypes) => {
  const session = await getServerSession(authOptions);

  if (!session || session?.user?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const deviceRepository = AppDataSource.getRepository(Device)
  const isExist = await deviceRepository.findOne({ where: { device: newDevice.device } })

  //isExsit
  if (isExist) {
    const response = JSON.stringify({
      message: ['Device Exists with address!']
    })

    throw new Error(response)
  }

  try {
    await deviceRepository.save({
      name: newDevice?.name,
      device: newDevice?.device,
      note: newDevice?.note,
    })

    return {
      success: true,
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const updateDeviceData = async (newDevice: DeviceTypes, id: number) => {
  const session = await getServerSession(authOptions);

  if (!session || session?.user?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const deviceRepository = AppDataSource.getRepository(Device)

  try {
    await deviceRepository.update(id, {
      ...newDevice,
    });

    return {
      success: true,
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const removeDeviceData = async (id: number) => {
  const session = await getServerSession(authOptions);

  if (!session || session?.user?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  try {
    const deviceRepository = AppDataSource.getRepository(Device)

    await deviceRepository.delete({ id })

    return {
      success: true,
    }
  } catch(e: any) {
    throw new Error(e.message)
  }

}
