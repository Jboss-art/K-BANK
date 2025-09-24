// Données des bénéficiaires
const beneficiaries = [
    {
        id: 1,
        name: "Marie Kounga",
        account: "GA21 XXXX XXXX XXXX XXXXXXXX 304",
        bank: "K-Bank",
        avatar: "ML",
        lastTransaction: "Il y a 2 jours"
    },
    {
        id: 2,
        name: "Alassane Diop",
        account: "GA21 XXXX XXXX XXXX XXXXXXXX 031",
        bank: "BICEC",
        avatar: "AD",
        lastTransaction: "Il y a 1 semaine"
    },
    {
        id: 3,
        name: "Sophie Mboumba",
        account: "GA21 XXXX XXXX XXXX XXXXXXXX 901",
        bank: "SGBC",
        avatar: "SM",
        lastTransaction: "Il y a 3 semaines"
    },


     {
        id: 4,
        name: "Grace Moussavou",
        account: "GA21 XXXX XXXX XXXX XXXXXXXX 500",
        bank: "SGBC",
        avatar: "SM",
        lastTransaction: "Il y a 3 semaines"
    },
    {
        id: 5,
        name: "Pauline Mteme",
        account: "GA21 XXXX XXXX XXXX XXXXXXXX 678",
        bank: "K-Bank",
        avatar: "PA",
        lastTransaction: "Il y a 1 mois"
    },
    {
        id: 6,
        name: "Jean Mvoumbi",
        account: "GA21 XXXX XXXX XXXX XXXXXXXX 123",
        bank: "BICEC",
        avatar: "JD",
        lastTransaction: "Il y a 2 mois"
    }
];

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si nous sommes sur la page de transfert
    const transferPage = document.getElementById('transfer-page');
    if (transferPage && transferPage.classList.contains('active')) {
        renderBeneficiaries();
        populateBeneficiarySelect();
    }
    
    // Ajouter des écouteurs d'événements pour les boutons de navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.getAttribute('onclick').includes('transfer')) {
                setTimeout(() => {
                    renderBeneficiaries();
                    populateBeneficiarySelect();
                }, 100);
            }
        });
    });
});

// Affiche la liste des bénéficiaires
function renderBeneficiaries() {
    const container = document.getElementById('beneficiaries-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    beneficiaries.forEach(beneficiary => {
        const element = document.createElement('div');
        element.className = 'beneficiary-item';
        element.innerHTML = `
            <div class="beneficiary-avatar">${beneficiary.avatar}</div>
            <div class="beneficiary-details">
                <div class="beneficiary-name">${beneficiary.name}</div>
                <div class="beneficiary-info">${beneficiary.account} • ${beneficiary.bank}</div>
            </div>
            <div class="beneficiary-action">
                <i class="fas fa-chevron-right"></i>
            </div>
        `;
        
        element.addEventListener('click', () => {
            selectBeneficiary(beneficiary);
        });
        
        container.appendChild(element);
    });
}

// Remplit la liste déroulante des bénéficiaires
function populateBeneficiarySelect() {
    const select = document.getElementById('beneficiary-select');
    if (!select) return;
    
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    beneficiaries.forEach(beneficiary => {
        const option = document.createElement('option');
        option.value = beneficiary.id;
        option.textContent = `${beneficiary.name} (${beneficiary.account})`;
        select.appendChild(option);
    });
}

// Sélectionne un bénéficiaire
function selectBeneficiary(beneficiary) {
    const select = document.getElementById('beneficiary-select');
    if (!select) return;
    
    select.value = beneficiary.id;
    document.getElementById('transfer-amount').focus();
}

// Ouvre le modal d'ajout de bénéficiaire
function openAddBeneficiaryModal() {
    document.getElementById('add-beneficiary-modal').classList.add('active');
}

// Ferme le modal d'ajout de bénéficiaire
function closeAddBeneficiaryModal() {
    document.getElementById('add-beneficiary-modal').classList.remove('active');
}

