// --- GLOBAL STATE ---
let currentStep = 0;
let userSoftwareChoice = { name: '', type: '' }; 
let journeyConfig = {
    length: 'normal', // short | normal
    pacing: 'normal', // fast | normal | custom
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
};

// --- DATA: INTEGRATIONS ---
const goldenSix = [
    { name: 'Exact Online', logo: 'EO', color: 'bg-red-600' },
    { name: 'Twinfield', logo: 'TW', color: 'bg-orange-500' },
    { name: 'AFAS', logo: 'AF', color: 'bg-blue-600' },
    { name: 'SnelStart', logo: 'SS', color: 'bg-green-600' },
    { name: 'Yuki', logo: 'YU', color: 'bg-red-500' },
    { name: 'Visma', logo: 'VI', color: 'bg-slate-800' }
];

const allSuites = [
    "AccountView", "Acumatica", "Basecone", "Bexio", "E-Boekhouden",
    "Exact Globe", "King", "Microsoft BC", "Minox", "Moneybird", 
    "Muis", "Multivers", "Odoo", "Oracle NetSuite", "Reeleezee", 
    "Sage", "SAP", "Unit4", "Xero", "Zoho Books"
];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Render Step 2 Integrations immediately so they are ready
    renderIntegrations();
    
    // Initialize default Journey State
    updateJourneyDisplays();
});

// --- NAVIGATION CORE ---

function goToStep(stepIndex) {
    // 1. Update Global State
    currentStep = stepIndex;

    // 2. Hide all panels
    document.querySelectorAll('.step-panel').forEach(panel => {
        panel.classList.remove('active');
        setTimeout(() => {
            if(!panel.classList.contains('active')) panel.style.display = 'none';
        }, 400); 
    });

    // 3. Show Target Panel
    const targetPanel = document.getElementById(`step-${stepIndex}`);
    if (targetPanel) {
        targetPanel.style.display = 'block';
        setTimeout(() => targetPanel.classList.add('active'), 50);
    }

    // 4. Update Top Navigation Dropdown
    const navDropdown = document.getElementById('global-nav');
    if(stepIndex > 0 && stepIndex < 5) {
        navDropdown.value = stepIndex;
    }

    // 5. Update Progress Bar
    if(stepIndex > 0 && stepIndex < 5) {
        const percent = (stepIndex / 4) * 100;
        document.getElementById('progress-bar').style.width = `${percent}%`;
    }
    
    // 6. LOGIC UPDATE: Handle Step 2 (Data Source) Views
    if (stepIndex === 2) {
        handleStep2View();
    }

    // 7. Special Case: Mission Control
    if(stepIndex === 4) {
        refreshMissionControl();
    }
}

function skipOnboarding() {
    if(confirm("Are you sure you want to skip setup? You will land on an empty dashboard.")) {
        enterDashboard();
    }
}

// --- STEP 0: REGISTRATION LOGIC ---

// 0-A: Software Gate Search
function filterSoftwareGate(query) {
    const dropdown = document.getElementById('gate-dropdown');
    const input = document.getElementById('inp-software-gate');
    const nextBtn = document.getElementById('btn-gate-next');
    
    if (!query) {
        dropdown.classList.add('hidden');
        return;
    }

    const eliteNames = goldenSix.map(g => g.name);
    const allOptions = [...eliteNames, ...allSuites];
    const matches = allOptions.filter(opt => opt.toLowerCase().includes(query.toLowerCase()));

    dropdown.innerHTML = '';
    if (matches.length > 0) {
        dropdown.classList.remove('hidden');
        matches.slice(0, 6).forEach(match => {
            const div = document.createElement('div');
            div.className = "px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 font-medium transition-colors border-b border-slate-50 last:border-0 flex justify-between items-center";
            
            // Check if Elite/Supported
            const isElite = eliteNames.includes(match);
            const badge = isElite 
                ? '<span class="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">PARTNER</span>' 
                : '<span class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">UNSUPPORTED</span>';
            
            div.innerHTML = `<span>${match}</span> ${badge}`;
            
            div.onclick = () => {
                input.value = match;
                dropdown.classList.add('hidden');

                // CRITICAL: Set the type and default mode
                const type = isElite ? 'supported' : 'unsupported';
                // If supported, mode is direct. If unsupported, default to 'csv' (free).
                userSoftwareChoice = { name: match, type: type, mode: isElite ? 'direct' : 'csv' };

                // Enable Next Button
                nextBtn.disabled = false;
                nextBtn.classList.remove('bg-slate-200', 'text-slate-400', 'cursor-not-allowed');
                nextBtn.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700', 'shadow-lg');
            };
            dropdown.appendChild(div);
        });
    } else {
        dropdown.classList.add('hidden');
    }
}

