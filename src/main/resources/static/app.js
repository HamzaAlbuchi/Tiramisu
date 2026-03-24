/**
 * LLM Evaluation Dashboard — vanilla JS
 * Consumes POST /api/debate/run (DebateResult + DebateVerdict + EvaluationBreakdown).
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
        timelineWrap: document.getElementById('timelineWrap'),
        debateTimeline: document.getElementById('debateTimeline'),
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
        verdictType: document.getElementById('verdictType'),
        verdictConfidence: document.getElementById('verdictConfidence'),
        verdictSub: document.getElementById('verdictSub'),
        barRisk: document.getElementById('barRisk'),
        barRiskPct: document.getElementById('barRiskPct'),
        barAcc: document.getElementById('barAcc'),
        barAccPct: document.getElementById('barAccPct'),
        evalColA: document.getElementById('evalColA'),
        evalColB: document.getElementById('evalColB'),
        analysisGrid: document.getElementById('analysisGrid'),
        reasoningSummary: document.getElementById('reasoningSummary'),
        reasoningHalluc: document.getElementById('reasoningHalluc'),
        reasoningAcc: document.getElementById('reasoningAcc'),
        error: document.getElementById('appError'),
        confettiLayer: document.getElementById('confettiLayer'),
    };

    let debateStyle = 'formal';
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

    function exchangeIsB(ex) {
        if (ex.side === 'B') return true;
        if (ex.side === 'A') return false;
        return (ex.speaker || '') === 'Model B';
    }

    function getModelName(ex, data) {
        if (ex.modelName) return ex.modelName;
        return exchangeIsB(ex) ? (data.modelBName || 'Model B') : (data.modelAName || 'Model A');
    }

    function buildMessageEl(ex, index, data) {
        const isB = exchangeIsB(ex);
        const wrap = document.createElement('div');
        wrap.className = 'msg ' + (isB ? 'msg--b' : 'msg--a');
        wrap.dataset.index = String(index);

        const name = getModelName(ex, data);
        const role = ex.role || (isB ? 'Against' : 'Pro');
        const temp =
            typeof ex.temperature === 'number'
                ? ex.temperature
                : isB
                  ? data.modelBTemperature
                  : data.modelATemperature;

        const av = document.createElement('div');
        av.className = 'msg__avatar';
        av.textContent = (name || '?').charAt(0).toUpperCase();
        av.setAttribute('aria-hidden', 'true');

        const bubble = document.createElement('div');
        bubble.className = 'msg__bubble';

        const badge = document.createElement('div');
        badge.className = 'msg__badge';
        badge.textContent = name + ' • ' + role;

        const text = document.createElement('div');
        text.className = 'msg__text';
        text.textContent = ex.text || '';

        bubble.appendChild(badge);
        bubble.appendChild(text);
        if (typeof temp === 'number') {
            const meta = document.createElement('div');
            meta.className = 'msg__meta';
            meta.innerHTML = 'Temperature <code>' + temp.toFixed(2) + '</code>';
            bubble.appendChild(meta);
        }
        wrap.appendChild(av);
        wrap.appendChild(bubble);
        return wrap;
    }

    function buildTimeline(roundCount) {
        if (!els.debateTimeline || !els.timelineWrap) return;
        els.debateTimeline.innerHTML = '';
        for (let r = 1; r <= roundCount; r++) {
            const node = document.createElement('div');
            node.className = 'debate-timeline__node';
            node.dataset.round = String(r);
            node.setAttribute('role', 'listitem');
            const dot = document.createElement('div');
            dot.className = 'debate-timeline__dot';
            const cap = document.createElement('span');
            cap.className = 'debate-timeline__cap';
            cap.textContent = 'R' + r;
            node.appendChild(dot);
            node.appendChild(cap);
            els.debateTimeline.appendChild(node);
        }
        els.timelineWrap.hidden = roundCount < 1;
    }

    function updateTimelineState(currentRound, roundCount) {
        if (!els.debateTimeline) return;
        const nodes = els.debateTimeline.querySelectorAll('.debate-timeline__node');
        nodes.forEach(function (node, idx) {
            const r = idx + 1;
            node.classList.remove('is-done', 'is-active');
            if (r < currentRound) node.classList.add('is-done');
            else if (r === currentRound) node.classList.add('is-active');
        });
    }

    function finalizeTimeline(roundCount) {
        if (!els.debateTimeline) return;
        els.debateTimeline.querySelectorAll('.debate-timeline__node').forEach(function (node) {
            node.classList.remove('is-active');
            node.classList.add('is-done');
        });
    }

    function updateTurnIndicator(round, total, speakerLabel, responding) {
        if (!els.turnIndicator) return;
        els.turnIndicator.classList.toggle('is-live', !!responding);
        if (responding) {
            els.turnIndicator.textContent =
                'Round ' + round + ' · ' + speakerLabel + ' responding...';
        } else {
            els.turnIndicator.textContent =
                total > 0 ? 'Evaluation complete · ' + total + ' exchanges' : 'Waiting to start...';
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

    function pickWinnerKey(data) {
        const v = data.verdict || {};
        if (v.winnerKey === 'A' || v.winnerKey === 'B' || v.winnerKey === 'DRAW') {
            return v.winnerKey;
        }
        let lenA = 0;
        let lenB = 0;
        (data.exchanges || []).forEach(function (ex) {
            const n = (ex.text || '').length;
            if (exchangeIsB(ex)) lenB += n;
            else lenA += n;
        });
        if (lenA > lenB) return 'A';
        if (lenB > lenA) return 'B';
        return 'DRAW';
    }

    function formatVerdictType(vt) {
        if (!vt) return '—';
        if (vt === 'CLEAR_WIN') return 'Clear win';
        if (vt === 'SLIGHT_WIN') return 'Slight win';
        if (vt === 'DRAW') return 'Draw';
        return vt.replace(/_/g, ' ');
    }

    function renderEvaluationBreakdown(data) {
        const eb = data.evaluationBreakdown;
        if (!eb || !els.evalColA || !els.evalColB) return;

        const metrics = [
            { key: 'logicalConsistency', label: 'Logical consistency' },
            { key: 'argumentStrength', label: 'Argument strength' },
            { key: 'rebuttalQuality', label: 'Rebuttal quality' },
            { key: 'biasNeutrality', label: 'Bias / neutrality' },
            { key: 'clarity', label: 'Clarity' },
        ];

        function colHtml(scores, colClass) {
            if (!scores) return '';
            let h = '';
            metrics.forEach(function (m) {
                const val = typeof scores[m.key] === 'number' ? scores[m.key] : 0;
                const pct = Math.min(100, Math.max(0, (val / 10) * 100));
                h +=
                    '<div class="eval-metric">' +
                    '<div class="eval-metric__label"><span>' +
                    escapeHtml(m.label) +
                    '</span><span class="eval-metric__score">' +
                    val.toFixed(1) +
                    '</span></div>' +
                    '<div class="eval-metric__track"><div class="eval-metric__fill" style="width:0%" data-pct="' +
                    pct +
                    '"></div></div></div>';
            });
            return h;
        }

        const nameA = escapeHtml(data.modelAName || 'Model A');
        const nameB = escapeHtml(data.modelBName || 'Model B');
        els.evalColA.innerHTML =
            '<div class="eval-col__head">' + nameA + '</div>' + colHtml(eb.modelA, 'a');
        els.evalColB.innerHTML =
            '<div class="eval-col__head">' + nameB + '</div>' + colHtml(eb.modelB, 'b');

        requestAnimationFrame(function () {
            els.evalColA.querySelectorAll('.eval-metric__fill').forEach(function (fill) {
                fill.style.width = (fill.getAttribute('data-pct') || 0) + '%';
            });
            els.evalColB.querySelectorAll('.eval-metric__fill').forEach(function (fill) {
                fill.style.width = (fill.getAttribute('data-pct') || 0) + '%';
            });
        });
    }

    function escapeHtml(s) {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function renderJudgeAnalysis(data) {
        if (!els.analysisGrid) return;
        const ja = (data.verdict && data.verdict.judgeAnalysis) || {};
        const lists = [
            { title: 'Strengths · ' + (data.modelAName || 'A'), key: 'strengthsA', mod: '' },
            { title: 'Strengths · ' + (data.modelBName || 'B'), key: 'strengthsB', mod: ' analysis-card--b' },
            { title: 'Weaknesses · ' + (data.modelAName || 'A'), key: 'weaknessesA', mod: ' analysis-card--weak' },
            { title: 'Weaknesses · ' + (data.modelBName || 'B'), key: 'weaknessesB', mod: ' analysis-card--weak analysis-card--b' },
        ];
        let html = '';
        lists.forEach(function (block) {
            const arr = ja[block.key] || [];
            html +=
                '<div class="analysis-card' +
                block.mod +
                '"><h5>' +
                escapeHtml(block.title) +
                '</h5>';
            if (arr.length) {
                html += '<ul>';
                arr.forEach(function (line) {
                    html += '<li>' + escapeHtml(line) + '</li>';
                });
                html += '</ul>';
            } else {
                html += '<p style="margin:0;color:var(--text-muted);">—</p>';
            }
            html += '</div>';
        });
        html +=
            '<div class="analysis-card analysis-card--final"><h5>Final reasoning</h5><p>' +
            escapeHtml(ja.finalReasoning || '—') +
            '</p></div>';
        els.analysisGrid.innerHTML = html;
    }

    function renderVerdict(data) {
        const v = data.verdict || {};
        const risk = typeof v.hallucinationRiskScore === 'number' ? v.hallucinationRiskScore : 0;
        const acc = typeof v.accuracySignalScore === 'number' ? v.accuracySignalScore : 0;
        const winnerKey = pickWinnerKey(data);
        const nameA = data.modelAName || 'Agent A';
        const nameB = data.modelBName || 'Agent B';

        if (els.verdictHero) {
            els.verdictHero.classList.remove('verdict-hero--a', 'verdict-hero--b', 'verdict-hero--draw', 'is-settled');
            if (winnerKey === 'DRAW') els.verdictHero.classList.add('verdict-hero--draw');
            else if (winnerKey === 'B') els.verdictHero.classList.add('verdict-hero--b');
            else els.verdictHero.classList.add('verdict-hero--a');
            setTimeout(function () {
                els.verdictHero.classList.add('is-settled');
            }, 100);
        }

        if (els.verdictWinner) {
            if (winnerKey === 'DRAW') els.verdictWinner.textContent = 'Draw — no winner';
            else els.verdictWinner.textContent = (winnerKey === 'B' ? nameB : nameA) + ' wins';
        }
        if (els.verdictType) els.verdictType.textContent = formatVerdictType(v.verdictType);
        if (els.verdictConfidence) {
            const c = typeof v.confidence === 'number' ? v.confidence : 0;
            els.verdictConfidence.textContent = Math.round(c * 100) + '% confidence';
        }
        if (els.verdictSub) {
            els.verdictSub.textContent =
                v.summary || 'See rubric breakdown and analysis below.';
        }
        if (els.reasoningSummary) els.reasoningSummary.textContent = v.summary || '—';
        if (els.reasoningHalluc) els.reasoningHalluc.textContent = v.hallucinationBias || '—';
        if (els.reasoningAcc) els.reasoningAcc.textContent = v.accuracyAssessment || '—';

        renderEvaluationBreakdown(data);
        renderJudgeAnalysis(data);

        setTimeout(function () {
            animateScoreBars(risk, acc);
        }, prefersReducedMotion() ? 0 : 400);
    }

    function triggerConfetti() {
        if (!els.confettiLayer || prefersReducedMotion()) return;
        els.confettiLayer.innerHTML = '';
        const colors = ['#38bdf8', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'];
        for (let i = 0; i < 36; i++) {
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

    async function playDebateSequence(data, useTyping) {
        const list = data.exchanges || [];
        els.transcript.innerHTML = '';
        const total = list.length;
        const roundCount = total === 0 ? 0 : Math.ceil(total / 2);
        buildTimeline(roundCount);

        for (let i = 0; i < list.length; i++) {
            const ex = list[i];
            const round = Math.floor(i / 2) + 1;
            const isB = exchangeIsB(ex);
            const label = getModelName(ex, data);

            updateTimelineState(round, roundCount);
            updateTurnIndicator(round, total, label, true);

            if (useTyping) {
                await simulateTyping(label, 650 + Math.random() * 400);
            }

            const msgEl = buildMessageEl(ex, i, data);
            els.transcript.appendChild(msgEl);
            animateMessageEntry(msgEl);

            const delay = prefersReducedMotion() ? 0 : 320;
            await new Promise(function (r) {
                setTimeout(r, delay);
            });

            if (i % 2 === 1) {
                const lenA = (list[i - 1].text || '').length;
                const lenB = (list[i].text || '').length;
                let idx = i - 1;
                if (lenB > lenA) idx = i;
                else if (lenB === lenA && Math.random() < 0.5) idx = i;
                applyMomentumHighlight(els.transcript, idx);
            }
        }

        finalizeTimeline(roundCount);
        updateTurnIndicator(0, total, '', false);
        if (els.turnIndicator) {
            els.turnIndicator.textContent = 'Evaluation complete · ' + total + ' exchanges';
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
        if (els.timelineWrap) els.timelineWrap.hidden = true;
        if (els.turnIndicator) {
            els.turnIndicator.textContent = 'Running evaluation…';
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

            renderVerdict(data);
            showJudgeWithAnimation();
            const w = pickWinnerKey(data);
            if (w !== 'DRAW') {
                setTimeout(triggerConfetti, prefersReducedMotion() ? 0 : 500);
            }
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
            renderVerdict(lastDebateResult);
            showJudgeWithAnimation();
            const w = pickWinnerKey(lastDebateResult);
            if (w !== 'DRAW') {
                setTimeout(triggerConfetti, prefersReducedMotion() ? 0 : 400);
            }
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
        if (els.debateTimeline) els.debateTimeline.innerHTML = '';
        if (els.timelineWrap) els.timelineWrap.hidden = true;
        if (els.analysisGrid) els.analysisGrid.innerHTML = '';
        if (els.evalColA) els.evalColA.innerHTML = '';
        if (els.evalColB) els.evalColB.innerHTML = '';
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
        if (els.verdictWinner) els.verdictWinner.textContent = '—';
        if (els.verdictType) els.verdictType.textContent = '—';
        if (els.verdictConfidence) els.verdictConfidence.textContent = '—';
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
        let s = 'LLM Evaluation Dashboard — Transcript\n';
        s += 'Topic: ' + (data.topic || '') + '\n';
        s += 'Models: ' + (data.modelAName || '') + ' vs ' + (data.modelBName || '') + '\n\n';
        (data.exchanges || []).forEach(function (ex, i) {
            const who = ex.modelName || ex.speaker || '';
            s += '[' + (i + 1) + '] ' + who + ' (' + (ex.role || '') + '): ' + (ex.text || '') + '\n\n';
        });
        const v = data.verdict || {};
        s += '--- Judge ---\n';
        s += 'Winner: ' + (v.winnerKey || '') + ' | Type: ' + (v.verdictType || '') + '\n';
        s += 'Confidence: ' + (typeof v.confidence === 'number' ? Math.round(v.confidence * 100) + '%' : '') + '\n';
        s += (v.summary || '') + '\n\n';
        s += 'Hallucination: ' + (v.hallucinationBias || '') + '\n\n';
        s += 'Accuracy: ' + (v.accuracyAssessment || '') + '\n';
        return s;
    }

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

    window.DebateArena = {
        simulateTyping: simulateTyping,
        animateMessageEntry: animateMessageEntry,
        showJudgeWithAnimation: showJudgeWithAnimation,
        replayDebate: replayDebate,
        copyToClipboard: copyToClipboard,
    };
})();
