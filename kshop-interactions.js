// ===============================================
// K-SHOP - INTERACTIONS MODERNES
// ===============================================

// Variables globales
let kshopCurrentOffer = 0;
let kshopOfferInterval;

// Initialisation des interactions K-Shop
function initKShopInteractions() {
    initSearchFunctionality();
    initCategoryInteractions();
    initPartnerCardInteractions();
    initOfferCarousel();
    initFavoriteSystem();
    initScrollAnimations();
}

// Fonctionnalité de recherche
function initSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    const filterBtn = document.querySelector('.search-filter-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterPartners(query);
            
            // Animation de la barre de recherche
            if (query.length > 0) {
                searchInput.parentElement.style.transform = 'scale(1.02)';
                searchInput.parentElement.style.boxShadow = '0 12px 32px rgba(99, 102, 241, 0.2)';
            } else {
                searchInput.parentElement.style.transform = 'scale(1)';
                searchInput.parentElement.style.boxShadow = 'var(--kshop-shadow-md)';
            }
        });
        
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.style.borderColor = 'var(--kshop-primary)';
            searchInput.parentElement.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
        });
        
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            searchInput.parentElement.style.boxShadow = 'var(--kshop-shadow-md)';
        });
    }
    
    if (filterBtn) {
        filterBtn.addEventListener('click', showFilterModal);
    }
}

// Filtrage des partenaires
function filterPartners(query) {
    const partnerCards = document.querySelectorAll('.partner-card-modern');
    const categoryItems = document.querySelectorAll('.category-item');
    
    partnerCards.forEach(card => {
        const name = card.querySelector('h4')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        
        if (name.includes(query) || description.includes(query)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.3s ease-out';
        } else {
            card.style.display = 'none';
        }
    });
    
    categoryItems.forEach(item => {
        const name = item.querySelector('.category-name')?.textContent.toLowerCase() || '';
        
        if (name.includes(query)) {
            item.style.display = 'block';
            item.style.animation = 'fadeInUp 0.3s ease-out';
        } else if (query.length > 0) {
            item.style.opacity = '0.5';
        } else {
            item.style.opacity = '1';
        }
    });
}

// Interactions des catégories
function initCategoryInteractions() {
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;
            selectCategory(category);
            
            // Animation de sélection
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
                item.style.transform = 'translateY(-6px) scale(1.02)';
            }, 150);
            
            // Effet de ripple
            createRippleEffect(item, event);
        });
        
        // Animation d'entrée décalée
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

