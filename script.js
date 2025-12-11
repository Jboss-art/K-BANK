// ===========================================
// SYSTÈME D'AUTHENTIFICATION
// ===========================================

// ===========================================
// SYSTÈME DE GESTION DES SOLDES
// ===========================================

let userBalances = {
    main: 780245,           // Solde principal en Fcfa
    professional: 2450800,  // Solde professionnel en Fcfa
    monthlyRevenue: 245200, // Revenus mensuels
    monthlyExpenses: 133274 // Dépenses mensuelles
};

// Fonction pour mettre à jour l'affichage des soldes
function updateBalanceDisplay() {
    // Mise à jour du solde principal sur la page d'accueil - Version mobile optimisée
    const mainBalanceElement = document.querySelector('.balance-amount');
    if (mainBalanceElement) {
        // Utiliser notre fonction pour texte net sur mobile
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            mainBalanceElement.innerHTML = `
                <span style="
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                    font-weight: 800;
                    font-size: 28px;
                    color: rgb(255, 255, 255);
                    text-rendering: geometricPrecision;
                    -webkit-font-smoothing: subpixel-antialiased;
                    letter-spacing: 0.5px;
                    display: inline-block;
                ">Fcfa ${userBalances.main.toLocaleString('fr-FR')},</span><small style="
                    font-size: 18px;
                    color: rgb(255, 255, 255);
                    opacity: 0.9;
                ">00</small>
            `;
        } else {
            mainBalanceElement.innerHTML = `Fcfa ${userBalances.main.toLocaleString('fr-FR')},<small>00</small>`;
        }
    }
    
    // Mise à jour des revenus mensuels
    const revenueElement = document.querySelector('.balance-detail .detail-value');
    if (revenueElement) {
        revenueElement.innerHTML = `Fcfa ${userBalances.monthlyRevenue.toLocaleString('fr-FR')},<small>00</small>`;
    }
    
    // Mise à jour des dépenses mensuelles
    const expenseElements = document.querySelectorAll('.balance-detail .detail-value');
    if (expenseElements.length > 1) {
        expenseElements[1].innerHTML = `Fcfa ${userBalances.monthlyExpenses.toLocaleString('fr-FR')},<small>00</small>`;
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
        this.correctPin = '123456'; // Code de sécurité à 6 chiffres
        this.pinInputs = document.querySelectorAll('.pin-input');
        this.keyButtons = document.querySelectorAll('.key-button');
        this.errorMessage = document.querySelector('.error-message');
        this.loading = document.querySelector('.loading');
        this.authCard = document.querySelector('.auth-card');
        this.authOverlay = document.getElementById('auth-overlay');
        this.appContainer = document.getElementById('app-container');
        
        this.initEventListeners();
        this.checkFaceIDAvailability();
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

    checkFaceIDAvailability() {
        // Vérifier si Face ID est activé et disponible
        const faceIDEnabled = localStorage.getItem('faceIDEnabled') === 'true';
        const faceIDOption = document.getElementById('face-id-option');
        
        if (faceIDEnabled && faceIDOption) {
            faceIDOption.style.display = 'block';
        }
    }

    initializeApp() {
        // Initialiser l'application principale après l'authentification
        updateBalanceDisplay();
        renderTransactions();
        updateNotificationBadge();
        initializeSpecificPages();
        renderVaultCarousel(); // Initialiser le carousel du coffre-fort
        updateVaultDisplay(); // Initialiser l'affichage du coffre-fort
        initializeFaceID(); // Initialiser l'état Face ID
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
        // Afficher un message d'avertissement à l'utilisateur
        if (typeof showToast === 'function') {
            showToast('Carte bloquée - Action impossible', 'warning');
        } else {
            alert('Carte bloquée - Action impossible');
        }
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
    
    // Créer dynamiquement l'icône gelée
    createFrozenIndicator();
    
    // Fallback pour notification
    if (typeof showToast === 'function') {
        showToast('Carte gelée avec succès');
    } else {
        console.log('Carte gelée avec succès');
    }
}

function createFrozenIndicator() {
    // Supprimer l'indicateur existant s'il y en a un
    removeFrozenIndicator();
    
    const card = document.getElementById('main-card');
    if (!card) return;
    
    // Créer l'indicateur dynamiquement
    const indicator = document.createElement('div');
    indicator.id = 'dynamic-frozen-indicator';
    indicator.innerHTML = `
        <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            background: rgba(173, 216, 230, 0.95);
            border: 4px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.6);
            pointer-events: none;
        ">
            <span style="
                font-size: 40px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            ">❄️</span>
        </div>
    `;
    
    // Ajouter l'indicateur directement à la carte
    card.style.position = 'relative';
    card.appendChild(indicator);
    
    console.log('Indicateur gelé créé dynamiquement');
}

function removeFrozenIndicator() {
    const existingIndicator = document.getElementById('dynamic-frozen-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
        console.log('Indicateur gelé existant supprimé');
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
    
    // Supprimer l'indicateur dynamique de gel
    removeFrozenIndicator();
    
    // Fallback pour notification
    if (typeof showToast === 'function') {
        showToast('Carte dégelée avec succès');
    } else {
        console.log('Carte dégelée avec succès');
    }
}

// Fonctions pour gérer l'état bloqué de la carte
function blockCard() {
    console.log('blockCard called');
    const card = document.getElementById('main-card');
    const blockedIcon = document.getElementById('blocked-icon');
    const frozenIcon = document.getElementById('frozen-icon');
    
    console.log('Elements found:', { card, blockedIcon, frozenIcon });
    
    if (card) {
        card.classList.add('blocked');
        // Retirer l'état gelé si présent
        card.classList.remove('frozen');
        console.log('Card classes updated:', card.className);
    }
    
    // Créer dynamiquement l'icône bloquée directement sur la carte
    createBlockedIndicator();
    
    // Supprimer l'icône de gelée si elle existe
    removeFrozenIndicator();
    
    // Remettre le texte du bouton à "Geler" si c'était gelé
    const freezeText = document.getElementById('freeze-text');
    if (freezeText) {
        freezeText.textContent = 'Geler';
    }
    isCardFrozen = false;
}

function createBlockedIndicator() {
    // Supprimer l'indicateur existant s'il y en a un
    removeBlockedIndicator();
    
    const card = document.getElementById('main-card');
    if (!card) return;
    
    // Créer l'indicateur dynamiquement
    const indicator = document.createElement('div');
    indicator.id = 'dynamic-blocked-indicator';
    indicator.innerHTML = `
        <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            background: rgba(220, 53, 69, 0.95);
            border: 4px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.6);
            pointer-events: none;
        ">
            <span style="
                font-size: 40px;
                color: white;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            ">∅</span>
        </div>
    `;
    
    // Ajouter l'indicateur directement à la carte
    card.style.position = 'relative';
    card.appendChild(indicator);
    
    console.log('Indicateur bloqué créé dynamiquement');
}

function removeBlockedIndicator() {
    const existingIndicator = document.getElementById('dynamic-blocked-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
        console.log('Indicateur bloqué existant supprimé');
    }
}
    
    // Remettre le texte du bouton à "Geler" si c'était gelé
    const freezeText = document.getElementById('freeze-text');
    if (freezeText) {
        freezeText.textContent = 'Geler';
    }
    isCardFrozen = false;


function unblockCard() {
    console.log('unblockCard called');
    const card = document.getElementById('main-card');
    
    if (card) {
        card.classList.remove('blocked');
    }
    
    // Supprimer l'indicateur dynamique de blocage
    removeBlockedIndicator();
    
    if (typeof showToast === 'function') {
        showToast('Carte débloquée avec succès', 'success');
    }
}

// Rendre les fonctions accessibles globalement
window.blockCard = blockCard;
window.unblockCard = unblockCard;

// Fonction de test pour diagnostiquer le problème
window.testBlockedIcon = function() {
    console.log('=== TEST BLOCKED ICON ===');
    
    const blockedIcon = document.getElementById('blocked-icon');
    const cardStatusIndicator = document.getElementById('card-status-indicator');
    
    console.log('blocked-icon element:', blockedIcon);
    console.log('card-status-indicator element:', cardStatusIndicator);
    
    if (blockedIcon) {
        console.log('blocked-icon current style.display:', blockedIcon.style.display);
        console.log('blocked-icon computed style:', window.getComputedStyle(blockedIcon).display);
        console.log('blocked-icon visibility:', window.getComputedStyle(blockedIcon).visibility);
        console.log('blocked-icon opacity:', window.getComputedStyle(blockedIcon).opacity);
        
        // Force l'affichage
        blockedIcon.style.display = 'flex';
        blockedIcon.style.visibility = 'visible';
        blockedIcon.style.opacity = '1';
        
        console.log('Forced display - checking again...');
        console.log('blocked-icon style.display after force:', blockedIcon.style.display);
    } else {
        console.error('blocked-icon element NOT FOUND!');
    }
    
    console.log('=== END TEST ===');
};

// Données des bénéficiaires
let beneficiaries = [
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
    
    // Initialiser les validations globales
    initializeGlobalValidations();
    
    // Le reste de l'initialisation se fera après l'authentification
});

// Validations globales pour toute l'application
function initializeGlobalValidations() {
    // Validation pour tous les champs de montant
    document.addEventListener('input', function(e) {
        if (e.target.type === 'number' || e.target.classList.contains('amount-input')) {
            // Empêcher les valeurs négatives
            if (e.target.value < 0) {
                e.target.value = 0;
            }
            // Arrondir aux entiers pour les montants
            if (e.target.step === '1' || !e.target.step) {
                e.target.value = Math.floor(e.target.value);
            }
        }
        
        // Validation pour tous les champs téléphone
        if (e.target.type === 'tel') {
            e.target.value = e.target.value.replace(/[^0-9\+\s\-]/g, '');
        }
    });
    
    // Empêcher la soumission de formulaire avec Entrée si les validations échouent
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            const form = e.target.closest('form');
            if (form && !form.checkValidity()) {
                e.preventDefault();
                e.target.reportValidity();
            }
        }
    });
}

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
        `Voulez-vous effectuer un virement de ${Number(amount).toLocaleString()} Fcfa vers ${beneficiary.name} ?`,
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
        `Transférer ${Number(amount).toLocaleString()} Fcfa vers ${name} (${phone}) via ${methodNames[selectedTransferMethod]} ?`,
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
            amount: -2450.00,
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
        },
        {
            id: 4,
            title: "Pharmacie Central",
            date: "Avant-hier, 11:20",
            amount: -12500.00,
            icon: "💊",
            category: "Santé"
        },
        {
            id: 5,
            title: "Virement Jean Mvoumbi",
            date: "3 nov, 16:00",
            amount: 45000.00,
            icon: "💸",
            category: "Virement"
        },
        {
            id: 6,
            title: "Station Total",
            date: "3 nov, 08:15",
            amount: -15000.00,
            icon: "⛽",
            category: "Carburant"
        },
        {
            id: 7,
            title: "Restaurant Le Bambou",
            date: "2 nov, 20:30",
            amount: -8750.00,
            icon: "🍽️",
            category: "Restaurant"
        },
        {
            id: 8,
            title: "Moov Money",
            date: "2 nov, 14:45",
            amount: -2000.00,
            icon: "📱",
            category: "Mobile Money"
        },
        {
            id: 9,
            title: "Salaire novembre",
            date: "1er nov, 00:01",
            amount: 850000.00,
            icon: "💼",
            category: "Salaire"
        },
        {
            id: 10,
            title: "Supermarché Carrefour/Prix Import",
            date: "31 oct, 18:30",
            amount: -32500.00,
            icon: "🛍️",
            category: "Shopping"
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
            id: 101,
            title: "Offre weekend",
            message: "Réduction de -10 % chez tous nos partenaires",
            date: "Il y a 1 jour",
            read: true,
            type: "promotion"
        }
    ]
};

