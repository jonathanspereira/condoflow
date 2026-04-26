import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RegistrarOcorrencia from '../OcorrenciaForm'

// Mock do useRouter do Next.js
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('RegistrarOcorrencia Form', () => {
  it('deve exibir erro de validação se o código do condomínio estiver vazio', async () => {
    render(<RegistrarOcorrencia isAnonimo={true} />)
    
    const submitButton = screen.getByRole('button', { name: /gerar protocolo e enviar/i })
    fireEvent.click(submitButton)

    const errorMessage = await screen.findByText(/o código do condomínio é obrigatório/i)
    expect(errorMessage).toBeInTheDocument()
  })

  it('deve formatar o código do condomínio para letras maiúsculas automaticamente', () => {
    render(<RegistrarOcorrencia isAnonimo={true} />)
    
    const input = screen.getByPlaceholderText(/ex: solar-123/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'solar-123' } })
    
    expect(input.value).toBe('SOLAR-123')
  })
})