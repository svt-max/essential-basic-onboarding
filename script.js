// --- GLOBAL STATE ---
let currentStep = 0;
let userSoftwareChoice = { name: '', type: '' }; // Stores Step 0 choice
const totalSteps = 8;
let selectedInvoiceData = {}; // Stores invoice picked in Step 4 for Step 5 visualization

// Track which steps are considered "Done" for the Mission Control
let stepsState = {
    1: false, // Financials
    2: false, // Data (Upload/Connect)
    3: false, // Design
    5: false, // Journey
    6: false, // Dispute (Optional)
    7: false  // Inbox (Optional)
};

// --- REGISTRY LOOKUP LOGIC (Step 1) ---
const euRegistryCountries = ['NL', 'BE', 'DE', 'FR', 'IE', 'LU'];

function checkCountrySupport() {
    const country = document.getElementById('inp-country').value;
    const btn = document.getElementById('btn-registry-lookup');
    const hint = document.getElementById('registry-hint');
    const orgInput = document.getElementById('inp-org');

    if (euRegistryCountries.includes(country)) {
        if(btn) btn.classList.remove('hidden');
        if(btn) btn.classList.add('flex');
        if(hint) hint.classList.remove('hidden');
        if(orgInput) orgInput.placeholder = "Enter name to search registry...";
    } else {
        if(btn) btn.classList.add('hidden');
        if(btn) btn.classList.remove('flex');
        if(hint) hint.classList.add('hidden');
        if(orgInput) orgInput.placeholder = "e.g. MaxCredible";
    }
}

function performRegistryLookup() {
    const overlay = document.getElementById('registry-search-overlay');
    const orgName = document.getElementById('inp-org').value;
    const country = document.getElementById('inp-country').value;

    if (!orgName) {
        alert("Please enter a company name first.");
        return;
    }

    // 1. Show Animation
    if(overlay) overlay.classList.remove('hidden');

    // 2. Simulate Network Delay (2.5 seconds)
    setTimeout(() => {
        // 3. Populate Data based on Country
        const fakeData = getFakeRegistryData(country, orgName);
        
        // Update Organization & CoC
        document.getElementById('inp-org').value = fakeData.name;
        document.getElementById('inp-coc').value = fakeData.coc;
        
        // Update Address
        document.getElementById('inp-street').value = fakeData.street;
        document.getElementById('inp-number').value = fakeData.number;
        document.getElementById('inp-zip').value = fakeData.zip;
        document.getElementById('inp-city').value = fakeData.city;

        // Update User Details (Simulated auto-fill for demo convenience)
        document.getElementById('inp-email').value = fakeData.email;
        document.getElementById('inp-fname').value = "Admin"; // Demo default
        document.getElementById('inp-phone').value = "+31 20 123 4567"; // Demo default

        // Hide Overlay
        if(overlay) overlay.classList.add('hidden');
        
        // Visual Success Feedback on the button
        const btn = document.getElementById('btn-registry-lookup');
        if(btn) {
            btn.innerHTML = '<i class="ph ph-check-bold"></i> Verified';
            btn.classList.remove('text-blue-600', 'bg-blue-50', 'border-blue-200');
            btn.classList.add('text-green-600', 'bg-green-50', 'border-green-200');
        }
    }, 2000);
}

function getFakeRegistryData(country, originalName) {
    const suffixMap = { 'NL': 'B.V.', 'BE': 'NV', 'DE': 'GmbH', 'FR': 'SAS', 'GB': 'Ltd.', 'IE': 'Ltd.', 'LU': 'S.A.' };
    const cityMap = { 'NL': 'Amsterdam', 'BE': 'Brussels', 'DE': 'Berlin', 'FR': 'Paris', 'GB': 'London', 'IE': 'Dublin', 'LU': 'Luxembourg City' };
    const zipMap = { 'NL': '1011 AK', 'BE': '1000', 'DE': '10115', 'FR': '75001', 'GB': 'EC1A 1BB', 'IE': 'D02', 'LU': 'L-1000' };
    
    // Generate a random 8 digit CoC number
    const randomCoC = Math.floor(10000000 + Math.random() * 90000000);
    
    return {
        name: `${originalName} ${suffixMap[country] || 'International'}`,
        coc: randomCoC.toString(),
        street: 'Main Business District',
        number: Math.floor(1 + Math.random() * 150).toString(),
        zip: zipMap[country] || '00000',
        city: cityMap[country] || 'Metropolis',
        email: `finance@${originalName.toLowerCase().replace(/\s/g, '')}.com`
    };
}

// --- DESIGN STATE (Step 3) ---
let designState = {
    tone: 'friendly',
    width: 600,
    headerSize: 'standard', // compact, standard, tall
    tableStyle: 'grid'      // minimal, grid, bold
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initIntegrations();
    checkDeepLink(); // Check URL for specific step
    updateOverview(); // Initialize overview state
});

// --- HELPER: MARK STEP COMPLETE ---
function completeStep(step) {
    stepsState[step] = true;
    updateOverview();
}

function saveAndContinue(step, nextStep, btn) {
    const originalContent = btn.innerHTML;
    
    // 1. Visual Feedback
    btn.innerHTML = '<i class="ph ph-spinner animate-spin text-xl"></i> Saving...';
    btn.classList.add('cursor-not-allowed', 'opacity-80');
    
    // 2. Simulate Network Request (800ms)
    setTimeout(() => {
        // 3. Update State
        completeStep(step);
        
        // 4. Navigate
        goToStep(nextStep);
        
        // 5. Reset Button (in case they come back)
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.classList.remove('cursor-not-allowed', 'opacity-80');
        }, 500);
    }, 800);
}

// --- MICRO-ONBOARDING / DEEP LINKING ---
function checkDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    
    // Map friendly names to step numbers
    const stepMap = {
        'financials': 1,
        'connect': 2,
        'upload': 2, 
        'template': 3,
        'design': 3, 
        'preview': 4,
        'journey': 5,
        'settings': 5, 
        'dispute': 6,
        'email': 7,
        'overview': 8,
        'dashboard': 9
    };

    if (stepParam) {
        let targetStep = stepMap[stepParam] || parseInt(stepParam);
        if (targetStep >= 1 && targetStep <= 9) {
            jumpDirectlyToStep(targetStep);
        }
    }
}

function jumpDirectlyToStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    
    // Show target
    const target = document.getElementById(`step-${step}`);
    if(target) target.classList.add('active');
    
    // Update progress bar
    const percent = step === 0 ? 0 : (step / totalSteps) * 100;
    const progressBar = document.getElementById('progress-bar');
    const stepIndicator = document.getElementById('step-indicator');
    
    if(progressBar) progressBar.style.width = Math.min(percent, 100) + '%';
    if(stepIndicator && step <= 8) stepIndicator.innerText = `Step ${step} of ${totalSteps}`;
    
    currentStep = step;
    syncDropdown(step);

    // Run specific initializers if needed
    if(step === 3) initStep3();
}

