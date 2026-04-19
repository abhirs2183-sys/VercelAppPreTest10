// Snowflake generation
function createSnowflakes() {
    const snowContainer = document.getElementById('snow');
    if (!snowContainer) return;
    
    const snowflakeChars = ['❄', '❅', '❆', '✻', '✼'];
    const count = 30;
    const snowflakes = [];
    
    for (let i = 0; i < count; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];
        const left = Math.random() * 100;
        snowflake.style.left = left + 'vw';
        snowflake.style.animationDuration = (Math.random() * 10 + 10) + 's';
        snowflake.style.animationDelay = (Math.random() * 20) + 's';
        snowflake.style.fontSize = (Math.random() * 1 + 0.5) + 'em';
        snowContainer.appendChild(snowflake);
        snowflakes.push({ element: snowflake, originalLeft: left });
    }

    // Mouse reaction: Point 4
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth * 100;
        snowflakes.forEach(s => {
            const dist = mouseX - s.originalLeft;
            if (Math.abs(dist) < 15) {
                const shift = dist > 0 ? -2 : 2;
                s.element.style.left = (s.originalLeft + shift) + 'vw';
            } else {
                s.element.style.left = s.originalLeft + 'vw';
            }
        });
    });
}

// Modal handling: Point 5
function showNewYearModal() {
    if (localStorage.getItem('newYearGreetingShown')) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="greeting-modal">
            <h2>Happy New Year!</h2>
            <p>Goodbye 2025, Hello 2026! We wish you a prosperous and productive year ahead. Thank you for being a part of yDatafix.</p>
            <button class="close-modal">Get Started</button>
        </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => modal.classList.add('active'), 100);

    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
        localStorage.setItem('newYearGreetingShown', 'true');
    });
}

