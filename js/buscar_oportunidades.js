// js/buscar_oportunidades.js
document.addEventListener('DOMContentLoaded', () => {
    const searchTermInput = document.getElementById('searchTerm');
    const filterLocationInput = document.getElementById('filterLocation');
    const filterDateInput = document.getElementById('filterDate');
    const applyFiltersButton = document.getElementById('applyFilters');
    const clearFiltersButton = document.getElementById('clearFilters');
    const opportunitiesContainer = document.getElementById('opportunitiesContainer');
    const noResultsMessage = document.getElementById('noResultsMessage');

    async function fetchOpportunities() {
        opportunitiesContainer.innerHTML = '<p>Carregando oportunidades...</p>';
        noResultsMessage.style.display = 'none';

        const searchTerm = searchTermInput.value;
        const filterLocation = filterLocationInput.value;
        const filterDate = filterDateInput.value; // Formato YYYY-MM-DD

        // Constrói a URL da API com os parâmetros de busca
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append('searchTerm', searchTerm);
        if (filterLocation) queryParams.append('filterLocation', filterLocation);
        if (filterDate) queryParams.append('filterDate', filterDate);

        const apiUrl = `http://localhost/voluntech/api/oportunidades.php?${queryParams.toString()}`; // AJUSTE ESTA URL

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                opportunitiesContainer.innerHTML = ''; // Limpa o conteúdo
                if (result.data.length > 0) {
                    result.data.forEach(opportunity => {
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
                        opportunitiesContainer.appendChild(opportunityCard);
                    });
                } else {
                    noResultsMessage.style.display = 'block';
                }
            } else {
                opportunitiesContainer.innerHTML = `<p style="color: red;">Erro ao carregar oportunidades: ${result.message}</p>`;
                console.error('Erro na API:', result.message);
            }
        } catch (error) {
            opportunitiesContainer.innerHTML = '<p style="color: red;">Ocorreu um erro ao conectar com o servidor.</p>';
            console.error('Erro de conexão:', error);
        }
    }

    // Event Listeners para os botões de filtro
    applyFiltersButton.addEventListener('click', fetchOpportunities);
    clearFiltersButton.addEventListener('click', () => {
        searchTermInput.value = '';
        filterLocationInput.value = '';
        filterDateInput.value = '';
        fetchOpportunities(); // Recarrega todas as oportunidades sem filtros
    });

    // Carrega as oportunidades ao carregar a página
    fetchOpportunities();
});
