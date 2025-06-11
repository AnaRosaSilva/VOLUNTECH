// js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://localhost/voluntech/api/login.php', { // AJUSTE ESTA URL
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
                    loginForm.reset(); // Limpa o formulário

                    // AQUI VOCÊ FARIA O REDIRECIONAMENTO OU ARMAZENAMENTO DE SESSÃO/TOKEN
                    console.log('Login bem-sucedido! Tipo de usuário:', result.user.tipo);
                    console.log('ID do usuário:', result.user.id);

                    // Exemplo de redirecionamento baseado no tipo de usuário
                    if (result.user.tipo === 'voluntario') {
                        // Exemplo: Armazenar informações no localStorage (para persistência do login)
                        localStorage.setItem('loggedInUser', JSON.stringify(result.user));
                        window.location.href = 'voluntario_dashboard.html'; // Redireciona para o painel do voluntário
                    } else if (result.user.tipo === 'ong') {
                        localStorage.setItem('loggedInUser', JSON.stringify(result.user));
                        window.location.href = 'ong_dashboard.html'; // Redireciona para o painel da ONG
                    }
                    
                } else {
                    messageDiv.textContent = result.message;
                    messageDiv.style.color = 'red';
                }
            } catch (error) {
                console.error('Erro:', error);
                messageDiv.textContent = 'Ocorreu um erro durante o login. Por favor, tente novamente.';
                messageDiv.style.color = 'red';
            }
        });
    }
});
