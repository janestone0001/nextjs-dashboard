"use client"

// MUI Imports
import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Types Imports
import { valibotResolver } from '@hookform/resolvers/valibot'

import { mac, minLength, object, pipe, string } from 'valibot'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

import type { DeviceTypes } from '@/types/admin/deviceTypes'
import { createDeviceData, updateDeviceData } from '@/app/server/admin/device/actions'

type Props = {
  open: boolean
  handleClose: () => void
  deviceData?: DeviceTypes[]
  setData: (data: DeviceTypes[]) => void
  selectedDevice: DeviceTypes | undefined
}

type FormValidateType = {
  name: string
  device: string
  note: string
}

type ErrorType = {
  message: string[]
}

const schema = object({
  name: pipe(string(), minLength(1, 'This field is required')),
  device: pipe(string(), minLength(1, 'This field is required'), mac()),
  note: pipe(string(), minLength(1, 'This field is required')),
})

const AddDeviceDrawer = (props: Props) => {
  // Props
  const { open, handleClose, deviceData, setData, selectedDevice } = props
  const [errorState, setErrorState] = useState<ErrorType | null>(null)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: '',
      device: '',
      note: '',
    }
  })

  useEffect(() => {
    resetForm({
      name: selectedDevice?.name || '',
      device: selectedDevice?.device || '',
      note: selectedDevice?.note || ''
    });
  }, [selectedDevice, resetForm])

  const onSubmit = async (data: FormValidateType) => {
    const newDevice: DeviceTypes = {
      name: data.name,
      device: data.device,
      note: data.note,
    }

    if(!selectedDevice) {
      await createDeviceData(newDevice)
        .then((res: any) => {

          if(res.success) {
            setData([...(deviceData ?? []), newDevice])

            handleClose()

            // setFormData(initialData)

            resetForm({ name: '', device: '', note: '' })
          }
        }).catch(err => {
          const errMessage = JSON.parse(err.message);

          setErrorState(errMessage)
        });
    } else {
      await updateDeviceData(newDevice, selectedDevice.id as number)
        .then((res: any) => {

          if(deviceData && res.success) {
            setData(deviceData?.map((product: DeviceTypes) => product.device === newDevice.device ? { ...newDevice, id: selectedDevice.id } : product));

            handleClose()

            resetForm({ name: '', device: '', note: '' })
          }
        }).catch(err => {
          setErrorState(err)
        });
    }

  }

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
        <Typography variant='h5'>{ selectedDevice ? 'Update User' : 'Add New User' }</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form noValidate autoComplete='off' onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-6 p-6'>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Device Name'
                placeholder='iPhone 13 Green'
                {...(errors.name && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='device'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Device'
                placeholder='12:34:45:6C:34:23'
                onChange={e => {
                  field.onChange(e.target.value)
                  errorState !== null && setErrorState(null)
                }}
                {...((errors.device || errorState !== null) && {
                  error: true,
                  helperText: errors?.device?.message || errorState?.message[0]
                })}
              />
            )}
          />
          <Controller
            name='note'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                rows={4}
                multiline
                label='Note'
                placeholder=''
                onChange={e => {
                  field.onChange(e.target.value)
                  errorState !== null && setErrorState(null)
                }}
                {...((errors.note || errorState !== null) && {
                  error: true,
                  helperText: errors?.note?.message || errorState?.message[0]
                })}
              />
            )}
          />
          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit'>
              { selectedDevice ? 'Update' : 'Create' }
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

export default AddDeviceDrawer