// Initialisation des notifications
function initializeNotifications() {
    // Forcer la réinitialisation des notifications depuis les données par défaut
    localStorage.removeItem('notifications');
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
        // Extraire le montant du message s'il y en a un (uniquement les montants avec décimales)
        const amountMatch = notification.message.match(/(-?\d+[.,]\d{2})/);
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

// Affiche les transactions (limité à 10 par défaut)
function renderTransactions(limit = 10) {
    const container = document.getElementById('transactions-list');
    container.innerHTML = '';
    
    // Limiter le nombre de transactions affichées
    const transactionsToShow = appData.transactions.slice(0, limit);
    
    transactionsToShow.forEach(transaction => {
        const element = document.createElement('div');
        element.className = 'transaction-item';
        element.innerHTML = `
            <div class="transaction-icon">${transaction.icon}</div>
            <div class="transaction-details">
                <div class="transaction-title">${transaction.title}</div>
                <div class="transaction-date">${transaction.date}</div>
            </div>
            <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                ${transaction.amount > 0 ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()} Fcfa
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
    
    // Gestion spéciale pour l'onglet Tontine
    if (tab === 'tontine') {
        // Si une tontine existe, aller directement sur la page de détails
        if (hasTontines && tontinesList.length > 0) {
            openTontineDetail(0); // Ouvrir la première tontine
            document.querySelector(`.nav-item[onclick="switchTab('${tab}')"]`).classList.add('active');
            return;
        }
    }
    
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
    if (tab === 'coffre-fort') {
        setTimeout(() => {
            checkVaultState();
        }, 100);
    }

    // Initialiser la page de modification du profil
    if (tab === 'edit-profile') {
        setTimeout(() => {
            loadProfileData();
        }, 100);
    }

    // Initialiser la page K-Shop
    if (tab === 'kshop') {
        setTimeout(() => {
            // Réinitialiser les interactions K-Shop
            if (typeof initKShopInteractions === 'function') {
                initKShopInteractions();
            }
            // Ou initialiser juste les favoris
            if (typeof initFavoriteSystem === 'function') {
                initFavoriteSystem();
            }
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
}

function viewSessions() {
    showToast('Affichage des sessions actives');
}

// Variable pour Face ID
let isFaceIDEnabled = false;

function toggleFaceID() {
    const toggle = document.getElementById('faceid-toggle');
    const toggleOthers = document.getElementById('faceid-toggle-others');
    
    // Déterminer quel toggle a été cliqué
    const activeToggle = toggle || toggleOthers;
    
    if (activeToggle) {
        const isToggling = !activeToggle.checked;
        
        if (isToggling && !isFaceIDEnabled) {
            // Vérifier si Face ID est disponible sur l'appareil
            if (!checkFaceIDAvailability()) {
                showToast('Face ID non disponible sur cet appareil', 'warning');
                if (toggle) toggle.checked = false;
                if (toggleOthers) toggleOthers.checked = false;
                return;
            }
            
            showConfirmDialog(
                'Activer Face ID',
                'Voulez-vous activer Face ID pour vous connecter plus facilement à votre compte K-Bank ?',
                'Activer',
                'Annuler',
                () => {
                    enableFaceID();
                },
                'fas fa-user-check',
                '#007AFF'
            );
        } else if (!isToggling && isFaceIDEnabled) {
            showConfirmDialog(
                'Désactiver Face ID',
                'Êtes-vous sûr de vouloir désactiver Face ID ?',
                'Désactiver',
                'Annuler',
                () => {
                    disableFaceID();
                },
                'fas fa-user-times',
                '#ff3b30'
            );
        }
    }
}

function checkFaceIDAvailability() {
    // Vérifier si l'appareil supporte Face ID (simulation pour demo)
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    // Simuler la disponibilité Face ID sur mobile
    return isIOS || isAndroid || window.location.hostname === 'localhost';
}

function enableFaceID() {
    isFaceIDEnabled = true;
    const toggle = document.getElementById('faceid-toggle');
    const toggleOthers = document.getElementById('faceid-toggle-others');
    const status = document.getElementById('faceid-status');
    
    // Synchroniser les deux toggles
    if (toggle) {
        toggle.checked = true;
    }
    if (toggleOthers) {
        toggleOthers.checked = true;
    }
    
    if (status) {
        status.textContent = 'Activé';
        status.style.color = '#28a745';
    }
    
    // Sauvegarder le paramètre dans le localStorage
    localStorage.setItem('faceIDEnabled', 'true');
    
    // Afficher le bouton Face ID sur la page de connexion si on y est
    const faceIDOption = document.getElementById('face-id-option');
    if (faceIDOption) {
        faceIDOption.style.display = 'block';
    }
}

function disableFaceID() {
    isFaceIDEnabled = false;
    const toggle = document.getElementById('faceid-toggle');
    const toggleOthers = document.getElementById('faceid-toggle-others');
    const status = document.getElementById('faceid-status');
    
    // Synchroniser les deux toggles
    if (toggle) {
        toggle.checked = false;
    }
    if (toggleOthers) {
        toggleOthers.checked = false;
    }
    
    if (status) {
        status.textContent = 'Désactivé';
        status.style.color = '#6c757d';
    }
    
    // Supprimer le paramètre du localStorage
    localStorage.removeItem('faceIDEnabled');
    
    // Masquer le bouton Face ID sur la page de connexion
    const faceIDOption = document.getElementById('face-id-option');
    if (faceIDOption) {
        faceIDOption.style.display = 'none';
    }
}

// Fonction pour initialiser l'état Face ID au chargement
function initializeFaceID() {
    const savedState = localStorage.getItem('faceIDEnabled');
    if (savedState === 'true') {
        isFaceIDEnabled = true;
        const toggle = document.getElementById('faceid-toggle');
        const toggleOthers = document.getElementById('faceid-toggle-others');
        const status = document.getElementById('faceid-status');
        
        // Synchroniser les deux toggles
        if (toggle) {
            toggle.checked = true;
        }
        if (toggleOthers) {
            toggleOthers.checked = true;
        }
        
        if (status) {
            status.textContent = 'Activé';
            status.style.color = '#28a745';
        }
    }
}

// Fonction pour l'authentification Face ID sur la page de connexion
function authenticateWithFaceID() {
    const faceIDButton = document.querySelector('.face-id-button');
    const loading = document.querySelector('.loading');
    
    // Désactiver le bouton et afficher le loading
    if (faceIDButton) {
        faceIDButton.disabled = true;
        faceIDButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Authentification...</span>';
    }
    
    // Simuler l'authentification Face ID
    setTimeout(() => {
        // Simuler un succès (90% de chances de succès)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
            // Succès de l'authentification Face ID
            if (faceIDButton) {
                faceIDButton.innerHTML = '<i class="fas fa-check"></i><span>Succès</span>';
                faceIDButton.style.background = '#28a745';
            }
            
            // Connexion automatique après un court délai
            setTimeout(() => {
                const authOverlay = document.getElementById('auth-overlay');
                const appContainer = document.getElementById('app-container');
                
                if (authOverlay) authOverlay.classList.add('fade-out');
                
                setTimeout(() => {
                    if (authOverlay) authOverlay.style.display = 'none';
                    if (appContainer) appContainer.style.display = 'block';
                    
                    // Initialiser l'application
                    updateBalanceDisplay();
                    renderTransactions();
                    updateNotificationBadge();
                    initializeSpecificPages();
                    renderVaultCarousel();
                    updateVaultDisplay();
                    initializeFaceID();
                }, 800);
            }, 1000);
            
        } else {
            // Échec de l'authentification Face ID
            if (faceIDButton) {
                faceIDButton.innerHTML = '<i class="fas fa-times"></i><span>Échec</span>';
                faceIDButton.style.background = '#dc3545';
            }
            
            setTimeout(() => {
                if (faceIDButton) {
                    faceIDButton.disabled = false;
                    faceIDButton.innerHTML = '<i class="fas fa-user-check"></i><span>Face ID</span>';
                    faceIDButton.style.background = '';
                }
            }, 2000);
        }
    }, 2000); // Délai de 2 secondes pour simuler la vérification
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
        `Voulez-vous recharger ${Number(amount).toLocaleString()} Fcfa via ${methodNames[selectedPaymentMethod]} ?`,
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
            generateIbanPDF();
        },
        'fas fa-download',  // Icône de téléchargement
        '#007AFF'           // Couleur bleue
    );
}

function generateIbanPDF() {
    try {
        showToast('Génération du RIB en cours...');
        
        // Vérifier si jsPDF est disponible avec différentes méthodes
        let jsPDF;
        if (window.jsPDF && window.jsPDF.jsPDF) {
            jsPDF = window.jsPDF.jsPDF;
        } else if (window.jsPDF) {
            jsPDF = window.jsPDF;
        } else if (typeof window.jspdf !== 'undefined') {
            jsPDF = window.jspdf.jsPDF;
        } else {
            showToast('Erreur: Bibliothèque PDF non disponible. Vérifiez votre connexion internet.');
            console.error('jsPDF not found. Available:', Object.keys(window).filter(k => k.toLowerCase().includes('pdf')));
            
            // Alternative : créer un fichier texte avec les informations
            createTextRIB();
            return;
        }
        const doc = new jsPDF();
        
        // Configuration des couleurs
        const primaryColor = [106, 17, 203]; // Violet K-Bank
        const textColor = [51, 51, 51]; // Gris foncé
        const accentColor = [37, 117, 252]; // Bleu
        
        // En-tête avec logo K-Bank
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('K-BANK', 20, 25);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text('Banque Digitale Moderne', 20, 32);
        
        // Date de génération
        const currentDate = new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.setTextColor(...textColor);
        doc.setFontSize(10);
        doc.text(`Généré le ${currentDate}`, 150, 32);
        
        // Titre du document
        doc.setTextColor(...primaryColor);
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('RELEVÉ D\'IDENTITÉ BANCAIRE (RIB)', 20, 60);
        
        // Informations du compte
        doc.setTextColor(...textColor);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('INFORMATIONS DU TITULAIRE', 20, 80);
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);
        
        // Données du client
        const clientData = [
            ['Nom du titulaire:', 'BATOLA Godwin Alpha'],
            ['Numéro de compte:', '30420001234567890'],
            ['Type de compte:', 'Compte Principal'],
            ['Date d\'ouverture:', '15 janvier 2023']
        ];
        
        let yPos = 90;
        clientData.forEach(([label, value]) => {
            doc.setFont(undefined, 'bold');
            doc.text(label, 25, yPos);
            doc.setFont(undefined, 'normal');
            doc.text(value, 80, yPos);
            yPos += 8;
        });
        
        // Section IBAN avec encadré
        yPos += 10;
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.5);
        doc.rect(20, yPos - 5, 170, 25);
        
        doc.setTextColor(...primaryColor);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('IBAN (International Bank Account Number)', 25, yPos + 3);
        
        doc.setTextColor(...textColor);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('GA21 3042 0001 2345 6789 0304', 25, yPos + 13);
        
        // Coordonnées bancaires
        yPos += 35;
        doc.setTextColor(...primaryColor);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('COORDONNÉES BANCAIRES', 20, yPos);
        
        doc.setTextColor(...textColor);
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        
        const bankData = [
            ['Banque:', 'K-BANK Gabon'],
            ['Code banque:', '30420'],
            ['Code guichet:', '00012'],
            ['Clé RIB:', '04'],
            ['BIC/SWIFT:', 'KBANKGAXXX'],
            ['Adresse:', 'Boulevard de l\'Indépendance'],
            ['', 'BP 20000 Libreville, Gabon'],
            ['Téléphone:', '+241 01 23 45 67'],
            ['Email:', 'batolaalpha@gmail.com']
        ];
        
        yPos += 10;
        bankData.forEach(([label, value]) => {
            if (label) {
                doc.setFont(undefined, 'bold');
                doc.text(label, 25, yPos);
                doc.setFont(undefined, 'normal');
                doc.text(value, 80, yPos);
            } else {
                doc.text(value, 80, yPos);
            }
            yPos += 6;
        });
        
        // Pied de page avec mentions légales
        yPos = 260;
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.3);
        doc.line(20, yPos, 190, yPos);
        
        doc.setTextColor(...textColor);
        doc.setFontSize(8);
        doc.setFont(undefined, 'italic');
        doc.text('Ce document est confidentiel et ne doit être communiqué qu\'aux organismes autorisés.', 20, yPos + 8);
        doc.text('K-Bank est une banque digitale régulée par la Banque Centrale du Gabon.', 20, yPos + 14);
        doc.text('Pour toute question, contactez notre service client au +241 01 23 45 67', 20, yPos + 20);
        
        // Téléchargement du PDF
        const fileName = `RIB_K-Bank_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(fileName);
        
        showToast('RIB téléchargé avec succès !');
        
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        showToast('Erreur lors de la génération du PDF');
    }
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
            // Utiliser notre fonction blockCard() qui gère l'icône ∅
            blockCard();

            const freezeButton = document.querySelector('.freeze-button');
            
            // Désactiver le bouton geler
            if (freezeButton) {
                freezeButton.disabled = true;
                freezeButton.style.opacity = '0.5';
                freezeButton.style.cursor = 'not-allowed';
                freezeButton.onclick = null; // Enlever l'événement click
            }
            
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
        vaultTotalElement.innerHTML = `Fcfa ${vaultBalance.toLocaleString('fr-FR')},<small>00</small>`;
    }
}

// Structure modifiée pour gérer plusieurs coffres-forts
let vaults = []; // Liste des coffres-forts disponibles
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
                    ${vault.balance.toLocaleString('fr-FR')},<small>00</small> Fcfa
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
    
    if (!container) return;
    
    const currentVault = getCurrentVault();
    
    if (currentVault && currentVault.goal) {
        if (noGoalMessage) {
            noGoalMessage.style.display = 'none';
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
                        <div class="vault-goal-amount">${currentVault.balance.toLocaleString('fr-FR')},00 Fcfa / ${currentVault.goal.target.toLocaleString('fr-FR')},00 Fcfa</div>
                        <div class="vault-progress-bar">
                            <div class="vault-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        if (noGoalMessage) {
            noGoalMessage.style.display = 'block';
        }
        container.innerHTML = '';
    }
}