// --- MAIN NAVIGATION FUNCTION ---
function goToStep(step) {
    // 1. Update URL History
    const url = new URL(window.location);
    url.searchParams.set('step', step);
    window.history.pushState({}, '', url);

    // 3. Special Triggers
    if(step === 3) initStep3();
    
    // 4. Update UI Panels
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    setTimeout(() => {
        const nextPanel = document.getElementById(`step-${step}`);
        if(nextPanel) nextPanel.classList.add('active');
    }, 50);

    // 5. Update Progress Bar
    const percent = (step / totalSteps) * 100;
    const progressBar = document.getElementById('progress-bar');
    const stepIndicator = document.getElementById('step-indicator');
    
    if(progressBar) progressBar.style.width = Math.min(percent, 100) + '%';
    if(stepIndicator && step <= 8) stepIndicator.innerText = `Step ${step} of ${totalSteps}`;
    
    // 6. Update State
    currentStep = step;
    syncDropdown(step);
    
    // 7. Step Specific Triggers
    if(step === 6) triggerIssueSimulation();
    if(step === 8) updateOverview();
    if(step === 9) initBatchView();
}

// Sync Dropdown Helper
function syncDropdown(step) {
    const dropdown = document.getElementById('global-nav');
    if(dropdown && step <= 8) dropdown.value = step;
}

function skipOnboarding() {
    if(confirm("Skip onboarding and go to overview?")) {
        goToStep(8);
    }
}

// --- STEP 2: DYNAMIC INTEGRATIONS ---
function initIntegrations() {
    const integrations = [
        {name: 'Twinfield', bg: 'bg-blue-600', text: 'TF'},
        {name: 'Exact Online', bg: 'bg-red-600', text: 'EO'},
        {name: 'AFAS', bg: 'bg-slate-800', text: 'AF'},
        {name: 'Billtobox', bg: 'bg-purple-600', text: 'BB'},
        {name: 'JeFacture', bg: 'bg-green-600', text: 'JF'},
        {name: 'Banqup', bg: 'bg-indigo-600', text: 'BQ'}
    ];
    
    const container = document.getElementById('integration-grid');
    if (container) {
        // Updated: Calls startSyncSimulation instead of direct jump
        container.innerHTML = integrations.map(i => `
            <div onclick="startSyncSimulation('${i.name}', '${i.bg}', '${i.text}')" class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 h-40 group">
                <div class="w-12 h-12 ${i.bg} rounded-lg flex items-center justify-center text-white font-bold text-xl">${i.text}</div>
                <span class="font-semibold text-slate-700 group-hover:text-blue-600">${i.name}</span>
            </div>
        `).join('');
    }
}

// --- STEP 2 SEARCH LOGIC ---
const allSuites = [
  "1C:Enterprise", "24SevenOffice", "AccountView", "Acumatica", "Acumulus", "Addison", 
  "AFAS", "Alegra", "Asperion", "Banqup", "Basecone", "Bexio", "Bill-to-box", "Bind ERP", 
  "Cash Software", "Collmex", "Contpaqi", "DATEV", "Defontana", "e-Boekhouden.nl", 
  "e-conomic", "Exact Online", "Financio", "Fortnox", "FreshBooks", "Infor", "JeFacture", 
  "Kashoo", "King Business Software", "Kingdee", "Lexware", "Manager", "Microsoft Dynamics 365", 
  "Moneybird", "MYOB", "Nubox", "Octopus", "Odoo", "Omie", "Oracle NetSuite", 
  "QuickBooks Online", "Reckon", "Reeleezee", "Rompslomp", "Sage", "Sage 300", 
  "Sage 50", "Sage Intacct", "SAP Business One", "SevDesk", "Siigo", "SnelStart", 
  "Tally Solutions", "Tipalti", "TOTVS", "Twinfield", "Unified Post", "Visma eAccounting", 
  "Wave Accounting", "WinBooks", "Workday Financials", "Xero", "Yardi", "Yonyou", 
  "Yuki", "Zoho Books"
];

const searchInput = document.getElementById('suite-search');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const val = e.target.value.toLowerCase();
        const results = document.getElementById('search-results');
        if(val.length > 0) {
            const matches = allSuites.filter(s => s.toLowerCase().includes(val));
            if(matches.length > 0) {
                // Note: Added completeStep(2) here as well for simulation purposes
                results.innerHTML = matches.map(m => `<div class="p-3 hover:bg-slate-50 cursor-pointer text-slate-700 text-sm border-b border-slate-50" onclick="startSyncSimulation('${m}', 'bg-slate-600', '${m.substring(0,2).toUpperCase()}')">${m}</div>`).join('');
                results.classList.remove('hidden');
            } else results.classList.add('hidden');
        } else results.classList.add('hidden');
    });
}