// Typing Animation Logic
function initTypingAnimation() {
    const element = document.getElementById('typing-text');
    if (!element) return;

    const phrases = [
        'SQL Datafix<br><span class="cyan">Package Maker</span>',
        'Happy New Year<br><span class="cyan">2026</span>'
    ];
    
    let phraseIndex = 0;
    let isDeleting = false;
    let text = '';
    let typeSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            const plainText = currentPhrase.replace(/<[^>]*>/g, '');
            if (text.length > 0) {
                text = plainText.substring(0, text.length - 1);
                element.innerHTML = text + '<span class="cursor">|</span>';
                typeSpeed = 50;
            } else {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typeSpeed = 200;
            }
        } else {
            const targetPlainText = currentPhrase.replace(/<[^>]*>/g, '');
            if (text.length < targetPlainText.length) {
                text = targetPlainText.substring(0, text.length + 1);
                
                let htmlOutput = '';
                let plainCounter = 0;
                let inTag = false;
                
                for(let i=0; i < currentPhrase.length; i++) {
                    if (currentPhrase[i] === '<') inTag = true;
                    if (inTag) {
                        htmlOutput += currentPhrase[i];
                        if (currentPhrase[i] === '>') inTag = false;
                    } else {
                        if (plainCounter < text.length) {
                            htmlOutput += currentPhrase[i];
                            plainCounter++;
                        } else {
                            break;
                        }
                    }
                }
                
                element.innerHTML = htmlOutput + '<span class="cursor">|</span>';
                typeSpeed = 100;
            } else {
                typeSpeed = 2000;
                isDeleting = true;
            }
        }
        
        setTimeout(type, typeSpeed);
    }

    type();
}

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const inputForm = document.getElementById('inputForm');
    const generateBtn = document.getElementById('generateBtn');
    const processing = document.getElementById('processing');
    const result = document.getElementById('result');
    const error = document.getElementById('error');
    const resultFilename = document.getElementById('resultFilename');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const feedbackText = document.getElementById('feedbackText');
    const submitFeedback = document.getElementById('submitFeedback');
    const feedbackSuccess = document.getElementById('feedbackSuccess');

    let generatedContent = '';
    let generatedFilename = '';

    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.className = savedTheme + '-mode';
    updateThemeIcon();

    themeToggle.addEventListener('click', function() {
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        }
        updateThemeIcon();
    });

    function updateThemeIcon() {
        const icon = themeToggle.querySelector('i');
        if (body.classList.contains('dark-mode')) {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    }

    generateBtn.addEventListener('click', function() {
        const payload = {
            created_by: document.getElementById('createdBy').value,
            case_id: document.getElementById('caseId').value,
            client_pin: document.getElementById('clientPin').value,
            client_name: document.getElementById('clientName').value,
            db_username: document.getElementById('dbUsername').value,
            db_password: document.getElementById('dbPassword').value,
            db_server: document.getElementById('dbServer').value,
            db_name: document.getElementById('dbName').value,
            sql_queries: document.getElementById('sqlQueries').value
        };

        inputForm.style.display = 'none';
        result.style.display = 'none';
        error.style.display = 'none';
        processing.style.display = 'block';

        const uploadSection = document.getElementById('upload-section');
        if (uploadSection) {
            setTimeout(() => {
                uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 60);
        }

        fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            processing.style.display = 'none';
            if (data.error) {
                showError(data.error);
                inputForm.style.display = 'block';
                return;
            }
            generatedContent = data.content;
            generatedFilename = data.filename;
            resultFilename.textContent = data.filename;
            result.style.display = 'block';
            if (smartPasteToggle) smartPasteToggle.style.display = 'none';
            if (smartPastePanel) { smartPastePanel.classList.remove('open'); smartPasteToggle && smartPasteToggle.classList.remove('active'); }
        })
        .catch(err => {
            processing.style.display = 'none';
            showError('An error occurred while generating the package');
            inputForm.style.display = 'block';
            console.error(err);
        });
    });

    function showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        error.style.display = 'flex';
    }

    downloadBtn.addEventListener('click', function() {
        const blob = new Blob([generatedContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = generatedFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const validationMessage = document.getElementById('validationMessage');
        if (validationMessage) {
            validationMessage.style.display = 'flex';
            setTimeout(() => {
                validationMessage.style.display = 'none';
            }, 5000);
        }
    });

    resetBtn.addEventListener('click', function() {
        result.style.display = 'none';
        error.style.display = 'none';
        inputForm.style.display = 'block';
        if (smartPasteToggle) smartPasteToggle.style.display = '';
        generatedContent = '';
        generatedFilename = '';
        const validationMessage = document.getElementById('validationMessage');
        if (validationMessage) {
            validationMessage.style.display = 'none';
        }
    });

    submitFeedback.addEventListener('click', function() {
        const feedback = feedbackText.value.trim();
        
        if (!feedback) {
            return;
        }

        submitFeedback.disabled = true;
        submitFeedback.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        fetch('/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ feedback: feedback })
        })
        .then(response => response.json())
        .then(data => {
            submitFeedback.disabled = false;
            submitFeedback.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';

            if (data.success) {
                feedbackText.value = '';
                feedbackSuccess.style.display = 'flex';
                setTimeout(() => {
                    feedbackSuccess.style.display = 'none';
                }, 3000);
            }
        })
        .catch(err => {
            submitFeedback.disabled = false;
            submitFeedback.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';
            console.error(err);
        });
    });

    const uploadSection = document.getElementById('upload-section');
    const stcLogoState = document.getElementById('stcLogoState');
    const stcTextState = document.getElementById('stcTextState');
    const stcTyped = document.getElementById('stcTyped');
    const stcCursor = document.getElementById('stcCursor');

    const stcTypedPkg = document.getElementById('stcTypedPkg');
    let typingTimeout = null;
    let isTyped = false;
    const part1 = 'Create Your ';
    const part2 = 'Package';

    function typeText() {
        if (isTyped) return;
        stcLogoState.classList.add('hidden');
        stcTextState.classList.add('visible');
        stcTyped.textContent = '';
        stcTypedPkg.textContent = '';
        stcCursor.style.display = 'inline';
        let i = 0;
        function step() {
            if (i < part1.length) {
                stcTyped.textContent += part1[i];
                i++;
                typingTimeout = setTimeout(step, 60);
            } else {
                let j = 0;
                function step2() {
                    if (j < part2.length) {
                        stcTypedPkg.textContent += part2[j];
                        j++;
                        typingTimeout = setTimeout(step2, 60);
                    } else {
                        isTyped = true;
                        stcCursor.style.display = 'none';
                    }
                }
                step2();
            }
        }
        step();
    }

    function revertText() {
        clearTimeout(typingTimeout);
        isTyped = false;
        stcTextState.classList.remove('visible');
        stcTyped.textContent = '';
        if (stcTypedPkg) stcTypedPkg.textContent = '';
        stcCursor.style.display = 'inline';
        stcLogoState.classList.remove('hidden');
    }

    if (uploadSection && stcLogoState) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeText();
                } else {
                    revertText();
                }
            });
        }, { threshold: 0.2 });
        observer.observe(uploadSection);
    }

    // ── Smart Paste ──────────────────────────────────────
    const smartPasteToggle = document.getElementById('smartPasteToggle');
    const smartPastePanel  = document.getElementById('smartPastePanel');
    const smartPasteInput  = document.getElementById('smartPasteInput');
    const smartFillBtn     = document.getElementById('smartFillBtn');
    const smartPasteMsg    = document.getElementById('smartPasteMessage');

    if (smartPasteToggle && smartPastePanel) {
        smartPasteToggle.addEventListener('click', () => {
            const open = smartPastePanel.classList.toggle('open');
            smartPasteToggle.classList.toggle('active', open);
            if (open) setTimeout(() => smartPasteInput.focus(), 80);
        });
    }

    function parseLabeledFormat(text) {
        const labelMap = {
            'client pin': 'clientPin',
            'client#':    'clientPin',
            'client name': 'clientName',
            'client':     'clientName',
            'user name':  'dbUsername',
            'username':   'dbUsername',
            'db username':'dbUsername',
            'password':   'dbPassword',
            'db password':'dbPassword',
            'db server':  'dbServer',
            'server':     'dbServer',
            'instance':   'dbServer',
            'db instance':'dbName',
            'db name':    'dbName',
            'case':       'caseId',
            'case #':     'caseId',
            'case number':'caseId',
            'created by': 'createdBy',
        };
        const result = {};
        text.split('\n').forEach(line => {
            const idx = line.indexOf(':');
            if (idx === -1) return;
            const key = line.slice(0, idx).trim().toLowerCase();
            const val = line.slice(idx + 1).trim();
            if (!val) return;
            const field = labelMap[key];
            if (field) result[field] = val;
        });
        return Object.keys(result).length ? result : null;
    }

    function parseTokenFormat(tokens) {
        if (tokens.length < 3) return null;
        const first  = tokens[0];
        const second = tokens[1];
        // 3-token: Case # (digits), Client PIN (digits), Client Name (rest)
        if (/^\d{5,}$/.test(first) && /^\d{5,}$/.test(second)) {
            return { caseId: first, clientPin: second, clientName: tokens.slice(2).join(' ') };
        }
        // 4-token: DB Username, Password, Server, DB Name
        if (tokens.length === 4) {
            return { dbUsername: first, dbPassword: second, dbServer: tokens[2], dbName: tokens[3] };
        }
        return null;
    }

    function applyParsed(data) {
        let filled = 0;
        Object.entries(data).forEach(([key, val]) => {
            const el = document.getElementById(key);
            if (el && val) { el.value = val; filled++; }
        });
        return filled;
    }

    function showMsg(text, type) {
        smartPasteMsg.textContent = text;
        smartPasteMsg.className = 'smart-paste-message ' + type;
        setTimeout(() => { smartPasteMsg.textContent = ''; smartPasteMsg.className = 'smart-paste-message'; }, 4000);
    }

    if (smartFillBtn) {
        smartFillBtn.addEventListener('click', () => {
            const raw = smartPasteInput.value.trim();
            if (!raw) { showMsg('Nothing to parse — paste your data first.', 'error'); return; }

            let parsed = null;
            // Detect labeled format: at least one "Word: value" line
            if (/^.+:.+/m.test(raw)) {
                parsed = parseLabeledFormat(raw);
            }
            // Fallback: token format — split by tab or 2+ spaces, or single spaces
            if (!parsed) {
                let tokens = raw.split(/\t+/).map(s => s.trim()).filter(Boolean);
                if (tokens.length < 3) tokens = raw.split(/\s+/).filter(Boolean);
                parsed = parseTokenFormat(tokens);
            }

            if (!parsed) {
                showMsg("Couldn't identify the format — check the hint below.", 'error');
                return;
            }
            const count = applyParsed(parsed);
            if (count) {
                showMsg(`Filled ${count} field${count > 1 ? 's' : ''} successfully.`, 'success');
                smartPasteInput.value = '';
            } else {
                showMsg("Parsed but no matching fields found.", 'error');
            }
        });
    }
    // ── End Smart Paste ───────────────────────────────────

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
