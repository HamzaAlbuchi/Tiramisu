/**
 * AI Debate Arena — vanilla JS
 * Calls POST /api/debate/run { topic, exchanges }. Settings (style, typing) are UI-only until backend supports them.
 */

(function () {
    'use strict';

    const API_DEBATE = '/api/debate/run';

    const els = {
        topic: document.getElementById('topic'),
        btnStart: document.getElementById('btnStart'),
        btnSettings: document.getElementById('btnSettings'),
        settingsPanel: document.getElementById('settingsPanel'),
        stylePills: document.querySelectorAll('[data-style-pill]'),
        roundsSlider: document.getElementById('roundsSlider'),
        roundsValue: document.getElementById('roundsValue'),
        typingToggle: document.getElementById('typingToggle'),
        debateArena: document.getElementById('debateArena'),
        turnIndicator: document.getElementById('turnIndicator'),
        typingIndicator: document.getElementById('typingIndicator'),
        typingAgent: document.getElementById('typingAgent'),
        transcript: document.getElementById('transcript'),
        btnReplay: document.getElementById('btnReplay'),
        btnReset: document.getElementById('btnReset'),
        btnCopy: document.getElementById('btnCopy'),
        copyFormat: document.getElementById('copyFormat'),
        judgePanel: document.getElementById('judgePanel'),
        verdictHero: document.getElementById('verdictHero'),
        verdictWinner: document.getElementById('verdictWinner'),
        verdictSub: document.getElementById('verdictSub'),
        barRisk: document.getElementById('barRisk'),
        barRiskPct: document.getElementById('barRiskPct'),
        barAcc: document.getElementById('barAcc'),
        barAccPct: document.getElementById('barAccPct'),
        reasoningSummary: document.getElementById('reasoningSummary'),
        reasoningHalluc: document.getElementById('reasoningHalluc'),
        reasoningAcc: document.getElementById('reasoningAcc'),
        error: document.getElementById('appError'),
        confettiLayer: document.getElementById('confettiLayer'),
    };

    let debateStyle = 'formal';
    /** @type {object | null} Last API result for replay / copy */
    let lastDebateResult = null;
    let isRunning = false;

    function setError(msg) {
        if (!els.error) return;
        if (msg) {
            els.error.textContent = msg;
            els.error.classList.add('is-visible');
        } else {
            els.error.textContent = '';
            els.error.classList.remove('is-visible');
        }
    }

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Shows typing row with animated dots; returns Promise resolved when "done" (caller awaits delay).
     * @param {string} agentName e.g. "Agent A"
     * @param {number} minMs minimum display time
     * @returns {Promise<void>}
     */
    function simulateTyping(agentName, minMs) {
        return new Promise(function (resolve) {
            if (!els.typingIndicator || !els.typingAgent) {
                resolve();
                return;
            }
            els.typingAgent.textContent = agentName + ' is thinking';
            els.typingIndicator.classList.add('is-visible');
            const ms = prefersReducedMotion() ? 0 : minMs;
            setTimeout(function () {
                els.typingIndicator.classList.remove('is-visible');
                resolve();
            }, ms);
        });
    }

    /**
     * @param {HTMLElement} element message root .msg
     */
    function animateMessageEntry(element) {
        if (!element) return;
        requestAnimationFrame(function () {
            element.classList.add('is-visible');
        });
    }

    function showJudgeWithAnimation() {
        if (!els.judgePanel) return;
        els.judgePanel.classList.remove('is-visible');
        void els.judgePanel.offsetHeight;
        setTimeout(function () {
            els.judgePanel.classList.add('is-visible');
        }, prefersReducedMotion() ? 0 : 280);
    }

    function animateScoreBars(risk, acc) {
        const r = Math.round((risk || 0) * 100);
        const a = Math.round((acc || 0) * 100);
        if (els.barRiskPct) els.barRiskPct.textContent = r + '%';
        if (els.barAccPct) els.barAccPct.textContent = a + '%';
        if (els.barRisk) {
            els.barRisk.style.width = '0%';
            requestAnimationFrame(function () {
                els.barRisk.style.width = r + '%';
            });
        }
        if (els.barAcc) {
            els.barAcc.style.width = '0%';
            requestAnimationFrame(function () {
                els.barAcc.style.width = a + '%';
            });
        }
    }

    function speakerIsB(speaker) {
        return (speaker || '') === 'Model B';
    }

    function buildMessageEl(ex, index) {
        const isB = speakerIsB(ex.speaker);
        const wrap = document.createElement('div');
        wrap.className = 'msg ' + (isB ? 'msg--b' : 'msg--a');
        wrap.dataset.index = String(index);

        const av = document.createElement('div');
        av.className = 'msg__avatar';
        av.textContent = isB ? 'B' : 'A';

        const bubble = document.createElement('div');
        bubble.className = 'msg__bubble';

        const badge = document.createElement('div');
        badge.className = 'msg__badge';
        badge.textContent = isB ? 'Agent B · Against' : 'Agent A · Pro';

        const text = document.createElement('div');
        text.className = 'msg__text';
        text.textContent = ex.text || '';

        bubble.appendChild(badge);
        bubble.appendChild(text);
        wrap.appendChild(av);
        wrap.appendChild(bubble);
        return wrap;
    }

    function updateTurnIndicator(round, total, speakerLabel, responding) {
        if (!els.turnIndicator) return;
        els.turnIndicator.classList.toggle('is-live', !!responding);
        if (responding) {
            els.turnIndicator.textContent =
                'Round ' + round + ' · ' + speakerLabel + ' responding...';
        } else {
            els.turnIndicator.textContent =
                total > 0 ? 'Debate complete · ' + total + ' exchanges' : 'Waiting to start...';
        }
    }

    function applyMomentumHighlight(transcriptEl, momentumIndex) {
        if (!transcriptEl || momentumIndex < 0) return;
        const nodes = transcriptEl.querySelectorAll('.msg');
        const node = nodes[momentumIndex];
        if (node) {
            node.classList.add('is-momentum');
            setTimeout(function () {
                node.classList.remove('is-momentum');
            }, 1200);
        }
    }

    function pickWinner(exchanges) {
        let lenA = 0;
        let lenB = 0;
        (exchanges || []).forEach(function (ex) {
            const n = (ex.text || '').length;
            if (speakerIsB(ex.speaker)) lenB += n;
            else lenA += n;
        });
        if (lenA > lenB) return 'A';
        if (lenB > lenA) return 'B';
        return Math.random() < 0.5 ? 'A' : 'B';
    }

    function renderVerdict(data, winner) {
        const v = data.verdict || {};
        const risk = typeof v.hallucinationRiskScore === 'number' ? v.hallucinationRiskScore : 0;
        const acc = typeof v.accuracySignalScore === 'number' ? v.accuracySignalScore : 0;

        if (els.verdictHero) {
            els.verdictHero.classList.remove('verdict-hero--a', 'verdict-hero--b');
            els.verdictHero.classList.add(winner === 'B' ? 'verdict-hero--b' : 'verdict-hero--a');
        }
        if (els.verdictWinner) {
            els.verdictWinner.textContent =
                winner === 'B' ? 'Agent B Wins' : 'Agent A Wins';
        }
        if (els.verdictSub) {
            els.verdictSub.textContent =
                'By discourse strength (length heuristic). Judge metrics below.';
        }
        if (els.reasoningSummary) els.reasoningSummary.textContent = v.summary || '—';
        if (els.reasoningHalluc) els.reasoningHalluc.textContent = v.hallucinationBias || '—';
        if (els.reasoningAcc) els.reasoningAcc.textContent = v.accuracyAssessment || '—';

        setTimeout(function () {
            animateScoreBars(risk, acc);
        }, prefersReducedMotion() ? 0 : 400);
    }

    function triggerConfetti() {
        if (!els.confettiLayer || prefersReducedMotion()) return;
        els.confettiLayer.innerHTML = '';
        const colors = ['#38bdf8', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'];
        const n = 36;
        for (let i = 0; i < n; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-piece';
            p.style.left = Math.random() * 100 + '%';
            p.style.background = colors[i % colors.length];
            p.style.animationDuration = 2 + Math.random() * 2 + 's';
            p.style.animationDelay = Math.random() * 0.3 + 's';
            els.confettiLayer.appendChild(p);
        }
        setTimeout(function () {
            els.confettiLayer.innerHTML = '';
        }, 4500);
    }

    /**
     * Sequentially reveal messages with optional typing simulation.
     * @param {object} data API result
     * @param {boolean} useTyping
     * @returns {Promise<void>}
     */
    async function playDebateSequence(data, useTyping) {
        const list = data.exchanges || [];
        els.transcript.innerHTML = '';
        const total = list.length;

        for (let i = 0; i < list.length; i++) {
            const ex = list[i];
            const round = Math.floor(i / 2) + 1;
            const isB = speakerIsB(ex.speaker);
            const label = isB ? 'Agent B' : 'Agent A';

            updateTurnIndicator(round, total, label, true);

            if (useTyping) {
                await simulateTyping(label, 650 + Math.random() * 400);
            }

            const msgEl = buildMessageEl(ex, i);
            els.transcript.appendChild(msgEl);
            animateMessageEntry(msgEl);

            const delay = prefersReducedMotion() ? 0 : 320;
            await new Promise(function (r) {
                setTimeout(r, delay);
            });

            /* Momentum: after each full round (pair), highlight longer message or random tiebreak */
            if (i % 2 === 1) {
                const lenA = (list[i - 1].text || '').length;
                const lenB = (list[i].text || '').length;
                let idx = i - 1;
                if (lenB > lenA) idx = i;
                else if (lenB === lenA && Math.random() < 0.5) idx = i;
                applyMomentumHighlight(els.transcript, idx);
            }
        }

        updateTurnIndicator(0, total, '', false);
        if (els.turnIndicator) {
            els.turnIndicator.textContent = 'Debate complete · ' + total + ' exchanges';
        }
    }

    async function runDebate() {
        if (isRunning) return;
        setError('');
        const topic = els.topic.value.trim();
        const exchanges = Math.max(
            2,
            Math.min(24, parseInt(els.roundsSlider && els.roundsSlider.value, 10) || 6)
        );

        isRunning = true;
        els.btnStart.disabled = true;
        els.debateArena.classList.remove('is-idle');
        els.judgePanel.classList.remove('is-visible');
        els.transcript.innerHTML = '';
        if (els.turnIndicator) {
            els.turnIndicator.textContent = 'Contacting arena...';
            els.turnIndicator.classList.add('is-live');
        }

        try {
            const res = await fetch(API_DEBATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topic,
                    exchanges: exchanges,
                    debateStyle: debateStyle,
                }),
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            lastDebateResult = data;

            const useTyping = els.typingToggle && els.typingToggle.checked;
            await playDebateSequence(data, useTyping);

            const winner = pickWinner(data.exchanges);
            renderVerdict(data, winner);
            showJudgeWithAnimation();
            setTimeout(triggerConfetti, prefersReducedMotion() ? 0 : 500);
            if (els.btnReplay) els.btnReplay.disabled = false;
        } catch (e) {
            console.error(e);
            setError('Could not run debate. Is the server running?');
            els.debateArena.classList.add('is-idle');
            if (els.turnIndicator) {
                els.turnIndicator.textContent = 'Waiting to start...';
                els.turnIndicator.classList.remove('is-live');
            }
        } finally {
            isRunning = false;
            els.btnStart.disabled = false;
        }
    }

    async function replayDebate() {
        if (!lastDebateResult || isRunning) return;
        isRunning = true;
        els.btnStart.disabled = true;
        setError('');
        try {
            els.judgePanel.classList.remove('is-visible');
            const useTyping = els.typingToggle && els.typingToggle.checked;
            await playDebateSequence(lastDebateResult, useTyping);
            const winner = pickWinner(lastDebateResult.exchanges);
            renderVerdict(lastDebateResult, winner);
            showJudgeWithAnimation();
            setTimeout(triggerConfetti, prefersReducedMotion() ? 0 : 400);
        } finally {
            isRunning = false;
            els.btnStart.disabled = false;
        }
    }

    function resetArena() {
        lastDebateResult = null;
        isRunning = false;
        els.btnStart.disabled = false;
        if (els.btnReplay) els.btnReplay.disabled = true;
        els.transcript.innerHTML = '';
        els.judgePanel.classList.remove('is-visible');
        els.debateArena.classList.add('is-idle');
        if (els.turnIndicator) {
            els.turnIndicator.textContent = 'Waiting to start...';
            els.turnIndicator.classList.remove('is-live');
        }
        if (els.barRisk) els.barRisk.style.width = '0%';
        if (els.barAcc) els.barAcc.style.width = '0%';
        if (els.barRiskPct) els.barRiskPct.textContent = '0%';
        if (els.barAccPct) els.barAccPct.textContent = '0%';
        setError('');
        if (els.confettiLayer) els.confettiLayer.innerHTML = '';
    }

    function copyToClipboard() {
        if (!lastDebateResult) {
            setError('Nothing to copy yet. Run a debate first.');
            return;
        }
        const textSummary = formatDebateAsText(lastDebateResult);
        const asJson = els.copyFormat && els.copyFormat.value === 'json';
        const payload = asJson ? JSON.stringify(lastDebateResult, null, 2) : textSummary;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(payload).then(
                function () {
                    setError('');
                    const t = els.btnCopy.textContent || 'Copy debate';
                    els.btnCopy.textContent = 'Copied!';
                    setTimeout(function () {
                        els.btnCopy.textContent = t;
                    }, 2000);
                },
                function () {
                    fallbackCopy(payload);
                }
            );
        } else {
            fallbackCopy(payload);
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            els.btnCopy.textContent = 'Copied!';
            setTimeout(function () {
                els.btnCopy.textContent = 'Copy debate';
            }, 2000);
        } catch (err) {
            setError('Copy failed. Select and copy manually.');
        }
        document.body.removeChild(ta);
    }

    function formatDebateAsText(data) {
        let s = 'AI Debate Arena — Transcript\n';
        s += 'Topic: ' + (data.topic || '') + '\n\n';
        (data.exchanges || []).forEach(function (ex, i) {
            s += '[' + (i + 1) + '] ' + (ex.speaker || '') + ': ' + (ex.text || '') + '\n\n';
        });
        const v = data.verdict || {};
        s += '--- Judge ---\n';
        s += (v.summary || '') + '\n\n';
        s += 'Hallucination bias: ' + (v.hallucinationBias || '') + '\n\n';
        s += 'Accuracy: ' + (v.accuracyAssessment || '') + '\n';
        return s;
    }

    /* Settings UI */
    if (els.btnSettings && els.settingsPanel) {
        els.btnSettings.addEventListener('click', function () {
            const open = !els.settingsPanel.classList.contains('is-open');
            els.settingsPanel.classList.toggle('is-open', open);
            els.btnSettings.setAttribute('aria-expanded', open ? 'true' : 'false');
            els.settingsPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
        });
    }

    els.stylePills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            debateStyle = pill.getAttribute('data-style-pill') || 'formal';
            els.stylePills.forEach(function (p) {
                p.classList.toggle('is-active', p === pill);
            });
        });
    });

    if (els.roundsSlider && els.roundsValue) {
        els.roundsSlider.addEventListener('input', function () {
            els.roundsValue.textContent = els.roundsSlider.value;
        });
        els.roundsValue.textContent = els.roundsSlider.value;
    }

    els.btnStart.addEventListener('click', runDebate);
    if (els.btnReplay) els.btnReplay.addEventListener('click', replayDebate);
    if (els.btnReset) els.btnReset.addEventListener('click', resetArena);
    if (els.btnCopy) els.btnCopy.addEventListener('click', copyToClipboard);

    /* Export named functions for debugging / extension */
    window.DebateArena = {
        simulateTyping: simulateTyping,
        animateMessageEntry: animateMessageEntry,
        showJudgeWithAnimation: showJudgeWithAnimation,
        replayDebate: replayDebate,
        copyToClipboard: copyToClipboard,
    };
})();
