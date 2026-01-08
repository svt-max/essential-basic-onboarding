/**
 * MAXCREDIBLE ESSENTIAL ONBOARDING CORE
 * Version: 2.5 (Refined Journey & DNS Logic)
 */

const app = {
    state: {
        currentStep: 0,
        userSoftware: { 
            name: '', 
            type: 'supported', // 'supported' (Elite) or 'unsupported'
            mode: 'direct',    // 'direct', 'pay', or 'csv'
            color: 'bg-blue-600',
            logo: 'MC'
        },
        journey: {
            strategy: 'fast',
            startDay: 1,
            intervalOne: 7,
            intervalTwo: 7,
            finalType: 'email'
        },
        stripeConnected: false
    },

    data: {
        goldenSix: [
            { name: 'Exact Online', logo: 'EO', color: 'bg-red-600' },
            { name: 'Twinfield', logo: 'TW', color: 'bg-blue-500' },
            { name: 'AFAS', logo: 'AF', color: 'bg-blue-600' },
            { name: 'Billtobox', logo: 'BB', color: 'bg-purple-500' },
            { name: 'Jefacture', logo: 'JF', color: 'bg-green-600' },
            { name: 'Banqup', logo: 'BQ', color: 'bg-indigo-500' }
        ],
        allSuites: [
            "AccountView", "Acumatica", "Basecone", "Bexio", "E-Boekhouden",
            "Exact Globe", "King", "Microsoft BC", "Minox", "Moneybird", 
            "Muis", "Multivers", "Odoo", "Oracle NetSuite", "Reeleezee", 
            "Sage", "SAP", "Unit4", "Xero", "Zoho Books"
        ],

        renderIntegrations: () => {
            const grid = document.getElementById('integration-grid');
            if (!grid) return;
            grid.innerHTML = '';
            app.data.goldenSix.forEach(software => {
                const card = document.createElement('div');
                card.className = "group bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 transition-all cursor-pointer text-center relative overflow-hidden";
                card.onclick = () => app.data.connectSoftware(software);
                card.innerHTML = `
                    <div class="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div class="relative z-10">
                        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl ${software.color} flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">${software.logo}</div>
                        <h3 class="text-xl font-bold text-slate-900 mb-1">${software.name}</h3>
                        <p class="text-xs font-bold text-blue-500 uppercase tracking-widest">Elite Connector</p>
                        <div class="mt-6 px-4 py-2 rounded-full bg-slate-50 text-slate-400 text-[10px] font-bold uppercase group-hover:bg-blue-600 group-hover:text-white transition-colors">Connect Now</div>
                    </div>
                `;
                grid.appendChild(card);
            });
        },

        connectSoftware: (software) => {
            const modal = document.getElementById('integration-auth-modal');
            const content = document.getElementById('auth-modal-content');
            const title = document.getElementById('auth-title');
            const logoBox = document.getElementById('auth-logo-box');

            app.state.userSoftware.name = software.name;
            app.state.userSoftware.color = software.color;
            app.state.userSoftware.logo = software.logo;

            title.innerText = `Log in to ${software.name}`;
            logoBox.className = `w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl mx-auto mb-5 transition-all ${software.color}`;
            logoBox.innerText = software.logo;

            modal.classList.remove('hidden');
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }, 10);
        },

        closeAuthModal: () => {
            const modal = document.getElementById('integration-auth-modal');
            const content = document.getElementById('auth-modal-content');
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => modal.classList.add('hidden'), 300);
        },

        submitExternalAuth: () => {
            const btn = document.getElementById('btn-auth-submit');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Authenticating...';
            setTimeout(() => {
                app.data.closeAuthModal();
                app.data.initSyncSimulation();
                btn.innerHTML = originalText;
            }, 1500);
        },

        initSyncSimulation: () => {
            const overlay = document.getElementById('sync-overlay');
            const bar = document.getElementById('sync-progress-bar');
            const statusText = document.getElementById('sync-status-text');
            
            overlay.classList.remove('hidden');
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    // statusText.innerText = "Sync Complete!"; // statusText might be null in HTML
                    setTimeout(() => {
                        overlay.classList.add('hidden');
                        app.nav.goToStep(2);
                    }, 800);
                }
                if(bar) bar.style.width = `${progress}%`;
                
                // Animate rows
                if(progress > 10) document.getElementById('sync-row-1').classList.remove('opacity-40');
                if(progress > 40) document.getElementById('sync-row-2').classList.remove('opacity-40');
                if(progress > 70) document.getElementById('sync-row-3').classList.remove('opacity-40');
                if(progress > 90) document.getElementById('sync-row-4').classList.remove('opacity-40');
            }, 250);
        },

        triggerCustomPaid: () => {
            app.state.userSoftware.type = 'unsupported';
            app.state.userSoftware.name = 'Custom ERP';
            app.nav.goToStep(2);
        },
        
        triggerCSVFlow: () => {
             document.getElementById('step-1-unsupported-gate-cards').classList.add('hidden');
             document.getElementById('csv-drop-zone').classList.remove('hidden');
        },

        resetDataView: () => {
            document.getElementById('step-1-unsupported-gate-cards').classList.remove('hidden');
            document.getElementById('csv-drop-zone').classList.add('hidden');
        },

        finishSyncSimulation: () => {
             app.nav.goToStep(2);
        },

        handleDataView: () => {
            const supported = document.getElementById('step-1-supported');
            const unsupported = document.getElementById('step-1-unsupported');
            const title = document.getElementById('step-1-title');

            if (app.state.userSoftware.type === 'unsupported') {
                supported.classList.add('hidden');
                unsupported.classList.remove('hidden');
                title.innerHTML = `Connect to <span class="text-blue-600">${app.state.userSoftware.name}</span>`;
                const gateName = document.getElementById('pay-gate-software-name');
                if(gateName) gateName.innerText = app.state.userSoftware.name;
            } else {
                supported.classList.remove('hidden');
                unsupported.classList.add('hidden');
                title.innerText = "Ingest your data";
            }
        }
    },

    init: () => {
        app.data.renderIntegrations();
        app.nav.updateProgressBar(5);
        app.journey.init();

        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') e.preventDefault();
            });
        });
        console.log("MaxCredible Onboarding Initialized");
    },

    nav: {
        goToStep: (stepIndex) => {
            app.state.currentStep = stepIndex;
            document.querySelectorAll('.step-panel').forEach(p => {
                p.classList.remove('active');
                p.style.display = 'none';
            });

            let targetId = `step-${stepIndex}`;
            if (stepIndex === 0) targetId = 'step-0-a'; 

            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.style.display = 'block';
                targetPanel.offsetHeight; // force reflow
                targetPanel.classList.add('active');
            }

            app.nav.updateTopNav(stepIndex);
            const progressMap = { 0: 10, 1: 35, 2: 60, 3: 85, 4: 95 };
            app.nav.updateProgressBar(progressMap[stepIndex] || 10);

            if (stepIndex === 1) app.data.handleDataView();
            if (stepIndex === 2) app.general.handleFinancialView();
            if (stepIndex === 3) app.journey.updateUI();
            if (stepIndex === 4) {
                app.control.renderSummary(); // New Summary Logic
                app.control.refresh();
            }
        },

        goToSubStep: (subStepId) => {
            document.querySelectorAll('.step-panel').forEach(p => {
                p.classList.remove('active');
                p.style.display = 'none';
            });
            const target = document.getElementById(`step-${subStepId}`);
            if (target) {
                target.style.display = 'block';
                target.offsetHeight;
                target.classList.add('active');
            }
        },

        updateTopNav: (stepIndex) => {
            document.querySelectorAll('.nav-item').forEach(btn => {
                const step = parseInt(btn.getAttribute('data-step'));
                const icon = btn.querySelector('.step-icon');
                
                // Reset all to Base State (Inactive)
                btn.className = "nav-item group relative px-5 py-2.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all duration-300 text-slate-400 hover:bg-slate-50 cursor-pointer";
                icon.classList.remove('text-blue-600', 'text-white');
                
                if (step === stepIndex) {
                    // ACTIVE STATE: Dark Pill, White Text
                    btn.className = "nav-item relative px-6 py-2.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all duration-300 bg-slate-900 text-white shadow-md shadow-slate-200 scale-105";
                    icon.classList.add('text-white');
                } else if (step < stepIndex) {
                    // COMPLETED STATE: Blue Text, No Background
                    btn.className = "nav-item relative px-5 py-2.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all duration-300 text-blue-600 bg-blue-50/50";
                    icon.classList.add('text-blue-600');
                }
            });
        },

        updateProgressBar: (percent) => {
            const bar = document.getElementById('progress-bar');
            if(bar) bar.style.width = `${percent}%`;
        }
    },

    registration: {
        filterSoftware: (query) => {
            const dropdown = document.getElementById('gate-dropdown');
            const input = document.getElementById('inp-software-gate');
            const nextBtn = document.getElementById('btn-gate-next');
            if (!query) { dropdown.classList.add('hidden'); return; }

            const eliteNames = app.data.goldenSix.map(g => g.name);
            const matches = [...eliteNames, ...app.data.allSuites].filter(opt => 
                opt.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 6);

            dropdown.innerHTML = '';
            if (matches.length > 0) {
                dropdown.classList.remove('hidden');
                matches.forEach(match => {
                    const isElite = eliteNames.includes(match);
                    const div = document.createElement('div');
                    div.className = "px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-medium flex justify-between items-center transition-colors border-b border-slate-50 last:border-0";
                    div.innerHTML = `<span>${match}</span> ${isElite ? '<span class="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">ELITE</span>' : ''}`;
                    div.onclick = () => {
                        input.value = match;
                        dropdown.classList.add('hidden');
                        app.state.userSoftware = { 
                            name: match, 
                            type: isElite ? 'supported' : 'unsupported',
                            mode: isElite ? 'direct' : 'pay',
                            color: isElite ? 'bg-blue-600' : 'bg-slate-500',
                            logo: match.substring(0,2).toUpperCase()
                        };
                        // If it's one of the Golden Six, update correct metadata
                        const golden = app.data.goldenSix.find(g => g.name === match);
                        if(golden) {
                            app.state.userSoftware.color = golden.color;
                            app.state.userSoftware.logo = golden.logo;
                        }

                        nextBtn.disabled = false;
                        nextBtn.classList.remove('bg-slate-100', 'text-slate-400', 'cursor-not-allowed');
                        nextBtn.classList.add('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-200');
                    };
                    dropdown.appendChild(div);
                });
            } else {
                dropdown.classList.add('hidden');
            }
        },

        submitUserForm: () => {
            const nameDisplay = document.getElementById('reg-software-name');
            if (nameDisplay) nameDisplay.innerText = app.state.userSoftware.name;
            const toggle = document.getElementById('implementation-toggle-container');
            if (app.state.userSoftware.type === 'unsupported') {
                toggle.classList.remove('hidden');
                app.registration.updateImplementationState();
            } else {
                toggle.classList.add('hidden');
            }
            app.nav.goToSubStep('0-d');
        },

        updateImplementationState: () => {
            const toggle = document.getElementById('toggle-implementation');
            const price = document.getElementById('impl-price');
            const label = document.getElementById('impl-label-text');
            if (toggle && toggle.checked) {
                app.state.userSoftware.mode = 'pay';
                price.innerText = "€ 500.00";
                label.innerHTML = '<i class="ph ph-wrench"></i> Implementation Support';
            } else {
                app.state.userSoftware.mode = 'csv';
                price.innerText = "€ 0.00";
                label.innerHTML = '<i class="ph ph-file-csv"></i> Self-Service (CSV)';
            }
        },

        performRegistryLookup: () => {
            const inputOrg = document.getElementById('inp-org');
            const spinner = document.getElementById('registry-spinner');
            const badge = document.getElementById('badge-verified');
            const helper = document.getElementById('registry-helper');
            
            spinner.classList.remove('hidden');
            inputOrg.disabled = true;
            helper.innerText = "Connecting to Trade Register...";
        
            setTimeout(() => {
                spinner.classList.add('hidden');
                inputOrg.disabled = false;
                badge.classList.remove('hidden'); 
                helper.innerHTML = "<span class='text-green-600 font-bold'>✓ Entity Verified.</span> Data auto-filled.";
                
                const demoData = {
                    'inp-org': 'Demo Corp B.V.',
                    'inp-coc': '12345678',
                    'inp-street': 'Keizersgracht',
                    'inp-number': '123',
                    'inp-zip': '1015 CS',
                    'inp-city': 'Amsterdam',
                    'step2-coc': '12345678',
                    'step2-org-name': 'Demo Corp B.V.'
                };
                Object.keys(demoData).forEach(id => {
                    const el = document.getElementById(id);
                    if(el) el.value = demoData[id];
                });
            }, 1200);
        },

        simulateVerification: (btn) => {
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-circle-notch animate-spin"></i> Verifying...';
            setTimeout(() => {
                app.nav.goToSubStep('0-e');
                btn.innerHTML = original;
            }, 1000);
        }
    },

