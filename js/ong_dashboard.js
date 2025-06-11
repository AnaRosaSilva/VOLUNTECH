// js/ong_dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const totalOpportunities = document.getElementById('totalOpportunities');
    const newApplications = document.getElementById('newApplications');
    const totalReviews = document.getElementById('totalReviews');
    const opportunitiesList = document.getElementById('opportunitiesList');

    // Autenticação (reutilizando a lógica de auth_check.js, mas aqui forçamos o redirecionamento se não for ONG)
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser || loggedInUser.tipo !== 'ong') {
        alert('Você precisa estar logado como ONG para acessar este painel.');
        window.location.href = 'login.html'; // Redireciona para o login
        return; // Sai da função
    }

    // Atualiza a mensagem de boas-vindas
    welcomeMessage.textContent = `Bem-vindo(a), ${loggedInUser.nome}!`;

    try {
        const response = await fetch('http://localhost/voluntech/api/ong/dashboard.php', { // AJUSTE ESTA URL
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Se estiver usando JWT, adicione o token aqui:
                // 'Authorization': `Bearer ${loggedInUser.token}` 
            }
        });

        const result = await response.json();

        if (result.success) {
            const data = result.data;
            totalOpportunities.textContent = data.totalOpportunities;
            newApplications.textContent = data.newApplications;
            totalReviews.textContent = data.totalReviews;

            opportunitiesList.innerHTML = ''; // Limpa a mensagem de carregamento

            if (data.recentOpportunities.length > 0) {
                data.recentOpportunities.forEach(opportunity => {
                    const opportunityItem = document.createElement('div');
                    opportunityItem.classList.add('opportunity-item');
                    opportunityItem.innerHTML = `
                        <h4>${opportunity.titulo}</h4>
                        <p><strong>Local:</strong> ${opportunity.local_evento}</p>
                        <p><strong>Data:</strong> ${new Date(opportunity.data_evento).toLocaleDateString('pt-BR')}</p>
                        <p>${opportunity.descricao.substring(0, 100)}...</p>
                        <a href="detalhes_oportunidade.html?id=${opportunity.id}" class="details-link">Ver detalhes e candidaturas</a>
                    `;
                    opportunitiesList.appendChild(opportunityItem);
                });
            } else {
                opportunitiesList.innerHTML = '<p>Nenhuma oportunidade publicada ainda. <a href="publicar_oportunidade.html">Publicar agora</a></p>';
            }

        } else {
            opportunitiesList.innerHTML = `<p style="color: red;">Erro ao carregar dados: ${result.message}</p>`;
            console.error('Erro ao carregar dashboard:', result.message);
        }
    } catch (error) {
        opportunitiesList.innerHTML = '<p style="color: red;">Ocorreu um erro ao conectar com o servidor.</p>';
        console.error('Erro de conexão:', error);
    }
});