function renderVaultHistory() {
    const container = document.getElementById('vault-transactions-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const currentVault = getCurrentVault();
    if (!currentVault || !currentVault.history) {
        container.innerHTML = '<div class="no-transactions">Aucune transaction</div>';
        return;
    }
    
    // Trier les transactions par date (plus récente en premier) et prendre les 5 dernières
    const transactions = [...currentVault.history]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    if (transactions.length === 0) {
        container.innerHTML = '<div class="no-transactions">Aucune transaction</div>';
        return;
    }
    
    transactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        
        const isDeposit = transaction.type === 'deposit';
        const iconColor = isDeposit ? '#22c55e' : '#ef4444';
        const iconBg = isDeposit ? '#22c55e20' : '#ef444420';
        const icon = isDeposit ? 'plus-circle' : 'minus-circle';
        const amountPrefix = isDeposit ? '+' : '-';
        
        transactionElement.innerHTML = `
            <div class="transaction-icon" style="background: ${iconBg}; color: ${iconColor};">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${transaction.description}</div>
                <div class="transaction-date">${formatVaultDate(transaction.date)}</div>
            </div>
            <div class="transaction-amount" style="color: ${iconColor};">
                ${amountPrefix}${transaction.amount.toLocaleString('fr-FR')} Fcfa
            </div>
        `;
        
        container.appendChild(transactionElement);
    });
}

// Fonction pour afficher toutes les transactions
function showAllVaultTransactions() {
    const currentVault = getCurrentVault();
    if (!currentVault) return;
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
    
    // Vérifier si le solde est suffisant
    if (userBalances.main < amount) {
        alert('Solde insuffisant dans le compte principal');
        return;
    }
    
    const currentVault = getCurrentVault();
    if (!currentVault) {
        alert('Aucun coffre-fort actif');
        return;
    }
    
    // Déduire du solde principal
    userBalances.main -= amount;
    
    const newTransaction = {
        id: Date.now(),
        type: 'deposit',
        amount: amount,
        date: new Date(),
        description: 'Dépôt dans le coffre-fort',
        goal: null
    };
    
    currentVault.history.unshift(newTransaction);
    currentVault.balance += amount;
    
    // Mettre à jour l'objectif si il existe
    if (currentVault.goal) {
        currentVault.goal.current = currentVault.balance;
    }
    
    updateBalanceDisplay();
    renderVaultCarousel();
    renderVaultGoal();
    renderVaultHistory();
    closeVaultDepositModal();
    
    showVaultNotification(`${amount.toLocaleString('fr-FR')} Fcfa déposé avec succès !`, 'success');
}