// --- UPDATE handleStep2View IN script.js (To respect the pre-selection) ---

function handleStep2View() {
    const standardView = document.getElementById('step-2-standard');
    const unsupportedView = document.getElementById('step-2-unsupported');
    const title = document.getElementById('step-2-title');
    
    // Reset
    standardView.classList.add('hidden');
    unsupportedView.classList.add('hidden');

    if (userSoftwareChoice.type === 'unsupported') {
        unsupportedView.classList.remove('hidden');
        title.innerHTML = `Connect to <span class="text-blue-600">${userSoftwareChoice.name}</span>`;
        document.getElementById('pay-gate-software-name').innerText = userSoftwareChoice.name;

        // Auto-select view based on Step 0 choice
        if (userSoftwareChoice.mode === 'pay') {
             // If they chose PAY in step 0, we can auto-trigger the payment view or show success
             // For this demo, we show the Pay card as "Selected/Active"
             // Or we can simulate that the payment is pending
        } else if (userSoftwareChoice.mode === 'csv') {
             // If they chose CSV in step 0, skip the gate and show upload immediately
             document.getElementById('step-2-unsupported-gate-cards').classList.add('hidden');
             document.getElementById('step-2-csv-container').classList.remove('hidden');
        }
    } else {
        standardView.classList.remove('hidden');
        title.innerText = "Bring in your invoices.";
    }
}

function handlePreGateSelection(mode) {
    // Save the mode ('pay' or 'csv')
    userSoftwareChoice.mode = mode;
    
    // Proceed to Account Creation (Step 0-b)
    goToSubStep('0-b');
}

// --- 2. NAVIGATION LOGIC: Unhides the toggle in Step 0-B ---
function goToSubStep(subStepId) {
    // Hide all step-0 panels
    const allSub = ['0-a', '0-b', '0-c', '0-d', '0-e']; 
    allSub.forEach(id => {
        const el = document.getElementById(`step-${id}`);
        if(el) {
            el.style.display = 'none';
            el.classList.remove('active');
        }
    });

    const target = document.getElementById(`step-${subStepId}`);
    if(target) {
        target.style.display = 'block';
        setTimeout(() => target.classList.add('active'), 50);
    }
    
    // CRITICAL: Logic to Show/Hide Toggle in Step 0-B
    if (subStepId === '0-b') {
        const container = document.getElementById('implementation-toggle-container');
        const nameDisplay = document.getElementById('reg-software-name');
        
        if (container && userSoftwareChoice.type === 'unsupported') {
            // Show toggle for unsupported
            container.classList.remove('hidden');
            if(nameDisplay) nameDisplay.innerText = userSoftwareChoice.name;
            
            // DEFAULT TO TRUE (PAY)
            const toggle = document.getElementById('toggle-implementation');
            if(toggle) {
                toggle.checked = true; // Default to CHECKED (Pay €500)
                updateImplementationState(); // Ensure visuals match
            }
        } else if (container) {
            // Hide for supported
            container.classList.add('hidden');
            userSoftwareChoice.mode = 'direct';
        }
    }

    // Existing Email logic
    if(subStepId === '0-c') {
            const email = document.getElementById('inp-reg-email').value;
            if(document.getElementById('verify-email-display')) 
                document.getElementById('verify-email-display').innerText = email;
        }
        if(subStepId === '0-d') {
            const email = document.getElementById('inp-reg-email').value;
            if(document.getElementById('reg-email-display')) 
                document.getElementById('reg-email-display').value = email;
            if(document.getElementById('review-email'))
                document.getElementById('review-email').innerText = email;
        }
    }