// --- HTML EMAIL GENERATOR (DYNAMIC) ---
function generateEmailHTML(options, invoice = {}) {
    const baseConfig = {
        tone: 'friendly',
        width: 600,
        headerSize: 'standard',
        tableStyle: 'grid', // Options: minimal, grid, bold
        bankInfoStyle: 'dashed', // Options: dashed, outline, filled
        showBanner: false,
        borderRadius: 'rounded',
        accentColor: '#2563eb',
        footerText: 'MaxCredible B.V. - Automated Credit Management Platform - Amsterdam',
        website: 'www.maxcredible.com'
    };
    
    const config = (typeof options === 'string') 
        ? { ...baseConfig, tone: options } 
        : { ...baseConfig, ...options };

    const data = {
        name: invoice.name || 'Acme Corp',
        number: invoice.number || 'INV-2023-001',
        amount: invoice.amount || '€ 2.500,00',
        due: invoice.dueText || '15 Days Ago'
    };

    const toneContent = {
        'friendly': { headline: 'A Friendly Reminder', body: `We hope you are having a great week! We noticed that invoice <strong>${data.number}</strong> is still outstanding.` },
        'professional': { headline: 'Invoice Payment Reminder', body: `This is a formal reminder that invoice <strong>${data.number}</strong> is currently outstanding.` },
        'strict': { headline: 'Final Notice: Payment Overdue', body: `We are writing to inform you that your payment for invoice <strong>${data.number}</strong> is significantly overdue.` },
        'casual': { headline: 'Hi there!', body: `Just checking in on invoice <strong>${data.number}</strong>. We haven't received payment yet.` },
        'factual': { headline: 'Outstanding Balance', body: `Our records indicate that invoice <strong>${data.number}</strong> remains unpaid as of today.` },
        'concise': { headline: 'Payment Due', body: `Invoice <strong>${data.number}</strong> is overdue. Please arrange payment.` },
        'empathetic': { headline: 'Payment Status', body: `We understand things get busy. We haven't received payment for invoice <strong>${data.number}</strong> yet.` },
        'formal': { headline: 'Payment Notification', body: `Reference is made to the above-mentioned invoice <strong>${data.number}</strong>.` },
        'social': { headline: 'Hello!', body: `Hey ${data.name}, hope you're doing well! Just a heads up that invoice <strong>${data.number}</strong> is ready for payment.` }
    };

    const content = toneContent[config.tone] || toneContent['friendly'];
    const primaryColor = config.accentColor; 
    
    // --- STYLING LOGIC ---
    let headerPadding = '20px 30px';
    if(config.headerSize === 'compact') headerPadding = '12px 24px';
    if(config.headerSize === 'tall') headerPadding = '40px 30px';
    
    const radius = config.borderRadius === 'rounded' ? '12px' : '0px';
    const innerRadius = config.borderRadius === 'rounded' ? '8px' : '0px';

    // Banner
    let bannerHTML = '';
    if(config.showBanner) {
        bannerHTML = `<div style="width: 100%; height: 180px; background-image: url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center;"></div>`;
    }

    // Invoice Table Styles
    let tableCSS = 'width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 30px;';
    let thCSS = 'text-align: left; padding: 12px;';
    let tdCSS = 'padding: 12px;';
    
    if(config.tableStyle === 'grid') {
        tableCSS += 'border: 1px solid #e2e8f0;';
        thCSS += 'background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600;';
        tdCSS += 'border-bottom: 1px solid #e2e8f0; color: #1e293b;';
    } else if (config.tableStyle === 'minimal') {
        thCSS += 'border-bottom: 2px solid #e2e8f0; color: #94a3b8; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;';
        tdCSS += 'border-bottom: 1px solid #f1f5f9; color: #334155;';
    } else if (config.tableStyle === 'bold') {
        thCSS += `background-color: ${primaryColor}; color: white; font-weight: bold;`;
        tdCSS += 'border: 1px solid #cbd5e1; color: #0f172a; font-weight: 500;';
    }

    // Bank Info Box Styles
    let bankCSS = `padding: 20px; border-radius: ${innerRadius}; display: flex; gap: 20px; margin-top: 30px;`;
    
    if (config.bankInfoStyle === 'dashed') {
        bankCSS += 'background: #f8fafc; border: 1px dashed #cbd5e1;';
    } else if (config.bankInfoStyle === 'outline') {
        bankCSS += 'background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);';
    } else if (config.bankInfoStyle === 'filled') {
        bankCSS += 'background: #f1f5f9; border: none;';
    }

    // --- TEMPLATE ---
    return `
    <div style="font-family: 'Inter', sans-serif; background: #fff; color: #334155; padding: 0; margin: 0; width: 100%;">
        
        <div style="background: ${primaryColor}; padding: ${headerPadding}; border-radius: ${radius} ${radius} 0 0; display:flex; justify-content:space-between; align-items:center;">
            <div style="color:white; font-size:14px; opacity:0.9; font-weight: 500;">MaxCredible</div>
            <img src="https://www.maxcredible.com/wp-content/uploads/2022/04/Logo-MaxCredible-nieuw.png" style="height:24px; filter: brightness(0) invert(1);">
        </div>

        ${bannerHTML}

        <div style="padding: 40px;">
            <h1 style="font-size: 24px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 20px;">
                ${content.headline}
            </h1>
            <p style="margin-bottom: 15px; font-size: 15px;">Hello <strong>${data.name}</strong>,</p>
            <p style="margin-bottom: 25px; line-height: 1.6; font-size: 15px;">
                ${content.body}
            </p>
            
            <table style="${tableCSS}">
                <thead>
                    <tr>
                        <th style="${thCSS}">Description</th>
                        <th style="${thCSS}">Due Date</th>
                        <th style="${thCSS}; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="${tdCSS}">Invoice #${data.number}</td>
                        <td style="${tdCSS}"><strong>${data.due}</strong></td>
                        <td style="${tdCSS}; text-align: right; font-weight: bold;">${data.amount}</td>
                    </tr>
                </tbody>
            </table>

            <div style="${bankCSS}">
                <div style="flex: 1;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px;">IBAN</div>
                    <div style="font-family: monospace; font-size: 14px; color: #0f172a;">NL88 KNAB 0414 8858 48</div>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px;">Reference</div>
                    <div style="font-family: monospace; font-size: 14px; color: #0f172a;">${data.number}</div>
                </div>
            </div>

            <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
                <p style="font-size: 12px; color: #64748b; margin-bottom: 5px;">${config.footerText}</p>
                <a href="https://${config.website}" style="font-size: 12px; color: ${primaryColor}; text-decoration: none;">${config.website}</a>
                
                <div style="margin-top: 20px;">
                    <img src="https://docs.google.com/drawings/d/e/2PACX-1vTwjDMTj7FH3tmeLj6H24PRhLO_U0yBPfQtT0bW_Ku8iPo63LMD5ZeZeaWe8Kdt78d1JxkXz8T27NG5/pub?w=691&h=249" style="height: 30px; opacity: 0.8;" alt="Powered by MaxCredible">
                </div>
            </div>
        </div>
    </div>
    `;
}

function setAccentColor(color, btn) {
    updateDesignParam('accentColor', color);
    
    // UI Update for color circles
    document.querySelectorAll('.color-circle').forEach(c => {
        c.classList.remove('ring-2', 'ring-offset-2', 'ring-slate-400');
        c.innerHTML = ''; // Remove checkmark
    });
    
    btn.classList.add('ring-2', 'ring-offset-2', 'ring-slate-400');
    btn.innerHTML = '<i class="ph ph-check text-white text-xs"></i>';
}

// --- STEP 3 CONTROLS ---
function initStep3() {
    // Ensure we start with default state
    if(!designState.tone) designState.tone = 'friendly';
    updatePreview();
}

function updateDesignParam(param, value) {
    designState[param] = value;
    
    // Handle Width UI updates live for performance
    if(param === 'width') {
        const displayVal = document.getElementById('width-val');
        if(displayVal) displayVal.innerText = value + 'px';
        
        const frame = document.getElementById('email-preview-frame');
        if(frame) frame.style.width = value + 'px';
        
        // We generally don't need to re-render the whole HTML for width changes, 
        // but if the layout depends on it, we might. For now, live resizing is smoother.
        return; 
    }
    
    // For all other params (header height, edges, etc), re-render.
    updatePreview();
}

function setDesignTone(tone, cardElement) {
    designState.tone = tone;
    
    // UI Update
    document.querySelectorAll('.tone-card').forEach(c => c.classList.remove('active'));
    if(cardElement) {
        cardElement.classList.add('active');
    }

    // Context Description Update
    const desc = document.getElementById('tone-desc');
    const texts = {
        'friendly': 'Casual and polite. Best for early reminders.',
        'professional': 'Neutral and business-like. Standard corporate tone.',
        'strict': 'Firm and urgent. For late stage collections.',
        'casual': 'Very relaxed. Good for long-term client relationships.',
        'factual': 'Just the data. No fluff, just the facts.',
        'concise': 'Short and sweet. Respects the reader\'s time.',
        'empathetic': 'Understanding and soft. Good for sensitive situations.',
        'formal': 'Traditional business phrasing. Highly polite.',
        'social': 'Conversational and warm. Like an email from a friend.'
    };
    if(desc) desc.innerText = texts[tone] || '';
    
    updatePreview();
}