function confirmVaultWithdrawal() {
    const amount = parseFloat(document.getElementById('vault-withdraw-amount').value);
    if (!amount || amount <= 0) {
        alert('Veuillez saisir un montant valide');
        return;
    }
    
    const currentVault = getCurrentVault();
    if (!currentVault) {
        alert('Aucun coffre-fort actif');
        return;
    }
    
    if (amount > currentVault.balance) {
        alert('Solde insuffisant dans le coffre-fort');
        return;
    }
    
    // Retirer du coffre-fort et ajouter au solde principal
    const newTransaction = {
        id: Date.now(),
        type: 'withdraw',
        amount: amount,
        date: new Date(),
        description: 'Retrait du coffre-fort',
        goal: null
    };
    
    currentVault.history.unshift(newTransaction);
    currentVault.balance -= amount;
    
    // Mettre à jour l'objectif si il existe
    if (currentVault.goal) {
        currentVault.goal.current = currentVault.balance;
    }
    
    // Ajouter au solde principal
    userBalances.main += amount;
    
    updateBalanceDisplay();
    renderVaultCarousel();
    renderVaultGoal();
    renderVaultHistory();
    closeVaultWithdrawModal();
    
    showVaultNotification(`${amount.toLocaleString('fr-FR')} Fcfa retiré avec succès !`, 'success');
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

function formatVaultDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return d.toLocaleDateString('fr-FR', options);
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
    showToast('Taux de change - USD: 656 Fcfa | EUR: 724 Fcfa', 'info');
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
    // Fonction pour les paramètres principaux
    const toggle = document.getElementById('bio-toggle');
    if (toggle) {
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
}

// Fonction pour gérer le toggle biométrique dans la page de modification du profil
function handleBiometricToggle() {
    const biometricToggle = document.getElementById('biometricPref');
    if (biometricToggle) {
        biometricToggle.addEventListener('change', function() {
            const isEnabled = this.checked;
            
            if (isEnabled) {
                showToast('Authentification biométrique activée', 'success');
                // Mettre à jour le profil
                userProfile.preferences.biometric = true;
            } else {
                showToast('Authentification biométrique désactivée', 'info');
                userProfile.preferences.biometric = false;
            }
            
            // Sauvegarder dans localStorage
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
        });
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
                                <span style="color: white; font-weight: 600;">Comment geler/dégeler ma carte ?</span>
                            </div>
                            <i class="fas fa-chevron-down" style="color: #7456ff; transition: transform 0.3s ease;"></i>
                        </div>
                        <div class="modal-faq-answer" style="display: none;">
                            <p><strong>Pour geler votre carte :</strong></p>
                            <ol>
                                <li>Appuyez longuement sur votre carte bancaire sur l'écran d'accueil</li>
                                <li>Sélectionnez "Geler la carte"</li>
                                <li>Votre carte sera immédiatement gelée</li>
                                <li>Pour dégeler appuyez sur le bouton dégeler</li>
                            </ol>
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
                                <li>Confirmez avec votre code de sécurité</li>
                            </ol>
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
                            <h4>1. Via l'IBAN :</h4>
                            <ul>
                                <li>Cliquez sur "Nouveau bénéficiaire"</li>
                                <li>Saisissez le nom et l'IBAN</li>
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
                                <span style="color: white; font-weight: 600;">Comment changer mon code de sécurité ?</span>
                            </div>
                            <i class="fas fa-chevron-down" style="color: #7456ff; transition: transform 0.3s ease;"></i>
                        </div>
                        <div class="modal-faq-answer" style="display: none;">
                            <p><strong>Pour modifier votre code de sécurité :</strong></p>
                            <ol>
                                <li>Allez dans "Profil" depuis l'accueil</li>
                                <li>Sélectionnez "Sécurité"</li>
                                <li>Choisissez "Changer le code de sécurité"</li>
                                <li>Saisissez votre ancien code de sécurité</li>
                                <li>Créez un nouveau code (8 chiffres)</li>
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
                            <p><strong>Le coffre-fort vous aide à économiser :</strong></p>
                            <h4>Fonctionnalités :</h4>
                            <ul>
                                <li><strong>Objectifs d'économie :</strong> Définissez vos projets avec échéances</li>
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
let selectedFirstVaultIcon = 'vault';
let maxVaults = 3; // Maximum 3 coffres-forts (1 principal + 2 supplémentaires)

// Fonction pour vérifier l'état du coffre-fort et afficher la bonne vue
function checkVaultState() {
    const emptyState = document.getElementById('vault-empty-state');
    const mainView = document.getElementById('vault-main-view');
    
    if (vaults.length === 0) {
        // Aucun coffre-fort : afficher la vue de création
        emptyState.style.display = 'flex';
        mainView.style.display = 'none';
    } else {
        // Des coffres-forts existent : afficher la vue principale
        emptyState.style.display = 'none';
        mainView.style.display = 'block';
        updateVaultDisplay();
        renderVaultCarousel();
        
        // Gérer l'affichage du bouton "Nouveau coffre"
        const newVaultAction = document.getElementById('new-vault-action');
        if (newVaultAction) {
            if (vaults.length >= 3) {
                newVaultAction.style.display = 'none';
            } else {
                newVaultAction.style.display = 'flex';
            }
        }
    }
}

// Fonction pour sélectionner l'icône du premier coffre
function selectFirstVaultIcon(icon) {
    // Retirer la sélection précédente
    document.querySelectorAll('#vault-empty-state .vault-icon-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Ajouter la sélection à l'icône choisie
    const selectedOption = document.querySelector(`#vault-empty-state [data-icon="${icon}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    selectedFirstVaultIcon = icon;
}

// Fonction pour créer le premier coffre-fort
function createFirstVault() {
    const name = document.getElementById('first-vault-name').value.trim();
    const target = parseFloat(document.getElementById('first-vault-target').value);
    
    if (!name) {
        alert('Veuillez entrer un nom pour votre coffre-fort');
        return;
    }
    
    if (!target || target <= 0) {
        alert('Veuillez entrer un montant du coffre-fort valide');
        return;
    }
    
    const newVault = {
        id: Date.now(),
        name: name,
        description: 'Mon premier coffre-fort',
        icon: selectedFirstVaultIcon,
        balance: 0,
        goal: {
            name: name,
            target: target,
            current: 0,
            icon: selectedFirstVaultIcon
        },
        history: [],
        isMain: true
    };
    
    vaults.push(newVault);
    currentVaultIndex = 0;
    
    // Afficher la vue principale
    checkVaultState();
    
    showVaultNotification(`Coffre-fort "${name}" créé avec succès !`, 'success');
}

// Fonctions pour le modal de création de nouveau coffre-fort
function openNewVaultModal() {
    if (vaults.length >= 3) {
        showVaultNotification('Vous avez atteint la limite de 3 coffres-forts', 'error');
        return;
    }
    
    // Mettre à jour le message d'information selon le nombre de coffres
    const infoText = document.getElementById('vault-info-text');
    if (infoText) {
        if (vaults.length === 1) {
            infoText.textContent = 'Vous pouvez créer jusqu\'à 2 coffres-forts supplémentaires.';
        } else if (vaults.length === 2) {
            infoText.textContent = 'Vous ne pouvez plus créer qu\'un seul coffre-fort.';
        }
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
    document.getElementById('new-vault-target').value = '';
    selectedVaultIcon = 'vault';
    
    // Remettre à zéro la sélection d'icônes
    document.querySelectorAll('#new-vault-modal .vault-icon-option').forEach(option => {
        option.classList.remove('selected');
    });
    const defaultIcon = document.querySelector('#new-vault-modal [data-icon="vault"]');
    if (defaultIcon) {
        defaultIcon.classList.add('selected');
    }
}

function createNewVault() {
    const name = document.getElementById('new-vault-name').value.trim();
    const target = parseFloat(document.getElementById('new-vault-target').value);
    
    if (!name) {
        alert('Veuillez entrer un nom pour le coffre-fort');
        return;
    }
    
    if (!target || target <= 0) {
        alert('Veuillez entrer un montant du coffre-fort valide');
        return;
    }
    
    if (vaults.length >= 3) {
        showVaultNotification('Limite de coffres-forts atteinte (maximum 3)', 'error');
        return;
    }
    
    const newVault = {
        id: Date.now(),
        name: name,
        description: 'Coffre-fort ' + (vaults.length + 1),
        icon: selectedVaultIcon,
        balance: 0,
        goal: {
            name: name,
            target: target,
            current: 0,
            icon: selectedVaultIcon
        },
        history: [],
        isMain: false
    };
    
    vaults.push(newVault);
    currentVaultIndex = vaults.length - 1;
    
    // Fermer la modale
    closeNewVaultModal();
    
    // Mettre à jour l'affichage
    checkVaultState();
    goToVault(currentVaultIndex);
    
    const remaining = 3 - vaults.length;
    let message = `Coffre-fort "${name}" créé avec succès !`;
    if (remaining > 0) {
        message += ` (${remaining} coffre${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''})`;
    } else {
        message += ' (Limite atteinte)';
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
    
    // Initialiser le graphique dynamique
    initializeDynamicChart();
});

// ===========================================
// GRAPHIQUE DYNAMIQUE AVEC ANIMATION CONTINUE
// ===========================================

function initializeDynamicChart() {
    console.log('🚀 Démarrage du graphique dynamique...');
    
    const chartContainer = document.getElementById('dynamicChart');
    if (!chartContainer) {
        console.error('❌ Graphique non trouvé!');
        return;
    }
    
    console.log('✅ Graphique trouvé:', chartContainer);
    
    // Forcer l'affichage immédiat
    chartContainer.style.display = 'block';
    chartContainer.style.visibility = 'visible';
    chartContainer.style.opacity = '1';
    
    // Trouver toutes les barres
    const bars = chartContainer.querySelectorAll('.bar-fill');
    console.log(`📊 ${bars.length} barres trouvées`);
    
    // Forcer l'affichage de chaque barre
    bars.forEach((bar, index) => {
        console.log(`🔧 Configuration barre ${index + 1}`);
        
        // Styles forcés
        bar.style.display = 'block';
        bar.style.visibility = 'visible';
        bar.style.opacity = '1';
        bar.style.position = 'relative';
        bar.style.width = '100%';
        bar.style.minHeight = '30px';
        
        // Vérifier que la hauteur est définie
        const height = bar.style.height;
        console.log(`📏 Barre ${index + 1} hauteur: ${height}`);
        
        if (!height) {
            const chartBar = bar.closest('.chart-bar');
            const value = chartBar.getAttribute('data-value');
            bar.style.height = value + '%';
            console.log(`🔧 Hauteur forcée: ${value}%`);
        }
    });
    
    // Vérifier les labels
    const labels = chartContainer.querySelectorAll('.bar-label');
    console.log(`🏷️ ${labels.length} étiquettes trouvées`);
    
    labels.forEach((label, index) => {
        console.log(`🏷️ Label ${index + 1}: ${label.textContent}`);
    });
    
    console.log('✅ Graphique initialisé avec succès!');
    
    // Click handler simple
    chartContainer.addEventListener('click', function() {
        console.log('🖱️ Graphique cliqué!');
        const bars = this.querySelectorAll('.bar-fill');
        bars.forEach(bar => {
            if (bar.style.animationPlayState === 'paused') {
                bar.style.animationPlayState = 'running';
                console.log('▶️ Animation reprise');
            } else {
                bar.style.animationPlayState = 'paused';
                console.log('⏸️ Animation pausée');
            }
        });
    });
}

function updateChartValues() {
    const chartContainer = document.getElementById('dynamicChart');
    if (!chartContainer || !chartContainer.classList.contains('animating')) return;
    
    const bars = chartContainer.querySelectorAll('.chart-bar');
    
    bars.forEach((bar, index) => {
        const barFill = bar.querySelector('.bar-fill');
        const barValue = bar.querySelector('.bar-value');
        
        // Générer une variation aléatoire de ±10%
        const baseValue = parseInt(bar.getAttribute('data-value'));
        const variation = (Math.random() - 0.5) * 20; // -10% à +10%
        const newValue = Math.max(20, Math.min(100, baseValue + variation));
        
        // Calculer la nouvelle valeur financière
        const baseFinancialValue = parseFloat(barValue.textContent.replace('M', ''));
        const newFinancialValue = (baseFinancialValue * (newValue / baseValue)).toFixed(1);
        
        // Appliquer les nouvelles valeurs avec animation fluide
        barFill.style.transition = 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        barFill.style.height = newValue + '%';
        barValue.textContent = newFinancialValue + 'M';
        
        // Effet de pulsation sur la couleur
        const hue = 240 + (newValue - 50) * 2; // Bleu à violet selon la valeur
        barFill.style.background = `linear-gradient(180deg, 
            hsl(${hue}, 70%, 60%), 
            hsl(${hue + 20}, 70%, 50%))`;
    });
}

// Fonction utilitaire pour formater les devises
function formatCurrency(amount) {
    return amount.toLocaleString('fr-FR') + ' Fcfa';
}

// ===========================================
// GESTION DES PLAFONDS DE CARTE
// ===========================================

// Variables de plafonds
let cardLimits = {
    payment: 500000,    // Plafond de paiement en Fcfa
    withdrawal: 200000  // Plafond de retrait en Fcfa
};

// Usage actuel (simulé)
let currentUsage = {
    payment: 175000,    // Montant utilisé aujourd'hui pour les paiements
    withdrawal: 120000  // Montant retiré aujourd'hui
};

// Fonction pour ouvrir la page de gestion du plafond de paiement
function adjustPaymentLimit() {
    switchToPage('payment-limit-page');
    updatePaymentLimitDisplay();
}

// Fonction pour ouvrir la page de gestion du plafond de retrait
function adjustWithdrawalLimit() {
    switchToPage('withdrawal-limit-page');
    updateWithdrawalLimitDisplay();
}

// Fonction pour changer de page
function switchToPage(pageId) {
    // Cacher toutes les pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Afficher la page demandée
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// Fonction pour mettre à jour l'affichage du plafond de paiement
function updatePaymentLimitDisplay() {
    const currentLimitElement = document.querySelector('#payment-limit-page .current-limit');
    const usageProgressElement = document.querySelector('#payment-limit-page .usage-progress');
    const usageTextElement = document.querySelector('#payment-limit-page .usage-text');
    const inputElement = document.getElementById('new-payment-limit');
    
    if (currentLimitElement) {
        currentLimitElement.innerHTML = `${cardLimits.payment.toLocaleString('fr-FR')} <span>Fcfa / jour</span>`;
    }
    
    if (usageProgressElement && usageTextElement) {
        const usagePercentage = (currentUsage.payment / cardLimits.payment) * 100;
        usageProgressElement.style.width = `${usagePercentage}%`;
        usageTextElement.textContent = `${currentUsage.payment.toLocaleString('fr-FR')} Fcfa utilisés sur ${cardLimits.payment.toLocaleString('fr-FR')} Fcfa`;
    }
    
    if (inputElement) {
        inputElement.value = cardLimits.payment;
    }
    
    // Mettre à jour les boutons preset
    updatePaymentPresetButtons();
}

// Fonction pour mettre à jour l'affichage du plafond de retrait
function updateWithdrawalLimitDisplay() {
    const currentLimitElement = document.querySelector('#withdrawal-limit-page .current-limit');
    const usageProgressElement = document.querySelector('#withdrawal-limit-page .usage-progress');
    const usageTextElement = document.querySelector('#withdrawal-limit-page .usage-text');
    const inputElement = document.getElementById('new-withdrawal-limit');
    
    if (currentLimitElement) {
        currentLimitElement.innerHTML = `${cardLimits.withdrawal.toLocaleString('fr-FR')} <span>Fcfa / jour</span>`;
    }
    
    if (usageProgressElement && usageTextElement) {
        const usagePercentage = (currentUsage.withdrawal / cardLimits.withdrawal) * 100;
        usageProgressElement.style.width = `${usagePercentage}%`;
        usageTextElement.textContent = `${currentUsage.withdrawal.toLocaleString('fr-FR')} Fcfa retirés sur ${cardLimits.withdrawal.toLocaleString('fr-FR')} Fcfa`;
    }
    
    if (inputElement) {
        inputElement.value = cardLimits.withdrawal;
    }
    
    // Mettre à jour les boutons preset
    updateWithdrawalPresetButtons();
}

// Fonction pour définir un plafond de paiement prédéfini
function setPaymentLimit(amount) {
    const inputElement = document.getElementById('new-payment-limit');
    if (inputElement) {
        inputElement.value = amount;
    }
    updatePaymentPresetButtons(amount);
}

// Fonction pour définir un plafond de retrait prédéfini
function setWithdrawalLimit(amount) {
    const inputElement = document.getElementById('new-withdrawal-limit');
    if (inputElement) {
        inputElement.value = amount;
    }
    updateWithdrawalPresetButtons(amount);
}

// Fonction pour mettre à jour les boutons preset de paiement
function updatePaymentPresetButtons(selectedAmount = null) {
    const buttons = document.querySelectorAll('#payment-limit-page .preset-btn');
    const currentAmount = selectedAmount || cardLimits.payment;
    
    buttons.forEach(button => {
        button.classList.remove('active');
        const buttonAmount = parseInt(button.textContent.replace(/[^\d]/g, ''));
        if (buttonAmount === currentAmount) {
            button.classList.add('active');
        }
    });
}

// Fonction pour mettre à jour les boutons preset de retrait
function updateWithdrawalPresetButtons(selectedAmount = null) {
    const buttons = document.querySelectorAll('#withdrawal-limit-page .preset-btn');
    const currentAmount = selectedAmount || cardLimits.withdrawal;
    
    buttons.forEach(button => {
        button.classList.remove('active');
        const buttonAmount = parseInt(button.textContent.replace(/[^\d]/g, ''));
        if (buttonAmount === currentAmount) {
            button.classList.add('active');
        }
    });
}

// Fonction pour mettre à jour le plafond de paiement
function updatePaymentLimit() {
    const inputElement = document.getElementById('new-payment-limit');
    const submitButton = document.querySelector('.payment-limit-page .primary-button');
    
    const newLimit = parseInt(inputElement.value);
    
    if (!newLimit || newLimit < 50000 || newLimit > 1000000) {
        showNotification('Veuillez entrer un montant valide entre 50 000 et 1 000 000 Fcfa', 'error');
        return;
    }
    
    // NE PAS modifier le plafond - juste enregistrer la demande
    // Les plafonds restent invariables jusqu'à validation par la banque
    
    // Marquer qu'une demande est en attente
    const statusElement = document.querySelector('.payment-limit-page .limit-status');
    if (statusElement) {
        statusElement.innerHTML = `
            <i class="fas fa-clock"></i>
            <span>Demande en cours d'examen</span>
        `;
        statusElement.style.color = '#f59e0b';
    }
    
    // Bloquer le bouton et désactiver les champs
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.5';
        submitButton.style.cursor = 'not-allowed';
        submitButton.innerHTML = '<i class="fas fa-lock"></i> Demande en attente';
    }
    
    // Désactiver le champ de saisie
    inputElement.disabled = true;
    
    // Désactiver les boutons de plafonds suggérés
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    });
    
    // Afficher notification de succès
    showNotification(`Demande de modification du plafond de paiement soumise : ${newLimit.toLocaleString('fr-FR')} Fcfa/jour. Votre demande sera étudiée par nos équipes.`, 'success');
    
    // Réinitialiser le champ
    inputElement.value = '';
}

// Fonction pour mettre à jour le plafond de retrait
function updateWithdrawalLimit() {
    const inputElement = document.getElementById('new-withdrawal-limit');
    const submitButton = document.querySelector('.withdrawal-limit-page .primary-button');
    
    const newLimit = parseInt(inputElement.value);
    
    if (!newLimit || newLimit < 25000 || newLimit > 500000) {
        showNotification('Veuillez entrer un montant valide entre 25 000 et 500 000 Fcfa', 'error');
        return;
    }
    
    // NE PAS modifier le plafond - juste enregistrer la demande
    // Les plafonds restent invariables jusqu'à validation par la banque
    
    // Marquer qu'une demande est en attente
    const statusElement = document.querySelector('.withdrawal-limit-page .limit-status');
    if (statusElement) {
        statusElement.innerHTML = `
            <i class="fas fa-clock"></i>
            <span>Demande en cours d'examen</span>
        `;
        statusElement.style.color = '#f59e0b';
    }
    
    // Bloquer le bouton et désactiver les champs
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.5';
        submitButton.style.cursor = 'not-allowed';
        submitButton.innerHTML = '<i class="fas fa-lock"></i> Demande en attente';
    }
    
    // Désactiver le champ de saisie
    inputElement.disabled = true;
    
    // Désactiver tous les boutons de plafonds suggérés
    document.querySelectorAll('.withdrawal-limit-page .preset-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    });
    
    // Afficher notification de succès
    showNotification(`Demande de modification du plafond de retrait soumise : ${newLimit.toLocaleString('fr-FR')} Fcfa/jour. Votre demande sera étudiée par nos équipes.`, 'success');
    
    // Réinitialiser le champ
    inputElement.value = '';
}

// Fonction pour mettre à jour l'affichage des plafonds sur la page carte principale
function updateCardLimitsDisplay() {
    // Mettre à jour le plafond de paiement
    const paymentLimitElement = document.querySelector('[onclick="adjustPaymentLimit()"] .card-meta');
    if (paymentLimitElement) {
        paymentLimitElement.innerHTML = `Fcfa ${cardLimits.payment.toLocaleString('fr-FR')} / jour`;
    }
    
    // Mettre à jour le plafond de retrait
    const withdrawalLimitElement = document.querySelector('[onclick="adjustWithdrawalLimit()"] .card-meta');
    if (withdrawalLimitElement) {
        withdrawalLimitElement.innerHTML = `Fcfa ${cardLimits.withdrawal.toLocaleString('fr-FR')} / jour`;
    }
}

// Fonction pour afficher des notifications
function showNotification(message, type = 'info') {
    // Créer l'élément de notification s'il n'existe pas
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            padding: 8px 12px;
            border-radius: 20px;
            color: white;
            font-weight: 400;
            font-size: 12px;
            line-height: 1.2;
            z-index: 10000;
            transition: all 0.3s ease;
            max-width: 280px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            word-wrap: break-word;
            overflow-wrap: break-word;
        `;
        document.body.appendChild(notification);
    }
    
    // Définir la couleur selon le type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    // Afficher la notification
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
    
    // Masquer la notification après 4 secondes
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(100px)';
        
        // Supprimer complètement la notification après l'animation
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Initialiser les plafonds au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    updateCardLimitsDisplay();
    initializeBeneficiaryPage();
});

// ===============================================
// FONCTIONS POUR LA PAGE AJOUTER BÉNÉFICIAIRE
// ===============================================

function initializeBeneficiaryPage() {
    // Initialiser les événements pour les types de compte
    const accountTypeRadios = document.querySelectorAll('input[name="account-type"]');
    accountTypeRadios.forEach(radio => {
        radio.addEventListener('change', toggleAccountTypeFields);
    });
    
    // Initialiser les événements pour les tags de catégorie
    const categoryTags = document.querySelectorAll('.category-tag');
    categoryTags.forEach(tag => {
        tag.addEventListener('click', function() {
            toggleCategoryTag(this);
        });
    });
    
    // Ajouter des validations en temps réel
    setupInputValidations();
}

function setupInputValidations() {
    // Validation du nom - uniquement lettres, espaces, tirets et apostrophes
    const nameInput = document.getElementById('beneficiary-name');
    if (nameInput) {
        nameInput.addEventListener('input', function(e) {
            // Remplacer tout caractère qui n'est pas une lettre, espace, tiret ou apostrophe
            this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s\-']/g, '');
        });
    }
    
    // Validation de l'IBAN - format GA21 + chiffres et espaces (max 27 caractères sans espaces)
    const ibanInput = document.getElementById('beneficiary-iban');
    if (ibanInput) {
        ibanInput.addEventListener('input', function(e) {
            let value = this.value.toUpperCase().replace(/[^GA0-9\s]/g, '');
            
            // Enlever tous les espaces pour compter
            let withoutSpaces = value.replace(/\s/g, '');
            
            // Limiter à 27 caractères (GA21 + 23 chiffres)
            if (withoutSpaces.length > 27) {
                withoutSpaces = withoutSpaces.substring(0, 27);
            }
            
            // S'assurer que ça commence par GA21
            if (withoutSpaces.length > 0 && !withoutSpaces.startsWith('G')) {
                withoutSpaces = 'GA21' + withoutSpaces;
            } else if (withoutSpaces.length > 1 && !withoutSpaces.startsWith('GA')) {
                withoutSpaces = 'GA' + withoutSpaces.substring(1);
            } else if (withoutSpaces.length > 2 && !withoutSpaces.startsWith('GA2')) {
                withoutSpaces = 'GA2' + withoutSpaces.substring(2);
            } else if (withoutSpaces.length > 3 && !withoutSpaces.startsWith('GA21')) {
                withoutSpaces = 'GA21' + withoutSpaces.substring(3);
            }
            
            // Formater avec des espaces tous les 4 caractères
            let formatted = '';
            for (let i = 0; i < withoutSpaces.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formatted += ' ';
                }
                formatted += withoutSpaces[i];
            }
            
            this.value = formatted;
        });
        
        // Validation lors de la perte de focus
        ibanInput.addEventListener('blur', function(e) {
            let withoutSpaces = this.value.replace(/\s/g, '');
            if (withoutSpaces.length > 0 && withoutSpaces.length < 27) {
                showToast('L\'IBAN doit contenir exactement 27 caractères (GA21 + 23 chiffres)', 'error');
            }
        });
    }
    
    // Validation du téléphone - uniquement chiffres, +, espaces et tirets (max 15 caractères)
    const phoneInput = document.getElementById('beneficiary-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Supprimer les caractères non autorisés
            this.value = this.value.replace(/[^0-9\+\s\-]/g, '');
            // Limiter à 15 caractères
            if (this.value.length > 15) {
                this.value = this.value.slice(0, 15);
            }
        });
    }
    
    // Validation des montants - uniquement chiffres
    const amountInputs = document.querySelectorAll('input[type="number"], .amount-input');
    amountInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Empêcher les valeurs négatives
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });
}

