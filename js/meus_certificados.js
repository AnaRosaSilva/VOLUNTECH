// js/meus_certificados.js
document.addEventListener('DOMContentLoaded', async () => {
    const certificatesContainer = document.getElementById('certificatesContainer');
    const noCertificatesMessage = document.getElementById('noCertificatesMessage');

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser || loggedInUser.tipo !== 'voluntario') {
        alert('Você precisa estar logado como Voluntário para ver seus certificados.');
        window.location.href = 'login.html';
        return;
    }

    async function fetchCertificates() {
        certificatesContainer.innerHTML = '<p>Carregando certificados...</p>';
        noCertificatesMessage.style.display = 'none';

        try {
            const response = await fetch('http://localhost/voluntech/api/certificados.php', { // AJUSTE ESTA URL
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${loggedInUser.token}` // Se estiver usando JWT
                }
            });

            const result = await response.json();

            if (result.success) {
                certificatesContainer.innerHTML = ''; // Limpa o conteúdo
                if (result.data.length > 0) {
                    result.data.forEach(cert => {
                        const certCard = document.createElement('div');
                        certCard.classList.add('opportunity-card'); // Reutilizando estilo de card
                        certCard.innerHTML = `
                            <h4>${cert.titulo}</h4>
                            <p><strong>Oportunidade:</strong> ${cert.oportunidade_titulo}</p>
                            <p><strong>ONG:</strong> ${cert.ong_nome}</p>
                            <p><strong>Emitido em:</strong> ${new Date(cert.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                            <p>${cert.descricao ? cert.descricao.substring(0, 100) + '...' : 'Sem descrição.'}</p>
                            ${cert.caminho_arquivo ? `<a href="${cert.caminho_arquivo}" target="_blank" class="details-link">Baixar Certificado</a>` : `<p style="color:orange;">Certificado disponível em breve.</p>`}
                        `;
                        certificatesContainer.appendChild(certCard);
                    });
                } else {
                    noCertificatesMessage.style.display = 'block';
                }
            } else {
                certificatesContainer.innerHTML = `<p style="color: red;">Erro ao carregar certificados: ${result.message}</p>`;
                console.error('Erro na API:', result.message);
            }
        } catch (error) {
            certificatesContainer.innerHTML = '<p style="color: red;">Ocorreu um erro ao conectar com o servidor.</p>';
            console.error('Erro de conexão:', error);
        }
    }

    fetchCertificates();
});