// --- 3. TOGGLE STATE HANDLER: Updates text/price based on checkbox ---
function updateImplementationState() {
    const toggle = document.getElementById('toggle-implementation');
    const label = document.getElementById('impl-label-text');
    const price = document.getElementById('impl-price');
    
    if (toggle.checked) {
        // User checked "Enable Support" -> Pay Mode
        userSoftwareChoice.mode = 'pay';
        label.innerText = "Implementation Support (Engineer)";
        label.classList.add('text-blue-700');
        price.innerText = "€ 500.00";
        price.classList.remove('text-slate-400');
        price.classList.add('text-slate-900');
    } else {
        // User unchecked -> CSV Mode
        userSoftwareChoice.mode = 'csv';
        label.innerText = "I'll handle it myself (CSV)";
        label.classList.remove('text-blue-700');
        price.innerText = "€ 0.00";
        price.classList.remove('text-slate-900');
        price.classList.add('text-slate-400');
    }
}

// --- 4. STEP 2 VIEW LOGIC: Respects the Step 0 choice ---
function handleStep2View() {
    const standardView = document.getElementById('step-2-standard');
    const unsupportedView = document.getElementById('step-2-unsupported');
    const title = document.getElementById('step-2-title');
    
    // Reset Views
    if(standardView) standardView.classList.add('hidden');
    if(unsupportedView) unsupportedView.classList.add('hidden');

    // SCENARIO 1: Unsupported Software
    if (userSoftwareChoice.type === 'unsupported') {
        title.innerHTML = `Connect to <span class="text-blue-600">${userSoftwareChoice.name}</span>`;
        
        // Did they choose to PAY in Step 0?
        if (userSoftwareChoice.mode === 'pay') {
             // Show "Payment Required" or "Custom Integration Pending"
             if(unsupportedView) {
                 unsupportedView.classList.remove('hidden');
                 // Show Pay Card, Hide CSV
                 document.getElementById('step-2-unsupported-gate-cards').classList.remove('hidden');
                 document.getElementById('step-2-csv-container').classList.add('hidden');
                 
                 // Auto-trigger the pay modal or focus on the pay card
                 // For now we highlight the pay card
                 document.getElementById('pay-gate-software-name').innerText = userSoftwareChoice.name;
             }
        } 
        // Did they choose CSV in Step 0?
        else {
             // Skip straight to CSV Upload
             if(unsupportedView) {
                 unsupportedView.classList.remove('hidden');
                 document.getElementById('step-2-unsupported-gate-cards').classList.add('hidden');
                 document.getElementById('step-2-csv-container').classList.remove('hidden');
             }
        }
    } 
    // SCENARIO 2: Supported Software
    else {
        if(standardView) standardView.classList.remove('hidden');
        title.innerText = "Bring in your invoices.";
    }
}

function handleAccountCreation() {
    // Mock API call delay
    const btn = document.getElementById('btn-create-acc');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-spinner animate-spin text-xl"></i> Creating...';
    
    setTimeout(() => {
        goToSubStep('0-c');
        btn.innerHTML = originalText;
    }, 1000);
}

function simulateVerification() {
    const btn = event.currentTarget;
    btn.innerHTML = '<i class="ph ph-check text-xl"></i> Verified!';
    btn.classList.remove('bg-blue-600');
    btn.classList.add('bg-green-600');
    
    setTimeout(() => {
        goToSubStep('0-d');
    }, 800);
}