function selectMethod(method) {
    // Désactiver tous les cards
    document.querySelectorAll('.method-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Activer le card sélectionné
    document.querySelector(`[data-method="${method}"]`).classList.add('active');
    
    // Masquer toutes les sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Afficher la section correspondante
    const targetSection = document.getElementById(`${method}-form`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

function toggleAccountTypeFields() {
    const selectedType = document.querySelector('input[name="account-type"]:checked').value;
    const ibanGroup = document.getElementById('iban-group');
    const phoneGroup = document.getElementById('phone-group');
    
    if (selectedType === 'iban') {
        ibanGroup.style.display = 'block';
        phoneGroup.style.display = 'none';
        document.getElementById('beneficiary-iban').required = true;
        document.getElementById('beneficiary-phone').required = false;
    } else {
        ibanGroup.style.display = 'none';
        phoneGroup.style.display = 'block';
        document.getElementById('beneficiary-iban').required = false;
        document.getElementById('beneficiary-phone').required = true;
    }
}

function toggleCategoryTag(tag) {
    // Désactiver tous les autres tags
    document.querySelectorAll('.category-tag').forEach(t => {
        if (t !== tag) {
            t.classList.remove('active');
        }
    });
    
    // Toggle le tag cliqué
    tag.classList.toggle('active');
}

function startQRScan() {
    showToast('Fonctionnalité de scan QR en développement', 'info');
    // TODO: Implémenter le scan QR
}

function cancelAddBeneficiary() {
    // Réinitialiser le formulaire
    const nameElement = document.getElementById('beneficiary-name');
    const ibanElement = document.getElementById('beneficiary-iban');
    const phoneElement = document.getElementById('beneficiary-phone');
    const bankElement = document.getElementById('beneficiary-bank');
    
    if (nameElement) nameElement.value = '';
    if (ibanElement) ibanElement.value = '';
    if (phoneElement) phoneElement.value = '';
    if (bankElement) bankElement.value = '';
    
    // Remettre le type de compte IBAN par défaut
    const ibanRadio = document.querySelector('input[name="account-type"][value="iban"]');
    if (ibanRadio) ibanRadio.checked = true;
    
    // Désélectionner toutes les catégories
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('selected');
    });
    
    // Retourner à la page de virement
    switchTab('virement');
}

function saveBeneficiary() {
    console.log('saveBeneficiary appelée');
    
    const nameElement = document.getElementById('beneficiary-name');
    console.log('nameElement:', nameElement);
    console.log('name value:', nameElement ? nameElement.value : 'non trouvé');
    
    if (!nameElement || !nameElement.value.trim()) {
        showToast('Veuillez saisir le nom du bénéficiaire', 'error');
        return;
    }
    
    const name = nameElement.value.trim();
    
    const accountTypeElement = document.querySelector('input[name="account-type"]:checked');
    console.log('accountTypeElement:', accountTypeElement);
    
    if (!accountTypeElement) {
        showToast('Veuillez sélectionner un type de compte', 'error');
        return;
    }
    
    const accountType = accountTypeElement.value;
    console.log('accountType:', accountType);
    
    const bank = document.getElementById('beneficiary-bank').value;
    
    let accountInfo = '';
    if (accountType === 'iban') {
        const ibanElement = document.getElementById('beneficiary-iban');
        if (!ibanElement || !ibanElement.value.trim()) {
            showToast('Veuillez saisir l\'IBAN', 'error');
            return;
        }
        accountInfo = ibanElement.value.trim();
    } else {
        const phoneElement = document.getElementById('beneficiary-phone');
        if (!phoneElement || !phoneElement.value.trim()) {
            showToast('Veuillez saisir le numéro de téléphone', 'error');
            return;
        }
        accountInfo = phoneElement.value.trim();
    }
    
    // Récupérer la catégorie sélectionnée
    const selectedCategory = document.querySelector('.category-tag.active');
    const category = selectedCategory ? selectedCategory.dataset.category : 'autre';
    
    console.log('Tout est OK, enregistrement...');
    
    // Créer le nouvel objet bénéficiaire
    const newBeneficiary = {
        id: Date.now(),
        name: name,
        account: accountInfo,
        bank: bank || 'K-Bank',
        avatar: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        lastTransaction: 'Nouveau',
        category: category
    };
    
    // Ajouter à la liste des bénéficiaires
    beneficiaries.push(newBeneficiary);
    
    // Enregistrer dans localStorage
    localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));
    
    // Afficher un message de succès
    showToast('Bénéficiaire ajouté avec succès !', 'success');
    
    // Attendre un peu puis aller vers la page virement
    setTimeout(() => {
        // Réinitialiser le formulaire
        resetBeneficiaryForm();
        
        // Rafraîchir la liste des bénéficiaires
        renderBeneficiaries();
        renderVirementBeneficiaries();
        
        // Rediriger vers la page virement
        switchTab('virement');
    }, 1500);
}