function toggleBanner() {
    const chk = document.getElementById('chk-banner');
    designState.showBanner = chk.checked;
    updatePreview();
}

// Update updatePreview slightly to handle new subject lines map
function updatePreview() {
    const frame = document.getElementById('email-preview-frame');
    const loader = document.getElementById('preview-loader');
    const subjectLine = document.getElementById('preview-subject-line');
    
    if(loader) loader.classList.remove('hidden');

    // Retrieve subject from the generator logic map (simulated)
    // In a real app, the generator would return metadata. Here we hack it for the UI preview label.
    const toneSubjects = {
        'friendly': 'Friendly reminder regarding invoice INV-2023-001',
        'professional': 'Payment Reminder: Invoice INV-2023-001',
        'strict': 'URGENT: Overdue Payment INV-2023-001',
        'casual': 'Quick checking on invoice INV-2023-001',
        'factual': 'Statement of Account: INV-2023-001',
        'concise': 'Reminder: Invoice INV-2023-001 Due',
        'empathetic': 'Regarding your outstanding invoice',
        'formal': 'Notice of Overdue Payment',
        'social': 'Let\'s get this sorted'
    };
    
    if(subjectLine) {
        const tone = designState.tone || 'friendly';
        subjectLine.innerText = toneSubjects[tone];
        
        if(tone === 'strict') subjectLine.classList.add('text-red-600');
        else subjectLine.classList.remove('text-red-600');
    }
    
    if(frame) {
        frame.style.width = designState.width + 'px';
        setTimeout(() => {
            const doc = frame.contentDocument || frame.contentWindow.document;
            doc.open();
            doc.write(generateEmailHTML(designState));
            doc.close();
            if(loader) loader.classList.add('hidden');
        }, 200);
    }
}

// --- STEP 4 INVOICE PREVIEW LOGIC ---
function openInvoicePreview(name, amount, number, dueText, tone) {
    selectedInvoiceData = { name, amount, number };
    const modal = document.getElementById('invoice-preview-modal');
    const frame = document.getElementById('invoice-preview-frame');
    const title = document.getElementById('preview-modal-title');
    if(title) title.innerText = `Sending Reminder to ${name}`;
    
    const html = generateEmailHTML(tone, { name, amount, number, dueText });
    if(frame) {
        const doc = frame.contentDocument || frame.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
    }
    if(modal) modal.classList.remove('hidden');
}

function closeInvoicePreview() {
    const modal = document.getElementById('invoice-preview-modal');
    if(modal) modal.classList.add('hidden');
}

function confirmSend() {
    closeInvoicePreview();
    const badge = document.getElementById('journey-invoice-badge');
    if(badge) badge.innerText = `Sent: ${selectedInvoiceData.number}`;
    goToStep(5);
}

// --- STEP 5: JOURNEY BUILDER LOGIC ---
function updateStepper(id, change) {
    const input = document.getElementById(id);
    if(input) {
        let val = parseInt(input.value);
        val += change;
        if(val < 0) val = 0; 
        if(val > 90) val = 90;
        input.value = val;
    }
}

function toggleStepModern(stepId) {
    const checkbox = document.getElementById(`toggle-${stepId}`);
    const configPanel = document.getElementById(`config-${stepId}`);
    const card = document.getElementById(`card-${stepId}`);
    const icon = document.getElementById(`icon-${stepId}`);
    const desc = document.getElementById(`desc-${stepId}`);

    if (checkbox.checked) {
        configPanel.style.maxHeight = '400px'; 
        configPanel.style.opacity = '1';
        configPanel.style.marginTop = '0';
        card.classList.remove('opacity-60', 'bg-slate-50');
        card.classList.add('bg-white');
        icon.classList.remove('bg-slate-100', 'text-slate-300');
        icon.classList.add('bg-white', 'text-blue-600', 'border-blue-200'); 
        if(desc) desc.style.opacity = '1';
    } else {
        configPanel.style.maxHeight = '0'; 
        configPanel.style.opacity = '0';
        configPanel.style.marginTop = '-10px'; 
        card.classList.add('opacity-60', 'bg-slate-50');
        card.classList.remove('bg-white');
        icon.classList.add('bg-slate-100', 'text-slate-300');
        icon.classList.remove('bg-white', 'text-blue-600', 'border-blue-200');
        if(desc) desc.style.opacity = '0.5';
    }
}

function updateModernIcon(stepNum, type) {
    const iconContainer = document.querySelector(`#icon-step-${stepNum} i`);
    if(iconContainer) {
        if(type === 'email') {
            iconContainer.className = 'ph ph-envelope-simple text-xl';
        } else {
            iconContainer.className = 'ph ph-phone-call text-xl';
        }
    }
}

// --- SYNC & AI SIMULATION LOGIC ---
function startSyncSimulation(name, bgClass, text) {
    const overlay = document.getElementById('sync-overlay');
    const logoContainer = document.getElementById('sync-logo-container');
    const title = document.getElementById('sync-title');
    const status = document.getElementById('sync-status');
    const bar = document.getElementById('sync-progress-bar');
    
    if(!overlay) return;

    // 1. Setup UI
    logoContainer.innerHTML = `<div class="w-12 h-12 ${bgClass} rounded-lg flex items-center justify-center text-white font-bold text-xl">${text}</div>`;
    title.innerText = `Connecting to ${name}...`;
    overlay.classList.remove('hidden');
    
    // 2. Start: Handshake
    bar.style.width = '10%';
    setTimeout(() => {
        title.innerText = "Syncing Ledger";
        status.innerText = "Downloading invoices & contacts...";
        bar.style.width = '35%';
        
        // Counter 1: Import
        runCounter('count-sync-1', 0, 142, 800, 'sync-row-1', 'icon-sync-1');
        
        setTimeout(() => {
            title.innerText = "AI Analysis Running"; 
            status.innerText = "Predicting payment behaviors...";
            bar.style.width = '65%';
            
            // Visual 2: AI Risk Scoring
            const row2 = document.getElementById('sync-row-2');
            const icon2 = document.getElementById('icon-sync-2');
            const badge2 = document.getElementById('badge-sync-2');
            if(row2) row2.classList.remove('opacity-50');
            if(icon2) {
                icon2.innerHTML = '<i class="ph ph-brain animate-pulse text-blue-600"></i>';
                icon2.className = "w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs";
            }
            if(badge2) badge2.classList.remove('hidden'); // Show "AI ACTIVE"
            
            setTimeout(() => {
                // Done with AI, mark it green
                if(icon2) {
                    icon2.innerHTML = '<i class="ph ph-check text-white"></i>';
                    icon2.className = "w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs";
                }

                status.innerText = "Grouping profiles by risk...";
                bar.style.width = '85%';
                
                // Counter 3: Segmentation
                runCounter('count-sync-3', 0, 3, 600, 'sync-row-3', 'icon-sync-3'); 
                
                // Finish
                setTimeout(() => {
                    bar.style.width = '100%';
                    title.innerText = "Analysis Complete";
                    status.innerText = "3 Priority Segments identified";
                    title.classList.add('text-green-600');
                    
                    setTimeout(() => {
                        completeStep(2);
                        goToStep(3); // Go to Design, knowing data is ready
                        
                        // Reset for next demo
                        setTimeout(() => {
                            overlay.classList.add('hidden');
                            bar.style.width = '0';
                            title.classList.remove('text-green-600');
                            if(badge2) badge2.classList.add('hidden');
                        }, 500);
                    }, 1200);

                }, 800);
            }, 1500); // Time for AI to "think"
        }, 1000); // Time for Import
    }, 1000); // Time for Handshake
}

