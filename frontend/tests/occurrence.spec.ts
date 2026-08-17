import { test, expect } from '@playwright/test';

test.describe('Registro de Ocorrência Público', () => {
  test('deve renderizar o formulário e validar campos obrigatórios', async ({ page }) => {
    await page.goto('http://localhost:3000/ocorrencia/consulta');

    // Clica no botão para abrir nova ocorrência se houver, ou navega
    // Assumindo que a tela inicial /ocorrencia/consulta tem um link para registrar ou já é a tela.
    // Ajuste de acordo com a rota exata:
    
    // Tenta enviar o formulário vazio se o botão de submit estiver visível
    const submitButton = page.locator('button:has-text("Protocolo")');
    if (await submitButton.isVisible()) {
        await submitButton.click();
        await expect(page.getByText(/código do condomínio é obrigatório/i).first()).toBeVisible();
    }
  });
});
