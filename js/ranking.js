// js/ranking.js
document.addEventListener('DOMContentLoaded', async () => {
    const rankingTableBody = document.querySelector('#rankingTable tbody');
    const noRankingMessage = document.getElementById('noRankingMessage');

    async function fetchRanking() {
        rankingTableBody.innerHTML = '<tr><td colspan="4">Carregando ranking...</td></tr>';
        noRankingMessage.style.display = 'none';

        try {
            const response = await fetch('http://localhost/voluntech/api/ranking.php', { // AJUSTE ESTA URL
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                rankingTableBody.innerHTML = ''; // Limpa o conteúdo
                if (result.data.length > 0) {
                    result.data.forEach((volunteer, index) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${volunteer.voluntario_nome}</td>
                            <td>${volunteer.atividades_concluidas}</td>
                            <td>${volunteer.ongs_ajudadas}</td>
                        `;
                        rankingTableBody.appendChild(row);
                    });
                } else {
                    noRankingMessage.style.display = 'block';
                }
            } else {
                rankingTableBody.innerHTML = `<tr><td colspan="4" style="color: red;">Erro ao carregar ranking: ${result.message}</td></tr>`;
                console.error('Erro na API:', result.message);
            }
        } catch (error) {
            rankingTableBody.innerHTML = `<tr><td colspan="4" style="color: red;">Ocorreu um erro ao conectar com o servidor.</td></tr>`;
            console.error('Erro de conexão:', error);
        }
    }

    fetchRanking();
});
