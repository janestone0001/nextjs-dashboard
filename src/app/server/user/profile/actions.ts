"use server"

import { getServerSession } from 'next-auth'

import bcrypt, { compare } from 'bcrypt'

import { authOptions } from '@/libs/auth'
import { AppDataSource } from '@/db/data-source'
import { User } from '@db/entities/user.entity'

type IProfile = {
  name: string
  currentpassword: string
  newpassword: string
}

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,32}$/;

export const updateProfile = async (profile: IProfile) => {
  const session = await getServerSession(authOptions)

  if(!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const userRepository = AppDataSource.getRepository(User)

  if(session?.user?.email)  {
    const user: User | null = await userRepository.findOne({ where: { email: session?.user?.email }})

    if(user) {
      const isPasswordValid: boolean = await compare(profile.currentpassword, user.password)

      if(isPasswordValid) {
        if(profile.newpassword) {
          if(!strongPasswordRegex.test(profile.newpassword)) {
            return {
              success: false,
              msg: 'Invalid password',
              newpassword: true
            }
          } else {
            return new Promise(async (resolve, reject) => {
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(profile.newpassword as string, salt, async (err, hash) => {

                  if (err) {
                    reject(JSON.stringify(err))
                  }

                  try {
                    await userRepository.update(user.id, {
                      name: profile.name,
                      password: hash
                    })

                    resolve({
                      success: true,
                    })
                  } catch (e: any) {
                    reject({
                      success: false,
                      msg: e.message
                    })
                  }
                })
              })
            })
          }
        } else {
          return {
            success: false,
            msg: 'New password is not matched',
            newpassword: true
          }
        }
      } else {
        if(!profile.currentpassword && !profile.newpassword) {
          await userRepository.update(user.id, {
            name: profile.name,
          })

          return {
            success: true,
          }
        } else {
          return {
            success: false,
            msg: 'Wrong password'
          }
        }
      }
    } else {
      throw new Error(`Cannot find user with email ${session?.user?.email}`)
    }
  } else {
    throw new Error(`Unauthorized`)
  }

}
