// js/auth_check.js
document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const currentPage = window.location.pathname.split('/').pop(); // Obtém o nome do arquivo atual

    // Páginas que requerem login para ONG
    const ongRestrictedPages = ['publicar_oportunidade.html', 'gerenciar_candidaturas.html', 'ong_dashboard.html'];
    
    // Páginas que requerem login para Voluntário
    const voluntarioRestrictedPages = ['voluntario_dashboard.html', 'minhas_candidaturas.html', 'avaliacoes.html'];

    if (!loggedInUser) {
        // Se não há usuário logado e a página é restrita, redireciona para o login
        if (ongRestrictedPages.includes(currentPage) || voluntarioRestrictedPages.includes(currentPage)) {
            alert('Você precisa estar logado para acessar esta página.');
            window.location.href = 'login.html';
        }
    } else {
        // Se há usuário logado, mas o tipo não corresponde à página restrita
        if (ongRestrictedPages.includes(currentPage) && loggedInUser.tipo !== 'ong') {
            alert('Acesso negado. Esta página é para ONGs.');
            window.location.href = 'voluntario_dashboard.html'; // Ou index.html
        }
        if (voluntarioRestrictedPages.includes(currentPage) && loggedInUser.tipo !== 'voluntario') {
            alert('Acesso negado. Esta página é para Voluntários.');
            window.location.href = 'ong_dashboard.html'; // Ou index.html
        }
        
        // Atualiza a navegação com o nome do usuário logado e opção de sair
        const loginLink = document.querySelector('nav ul li a[href="login.html"]');
        const cadastroLink = document.querySelector('nav ul li a[href="cadastro_voluntario.html"]');
        const navUl = document.querySelector('nav ul');

        if (loginLink && cadastroLink && navUl) {
            loginLink.parentElement.remove(); // Remove o link de Login
            cadastroLink.parentElement.remove(); // Remove o link de Cadastro

            // Adiciona o nome do usuário e o botão Sair
            const userLi = document.createElement('li');
            userLi.innerHTML = `<span>Olá, ${loggedInUser.nome.split(' ')[0]}!</span>`;
            navUl.prepend(userLi); // Adiciona antes dos outros links

            const logoutLi = document.createElement('li');
            logoutLi.innerHTML = `<a href="#" id="logoutButton" class="btn btn-primary">Sair</a>`;
            navUl.append(logoutLi); // Adiciona ao final

            // Adiciona o evento de logout ao botão recém-criado
            const newLogoutButton = document.getElementById('logoutButton');
            if (newLogoutButton) {
                newLogoutButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('loggedInUser');
                    alert('Você foi desconectado.');
                    window.location.href = 'login.html';
                });
            }

            // Esconde/mostra links de navegação específicos do tipo de usuário
            const ongLinks = document.querySelectorAll('nav ul li a[href="ong_dashboard.html"], nav ul li a[href="publicar_oportunidade.html"], nav ul li a[href="gerenciar_candidaturas.html"]');
            const voluntarioLinks = document.querySelectorAll('nav ul li a[href="voluntario_dashboard.html"], nav ul li a[href="minhas_candidaturas.html"], nav ul li a[href="avaliacoes.html"]');

            if (loggedInUser.tipo === 'ong') {
                voluntarioLinks.forEach(link => link.parentElement.style.display = 'none');
            } else if (loggedInUser.tipo === 'voluntario') {
                ongLinks.forEach(link => link.parentElement.style.display = 'none');
            }
        }
    }
});