general: {
        handleFinancialView: () => {
            // TRANSFER DATA FROM REGISTRATION (STEP 0) TO STEP 2
            
            // Org Data
            const orgName = document.getElementById('inp-org').value;
            const coc = document.getElementById('inp-coc').value;
            const street = document.getElementById('inp-street').value;
            const number = document.getElementById('inp-number').value;
            const zip = document.getElementById('inp-zip').value;
            const city = document.getElementById('inp-city').value;

            // Admin Data (if we had separate fields for admin, we'd use them, currently using email logic)
            const email = document.getElementById('inp-reg-email').value;

            // Populate Step 2 Fields if they exist
            if(document.getElementById('step2-org-name')) document.getElementById('step2-org-name').value = orgName;
            if(document.getElementById('step2-coc')) document.getElementById('step2-coc').value = coc;
            
            if(document.getElementById('step2-street')) document.getElementById('step2-street').value = street;
            if(document.getElementById('step2-number')) document.getElementById('step2-number').value = number;
            if(document.getElementById('step2-zip')) document.getElementById('step2-zip').value = zip;
            if(document.getElementById('step2-city')) document.getElementById('step2-city').value = city;

            // Default the Send/Receive email to the registration email
            if(document.getElementById('inp-send-email')) {
                document.getElementById('inp-send-email').value = email;
                app.general.updateEmailVisuals(email);
            }
        },

        handleLogoUpload: (input) => {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.getElementById('logo-preview-img');
                    const placeholder = document.getElementById('logo-placeholder');
                    img.src = e.target.result;
                    img.classList.remove('hidden');
                    placeholder.classList.add('hidden'); // Hide the icon/text placeholder
                };
                reader.readAsDataURL(input.files[0]);
            }
        },

        toggleDnsPanel: () => {
            const panel = document.getElementById('dns-panel');
            panel.classList.toggle('hidden');
        },

        switchDnsTab: (type) => {
            const tabIt = document.getElementById('tab-dns-it');
            const tabDiy = document.getElementById('tab-dns-diy');
            const contentIt = document.getElementById('content-dns-it');
            const contentDiy = document.getElementById('content-dns-diy');

            if(type === 'it') {
                tabIt.className = "flex-1 py-3 text-[11px] font-bold rounded-lg bg-white shadow-sm text-slate-900 transition-all flex items-center justify-center gap-2";
                tabDiy.className = "flex-1 py-3 text-[11px] font-bold rounded-lg text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center gap-2";
                contentIt.classList.remove('hidden');
                contentDiy.classList.add('hidden');
            } else {
                tabIt.className = "flex-1 py-3 text-[11px] font-bold rounded-lg text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center gap-2";
                tabDiy.className = "flex-1 py-3 text-[11px] font-bold rounded-lg bg-white shadow-sm text-slate-900 transition-all flex items-center justify-center gap-2";
                contentIt.classList.add('hidden');
                contentDiy.classList.remove('hidden');
            }
        },

        copyITRequest: () => {
            const textarea = document.getElementById('it-request-text');
            textarea.select();
            document.execCommand('copy');
            const btn = document.querySelector('button[onclick="app.general.copyITRequest()"]');
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-check-bold"></i> Copied';
            setTimeout(() => btn.innerHTML = originalHtml, 2000);
        },
        
        copyText: (text) => {
            navigator.clipboard.writeText(text);
            alert("Copied to clipboard: " + text);
        },

        verifyDNS: () => {
            const btn = document.getElementById('btn-verify-dns-action');
            btn.innerHTML = '<i class="ph ph-spinner animate-spin text-lg"></i> Verifying Records...';
            
            setTimeout(() => {
                btn.innerHTML = '<i class="ph ph-check-circle text-lg"></i> Verification Successful';
                btn.className = "w-full md:w-auto px-10 py-4 bg-green-500 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2";
                
                // Update Badge
                const badge = document.getElementById('dns-status-badge');
                badge.className = "bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1";
                badge.innerHTML = '<i class="ph ph-seal-check-fill"></i> Fully Optimized';
                
                // Update toggle button visuals
                const toggleBtn = document.getElementById('btn-toggle-dns');
                toggleBtn.className = "shrink-0 bg-green-50 text-green-600 border border-green-200 px-6 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2 pointer-events-none";
                toggleBtn.innerHTML = '<i class="ph ph-check"></i> Configured';

                setTimeout(() => {
                   document.getElementById('dns-panel').classList.add('hidden');
                }, 1500);
            }, 1500);
        },

        updateIbanVisuals: (val) => {
            // Placeholder for visual IBAN updates if needed in future
        },
        
        updateEmailVisuals: (val) => {
            // Updates previews in the DNS explainer
            document.querySelectorAll('.email-vis-addr').forEach(el => el.innerText = val || 'finance@company.com');
        },

        connectStripe: (btn) => {
            btn.innerHTML = '<i class="ph ph-spinner animate-spin text-lg"></i> Connecting...';
            setTimeout(() => {
                btn.className = "w-full py-4 bg-white text-green-600 border border-green-100 rounded-xl font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-default";
                btn.innerHTML = '<i class="ph ph-check-circle-fill text-xl"></i> Active';
                app.state.stripeConnected = true; // Set state
            }, 1200);
        }
    },

    journey: {
        init: () => { 
            app.state.journey.length = 'normal'; // default
            app.journey.updateUI(); 
        },

        setStrategy: (s) => {
            app.state.journey.strategy = s;
            
            // Visual update for cards
            ['fast', 'normal', 'custom'].forEach(m => {
                const card = document.getElementById(`strat-${m}`);
                if (!card) return;
                
                if (m === s) {
                    // Selected Style
                    card.className = "cursor-pointer relative p-6 rounded-2xl border-2 border-blue-600 bg-blue-50/50 transition-all shadow-lg scale-[1.02]";
                } else {
                    // Deselected Style
                    card.className = "cursor-pointer relative p-6 rounded-2xl border border-slate-200 bg-white transition-all hover:border-blue-300 hover:shadow-md opacity-60 hover:opacity-100";
                }
            });

            if (s === 'fast') {
                app.state.journey.startDay = 1;
                app.state.journey.intervalOne = 7;
                app.state.journey.intervalTwo = 7;
                app.journey.setLength('normal'); // Recommended is normal length, but fast intervals
            } else if (s === 'normal') {
                app.state.journey.startDay = 7;
                app.state.journey.intervalOne = 14;
                app.state.journey.intervalTwo = 14;
                app.journey.setLength('normal');
            } else {
                // Custom doesn't reset values, just unlocks editing
            }
            app.journey.updateUI();
        },

        setLength: (len) => {
            app.state.journey.length = len;
            const container = document.getElementById('step-2-container');
            const btnNormal = document.getElementById('btn-len-normal');
            const btnShort = document.getElementById('btn-len-short');
            const recText = document.getElementById('len-recommendation');

            if (len === 'short') {
                container.classList.add('hidden');
                btnNormal.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-700 transition-all";
                btnShort.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-white shadow-sm text-slate-900 transition-all";
                recText.classList.add('hidden');
            } else {
                container.classList.remove('hidden');
                btnNormal.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-white shadow-sm text-blue-600 transition-all";
                btnShort.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-700 transition-all";
                recText.classList.remove('hidden');
            }
            app.journey.updateUI();
        },

        updateValue: (type, delta) => {
            app.state.journey.strategy = 'custom';
            // Visual check to ensure custom card is highlighted
            app.journey.setStrategy('custom');

            if (type === 'start') app.state.journey.startDay = Math.max(1, app.state.journey.startDay + delta);
            if (type === 'int1') app.state.journey.intervalOne = Math.max(1, app.state.journey.intervalOne + delta);
            if (type === 'int2') app.state.journey.intervalTwo = Math.max(1, app.state.journey.intervalTwo + delta);
            app.journey.updateUI();
        },

        toggleDay: (btn) => {
            // Toggle Visuals: Blue-600 (Active) vs White (Inactive)
            if(btn.classList.contains('active-day')) {
                // Deactivate
                btn.classList.remove('active-day', 'bg-blue-600', 'text-white', 'border-blue-600');
                btn.classList.add('bg-white', 'text-slate-400', 'border-slate-200');
            } else {
                // Activate
                btn.classList.add('active-day', 'bg-blue-600', 'text-white', 'border-blue-600');
                btn.classList.remove('bg-white', 'text-slate-400', 'border-slate-200');
            }
        },

        setFinalType: (type) => {
             const btnEmail = document.getElementById('btn-final-email');
             const btnCall = document.getElementById('btn-final-call');
             if(type === 'email') {
                 btnEmail.className = "px-3 py-1 text-[10px] font-bold rounded-md bg-red-100 text-red-700 shadow-sm transition-all flex items-center gap-1";
                 btnCall.className = "px-3 py-1 text-[10px] font-bold rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center gap-1";
             } else {
                 btnCall.className = "px-3 py-1 text-[10px] font-bold rounded-md bg-red-100 text-red-700 shadow-sm transition-all flex items-center gap-1";
                 btnEmail.className = "px-3 py-1 text-[10px] font-bold rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center gap-1";
             }
        },

        updateUI: () => {
            // Update Number Displays
            document.getElementById('val-start').innerText = `${app.state.journey.startDay} Days`;
            document.getElementById('val-int1').innerText = `${app.state.journey.intervalOne} Days`;
            document.getElementById('val-int2').innerText = `${app.state.journey.intervalTwo} Days`;

            // Update Dynamic Waits (The connector lines)
            document.getElementById('disp-interval-1').innerText = `${app.state.journey.intervalOne} Days`;
            document.getElementById('disp-interval-2').innerText = `${app.state.journey.intervalTwo} Days`;

            // Impact numbers simulation
            const cash = document.getElementById('impact-cash');
            const reduction = document.getElementById('impact-dso');
            if (app.state.journey.strategy === 'fast') {
                cash.innerText = "40%"; reduction.innerText = "-14 Days";
            } else {
                cash.innerText = "25%"; reduction.innerText = "-7 Days";
            }
            
            // Calc Total Cycle
            let total = 0;
            if (app.state.journey.length === 'short') {
                total = app.state.journey.startDay + app.state.journey.intervalOne; 
            } else {
                total = app.state.journey.startDay + app.state.journey.intervalOne + app.state.journey.intervalTwo;
            }
            
            document.getElementById('total-cycle-days').innerText = `${total} Days`;
        }
    },

    control: {
        renderSummary: () => {
            // Summary logic remains the same, or can be removed if specific summary div is removed from Step 4 HTML
            // For this version, we removed the big summary card in Step 4 HTML to focus on the checklist
        },

        refresh: () => {
            // Check Status of Steps
            const softwareDone = app.state.userSoftware.name !== '';
            
            // Loose check for demo purposes (field length > 5)
            const ibanVal = document.getElementById('inp-iban') ? document.getElementById('inp-iban').value : '';
            const financialsDone = ibanVal.length > 5; 
            
            const journeyDone = true; // Defaults are pre-loaded
            const stripeDone = app.state.stripeConnected;

            // Calculate Percentage
            let completedSteps = 0;
            if (softwareDone) completedSteps++;
            if (financialsDone) completedSteps++;
            if (journeyDone) completedSteps++; // Journey is always "ready" due to defaults
            if (stripeDone) completedSteps++;

            const totalSteps = 4;
            const percent = Math.round((completedSteps / totalSteps) * 100);

            // Update Gauge
            const percentDisplay = document.getElementById('overview-percent');
            if(percentDisplay) {
                // simple counter animation
                let start = parseInt(percentDisplay.innerText);
                percentDisplay.innerText = `${percent}%`;
                
                // Color coding
                if(percent === 100) percentDisplay.classList.add('text-green-600');
            }

            // Update Checklist Visuals
            app.control.updateChecklistItem('check-step-1', softwareDone);
            app.control.updateChecklistItem('check-step-2', financialsDone);
            app.control.updateChecklistItem('check-step-3', journeyDone);
            
            // Stripe Item Handling
            const stripeItem = document.getElementById('check-step-stripe');
            if(stripeItem) {
                const badge = stripeItem.querySelector('.status-badge');
                const icon = stripeItem.querySelector('.status-icon');
                if (stripeDone) {
                    stripeItem.classList.add('border-green-100', 'bg-green-50/30');
                    icon.innerHTML = '<i class="ph ph-check-circle-fill text-2xl text-green-500"></i>';
                    badge.className = "status-badge text-[10px] font-bold bg-green-100 text-green-600 px-3 py-1 rounded-full uppercase tracking-wide";
                    badge.innerText = "CONNECTED";
                }
            }

            // Enable Launch Button if Core Requirements (1, 2, 3) are met. Stripe is optional but counts for 100%.
            const coreReady = softwareDone && financialsDone && journeyDone;
            const launchBtn = document.querySelector('#btn-go-live');
            const launchIcon = document.getElementById('launch-ready-icon');

            if (coreReady) {
                launchBtn.disabled = false;
                launchBtn.classList.remove('bg-slate-100', 'text-slate-400', 'cursor-not-allowed', 'shadow-none', 'scale-100');
                launchBtn.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700', 'hover:scale-[1.02]', 'shadow-xl', 'shadow-blue-200');
                launchBtn.innerHTML = '<span>Generate First Batch</span> <i class="ph ph-rocket-launch"></i>';
                
                if(launchIcon) launchIcon.classList.remove('hidden');
            }
        },

        updateChecklistItem: (id, done) => {
            const item = document.getElementById(id);
            if (!item) return;
            const icon = item.querySelector('.status-icon');
            const badge = item.querySelector('.status-badge');
            
            if (done) {
                icon.innerHTML = '<i class="ph ph-check-circle-fill text-2xl text-green-500"></i>';
                item.classList.add('border-green-100', 'bg-green-50/30');
                item.classList.remove('hover:border-blue-400');
                
                badge.innerText = "READY";
                badge.className = "status-badge text-[10px] font-bold bg-green-100 text-green-600 px-3 py-1 rounded-full uppercase tracking-wide";
            }
        },

        toggleSafetyLock: () => {
            // Logic only affects internal state or message, button availability is determined by data readiness
            // For this demo, toggling safety lock doesn't disable the button, 
            // but in a real app it would change the API call payload (mode: 'draft' vs 'live').
            
            /* Visual feedback if needed:
            const locked = document.getElementById('safety-lock').checked;
            const btn = document.querySelector('#btn-go-live');
            if(btn && !btn.disabled) {
                if(locked) btn.innerHTML = '<span>Generate Draft Batch</span> <i class="ph ph-file-text"></i>';
                else btn.innerHTML = '<span>Start Collection</span> <i class="ph ph-paper-plane-right"></i>';
            }
            */
        },

        goLive: () => {
            document.getElementById('victory-modal').classList.remove('hidden');
        }
    },

    demo: {
        fastTrack: () => {
            // Skips to the end for dev
            app.state.userSoftware = { name: 'Exact Online', type: 'supported', mode: 'direct', color: 'bg-red-600', logo: 'EO' };
            const fields = {
                'reg-fname': 'John', 'reg-lname': 'Doe', 'inp-reg-email': 'john@demo.com',
                'inp-org': 'Demo Corp B.V.', 'inp-iban': 'NL99 DEMO 0123 4567 89'
            };
            for (const [k, v] of Object.entries(fields)) {
                const el = document.getElementById(k);
                if(el) el.value = v;
            }
            app.nav.goToStep(4);
        },
        autoFillDemoData: () => {
            const fields = {
                'reg-fname': 'Sarah', 'reg-lname': 'Connor', 'inp-reg-email': 'sarah@skynet.com',
                'inp-org': 'Cyberdyne Systems B.V.', 'inp-coc': '99887766', 'inp-iban': 'NL22 RABO 0123 4567 89'
            };
             for (const [k, v] of Object.entries(fields)) {
                const el = document.getElementById(k);
                if(el) el.value = v;
            }
            app.state.userSoftware = { name: 'Exact Online', type: 'supported', mode: 'direct', color: 'bg-red-600', logo: 'EO' };
            
            // Re-render
            app.control.renderSummary();
            app.control.refresh();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());