function resetBeneficiaryForm() {
    // Réinitialiser tous les champs
    document.getElementById('beneficiary-name').value = '';
    document.getElementById('beneficiary-iban').value = '';
    document.getElementById('beneficiary-phone').value = '';
    document.getElementById('beneficiary-bank').value = '';
    
    // Réinitialiser les radio buttons
    document.querySelector('input[name="account-type"][value="iban"]').checked = true;
    toggleAccountTypeFields();
    
    // Réinitialiser les catégories
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    // Réinitialiser la méthode sélectionnée
    selectMethod('manual');
}

function showBeneficiaryHelp() {
    const helpContent = `
        <div class="help-content">
            <h4>Comment ajouter un bénéficiaire ?</h4>
            <div class="help-methods">
                <div class="help-method">
                    <i class="fas fa-edit"></i>
                    <div>
                        <strong>Saisie manuelle</strong>
                        <p>Entrez manuellement les informations du bénéficiaire (IBAN ou téléphone)</p>
                    </div>
                </div>
                <div class="help-method">
                    <i class="fas fa-qrcode"></i>
                    <div>
                        <strong>QR Code</strong>
                        <p>Scannez le QR code partagé par votre bénéficiaire</p>
                    </div>
                </div>
                <div class="help-method">
                    <i class="fas fa-address-book"></i>
                    <div>
                        <strong>Contacts</strong>
                        <p>Sélectionnez un contact déjà enregistré dans votre téléphone</p>
                    </div>
                </div>
            </div>
            <div class="help-note">
                <i class="fas fa-info-circle"></i>
                <p>Tous vos bénéficiaires sont sécurisés et cryptés</p>
            </div>
        </div>
    `;
    
    showToast('Aide affichée', 'info');
    // TODO: Afficher dans une vraie modal d'aide
}

// Alternative de fallback pour créer un RIB en texte si PDF ne fonctionne pas
function createTextRIB() {
    const currentDate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const ribContent = `
╔══════════════════════════════════════════════════════════════════════════╗
║                            K-BANK GABON                                 ║
║                      RELEVÉ D'IDENTITÉ BANCAIRE                         ║
╚══════════════════════════════════════════════════════════════════════════╝

Généré le ${currentDate}

INFORMATIONS DU TITULAIRE
─────────────────────────────────────────
Nom et Prénom     : Godwin BATOLA
Adresse          : Quartier Louis derrière Jeanne Ebori
                   BP 20000 Libreville, Gabon

COORDONNÉES BANCAIRES
─────────────────────────────────────────
IBAN             : GA21 XXXX XXXX XXXX XXXXXXXX 304
BIC/SWIFT        : KBANKGAXXX
Banque           : K-BANK Gabon
Code banque      : 30420
Code guichet     : 00012
Numéro de compte : XXXXXXXXXXXX304
Clé RIB          : 04

COORDONNÉES DE LA BANQUE
─────────────────────────────────────────
Banque           : K-BANK Gabon
Adresse          : Boulevard de l'Indépendance
                   BP 20000 Libreville, Gabon
Téléphone        : +241 01 23 45 67
Email            : contact@k-bank.ga

─────────────────────────────────────────
Ce document est confidentiel et ne doit être communiqué qu'aux organismes autorisés.
K-Bank est une banque digitale régulée par la Banque Centrale du Gabon.
Pour toute question, contactez notre service client au +241 01 23 45 67
    `;
    
    // Créer et télécharger le fichier texte
    const blob = new Blob([ribContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RIB_K-Bank_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('RIB téléchargé au format texte !');
}

// ===========================================
// SYSTÈME DE GESTION DU PROFIL
// ===========================================

// Données du profil utilisateur
let userProfile = {
    personalInfo: {
        firstName: 'Godwin',
        lastName: 'Batola',
        email: 'godwin.batola@k-bank.ga',
        phone: '+241 01 23 45 67',
        birthDate: '1990-01-01',
        nationality: 'Gabonaise',
        profession: 'Entrepreneur',
        address: '123 Boulevard Leon Mba, Libreville'
    },
    preferences: {
        notifications: true,
        biometric: false,
        marketing: true,
        autoSave: true
    }
};

// Fonction pour sauvegarder les modifications du profil
function saveProfileChanges() {
    const form = document.getElementById('editProfileForm');
    if (!form) return;

    // Récupérer les données du formulaire
    const formData = new FormData(form);
    const newProfile = {
        personalInfo: {
            firstName: formData.get('firstName') || userProfile.personalInfo.firstName,
            lastName: formData.get('lastName') || userProfile.personalInfo.lastName,
            email: formData.get('email') || userProfile.personalInfo.email,
            phone: formData.get('phone') || userProfile.personalInfo.phone,
            birthDate: formData.get('birthDate') || userProfile.personalInfo.birthDate,
            nationality: formData.get('nationality') || userProfile.personalInfo.nationality,
            profession: formData.get('profession') || userProfile.personalInfo.profession,
            address: formData.get('address') || userProfile.personalInfo.address
        },
        preferences: {
            notifications: document.getElementById('notificationsPref')?.checked || false,
            biometric: document.getElementById('biometricPref')?.checked || false,
            marketing: document.getElementById('marketingPref')?.checked || false,
            autoSave: document.getElementById('autoSavePref')?.checked || false
        }
    };

    // Validation des données
    if (!newProfile.personalInfo.firstName || !newProfile.personalInfo.lastName) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }

    if (!isValidEmail(newProfile.personalInfo.email)) {
        showToast('Veuillez entrer une adresse e-mail valide', 'error');
        return;
    }

    // Afficher l'animation de chargement
    const saveBtn = document.querySelector('.btn-primary');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sauvegarde...';
    saveBtn.disabled = true;

    // Simuler la sauvegarde
    setTimeout(() => {
        // Mettre à jour le profil
        userProfile = { ...userProfile, ...newProfile };
        
        // Sauvegarder dans localStorage
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        // Mettre à jour l'affichage
        updateProfileDisplay();
        
        // Restaurer le bouton
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        
        // Afficher le message de succès
        showToast('Profil mis à jour avec succès !', 'success');
        
        // Retourner à la page profil
        setTimeout(() => {
            switchTab('profile');
        }, 1000);
        
    }, 1500);
}

// Fonction pour mettre à jour l'affichage du profil
function updateProfileDisplay() {
    // Mettre à jour le nom dans l'en-tête
    const profileName = document.querySelector('.profile-name');
    if (profileName) {
        profileName.textContent = `${userProfile.personalInfo.firstName} ${userProfile.personalInfo.lastName}`;
    }

    // Mettre à jour l'email dans le profil
    const profileEmail = document.querySelector('.profile-email');
    if (profileEmail) {
        profileEmail.textContent = userProfile.personalInfo.email;
    }

    // Mettre à jour les initiales dans l'avatar
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profileAvatar) {
        profileAvatar.innerHTML = '<i class="fas fa-user"></i>';
    }

    // Mettre à jour l'avatar dans la page d'édition
    const photoAvatar = document.querySelector('.photo-avatar');
    if (photoAvatar) {
        photoAvatar.innerHTML = '<i class="fas fa-user"></i>';
    }
}