// Sélection de catégorie
function selectCategory(category) {
    // Filtrer les partenaires par catégorie
    const partnerCards = document.querySelectorAll('.partner-card-modern');
    
    partnerCards.forEach(card => {
        // Ici on pourrait ajouter des data-attributes pour filtrer
        card.style.animation = 'fadeInUp 0.4s ease-out';
    });
    
    showToast(`Catégorie "${category}" sélectionnée`, 'success');
    
    // Smooth scroll vers les partenaires
    const partnersSection = document.querySelector('.recommended-partners');
    if (partnersSection) {
        partnersSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

// Interactions des cartes partenaires
function initPartnerCardInteractions() {
    const partnerCards = document.querySelectorAll('.partner-card-modern');
    
    partnerCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            const partnerName = card.querySelector('h4')?.textContent || 'Partenaire';
            openPartnerDetails(partnerName);
        });
        
        // Animation d'entrée décalée
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Effet parallax sur l'image
        const partnerImg = card.querySelector('.partner-img');
        if (partnerImg) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                partnerImg.style.transform = `scale(1.1) translate(${(x - 0.5) * 10}px, ${(y - 0.5) * 10}px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                partnerImg.style.transform = 'scale(1.1)';
            });
        }
    });
}

// Carrousel d'offres
function initOfferCarousel() {
    const offers = [
        {
            badge: '🔥 Hot Deal',
            title: 'Black Friday',
            description: 'Jusqu\'à -70% sur tous nos partenaires',
            percentage: '-70%',
            gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
        },
        {
            badge: '⚡ Flash Sale',
            title: 'Week-end Premium',
            description: 'Offres exclusives pour nos membres',
            percentage: '-50%',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            badge: '🎁 Bonus',
            title: 'Parrainage',
            description: 'Invitez vos amis et gagnez des points',
            percentage: '+25%',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        }
    ];
    
    const offerSlide = document.querySelector('.offer-slide');
    if (!offerSlide) return;
    
    function updateOffer() {
        const offer = offers[kshopCurrentOffer];
        
        offerSlide.style.background = offer.gradient;
        offerSlide.querySelector('.offer-badge').textContent = offer.badge;
        offerSlide.querySelector('h3').textContent = offer.title;
        offerSlide.querySelector('p').textContent = offer.description;
        offerSlide.querySelector('.offer-percentage').textContent = offer.percentage;
        
        // Animation de transition
        offerSlide.style.transform = 'scale(0.95)';
        setTimeout(() => {
            offerSlide.style.transform = 'scale(1)';
        }, 200);
        
        kshopCurrentOffer = (kshopCurrentOffer + 1) % offers.length;
    }
    
    // Démarrer le carrousel automatique
    kshopOfferInterval = setInterval(updateOffer, 5000);
    
    // Pause au survol
    offerSlide.addEventListener('mouseenter', () => {
        clearInterval(kshopOfferInterval);
    });
    
    offerSlide.addEventListener('mouseleave', () => {
        kshopOfferInterval = setInterval(updateOffer, 5000);
    });
    
    // Clic pour changer manuellement
    offerSlide.addEventListener('click', () => {
        clearInterval(kshopOfferInterval);
        updateOffer();
        kshopOfferInterval = setInterval(updateOffer, 5000);
    });
}

// Système de favoris
function initFavoriteSystem() {
    const favoriteButtons = document.querySelectorAll('.partner-favorite');
    
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const icon = btn.querySelector('i');
            const isFavorite = icon.classList.contains('fas');
            
            if (isFavorite) {
                icon.classList.remove('fas');
                icon.classList.add('far');
                btn.style.color = '#ef4444';
                showToast('Retiré des favoris', 'info');
            } else {
                icon.classList.remove('far');
                icon.classList.add('fas');
                btn.style.color = '#ef4444';
                createHeartAnimation(btn);
                showToast('Ajouté aux favoris', 'success');
            }
            
            // Animation du bouton
            btn.style.transform = 'scale(1.3)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        });
    });
}

// Animations au scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                
                // Animations spéciales pour certains éléments
                if (entry.target.classList.contains('category-item')) {
                    const items = entry.target.parentElement.children;
                    Array.from(items).forEach((item, index) => {
                        item.style.animationDelay = `${index * 0.1}s`;
                    });
                }
                
                if (entry.target.classList.contains('partner-card-modern')) {
                    entry.target.style.animationDelay = '0.2s';
                }
            }
        });
    }, observerOptions);
    
    // Observer tous les éléments animables
    const animatableElements = document.querySelectorAll(`
        .category-item,
        .partner-card-modern,
        .trust-item,
        .section-header
    `);
    
    animatableElements.forEach(el => observer.observe(el));
}

// Fonctions utilitaires

function createRippleEffect(element, event) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    ripple.classList.add('ripple-effect');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function createHeartAnimation(element) {
    const hearts = ['💖', '💕', '💗', '💝'];
    
    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.position = 'absolute';
        heart.style.fontSize = '16px';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '1000';
        heart.style.animation = `heartFloat 1s ease-out forwards`;
        heart.style.animationDelay = `${i * 0.1}s`;
        
        const rect = element.getBoundingClientRect();
        heart.style.left = (rect.left + Math.random() * 20 - 10) + 'px';
        heart.style.top = rect.top + 'px';
        
        document.body.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 1000);
    }
}

function openPartnerDetails(partnerName) {
    showToast(`Ouverture de ${partnerName}...`, 'info');
    
    // Ici on pourrait ouvrir une modal détaillée
    // Pour l'instant, on simule juste
    setTimeout(() => {
        showToast(`${partnerName} chargé avec succès !`, 'success');
    }, 1000);
}

function showFilterModal() {
    showToast('Filtres avancés - Bientôt disponible !', 'info');
}

// CSS pour les animations supplémentaires
const additionalCSS = `
.ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    pointer-events: none;
    animation: ripple 0.6s linear;
}

@keyframes ripple {
    0% {
        transform: scale(0);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 0;
    }
}