function runCounter(id, start, end, duration, rowId, iconId) {
    const obj = document.getElementById(id);
    const row = document.getElementById(rowId);
    const icon = document.getElementById(iconId);
    
    if(row) row.classList.remove('opacity-50');
    if(icon) {
        icon.innerHTML = '<i class="ph ph-spinner animate-spin text-blue-600"></i>';
        icon.className = "w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs";
    }

    let current = start;
    const range = end - start;
    const stepTime = Math.abs(Math.floor(duration / range));
    
    const timer = setInterval(() => {
        current += Math.ceil(range / 20); // Speed up large numbers
        if (current >= end) {
            current = end;
            clearInterval(timer);
            if(icon) {
                icon.innerHTML = '<i class="ph ph-check text-white"></i>';
                icon.className = "w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs";
            }
        }
        if(obj) obj.innerText = current.toLocaleString();
    }, stepTime);
}

// --- STEP 6: DISPUTE SIMULATION ---
function triggerIssueSimulation() {
    const toast = document.getElementById('email-toast');
    const row = document.getElementById('invoice-row-acme');
    const actions = document.getElementById('acme-actions');
    const dot = document.getElementById('acme-dot');
    const highlight = document.getElementById('acme-highlight');
    
    setTimeout(() => {
        if(currentStep !== 6) return;
        if(toast) {
            toast.classList.remove('hidden');
            toast.classList.add('toast-slide-in');
        }
        if(row && highlight && dot) {
            row.classList.add('bg-red-50', 'border-red-200');
            row.classList.remove('bg-white', 'border-slate-100');
            highlight.classList.remove('-translate-x-full');
            dot.classList.remove('hidden');
        }
        const status = document.getElementById('acme-status');
        if(status) {
            status.innerText = "Needs Attention";
            status.className = "text-[10px] font-bold uppercase bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200";
        }
        if(actions) {
            actions.innerHTML = `
                <button onclick="openDisputeModal()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-red-200 transition-all flex items-center gap-2 animate-bounce">
                    <i class="ph ph-envelope-open"></i> Review Reply
                </button>
            `;
        }
    }, 1500);
}

function openDisputeModal() {
    const overlay = document.getElementById('dispute-overlay');
    const modal = document.getElementById('dispute-modal');
    const toast = document.getElementById('email-toast');
    if(toast) toast.classList.add('hidden');
    if(overlay && modal) {
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        modal.classList.remove('scale-95');
        modal.classList.add('scale-100');
    }
}

function closeDisputeModal() {
    const overlay = document.getElementById('dispute-overlay');
    const modal = document.getElementById('dispute-modal');
    if(modal) {
        modal.classList.remove('scale-100');
        modal.classList.add('scale-95');
    }
    if(overlay) overlay.classList.add('opacity-0', 'pointer-events-none');
}

function resolveDispute(action) {
    if(action === 'pause') {
        const btn = document.getElementById('acme-actions');
        const row = document.getElementById('invoice-row-acme');
        const highlight = document.getElementById('acme-highlight');
        const status = document.getElementById('acme-status');

        closeDisputeModal();
        completeStep(6); // Mark optional step 6 as done

        setTimeout(() => {
            if(row && highlight && status && btn) {
                row.classList.remove('bg-red-50', 'border-red-200');
                row.classList.add('bg-yellow-50', 'border-yellow-200');
                highlight.classList.add('bg-yellow-500');
                highlight.classList.remove('bg-red-500');
                status.innerText = "Paused: Dispute";
                status.className = "text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200";
                btn.innerHTML = `
                    <div class="flex items-center gap-2 text-yellow-700 font-bold text-sm bg-yellow-100 px-3 py-2 rounded-lg border border-yellow-200">
                        <i class="ph ph-pause-circle-fill text-lg"></i>
                        Reminder Paused
                    </div>
                `;
            }
            setTimeout(() => goToStep(7), 1500);
        }, 300);
    }
}

// --- STEP 7: INBOX SIMULATION ---
function startForwardDemo() {
    const composer = document.getElementById('email-composer');
    const toField = document.getElementById('composer-to-field');
    const sendBtn = document.getElementById('btn-send-demo');
    const triggerBtn = document.getElementById('btn-forward-trigger');

    if(triggerBtn) triggerBtn.classList.remove('animate-pulse');
    composer.classList.remove('hidden');
    composer.classList.add('animate-[slideUp_0.3s_ease-out]');

    const textToType = "mailtomax@maxcredible.com";
    let i = 0;
    toField.innerText = "";
    if(window.typeWriterInterval) clearInterval(window.typeWriterInterval);

    window.typeWriterInterval = setInterval(() => {
        if (i < textToType.length) {
            toField.innerText += textToType.charAt(i);
            i++;
        } else {
            clearInterval(window.typeWriterInterval);
            toField.classList.remove('typing-cursor');
            sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            sendBtn.classList.add('animate-pulse');
            sendBtn.onclick = finishForwardDemo;
        }
    }, 50);
}

function finishForwardDemo() {
    const composer = document.getElementById('email-composer');
    const feedback = document.getElementById('simulation-feedback');
    const sendBtn = document.getElementById('btn-send-demo');

    sendBtn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Sending...';
    
    setTimeout(() => {
        composer.classList.add('hidden');
        feedback.classList.remove('hidden');
        sendBtn.innerHTML = 'Send <i class="ph ph-paper-plane-right"></i>';
        completeStep(7); // Mark optional step 7 as done
    }, 800);
}

function resetEmailDemo() {
    document.getElementById('email-composer').classList.add('hidden');
}

