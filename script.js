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
    // Vérifier si nous sommes sur la page de transfert (ancien)
    const transferPage = document.getElementById('transfer-page');
    if (transferPage && transferPage.classList.contains('active')) {
        renderBeneficiaries();
        populateBeneficiarySelect();
    }
    
    // Vérifier si nous sommes sur la page de virement
    const virementPage = document.getElementById('virement-page');
    if (virementPage && virementPage.classList.contains('active')) {
        renderVirementBeneficiaries();
        populateVirementBeneficiarySelect();
    }
    
    // Initialiser les écouteurs de glissement pour la page d'accueil
    initializeHomeSwipeListeners();
    
    // Ajouter des écouteurs d'événements pour les boutons de navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const onclick = item.getAttribute('onclick');
            if (onclick && onclick.includes('transfer')) {
                setTimeout(() => {
                    renderBeneficiaries();
                    populateBeneficiarySelect();
                }, 100);
            }
            if (onclick && onclick.includes('virement')) {
                setTimeout(() => {
                    renderVirementBeneficiaries();
                    populateVirementBeneficiarySelect();
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

// Affiche la liste des bénéficiaires pour la page virement
function renderVirementBeneficiaries() {
    const container = document.getElementById('virement-beneficiaries-list');
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
            selectVirementBeneficiary(beneficiary);
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

// Fonction pour peupler le select de la page virement
function populateVirementBeneficiarySelect() {
    const select = document.getElementById('virement-beneficiary-select');
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

// Sélectionne un bénéficiaire pour la page virement
function selectVirementBeneficiary(beneficiary) {
    const select = document.getElementById('virement-beneficiary-select');
    if (!select) return;
    
    select.value = beneficiary.id;
    document.getElementById('virement-amount').focus();
}

// Ouvre la modal d'ajout de bénéficiaire pour les virements
function openAddVirementBeneficiaryModal() {
    showNotification('Fonctionnalité d\'ajout de bénéficiaire à venir');
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

// Confirme le virement (ancienne fonction transfer renommée)
function confirmVirement() {
    const beneficiaryId = document.getElementById('virement-beneficiary-select').value;
    const amount = document.getElementById('virement-amount').value;
    const reason = document.getElementById('virement-reason').value;
    
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
            // Simuler le virement
            showNotification('Virement effectué avec succès');
            document.getElementById('virement-amount').value = '';
            document.getElementById('virement-reason').value = '';
            document.getElementById('virement-beneficiary-select').selectedIndex = 0;
            
            // Ajouter à l'historique
            const transaction = {
                id: Date.now(),
                type: 'expense',
                title: `Virement vers ${beneficiary.name}`,
                details: reason || 'Virement bancaire',
                amount: Number(amount),
                date: new Date().toLocaleDateString(),
                icon: 'fa-paper-plane',
                color: '#ef4444'
            };
            
            // Ajouter à la liste des transactions si elle existe
            if (typeof addTransaction === 'function') {
                addTransaction(transaction);
            }
        }
    );
}

// Fonctions pour la nouvelle page transfert
let selectedTransferMethod = null;

function selectTransferMethod(method) {
    // Désélectionner toutes les méthodes
    document.querySelectorAll('.payment-method').forEach(pm => {
        pm.classList.remove('selected');
    });
    
    // Sélectionner la méthode choisie
    document.querySelector(`.payment-method[onclick*="${method}"]`).classList.add('selected');
    selectedTransferMethod = method;
    
    // Activer le bouton si un montant est aussi renseigné
    validateTransferForm();
}

function validateTransferForm() {
    const amount = document.getElementById('transfer-amount').value;
    const phone = document.getElementById('transfer-phone-number').value;
    const name = document.getElementById('transfer-recipient-name').value;
    const button = document.getElementById('transfer-button');
    
    if (amount && phone && name && selectedTransferMethod) {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
}

function processTransfer() {
    const amount = document.getElementById('transfer-amount').value;
    const phone = document.getElementById('transfer-phone-number').value;
    const name = document.getElementById('transfer-recipient-name').value;
    
    if (!selectedTransferMethod) {
        showNotification('Veuillez sélectionner une méthode de transfert', 'error');
        return;
    }
    
    if (!amount || amount <= 0) {
        showNotification('Veuillez saisir un montant valide', 'error');
        return;
    }
    
    if (!phone) {
        showNotification('Veuillez saisir le numéro de téléphone', 'error');
        return;
    }
    
    if (!name) {
        showNotification('Veuillez saisir le nom du destinataire', 'error');
        return;
    }
    
    const methodNames = {
        'moov': 'Moov Money',
        'airtel': 'Airtel Money',
        'western': 'Western Union'
    };
    
    showConfirmDialog(
        'Confirmer le transfert',
        `Transférer ${Number(amount).toLocaleString()} FCFA vers ${name} (${phone}) via ${methodNames[selectedTransferMethod]} ?`,
        'Confirmer',
        'Annuler',
        () => {
            showNotification('Transfert initié avec succès');
            
            // Réinitialiser le formulaire
            document.getElementById('transfer-amount').value = '';
            document.getElementById('transfer-phone-number').value = '';
            document.getElementById('transfer-recipient-name').value = '';
            document.querySelectorAll('.payment-method').forEach(pm => {
                pm.classList.remove('selected');
            });
            selectedTransferMethod = null;
            document.getElementById('transfer-button').disabled = true;
            
            // Ajouter à l'historique
            const transaction = {
                id: Date.now(),
                type: 'expense',
                title: `Transfert ${methodNames[selectedTransferMethod]}`,
                details: `Vers ${name} - ${phone}`,
                amount: Number(amount),
                date: new Date().toLocaleDateString(),
                icon: 'fa-exchange-alt',
                color: '#3b82f6'
            };
            
            // Ajouter à la liste des transactions si elle existe
            if (typeof addTransaction === 'function') {
                addTransaction(transaction);
            }
        }
    );
}

// Ajouter les écouteurs d'événements pour la validation du formulaire transfert
document.addEventListener('DOMContentLoaded', function() {
    const transferAmountField = document.getElementById('transfer-amount');
    const transferPhoneField = document.getElementById('transfer-phone-number');
    const transferNameField = document.getElementById('transfer-recipient-name');
    
    if (transferAmountField) transferAmountField.addEventListener('input', validateTransferForm);
    if (transferPhoneField) transferPhoneField.addEventListener('input', validateTransferForm);
    if (transferNameField) transferNameField.addEventListener('input', validateTransferForm);
});

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
function showConfirmDialog(title, message, confirmText, cancelText, onConfirm, iconClass = 'fas fa-ban', iconColor = '#ff3b30') {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-icon">
                <i class="${iconClass}" style="color: ${iconColor}; font-size: 32px;"></i>
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
                    },
                    'fas fa-credit-card',
                    '#6a11cb'
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

// Variables pour le glissement vers compte-pro
let homeSwipeTouchStartX = 0;
let homeSwipeTouchStartY = 0;
let homeSwipeIsActive = false;
let swipeIndicator = null;

// Fonction pour naviguer vers compte-pro.html
function navigateToComptePro() {
    window.location.href = 'compte-pro.html';
}

// Créer l'indicateur de glissement
function createSwipeIndicator() {
    if (!swipeIndicator) {
        swipeIndicator = document.createElement('div');
        swipeIndicator.className = 'swipe-indicator';
        swipeIndicator.innerHTML = '<i class="fas fa-arrow-left"></i> Glisser pour Compte Pro';
        document.body.appendChild(swipeIndicator);
    }
}

// Afficher l'indicateur
function showSwipeIndicator() {
    createSwipeIndicator();
    swipeIndicator.classList.add('show');
}

// Masquer l'indicateur
function hideSwipeIndicator() {
    if (swipeIndicator) {
        swipeIndicator.classList.remove('show');
    }
}

// Initialise les écouteurs de glissement pour la page d'accueil
function initializeHomeSwipeListeners() {
    const homePage = document.getElementById('home-page');
    if (!homePage) return;
    
    // Événements tactiles
    homePage.addEventListener('touchstart', handleHomeSwipeTouchStart, { passive: true });
    homePage.addEventListener('touchmove', handleHomeSwipeTouchMove, { passive: false });
    homePage.addEventListener('touchend', handleHomeSwipeTouchEnd, { passive: true });
    
    // Événements souris (pour le desktop)
    homePage.addEventListener('mousedown', handleHomeSwipeMouseDown, false);
    homePage.addEventListener('mousemove', handleHomeSwipeMouseMove, false);
    homePage.addEventListener('mouseup', handleHomeSwipeMouseUp, false);
    homePage.addEventListener('mouseleave', handleHomeSwipeMouseUp, false);
}

// Gestion du début du glissement (tactile)
function handleHomeSwipeTouchStart(e) {
    homeSwipeTouchStartX = e.touches[0].clientX;
    homeSwipeTouchStartY = e.touches[0].clientY;
    homeSwipeIsActive = false;
}

// Gestion du début du glissement (souris)
function handleHomeSwipeMouseDown(e) {
    homeSwipeTouchStartX = e.clientX;
    homeSwipeTouchStartY = e.clientY;
    homeSwipeIsActive = false;
}

// Gestion du mouvement de glissement (tactile)
function handleHomeSwipeTouchMove(e) {
    if (!homeSwipeTouchStartX || !homeSwipeTouchStartY) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    const diffX = homeSwipeTouchStartX - touchX;
    const diffY = homeSwipeTouchStartY - touchY;
    
    // Vérifier si c'est un glissement horizontal vers la gauche
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
        if (diffX > 0) { // Glissement vers la gauche
            homeSwipeIsActive = true;
            e.preventDefault(); // Empêcher le scroll
            
            const homePage = document.getElementById('home-page');
            if (homePage) {
                homePage.classList.add('swiping-left');
            }
            
            // Afficher l'indicateur après un seuil
            if (diffX > 80) {
                showSwipeIndicator();
            }
        }
    }
}

// Gestion du mouvement de glissement (souris)
function handleHomeSwipeMouseMove(e) {
    if (!homeSwipeTouchStartX || !homeSwipeTouchStartY) return;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const diffX = homeSwipeTouchStartX - mouseX;
    const diffY = homeSwipeTouchStartY - mouseY;
    
    // Vérifier si c'est un glissement horizontal vers la gauche
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
        if (diffX > 0) { // Glissement vers la gauche
            homeSwipeIsActive = true;
            
            const homePage = document.getElementById('home-page');
            if (homePage) {
                homePage.classList.add('swiping-left');
            }
            
            // Afficher l'indicateur après un seuil
            if (diffX > 80) {
                showSwipeIndicator();
            }
        }
    }
}

// Gestion de la fin du glissement (tactile)
function handleHomeSwipeTouchEnd() {
    const homePage = document.getElementById('home-page');
    
    if (homeSwipeIsActive) {
        // Navigation vers compte-pro si le glissement était suffisant
        const diffX = homeSwipeTouchStartX - (homeSwipeTouchStartX); // Calculé pendant le mouvement
        if (swipeIndicator && swipeIndicator.classList.contains('show')) {
            navigateToComptePro();
        }
    }
    
    // Nettoyer les styles et indicateur
    if (homePage) {
        homePage.classList.remove('swiping-left');
    }
    hideSwipeIndicator();
    
    // Réinitialiser les variables
    homeSwipeTouchStartX = 0;
    homeSwipeTouchStartY = 0;
    homeSwipeIsActive = false;
}

// Gestion de la fin du glissement (souris)
function handleHomeSwipeMouseUp() {
    const homePage = document.getElementById('home-page');
    
    if (homeSwipeIsActive) {
        // Navigation vers compte-pro si l'indicateur est visible
        if (swipeIndicator && swipeIndicator.classList.contains('show')) {
            navigateToComptePro();
        }
    }
    
    // Nettoyer les styles et indicateur
    if (homePage) {
        homePage.classList.remove('swiping-left');
    }
    hideSwipeIndicator();
    
    // Réinitialiser les variables
    homeSwipeTouchStartX = 0;
    homeSwipeTouchStartY = 0;
    homeSwipeIsActive = false;
}

// ========================================
// FONCTIONS DU COFFRE-FORT
// ========================================

let vaultBalance = 1250000;
let vaultGoalIcon = 'plane';
let vaultHistory = [
    {
        id: 1,
        type: 'deposit',
        amount: 100000,
        date: '2024-01-15',
        description: 'Dépôt mensuel',
        goal: 'Vacances'
    },
    {
        id: 2,
        type: 'withdrawal',
        amount: 50000,
        date: '2024-01-10',
        description: 'Retrait urgence',
        goal: null
    }
];

let vaultSavingsGoals = [
    {
        id: 1,
        name: 'Vacances à Paris',
        target: 500000,
        current: 350000,
        date: '2024-06-15',
        icon: 'plane'
    },
    {
        id: 2,
        name: 'Nouvelle voiture',
        target: 2000000,
        current: 800000,
        date: '2024-12-31',
        icon: 'car'
    }
];

function initializeVaultPage() {
    updateVaultBalance();
    renderVaultSavingsGoals();
    renderVaultHistory();
}

function updateVaultBalance() {
    const vaultTotalElement = document.getElementById('vault-total');
    if (vaultTotalElement) {
        vaultTotalElement.innerHTML = `F <h6>cfa</h6> ${vaultBalance.toLocaleString('fr-FR')},<small>00</small>`;
    }
}

function renderVaultSavingsGoals() {
    const container = document.getElementById('vault-savings-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    vaultSavingsGoals.forEach(goal => {
        const progressPercent = Math.min((goal.current / goal.target) * 100, 100);
        const goalElement = document.createElement('div');
        goalElement.className = 'vault-savings-goal';
        
        goalElement.innerHTML = `
            <div class="vault-goal-info">
                <div class="vault-goal-icon">
                    <i class="fas fa-${goal.icon}"></i>
                </div>
                <div class="vault-goal-details">
                    <div class="vault-goal-name">${goal.name}</div>
                    <div class="vault-goal-amount">F CFA ${goal.current.toLocaleString('fr-FR')} / F CFA ${goal.target.toLocaleString('fr-FR')}</div>
                    <div class="vault-progress-bar">
                        <div class="vault-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="vault-goal-date">Objectif : ${formatVaultDate(goal.date)}</div>
                </div>
            </div>
            <div class="vault-goal-actions">
                <button onclick="contributeToGoal(${goal.id})" class="vault-contribute-btn">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        
        container.appendChild(goalElement);
    });
}

function renderVaultHistory() {
    const container = document.getElementById('vault-history-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const recentTransactions = vaultHistory.slice(0, 3);
    
    recentTransactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        
        const icon = transaction.type === 'deposit' ? 'plus-circle' : 'minus-circle';
        const iconColor = transaction.type === 'deposit' ? '#4CAF50' : '#FF5722';
        const amountPrefix = transaction.type === 'deposit' ? '+' : '-';
        
        transactionElement.innerHTML = `
            <div class="transaction-icon" style="background: ${iconColor}20; color: ${iconColor};">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="transaction-info">
                <div class="transaction-title">${transaction.description}</div>
                <div class="transaction-subtitle">${formatVaultDate(transaction.date)}${transaction.goal ? ' • ' + transaction.goal : ''}</div>
            </div>
            <div class="transaction-amount" style="color: ${iconColor};">
                ${amountPrefix}F CFA ${transaction.amount.toLocaleString('fr-FR')}
            </div>
        `;
        
        container.appendChild(transactionElement);
    });
}

function openVaultDepositModal() {
    const modal = document.getElementById('vault-deposit-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeVaultDepositModal() {
    const modal = document.getElementById('vault-deposit-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        const input = document.getElementById('vault-deposit-amount');
        if (input) input.value = '';
    }
}

function openVaultWithdrawModal() {
    const modal = document.getElementById('vault-withdraw-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeVaultWithdrawModal() {
    const modal = document.getElementById('vault-withdraw-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        const amountInput = document.getElementById('vault-withdraw-amount');
        const reasonInput = document.getElementById('vault-withdraw-reason');
        if (amountInput) amountInput.value = '';
        if (reasonInput) reasonInput.value = '';
    }
}

function openVaultAddGoalModal() {
    const modal = document.getElementById('vault-add-goal-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeVaultAddGoalModal() {
    const modal = document.getElementById('vault-add-goal-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        const nameInput = document.getElementById('vault-goal-name');
        const targetInput = document.getElementById('vault-goal-target');
        const dateInput = document.getElementById('vault-goal-date');
        if (nameInput) nameInput.value = '';
        if (targetInput) targetInput.value = '';
        if (dateInput) dateInput.value = '';
        vaultGoalIcon = 'plane';
    }
}

function setVaultQuickAmount(amount) {
    const input = document.getElementById('vault-deposit-amount');
    if (input) input.value = amount;
}

function setVaultQuickWithdrawAmount(amount) {
    const input = document.getElementById('vault-withdraw-amount');
    if (input) input.value = amount;
}

function selectVaultGoalIcon(icon) {
    vaultGoalIcon = icon;
    document.querySelectorAll('.vault-quick-amount').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.closest('.vault-quick-amount').classList.add('selected');
}

function confirmVaultDeposit() {
    const amount = parseFloat(document.getElementById('vault-deposit-amount').value);
    if (!amount || amount <= 0) {
        alert('Veuillez saisir un montant valide');
        return;
    }
    
    const newTransaction = {
        id: Date.now(),
        type: 'deposit',
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        description: 'Dépôt dans le coffre-fort',
        goal: null
    };
    
    vaultHistory.unshift(newTransaction);
    vaultBalance += amount;
    
    updateVaultBalance();
    renderVaultHistory();
    closeVaultDepositModal();
    
    showVaultNotification('Dépôt effectué avec succès !', 'success');
}

function confirmVaultWithdrawal() {
    const amount = parseFloat(document.getElementById('vault-withdraw-amount').value);
    if (!amount || amount <= 0) {
        alert('Veuillez saisir un montant valide');
        return;
    }
    
    if (amount > vaultBalance) {
        alert('Solde insuffisant dans le coffre-fort');
        return;
    }
    
    const newTransaction = {
        id: Date.now(),
        type: 'withdrawal',
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        description: 'Retrait du coffre-fort',
        goal: null
    };
    
    vaultHistory.unshift(newTransaction);
    vaultBalance -= amount;
    
    updateVaultBalance();
    renderVaultHistory();
    closeVaultWithdrawModal();
    
    showVaultNotification('Retrait effectué avec succès !', 'success');
}

function addVaultSavingsGoal() {
    const name = document.getElementById('vault-goal-name').value.trim();
    const target = parseFloat(document.getElementById('vault-goal-target').value);
    const date = document.getElementById('vault-goal-date').value;
    
    if (!name || !target || !date) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    const newGoal = {
        id: Date.now(),
        name: name,
        target: target,
        current: 0,
        date: date,
        icon: vaultGoalIcon
    };
    
    vaultSavingsGoals.push(newGoal);
    renderVaultSavingsGoals();
    closeVaultAddGoalModal();
    
    showVaultNotification('Objectif créé avec succès !', 'success');
}

function contributeToGoal(goalId) {
    const goal = vaultSavingsGoals.find(g => g.id === goalId);
    if (!goal) return;
    
    const amount = prompt(`Montant à contribuer pour "${goal.name}" :`);
    const contributionAmount = parseFloat(amount);
    
    if (!contributionAmount || contributionAmount <= 0) return;
    
    if (contributionAmount > vaultBalance) {
        alert('Solde insuffisant dans le coffre-fort');
        return;
    }
    
    goal.current = Math.min(goal.current + contributionAmount, goal.target);
    renderVaultSavingsGoals();
    
    if (goal.current >= goal.target) {
        showVaultNotification(`🎉 Objectif "${goal.name}" atteint !`, 'success');
    } else {
        showVaultNotification('Contribution ajoutée avec succès !', 'success');
    }
}

function showVaultHistory() {
    alert('Historique détaillé en cours de développement');
}

function showAllVaultHistory() {
    alert('Historique complet en cours de développement');
}

function showVaultNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `vault-notification vault-notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('vault-notification-show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('vault-notification-show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function formatVaultDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

// Initialisation du coffre-fort
document.addEventListener('DOMContentLoaded', () => {
    const originalSwitchTab = window.switchTab;
    window.switchTab = function(tabName) {
        if (originalSwitchTab) {
            originalSwitchTab(tabName);
        }
        
        if (tabName === 'coffre-fort') {
            setTimeout(() => {
                initializeVaultPage();
            }, 100);
        }
    };
});