// 0-D: Tabs (Account vs Org)
function switchRegTab(tabName) {
    const accContent = document.getElementById('tab-content-account');
    const orgContent = document.getElementById('tab-content-org');
    const btnAcc = document.getElementById('tab-btn-account');
    const btnOrg = document.getElementById('tab-btn-org');

    if (tabName === 'account') {
        accContent.classList.remove('hidden');
        orgContent.classList.add('hidden');
        
        btnAcc.className = "flex-1 py-4 text-sm font-bold text-blue-600 border-b-2 border-blue-600 bg-white transition-colors flex items-center justify-center gap-2";
        btnOrg.className = "flex-1 py-4 text-sm font-bold text-slate-500 border-b-2 border-transparent hover:text-slate-700 transition-colors flex items-center justify-center gap-2";
    } else {
        accContent.classList.add('hidden');
        orgContent.classList.remove('hidden');

        btnOrg.className = "flex-1 py-4 text-sm font-bold text-blue-600 border-b-2 border-blue-600 bg-white transition-colors flex items-center justify-center gap-2";
        btnAcc.className = "flex-1 py-4 text-sm font-bold text-slate-500 border-b-2 border-transparent hover:text-slate-700 transition-colors flex items-center justify-center gap-2";
    }
}

function performRegistryLookup() {
    const query = document.getElementById('inp-org').value;
    const overlay = document.getElementById('registry-search-overlay');
    
    if(!query) return;

    overlay.classList.remove('hidden');

    setTimeout(() => {
        overlay.classList.add('hidden');
        // Fill Mock Data
        document.getElementById('inp-coc').value = "67129983";
        document.getElementById('inp-street').value = "Keizersgracht";
        document.getElementById('inp-number').value = "555";
        document.getElementById('inp-zip').value = "1017 DR";
        document.getElementById('inp-city').value = "Amsterdam";
        
        // Update Step 1 Review Data
        document.getElementById('review-org').innerText = query;
        document.getElementById('review-coc').innerText = "CoC: 67129983";
        document.getElementById('review-addr').innerHTML = "Keizersgracht 555<br>Amsterdam";
    }, 1500);
}

// --- STEP 1: FINANCIALS ---