// --- STEP 8: MISSION CONTROL OVERVIEW ---
function updateOverview() {
    // 1. Update Checkmarks (Keep existing logic)
    for (const [step, isDone] of Object.entries(stepsState)) {
        const row = document.getElementById(`check-step-${step}`);
        if(row && isDone) {
            row.classList.add('done');
            const icon = row.querySelector('.status-icon');
            if(icon) {
                icon.innerHTML = '<i class="ph ph-check text-green-600"></i>';
                icon.classList.add('bg-green-100');
            }
            const badge = row.querySelector('.status-badge');
            if(badge) {
                badge.innerText = "Completed";
                badge.classList.remove('bg-slate-100', 'text-slate-500');
                badge.classList.add('bg-green-100', 'text-green-700');
            }
        }
    }

    // 2. Calculate Readiness
    const mandatory = [1, 2, 3, 5]; 
    const doneCount = mandatory.filter(s => stepsState[s]).length;
    const totalMandatory = mandatory.length;
    const isReady = doneCount === totalMandatory;
    
    // --- NEW UI LOGIC FOR LAUNCHPAD ---
    const reqContainer = document.getElementById('launch-requirements');
    const batchOverlay = document.getElementById('batch-overlay');
    const btn = document.getElementById('btn-go-live');

    if(isReady) {
        // Ready state: Hide requirements, reveal batch preview, enable button
        if(reqContainer) reqContainer.style.display = 'none';
        if(batchOverlay) batchOverlay.classList.add('hidden');
        if(btn) btn.disabled = false;
    } else {
        // Not ready state: Show requirements, blur batch preview, disable button
        if(reqContainer) {
            reqContainer.style.display = 'block';
            // Update individual requirements
            if(stepsState[2]) markReqDone('req-data');
            else markReqPending('req-data');

            if(stepsState[3]) markReqDone('req-template');
            else markReqPending('req-template');

            if(stepsState[5]) markReqDone('req-journey');
            else markReqPending('req-journey');
        }
        if(batchOverlay) batchOverlay.classList.remove('hidden');
        if(btn) btn.disabled = true;
    }

    // 3. Update Progress Bar (Keep existing logic)
    const allSteps = [1, 2, 3, 5, 6, 7];
    const totalDone = allSteps.filter(s => stepsState[s]).length;
    const percent = Math.round((totalDone / allSteps.length) * 100);
    
    const pb = document.getElementById('overview-progress');
    const pc = document.getElementById('overview-percent');
    if(pb) pb.style.width = percent + '%';
    if(pc) pc.innerText = percent + '%';
}

function markReqDone(id) {
    const el = document.getElementById(id);
    if(el) {
        el.classList.remove('text-slate-500');
        el.classList.add('text-green-600');
        el.querySelector('i').className = 'ph ph-check-circle-fill text-green-500 text-lg';
    }
}

function markReqPending(id) {
    const el = document.getElementById(id);
    if(el) {
        el.classList.add('text-slate-500');
        el.classList.remove('text-green-600');
        el.querySelector('i').className = 'ph ph-circle text-slate-300 text-lg';
    }
}

// --- GO LIVE LOGIC ---
function goLive() {
    const modal = document.getElementById('victory-modal');
    if(modal) {
        modal.classList.remove('hidden');
        const container = modal.querySelector('.victory-modal');
        for(let i=0; i<10; i++) {
            const dot = document.createElement('div');
            dot.className = 'confetti-dot';
            dot.style.left = Math.random() * 100 + '%';
            dot.style.animationDelay = Math.random() * 2 + 's';
            dot.style.backgroundColor = ['#ef4444', '#3b82f6', '#fbbf24', '#22c55e'][Math.floor(Math.random()*4)];
            container.appendChild(dot);
        }
    }
}

function enterDashboard() {
    const modal = document.getElementById('victory-modal');
    if(modal) modal.classList.add('hidden');
    
    // Deactivate Wizard Steps
    document.getElementById('step-8').classList.remove('active');
    
    // Ensure Wizard container is hidden/behind (optional safety)
    const wizard = document.getElementById('wizard-container');
    // We don't need to hide wizard if Step 9 is z-20 and absolute, 
    // but we must ensure Step 9 is active.

    // Activate Step 9
    const step9 = document.getElementById('step-9');
    if(step9) step9.classList.add('active');
    
    currentStep = 9;
}

// --- STEP 9 TOUR ---
let tourStep = 1;
const tourSteps = [
    { title: "Aging Buckets", text: "Watch this daily. The '90+ days' red bar represents your highest risk. Keep this low to maintain healthy cash flow." },
    { title: "To-Do List", text: "Your daily action items live here. Calls to make, emails to review. Aim to keep this list at zero." },
    { title: "Total Outstanding", text: "This is your total exposure. Watch it drop as your new automated reminders do the heavy lifting." }
];

function nextTourStep() {
    if(tourStep < 3) {
        tourStep++;
        
        // Update Content
        const title = document.getElementById('tour-title');
        const text = document.getElementById('tour-text');
        const counter = document.getElementById('tour-counter');
        const btn = document.getElementById('tour-btn');

        if(title) title.innerText = tourSteps[tourStep-1].title;
        if(text) text.innerText = tourSteps[tourStep-1].text;
        if(counter) counter.innerText = `${tourStep} / 3`;
        
        if(tourStep === 3 && btn) {
            btn.innerHTML = 'Finish Tour <i class="ph ph-check"></i>';
        }
    } else {
        // FINISH TOUR
        const overlay = document.getElementById('tour-overlay');
        const dashboard = document.getElementById('dashboard-content');
        
        if(overlay) {
            overlay.style.opacity = '0';
            overlay.style.transform = 'translate(-50%, 20px)';
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }
        
        if(dashboard) {
            dashboard.classList.remove('opacity-40', 'pointer-events-none', 'select-none');
            dashboard.classList.add('opacity-100');
        }
    }
}

// --- BATCH EMAIL LOGIC (Step 9) ---

// --- BATCH EMAIL LOGIC (Step 9) ---

function selectBatchEmail(element, companyId) {
    // 1. ANIMATION: Expand the split view
    const leftPanel = document.getElementById('batch-left-panel');
    const rightPanel = document.getElementById('batch-right-panel');
    
    if(leftPanel && rightPanel) {
        // Shrink left panel to 50%
        leftPanel.classList.remove('w-full');
        leftPanel.classList.add('w-1/2');
        
        // Expand right panel to 50% and fade in
        rightPanel.classList.remove('w-0', 'opacity-0');
        rightPanel.classList.add('w-1/2', 'opacity-100');
    }

    // 2. HIGHLIGHT ROW: Update Visual State of List
    const items = document.querySelectorAll('.batch-item');
    items.forEach(i => {
        i.classList.remove('active', 'border-l-blue-600', 'bg-blue-50/30');
        i.classList.add('border-l-transparent');
    });

    if (element) {
        element.classList.add('active', 'border-l-blue-600', 'bg-blue-50/30');
        element.classList.remove('border-l-transparent');
    }

    // 3. DATA: Define Data for Simulation
    const batchData = {
        'acme': { 
            name: 'Acme Corp', 
            amount: '€ 2.500,00', 
            number: 'INV-2023-001', 
            dueText: '15 Days Ago' 
        },
        'globex': { 
            name: 'Globex Inc.', 
            amount: '€ 8.200,00', 
            number: 'INV-2023-099', 
            dueText: '45 Days Overdue' 
        },
        'soylent': { 
            name: 'Soylent Corp', 
            amount: '€ 5.100,00', 
            number: 'INV-2023-150', 
            dueText: '2 Days Overdue' 
        }
    };

    const selectedData = batchData[companyId] || batchData['acme'];

    // 4. GENERATE: Create HTML based on Step 3 Design State
    const htmlContent = generateEmailHTML(designState, selectedData);

    // 5. INJECT: Put into Preview Container
    const container = document.getElementById('batch-preview-container');
    if (container) {
        container.style.opacity = '0';
        setTimeout(() => {
            container.innerHTML = htmlContent;
            container.style.opacity = '1';
        }, 150);
    }
}

