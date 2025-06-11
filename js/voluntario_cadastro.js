// js/voluntario_cadastro.js
document.addEventListener('DOMContentLoaded', () => {
    const voluntarioRegistrationForm = document.getElementById('voluntarioRegistrationForm');
    const messageDiv = document.getElementById('message');

    if (voluntarioRegistrationForm) {
        voluntarioRegistrationForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            // Coleta os dados do formulário
            const formData = new FormData(voluntarioRegistrationForm);
            const data = Object.fromEntries(formData.entries()); // Converte FormData para um objeto JSON

            try {
                // Envia os dados para o endpoint da API PHP
                const response = await fetch('localhost/api/voluntario/cadastro.php', { // AJUSTE ESTA URL para o seu ambiente local
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Informa que o corpo da requisição é JSON
                    },
                    body: JSON.stringify(data) // Converte o objeto JavaScript para uma string JSON
                });

                const result = await response.json(); // Analisa a resposta JSON da API

                if (result.success) {
                    messageDiv.textContent = result.message;
                    messageDiv.style.color = 'green';
                    voluntarioRegistrationForm.reset(); // Limpa o formulário em caso de sucesso
                } else {
                    messageDiv.textContent = result.message;
                    messageDiv.style.color = 'red';
                }
            } catch (error) {
                console.error('Erro:', error);
                messageDiv.textContent = 'Ocorreu um erro durante o cadastro. Por favor, tente novamente.';
                messageDiv.style.color = 'red';
            }
        });
    }
});