// Fonction pour charger les données du profil dans le formulaire
function loadProfileData() {
    // Charger depuis localStorage si disponible
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
    }

    // Définir des placeholders avec les données actuelles comme exemples
    const form = document.getElementById('editProfileForm');
    if (!form) return;

    // Définir les placeholders pour les champs personnels
    const fieldPlaceholders = {
        'firstName': userProfile.personalInfo.firstName || 'Ex: Godwin',
        'lastName': userProfile.personalInfo.lastName || 'Ex: Batola',
        'email': userProfile.personalInfo.email || 'Ex: godwin.batola@k-bank.ga',
        'phone': userProfile.personalInfo.phone || 'Ex: +241 01 23 45 67',
        'birthDate': userProfile.personalInfo.birthDate || '1990-01-01',
        'nationality': userProfile.personalInfo.nationality || 'Ex: Gabonaise',
        'profession': userProfile.personalInfo.profession || 'Ex: Entrepreneur',
        'address': userProfile.personalInfo.address || 'Ex: 123 Boulevard Leon Mba, Libreville'
    };

    Object.keys(fieldPlaceholders).forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (input) {
            input.placeholder = fieldPlaceholders[field];
            input.value = ''; // Laisser vide pour que l'utilisateur puisse taper
        }
    });

    // Charger les préférences (garder le comportement actuel pour les toggles)
    const preferences = ['notifications', 'biometric', 'marketing', 'autoSave'];
    preferences.forEach(pref => {
        const checkbox = document.getElementById(`${pref}Pref`);
        if (checkbox) {
            checkbox.checked = userProfile.preferences[pref];
        }
    });

    // Mettre à jour l'affichage
    updateProfileDisplay();
}

// Fonction pour valider l'email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Fonction pour annuler les modifications
function cancelProfileEdit() {
    // Retourner à la page profil sans sauvegarder
    switchTab('profile');
    showToast('Modifications annulées', 'info');
}

// Fonction pour changer la photo de profil
function changeProfilePhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const photoAvatar = document.querySelector('.photo-avatar');
                if (photoAvatar) {
                    photoAvatar.style.backgroundImage = `url(${e.target.result})`;
                    photoAvatar.style.backgroundSize = 'cover';
                    photoAvatar.style.backgroundPosition = 'center';
                    photoAvatar.innerHTML = ''; // Supprimer l'icône
                }
                showToast('Photo de profil mise à jour !', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// Initialiser le profil au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
    updateProfileDisplay();
    handleBiometricToggle();
    
    // Gestionnaire pour le formulaire de modification du profil
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfileChanges();
        });
    }
});

// Solution ultime pour texte net sur mobile
function createCrispBalanceText() {
    const balanceDisplay = document.getElementById('balance-display');
    if (!balanceDisplay) return;
    
    // Détection mobile
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Créer le texte avec des propriétés optimisées pour mobile
        balanceDisplay.innerHTML = `
            <span style="
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                font-weight: 800;
                font-size: 28px;
                color: rgb(255, 255, 255);
                text-rendering: geometricPrecision;
                -webkit-font-smoothing: subpixel-antialiased;
                letter-spacing: 0.5px;
                display: inline-block;
                transform: translateZ(0);
                will-change: auto;
            ">Fcfa 780 245,</span><small style="
                font-size: 18px;
                color: rgb(255, 255, 255);
                opacity: 0.9;
            ">00</small>
        `;
    } else {
        // Version desktop normale
        balanceDisplay.innerHTML = 'Fcfa 780 245,<small>00</small>';
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', function() {
    createCrispBalanceText();
    initializeFaceID();
});

// ===============================================
// MENU HAMBURGER
// ===============================================
function toggleMenu() {
    const menu = document.getElementById('hamburger-menu');
    menu.classList.toggle('active');
}

// ===============================================
// FONCTIONS TONTINE
// ===============================================

// Variables globales pour la tontine
let currentTontineData = null;
let currentTontineMembers = [];
let tontinesList = []; // Liste de toutes les tontines créées
let hasTontines = false; // Indicateur si l'utilisateur a des tontines

