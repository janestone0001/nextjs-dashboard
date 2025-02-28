"use client"

// MUI Imports
import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Types Imports
import { valibotResolver } from '@hookform/resolvers/valibot'

import { email, minLength, object, pipe, string } from 'valibot'

import InputAdornment from '@mui/material/InputAdornment'

import type { UsersType } from '@/types/admin/userTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@core/components/mui/Autocomplete'

import { createUserData, updateUserData } from '@/app/server/admin/user/actions'
import type { DeviceTypes } from '@/types/admin/deviceTypes'


type Props = {
  open: boolean
  handleClose: () => void
  userData?: UsersType[]
  setData: (data: UsersType[]) => void
  selectedUser: UsersType | undefined
  deviceData: DeviceTypes[]
}

type FormValidateType = {
  username: string
  email: string
  role: string
  isActive: string
  mobile?: string
}

type ErrorType = {
  message: string[]
}

const schema = object({
  email: pipe(string(), minLength(1, 'This field is required'), email('Email is invalid')),
  username: pipe(string(), minLength(1, 'This field is required')),
  role: pipe(string(), minLength(1, 'This field is required')),
  isActive: pipe(string(), minLength(1, 'This field is required')),
})

const AddUserDrawer = (props: Props) => {
  // Props
  const { open, handleClose, userData, setData, selectedUser, deviceData } = props
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [mobile, setMobile] = useState<any>([]);

  //State
  const [password, setPassword] = useState<string>("")

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    resolver: valibotResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      role: '',
      isActive: '',
      mobile: ''
    }
  })

  useEffect(() => {
    resetForm({
      username: selectedUser?.name || '',
      email: selectedUser?.email || '',
      role: selectedUser?.role || '',
      isActive: selectedUser?.isActive || '',
      mobile: selectedUser?.mobile || ''
    });
  }, [selectedUser, resetForm])

  useEffect(() => {
    if(selectedUser && selectedUser.mobile) {
      const selectedMobiles = JSON.parse(selectedUser?.mobile);

      if(selectedMobiles.length) {
        setMobile(deviceData.filter((option: DeviceTypes) => {
          if(selectedMobiles.includes(option.id)) {
            return {
              id: option.id,
              name: option.name
            }
          }
        }))
      }
    }
  }, [selectedUser])

  const onSubmit = async (data: FormValidateType) => {
    const newUser: UsersType = {
      name: data.username,
      email: data.email,
      password,
      role: data.role,
      isActive: data.isActive,
      mobile: JSON.stringify(mobile.map((m: any) => m.id))
    }

    if(!selectedUser) {
      if(!newUser.password) {
        setErrorState({ message: ["Please generate new password!"] })
      } else {
        await createUserData(newUser)
          .then((res: any) => {

            if(res.success) {
              setData([...(userData ?? []), newUser])

              handleClose()

              // setFormData(initialData)

              resetForm({ username: '', email: '', role: '', isActive: '' })
            }
          }).catch(err => {
            const errMessage = JSON.parse(err.message);

            setErrorState(errMessage)
          });
      }
    } else {
      await updateUserData(newUser, selectedUser.id as number)
        .then((res: any) => {

          if(userData && res.success) {
            setData(userData?.map((product: UsersType) => product.email === newUser.email ? { ...newUser, id: selectedUser.id } : product));

            handleClose()

            resetForm({ username: '', email: '', role: '', isActive: '' })
          }
        }).catch(err => {
          setErrorState(err)
        });
    }

  }

  const generatePassword = (length = 6) => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

    return Array.from(crypto.getRandomValues(new Uint32Array(length)))
      .map((x) => charset[x % charset.length])
      .join("");
  };

  const handleReset = () => {
    handleClose()

    // setFormData(initialData)
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>{ selectedUser ? 'Update User' : 'Add New User' }</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form noValidate autoComplete='off' onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-6 p-6'>
          <Controller
            name='username'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Username'
                placeholder='johndoe'
                {...(errors.username && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='email'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                autoFocus
                fullWidth
                type='email'
                label='Email'
                placeholder='johndoe@gmail.com'
                onChange={e => {
                  field.onChange(e.target.value)
                  errorState !== null && setErrorState(null)
                }}
                {...((errors.email) && {
                  error: true,
                  helperText: errors?.email?.message
                })}
              />
            )}
          />
          <CustomTextField
            fullWidth
            label='Password'
            placeholder='Generate Password'
            id='login-password'
            type='text'
            disabled
            value={password}
            {...((errorState !== null) && {
              error: true,
              helperText: errorState?.message[0]
            })}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={() => setPassword(generatePassword(16))}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <i className={'tabler-refresh'} />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
          <Controller
            name='role'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                id='select-role'
                label='Select Role'
                {...field}
                {...(errors.role && { error: true, helperText: 'This field is required.' })}
              >
                <MenuItem value='admin'>Admin</MenuItem>
                <MenuItem value='owner'>Owner</MenuItem>
                <MenuItem value='user'>User</MenuItem>
              </CustomTextField>
            )}
          />
          <Controller
            name='isActive'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                id='select-status'
                label='Select Status'
                {...field}
                {...(errors.isActive && { error: true, helperText: 'This field is required.' })}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
              </CustomTextField>
            )}
          />
          <Controller
            name='mobile'
            control={control}
            rules={{ required: true }}
            render={() => (
              <CustomAutocomplete
                multiple
                value={mobile}
                options={deviceData?.map((option: DeviceTypes) => ({
                    id: option.id,
                    name: option.name
                }))}
                id='autocomplete-limit-tags'
                getOptionLabel={option => option.name || ''}
                onChange={(e, value) => setMobile(value)}
                renderInput={params => (
                  <CustomTextField {...params} label='Mobiles' placeholder='Choose mobile' />
                )}
              />
            )}
          />
          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit'>
              { selectedUser ? 'Update' : 'Create' }
            </Button>
            <Button variant='tonal' color='error' type='reset' onClick={() => handleReset()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddUserDrawer
