"use client"

import { useState } from 'react'

import Typography from '@mui/material/Typography'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'

import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { ipv4, minLength, object, pipe, string } from 'valibot'

import { updateEndpointSettings } from '@/app/server/admin/settings/actions'
import CustomTextField from '@core/components/mui/TextField'

type FormValidateType = {
  endpoint: string
}

const schema = object({
  endpoint: pipe(string(), minLength(1, 'This field is required'), ipv4('This type is invalid')),
})

export const Settings = ({ settings }: {settings: any}) => {
  const [updatedEndpoint, setUpdatedEndpoint] = useState<string>(settings?.endpoint)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    resolver: valibotResolver(schema),
    defaultValues: {
      endpoint: '',
    }
  })

  const onSubmit = async (data: FormValidateType) => {
    const response = await updateEndpointSettings(data.endpoint);

    if (response.success) {
      setUpdatedEndpoint(data.endpoint)
      resetForm({ endpoint: '' })
    }
  }

  return (
    <Card>
      <div className="p-6">
        {
          updatedEndpoint && (
            <Typography variant="h4" color="textSecondary">
              {`http://${updatedEndpoint}:9912`}
            </Typography>
          )
        }
        <div className="mt-4">
          <form noValidate autoComplete='off' onSubmit={handleSubmit(data => onSubmit(data))}>
            <Controller
              control={control}
              name='endpoint'
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  label='Endpoint'
                  placeholder='188.26.61.1'
                  {...(errors.endpoint && { error: true, helperText: errors.endpoint.message })}
                />
              )}
            />
            <Button type="submit" variant='contained' color='primary' className="mt-[19px] ml-2">
              Save
            </Button>
          </form>
        </div>
      </div>
    </Card>
  )
}