function previewLogo(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.querySelector('#logo-preview img');
            img.src = e.target.result;
            document.getElementById('logo-preview').classList.remove('hidden');
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function resetLogo() {
    document.getElementById('logo-upload').value = "";
    document.getElementById('logo-preview').classList.add('hidden');
}

function completeStep(stepNum) {
    // Helper to visually mark step as done in Step 4 checklist
    const checklistItem = document.getElementById(`check-step-${stepNum}`);
    if(checklistItem) {
        checklistItem.querySelector('.status-icon').className = "w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm status-icon";
        checklistItem.querySelector('.status-icon').innerHTML = '<i class="ph ph-check"></i>';
        
        const badge = checklistItem.querySelector('.status-badge');
        badge.className = "px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded status-badge";
        badge.innerText = "Complete";
    }
}

// --- STEP 2: DATA SOURCE ---

function renderIntegrations() {
    const container = document.getElementById('integration-grid');
    container.innerHTML = '';

    goldenSix.forEach(sw => {
        const isSelected = userSoftwareChoice.name === sw.name;
        const div = document.createElement('div');
        div.className = `p-6 rounded-xl border-2 cursor-pointer transition-all relative group bg-white ${isSelected ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100 hover:border-blue-300'}`;
        div.onclick = () => openAuthModal(sw);

        div.innerHTML = `
            <div class="flex items-center gap-4 mb-3">
                <div class="w-12 h-12 rounded-lg ${sw.color} flex items-center justify-center text-white font-bold text-lg shadow-md">${sw.logo}</div>
                <div>
                    <h3 class="font-bold text-slate-900">${sw.name}</h3>
                    <div class="text-xs text-slate-500 flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-green-500"></span> Verified Partner
                    </div>
                </div>
            </div>
            ${isSelected ? '<div class="absolute top-3 right-3 text-blue-500"><i class="ph ph-check-circle-fill text-xl"></i></div>' : ''}
        `;
        container.appendChild(div);
    });
}

// Auth Modal Logic
function openAuthModal(software) {
    const modal = document.getElementById('integration-auth-modal');
    const content = document.getElementById('auth-modal-content');
    
    // Set dynamic content
    document.getElementById('auth-title').innerText = `Log in to ${software.name}`;
    document.getElementById('auth-logo-box').className = `w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-4 transition-colors ${software.color}`;
    document.getElementById('auth-logo-box').innerText = software.logo;
    
    // Show
    modal.classList.remove('hidden');
    // Simple animate in
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeAuthModal() {
    const modal = document.getElementById('integration-auth-modal');
    const content = document.getElementById('auth-modal-content');
    
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function submitExternalAuth() {
    const btn = document.getElementById('btn-auth-submit');
    btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Authenticating...';
    
    setTimeout(() => {
        closeAuthModal();
        initSyncSimulation();
    }, 1500);
}

// Sync Simulation
function initSyncSimulation() {
    const overlay = document.getElementById('sync-overlay');
    overlay.classList.remove('hidden');
    
    const bar = document.getElementById('sync-progress-bar');
    const title = document.getElementById('sync-title');
    const status = document.getElementById('sync-status');

    // Timeline of sync events
    setTimeout(() => {
        bar.style.width = "30%";
        document.getElementById('sync-row-1').classList.remove('opacity-50');
        document.getElementById('icon-sync-1').innerHTML = '<i class="ph ph-check text-green-600"></i>';
        document.getElementById('icon-sync-1').className = "w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs";
        document.getElementById('count-sync-1').innerText = "2,912 Invoices";
    }, 1500);

    setTimeout(() => {
        bar.style.width = "70%";
        document.getElementById('sync-row-2').classList.remove('opacity-50');
        document.getElementById('icon-sync-2').innerHTML = '<i class="ph ph-check text-green-600"></i>';
        document.getElementById('icon-sync-2').className = "w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs";
        document.getElementById('badge-sync-2').classList.remove('hidden');
        status.innerText = "Analyzing debtor behavior...";
    }, 3000);

    setTimeout(() => {
        bar.style.width = "100%";
        document.getElementById('sync-row-3').classList.remove('opacity-50');
        document.getElementById('icon-sync-3').innerHTML = '<i class="ph ph-check text-green-600"></i>';
        document.getElementById('icon-sync-3').className = "w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs";
        document.getElementById('count-sync-3').innerText = "4 Segments";
        title.innerText = "Sync Complete";
        status.innerText = "Redirecting...";
    }, 4500);

    setTimeout(() => {
        completeStep(2);
        goToStep(3); // Go to Journey Builder
        overlay.classList.add('hidden');
    }, 5500);
}

// --- STEP 3: JOURNEY BUILDER (SIMPLIFIED) ---

function toggleDay(btn) {
    const isActive = btn.getAttribute('data-active') === 'true';
    if (isActive) {
        btn.setAttribute('data-active', 'false');
        btn.className = "w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-colors bg-slate-100 text-slate-400 hover:bg-slate-200";
    } else {
        btn.setAttribute('data-active', 'true');
        btn.className = "w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-colors shadow-sm bg-blue-600 text-white ring-2 ring-blue-100";
    }
}

function setJourneyLength(len) {
    journeyConfig.length = len;
    setBtnActive(document.getElementById(`btn-len-${len}`));
    setBtnInactive(document.getElementById(`btn-len-${len === 'short' ? 'normal' : 'short'}`));
    
    // Toggle Step 2 visibility
    const step2 = document.getElementById('step-2-container');
    if(len === 'short') {
        step2.style.opacity = '0.3';
        step2.style.pointerEvents = 'none';
    } else {
        step2.style.opacity = '1';
        step2.style.pointerEvents = 'auto';
    }
}

function setJourneyPacing(pace) {
    journeyConfig.pacing = pace;
    
    ['fast', 'normal', 'custom'].forEach(p => {
        const btn = document.getElementById(`btn-pace-${p}`);
        if(p === pace) setBtnActive(btn);
        else setBtnInactive(btn);
    });

    updateJourneyDisplays();
}

function setStep3Type(type) {
    const btnE = document.getElementById('btn-type-email');
    const btnC = document.getElementById('btn-type-call');
    const card = document.getElementById('card-step-final');
    const icon = document.getElementById('icon-step-final');

    if(type === 'email') {
        btnE.className = "px-2 py-0.5 text-[10px] font-bold rounded bg-white text-slate-800 shadow-sm transition-all flex items-center gap-1";
        btnC.className = "px-2 py-0.5 text-[10px] font-bold rounded text-slate-500 hover:bg-white/50 transition-all flex items-center gap-1";
        
        card.classList.remove('border-purple-200', 'bg-purple-50');
        icon.className = "w-12 h-12 shrink-0 bg-red-50 text-red-600 rounded-full border-2 border-red-100 flex items-center justify-center z-10 font-bold transition-colors";
        icon.innerHTML = '<i class="ph ph-warning-circle text-xl"></i>';
        
        document.getElementById('text-step-final').innerText = "Demand for payment";
    } else {
        btnC.className = "px-2 py-0.5 text-[10px] font-bold rounded bg-white text-purple-700 shadow-sm transition-all flex items-center gap-1";
        btnE.className = "px-2 py-0.5 text-[10px] font-bold rounded text-slate-500 hover:bg-white/50 transition-all flex items-center gap-1";
        
        // Visual flair for Call
        icon.className = "w-12 h-12 shrink-0 bg-purple-100 text-purple-600 rounded-full border-2 border-purple-200 flex items-center justify-center z-10 font-bold transition-colors";
        icon.innerHTML = '<i class="ph ph-phone-call text-xl"></i>';
        
        document.getElementById('text-step-final').innerText = "Add to daily call list";
    }
}

function updateJourneyDisplays() {
    const d1 = document.getElementById('disp-day-1');
    const d2 = document.getElementById('disp-day-2');
    const dFinal = document.getElementById('disp-day-final');
    
    if (journeyConfig.pacing === 'fast') {
        if(d1) d1.innerText = "1 Day";
        if(d2) d2.innerText = "7 Days";
        if(dFinal) dFinal.innerText = "7 Days";
    } else if (journeyConfig.pacing === 'normal') {
        if(d1) d1.innerText = "5 Days";
        if(d2) d2.innerText = "14 Days";
        if(dFinal) dFinal.innerText = "14 Days";
    } else {
        // Custom
        if(d1) d1.innerText = "3 Days";
        if(d2) d2.innerText = "10 Days";
        if(dFinal) dFinal.innerText = "10 Days";
    }
}

// Helpers for button styles
function setBtnActive(btn) {
    if(btn) btn.className = "flex-1 py-2 rounded-md text-sm font-bold bg-white text-blue-600 shadow-sm transition-all";
}
function setBtnInactive(btn) {
    if(btn) btn.className = "flex-1 py-2 rounded-md text-sm font-semibold text-slate-600 transition-all hover:bg-white/50";
}

// --- STEP 4: MISSION CONTROL ---

function refreshMissionControl() {
    // Check which steps are done based on the checklist classes
    let doneCount = 0;
    const steps = [1, 2, 5]; // Note: using 5 as the ID for Journey in checklist to match HTML ID
    
    steps.forEach(id => {
        const item = document.getElementById(`check-step-${id}`);
        if(item && item.querySelector('.status-badge').innerText === 'Complete') {
            doneCount++;
        }
    });

    const percent = Math.round((doneCount / 3) * 100);
    document.getElementById('overview-progress').style.width = `${percent}%`;
    document.getElementById('overview-percent').innerText = `${percent}%`;

    // Enable Go Live if 100%
    if(doneCount === 3) {
        const btn = document.getElementById('btn-go-live');
        btn.disabled = false;
        btn.classList.remove('bg-slate-300', 'cursor-not-allowed');
        btn.classList.add('bg-green-600', 'hover:bg-green-700', 'shadow-lg', 'shadow-green-500/30');
    }
}

function markAllStepsComplete() {
    // Cheat code for demo
    completeStep(1);
    completeStep(2);
    completeStep(5); // Journey ID in checklist
    refreshMissionControl();
    
    // Animate requirements removal
    document.getElementById('req-data').style.textDecoration = "line-through";
    document.getElementById('req-journey').style.textDecoration = "line-through";
    setTimeout(() => {
        document.getElementById('launch-requirements').style.opacity = '0';
    }, 500);
}

function goLive() {
    // Show Victory Modal
    document.getElementById('victory-modal').classList.remove('hidden');
}

// --- STEP 5: DASHBOARD & TOUR ---

function enterDashboard() {
    document.getElementById('victory-modal').classList.add('hidden');
    goToStep(5); // Show dashboard container
    
    // Animate Dashboard In
    setTimeout(() => {
        const dash = document.getElementById('dashboard-content');
        dash.classList.remove('opacity-40');
        dash.classList.add('opacity-100');
    }, 500);
}

// Simple Tour Logic
let tourStep = 1;
function nextTourStep() {
    tourStep++;
    const title = document.getElementById('tour-title');
    const text = document.getElementById('tour-text');
    const count = document.getElementById('tour-counter');
    const btn = document.getElementById('tour-btn');

    if(tourStep === 2) {
        title.innerText = "Priority List";
        text.innerText = "We automatically prioritize invoices that need attention today. Work from top to bottom.";
        count.innerText = "2 / 3";
    } else if(tourStep === 3) {
        title.innerText = "Automation Status";
        text.innerText = "See exactly how many reminders were sent automatically and how much cash was recovered.";
        count.innerText = "3 / 3";
        btn.innerHTML = 'Finish Tour <i class="ph ph-check"></i>';
    } else {
        document.getElementById('tour-overlay').style.display = 'none';
    }
}

function handleStep2View() {
    const standardView = document.getElementById('step-2-standard');
    const unsupportedView = document.getElementById('step-2-unsupported');
    const title = document.getElementById('step-2-title');
    
    // Reset
    standardView.classList.add('hidden');
    unsupportedView.classList.add('hidden');

    if (userSoftwareChoice.type === 'unsupported') {
        unsupportedView.classList.remove('hidden');
        title.innerHTML = `Connect to <span class="text-blue-600">${userSoftwareChoice.name}</span>`;
        document.getElementById('pay-gate-software-name').innerText = userSoftwareChoice.name;

        // Auto-select view based on Step 0 choice
        if (userSoftwareChoice.mode === 'pay') {
             // If they chose PAY in step 0, we can auto-trigger the payment view or show success
             // For this demo, we show the Pay card as "Selected/Active"
             // Or we can simulate that the payment is pending
        } else if (userSoftwareChoice.mode === 'csv') {
             // If they chose CSV in step 0, skip the gate and show upload immediately
             document.getElementById('step-2-unsupported-gate-cards').classList.add('hidden');
             document.getElementById('step-2-csv-container').classList.remove('hidden');
        }
    } else {
        standardView.classList.remove('hidden');
        title.innerText = "Bring in your invoices.";
    }
}

function handlePayGateSelection(option) {
    if (option === 'pay') {
        // Simulate Payment Flow
        const btn = document.getElementById('btn-pay-gate');
        btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Processing...';
        
        setTimeout(() => {
            alert("Payment simulated! An engineer has been notified.");
            // In a real app, this would trigger a ticket/backend process.
            // For now, we simulate a successful manual connection setup.
            initSyncSimulation(); 
        }, 1500);
        
    } else if (option === 'csv') {
        // Switch UI to CSV Upload mode (hide gate, show upload)
        document.getElementById('step-2-unsupported-gate-cards').classList.add('hidden');
        document.getElementById('step-2-csv-container').classList.remove('hidden');
        document.getElementById('step-2-csv-container').classList.add('animate-slide-up');
    }
}