// Ajoute un nouveau bénéficiaire
function addBeneficiary() {
    const name = document.getElementById('beneficiary-name').value;
    const account = document.getElementById('beneficiary-account').value;
    const bank = document.getElementById('beneficiary-bank').value;
    
    if (!name || !account || !bank) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    const newBeneficiary = {
        id: beneficiaries.length + 1,
        name: name,
        account: account,
        bank: bank,
        avatar: name.split(' ').map(n => n[0]).join(''),
        lastTransaction: "Nouveau"
    };
    
    beneficiaries.unshift(newBeneficiary);
    renderBeneficiaries();
    populateBeneficiarySelect();
    
    closeAddBeneficiaryModal();
    document.getElementById('beneficiary-name').value = '';
    document.getElementById('beneficiary-account').value = '';
    document.getElementById('beneficiary-bank').value = '';
    
    showNotification('Bénéficiaire ajouté avec succès');
}

// Confirme le virement
function confirmTransfer() {
    const beneficiaryId = document.getElementById('beneficiary-select').value;
    const amount = document.getElementById('transfer-amount').value;
    const reason = document.getElementById('transfer-reason').value;
    
    if (!beneficiaryId) {
        showNotification('Veuillez sélectionner un bénéficiaire', 'error');
        return;
    }
    
    if (!amount || amount <= 0) {
        showNotification('Veuillez saisir un montant valide', 'error');
        return;
    }
    
    const beneficiary = beneficiaries.find(b => b.id == beneficiaryId);
    
    showConfirmDialog(
        'Confirmer le virement',
        `Voulez-vous effectuer un virement de ${Number(amount).toLocaleString()} FCFA vers ${beneficiary.name} ?`,
        'Confirmer',
        'Annuler',
        () => {
            showNotification(`Virement de ${Number(amount).toLocaleString()} FCFA effectué avec succès`);
            document.getElementById('beneficiary-select').value = '';
            document.getElementById('transfer-amount').value = '';
            document.getElementById('transfer-reason').value = '';
            switchTab('home');
        }
    );
}

// Données de l'application
const appData = {
    transactions: [
        {
            id: 1,
            title: "commercant alassane",
            date: "Aujourd'hui, 14:30",
            amount: 5000.00,
            icon: "🛒",
            category: "Shopping"
        },
        {
            id: 2,
            title: "cotisation couple Mboumba",
            date: "Hier, 09:15",
            amount: 2450.00,
            icon: "💰",
            category: "Salaire"
        },
        {
            id: 3,
            title: "Caféteria du campus",
            date: "Hier, 17:45",
            amount: -500.00,
            icon: "☕",
            category: "Café"
        }
    ],
     notifications: [
        {
            id: 1,
            title: "Virement reçu",
            message: "Vous avez reçu 15000,00 XAF de Jean Mvoumbi",
            date: "Il y a 2 heures",
            read: false,
            type: "transaction"
        },
        {
            id: 2,
            title: "Paiement effectué",
            message: "Paiement de 35000,00 XAF à Supermarché ABC",
            date: "Il y a 5 heures",
            read: false,
            type: "transaction"
        },
        {
            id: 3,
            title: "Alerte de sécurité",
            message: "Nouvelle connexion détectée sur votre compte",
            date: "Hier",
            read: true,
            type: "security"
        },
        {
            id: 4,
            title: "Offre spéciale",
            message: "Profitez de -15% chez nos partenaires ce week-end",
            date: "Il y a 2 jours",
            read: true,
            type: "promotion"
        }
    ]
};

// Initialisation des notifications
function initializeNotifications() {
    renderNotifications();
    updateNotificationBadge();
    initializeSwipeListeners();
}

