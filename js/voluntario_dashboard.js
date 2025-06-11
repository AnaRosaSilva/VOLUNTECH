// js/voluntario_dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const pendingApplications = document.getElementById('pendingApplications');
    const approvedApplications = document.getElementById('approvedApplications');
    const availableCertificates = document.getElementById('availableCertificates');
    const recommendedOpportunitiesList = document.getElementById('recommendedOpportunitiesList');

    // Autenticação (reutilizando a lógica de auth_check.js, mas aqui forçamos o redirecionamento se não for voluntário)
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser || loggedInUser.tipo !== 'voluntario') {
        alert('Você precisa estar logado como Voluntário para acessar este painel.');
        window.location.href = 'login.html'; // Redireciona para o login
        return; // Sai da função
    }

    // Atualiza a mensagem de boas-vindas
    welcomeMessage.textContent = `Bem-vindo(a), ${loggedInUser.nome}!`;

    try {
        const response = await fetch('http://localhost/voluntech/api/voluntario/dashboard.php', { // AJUSTE ESTA URL
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
            pendingApplications.textContent = data.pendingApplications;
            approvedApplications.textContent = data.approvedApplications;
            availableCertificates.textContent = data.availableCertificates;

            recommendedOpportunitiesList.innerHTML = ''; // Limpa a mensagem de carregamento

            if (data.recommendedOpportunities.length > 0) {
                data.recommendedOpportunities.forEach(opportunity => {
                    const opportunityCard = document.createElement('div');
                    opportunityCard.classList.add('opportunity-card');
                    opportunityCard.innerHTML = `
                        <h4>${opportunity.titulo}</h4>
                        <p class="ong-name"><strong>ONG:</strong> ${opportunity.ong_nome}</p>
                        <p><strong>Local:</strong> ${opportunity.local_evento}</p>
                        <p><strong>Data:</strong> ${new Date(opportunity.data_evento + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        <p>${opportunity.descricao.substring(0, 150)}...</p>
                        <a href="detalhes_oportunidade.html?id=${opportunity.id}" class="details-link">Ver Detalhes</a>
                    `;
                    recommendedOpportunitiesList.appendChild(opportunityCard);
                });
            } else {
                recommendedOpportunitiesList.innerHTML = '<p>Não há recomendações de oportunidades no momento. <a href="buscar_oportunidades.html">Explore todas as oportunidades</a></p>';
            }

        } else {
            recommendedOpportunitiesList.innerHTML = `<p style="color: red;">Erro ao carregar dados: ${result.message}</p>`;
            console.error('Erro ao carregar dashboard:', result.message);
        }
    } catch (error) {
        recommendedOpportunitiesList.innerHTML = '<p style="color: red;">Ocorreu um erro ao conectar com o servidor.</p>';
        console.error('Erro de conexão:', error);
    }
});