// Optional helper to close the preview and return to full list
function closeBatchPreview() {
    const leftPanel = document.getElementById('batch-left-panel');
    const rightPanel = document.getElementById('batch-right-panel');
    
    if(leftPanel && rightPanel) {
        leftPanel.classList.add('w-full');
        leftPanel.classList.remove('w-1/2');
        rightPanel.classList.add('w-0', 'opacity-0');
        rightPanel.classList.remove('w-1/2', 'opacity-100');
    }
    
    // Deselect rows
    const items = document.querySelectorAll('.batch-item');
    items.forEach(i => {
        i.classList.remove('active', 'border-l-blue-600', 'bg-blue-50/30');
        i.classList.add('border-l-transparent');
    });
}

// --- POST-SETUP NAVIGATION ---

function enterBatchReview() {
    document.getElementById('victory-modal').classList.add('hidden');
    
    // Hide Step 8 (Overview)
    document.getElementById('step-8').classList.remove('active');
    
    // Show Step 9 (Batch Review)
    document.getElementById('step-9').classList.add('active');
    
    currentStep = 9;

    // ADDED: Initialize the view so it's not empty
    initBatchView();
}

function approveBatch() {
    const btn = document.querySelector('#step-9 button.bg-green-600');
    if(btn) {
        btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Sending...';
    }
    
    setTimeout(() => {
        // Hide Step 9
        document.getElementById('step-9').classList.remove('active');
        
        // Show Step 10
        const step10 = document.getElementById('step-10');
        step10.classList.add('active');
        
        currentStep = 10;
        
        // Trigger Animations
        triggerDashboardAnimations();
        
        // Trigger tour on final dashboard
        setTimeout(() => {
            const overlay = document.getElementById('tour-overlay');
            if(overlay) {
               overlay.classList.remove('hidden');
            }
        }, 500);
    }, 1500);
}

// Update Deep Link Map to include new steps
function checkDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    
    const stepMap = {
        'register': 0,
        'login': 0,
        'financials': 1,
        'connect': 2,
        'upload': 2, 
        'template': 3,
        'design': 3, 
        'preview': 4,
        'journey': 5,
        'settings': 5, 
        'dispute': 6,
        'email': 7,
        'overview': 8,
        'batch': 9,
        'dashboard': 10
    };

    if (stepParam) {
        let targetStep = stepMap[stepParam] || parseInt(stepParam);
        if (targetStep >= 1 && targetStep <= 10) {
            jumpDirectlyToStep(targetStep);
        }
    }
}

// --- DEMO HELPER: MARK ALL COMPLETE ---
function markAllStepsComplete() {
    // Set all tracked steps to true
    for (const step in stepsState) {
        stepsState[step] = true;
    }
    
    // Refresh the Mission Control UI to reflect changes
    updateOverview();
    
    // Optional: Visual feedback
    const btn = document.querySelector('#step-8 button i.ph-check-all').parentElement;
    if(btn) {
        btn.innerText = "Done!";
        btn.classList.add('text-green-600', 'bg-green-50');
        setTimeout(() => {
            btn.innerHTML = '<i class="ph ph-check-all"></i> Mark All Complete';
            btn.classList.remove('text-green-600', 'bg-green-50');
        }, 2000);
    }
}

// --- BATCH VIEW INITIALIZER ---
function initBatchView() {
    // 1. Reset Panels
    closeBatchPreview();

    // 2. Auto-select the first item to show immediate value
    // This removes the friction of "what do I do next?"
    setTimeout(() => {
        const firstItem = document.querySelector('.batch-item');
        if(firstItem) {
            // Simulate a click on the first item
            selectBatchEmail(firstItem, 'acme');
        }
    }, 500);
}

// --- ANIMATION UTILS ---
function triggerDashboardAnimations() {
    // 1. Animate Bars Growing
    const bars = document.querySelectorAll('#step-10 .group > div:first-child');
    bars.forEach(bar => {
        // Check if class contains h-[X%] or use inline style or default
        let targetHeight = bar.style.height;

        // If empty, infer from Tailwind class (e.g., h-[80%])
        if(!targetHeight) {
            const classList = bar.getAttribute('class');
            if(classList.includes('h-[')) {
                 // Extract 80% from h-[80%]
                 const match = classList.match(/h-\[(\d+%)\]/);
                 if(match) targetHeight = match[1];
            }
        }

        // Hardcoded fallbacks based on your HTML colors if regex fails
        if(!targetHeight) {
            if(bar.classList.contains('bg-green-500')) targetHeight = '80%';
            if(bar.classList.contains('bg-green-400')) targetHeight = '10%';
            if(bar.classList.contains('bg-yellow-400')) targetHeight = '5%';
            if(bar.classList.contains('bg-orange-400')) targetHeight = '8%';
            if(bar.classList.contains('bg-red-500')) targetHeight = '15%';
        }

        // Reset to 0 for animation start
        bar.style.height = '0%';
        bar.style.transition = 'height 1s cubic-bezier(0.34, 1.56, 0.64, 1)';

        // Trigger growth
        setTimeout(() => {
            bar.style.height = targetHeight;
        }, 300);
    });

    // 2. Count up the Total Number
    const totalEl = document.querySelector('#step-10 .text-3xl');
    if(totalEl) {
        const finalVal = 3855725.04;
        let startVal = 0;
        const duration = 2000;
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);

            const current = startVal + (finalVal * ease);

            // Format nicely as Euro
            totalEl.innerText = '€ ' + current.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }
}

/* [INSERT AT END OF FILE] */

// --- STEP 0: REGISTRATION LOGIC ---

/* [REPLACE THE PREVIOUS filterSoftwareGate FUNCTION AT BOTTOM OF script.js] */

function filterSoftwareGate(val) {
    const dropdown = document.getElementById('gate-dropdown');
    // Use the new simpler class 'gate-item'
    const items = dropdown.querySelectorAll('.gate-item'); 
    const value = val ? val.toLowerCase() : '';

    dropdown.classList.remove('hidden');

    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        if (text.includes(value)) {
            item.classList.remove('hidden');
            item.classList.add('flex');
        } else {
            item.classList.add('hidden');
            item.classList.remove('flex');
        }
    });
}

