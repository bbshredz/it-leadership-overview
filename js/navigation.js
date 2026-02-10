// ==================== TAB NAVIGATION ====================
const navButtons = document.querySelectorAll('.nav-button');
const profileCards = document.querySelectorAll('.profile-card');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetProfile = button.getAttribute('data-profile');
        
        // Update nav buttons
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        
        // Update profile cards with smooth transition
        profileCards.forEach(card => {
            if (card.id === `profile-${targetProfile}`) {
                card.classList.remove('hidden');
                setTimeout(() => {
                    card.classList.add('active');
                }, 10);
            } else {
                card.classList.add('exiting');
                setTimeout(() => {
                    card.classList.remove('active', 'exiting');
                    card.classList.add('hidden');
                }, 300);
            }
        });

        // Smooth scroll to top of card on mobile
        if (window.innerWidth < 968) {
            document.querySelector('.profile-container').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const activeButton = document.querySelector('.nav-button.active');
        const allButtons = Array.from(navButtons);
        const currentIndex = allButtons.indexOf(activeButton);
        
        let nextIndex;
        if (e.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % allButtons.length;
        } else {
            nextIndex = (currentIndex - 1 + allButtons.length) % allButtons.length;
        }
        
        allButtons[nextIndex].click();
        allButtons[nextIndex].focus();
        e.preventDefault();
    }
});