function createFirstTontine() {
    const name = document.getElementById('first-tontine-name').value;
    const amount = document.getElementById('first-tontine-amount').value;
    const frequency = document.getElementById('first-tontine-frequency').value;
    
    if (!name || !amount || !frequency) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    // Initialiser les données de la tontine
    currentTontineMembers = [];
    currentTontineData = {
        name: name,
        amount: parseInt(amount),
        frequency: frequency,
        memberCount: 1,
        members: ['Vous'],
        cagnotte: parseInt(amount),
        createdDate: new Date()
    };
    
    // Calculer la prochaine date
    let nextDate = new Date();
    if (frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
    } else if (frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const nextDateFormatted = nextDate.toLocaleDateString('fr-FR', dateOptions);
    
    // Mettre à jour la page de détails
    document.getElementById('detail-tontine-name').textContent = name;
    document.getElementById('detail-members-count').textContent = '1/5 personnes';
    document.getElementById('detail-next-date').textContent = nextDateFormatted;
    document.getElementById('detail-next-recipient').textContent = 'Vous';
    document.getElementById('detail-total-balance').textContent = `${parseInt(amount).toLocaleString()} Fcfa`;
    
    const frequencyText = frequency === 'weekly' ? '/semaine' : '/mois';
    document.getElementById('detail-my-contribution').textContent = `${parseInt(amount).toLocaleString()} Fcfa${frequencyText}`;
    
    // Mettre à jour remaining slots
    document.getElementById('remaining-slots').textContent = '4';
    
    // Mettre à jour la liste des membres
    updateTontineMembersList();
    
    // Ajouter la tontine à la liste
    tontinesList.push(currentTontineData);
    hasTontines = true;
    
    // Cacher toutes les pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Afficher la page de détails
    document.getElementById('tontine-detail-page').classList.add('active');
    
    let frequencyNotif = frequency === 'weekly' ? 'chaque semaine' : 
                        frequency === 'monthly' ? 'chaque fin de mois' : 'date personnalisée';
    
    showNotification(`Tontine "${name}" créée avec succès ! Versements ${frequencyNotif}.`, 'success');
}

function goBackToTontine() {
    // Retourner à la page d'accueil
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById('home-page').classList.add('active');
    
    // Réactiver le nav item home
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const homeNavItem = document.querySelector('.nav-item[onclick="switchTab(\'home\')"]');
    if (homeNavItem) {
        homeNavItem.classList.add('active');
    }
}

function updateTontinesList() {
    const carousel = document.getElementById('tontine-carousel');
    if (!carousel || tontinesList.length === 0) return;
    
    let carouselHTML = '';
    
    tontinesList.forEach((tontine, index) => {
        const frequencyText = tontine.frequency === 'weekly' ? '/semaine' : '/mois';
        const nextDate = new Date();
        if (tontine.frequency === 'weekly') {
            nextDate.setDate(nextDate.getDate() + 7);
        } else {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }
        const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        const nextDateFormatted = nextDate.toLocaleDateString('fr-FR', dateOptions);
        
        carouselHTML += `
            <div class="tontine-carousel-card ${index === 0 ? 'active' : ''}" onclick="openTontineDetail(${index})">
                <div class="tontine-card-header">
                    <div class="tontine-card-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>${tontine.name}</h3>
                    <span class="tontine-status-badge active">Active</span>
                </div>
                
                <div class="tontine-card-body">
                    <div class="tontine-members-preview">
                        <div class="member-avatar">Vous</div>
                        ${tontine.memberCount > 1 ? `<div class="member-avatar">+${tontine.memberCount - 1}</div>` : ''}
                    </div>
                    
                    <div class="tontine-stats">
                        <div class="stat-item">
                            <span class="stat-label">Membres</span>
                            <span class="stat-value">${tontine.memberCount}/5 personnes</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Cagnotte totale</span>
                            <span class="stat-value">${tontine.cagnotte.toLocaleString()} Fcfa</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Ma cotisation</span>
                            <span class="stat-value">${tontine.amount.toLocaleString()} Fcfa${frequencyText}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Prochain tour</span>
                            <span class="stat-value">${nextDateFormatted}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    carousel.innerHTML = carouselHTML;
}

function openTontineDetail(index) {
    if (index < 0 || index >= tontinesList.length) return;
    
    currentTontineData = tontinesList[index];
    currentTontineMembers = currentTontineData.members.slice(1).map((name, idx) => ({
        name: name,
        id: Date.now() + idx
    }));
    
    // Calculer la prochaine date
    let nextDate = new Date();
    if (currentTontineData.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
    } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const nextDateFormatted = nextDate.toLocaleDateString('fr-FR', dateOptions);
    
    // Mettre à jour la page de détails
    document.getElementById('detail-tontine-name').textContent = currentTontineData.name;
    document.getElementById('detail-members-count').textContent = `${currentTontineData.memberCount}/5 personnes`;
    document.getElementById('detail-next-date').textContent = nextDateFormatted;
    document.getElementById('detail-next-recipient').textContent = currentTontineData.members[0];
    document.getElementById('detail-total-balance').textContent = `${currentTontineData.cagnotte.toLocaleString()} Fcfa`;
    
    const frequencyText = currentTontineData.frequency === 'weekly' ? '/semaine' : '/mois';
    document.getElementById('detail-my-contribution').textContent = `${currentTontineData.amount.toLocaleString()} Fcfa${frequencyText}`;
    
    document.getElementById('remaining-slots').textContent = 5 - currentTontineData.memberCount;
    document.getElementById('withdraw-balance').textContent = `${currentTontineData.cagnotte.toLocaleString()} Fcfa`;
    
    // Mettre à jour la liste des membres
    updateTontineMembersList();
    
    // Afficher la page de détails
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('tontine-detail-page').classList.add('active');
}

function updateTontineMembersList() {
    const membersList = document.getElementById('detail-members-list');
    let membersHTML = `
        <div class="member-card">
            <div class="member-avatar-detail">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="member-info-detail">
                <span class="member-name-detail">Vous</span>
                <span class="member-status-detail">Créateur</span>
            </div>
            <div class="member-badge crown">
                <i class="fas fa-crown"></i>
            </div>
        </div>
    `;
    
    currentTontineMembers.forEach(member => {
        membersHTML += `
            <div class="member-card">
                <div class="member-avatar-detail">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="member-info-detail">
                    <span class="member-name-detail">${member.name}</span>
                    <span class="member-status-detail">Membre</span>
                </div>
                <div class="member-badge active">
                    <i class="fas fa-check-circle"></i>
                </div>
            </div>
        `;
    });
    
    membersList.innerHTML = membersHTML;
}

function showAddMemberModal() {
    if (!currentTontineData || currentTontineData.memberCount >= 5) {
        showNotification('Maximum 5 membres atteint', 'info');
        return;
    }
    document.getElementById('add-member-modal').style.display = 'flex';
}

function closeAddMemberModal() {
    document.getElementById('add-member-modal').style.display = 'none';
    document.getElementById('contact-select').value = '';
}

function addMemberToTontine() {
    const contactSelect = document.getElementById('contact-select');
    const selectedContact = contactSelect.options[contactSelect.selectedIndex].text;
    
    if (!contactSelect.value) {
        alert('Veuillez sélectionner un contact');
        return;
    }
    
    if (!currentTontineData || currentTontineData.memberCount >= 5) {
        showNotification('Maximum 5 membres atteint', 'info');
        closeAddMemberModal();
        return;
    }
    
    // Ajouter le membre
    const memberName = selectedContact.split(' - ')[0];
    currentTontineData.memberCount++;
    currentTontineData.members.push(memberName);
    currentTontineData.cagnotte += currentTontineData.amount;
    
    currentTontineMembers.push({
        name: memberName,
        id: Date.now()
    });
    
    // Mettre à jour l'affichage
    document.getElementById('detail-members-count').textContent = `${currentTontineData.memberCount}/5 personnes`;
    document.getElementById('detail-total-balance').textContent = `${currentTontineData.cagnotte.toLocaleString()} Fcfa`;
    document.getElementById('remaining-slots').textContent = 5 - currentTontineData.memberCount;
    
    // Mettre à jour la tontine dans la liste
    const tontineIndex = tontinesList.findIndex(t => t.name === currentTontineData.name && t.createdDate === currentTontineData.createdDate);
    if (tontineIndex !== -1) {
        tontinesList[tontineIndex] = currentTontineData;
    }
    
    // Mettre à jour la liste des membres
    updateTontineMembersList();
    
    showNotification(`${memberName} ajouté(e) à la tontine`, 'success');
    closeAddMemberModal();
}

function showDepositModal() {
    document.getElementById('deposit-modal').style.display = 'flex';
    document.getElementById('deposit-amount').value = '';
}

function closeDepositModal() {
    document.getElementById('deposit-modal').style.display = 'none';
}

function confirmDeposit() {
    const amount = document.getElementById('deposit-amount').value;
    
    if (!amount || amount <= 0) {
        alert('Veuillez entrer un montant valide');
        return;
    }
    
    if (currentTontineData) {
        currentTontineData.cagnotte += parseInt(amount);
        document.getElementById('detail-total-balance').textContent = `${currentTontineData.cagnotte.toLocaleString()} Fcfa`;
        
        // Mettre à jour la tontine dans la liste
        const tontineIndex = tontinesList.findIndex(t => t.name === currentTontineData.name && t.createdDate === currentTontineData.createdDate);
        if (tontineIndex !== -1) {
            tontinesList[tontineIndex] = currentTontineData;
        }
    }
    
    showNotification(`Dépôt de ${parseInt(amount).toLocaleString()} Fcfa effectué`, 'success');
    closeDepositModal();
}

function showWithdrawModal() {
    document.getElementById('withdraw-modal').style.display = 'flex';
    document.getElementById('withdraw-amount').value = '';
    
    if (currentTontineData) {
        document.getElementById('withdraw-balance').textContent = `${currentTontineData.cagnotte.toLocaleString()} Fcfa`;
    }
}

function closeWithdrawModal() {
    document.getElementById('withdraw-modal').style.display = 'none';
}

function confirmWithdraw() {
    const amount = document.getElementById('withdraw-amount').value;
    
    if (!amount || amount <= 0) {
        alert('Veuillez entrer un montant valide');
        return;
    }
    
    if (currentTontineData) {
        if (parseInt(amount) > currentTontineData.cagnotte) {
            alert('Montant supérieur à la cagnotte disponible');
            return;
        }
        currentTontineData.cagnotte -= parseInt(amount);
        document.getElementById('detail-total-balance').textContent = `${currentTontineData.cagnotte.toLocaleString()} Fcfa`;
        
        // Mettre à jour la tontine dans la liste
        const tontineIndex = tontinesList.findIndex(t => t.name === currentTontineData.name && t.createdDate === currentTontineData.createdDate);
        if (tontineIndex !== -1) {
            tontinesList[tontineIndex] = currentTontineData;
        }
    }
    
    showNotification(`Retrait de ${parseInt(amount).toLocaleString()} Fcfa effectué`, 'success');
    closeWithdrawModal();
}

function scrollToMembers() {
    const membersSection = document.querySelector('.members-section');
    if (membersSection) {
        membersSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function goBackFromTontine() {
    // Retourner à la page d'accueil
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('home-page').classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const homeNavItem = document.querySelector('.nav-item[onclick="switchTab(\'home\')"]');
    if (homeNavItem) {
        homeNavItem.classList.add('active');
    }
}

function showCreateTontineModal() {
    alert('Fonctionnalité de création de nouvelle tontine en cours de développement');
}

function viewTontineDetails(tontineId) {
    alert(`Affichage des détails de la tontine ${tontineId}`);
}

function payTontineContribution() {
    alert('Paiement de la cotisation en cours...');
}

function viewTontineMembers() {
    alert('Affichage de la liste des membres');
}

// Gestion des invitations K-Bank
let invitedMembers = [];

function showInviteKBankMembersModal() {
    document.getElementById('invite-kbank-members-modal').style.display = 'flex';
    invitedMembers = [];
    updateInvitedMembersDisplay();
}

function closeInviteKBankMembersModal() {
    document.getElementById('invite-kbank-members-modal').style.display = 'none';
}

function searchKBankMembers() {
    const searchTerm = document.getElementById('search-kbank-member-input').value.toLowerCase();
    const memberItems = document.querySelectorAll('.kbank-member-item');
    
    memberItems.forEach(item => {
        const name = item.querySelector('.member-name').textContent.toLowerCase();
        const username = item.querySelector('.member-username').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || username.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function inviteMember(userId) {
    const memberItem = event.target.closest('.kbank-member-item');
    const memberName = memberItem.querySelector('.member-name').textContent;
    const memberUsername = memberItem.querySelector('.member-username').textContent;
    
    // Vérifier si déjà invité
    if (invitedMembers.some(m => m.id === userId)) {
        showNotification('Membre déjà invité', 'info');
        return;
    }
    
    invitedMembers.push({
        id: userId,
        name: memberName,
        username: memberUsername
    });
    
    // Changer le bouton
    const btn = memberItem.querySelector('.btn-invite-member');
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.style.backgroundColor = '#4CAF50';
    btn.style.cursor = 'default';
    btn.onclick = null;
    
    updateInvitedMembersDisplay();
    showNotification(`${memberName} invité(e)`, 'success');
}

function updateInvitedMembersDisplay() {
    const section = document.getElementById('invited-members-section');
    const count = document.getElementById('invited-count');
    const tagsContainer = document.getElementById('invited-members-tags');
    
    if (invitedMembers.length > 0) {
        section.style.display = 'block';
        count.textContent = invitedMembers.length;
        
        tagsContainer.innerHTML = invitedMembers.map(member => `
            <div class="invited-member-tag">
                <span>${member.name}</span>
                <i class="fas fa-times" onclick="removeInvitedMember('${member.id}')"></i>
            </div>
        `).join('');
    } else {
        section.style.display = 'none';
    }
}

function removeInvitedMember(userId) {
    invitedMembers = invitedMembers.filter(m => m.id !== userId);
    updateInvitedMembersDisplay();
    
    // Réinitialiser le bouton dans la liste
    const memberItems = document.querySelectorAll('.kbank-member-item');
    memberItems.forEach(item => {
        const btn = item.querySelector('.btn-invite-member');
        if (btn && btn.closest('.kbank-member-item').querySelector('.member-username')) {
            const itemUserId = btn.getAttribute('onclick')?.match(/inviteMember\('([^']+)'\)/)?.[1];
            if (itemUserId === userId) {
                btn.innerHTML = '<i class="fas fa-user-plus"></i>';
                btn.style.backgroundColor = '';
                btn.style.cursor = 'pointer';
                btn.onclick = () => inviteMember(userId);
            }
        }
    });
}

function finishTontineCreation() {
    if (invitedMembers.length === 0) {
        alert('Veuillez inviter au moins un membre');
        return;
    }
    
    // Fermer le modal
    closeInviteKBankMembersModal();
    
    showNotification(`${invitedMembers.length} invitation(s) envoyée(s) avec succès !`, 'success');
    
    // Réinitialiser la liste des invités
    invitedMembers = [];
}

function acceptInvitation(invitationId) {
    showNotification('Invitation acceptée !', 'success');
    // Logique pour accepter l'invitation
}

function declineInvitation(invitationId) {
    showNotification('Invitation refusée', 'info');
    // Logique pour refuser l'invitation
}

// Modal Invitation
function showInviteMembersModal() {
    document.getElementById('invite-members-modal').style.display = 'flex';
}

function closeInviteMembersModal() {
    document.getElementById('invite-members-modal').style.display = 'none';
}

function shareInviteLink() {
    const link = document.getElementById('invite-link').value;
    if (navigator.share) {
        navigator.share({
            title: 'Rejoignez ma tontine',
            text: 'Je vous invite à rejoindre ma tontine sur K-Bank',
            url: link
        }).then(() => {
            showNotification('Lien partagé avec succès', 'success');
        }).catch(() => {
            copyInviteLink();
        });
    } else {
        copyInviteLink();
    }
}

function copyInviteLink() {
    const link = document.getElementById('invite-link');
    link.select();
    document.execCommand('copy');
    showNotification('Lien copié !', 'success');
}

function shareQRCode() {
    alert('Génération du code QR en cours...');
}

function inviteByPhone() {
    document.getElementById('invite-phone').focus();
}

function sendPhoneInvite() {
    const phone = document.getElementById('invite-phone').value;
    if (!phone) {
        alert('Veuillez entrer un numéro de téléphone');
        return;
    }
    showNotification('Invitation envoyée par SMS', 'success');
    document.getElementById('invite-phone').value = '';
}

