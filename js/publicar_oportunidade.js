// js/publicar_oportunidade.js
document.addEventListener('DOMContentLoaded', () => {
    const opportunityForm = document.getElementById('opportunityForm');
    const messageDiv = document.getElementById('message');
    const logoutButton = document.getElementById('logoutButton');

    // Função para lidar com o logout
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser'); // Remove as credenciais de login
            alert('Você foi desconectado.');
            window.location.href = 'login.html'; // Redireciona para a página de login
        });
    }

    if (opportunityForm) {
        opportunityForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            // Obter informações do usuário logado (assumindo que estão no localStorage)
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

            if (!loggedInUser || loggedInUser.tipo !== 'ong') {
                messageDiv.textContent = 'Você precisa estar logado como ONG para publicar oportunidades.';
                messageDiv.style.color = 'red';
                // Redirecionar para login ou exibir pop-up
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }

            const formData = new FormData(opportunityForm);
            const data = Object.fromEntries(formData.entries());
            
            // Adicionar o ong_id aos dados da requisição (IMPORTANTE: O BACKEND DEVE VALIDAR ISSO COM SESSÃO/JWT)
            data.ong_id = loggedInUser.id; 

            try {
                const response = await fetch('http://localhost/voluntech/api/oportunidades.php', { // AJUSTE ESTA URL
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Se estiver usando JWT, adicione o token aqui:
                        // 'Authorization': `Bearer ${loggedInUser.token}` 
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    messageDiv.textContent = result.message;
                    messageDiv.style.color = 'green';
                    opportunityForm.reset(); // Limpa o formulário
                    // Opcional: Redirecionar para o painel da ONG ou lista de oportunidades publicadas
                    // setTimeout(() => { window.location.href = 'ong_dashboard.html'; }, 2000);
                } else {
                    messageDiv.textContent = result.message;
                    messageDiv.style.color = 'red';
                }
            } catch (error) {
                console.error('Erro:', error);
                messageDiv.textContent = 'Ocorreu um erro ao publicar a oportunidade. Por favor, tente novamente.';
                messageDiv.style.color = 'red';
            }
        });
    }
});
