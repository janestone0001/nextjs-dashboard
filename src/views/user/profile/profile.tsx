"use client"

import { useEffect, useState } from 'react'
import type { SyntheticEvent } from 'react'

import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth';

import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'

import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { email, type InferInput, minLength, object, pipe, string } from 'valibot'

import CustomTextField from '@core/components/mui/TextField'

import { updateProfile } from '@/app/server/user/profile/actions'

type FormValidateType = {
  name: string
  email: string
  currentpassword: string
  newpassword: string
}

export type SnackbarMessage = {
  key: number
  message: string
}

type FormData = InferInput<typeof schema>

const schema = object({
  name: pipe(string(), minLength(1, 'This field is required')),
  email: pipe(string(), minLength(1, 'This field is required'), email('Email is invalid')),
  currentpassword: pipe(string()),
  newpassword: pipe(string())
})

export const Profile = ({ session }: { session: Session | null }) => {
  //State
  const [open, setOpen] = useState<boolean>(false)
  const [errorState, setErrorState] = useState<any>(null)
  const [newPasswordError, setNewPasswordError] = useState<any>(null)
  const [snackPack, setSnackPack] = useState<SnackbarMessage[]>([])
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage | undefined>(undefined)

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setOpen(true)
      setSnackPack(prev => prev.slice(1))
      setMessageInfo({ ...snackPack[0] })
    } else if (snackPack.length && messageInfo && open) {
      setOpen(false)
    }
  }, [snackPack, messageInfo, open])

  // @ts-ignore
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      currentpassword: '',
      newpassword: ''
    }
  })

  const handleClose = (event: Event | SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const handleExited = () => {
    setMessageInfo(undefined)
  }

  const onSubmit: SubmitHandler<FormData> = async (data: FormValidateType) => {
    const res: any = await updateProfile({
      name: data.name,
      currentpassword: data?.currentpassword || '',
      newpassword: data?.newpassword || ''
    })


    if (res.success) {
      resetForm({
        name: data.name,
        currentpassword: '',
        newpassword: ''
      })

      setSnackPack(prev => [...prev, { message: 'success', key: new Date().getTime() }])

      signOut();

    } else {
      if(Object.keys(res).includes('newpassword')) {
        setNewPasswordError(res.msg)
      } else {
        setErrorState(res.msg)
      }
    }
  }

  return (
    <Paper>
      <div className="p-6">
        <Typography variant="h3" color="textSecondary">
          Profile
        </Typography>
        <div className="mt-4">
          <form noValidate autoComplete='off' onSubmit={handleSubmit(data => onSubmit(data))} className="flex flex-col gap-6">
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Username'
                  placeholder='johndoe'
                  {...(errors.name && { error: true, helperText: errors.name.message })}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  disabled
                  label='Email'
                  placeholder='johndoe@gmail.com'
                  {...(errors.email && { error: true, helperText: errors.email.message })}
                />
              )}
            />
            <Controller
              name="currentpassword"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Current Password'
                  placeholder='············'
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  {...((errors.currentpassword || errorState !== null) && {
                    error: true,
                    helperText: errors?.currentpassword?.message || errorState
                  })}
                />
              )}
            />
            <Controller
              name="newpassword"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='New Password'
                  placeholder='············'
                  onChange={e => {
                    field.onChange(e.target.value)
                    newPasswordError !== null && setNewPasswordError(null)
                  }}
                  {...((errors.newpassword || newPasswordError !== null) && {
                    error: true,
                    helperText: errors?.newpassword?.message || newPasswordError
                  })}
                />
              )}
            />
            <Button variant="contained" color="primary" type="submit">
              Save
            </Button>
          </form>
        </div>
        <Snackbar
          open={open}
          onClose={handleClose}
          autoHideDuration={3000}
          TransitionProps={{ onExited: handleExited }}
          key={messageInfo ? messageInfo.key : undefined}
          message={messageInfo ? messageInfo.message : undefined}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            variant='filled'
            onClose={handleClose}
            className='is-full shadow-xs items-center'
            severity='success'
          >
            Successfully! You need to sign in again.
          </Alert>
        </Snackbar>
      </div>
    </Paper>
  )
}