@keyframes heartFloat {
    0% {
        transform: translateY(0) scale(0);
        opacity: 1;
    }
    100% {
        transform: translateY(-50px) scale(1);
        opacity: 0;
    }
}
`;

// Injecter le CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Fonction pour activer le mode plein écran
function enableFullscreenMode() {
    document.body.classList.add('kshop-fullscreen');
    
    // Masquer les barres de navigation du navigateur sur mobile
    if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
        // Mode PWA - déjà plein écran
        return;
    }
    
    // Demander le plein écran sur desktop/tablette
    const kshopContainer = document.querySelector('.kshop-container');
    if (kshopContainer && kshopContainer.requestFullscreen) {
        kshopContainer.requestFullscreen().catch(err => {
            console.log('Plein écran non supporté:', err);
        });
    }
}

// Fonction pour désactiver le mode plein écran
function disableFullscreenMode() {
    document.body.classList.remove('kshop-fullscreen');
    
    if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
            console.log('Sortie du plein écran échouée:', err);
        });
    }
}

// Fonction pour basculer le plein écran
function toggleFullscreen() {
    if (document.body.classList.contains('kshop-fullscreen')) {
        disableFullscreenMode();
    } else {
        enableFullscreenMode();
    }
}

// Toast notifications optimisées pour plein écran
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type} fullscreen`;
    toast.textContent = message;
    
    // Message sans icône
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto-suppression
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 400);
    }, 3000);
}

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.kshop-container')) {
        initKShopInteractions();
        
        // Activer automatiquement le mode plein écran sur mobile
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                enableFullscreenMode();
                showToast('🚀 K-Shop optimisé pour mobile', 'success');
            }, 1500);
        }
        
        // Optimiser les interactions pour mobile
        optimizeMobileInteractions();
    }
    
    // Gérer les changements d'orientation
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            // Recalculer les dimensions
            const kshopContainer = document.querySelector('.kshop-container');
            if (kshopContainer) {
                kshopContainer.style.height = window.innerHeight + 'px';
            }
        }, 500);
    });
    
    // Support des gestes pour sortir du plein écran
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchStartY;
        
        // Geste vers le bas depuis le haut de l'écran pour sortir du plein écran
        if (touchStartY < 50 && deltaY > 100) {
            if (document.body.classList.contains('kshop-fullscreen')) {
                disableFullscreenMode();
                showToast('Mode plein écran désactivé', 'info');
            }
        }
    });
});

// Fonction d'optimisation des interactions mobiles
function optimizeMobileInteractions() {
    // Optimiser les zones de tap pour mobile
    const touchTargets = document.querySelectorAll('.category-item, .partner-card-modern, .search-filter-btn');
    touchTargets.forEach(element => {
        element.style.minHeight = '44px';
        element.style.minWidth = '44px';
    });
    
    // Ajouter des feedbacks tactiles
    if ('vibrate' in navigator) {
        document.querySelectorAll('.category-item, .partner-card-modern').forEach(element => {
            element.addEventListener('touchstart', () => {
                navigator.vibrate(10); // Vibration légère
            });
        });
    }
    
    // Optimiser le scroll avec momentum
    const kshopContent = document.querySelector('.kshop-content');
    if (kshopContent) {
        kshopContent.style.webkitOverflowScrolling = 'touch';
        kshopContent.style.scrollBehavior = 'smooth';
    }
    
    // Ajuster automatiquement les tailles selon l'écran
    adjustSizesForScreen();
}

// Fonction pour ajuster les tailles selon la taille d'écran
function adjustSizesForScreen() {
    const screenWidth = window.innerWidth;
    const root = document.documentElement;
    
    // Ajustements dynamiques pour vraie taille mobile
    if (screenWidth <= 360) {
        root.style.setProperty('--kshop-spacing-md', '6px');
        root.style.setProperty('--kshop-spacing-lg', '8px');
    } else if (screenWidth <= 480) {
        root.style.setProperty('--kshop-spacing-md', '7px');
        root.style.setProperty('--kshop-spacing-lg', '10px');
    } else if (screenWidth <= 768) {
        root.style.setProperty('--kshop-spacing-md', '8px');
        root.style.setProperty('--kshop-spacing-lg', '12px');
    }
    
    // Ajuster la densité pour plus d'éléments visibles
    const categoryGrid = document.querySelector('.category-grid');
    const partnersGrid = document.querySelector('.partners-grid');
    
    if (categoryGrid) {
        if (screenWidth <= 360) {
            categoryGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            categoryGrid.style.gap = '2px';
        } else if (screenWidth <= 480) {
            categoryGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            categoryGrid.style.gap = '4px';
        } else {
            categoryGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        }
    }
    
    if (partnersGrid) {
        partnersGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        if (screenWidth <= 360) {
            partnersGrid.style.gap = '2px';
        } else if (screenWidth <= 480) {
            partnersGrid.style.gap = '4px';
        }
    }
}

// Redimensionnement adaptatif
window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        adjustSizesForScreen();
        
        // Recalculer les dimensions du conteneur
        const kshopContainer = document.querySelector('.kshop-container');
        if (kshopContainer && document.body.classList.contains('kshop-fullscreen')) {
            kshopContainer.style.height = window.innerHeight + 'px';
        }
    }, 250);
});