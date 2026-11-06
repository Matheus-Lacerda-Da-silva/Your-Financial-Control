import { useState } from 'react'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material'

type Props = {
  id: string
  label?: string
  value: string
  onChange: (valor: string) => void
  autoComplete: 'current-password' | 'new-password'
  error?: boolean
  helperText?: string
}

export default function CampoSenha({ id, label = 'Senha', value, onChange, autoComplete, error, helperText }: Props) {
  const [visivel, setVisivel] = useState(false)
  return (
    <TextField
      id={id} name={id} label={label} type={visivel ? 'text' : 'password'}
      value={value} onChange={evento => onChange(evento.target.value)}
      autoComplete={autoComplete} required fullWidth error={error} helperText={helperText}
      slotProps={{
        input: {
          endAdornment: <InputAdornment position="end">
            <IconButton aria-label={`${visivel ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`} aria-pressed={visivel} onClick={() => setVisivel(!visivel)} edge="end">
              {visivel ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
            </IconButton>
          </InputAdornment>,
        },
      }}
    />
  )
}
