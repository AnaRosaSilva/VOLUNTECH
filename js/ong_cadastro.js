// js/ong_cadastro.js
document.addEventListener('DOMContentLoaded', () => {
    const ongRegistrationForm = document.getElementById('ongRegistrationForm');
    const messageDiv = document.getElementById('message');

    if (ongRegistrationForm) {
        ongRegistrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(ongRegistrationForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://localhost/voluntech/api/ong/cadastro.php', { // Ajuste a URL
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
                    ongRegistrationForm.reset(); // Limpa o formulário
                } else {
                    messageDiv.textContent = result.message;
                    messageDiv.style.color = 'red';
                }
            } catch (error) {
                console.error('Erro:', error);
                messageDiv.textContent = 'Ocorreu um erro durante o registro. Por favor, tente novamente.';
                messageDiv.style.color = 'red';
            }
        });
    }
});
