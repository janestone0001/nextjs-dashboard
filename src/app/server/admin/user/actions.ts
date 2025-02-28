'use server'

import bcrypt from 'bcrypt'

import { getServerSession } from 'next-auth'

import type { UsersType } from '@/types/admin/userTypes'
import { AppDataSource } from '@/db/data-source'

import { User } from '@db/entities/user.entity'


import { authOptions } from '@/libs/auth'

export const getUserData = async () => {
  const session = await getServerSession(authOptions);

  if (!session || session?.user?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const userRepository = AppDataSource.getRepository(User)

  const users: User[] | null = await userRepository.find({
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      role: true,
      mobile: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  await AppDataSource.destroy()

  return JSON.parse(JSON.stringify(users))
}

export const createUserData = async (newUser: UsersType) => {
  const session = await getServerSession(authOptions);

  if (!session || session?.user?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const userRepository = AppDataSource.getRepository(User)
  const isExist = await userRepository.findOne({ where: { email: newUser.email } })

  //isExsit
  if (isExist) {
    const response = JSON.stringify({
      message: ['User Exists with email!']
    })

    throw new Error(response)
  }

  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.mobile as string, salt, async (err, hash) => {

        if (err) {
          reject(JSON.stringify(err))
        }

        try {
          await userRepository.save({
            name: newUser?.name,
            password: hash,
            email: newUser?.email,
            role: newUser?.role,
            isActive: newUser?.isActive,
            mobile: newUser?.mobile
          })

          resolve({
            success: true,
          })
        } catch (e: any) {
          reject(e.message)
        }
      })

    })
  })
}

export const updateUserData = async (newUser: UsersType, id: number) => {
  const session = await getServerSession(authOptions);

  if (!session || session?.user?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const userRepository = AppDataSource.getRepository(User)

  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.mobile as string, salt, async (err, hash) => {

        if (err) {
          reject(JSON.stringify(err))
        }

        try {
          await userRepository.update(id, {
            ...newUser,
            password: hash
          });

          resolve({
            success: true,
          })
        } catch (e: any) {
          reject(e.message)
        }
      })

    })
  })
}

export const removeUserData = async (id: number) => {
  const session = await getServerSession(authOptions);

  if (!session || session?.user?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  try {
    const userRepository = AppDataSource.getRepository(User)

    await userRepository.delete({ id })

    return {
      success: true,
    }
  } catch(e: any) {
    throw new Error(e.message)
  }


}
