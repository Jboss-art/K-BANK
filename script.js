// ===========================================
// SYSTÈME D'AUTHENTIFICATION
// ===========================================

// ===========================================
// SYSTÈME DE GESTION DES SOLDES
// ===========================================

let userBalances = {
    main: 780245,           // Solde principal en F CFA
    professional: 2450800,  // Solde professionnel en F CFA
    monthlyRevenue: 245200, // Revenus mensuels
    monthlyExpenses: 133274 // Dépenses mensuelles
};

// Fonction pour mettre à jour l'affichage des soldes
function updateBalanceDisplay() {
    // Mise à jour du solde principal sur la page d'accueil
    const mainBalanceElement = document.querySelector('.balance-amount');
    if (mainBalanceElement) {
        mainBalanceElement.innerHTML = `<span class="currency-symbol">F</span> <span class="currency-code">cfa</span> ${userBalances.main.toLocaleString('fr-FR')},<small>00</small>`;
    }
    
    // Mise à jour des revenus mensuels
    const revenueElement = document.querySelector('.balance-detail .detail-value');
    if (revenueElement) {
        revenueElement.innerHTML = `<span class="currency-symbol">F</span> <span class="currency-code">cfa</span> ${userBalances.monthlyRevenue.toLocaleString('fr-FR')},<small>00</small>`;
    }
    
    // Mise à jour des dépenses mensuelles
    const expenseElements = document.querySelectorAll('.balance-detail .detail-value');
    if (expenseElements.length > 1) {
        expenseElements[1].innerHTML = `<span class="currency-symbol">F</span> <span class="currency-code">cfa</span> ${userBalances.monthlyExpenses.toLocaleString('fr-FR')},<small>00</small>`;
    }
    
    // Mise à jour des options de compte dans le coffre-fort
    const mainAccountOption = document.querySelector('option[value="main"]');
    if (mainAccountOption) {
        mainAccountOption.textContent = `Compte principal (${userBalances.main.toLocaleString('fr-FR')} Fcfa)`;
    }
    
    const professionalAccountOption = document.querySelector('option[value="professional"]');
    if (professionalAccountOption) {
        professionalAccountOption.textContent = `Compte professionnel (${userBalances.professional.toLocaleString('fr-FR')} Fcfa)`;
    }
}

// Fonction pour effectuer une transaction (débit/crédit)
function performTransaction(amount, type, account = 'main') {
    const numAmount = Number(amount);
    
    if (type === 'debit') {
        if (userBalances[account] >= numAmount) {
            userBalances[account] -= numAmount;
            updateBalanceDisplay();
            return true;
        } else {
            showNotification('Solde insuffisant', 'error');
            return false;
        }
    } else if (type === 'credit') {
        userBalances[account] += numAmount;
        updateBalanceDisplay();
        return true;
    }
    
    return false;
}

class PinAuth {
    constructor() {
        this.pin = '';
        this.correctPin = '123456'; // Code PIN à 6 chiffres
        this.pinInputs = document.querySelectorAll('.pin-input');
        this.keyButtons = document.querySelectorAll('.key-button');
        this.errorMessage = document.querySelector('.error-message');
        this.loading = document.querySelector('.loading');
        this.authCard = document.querySelector('.auth-card');
        this.authOverlay = document.getElementById('auth-overlay');
        this.appContainer = document.getElementById('app-container');
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.keyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const key = e.currentTarget.dataset.key;
                this.handleKeyPress(key);
            });
        });

        // Gestion du clavier physique
        document.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9') {
                this.handleKeyPress(e.key);
            } else if (e.key === 'Backspace') {
                this.handleKeyPress('delete');
            } else if (e.key === 'Enter') {
                if (this.pin.length === 6) {
                    this.verifyPin();
                }
            }
        });
    }

    handleKeyPress(key) {
        if (key === 'delete') {
            this.deleteDigit();
        } else if (this.pin.length < 6) {
            this.addDigit(key);
        }
    }

    addDigit(digit) {
        this.pin += digit;
        this.updateDisplay();
        
        if (this.pin.length === 6) {
            setTimeout(() => this.verifyPin(), 500);
        }
    }

    deleteDigit() {
        this.pin = this.pin.slice(0, -1);
        this.updateDisplay();
        this.hideError();
    }

    updateDisplay() {
        this.pinInputs.forEach((input, index) => {
            if (index < this.pin.length) {
                input.value = '•';
                input.classList.add('filled');
            } else {
                input.value = '';
                input.classList.remove('filled');
            }
        });
    }

    verifyPin() {
        this.showLoading();
        
        setTimeout(() => {
            if (this.pin === this.correctPin) {
                this.onSuccess();
            } else {
                this.onError();
            }
        }, 1500);
    }

    onSuccess() {
        this.hideLoading();
        this.authOverlay.classList.add('fade-out');
        
        setTimeout(() => {
            this.authOverlay.style.display = 'none';
            this.appContainer.style.display = 'block';
            // Initialiser l'application après l'authentification
            this.initializeApp();
        }, 800);
    }

    onError() {
        this.hideLoading();
        this.showError();
        this.shakeCard();
        this.clearPin();
    }

    showLoading() {
        this.loading.classList.add('show');
    }

    hideLoading() {
        this.loading.classList.remove('show');
    }

    showError() {
        this.errorMessage.classList.add('show');
    }

    hideError() {
        this.errorMessage.classList.remove('show');
    }

    shakeCard() {
        this.authCard.classList.add('shake');
        setTimeout(() => {
            this.authCard.classList.remove('shake');
        }, 500);
    }

    clearPin() {
        this.pin = '';
        this.updateDisplay();
    }

    initializeApp() {
        // Initialiser l'application principale après l'authentification
        updateBalanceDisplay();
        renderTransactions();
        updateNotificationBadge();
        initializeSpecificPages();
        renderVaultCarousel(); // Initialiser le carousel du coffre-fort
        updateVaultDisplay(); // Initialiser l'affichage du coffre-fort
        console.log('Application initialisée après authentification');
    }
}

// Variables globales pour la gestion des cartes
let isCardFrozen = false;

// Fonction pour geler/dégeler la carte - accessible globalement
window.toggleCardFreeze = function() {
    console.log('toggleCardFreeze called, isCardFrozen:', isCardFrozen);
    const card = document.querySelector('.modern-card') || document.querySelector('.bank-card');
    
    // Si la carte est bloquée, ne rien faire
    if (card && card.classList.contains('blocked')) {
        console.log('Card is blocked, cannot freeze/unfreeze');
        return;
    }

    if (!isCardFrozen) {
        console.log('Attempting to freeze card');
        if (typeof showConfirmDialog === 'function') {
            showConfirmDialog(
                "Geler la carte",
                "Êtes-vous sûr de vouloir geler votre carte ? Elle ne pourra plus être utilisée temporairement pour les paiements.",
                "Geler",
                "Annuler",
                freezeCard,
                'fas fa-snowflake',
                '#007bff'
            );
        } else {
            // Fallback si showConfirmDialog n'est pas disponible
            if (confirm("Êtes-vous sûr de vouloir geler votre carte ?")) {
                freezeCard();
            }
        }
    } else {
        console.log('Attempting to unfreeze card');
        unfreezeCard();
    }
};

// Fonctions de gel/dégel
function freezeCard() {
    console.log('freezeCard called');
    isCardFrozen = true;
    const card = document.getElementById('main-card');
    const freezeText = document.getElementById('freeze-text');
    
    console.log('Elements found:', { card, freezeText });
    
    if (card) {
        card.classList.add('frozen');
    }
    if (freezeText) {
        freezeText.textContent = 'Dégeler';
    }
    
    // Fallback pour notification
    if (typeof showToast === 'function') {
        showToast('Carte gelée avec succès');
    } else {
        console.log('Carte gelée avec succès');
    }
}

function unfreezeCard() {
    console.log('unfreezeCard called');
    isCardFrozen = false;
    const card = document.getElementById('main-card');
    const freezeText = document.getElementById('freeze-text');
    
    console.log('Elements found:', { card, freezeText });
    
    if (card) {
        card.classList.remove('frozen');
    }
    if (freezeText) {
        freezeText.textContent = 'Geler';
    }
    
    // Fallback pour notification
    if (typeof showToast === 'function') {
        showToast('Carte dégelée avec succès');
    } else {
        console.log('Carte dégelée avec succès');
    }
}

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
    // Initialiser le système d'authentification
    new PinAuth();
    
    // Le reste de l'initialisation se fera après l'authentification
});

