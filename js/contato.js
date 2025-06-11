// js/contato.js
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const messageDiv = document.getElementById('message');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://localhost/voluntech/api/contato.php', { // AJUSTE ESTA URL
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    messageDiv.textContent = result.message;
                    messageDiv.style.color = 'green';
                    contactForm.reset(); // Limpa o formulário
                } else {
                    messageDiv.textContent = result.message;
                    messageDiv.style.color = 'red';
                }
            } catch (error) {
                console.error('Erro:', error);
                messageDiv.textContent = 'Ocorreu um erro ao enviar a mensagem. Por favor, verifique sua conexão.';
                messageDiv.style.color = 'red';
            }
        });
    }
});
