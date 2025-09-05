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
        `Voulez-vous effectuer un virement de ${Number(amount).toLocaleString()} XAF vers ${beneficiary.name} ?`,
        'Confirmer',
        'Annuler',
        () => {
            showNotification(`Virement de ${Number(amount).toLocaleString()} XAF effectué avec succès`);
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
            amount: -42.99,
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
            amount: -5.80,
            icon: "☕",
            category: "Café"
        }
    ],
    notifications: [
        {
            id: 1,
            title: "Virement reçu",
            message: "Vous avez reçu 150,00XAF de Marie Lambert",
            date: "Il y a 2 heures",
            read: false
        },
        {
            id: 2,
            title: "Paiement effectué",
            message: "Paiement de 42,99XAF à Amazon Marketplace",
            date: "Il y a 5 heures",
            read: false
        }
    ]
};

// État de la carte
let isCardFrozen = false;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    renderTransactions();
    updateNotificationBadge();
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
                ${transaction.amount > 0 ? '+' : ''}XAF ${Math.abs(transaction.amount).toLocaleString()}
            </div>
        `;
        container.appendChild(element);
    });
}

// Met à jour le badge de notification
function updateNotificationBadge() {
    const unreadCount = appData.notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
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
}

// Fonction pour geler/dégeler la carte
function toggleCardFreeze() {
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

// Toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
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

// Fonction de déconnexion
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        alert('Déconnexion réussie');
        // Redirection vers la page de login dans une vraie app
    }
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

// Fonctions pour la page IBAN
function copyIban() {
    const iban = document.querySelector('.iban-value').textContent;
    navigator.clipboard.writeText(iban).then(() => {
        showToast('IBAN copié dans le presse-papier');
    });
}

function shareIban() {
    const iban = document.querySelector('.iban-value').textContent;
    if (navigator.share) {
        navigator.share({
            title: 'Mon IBAN K-BANK',
            text: `Voici mon IBAN: ${iban}`
        }).catch(() => {
            showToast('Partage non disponible');
        });
    } else {
        copyIban();
    }
}

function downloadIban() {
    showToast('Téléchargement du RIB en cours...');
    // Simulation du téléchargement
    setTimeout(() => {
        showToast('RIB téléchargé avec succès');
    }, 1500);
}