// Fonction pour initialiser les pages spécifiques
function initializeSpecificPages() {
    // Vérifier si nous sommes sur la page de virement
    const virementPage = document.getElementById('virement-page');
    if (virementPage && virementPage.classList.contains('active')) {
        renderVirementBeneficiaries();
        populateVirementBeneficiarySelect();
    }
    
    // Initialiser la page de recharge
    initializeTopupPage();
    
    // Initialiser les écouteurs de glissement pour la page d'accueil
    initializeHomeSwipeListeners();
    
    // Initialiser le carrousel des partenaires K-Shop
    initCarouselIndicators();
    startCarouselAutoScroll();
    
    // Initialiser le thème
    initializeTheme();
    
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
}

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
        `Voulez-vous effectuer un virement de ${Number(amount).toLocaleString()} F <h6>cfa</h6> vers ${beneficiary.name} ?`,
        'Confirmer',
        'Annuler',
        () => {
            // Déduire le montant du solde principal
            if (performTransaction('debit', 'main', Number(amount))) {
                showNotification('Virement effectué avec succès');
                updateBalanceDisplay();
            } else {
                showNotification('Solde insuffisant pour effectuer ce virement', 'error');
                return;
            }
            
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
        `Transférer ${Number(amount).toLocaleString()} F <h6>cfa</h6> vers ${name} (${phone}) via ${methodNames[selectedTransferMethod]} ?`,
        'Confirmer',
        'Annuler',
        () => {
            // Déduire le montant du solde principal
            if (performTransaction('debit', 'main', Number(amount))) {
                showNotification('Transfert initié avec succès');
                updateBalanceDisplay();
            } else {
                showNotification('Solde insuffisant pour effectuer ce transfert', 'error');
                return;
            }
            
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
            message: "Vous avez reçu 15000,00 de Jean Mvoumbi",
            date: "Il y a 2 heures",
            read: false,
            type: "transaction"
        },
        {
            id: 2,
            title: "Paiement effectué",
            message: "Paiement de 35000,00 à Supermarché ABC",
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
}

// Affiche les notifications dans les sections appropriées
function renderNotifications() {
    const unreadContainer = document.getElementById('unread-notifications');
    const readContainer = document.getElementById('read-notifications');
    const emptyState = document.getElementById('empty-notifications');
    const unreadSection = document.getElementById('unread-section');
    const readSection = document.getElementById('read-section');
    const unreadCountElement = document.getElementById('unread-count');
    
    if (!unreadContainer || !readContainer) return;
    
    // Séparer les notifications lues et non lues
    const unreadNotifications = appData.notifications.filter(n => !n.read);
    const readNotifications = appData.notifications.filter(n => n.read);
    
    // Mettre à jour le compteur de notifications non lues
    if (unreadCountElement) {
        unreadCountElement.textContent = unreadNotifications.length;
        unreadCountElement.style.display = unreadNotifications.length > 0 ? 'inline-block' : 'none';
    }
    
    // Si aucune notification
    if (appData.notifications.length === 0) {
        emptyState.style.display = 'block';
        unreadSection.style.display = 'none';
        readSection.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Afficher/masquer les sections selon le contenu
    unreadSection.style.display = unreadNotifications.length > 0 ? 'block' : 'none';
    readSection.style.display = readNotifications.length > 0 ? 'block' : 'none';
    
    // Rendre les notifications non lues
    unreadContainer.innerHTML = unreadNotifications.length > 0 
        ? renderNotificationItems(unreadNotifications) 
        : '<div class="no-notifications"><p>Aucune nouvelle notification</p></div>';
    
    // Rendre les notifications lues
    readContainer.innerHTML = readNotifications.length > 0 
        ? renderNotificationItems(readNotifications) 
        : '<div class="no-notifications"><p>Aucune notification lue</p></div>';
}

// Génère le HTML pour une liste de notifications
function renderNotificationItems(notifications) {
    return notifications.map((notification, index) => {
        // Extraire le montant du message s'il y en a un
        const amountMatch = notification.message.match(/(-?\d+(?:[.,]\d{2})?)/);
        let formattedMessage = notification.message;
        
        if (amountMatch) {
            const amount = parseFloat(amountMatch[0].replace(',', '.'));
            const formattedAmount = `<strong>${amount < 0 ? '-' : ''}${Math.abs(amount).toLocaleString()} Fcfa</strong>`;
            formattedMessage = notification.message.replace(amountMatch[0], formattedAmount);
        }

        return `
            <div class="notification-item ${notification.read ? '' : 'unread'}" 
                 data-id="${notification.id}" 
                 style="animation-delay: ${index * 0.1}s"
                 onclick="markNotificationAsRead(${notification.id})">
                <div class="notification-content">
                    <div class="notification-icon ${notification.type}">
                        <i class="${getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-text">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${formattedMessage}</div>
                        <div class="notification-time">
                            <i class="fas fa-clock"></i>
                            ${notification.date}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Retourne l'icône appropriée selon le type de notification
function getNotificationIcon(type) {
    switch(type) {
        case 'transaction': return 'fas fa-exchange-alt';
        case 'security': return 'fas fa-shield-alt';
        case 'promotion': return 'fas fa-gift';
        default: return 'fas fa-bell';
    }
}

// Marque une notification spécifique comme lue
function markNotificationAsRead(id) {
    const notification = appData.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
        notification.read = true;
        renderNotifications();
        updateNotificationBadge();
        
        // Animation de feedback
        showToast('Notification marquée comme lue');
    }
}

// Met à jour le badge de notifications
function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
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
    } else {
        showToast('Aucune nouvelle notification à marquer');
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

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    renderTransactions();
    updateNotificationBadge();
    
    // Toujours initialiser les notifications au chargement
    initializeNotifications();
    
    // Initialiser les notifications si on est sur la page notifications
    if (document.getElementById('notifications-page').classList.contains('active')) {
        renderNotifications();
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
                ${transaction.amount > 0 ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()} F <h6>cfa</h6>
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

    // Initialiser la page de recharge
    if (tab === 'topup') {
        setTimeout(() => {
            initializeTopupPage();
        }, 100);
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

    // Initialiser la page des coffres-forts
    if (tab === 'vaults') {
        setTimeout(() => {
            updateVaultDisplay();
            renderVaultCarousel();
        }, 100);
    }

    // Gérer l'affichage du bouton flottant K-Shop
    const kshopFloat = document.querySelector('.kshop-float');
    if (kshopFloat) {
        if (tab === 'kshop') {
            kshopFloat.style.display = 'none'; // Cacher le bouton sur la page K-Shop
            console.log('Bouton K-Shop caché - page kshop active');
        } else {
            kshopFloat.style.display = 'block'; // Afficher le bouton sur les autres pages
            console.log('Bouton K-Shop affiché - page:', tab);
        }
    } else {
        console.log('Bouton K-Shop non trouvé dans le DOM');
    }
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
    
    // Show/hide card form based on method
    toggleCardForm(method === 'card');
    
    // Enable/disable topup button
    updateTopupButton();
}

function updateTopupButton() {
    const amount = document.getElementById('topup-amount')?.value || '';
    const button = document.getElementById('topup-button');
    
    if (selectedPaymentMethod === 'card') {
        const cardNumber = document.getElementById('card-number')?.value || '';
        const cardExpiry = document.getElementById('card-expiry')?.value || '';
        const cardCvv = document.getElementById('card-cvv')?.value || '';
        const cardName = document.getElementById('card-name')?.value || '';
        
        button.disabled = !selectedPaymentMethod || !amount || !cardNumber || !cardExpiry || !cardCvv || !cardName;
    } else {
        const phone = document.getElementById('phone-number')?.value || '';
        button.disabled = !selectedPaymentMethod || !amount || !phone;
    }
}

function processTopup() {
    const amount = document.getElementById('topup-amount')?.value || '';
    
    if (!selectedPaymentMethod || !amount) {
        showToast('Veuillez remplir tous les champs requis');
        return;
    }
    
    let methodNames = {
        'moov': 'Moov Money',
        'airtel': 'Airtel Money',
        'western': 'Western Union',
        'card': 'Carte bancaire'
    };
    
    // Validation spécifique selon le mode de paiement
    if (selectedPaymentMethod === 'card') {
        const cardNumber = document.getElementById('card-number')?.value || '';
        const cardExpiry = document.getElementById('card-expiry')?.value || '';
        const cardCvv = document.getElementById('card-cvv')?.value || '';
        const cardName = document.getElementById('card-name')?.value || '';
        
        if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
            showToast('Veuillez remplir toutes les informations de la carte');
            return;
        }
        
        // Validation du numéro de carte (basique)
        if (cardNumber.replace(/\s/g, '').length < 16) {
            showToast('Numéro de carte invalide');
            return;
        }
    } else {
        const phone = document.getElementById('phone-number')?.value || '';
        if (!phone) {
            showToast('Veuillez saisir votre numéro de téléphone');
            return;
        }
    }
    
    showConfirmDialog(
        'Confirmer la recharge',
        `Voulez-vous recharger ${Number(amount).toLocaleString()} F CFA via ${methodNames[selectedPaymentMethod]} ?`,
        'Confirmer',
        'Annuler',
        () => {
            showToast('Traitement du paiement en cours...');
            // Simulate payment processing
            setTimeout(() => {
                // Ajouter le montant au solde principal
                if (performTransaction(Number(amount), 'credit', 'main')) {
                    showToast('Compte rechargé avec succès !');
                    
                    // Reset form
                    document.getElementById('topup-amount').value = '';
                    if (selectedPaymentMethod === 'card') {
                        document.getElementById('card-number').value = '';
                        document.getElementById('card-expiry').value = '';
                        document.getElementById('card-cvv').value = '';
                        document.getElementById('card-name').value = '';
                    } else {
                        document.getElementById('phone-number').value = '';
                    }
                    selectedPaymentMethod = null;
                    
                    // Reset UI
                    document.querySelectorAll('.payment-method').forEach(el => {
                        el.classList.remove('selected');
                    });
                    
                    // Hide card form if it was shown
                    toggleCardForm(false);
                    
                    // Return to home after 1.5 seconds
                    setTimeout(() => switchTab('home'), 1500);
                }
            }, 2000);
        }
    );
}

function resetForm() {
    document.getElementById('topup-amount').value = '';
    document.getElementById('phone-number').value = '';
    selectedPaymentMethod = null;
    
    // Reset UI selections
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    
    updateTopupButton();
}

// Fonction pour afficher/masquer le formulaire de carte
function toggleCardForm(show) {
    const cardForm = document.getElementById('card-form');
    const phoneForm = document.getElementById('phone-form');
    
    if (cardForm && phoneForm) {
        if (show) {
            cardForm.style.display = 'block';
            phoneForm.style.display = 'none';
        } else {
            cardForm.style.display = 'none';
            phoneForm.style.display = 'block';
        }
    }
}

// Formatage du numéro de carte
function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = '';
    
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    
    input.value = formattedValue.substring(0, 19); // Max 16 digits + 3 spaces
    updateTopupButton();
}

// Formatage de la date d'expiration
function formatCardExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    input.value = value;
    updateTopupButton();
}

// Validation CVV
function formatCardCvv(input) {
    input.value = input.value.replace(/\D/g, '').substring(0, 3);
    updateTopupButton();
}

// Fonction d'initialisation de la page de recharge
function initializeTopupPage() {
    // S'assurer que les formulaires sont masqués au début
    const phoneForm = document.getElementById('phone-form');
    const cardForm = document.getElementById('card-form');
    
    if (phoneForm) phoneForm.style.display = 'none';
    if (cardForm) cardForm.style.display = 'none';
    
    // Réinitialiser la sélection de méthode de paiement
    selectedPaymentMethod = null;
    
    // Désactiver le bouton de recharge au début
    const topupButton = document.getElementById('topup-button');
    if (topupButton) {
        topupButton.disabled = true;
    }
    
    // Retirer toutes les sélections
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
}

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
        'Voulez-vous bloquer votre carte ? Celle-ci ne pourra plus être utilisée.',
        'Bloquer',
        'Annuler',
        () => {
            const card = document.getElementById('main-card');
            const freezeButton = document.querySelector('.freeze-button');
            
            card.classList.add('blocked');

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
    switchTab('kshop');
    
    // Double vérification pour s'assurer que le bouton est caché
    setTimeout(() => {
        const kshopFloat = document.querySelector('.kshop-float');
        if (kshopFloat) {
            kshopFloat.style.display = 'none';
            console.log('Bouton K-Shop forcé à se cacher via openKShop()');
        }
    }, 100);
}

// Carrousel des partenaires
let currentPartnerIndex = 0;
const partnersData = ['ckdo', 'mbolo', 'kfc', 'paul'];

function nextPartner() {
    currentPartnerIndex = (currentPartnerIndex + 1) % partnersData.length;
    updateCarousel();
}

function previousPartner() {
    currentPartnerIndex = (currentPartnerIndex - 1 + partnersData.length) % partnersData.length;
    updateCarousel();
}

function updateCarousel() {
    const carousel = document.getElementById('partners-carousel');
    const indicators = document.querySelectorAll('.indicator');
    const cards = document.querySelectorAll('.partner-card.featured');
    
    if (carousel && cards.length > 0) {
        // Déplacer le carrousel avec la nouvelle largeur
        const cardWidth = 252; // 240px + 12px gap
        carousel.scrollTo({
            left: currentPartnerIndex * cardWidth,
            behavior: 'smooth'
        });
        
        // Mettre à jour les indicateurs
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentPartnerIndex);
        });
        
        // Mettre à jour les cartes actives
        cards.forEach((card, index) => {
            card.classList.toggle('active', index === currentPartnerIndex);
        });
    }
}

// Gestion des clics sur les indicateurs
function initCarouselIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentPartnerIndex = index;
            updateCarousel();
        });
    });
}

// Auto-scroll du carrousel
function startCarouselAutoScroll() {
    setInterval(() => {
        if (document.querySelector('.kshop-page.active')) {
            nextPartner();
        }
    }, 4000); // Change toutes les 4 secondes
}

// Gestion du thème
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    body.setAttribute('data-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Animation du toggle
    const sliders = document.querySelectorAll('.theme-toggle-slider');
    sliders.forEach(slider => {
        if (slider) {
            slider.style.transform = newTheme === 'light' ? 'translateX(24px)' : 'translateX(0)';
        }
    });
    
    console.log(`Thème basculé vers: ${newTheme}`);
}

// Initialiser le thème au chargement
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const body = document.body;
    
    body.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Mettre à jour le slider
    const slider = document.querySelector('.theme-toggle-slider');
    if (slider) {
        slider.style.transform = savedTheme === 'light' ? 'translateX(24px)' : 'translateX(0)';
    }
    
    console.log(`Thème initialisé: ${savedTheme}`);
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

let vaultBalance = 300000;
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

// Structure modifiée pour gérer plusieurs coffres-forts
let vaults = [
    {
        id: 1,
        name: 'Coffre-Fort Principal',
        description: 'Mon coffre-fort principal',
        icon: 'key',
        balance: 300000,
        goal: null,
        history: [
            {
                id: 1,
                type: 'deposit',
                amount: 120000,
                description: 'Dépôt initial',
                date: new Date(2024, 8, 15), // 15 septembre 2024
                goal: null
            },
            {
                id: 2,
                type: 'deposit',
                amount: 60000,
                description: 'Épargne mensuelle',
                date: new Date(2024, 9, 1), // 1 octobre 2024
                goal: null
            },
            {
                id: 3,
                type: 'deposit',
                amount: 70000,
                description: 'Prime de fin d\'année',
                date: new Date(2024, 11, 20), // 20 décembre 2024
                goal: null
            },
            {
                id: 4,
                type: 'withdraw',
                amount: 25000,
                description: 'Frais médicaux',
                date: new Date(2025, 1, 10), // 10 février 2025
                goal: null
            },
            {
                id: 5,
                type: 'deposit',
                amount: 35000,
                description: 'Économies février',
                date: new Date(2025, 1, 28), // 28 février 2025
                goal: null
            },
            {
                id: 6,
                type: 'deposit',
                amount: 40000,
                description: 'Épargne mars',
                date: new Date(2025, 2, 15), // 15 mars 2025
                goal: null
            },
            {
                id: 7,
                type: 'withdraw',
                amount: 20000,
                description: 'Achat équipement',
                date: new Date(2025, 3, 5), // 5 avril 2025
                goal: null
            },
            {
                id: 8,
                type: 'deposit',
                amount: 25000,
                description: 'Épargne avril',
                date: new Date(2025, 3, 30), // 30 avril 2025
                goal: null
            },
            {
                id: 9,
                type: 'deposit',
                amount: 20000,
                description: 'Bonus travail',
                date: new Date(2025, 7, 10), // 10 août 2025
                goal: null
            },
            {
                id: 10,
                type: 'withdraw',
                amount: 25000,
                description: 'Frais divers',
                date: new Date(2025, 8, 20), // 20 septembre 2025
                goal: null
            }
        ],
        isMain: true
    }
]; // Liste des coffres-forts disponibles
let currentVaultIndex = 0; // Index du coffre-fort actuel

function getCurrentVault() {
    return vaults[currentVaultIndex] || vaults[0];
}

function renderVaultCarousel() {
    const carouselContainer = document.getElementById('vault-carousel');
    const indicatorsContainer = document.getElementById('vault-indicators');
    
    if (!carouselContainer) return;
    
    // Générer les slides des coffres-forts
    carouselContainer.innerHTML = '';
    vaults.forEach((vault, index) => {
        const slide = document.createElement('div');
        slide.className = 'vault-slide';
        slide.innerHTML = `
            <div class="vault-balance-card">
                <div class="balance-title">
                    <i class="fas fa-${vault.icon} vault-icon"></i>
                    <span class="vault-name">${vault.name}</span>
                </div>
                <div class="balance-amount" id="vault-total-${index}">
                    <span class="currency-symbol">F</span> 
                    <span class="currency-code">cfa</span> 
                    ${vault.balance.toLocaleString('fr-FR')},<small>00</small>
                </div>
            </div>
        `;
        carouselContainer.appendChild(slide);
    });
    
    // Générer les indicateurs
    if (indicatorsContainer) {
        indicatorsContainer.innerHTML = '';
        vaults.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = `vault-indicator ${index === currentVaultIndex ? 'active' : ''}`;
            indicator.onclick = () => goToVault(index);
            indicatorsContainer.appendChild(indicator);
        });
    }
    
    // Mettre à jour la position du carrousel
    updateCarouselPosition();
    
    // Mettre à jour les boutons de navigation
    updateNavigationButtons();
}

function updateCarouselPosition() {
    const carouselContainer = document.getElementById('vault-carousel');
    if (carouselContainer) {
        const translateX = -currentVaultIndex * 100;
        carouselContainer.style.transform = `translateX(${translateX}%)`;
    }
}

// Fonction utilitaire pour forcer la mise à jour complète de l'affichage des coffres-forts
function forceVaultUpdate() {
    setTimeout(() => {
        renderVaultCarousel();
        renderVaultGoal();
        renderVaultHistory();
        updateNavigationButtons();
        updateIndicators();
    }, 100);
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('vault-prev');
    const nextBtn = document.getElementById('vault-next');
    
    if (prevBtn) {
        prevBtn.classList.toggle('hidden', currentVaultIndex === 0);
    }
    
    if (nextBtn) {
        nextBtn.classList.toggle('hidden', currentVaultIndex === vaults.length - 1);
    }
}

function updateIndicators() {
    const indicators = document.querySelectorAll('.vault-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentVaultIndex);
    });
}

function goToVault(index) {
    if (index < 0 || index >= vaults.length) return;
    
    currentVaultIndex = index;
    updateCarouselPosition();
    updateIndicators();
    updateNavigationButtons();
    renderVaultGoal();
    renderVaultHistory();
}

function nextVault() {
    if (currentVaultIndex < vaults.length - 1) {
        goToVault(currentVaultIndex + 1);
    }
}

function previousVault() {
    if (currentVaultIndex > 0) {
        goToVault(currentVaultIndex - 1);
    }
}

function switchToVault(index) {
    goToVault(index);
}

function updateVaultDisplay() {
    renderVaultCarousel();
    renderVaultGoal();
    renderVaultHistory();
}

function renderVaultGoal() {
    const container = document.getElementById('vault-goal-container');
    const noGoalMessage = document.getElementById('no-goal-message');
    const addGoalLink = document.getElementById('add-goal-link');
    
    console.log('renderVaultGoal - Éléments trouvés:', { container, noGoalMessage, addGoalLink });
    
    if (!container) {
        console.error('vault-goal-container non trouvé');
        return;
    }
    
    const currentVault = getCurrentVault();
    console.log('renderVaultGoal - Coffre-fort actuel:', currentVault);
    
    if (currentVault && currentVault.goal) {
        console.log('renderVaultGoal - Objectif trouvé:', currentVault.goal);
        
        if (noGoalMessage) {
            noGoalMessage.style.display = 'none';
        }
        if (addGoalLink) {
            addGoalLink.textContent = 'Modifier';
        }
        
        const progressPercent = Math.min((currentVault.goal.current / currentVault.goal.target) * 100, 100);
        
        container.innerHTML = `
            <div class="vault-savings-goal">
                <div class="vault-goal-info">
                    <div class="vault-goal-icon">
                        <i class="fas fa-${currentVault.goal.icon}"></i>
                    </div>
                    <div class="vault-goal-details">
                        <div class="vault-goal-name">${currentVault.goal.name}</div>
                        <div class="vault-goal-amount">${currentVault.goal.current.toLocaleString('fr-FR')} Fcfa / ${currentVault.goal.target.toLocaleString('fr-FR')} Fcfa</div>
                        <div class="vault-progress-bar">
                            <div class="vault-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="vault-goal-date">Objectif : ${formatVaultDate(currentVault.goal.date)}</div>
                    </div>
                </div>
                <div class="vault-goal-actions">
                    <button onclick="contributeToGoal()" class="vault-contribute-btn">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        
        console.log('renderVaultGoal - Objectif affiché avec succès');
    } else {
        console.log('renderVaultGoal - Aucun objectif trouvé');
        
        if (noGoalMessage) {
            noGoalMessage.style.display = 'block';
        }
        if (addGoalLink) {
            addGoalLink.textContent = 'Ajouter';
        }
        container.innerHTML = '';
    }
}

function renderVaultHistory() {
    renderVaultDeposits();
    renderVaultWithdrawals();
}

function renderVaultDeposits() {
    const container = document.getElementById('vault-deposits-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const currentVault = getCurrentVault();
    const deposits = currentVault.history
        .filter(t => t.type === 'deposit')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
    
    if (deposits.length === 0) {
        container.innerHTML = '<div class="no-transactions">Aucun dépôt récent</div>';
        return;
    }
    
    deposits.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        
        transactionElement.innerHTML = `
            <div class="transaction-icon" style="background: #22c55e20; color: #22c55e;">
                <i class="fas fa-plus-circle"></i>
            </div>
            <div class="transaction-info">
                <div class="transaction-title">${transaction.description}</div>
                <div class="transaction-subtitle">${formatVaultDate(transaction.date)}${transaction.goal ? ' • ' + transaction.goal : ''}</div>
            </div>
            <div class="transaction-amount" style="color: #22c55e;">
                +${transaction.amount.toLocaleString('fr-FR')} Fcfa
            </div>
        `;
        
        container.appendChild(transactionElement);
    });
}

function renderVaultWithdrawals() {
    const container = document.getElementById('vault-withdrawals-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const currentVault = getCurrentVault();
    const withdrawals = currentVault.history
        .filter(t => t.type === 'withdraw')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
    
    if (withdrawals.length === 0) {
        container.innerHTML = '<div class="no-transactions">Aucun retrait récent</div>';
        return;
    }
    
    withdrawals.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        
        transactionElement.innerHTML = `
            <div class="transaction-icon" style="background: #ef444420; color: #ef4444;">
                <i class="fas fa-minus-circle"></i>
            </div>
            <div class="transaction-info">
                <div class="transaction-title">${transaction.description}</div>
                <div class="transaction-subtitle">${formatVaultDate(transaction.date)}${transaction.goal ? ' • ' + transaction.goal : ''}</div>
            </div>
            <div class="transaction-amount" style="color: #ef4444;">
                -${transaction.amount.toLocaleString('fr-FR')} Fcfa
            </div>
        `;
        
        container.appendChild(transactionElement);
    });
}

// Fonctions pour afficher tous les historiques
function showAllVaultDeposits() {
    // Cette fonction pourrait ouvrir une modale ou naviguer vers une page dédiée
    const currentVault = getCurrentVault();
    const deposits = currentVault.history.filter(t => t.type === 'deposit');
    showVaultNotification(`${deposits.length} dépôt(s) au total`, 'info');
}

function showAllVaultWithdrawals() {
    // Cette fonction pourrait ouvrir une modale ou naviguer vers une page dédiée
    const currentVault = getCurrentVault();
    const withdrawals = currentVault.history.filter(t => t.type === 'withdraw');
    showVaultNotification(`${withdrawals.length} retrait(s) au total`, 'info');
}

function showAllVaultHistory() {
    // Fonction de compatibilité pour les anciens liens
    const currentVault = getCurrentVault();
    showVaultNotification(`${currentVault.history.length} transaction(s) au total`, 'info');
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
    
    // Déduire du solde principal pour déposer dans le coffre-fort
    if (!performTransaction('debit', 'main', amount)) {
        alert('Solde insuffisant dans le compte principal');
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
    updateBalanceDisplay();
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
    
    // Retirer du coffre-fort et ajouter au solde principal
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
    
    // Ajouter au solde principal
    performTransaction('credit', 'main', amount);
    
    updateVaultBalance();
    updateBalanceDisplay();
    renderVaultHistory();
    closeVaultWithdrawModal();
    
    showVaultNotification('Retrait effectué avec succès !', 'success');
}

function addVaultSavingsGoal() {
    console.log('addVaultSavingsGoal appelée');
    const name = document.getElementById('vault-goal-name').value.trim();
    const target = parseFloat(document.getElementById('vault-goal-target').value);
    const date = document.getElementById('vault-goal-date').value;
    
    console.log('Valeurs récupérées:', { name, target, date });
    
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
    
    console.log('Nouvel objectif créé:', newGoal);
    
    const currentVault = getCurrentVault();
    console.log('Coffre-fort actuel:', currentVault);
    
    currentVault.goal = newGoal; // Assigner l'objectif au coffre-fort actuel
    
    // Fermer la modale
    closeVaultAddGoalModal();
    
    // Forcer la mise à jour complète de l'affichage
    forceVaultUpdate();
    
    showVaultNotification('Objectif créé avec succès !', 'success');
    
    // Log pour vérifier que l'objectif a été ajouté
    console.log('Objectif ajouté au coffre-fort:', currentVault);
}

function contributeToGoal() {
    const currentVault = getCurrentVault();
    if (!currentVault.goal) return;
    
    const amount = prompt(`Montant à contribuer pour "${currentVault.goal.name}" :`);
    const contributionAmount = parseFloat(amount);
    
    if (!contributionAmount || contributionAmount <= 0) return;
    
    // Vérifier que l'utilisateur a assez de fonds
    if (userBalances.main < contributionAmount) {
        showVaultNotification('Solde insuffisant', 'error');
        return;
    }
    
    // Effectuer la transaction
    performTransaction(contributionAmount, 'debit', 'main');
    currentVault.goal.current += contributionAmount;
    currentVault.balance += contributionAmount;
    
    // Ajouter à l'historique du coffre-fort
    currentVault.history.unshift({
        id: Date.now(),
        type: 'deposit',
        amount: contributionAmount,
        description: `Contribution à ${currentVault.goal.name}`,
        date: new Date(),
        goal: currentVault.goal.name
    });
    
    renderVaultGoal();
    updateVaultDisplay();
    
    if (currentVault.goal.current >= currentVault.goal.target) {
        showVaultNotification(`🎉 Objectif "${currentVault.goal.name}" atteint !`, 'success');
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

// Initialisation de l'application
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
        
        if (tabName === 'others') {
            setTimeout(() => {
                initializeOthersPage();
            }, 100);
        }
    };
});

// ===== FONCTIONS PAGE AUTRES =====

// Initialisation de la page Autres
function initializeOthersPage() {
    // Animation d'entrée pour les sections
    const sections = document.querySelectorAll('.services-section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Services Bancaires
function openService(serviceType) {
    const messages = {
        'account': 'Ouverture de la gestion de compte...',
        'cards': 'Accès à la gestion des cartes...',
        'loans': 'Redirection vers les services de crédit...',
        'insurance': 'Ouverture des services d\'assurance...'
    };
    
    showToast(messages[serviceType] || 'Service en cours d\'ouverture...', 'info');
    
    // Ici vous pourriez rediriger vers des pages spécifiques
    setTimeout(() => {
        switch(serviceType) {
            case 'account':
                switchTab('profile');
                break;
            case 'cards':
                // Ouvrir une page dédiée aux cartes
                break;
            case 'loans':
                // Ouvrir une page de demande de crédit
                break;
            case 'insurance':
                // Ouvrir une page d'assurance
                break;
        }
    }, 1500);
}

// K-Shop
function openShop(shopType) {
    const shops = {
        'kfc': {
            name: 'KFC Gabon',
            message: 'Redirection vers KFC Gabon...',
            url: 'https://kfc-gabon.com'
        },
        'mbolo': {
            name: 'Mbolo Gabon',
            message: 'Redirection vers Mbolo Gabon...',
            url: 'https://mbolo-gabon.com'
        }
    };
    
    const shop = shops[shopType];
    if (shop) {
        showToast(shop.message, 'success');
        // Simuler l'ouverture du shop
        setTimeout(() => {
            showToast(`Bienvenue chez ${shop.name}!`, 'success');
        }, 1500);
    }
}

function suggestPartner() {
    showConfirmDialog(
        'Suggérer un partenaire',
        'Voulez-vous proposer un nouveau partenaire pour K-Shop ?',
        () => {
            showToast('Merci pour votre suggestion ! Nous examinerons votre demande.', 'success');
            // Ici vous pourriez ouvrir un formulaire ou rediriger vers un email
        },
        'fas fa-handshake'
    );
}

// Outils Financiers
function openTool(toolType) {
    const tools = {
        'budget': {
            name: 'Calculateur Budget',
            message: 'Ouverture du calculateur de budget...'
        },
        'exchange': {
            name: 'Taux de Change',
            message: 'Chargement des taux de change...'
        },
        'investment': {
            name: 'Simulateur Épargne',
            message: 'Lancement du simulateur d\'épargne...'
        }
    };
    
    const tool = tools[toolType];
    if (tool) {
        showToast(tool.message, 'info');
        
        setTimeout(() => {
            // Simuler l'ouverture de l'outil
            switch(toolType) {
                case 'budget':
                    openBudgetCalculator();
                    break;
                case 'exchange':
                    openExchangeRates();
                    break;
                case 'investment':
                    openInvestmentSimulator();
                    break;
            }
        }, 1500);
    }
}

function openBudgetCalculator() {
    showToast('Calculateur de budget disponible prochainement!', 'info');
    // Ici vous pourriez ouvrir une modal ou une nouvelle page
}

function openExchangeRates() {
    showToast('Taux de change - USD: 656 F <h6>cfa</h6> | EUR: 724 F <h6>cfa</h6>', 'info');
    // Ici vous pourriez afficher les vrais taux
}

function openInvestmentSimulator() {
    showToast('Simulateur d\'épargne disponible prochainement!', 'info');
    // Ici vous pourriez ouvrir un simulateur
}

// Support
function openFAQ() {
    showToast('Ouverture de la FAQ...', 'info');
    // Ici vous pourriez ouvrir une page FAQ dédiée
}

function openChat() {
    showToast('Chat en direct démarré! Un conseiller va vous répondre.', 'success');
    // Ici vous pourriez intégrer un widget de chat
}

function callSupport() {
    const phoneNumber = '+241 01 23 45 67';
    showConfirmDialog(
        'Appeler le Support',
        `Voulez-vous appeler le ${phoneNumber} ?`,
        () => {
            window.open(`tel:${phoneNumber}`);
            showToast('Appel en cours...', 'success');
        },
        'fas fa-phone'
    );
}

function scheduleCallback() {
    showToast('Planification de rappel disponible prochainement!', 'info');
    // Ici vous pourriez ouvrir un calendrier de réservation
}

// Paramètres
function toggleNotifications() {
    const toggle = document.getElementById('notif-toggle');
    const isEnabled = toggle.checked;
    
    showToast(
        isEnabled ? 'Notifications activées' : 'Notifications désactivées',
        isEnabled ? 'success' : 'info'
    );
}

function toggleBiometric() {
    const toggle = document.getElementById('bio-toggle');
    const isEnabled = toggle.checked;
    
    if (isEnabled) {
        // Simuler l'authentification biométrique
        showToast('Configuration de l\'empreinte digitale...', 'info');
        setTimeout(() => {
            showToast('Empreinte digitale configurée avec succès!', 'success');
        }, 2000);
    } else {
        showToast('Authentification biométrique désactivée', 'info');
    }
}

function openSecuritySettings() {
    showToast('Ouverture des paramètres de sécurité...', 'info');
    setTimeout(() => {
        switchTab('profile'); // Rediriger vers le profil pour les paramètres
    }, 1500);
}

// Fonction toast améliorée si elle n'existe pas
if (typeof showToast !== 'function') {
    function showToast(message, type = 'info') {
        // Supprimer les anciens toasts
        const existingToasts = document.querySelectorAll('.dynamic-toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Créer le nouveau toast
        const toast = document.createElement('div');
        toast.className = `dynamic-toast toast-${type}`;
        
        const colors = {
            'success': '#4CAF50',
            'error': '#f44336',
            'info': '#2196F3',
            'warning': '#ff9800'
        };
        
        toast.innerHTML = `
            <div style="
                position: fixed;
                top: 100px;
                left: 50%;
                transform: translateX(-50%) translateY(-20px);
                background: ${colors[type] || colors.info};
                color: white;
                padding: 12px 20px;
                border-radius: 12px;
                z-index: 10000;
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                font-weight: 500;
                font-size: 14px;
                max-width: 300px;
                text-align: center;
            ">
                ${message}
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animation d'entrée
        requestAnimationFrame(() => {
            const toastElement = toast.firstElementChild;
            toastElement.style.opacity = '1';
            toastElement.style.transform = 'translateX(-50%) translateY(0)';
        });
        
        // Animation de sortie
        setTimeout(() => {
            const toastElement = toast.firstElementChild;
            if (toastElement) {
                toastElement.style.opacity = '0';
                toastElement.style.transform = 'translateX(-50%) translateY(-20px)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        }, 3000);
    }
}

// Fonction pour faire basculer les éléments FAQ
function toggleFAQItem(element) {
    const isActive = element.classList.contains('active');
    
    // Fermer tous les autres éléments FAQ
    document.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== element) {
            item.classList.remove('active');
        }
    });
    
    // Basculer l'élément courant
    if (isActive) {
        element.classList.remove('active');
    } else {
        element.classList.add('active');
    }
}

// Nouvelles fonctions d'assistance améliorées
function openLiveChat() {
    // Simuler l'ouverture du chat en direct
    showModal({
        title: "Chat en Direct",
        content: `
            <div style="text-align: center; padding: 20px;">
                <div style="background: rgba(0, 255, 136, 0.1); padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                    <i class="fas fa-comments" style="color: #00ff88; font-size: 32px; margin-bottom: 10px;"></i>
                    <h3 style="color: white; margin: 10px 0;">Agent en ligne</h3>
                    <p style="color: rgba(255, 255, 255, 0.8); margin: 0;">Un agent va vous répondre dans quelques secondes...</p>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                        <div style="width: 32px; height: 32px; background: #7456ff; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-robot" style="color: white; font-size: 14px;"></i>
                        </div>
                        <div>
                            <strong style="color: white;">Agent K-Bank</strong>
                            <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px;">En ligne</div>
                        </div>
                    </div>
                    <p style="color: white; margin: 0; background: rgba(116, 86, 255, 0.2); padding: 10px; border-radius: 8px;">
                        👋 Bonjour ! Je suis là pour vous aider. Comment puis-je vous assister aujourd'hui ?
                    </p>
                </div>
            </div>
        `,
        buttons: [
            { text: "Démarrer le chat", action: () => showToast("Redirection vers le chat...", "success") },
            { text: "Fermer", action: () => {} }
        ]
    });
}

function callSupport() {
    // Simuler l'appel
    showModal({
        title: "Appel K-Bank Support",
        content: `
            <div style="text-align: center; padding: 20px;">
                <div style="background: rgba(116, 86, 255, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <i class="fas fa-phone-alt" style="color: #7456ff; font-size: 32px; margin-bottom: 15px;"></i>
                    <h3 style="color: white; margin-bottom: 10px;">+241 01 23 45 67</h3>
                    <p style="color: rgba(255, 255, 255, 0.8); margin: 0;">Service disponible 24h/24, 7j/7</p>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px;">
                    <h4 style="color: white; margin-bottom: 10px;">Avant d'appeler :</h4>
                    <ul style="color: rgba(255, 255, 255, 0.8); text-align: left; padding-left: 20px;">
                        <li>Préparez votre numéro de compte</li>
                        <li>Ayez votre pièce d'identité à portée</li>
                        <li>Décrivez précisément votre problème</li>
                    </ul>
                </div>
            </div>
        `,
        buttons: [
            { text: "Appeler maintenant", action: () => { 
                showToast("Ouverture du composeur...", "success");
                // En production, cela ouvrirait le composeur du téléphone
                // window.location.href = "tel:+24101234567";
            }},
            { text: "Annuler", action: () => {} }
        ]
    });
}

function requestCallback() {
    // Simuler la demande de rappel
    showModal({
        title: "Demande de Rappel Gratuit",
        content: `
            <div style="padding: 20px;">
                <div style="background: rgba(116, 86, 255, 0.1); padding: 15px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
                    <i class="fas fa-phone-alt" style="color: #7456ff; font-size: 24px; margin-bottom: 10px;"></i>
                    <h4 style="color: white; margin: 0;">Nous vous rappelons gratuitement</h4>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="color: white; display: block; margin-bottom: 5px;">Motif de l'appel :</label>
                    <select id="callback-reason" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;">
                        <option value="general">Question générale</option>
                        <option value="technical">Problème technique</option>
                        <option value="transaction">Question sur une transaction</option>
                        <option value="card">Problème de carte</option>
                        <option value="account">Gestion de compte</option>
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="color: white; display: block; margin-bottom: 5px;">Moment préféré :</label>
                    <select id="callback-time" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;">
                        <option value="now">Maintenant (dans 2-5 min)</option>
                        <option value="morning">Ce matin (8h-12h)</option>
                        <option value="afternoon">Cet après-midi (14h-18h)</option>
                        <option value="evening">Ce soir (18h-20h)</option>
                    </select>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; margin-top: 15px;">
                    <p style="color: rgba(255, 255, 255, 0.8); margin: 0; font-size: 14px;">
                        <i class="fas fa-info-circle" style="color: #7456ff; margin-right: 8px;"></i>
                        Le rappel est entièrement gratuit. Nous vous contacterons au numéro associé à votre compte.
                    </p>
                </div>
            </div>
        `,
        buttons: [
            { text: "Demander le rappel", action: () => {
                const reason = document.getElementById('callback-reason').value;
                const time = document.getElementById('callback-time').value;
                showToast("Demande de rappel enregistrée ! Nous vous contactons bientôt.", "success");
            }},
            { text: "Annuler", action: () => {} }
        ]
    });
}

function sendEmail() {
    // Simuler l'envoi d'email
    showModal({
        title: "Contact par Email",
        content: `
            <div style="padding: 20px;">
                <div style="background: rgba(116, 86, 255, 0.1); padding: 15px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
                    <i class="fas fa-envelope" style="color: #7456ff; font-size: 24px; margin-bottom: 10px;"></i>
                    <h4 style="color: white; margin-bottom: 5px;">support@k-bank.ga</h4>
                    <p style="color: rgba(255, 255, 255, 0.7); margin: 0; font-size: 14px;">Réponse sous 2h en moyenne</p>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="color: white; display: block; margin-bottom: 5px;">Sujet :</label>
                    <input type="text" id="email-subject" placeholder="Décrivez brièvement votre demande" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;" />
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="color: white; display: block; margin-bottom: 5px;">Message :</label>
                    <textarea id="email-message" rows="4" placeholder="Décrivez votre problème ou votre question en détail..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; resize: vertical;"></textarea>
                </div>
                <div style="background: rgba(0, 255, 136, 0.1); padding: 12px; border-radius: 8px;">
                    <p style="color: rgba(255, 255, 255, 0.8); margin: 0; font-size: 14px;">
                        <i class="fas fa-check-circle" style="color: #00ff88; margin-right: 8px;"></i>
                        Votre email sera envoyé depuis l'adresse associée à votre compte K-Bank.
                    </p>
                </div>
            </div>
        `,
        buttons: [
            { text: "Envoyer l'email", action: () => {
                const subject = document.getElementById('email-subject').value;
                const message = document.getElementById('email-message').value;
                if (subject && message) {
                    showToast("Email envoyé avec succès ! Nous vous répondrons rapidement.", "success");
                } else {
                    showToast("Veuillez remplir tous les champs", "error");
                }
            }},
            { text: "Annuler", action: () => {} }
        ]
    });
}

// Fonction pour afficher une modale personnalisée
function showModal(config) {
    // Créer la modale
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        animation: fadeIn 0.3s ease;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(45, 45, 45, 0.95));
        border-radius: 20px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        animation: slideInUp 0.3s ease;
        display: flex;
        flex-direction: column;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
        padding: 20px 20px 0 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 0;
        flex-shrink: 0;
    `;
    header.innerHTML = `<h3 style="color: white; margin: 0; padding-bottom: 15px; font-size: 20px;">${config.title}</h3>`;

    const body = document.createElement('div');
    body.style.cssText = `
        flex: 1;
        overflow-y: auto;
        min-height: 0;
    `;
    body.innerHTML = config.content;

    const footer = document.createElement('div');
    footer.style.cssText = `
        padding: 20px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 20px;
        flex-shrink: 0;
        flex-wrap: wrap;
    `;

    config.buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.textContent = button.text;
        btn.style.cssText = `
            padding: 12px 24px;
            border-radius: 12px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            ${button.text.includes('Fermer') || button.text.includes('Annuler') 
                ? 'background: rgba(255, 255, 255, 0.1); color: white;' 
                : 'background: linear-gradient(135deg, #7456ff, #8b5af6); color: white;'
            }
        `;
        btn.onclick = () => {
            document.body.removeChild(modal);
            button.action();
        };
        footer.appendChild(btn);
    });

    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modalContent.appendChild(footer);
    modal.appendChild(modalContent);

    // Fermer en cliquant à l'extérieur
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };

    document.body.appendChild(modal);

    // Ajuster pour mobile
    if (window.innerWidth <= 768) {
        modal.style.padding = '10px';
        modalContent.style.maxHeight = '95vh';
        modalContent.style.borderRadius = '16px';
        header.style.padding = '15px 15px 0 15px';
        footer.style.padding = '15px';
        footer.style.justifyContent = 'center';
    }
}

// Ajouter les styles d'animation CSS si pas déjà présents
if (!document.querySelector('#modal-styles')) {
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideInUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .custom-modal input::placeholder,
        .custom-modal textarea::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
        .custom-modal input:focus,
        .custom-modal textarea:focus,
        .custom-modal select:focus {
            outline: none;
            border-color: #7456ff;
            box-shadow: 0 0 0 2px rgba(116, 86, 255, 0.2);
        }
        
        /* Responsive modal styles */
        @media (max-width: 768px) {
            .custom-modal {
                padding: 10px !important;
                align-items: flex-start !important;
                padding-top: 20px !important;
            }
            .custom-modal > div {
                max-height: 95vh !important;
                border-radius: 16px !important;
                margin-top: 0 !important;
            }
            .custom-modal h3 {
                font-size: 18px !important;
            }
        }
        
        @media (max-width: 480px) {
            .custom-modal {
                padding: 5px !important;
                padding-top: 10px !important;
            }
            .custom-modal > div {
                border-radius: 12px !important;
            }
            .custom-modal h3 {
                font-size: 16px !important;
            }
            .custom-modal button {
                padding: 10px 16px !important;
                font-size: 13px !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Mise à jour des anciennes fonctions pour utiliser les nouvelles
function openChat() {
    openLiveChat();
}

function scheduleCallback() {
    requestCallback();
}

function openFAQ() {
    // Ouvrir la modale FAQ avec toutes les questions
    showModal({
        title: "Questions Fréquentes",
        content: `
            <div style="padding: 10px;">
                <div style="margin-bottom: 20px; text-align: center;">
                    <div style="background: rgba(116, 86, 255, 0.1); padding: 15px; border-radius: 12px;">
                        <i class="fas fa-question-circle" style="color: #7456ff; font-size: 32px; margin-bottom: 10px;"></i>
                        <p style="color: rgba(255, 255, 255, 0.8); margin: 0; font-size: 14px;">Trouvez rapidement les réponses à vos questions</p>
                    </div>
                </div>
                
                <div class="modal-faq-container">
                    <div class="modal-faq-item" onclick="toggleModalFAQ(this)">
                        <div class="modal-faq-question">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                <i class="fas fa-lock" style="color: #7456ff; width: 20px;"></i>
                                <span style="color: white; font-weight: 600;">Comment bloquer/débloquer ma carte ?</span>
                            </div>
                            <i class="fas fa-chevron-down" style="color: #7456ff; transition: transform 0.3s ease;"></i>
                        </div>
                        <div class="modal-faq-answer" style="display: none;">
                            <p><strong>Pour bloquer votre carte :</strong></p>
                            <ol>
                                <li>Appuyez longuement sur votre carte bancaire sur l'écran d'accueil</li>
                                <li>Sélectionnez "Geler la carte"</li>
                                <li>Confirmez l'action avec votre code PIN</li>
                                <li>Votre carte sera immédiatement bloquée</li>
                            </ol>
                            <p><strong>Pour débloquer :</strong> Répétez la même procédure et sélectionnez "Dégeler la carte".</p>
                        </div>
                    </div>

                    <div class="modal-faq-item" onclick="toggleModalFAQ(this)">
                        <div class="modal-faq-question">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                <i class="fas fa-exchange-alt" style="color: #7456ff; width: 20px;"></i>
                                <span style="color: white; font-weight: 600;">Comment effectuer un virement ?</span>
                            </div>
                            <i class="fas fa-chevron-down" style="color: #7456ff; transition: transform 0.3s ease;"></i>
                        </div>
                        <div class="modal-faq-answer" style="display: none;">
                            <p><strong>Étapes pour faire un virement :</strong></p>
                            <ol>
                                <li>Allez dans l'onglet "Virements"</li>
                                <li>Choisissez un bénéficiaire ou ajoutez-en un nouveau</li>
                                <li>Saisissez le montant à transférer</li>
                                <li>Ajoutez un motif (optionnel)</li>
                                <li>Vérifiez les informations</li>
                                <li>Confirmez avec votre code PIN</li>
                            </ol>
                            <p><strong>Limites :</strong> 500 000 F <h6>cfa</h6> par jour, 2 000 000 F <h6>cfa</h6> par mois.</p>
                        </div>
                    </div>

                    <div class="modal-faq-item" onclick="toggleModalFAQ(this)">
                        <div class="modal-faq-question">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                <i class="fas fa-user-plus" style="color: #7456ff; width: 20px;"></i>
                                <span style="color: white; font-weight: 600;">Comment ajouter un bénéficiaire ?</span>
                            </div>
                            <i class="fas fa-chevron-down" style="color: #7456ff; transition: transform 0.3s ease;"></i>
                        </div>
                        <div class="modal-faq-answer" style="display: none;">
                            <p><strong>Trois méthodes pour ajouter un bénéficiaire :</strong></p>
                            <h4>1. Via le numéro de téléphone :</h4>
                            <ul>
                                <li>Cliquez sur "Nouveau bénéficiaire"</li>
                                <li>Saisissez le nom et le numéro</li>
                                <li>Validez l'ajout</li>
                            </ul>
                            <h4>2. Via QR Code :</h4>
                            <ul>
                                <li>Cliquez sur l'icône de scan</li>
                                <li>Scannez le QR code du bénéficiaire</li>
                            </ul>
                            <h4>3. Via les contacts :</h4>
                            <ul>
                                <li>Sélectionnez dans votre répertoire</li>
                                <li>Confirmez l'ajout</li>
                            </ul>
                        </div>
                    </div>

                    <div class="modal-faq-item" onclick="toggleModalFAQ(this)">
                        <div class="modal-faq-question">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                <i class="fas fa-key" style="color: #7456ff; width: 20px;"></i>
                                <span style="color: white; font-weight: 600;">Comment changer mon code PIN ?</span>
                            </div>
                            <i class="fas fa-chevron-down" style="color: #7456ff; transition: transform 0.3s ease;"></i>
                        </div>
                        <div class="modal-faq-answer" style="display: none;">
                            <p><strong>Pour modifier votre code PIN :</strong></p>
                            <ol>
                                <li>Allez dans "Profil" depuis l'accueil</li>
                                <li>Sélectionnez "Sécurité"</li>
                                <li>Choisissez "Changer le code PIN"</li>
                                <li>Saisissez votre ancien code PIN</li>
                                <li>Créez un nouveau code (4 chiffres)</li>
                                <li>Confirmez le nouveau code</li>
                            </ol>
                            <p><strong>Conseils :</strong> Évitez les codes évidents comme 0000, 1234. Choisissez une combinaison que vous seul connaissez.</p>
                        </div>
                    </div>

                    <div class="modal-faq-item" onclick="toggleModalFAQ(this)">
                        <div class="modal-faq-question">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                <i class="fas fa-piggy-bank" style="color: #7456ff; width: 20px;"></i>
                                <span style="color: white; font-weight: 600;">Comment fonctionne le coffre-fort ?</span>
                            </div>
                            <i class="fas fa-chevron-down" style="color: #7456ff; transition: transform 0.3s ease;"></i>
                        </div>
                        <div class="modal-faq-answer" style="display: none;">
                            <p><strong>Le coffre-fort vous aide à épargner :</strong></p>
                            <h4>Fonctionnalités :</h4>
                            <ul>
                                <li><strong>Objectifs d'épargne :</strong> Définissez vos projets avec échéances</li>
                                <li><strong>Versements automatiques :</strong> Programmez des virements réguliers</li>
                                <li><strong>Visualisation :</strong> Suivez vos progrès en temps réel</li>
                                <li><strong>Sécurité :</strong> Fonds bloqués jusqu'à l'objectif atteint</li>
                            </ul>
                        </div>
                    </div>

                    <div class="modal-faq-item" onclick="toggleModalFAQ(this)">
                        <div class="modal-faq-question">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                <i class="fas fa-exclamation-triangle" style="color: #7456ff; width: 20px;"></i>
                                <span style="color: white; font-weight: 600;">Que faire en cas de transaction suspecte ?</span>
                            </div>
                            <i class="fas fa-chevron-down" style="color: #7456ff; transition: transform 0.3s ease;"></i>
                        </div>
                        <div class="modal-faq-answer" style="display: none;">
                            <p><strong>Actions immédiates à prendre :</strong></p>
                            <ol>
                                <li><strong>Bloquez votre carte</strong> immédiatement via l'application</li>
                                <li><strong>Contactez-nous</strong> via le chat ou par téléphone</li>
                                <li><strong>Signalez la transaction</strong> dans votre historique</li>
                                <li><strong>Conservez les preuves</strong> (captures d'écran, SMS, etc.)</li>
                            </ol>
                            <p><strong>Notre engagement :</strong> Enquête sous 24h.</p>
                            <p><strong>Numéro d'urgence :</strong> +241 01 23 45 67 (24h/24, 7j/7)</p>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; text-align: center;">
                    <p style="color: rgba(255, 255, 255, 0.8); margin: 0; font-size: 14px;">
                        <i class="fas fa-lightbulb" style="color: #7456ff; margin-right: 8px;"></i>
                        Vous ne trouvez pas votre réponse ? Contactez notre support 24h/24
                    </p>
                </div>
            </div>
        `,
        buttons: [
            { text: "Contacter le support", action: () => openLiveChat() },
            { text: "Fermer", action: () => {} }
        ]
    });
}

// Fonction pour toggler les questions dans la modale FAQ
function toggleModalFAQ(element) {
    const answer = element.querySelector('.modal-faq-answer');
    const arrow = element.querySelector('.fas.fa-chevron-down');
    const isOpen = answer.style.display === 'block';
    
    // Fermer toutes les autres réponses
    const allAnswers = element.parentElement.querySelectorAll('.modal-faq-answer');
    const allArrows = element.parentElement.querySelectorAll('.modal-faq-question .fas.fa-chevron-down');
    
    allAnswers.forEach(ans => {
        ans.style.display = 'none';
        ans.classList.remove('scrollable-content');
    });
    allArrows.forEach(arr => arr.style.transform = 'rotate(0deg)');
    
    // Ouvrir/fermer la réponse cliquée
    if (!isOpen) {
        answer.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
        
        // Vérifier si le contenu est scrollable et ajouter un indicateur
        setTimeout(() => {
            if (answer.scrollHeight > answer.clientHeight) {
                answer.classList.add('scrollable-content');
                // Ajouter un indicateur de scroll si pas déjà présent
                if (!answer.querySelector('.scroll-indicator')) {
                    const indicator = document.createElement('div');
                    indicator.className = 'scroll-indicator';
                    indicator.innerHTML = '<i class="fas fa-chevron-down"></i>';
                    indicator.style.cssText = `
                        position: absolute;
                        bottom: 5px;
                        right: 20px;
                        color: rgba(116, 86, 255, 0.7);
                        font-size: 12px;
                        animation: bounce 2s infinite;
                        pointer-events: none;
                    `;
                    answer.style.position = 'relative';
                    answer.appendChild(indicator);
                    
                    // Masquer l'indicateur quand on scroll
                    answer.addEventListener('scroll', function() {
                        if (this.scrollTop > 10) {
                            indicator.style.opacity = '0';
                        } else {
                            indicator.style.opacity = '1';
                        }
                    });
                }
            }
        }, 100);
    }
}

// Fonction pour ouvrir la page FAQ dédiée
function openFAQPage() {
    window.location.href = 'faq.html';
}

// =====================================
// NOUVELLES FONCTIONS COFFRE-FORT
// =====================================

// Variables pour la gestion des coffres-forts multiples
let selectedVaultIcon = 'vault';
let maxVaults = 3; // Maximum 3 coffres-forts (1 principal + 2 supplémentaires)

// Fonctions pour le modal de création de nouveau coffre-fort
function openNewVaultModal() {
    if (vaults.length >= 3) {
        showVaultNotification('Vous avez atteint la limite de 3 coffres-forts', 'error');
        return;
    }
    document.getElementById('new-vault-modal').style.display = 'flex';
    resetVaultForm();
}

function closeNewVaultModal() {
    document.getElementById('new-vault-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    // Réinitialiser le formulaire
    resetVaultForm();
}

function selectVaultIcon(icon) {
    // Retirer la sélection précédente
    document.querySelectorAll('.vault-icon-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Ajouter la sélection à l'icône choisie
    document.querySelector(`[data-icon="${icon}"]`).classList.add('selected');
    selectedVaultIcon = icon;
}

function resetVaultForm() {
    document.getElementById('new-vault-name').value = '';
    document.getElementById('new-vault-description').value = '';
    selectedVaultIcon = 'vault';
    
    // Remettre à zéro la sélection d'icônes
    document.querySelectorAll('.vault-icon-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector('[data-icon="vault"]').classList.add('selected');
}

function createNewVault() {
    console.log('createNewVault appelée');
    const name = document.getElementById('new-vault-name').value.trim();
    const description = document.getElementById('new-vault-description').value.trim();
    
    console.log('Valeurs récupérées:', { name, description });
    
    if (!name) {
        alert('Veuillez entrer un nom pour le coffre-fort');
        return;
    }
    
    if (vaults.length >= 3) {
        showVaultNotification('Limite de coffres-forts atteinte', 'error');
        return;
    }
    
    const newVault = {
        id: Date.now(),
        name: name,
        description: description,
        icon: selectedVaultIcon,
        balance: 0,
        goal: null,
        history: [],
        isMain: false
    };
    
    console.log('Nouveau coffre-fort créé:', newVault);
    console.log('Vaults avant ajout:', vaults);
    
    vaults.push(newVault);
    currentVaultIndex = vaults.length - 1; // Basculer vers le nouveau coffre-fort
    
    console.log('Vaults après ajout:', vaults);
    console.log('currentVaultIndex:', currentVaultIndex);
    
    // Fermer la modale d'abord
    closeNewVaultModal();
    
    // Afficher une notification de succès
    showVaultNotification(`Coffre-fort "${name}" créé avec succès !`, 'success');
    
    // Petit délai pour permettre à la notification d'apparaître, puis basculer vers le nouveau coffre
    setTimeout(() => {
        // Mettre à jour l'affichage et basculer vers le nouveau coffre-fort
        forceVaultUpdate();
        goToVault(currentVaultIndex); // Basculer explicitement vers le nouveau coffre
        
        // Notification supplémentaire pour indiquer qu'on est sur le nouveau coffre
        setTimeout(() => {
            showVaultNotification(`Vous êtes maintenant sur votre nouveau coffre-fort "${name}"`, 'info');
        }, 1000);
    }, 500);
    
    const remaining = 3 - vaults.length;
    let message = `Coffre-fort "${name}" créé avec succès !`;
    if (remaining > 0) {
        message += ` (${remaining} coffre${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''})`;
    }
    
    showVaultNotification(message, 'success');
}

// Fonction pour surveiller les changements de page et gérer le bouton K-Shop
function manageKShopFloat() {
    const kshopFloat = document.querySelector('.kshop-float');
    const kshopPage = document.querySelector('.kshop-page');
    
    if (kshopFloat && kshopPage) {
        if (kshopPage.classList.contains('active')) {
            kshopFloat.style.display = 'none';
            console.log('Bouton K-Shop caché - surveillance active');
        } else {
            kshopFloat.style.display = 'block';
            console.log('Bouton K-Shop affiché - surveillance active');
        }
    }
}

// Observer pour surveiller les changements de classe sur les pages
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            manageKShopFloat();
        }
    });
});

// Démarrer l'observation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function() {
    // Observer tous les éléments avec la classe 'page'
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        observer.observe(page, { attributes: true, attributeFilter: ['class'] });
    });
    
    // Vérification initiale
    setTimeout(manageKShopFloat, 500);
});

// Initialisation lors du chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    if (typeof renderVaultGoal === 'function') {
        renderVaultGoal();
    }
});

