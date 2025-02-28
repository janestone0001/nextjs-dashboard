// Next Imports
import { NextResponse } from 'next/server'

import { compare } from "bcrypt"

import { User } from '@db/entities/user.entity'

import { AppDataSource } from '@/db/data-source'


export async function POST(req: Request) {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const { email, password } = await req.json()

  const userRepository = AppDataSource.getRepository(User)
  const user: User | null = await userRepository.findOne({ where: { email: email } })

  await AppDataSource.destroy()

  if (!user) {
    return NextResponse.json(
      {
        // We create object here to separate each error message for each field in case of multiple errors
        message: ['User not found!']
      },
      {
        status: 404,
        statusText: 'Not Found'
      }
    )
  }

  const isPasswordValid:boolean = await compare(password, user.password)

  if (!isPasswordValid) {
    return NextResponse.json(
      {
        // We create object here to separate each error message for each field in case of multiple errors
        message: ['Email or Password is invalid']
      },
      {
        status: 401,
        statusText: 'Unauthorized Access'
      }
    )
  }

  if(user.isActive === 'inactive') {
    return NextResponse.json(
      {
        // We create object here to separate each error message for each field in case of multiple errors
        message: ['User is deactivate']
      },
      {
        status: 401,
        statusText: 'Unauthorized Access'
      }
    )
  }

  const response =  {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }

  return NextResponse.json(response)
}