// Affiche les notifications
function renderNotifications() {
    const container = document.getElementById('notifications-list');
    if (!container) return;
    
    if (appData.notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-notifications">
                <i class="fas fa-bell-slash"></i>
                <p>Aucune notification</p>
            </div>`;
        return;
    }
    
    container.innerHTML = appData.notifications.map(notification => {
        // Extract amount from message if it contains one
        const amountMatch = notification.message.match(/(-?\d+(?:\.\d{2})?)/);
        let formattedMessage = notification.message;
        
        if (amountMatch) {
            const amount = parseFloat(amountMatch[0]);
            const formattedAmount = `${amount < 0 ? '-' : ''}${Math.abs(amount).toLocaleString()} F <h5>CFA</h5>`;
            formattedMessage = notification.message.replace(amountMatch[0], formattedAmount);
        }

        return `
            <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                <div class="notification-content">
                    <div class="notification-icon ${notification.type}">
                        ${getNotificationIcon(notification.type)}
                    </div>
                    <div class="notification-text">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${formattedMessage}</div>
                        <div class="notification-time">${notification.date}</div>
                    </div>
                </div>
                <div class="delete-indicator">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        `;
    }).join('');
    
    initializeSwipeListeners();
}

// Retourne l'icône appropriée selon le type de notification
function getNotificationIcon(type) {
    switch(type) {
        case 'transaction': return '💰';
        case 'security': return '🔒';
        case 'promotion': return '🎁';
        default: return '📋';
    }
}

// Met à jour le badge de notifications
function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    const unreadCount = appData.notifications.filter(n => !n.read).length;
    
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

// Marque toutes les notifications comme lues
function markAllAsRead() {
    let hasUnread = false;
    appData.notifications.forEach(notification => {
        if (!notification.read) {
            notification.read = true;
            hasUnread = true;
        }
    });
    
    if (hasUnread) {
        renderNotifications();
        updateNotificationBadge();
        showToast('Toutes les notifications ont été marquées comme lues');
    }
}

// Supprime une notification
function deleteNotification(id) {
    appData.notifications = appData.notifications.filter(n => n.id != id);
    renderNotifications();
    updateNotificationBadge();
    showToast('Notification supprimée');
}

// Affiche un toast de confirmation
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// État de la carte
let isCardFrozen = false;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    renderTransactions();
    updateNotificationBadge();
    
    // Initialiser les notifications si on est sur la page notifications
    if (document.getElementById('notifications-page').classList.contains('active')) {
        renderNotifications();
        initializeSwipeListeners();
    }
});

// Affiche les transactions
function renderTransactions() {
    const container = document.getElementById('transactions-list');
    container.innerHTML = '';
    
    appData.transactions.forEach(transaction => {
        const element = document.createElement('div');
        element.className = 'transaction-item';
        element.innerHTML = `
            <div class="transaction-icon">${transaction.icon}</div>
            <div class="transaction-details">
                <div class="transaction-title">${transaction.title}</div>
                <div class="transaction-date">${transaction.date}</div>
            </div>
            <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                ${transaction.amount > 0 ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()} F <h5>CFA</h5>
            </div>
        `;
        container.appendChild(element);
    });
}

// Change de page
function switchTab(tab) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(`${tab}-page`).classList.add('active');
    document.querySelector(`.nav-item[onclick="switchTab('${tab}')"]`).classList.add('active');
    
    // Initialiser les bénéficiaires quand on accède à la page de transfert
    if (tab === 'transfer') {
        renderBeneficiaries();
        populateBeneficiarySelect();
    }

    if (tab === 'notifications') {
        setTimeout(() => {
            initializeNotifications();
        }, 100);
    }

    if (tab === 'iban') {
        // Initialize IBAN page if needed
        document.querySelector('.iban-page').classList.add('active');
    }
}

// Fonction pour geler/dégeler la carte
function toggleCardFreeze() {
    const card = document.querySelector('.bank-card');
    
    // Si la carte est bloquée, ne rien faire
    if (card.classList.contains('blocked')) {
        return;
    }

    if (!isCardFrozen) {
        showConfirmationModal(
            "Geler la carte",
            "Êtes-vous sûr de vouloir geler votre carte ? Elle ne pourra plus être utilisée temporairement pour les paiements.",
            "Geler",
            "Annuler",
            freezeCard
        );
    } else {
        unfreezeCard();
    }
}

function freezeCard() {
    isCardFrozen = true;
    const card = document.getElementById('main-card');
    const status = document.getElementById('card-status');
    const freezeText = document.getElementById('freeze-text');
    
    card.classList.add('frozen');
    status.textContent = 'Gelée';
    status.classList.add('frozen');
    freezeText.textContent = 'Dégeler';
    
    showToast('Carte gelée avec succès');
}

function unfreezeCard() {
    isCardFrozen = false;
    const card = document.getElementById('main-card');
    const status = document.getElementById('card-status');
    const freezeText = document.getElementById('freeze-text');
    
    card.classList.remove('frozen');
    status.textContent = 'Active';
    status.classList.remove('frozen');
    freezeText.textContent = 'Geler';
    
    showToast('Carte dégelée avec succès');
}

// Modal de confirmation
function showConfirmationModal(title, message, confirmText, cancelText, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-icon">❄️</div>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-buttons">
                <button class="modal-button secondary" onclick="closeModal()">${cancelText}</button>
                <button class="modal-button primary" onclick="confirmAction()">${confirmText}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    window.confirmAction = function() {
        onConfirm();
        closeModal();
    };
    
    window.closeModal = function() {
        modal.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 200);
    };
    
    window.closeModal = function() {
        document.body.removeChild(modal);
    };
}

// Commander une carte
function selectCardType(type) {
    document.querySelectorAll('.card-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
}

function orderCard() {
    const selectedOption = document.querySelector('.card-option.selected');
    if (selectedOption) {
        const cardName = selectedOption.querySelector('span').textContent;
        showToast(`Commande de ${cardName} effectuée !`);
        setTimeout(() => switchTab('cards'), 2000);
    }
}

// Sécurité
function changePassword() {
    showToast('Redirection vers le changement de mot de passe');
}

function toggle2FA() {
    const toggle = document.getElementById('2fa-toggle');
    toggle.checked = !toggle.checked;
    showToast(toggle.checked ? '2FA activé' : '2FA désactivé');
}

function viewSessions() {
    showToast('Affichage des sessions actives');
}

// Variables pour la recharge
let selectedPaymentMethod = null;

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update UI
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    document.querySelector(`.payment-method[onclick*="${method}"]`).classList.add('selected');
    
    // Enable/disable topup button
    updateTopupButton();
}

function updateTopupButton() {
    const amount = document.getElementById('topup-amount').value;
    const phone = document.getElementById('phone-number').value;
    const button = document.getElementById('topup-button');
    
    button.disabled = !selectedPaymentMethod || !amount || !phone;
}

function processTopup() {
    const amount = document.getElementById('topup-amount').value;
    const phone = document.getElementById('phone-number').value;
    
    if (!selectedPaymentMethod || !amount || !phone) {
        showToast('Veuillez remplir tous les champs');
        return;
    }
    
    const methodNames = {
        'moov': 'Moov Money',
        'airtel': 'Airtel Money',
        'western': 'Western Union'
    };
    
    showConfirmDialog(
        'Confirmer la recharge',
        `Voulez-vous recharger ${Number(amount).toLocaleString()} XAF via ${methodNames[selectedPaymentMethod]} ?`,
        'Confirmer',
        'Annuler',
        () => {
            showToast('Redirection vers la page de paiement...');
            // Simulate payment processing
            setTimeout(() => {
                showToast('Compte rechargé avec succès !');
                resetForm();
                switchTab('home');
            }, 2000);
        }
    );
}

function resetForm() {
    document.getElementById('topup-amount').value = '';
    document.getElementById('phone-number').value = '';
    selectedPaymentMethod = null;
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    updateTopupButton();
}

// Add event listeners for form inputs
document.addEventListener('DOMContentLoaded', () => {
    const inputs = ['topup-amount', 'phone-number'];
    inputs.forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateTopupButton);
    });
});

// Functions for IBAN page
function copyIban() {
    const iban = document.querySelector('.iban-value').textContent;
    navigator.clipboard.writeText(iban)
        .then(() => {
            showToast('IBAN copié dans le presse-papier');
        })
        .catch(() => {
            showToast('Impossible de copier l\'IBAN');
        });
}

function shareIban() {
    const iban = document.querySelector('.iban-value').textContent;
    const bankName = 'K-BANK GABON';
    const shareText = `Mon IBAN ${bankName}:\n${iban}`;

    if (navigator.share) {
        navigator.share({
            title: 'Mon IBAN K-BANK',
            text: shareText
        }).catch(() => {
            copyIban();
        });
    } else {
        copyIban();
    }
}

function downloadIban() {
    showConfirmDialog(
        'Télécharger RIB',
        'Voulez-vous télécharger votre RIB au format PDF ?',
        'Télécharger',
        'Annuler',
        () => {
            showToast('Téléchargement du RIB en cours...');
            // Simulate download
            setTimeout(() => {
                showToast('RIB téléchargé avec succès');
            }, 1500);
        }
    );
}

// Functions for Others page
function openShop(shop) {
    switch(shop) {
        case 'ckdo':
            showToast('Redirection vers CKDO Gabon...');
            break;
        case 'kfc':
            showToast('Redirection vers Pole KFC Gabon...');
            break;
        case 'mbolo':
            showToast('Redirection vers Mbolo Gabon...');
            break;
    }
}

function callAdvisor() {
    showToast('Appel du conseiller en cours...');
}

function openChat() {
    showToast('Ouverture du chat en direct...');
}

function toggleFaq(element) {
    element.classList.toggle('active');
}

// Utility function to show toast messages
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Show confirmation dialog
function showConfirmDialog(title, message, confirmText, cancelText, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    
    // Changement ici : utilisation de l'icône fa-ban au lieu de fa-file-pdf
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-icon">
                <i class="fas fa-ban" style="color: #ff3b30; font-size: 32px;"></i>
            </div>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-buttons">
                <button class="modal-button primary" onclick="handleConfirm(this)">${confirmText}</button>
                <button class="modal-button secondary" onclick="handleCancel(this)">${cancelText}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.dataset.callback = onConfirm.toString();
}

// Handle confirmation
function handleConfirm(button) {
    const modal = button.closest('.confirmation-modal');
    const callback = new Function('return ' + modal.dataset.callback)();
    modal.remove();
    callback();
}

// Handle cancellation
function handleCancel(button) {
    button.closest('.confirmation-modal').remove();
}

// Variables pour le glissement
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;
let currentNotification = null;

// Initialise les écouteurs de glissement
function initializeSwipeListeners() {
    const notifications = document.querySelectorAll('.notification-item');
    
    notifications.forEach(notification => {
        // Événements tactiles
        notification.addEventListener('touchstart', handleTouchStart, false);
        notification.addEventListener('touchmove', handleTouchMove, false);
        notification.addEventListener('touchend', handleTouchEnd, false);
        
        // Événements souris (pour le desktop)
        notification.addEventListener('mousedown', handleMouseDown, false);
        notification.addEventListener('mousemove', handleMouseMove, false);
        notification.addEventListener('mouseup', handleMouseUp, false);
        notification.addEventListener('mouseleave', handleMouseUp, false);
        
        // Gestion du clic pour marquer comme lu
        notification.addEventListener('click', (e) => {
            if (!isSwiping) {
                const id = parseInt(notification.getAttribute('data-id'));
                markAsRead(id);
            }
        });
    });
}

// Gestion du début du glissement
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    currentNotification = e.currentTarget;
    isSwiping = false;
}

function handleMouseDown(e) {
    touchStartX = e.clientX;
    touchStartY = e.clientY;
    currentNotification = e.currentTarget;
    isSwiping = false;
}

// Gestion du mouvement de glissement
function handleTouchMove(e) {
    if (!touchStartX || !touchStartY || !currentNotification) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    const diffX = touchStartX - touchX;
    const diffY = touchStartY - touchY;
    
    // Vérifier si c'est un glissement horizontal (pas vertical)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        e.preventDefault();
        isSwiping = true;
        
        // Seulement permettre le glissement vers la gauche
        if (diffX > 0) {
            currentNotification.style.transform = `translateX(-${diffX}px)`;
            
            // Afficher l'indicateur de suppression après un certain seuil
            if (diffX > 60) {
                currentNotification.classList.add('deleting');
            } else {
                currentNotification.classList.remove('deleting');
            }
        }
    }
}

function handleMouseMove(e) {
    if (!touchStartX || !touchStartY || !currentNotification) return;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const diffX = touchStartX - mouseX;
    const diffY = touchStartY - mouseY;
    
    // Vérifier si c'est un glissement horizontal (pas vertical)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        isSwiping = true;
        
        // Seulement permettre le glissement vers la gauche
        if (diffX > 0) {
            currentNotification.style.transform = `translateX(-${diffX}px)`;
            
            // Afficher l'indicateur de suppression après un certain seuil
            if (diffX > 60) {
                currentNotification.classList.add('deleting');
            } else {
                currentNotification.classList.remove('deleting');
            }
        }
    }
}

// Gestion de la fin du glissement
function handleTouchEnd() {
    if (!currentNotification) return;
    
    const computedStyle = window.getComputedStyle(currentNotification);
    const matrix = new DOMMatrixReadOnly(computedStyle.transform);
    const currentTranslateX = matrix.m41;
    
    // Si on a glissé suffisamment, supprimer la notification
    if (Math.abs(currentTranslateX) > 100) {
        currentNotification.style.animation = 'slideOut 0.3s forwards';
        
        setTimeout(() => {
            const id = parseInt(currentNotification.getAttribute('data-id'));
            deleteNotification(id);
        }, 300);
    } else {
        // Sinon, remettre en place
        currentNotification.style.transform = 'translateX(0)';
        currentNotification.classList.remove('deleting');
    }
    
    // Réinitialiser
    touchStartX = 0;
    touchStartY = 0;
    currentNotification = null;
}

function handleMouseUp() {
    handleTouchEnd();
}

// Supprime une notification
function deleteNotification(id) {
    appData.notifications = appData.notifications.filter(n => n.id !== id);
    renderNotifications();
    updateNotificationBadge();
    initializeSwipeListeners();
    
    // Animation de confirmation
    showToast('Notification supprimée');
}

// Marque une notification comme lue
function markAsRead(id) {
    const notification = appData.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
        notification.read = true;
        renderNotifications();
        updateNotificationBadge();
        initializeSwipeListeners();
    }
}

// Marque toutes les notifications comme lues
function markAllAsRead() {
    let hasUnread = false;
    
    appData.notifications.forEach(notification => {
        if (!notification.read) {
            notification.read = true;
            hasUnread = true;
        }
    });
    
    if (hasUnread) {
        renderNotifications();
        updateNotificationBadge();
        showToast('Toutes les notifications marquées comme lues');
    } else {
        showToast('Toutes les notifications sont déjà lues');
    }
}
// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    renderTransactions();
    updateNotificationBadge();
    
    // Initialiser les notifications si on est sur la page notifications
    if (document.getElementById('notifications-page').classList.contains('active')) {
        renderNotifications();
        initializeSwipeListeners();
    }
});

function temporaryBlockCard() {
    showConfirmDialog(
        'Bloquer la carte',
        'Voulez-vous bloquer votre carte ? Celle-ci ne pourra plus être utilisée. Veuillez en commander une nouvelle.',
        'Bloquer',
        'Annuler',
        () => {
            const card = document.querySelector('.bank-card');
            const statusElement = document.querySelector('#card-status');
            const freezeButton = document.querySelector('.freeze-button');
            
            card.classList.add('blocked');
            
            // Ajouter l'icône de blocage rouge
            if (!card.querySelector('.block-indicator')) {
                const blockIcon = document.createElement('div');
                blockIcon.className = 'block-indicator';
                blockIcon.innerHTML = '<i class="fas fa-ban"></i>';
                card.appendChild(blockIcon);
            }
            
            // Mettre à jour le statut
            if (statusElement) {
                statusElement.textContent = 'Bloquée';
                statusElement.className = 'card-status blocked-status';
            }

            // Désactiver le bouton geler
            if (freezeButton) {
                freezeButton.disabled = true;
                freezeButton.style.opacity = '0.5';
                freezeButton.style.cursor = 'not-allowed';
                freezeButton.onclick = null; // Enlever l'événement click
            }

            showToast('Carte bloquée avec succès');
            
            // Redirection vers la page de commande après un court délai
            setTimeout(() => {
                showConfirmDialog(
                    'Commander une nouvelle carte',
                    'Votre carte a été bloquée. Souhaitez-vous commander une nouvelle carte maintenant ?',
                    'Commander',
                    'Plus tard',
                    () => {
                        switchTab('order-card');
                    }
                );
            }, 1500);
        }
    );
}

// Modifier la fonction toggleCardFreeze pour vérifier si la carte est bloquée
function toggleCardFreeze() {
    const card = document.querySelector('.bank-card');
    
    // Si la carte est bloquée, ne rien faire
    if (card.classList.contains('blocked')) {
        return;
    }

    if (!isCardFrozen) {
        showConfirmationModal(
            "Geler la carte",
            "Êtes-vous sûr de vouloir geler votre carte ? Elle ne pourra plus être utilisée temporairement pour les paiements.",
            "Geler",
            "Annuler",
            freezeCard
        );
    } else {
        unfreezeCard();
    }
}

// K-Shop Functions
function openPartner(partnerId) {
    showToast('Redirection vers la boutique du partenaire...');
    // Logique de redirection à implémenter
}

function updateKShopBadge(count) {
    const badge = document.querySelector('.kshop-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function openKShop() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const kshopPage = document.querySelector('.kshop-page');
    if (kshopPage) {
        kshopPage.classList.add('active');
        
        // Reset navigation active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
    } else {
        showToast('Page K-Shop en construction');
    }
}