function selectSoftwareGate(name, type) {
    const input = document.getElementById('inp-software-gate');
    const dropdown = document.getElementById('gate-dropdown');
    
    // Store selection
    input.value = name;
    userSoftwareChoice = { name, type };
    
    // UI Feedback
    if(dropdown) dropdown.classList.add('hidden');
}

function handleRegistration() {
    const email = document.getElementById('inp-reg-email').value;
    const software = document.getElementById('inp-software-gate').value;
    const btn = document.getElementById('btn-register');

    if(!email || !software) {
        alert("Please select your software and enter your email.");
        return;
    }

    // 1. Simulate API Call
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-spinner animate-spin text-xl"></i> Creating...';
    btn.classList.add('opacity-80', 'cursor-not-allowed');

    setTimeout(() => {
        // 2. Update Verification Screen Text
        const verifyDisplay = document.getElementById('verify-email-display');
        if(verifyDisplay) verifyDisplay.innerText = email;

        // 3. Move to Verification Step (NOT Step 1 yet)
        document.getElementById('step-0').classList.remove('active');
        document.getElementById('step-verify').classList.add('active');
        
        // Reset Button
        btn.innerHTML = originalText;
        btn.classList.remove('opacity-80', 'cursor-not-allowed');

    }, 800);
}

function simulateVerification() {
    const btn = document.querySelector('#step-verify button');
    
    // Visual Feedback
    btn.innerHTML = '<i class="ph ph-spinner animate-spin text-xl"></i> Verifying...';
    btn.classList.add('bg-green-600', 'border-green-600');
    btn.classList.remove('bg-blue-600');

    setTimeout(() => {
        btn.innerHTML = '<i class="ph ph-check-bold text-xl"></i> Verified!';
        
        setTimeout(() => {
            // NOW we go to the Wizard (Step 1)
            document.getElementById('step-verify').classList.remove('active');
            
            // Pre-fill Step 1 Data
            const email = document.getElementById('inp-reg-email').value;
            const emailField = document.getElementById('inp-email');
            if(emailField) emailField.value = email;

            goToStep(1);
            
            // Configure Step 2 (Logic from before)
            configureStep2BasedOnGate();
            
        }, 800);
    }, 1000);
}

function configureStep2BasedOnGate() {
    const container = document.getElementById('integration-grid');
    const search = document.getElementById('suite-search');
    
    if(userSoftwareChoice.type === 'supported') {
        const initials = userSoftwareChoice.name.substring(0,2).toUpperCase();
        
        // Define color based on name (simple fallback)
        let colorClass = 'bg-blue-600';
        if(userSoftwareChoice.name.includes('Exact')) colorClass = 'bg-red-600';
        if(userSoftwareChoice.name.includes('AFAS')) colorClass = 'bg-slate-800';
        if(userSoftwareChoice.name.includes('Twinfield')) colorClass = 'bg-blue-600';
        if(userSoftwareChoice.name.includes('Bill')) colorClass = 'bg-purple-600';
        if(userSoftwareChoice.name.includes('JeFacture')) colorClass = 'bg-green-600';
        if(userSoftwareChoice.name.includes('Banqup')) colorClass = 'bg-indigo-600';

        if(container) {
            // IMPORTANT: Changed onclick to openIntegrationAuth
            container.innerHTML = `
                <div onclick="openIntegrationAuth('${userSoftwareChoice.name}', '${colorClass}', '${initials}')" 
                     class="col-span-1 sm:col-span-2 lg:col-span-3 bg-blue-50 border-2 border-blue-500 p-8 rounded-xl cursor-pointer hover:bg-blue-100 transition-all flex flex-col items-center justify-center gap-4 group animate-pulse">
                    <div class="w-16 h-16 ${colorClass} rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                        ${initials}
                    </div>
                    <div class="text-center">
                        <h3 class="font-bold text-blue-900 text-xl">Connect to ${userSoftwareChoice.name}</h3>
                        <p class="text-blue-600 text-sm">Click here to authorize the connection</p>
                    </div>
                </div>
            `;
        }
        if(search) search.parentElement.classList.add('hidden');
    } 
    else if (userSoftwareChoice.type === 'csv') {
        if(container) container.classList.add('hidden');
    }
}

// --- AUTH HANDSHAKE LOGIC ---

let pendingIntegration = null;

function openIntegrationAuth(name, colorClass, initials) {
    pendingIntegration = { name, colorClass, initials };
    
    const modal = document.getElementById('integration-auth-modal');
    const content = document.getElementById('auth-modal-content');
    const title = document.getElementById('auth-title');
    const logoBox = document.getElementById('auth-logo-box');
    const urlBar = document.getElementById('auth-url-bar');
    
    // Configure Modal
    title.innerText = `Log in to ${name}`;
    logoBox.innerText = initials;
    
    // Reset classes
    logoBox.className = `w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-4 transition-colors ${colorClass}`;
    
    // Fake URL
    const safeName = name.toLowerCase().replace(/\s/g, '');
    urlBar.innerText = `https://login.${safeName}.com/oauth/authorize?client_id=maxcredible`;

    // Show
    modal.classList.remove('hidden');
    
    // Animation trigger
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
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function submitExternalAuth() {
    const btn = document.getElementById('btn-auth-submit');
    const originalText = btn.innerText;
    
    // 1. Loading State on Button
    btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Authorizing...';
    btn.classList.add('opacity-80', 'cursor-not-allowed');
    
    setTimeout(() => {
        // 2. Success State
        btn.innerHTML = '<i class="ph ph-check-bold"></i> Success!';
        btn.classList.replace('bg-blue-600', 'bg-green-600');
        
        setTimeout(() => {
            // 3. Close Modal
            closeAuthModal();
            
            // 4. Start the REAL Sync Simulation
            if(pendingIntegration) {
                startSyncSimulation(
                    pendingIntegration.name, 
                    pendingIntegration.colorClass, 
                    pendingIntegration.initials
                );
            }
            
            // Reset button for next time
            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove('opacity-80', 'cursor-not-allowed');
                btn.classList.replace('bg-green-600', 'bg-blue-600');
            }, 500);
            
        }, 800);
    }, 1500);
}

// 6. Close Dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('gate-dropdown');
    const input = document.getElementById('inp-software-gate');
    const icon = document.querySelector('.ph-caret-down');
    
    // Check if the click was OUTSIDE the input and OUTSIDE the dropdown
    if (dropdown && !dropdown.classList.contains('hidden')) {
        const isClickInside = dropdown.contains(event.target) || 
                              input.contains(event.target) || 
                              (icon && icon.contains(event.target));
                              
        if (!isClickInside) {
            dropdown.classList.add('hidden');
        }
    }
});

// 7. Toggle dropdown when clicking the arrow icon
function toggleGateDropdown() {
    const dropdown = document.getElementById('gate-dropdown');
    const input = document.getElementById('inp-software-gate');
    
    if (dropdown.classList.contains('hidden')) {
        filterSoftwareGate(input.value); // Open and filter
        input.focus();
    } else {
        dropdown.classList.add('hidden'); // Close
    }
}
