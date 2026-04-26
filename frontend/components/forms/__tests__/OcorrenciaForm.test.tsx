import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RegistrarOcorrencia from '../OcorrenciaForm'

// --- MOCKS DE AMBIENTE (JSDOM FIXES) ---
Element.prototype.scrollIntoView = vi.fn()

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock

// Mock do useRouter do Next.js
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('RegistrarOcorrencia Form - 100% Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve realizar o fluxo completo de envio com sucesso (Caminho Feliz)', async () => {
    render(<RegistrarOcorrencia isAnonimo={true} />)

    // 1. Código do Condomínio
    const inputCodigo = screen.getByPlaceholderText(/ex: solar-123/i)
    fireEvent.change(inputCodigo, { target: { value: 'solar-123' } })
    expect(inputCodigo).toHaveValue('SOLAR-123')

    // 2. Categoria (Ajustado para evitar erro de múltiplos elementos)
    const selectTrigger = screen.getByRole('combobox')
    fireEvent.click(selectTrigger)
    
    // O Radix renderiza um <option> e um <span>. Pegamos o visível.
    const opcoes = await screen.findAllByText(/manutenção/i)
    fireEvent.click(opcoes[opcoes.length - 1])

    // 3. Unidade Relacionada
    const inputUnidade = screen.getByPlaceholderText(/ex: apto 64/i)
    fireEvent.change(inputUnidade, { target: { value: 'Apto 101' } })

    // 4. Título
    const inputTitulo = screen.getByPlaceholderText(/ex: vazamento no teto da garagem/i)
    fireEvent.change(inputTitulo, { target: { value: 'Infiltração na garagem' } })

    // 5. Descrição
    const inputDesc = screen.getByPlaceholderText(/conte-nos mais detalhes/i)
    fireEvent.change(inputDesc, { target: { value: 'Vazamento constante vindo do teto do bloco A.' } })

    // 6. E-mail de Notificação (Opcional)
    const inputEmail = screen.getByPlaceholderText(/seu@email.com/i)
    fireEvent.change(inputEmail, { target: { value: 'morador@email.com' } })

    // 7. Submissão (Cobre onSubmit e redirecionamento)
    const submitButton = screen.getByRole('button', { name: /gerar protocolo e enviar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/ocorrencia/sucesso')
    })
  })

  it('deve interagir com o Switch de privacidade no modo identificado', () => {
    render(<RegistrarOcorrencia isAnonimo={false} />)
    
    const switchPrivacidade = screen.getByRole('switch')
    expect(switchPrivacidade).toHaveAttribute('aria-checked', 'false')
    
    fireEvent.click(switchPrivacidade)
    expect(switchPrivacidade).toHaveAttribute('aria-checked', 'true')
  })

  it('deve validar erros obrigatórios e tamanho de caracteres', async () => {
    render(<RegistrarOcorrencia isAnonimo={true} />)
    
    const submitButton = screen.getByRole('button', { name: /gerar protocolo e enviar/i })
    fireEvent.click(submitButton)

    // Erros iniciais
    expect(await screen.findByText(/o código do condomínio é obrigatório/i)).toBeInTheDocument()
    
    // Erro de título curto
    const inputTitulo = screen.getByPlaceholderText(/ex: vazamento no teto da garagem/i)
    fireEvent.change(inputTitulo, { target: { value: 'abc' } })
    fireEvent.click(submitButton)
    
    expect(await screen.findByText(/título deve ter pelo menos 5 caracteres/i)).toBeInTheDocument()
  })
})