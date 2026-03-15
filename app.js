(function () {
  const DEMO_LOOP = "Dm7 | G7 | Cmaj7 | A7";
  const STORAGE_KEY = "harmonic-orbit-mvp-session";
  const NOTES = {
    C: 60,
    "C#": 61,
    Db: 61,
    D: 62,
    "D#": 63,
    Eb: 63,
    E: 64,
    F: 65,
    "F#": 66,
    Gb: 66,
    G: 67,
    "G#": 68,
    Ab: 68,
    A: 69,
    "A#": 70,
    Bb: 70,
    B: 71,
  };

  const state = {
    loopInput: "",
    loopValidation: { valid: false, message: "Enter a loop or load the demo." },
    sessionMessage: "No saved session loaded.",
    baseSteps: [],
    currentSteps: [],
    landingIndex: null,
    zoneStart: null,
    zoneEnd: null,
    selectedStepIndex: null,
    selectedAxis: "Color",
    activeVariantId: "base",
    mirrors: [],
    stackLabels: {},
    stackNotes: {},
    auditionTrail: [],
    snapshots: [],
    historyStack: [],
    futureStack: [],
    lastChange: null,
    bypassEdits: false,
    soloZone: false,
    isPlaying: false,
    playheadIndex: 0,
    audioContext: null,
    playTimer: null,
    toastTimer: null,
    compareFlashTimers: [],
    compareFocusStepIndex: null,
  };

  const ui = {
    loopInput: document.getElementById("loop-input"),
    loopFeedback: document.getElementById("loop-feedback"),
    sessionFeedback: document.getElementById("session-feedback"),
    loadDemoButton: document.getElementById("load-demo-button"),
    applyLoopButton: document.getElementById("apply-loop-button"),
    saveSessionButton: document.getElementById("save-session-button"),
    restoreSessionButton: document.getElementById("restore-session-button"),
    clearSessionButton: document.getElementById("clear-session-button"),
    exportSessionButton: document.getElementById("export-session-button"),
    importSessionButton: document.getElementById("import-session-button"),
    importSessionInput: document.getElementById("import-session-input"),
    loopToggle: document.getElementById("loop-toggle"),
    clickToggle: document.getElementById("click-toggle"),
    loopStatusPill: document.getElementById("loop-status-pill"),
    playbackStatusPill: document.getElementById("playback-status-pill"),
    orbitSteps: document.getElementById("orbit-steps"),
    orbitEmptyState: document.getElementById("orbit-empty-state"),
    orbitAnnotations: document.getElementById("orbit-annotations"),
    stepStrip: document.getElementById("step-strip"),
    approachArc: document.getElementById("approach-arc"),
    playhead: document.getElementById("playhead"),
    expandZoneButton: document.getElementById("expand-zone-button"),
    shrinkZoneButton: document.getElementById("shrink-zone-button"),
    excludeStepButton: document.getElementById("exclude-step-button"),
    inspectorTitle: document.getElementById("inspector-title"),
    rolePill: document.getElementById("role-pill"),
    inspectorEmpty: document.getElementById("inspector-empty"),
    inspectorEmptyText: document.getElementById("inspector-empty-text"),
    inspectorContent: document.getElementById("inspector-content"),
    stepLabel: document.getElementById("step-label"),
    landingLabel: document.getElementById("landing-label"),
    axisTabs: document.getElementById("axis-tabs"),
    axisHelper: document.getElementById("axis-helper"),
    candidateList: document.getElementById("candidate-list"),
    mirrorList: document.getElementById("mirror-list"),
    mirrorEmptyCopy: document.getElementById("mirror-empty-copy"),
    compareSummaryText: document.getElementById("compare-summary-text"),
    compareProvenanceText: document.getElementById("compare-provenance-text"),
    diffSummaryList: document.getElementById("diff-summary-list"),
    newMirrorButton: document.getElementById("new-mirror-button"),
    addSnapshotButton: document.getElementById("add-snapshot-button"),
    undoButton: document.getElementById("undo-button"),
    redoButton: document.getElementById("redo-button"),
    historyFeedback: document.getElementById("history-feedback"),
    snapshotList: document.getElementById("snapshot-list"),
    flashCompareButton: document.getElementById("flash-compare-button"),
    previewDiffButton: document.getElementById("preview-diff-button"),
    resetDraftButton: document.getElementById("reset-draft-button"),
    renameMirrorButton: document.getElementById("rename-mirror-button"),
    deleteMirrorButton: document.getElementById("delete-mirror-button"),
    clearAuditionsButton: document.getElementById("clear-auditions-button"),
    playLoopButton: document.getElementById("play-loop-button"),
    soloZoneButton: document.getElementById("solo-zone-button"),
    bypassEditsButton: document.getElementById("bypass-edits-button"),
    backToBaseButton: document.getElementById("back-to-base-button"),
    auditionTrail: document.getElementById("audition-trail"),
    mirrorDialog: document.getElementById("mirror-dialog"),
    mirrorDialogHelper: document.getElementById("mirror-dialog-helper"),
    mirrorNameInput: document.getElementById("mirror-name-input"),
    mirrorAxisInputs: Array.from(document.querySelectorAll('input[name="mirror-axis"]')),
    confirmMirrorButton: document.getElementById("confirm-mirror-button"),
  };

  init();

  function init() {
    ui.loadDemoButton.addEventListener("click", loadDemo);
    ui.applyLoopButton.addEventListener("click", applyLoop);
    ui.saveSessionButton.addEventListener("click", saveSession);
    ui.restoreSessionButton.addEventListener("click", restoreSession);
    ui.clearSessionButton.addEventListener("click", clearSavedSession);
    ui.exportSessionButton.addEventListener("click", exportSession);
    ui.importSessionButton.addEventListener("click", triggerImportSession);
    ui.importSessionInput.addEventListener("change", importSessionFromFile);
    ui.loopInput.addEventListener("input", onLoopInput);
    ui.loopToggle.addEventListener("change", onLoopToggleChange);
    ui.clickToggle.addEventListener("change", onClickToggleChange);
    ui.expandZoneButton.addEventListener("click", expandZoneLeft);
    ui.shrinkZoneButton.addEventListener("click", shrinkZone);
    ui.excludeStepButton.addEventListener("click", excludeSelectedStep);
    ui.axisTabs.addEventListener("click", onAxisTabClick);
    ui.newMirrorButton.addEventListener("click", openMirrorDialog);
    ui.addSnapshotButton.addEventListener("click", addSnapshot);
    ui.undoButton.addEventListener("click", undoHistory);
    ui.redoButton.addEventListener("click", redoHistory);
    ui.flashCompareButton.addEventListener("click", flashCompare);
    ui.previewDiffButton.addEventListener("click", previewCurrentDiff);
    ui.resetDraftButton.addEventListener("click", resetDraft);
    ui.renameMirrorButton.addEventListener("click", renameActiveMirror);
    ui.deleteMirrorButton.addEventListener("click", deleteActiveMirror);
    ui.clearAuditionsButton.addEventListener("click", clearAuditionTrail);
    ui.playLoopButton.addEventListener("click", togglePlayback);
    ui.soloZoneButton.addEventListener("click", toggleSoloZone);
    ui.bypassEditsButton.addEventListener("click", toggleBypassEdits);
    ui.backToBaseButton.addEventListener("click", activateBaseVariant);
    ui.confirmMirrorButton.addEventListener("click", createMirror);
    ui.mirrorDialog.addEventListener("close", onDialogClose);
    ui.mirrorList.addEventListener("click", onMirrorClick);
    document.addEventListener("keydown", onKeyDown);
    onLoopInput();
    syncSessionControls();
    render();
  }

  function loadDemo() {
    state.loopInput = DEMO_LOOP;
    ui.loopInput.value = DEMO_LOOP;
    onLoopInput();
    applyLoop();
  }

  function onLoopInput() {
    state.loopInput = ui.loopInput.value.trim();
    state.loopValidation = validateLoopInput(state.loopInput);
    ui.applyLoopButton.disabled = !state.loopValidation.valid;
    renderInputFeedback();
  }

  function onLoopToggleChange() {
    if (!ui.loopToggle.checked && state.isPlaying) {
      stopPlayback();
    }
    render();
  }

  function onClickToggleChange() {
    if (state.isPlaying) {
      stopPlayback();
      startPlayback();
    }
    render();
  }

  function onKeyDown(event) {
    if (shouldIgnoreHotkeys(event)) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === " ") {
      event.preventDefault();
      togglePlayback();
      return;
    }
    if (key === "1") {
      state.selectedAxis = "Color";
      render();
      return;
    }
    if (key === "2") {
      state.selectedAxis = "Pull";
      render();
      return;
    }
    if (key === "3") {
      state.selectedAxis = "Link";
      render();
      return;
    }
    if (key === "s") {
      if (!ui.soloZoneButton.disabled) {
        toggleSoloZone();
      }
      return;
    }
    if (key === "b") {
      if (!ui.backToBaseButton.disabled) {
        activateBaseVariant();
      }
      return;
    }
    if (key === "m") {
      if (!ui.newMirrorButton.disabled) {
        openMirrorDialog();
      }
      return;
    }
    if (key === "f") {
      if (!ui.flashCompareButton.disabled) {
        flashCompare();
      }
      return;
    }
    if (key === "u") {
      if (!ui.undoButton.disabled) {
        undoHistory();
      }
      return;
    }
    if (key === "r") {
      if (!ui.redoButton.disabled) {
        redoHistory();
      }
      return;
    }
    if (key === "x") {
      if (!ui.resetDraftButton.disabled) {
        resetDraft();
      }
    }
  }

  function shouldIgnoreHotkeys(event) {
    const target = event.target;
    if (!target) {
      return false;
    }
    const tagName = target.tagName ? target.tagName.toLowerCase() : "";
    return tagName === "input" || tagName === "textarea" || target.isContentEditable;
  }

  function applyLoop() {
    const validation = validateLoopInput(state.loopInput);
    state.loopValidation = validation;
    renderInputFeedback();
    if (!validation.valid) {
      return;
    }
    const parsed = validation.steps;

    state.baseSteps = parsed;
    state.currentSteps = cloneSteps(parsed);
    state.landingIndex = null;
    state.zoneStart = null;
    state.zoneEnd = null;
    state.selectedStepIndex = null;
    state.selectedAxis = "Color";
    state.activeVariantId = "base";
    state.mirrors = [];
    state.stackLabels = {};
    state.stackNotes = {};
    state.auditionTrail = [];
    state.snapshots = [];
    state.historyStack = [];
    state.futureStack = [];
    state.lastChange = null;
    state.bypassEdits = false;
    state.soloZone = false;
    state.sessionMessage = "Current loop loaded. Save it when ready.";
    stopPlayback();
    persistSession();
    render();
  }

  function parseLoop(input) {
    const normalized = input.replace(/\s+/g, " ").trim();
    if (!normalized) {
      return [];
    }

    const bars = normalized
      .split("|")
      .map((bar) => bar.trim())
      .filter(Boolean);

    const steps = [];
    bars.forEach((bar) => {
      const parts = bar.split(" ").filter(Boolean);
      parts.forEach((part) => steps.push(createStep(part)));
    });

    return steps.slice(0, 16);
  }

  function validateLoopInput(input) {
    if (!input) {
      return { valid: false, message: "Enter a loop or load the demo." };
    }

    const bars = input
      .split("|")
      .map((bar) => bar.trim())
      .filter(Boolean);

    if (bars.length < 2 || bars.length > 4) {
      return { valid: false, message: "Use 2-4 bars separated by |." };
    }

    const steps = [];
    for (const bar of bars) {
      const parts = bar.split(" ").filter(Boolean);
      if (parts.length < 1 || parts.length > 4) {
        return { valid: false, message: "Each bar supports 1-4 steps in this MVP." };
      }

      for (const part of parts) {
        if (!isSupportedInputSymbol(part)) {
          return { valid: false, message: `Unsupported chord: ${part}` };
        }
        steps.push(createStep(part));
      }
    }

    if (!steps.length) {
      return { valid: false, message: "No playable steps found." };
    }

    return {
      valid: true,
      message: `${bars.length} bars, ${steps.length} steps ready.`,
      steps,
    };
  }

  function isSupportedInputSymbol(symbol) {
    const pattern =
      /^([A-G](?:#|b)?)(maj7\(#11\)|maj7|maj6|maj|m7b5|m9|m7|m6|m|7alt|7\(#11\)|7|dim|sus\(add9\)|sus|6\/9|6)?(?:\/([A-G](?:#|b)?))?$/;
    return pattern.test(symbol);
  }

  function createStep(symbol) {
    const parts = symbol.split("/");
    return {
      symbol,
      main: parts[0],
      bass: parts[1] || null,
      role: "passing / link",
    };
  }

  function cloneSteps(steps) {
    return steps.map((step) => ({ ...step }));
  }

  function cloneMirrors(mirrors) {
    return mirrors.map((mirror) => ({
      ...mirror,
      steps: cloneSteps(mirror.steps || []),
      lastChange: mirror.lastChange ? { ...mirror.lastChange } : null,
    }));
  }

  function captureEditableState() {
    return {
      currentSteps: cloneSteps(state.currentSteps),
      landingIndex: state.landingIndex,
      zoneStart: state.zoneStart,
      zoneEnd: state.zoneEnd,
      selectedStepIndex: state.selectedStepIndex,
      selectedAxis: state.selectedAxis,
      activeVariantId: state.activeVariantId,
      mirrors: cloneMirrors(state.mirrors),
      lastChange: state.lastChange ? { ...state.lastChange } : null,
      bypassEdits: state.bypassEdits,
      soloZone: state.soloZone,
    };
  }

  function restoreEditableState(snapshot) {
    state.currentSteps = cloneSteps(snapshot.currentSteps || []);
    state.landingIndex = snapshot.landingIndex;
    state.zoneStart = snapshot.zoneStart;
    state.zoneEnd = snapshot.zoneEnd;
    state.selectedStepIndex = snapshot.selectedStepIndex;
    state.selectedAxis = snapshot.selectedAxis || "Color";
    state.activeVariantId = snapshot.activeVariantId || "base";
    state.mirrors = cloneMirrors(snapshot.mirrors || []);
    state.lastChange = snapshot.lastChange ? { ...snapshot.lastChange } : null;
    state.bypassEdits = Boolean(snapshot.bypassEdits);
    state.soloZone = Boolean(snapshot.soloZone);
    updateRoles(state.currentSteps);
  }

  function pushHistory(label) {
    if (!state.baseSteps.length) {
      return;
    }
    state.historyStack.push({
      label,
      snapshot: captureEditableState(),
    });
    if (state.historyStack.length > 40) {
      state.historyStack.shift();
    }
    state.futureStack = [];
  }

  function undoHistory() {
    if (!state.historyStack.length) {
      return;
    }
    const entry = state.historyStack.pop();
    state.futureStack.push({
      label: entry.label,
      snapshot: captureEditableState(),
    });
    restoreEditableState(entry.snapshot);
    state.sessionMessage = `Undid: ${entry.label}`;
    persistSession();
    render();
    showToast("Undo");
  }

  function redoHistory() {
    if (!state.futureStack.length) {
      return;
    }
    const entry = state.futureStack.pop();
    state.historyStack.push({
      label: entry.label,
      snapshot: captureEditableState(),
    });
    restoreEditableState(entry.snapshot);
    state.sessionMessage = `Redid: ${entry.label}`;
    persistSession();
    render();
    showToast("Redo");
  }

  function addSnapshot() {
    if (!state.baseSteps.length) {
      return;
    }
    const name = window.prompt("Name this snapshot", `Checkpoint ${state.snapshots.length + 1}`);
    if (!name) {
      return;
    }
    state.snapshots.unshift({
      id: `snapshot-${Date.now()}`,
      name: name.trim() || `Checkpoint ${state.snapshots.length + 1}`,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      snapshot: captureEditableState(),
    });
    state.snapshots = state.snapshots.slice(0, 12);
    state.sessionMessage = `Snapshot saved: ${state.snapshots[0].name}.`;
    persistSession();
    render();
    showToast("Snapshot saved");
  }

  function restoreSnapshot(snapshotId) {
    const item = state.snapshots.find((snapshot) => snapshot.id === snapshotId);
    if (!item) {
      return;
    }
    pushHistory(`restore ${item.name}`);
    restoreEditableState(item.snapshot);
    state.sessionMessage = `Restored snapshot: ${item.name}.`;
    persistSession();
    render();
    showToast("Snapshot restored");
  }

  function setLanding(index) {
    pushHistory("set landing");
    const total = state.currentSteps.length;
    const zoneLength = Math.min(2, Math.max(0, total - 1));
    state.landingIndex = index;
    state.zoneStart = total ? (index - zoneLength + total) % total : null;
    state.zoneEnd = total ? (index - 1 + total) % total : null;
    state.selectedStepIndex = null;
    state.lastChange = null;
    updateRoles(state.currentSteps);
    persistSession();
    render();
  }

  function updateRoles(steps) {
    steps.forEach((step, index) => {
      step.role = detectRole(steps, index);
    });
  }

  function detectRole(steps, index) {
    if (state.landingIndex === null) {
      return "Role";
    }

    const step = steps[index];
    const landing = steps[state.landingIndex];
    if (!step || !landing) {
      return "passing / link";
    }

    const stepRoot = getRoot(step.main);
    const landingRoot = getRoot(landing.main);

    if (index === state.landingIndex || stepRoot === landingRoot) {
      return "tonic return";
    }

    if (isDominantTo(stepRoot, landingRoot)) {
      return "dominant";
    }

    const distance = getDistanceToLanding(index, steps.length);
    if (distance > 1 && distance <= getZoneLength(steps.length)) {
      return "pre-dominant";
    }

    return "passing / link";
  }

  function isDominantTo(stepRoot, landingRoot) {
    if (!stepRoot || !landingRoot) {
      return false;
    }

    const dominantMap = {
      C: ["G", "Db"],
      Db: ["Ab", "D"],
      D: ["A", "Eb"],
      Eb: ["Bb", "E"],
      E: ["B", "F"],
      F: ["C", "Gb"],
      "F#": ["C#", "G"],
      Gb: ["Db", "G"],
      G: ["D", "Ab"],
      Ab: ["Eb", "A"],
      A: ["E", "Bb"],
      Bb: ["F", "B"],
      B: ["F#", "C"],
    };

    return (dominantMap[landingRoot] || []).includes(stepRoot);
  }

  function getRoot(symbol) {
    const match = symbol.match(/^([A-G](?:#|b)?)/);
    return match ? match[1] : null;
  }

  function selectStep(index) {
    state.selectedStepIndex = isIndexInZone(index) ? index : null;
    render();
  }

  function isIndexInZone(index) {
    if (state.zoneStart === null || state.zoneEnd === null || state.landingIndex === null || !state.baseSteps.length) {
      return false;
    }
    const distance = getDistanceToLanding(index, state.baseSteps.length);
    return distance >= 1 && distance <= getZoneLength(state.baseSteps.length);
  }

  function getDistanceToLanding(index, total) {
    return ((state.landingIndex - index) % total + total) % total;
  }

  function getZoneLength(total) {
    if (state.zoneStart === null || state.zoneEnd === null || total <= 0) {
      return 0;
    }
    return ((state.zoneEnd - state.zoneStart) % total + total) % total + 1;
  }

  function expandZoneLeft() {
    if (state.zoneStart === null || state.landingIndex === null || !state.baseSteps.length) {
      return;
    }
    if (getZoneLength(state.baseSteps.length) >= state.baseSteps.length - 1) {
      return;
    }
    pushHistory("expand zone");
    state.zoneStart = (state.zoneStart - 1 + state.baseSteps.length) % state.baseSteps.length;
    updateRoles(state.currentSteps);
    persistSession();
    render();
  }

  function shrinkZone() {
    if (state.zoneStart === null || state.zoneEnd === null || !state.baseSteps.length || getZoneLength(state.baseSteps.length) <= 1) {
      return;
    }
    pushHistory("shrink zone");
    state.zoneStart = (state.zoneStart + 1) % state.baseSteps.length;
    if (state.selectedStepIndex !== null && !isIndexInZone(state.selectedStepIndex)) {
      state.selectedStepIndex = null;
    }
    updateRoles(state.currentSteps);
    persistSession();
    render();
  }

  function excludeSelectedStep() {
    if (state.selectedStepIndex === null || !isIndexInZone(state.selectedStepIndex)) {
      return;
    }
    if (getZoneLength(state.baseSteps.length) <= 1) {
      return;
    }
    pushHistory("exclude step");
    if (state.selectedStepIndex === state.zoneStart) {
      state.zoneStart = (state.zoneStart + 1) % state.baseSteps.length;
    } else if (state.selectedStepIndex === state.zoneEnd) {
      state.zoneEnd = (state.zoneEnd - 1 + state.baseSteps.length) % state.baseSteps.length;
    }
    state.selectedStepIndex = null;
    updateRoles(state.currentSteps);
    persistSession();
    render();
  }

  function onAxisTabClick(event) {
    const button = event.target.closest(".tab-button");
    if (!button) {
      return;
    }
    state.selectedAxis = button.dataset.axis;
    render();
  }

  function getDisplaySteps() {
    if (state.bypassEdits) {
      return state.baseSteps.length ? cloneSteps(state.baseSteps) : [];
    }
    const mirror = state.mirrors.find((item) => item.id === state.activeVariantId);
    if (mirror) {
      return cloneSteps(mirror.steps);
    }
    return cloneSteps(state.currentSteps);
  }

  function getEditableSteps() {
    if (state.activeVariantId === "base" || state.bypassEdits) {
      return state.currentSteps;
    }
    const mirror = state.mirrors.find((item) => item.id === state.activeVariantId);
    return mirror ? mirror.steps : state.currentSteps;
  }

  function getTritoneSub(root) {
    return shiftRoot(root, 6);
  }

  function getBackdoor(landingRoot) {
    return shiftRoot(landingRoot, -2);
  }

  function shiftRoot(root, semitones) {
    if (!root || !(root in NOTES)) {
      return root || "C";
    }
    const targetValue = (((NOTES[root] - 60 + semitones) % 12) + 12) % 12;
    const options = Object.entries(NOTES)
      .filter(([, value]) => ((value - 60) % 12 + 12) % 12 === targetValue)
      .map(([name]) => name);
    return options.find((name) => name.length === 1 || name.includes("b")) || options[0] || root;
  }

  function angleForIndex(index, total) {
    return (360 / total) * index - 90;
  }

  function pointOnCircle(cx, cy, radius, angleDegrees) {
    const radians = (angleDegrees * Math.PI) / 180;
    return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
  }

  function polarToCartesian(cx, cy, radius, angleDegrees) {
    const radians = ((angleDegrees - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
  }

  function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const delta = (((endAngle - startAngle) % 360) + 360) % 360;
    const largeArcFlag = delta <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
  }

  function getCandidates() {
    if (state.selectedStepIndex === null) {
      return [];
    }

    const steps = getEditableSteps();
    const step = steps[state.selectedStepIndex];
    if (!step) {
      return [];
    }

    const role = detectRole(steps, state.selectedStepIndex);
    const root = getRoot(step.main);
    const landingRoot = state.landingIndex !== null ? getRoot(steps[state.landingIndex].main) : null;
    const candidates = [{ label: "Original", symbol: step.symbol, tag: "stable", axis: state.selectedAxis }];

    if (!root) {
      return candidates;
    }

    if (state.selectedAxis === "Color") {
      if (role === "dominant") {
        candidates.push({ label: "Alt dominant", symbol: `${root}7alt`, tag: "brighter", axis: "Color" });
        candidates.push({ label: "Lydian dominant", symbol: `${root}7(#11)`, tag: "sleeker", axis: "Color" });
      } else if (role === "pre-dominant") {
        candidates.push({ label: "Subdominant minor", symbol: root === "D" ? "Fm6" : `${root}m7b5`, tag: "darker", axis: "Color" });
        candidates.push({ label: "Half-diminished prep", symbol: `${root}m7b5`, tag: "grainier", axis: "Color" });
      } else if (role === "tonic return") {
        candidates.push({ label: "Major 6/9", symbol: `${root}6/9`, tag: "softer landing", axis: "Color" });
        candidates.push({ label: "Lydian wash", symbol: `${root}maj7(#11)`, tag: "airier", axis: "Color" });
      } else {
        candidates.push({ label: "Planed color", symbol: `${root}7(#11)`, tag: "lighter", axis: "Color" });
        candidates.push({ label: "Altered color", symbol: `${root}alt`, tag: "edgier", axis: "Color" });
      }
    } else if (state.selectedAxis === "Pull") {
      if (role === "dominant") {
        candidates.push({ label: "Tritone sub", symbol: `${getTritoneSub(root)}7`, tag: "more pull", axis: "Pull", mirrorAxis: "Color" });
        candidates.push({ label: "Backdoor", symbol: `${getBackdoor(landingRoot) || root}7`, tag: "softer backdoor", axis: "Pull", mirrorAxis: "Color" });
      } else if (role === "tonic return") {
        candidates.push({ label: "Suspended return", symbol: `${root}sus(add9)`, tag: "delayed", axis: "Pull", mirrorAxis: "Timing" });
        candidates.push({ label: "Delayed settle", symbol: `${root}6/9`, tag: "more float", axis: "Pull", mirrorAxis: "Timing" });
      } else if (role === "pre-dominant") {
        candidates.push({ label: "Stronger prep", symbol: `${root}m9`, tag: "stronger setup", axis: "Pull", mirrorAxis: "Timing" });
        candidates.push({ label: "Secondary prep", symbol: `${root}7/${root}`, tag: "tenser", axis: "Pull", mirrorAxis: "Timing" });
      } else {
        candidates.push({ label: "Stronger connector", symbol: `${root}dim`, tag: "tighter", axis: "Pull", mirrorAxis: "Timing" });
        candidates.push({ label: "Weaker connector", symbol: `${root}sus`, tag: "looser", axis: "Pull", mirrorAxis: "Timing" });
      }
    } else if (role === "dominant") {
      candidates.push({ label: "Side-slip", symbol: `${shiftRoot(root, 1)}7 -> ${root}7`, tag: "slippery", axis: "Link" });
      candidates.push({ label: "Diminished link", symbol: `${shiftRoot(root, 4)}dim/${root} -> ${root}7`, tag: "tighter link", axis: "Link" });
    } else if (role === "pre-dominant") {
      candidates.push({ label: "Chromatic upper", symbol: `${shiftRoot(root, 1)}m7 -> ${root}m7`, tag: "slippery", axis: "Link" });
      candidates.push({ label: "Passing diminished", symbol: `${shiftRoot(root, 4)}dim -> ${root}m7`, tag: "grainy", axis: "Link" });
    } else if (role === "tonic return") {
      candidates.push({ label: "Upper neighbor", symbol: `${shiftRoot(root, 2)}/${root} -> ${root}maj7`, tag: "hovering", axis: "Link" });
      candidates.push({ label: "Related tonic", symbol: `${shiftRoot(root, 2)}/${root} -> ${root}6/9`, tag: "delayed", axis: "Link" });
    } else {
      candidates.push({ label: "Chromatic connector", symbol: `${shiftRoot(root, 1)}7 -> ${root}`, tag: "slippery", axis: "Link" });
      candidates.push({ label: "Diminished connector", symbol: `${shiftRoot(root, 4)}dim -> ${root}`, tag: "tight", axis: "Link" });
    }

    return candidates.slice(0, 3);
  }

  function applyCandidate(candidate) {
    const steps = getEditableSteps();
    const step = steps[state.selectedStepIndex];
    if (!step || !candidate) {
      return;
    }

    pushHistory(`apply ${candidate.label}`);
    const before = step.symbol;
    step.symbol = candidate.symbol;
    step.main = candidate.symbol.split("/")[0];
    step.bass = candidate.symbol.includes("/") ? candidate.symbol.split("/")[1] : null;
    updateRoles(steps);

    state.lastChange = buildLastChange(candidate, before, candidate.symbol, state.selectedStepIndex);

    if (state.activeVariantId !== "base") {
      const mirror = state.mirrors.find((item) => item.id === state.activeVariantId);
      if (mirror) {
        mirror.lastChange = { ...state.lastChange };
      }
    }

    state.sessionMessage = "Change applied to current version.";
    persistSession();
    render();
  }

  function normalizeMirrorAxis(candidate) {
    if (candidate.axis === "Color" || candidate.axis === "Link") {
      return candidate.axis;
    }
    if (candidate.mirrorAxis) {
      return candidate.mirrorAxis;
    }
    return candidate.symbol.includes("sus") || candidate.symbol.includes("->") ? "Timing" : "Color";
  }

  function buildLastChange(candidate, before, after, stepIndex) {
    return {
      stepIndex,
      before,
      after,
      explorationAxis: candidate.axis,
      normalizedAxis: normalizeMirrorAxis(candidate),
    };
  }

  function suggestMirrorNameForChange(change) {
    if (!change) {
      return "mirror";
    }
    if (change.after.includes("Db7")) {
      return "tritone";
    }
    if (change.normalizedAxis === "Timing") {
      return "delayed settle";
    }
    if (change.normalizedAxis === "Link") {
      return "slip";
    }
    return "color shift";
  }

  function createMirrorRecord(axis, name, steps, lastChange, provenance = null) {
    return {
      id: `mirror-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      axis,
      name,
      steps: cloneSteps(steps),
      lastChange: lastChange ? { ...lastChange } : null,
      provenance,
    };
  }

  function openMirrorDialog() {
    if (!state.lastChange || state.activeVariantId !== "base") {
      return;
    }

    const axis = state.lastChange.normalizedAxis;
    ui.mirrorDialogHelper.textContent =
      state.lastChange.explorationAxis === "Pull"
        ? `This pull change compares best as ${axis.toLowerCase()}.`
        : "This mirror can only edit one axis.";

    ui.mirrorAxisInputs.forEach((input) => {
      input.checked = input.value === axis;
      input.disabled = input.value !== axis;
    });
    ui.mirrorNameInput.value = suggestMirrorName();
    ui.mirrorDialog.showModal();
  }

  function suggestMirrorName() {
    return suggestMirrorNameForChange(state.lastChange);
  }

  function onDialogClose() {
    ui.mirrorDialogHelper.textContent = "This mirror can only edit one axis.";
  }

  function createMirror(event) {
    event.preventDefault();
    if (!state.lastChange) {
      return;
    }
    const axis = ui.mirrorAxisInputs.find((input) => input.checked)?.value;
    if (!axis) {
      return;
    }

    pushHistory("create mirror");
    const mirror = createMirrorRecord(
      axis,
      ui.mirrorNameInput.value.trim() || suggestMirrorName(),
      state.currentSteps,
      state.lastChange,
      { kind: "draft", label: "Saved from current draft." }
    );
    state.mirrors.push(mirror);
    state.activeVariantId = mirror.id;
    state.sessionMessage = `Saved mirror: ${mirror.axis}: ${mirror.name}.`;
    persistSession();
    ui.mirrorDialog.close();
    showToast("Mirror saved");
    render();
  }

  function onMirrorClick(event) {
    const button = event.target.closest(".mirror-chip");
    if (!button || button.classList.contains("disabled")) {
      return;
    }
    const variantId = button.dataset.variantId;
    if (variantId === "base") {
      activateBaseVariant();
    } else {
      state.activeVariantId = variantId;
      render();
    }
  }

  function activateBaseVariant() {
    pushHistory("back to base");
    state.activeVariantId = "base";
    persistSession();
    render();
  }

  function resetDraft() {
    if (!state.baseSteps.length || state.activeVariantId !== "base") {
      return;
    }
    const diffs = getVariantDiffs(state.currentSteps);
    if (!diffs.length) {
      return;
    }

    pushHistory("reset draft");
    clearCompareFlashTimers();
    stopPlayback();
    state.currentSteps = cloneSteps(state.baseSteps);
    state.selectedStepIndex = null;
    state.lastChange = null;
    state.bypassEdits = false;
    updateRoles(state.currentSteps);
    state.sessionMessage = "Draft reset to base.";
    persistSession();
    render();
    showToast("Draft reset");
  }

  function renameActiveMirror() {
    const activeMirror = state.mirrors.find((mirror) => mirror.id === state.activeVariantId);
    if (!activeMirror) {
      return;
    }

    const nextName = window.prompt("Rename this mirror", activeMirror.name);
    if (!nextName) {
      return;
    }

    pushHistory("rename mirror");
    activeMirror.name = nextName.trim() || activeMirror.name;
    state.sessionMessage = `Mirror renamed: ${activeMirror.name}.`;
    persistSession();
    render();
    showToast("Mirror renamed");
  }

  function deleteActiveMirror() {
    const activeMirror = state.mirrors.find((mirror) => mirror.id === state.activeVariantId);
    if (!activeMirror) {
      return;
    }
    const confirmed = window.confirm(`Delete mirror "${activeMirror.name}"?`);
    if (!confirmed) {
      return;
    }

    pushHistory("delete mirror");
    clearCompareFlashTimers();
    stopPlayback();
    state.mirrors = state.mirrors.filter((mirror) => mirror.id !== activeMirror.id);
    state.activeVariantId = "base";
    state.bypassEdits = false;
    state.sessionMessage = `Deleted mirror: ${activeMirror.name}.`;
    persistSession();
    render();
    showToast("Mirror deleted");
  }

  function toggleSoloZone() {
    pushHistory("toggle solo zone");
    state.soloZone = !state.soloZone;
    persistSession();
    render();
  }

  function toggleBypassEdits() {
    pushHistory("toggle bypass");
    state.bypassEdits = !state.bypassEdits;
    persistSession();
    render();
  }

  function togglePlayback() {
    if (!state.baseSteps.length || !ui.loopToggle.checked) {
      return;
    }
    if (state.isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
    render();
  }

  function startPlayback() {
    ensureAudioContext();
    state.isPlaying = true;
    state.playheadIndex = 0;
    tickPlayback();
    const interval = ui.clickToggle.checked ? 520 : 720;
    state.playTimer = window.setInterval(tickPlayback, interval);
  }

  function stopPlayback() {
    state.isPlaying = false;
    if (state.playTimer) {
      window.clearInterval(state.playTimer);
      state.playTimer = null;
    }
  }

  function tickPlayback() {
    const steps = getDisplaySteps();
    if (!steps.length) {
      stopPlayback();
      render();
      return;
    }

    let indexes = steps.map((_, index) => index);
    if (state.soloZone && state.zoneStart !== null && state.zoneEnd !== null) {
      indexes = indexes.filter((index) => isIndexInZone(index));
    }

    const index = indexes[state.playheadIndex % indexes.length];
    if (steps[index]) {
      playChordPreview(steps[index].symbol);
    }
    state.playheadIndex += 1;
    render();
  }

  function ensureAudioContext() {
    if (!state.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        state.audioContext = new AudioContextClass();
      }
    }
    if (state.audioContext && state.audioContext.state === "suspended") {
      state.audioContext.resume();
    }
  }

  function playChordPreview(symbol) {
    ensureAudioContext();
    if (!state.audioContext || !symbol) {
      return;
    }

    const now = state.audioContext.currentTime;
    const segments = symbol
      .split("->")
      .map((segment) => segment.trim())
      .filter(Boolean);

    segments.forEach((segment, segmentIndex) => {
      const voicing = getChordVoicing(segment);
      const startTime = now + segmentIndex * 0.22;
      const duration = 0.44;
      voicing.intervals.forEach((interval, offset) => {
        const oscillator = state.audioContext.createOscillator();
        const gain = state.audioContext.createGain();
        oscillator.type = offset === 0 ? "triangle" : "sine";
        oscillator.frequency.value = midiToFrequency(voicing.rootMidi + interval);
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.14 / (offset + 1), startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        oscillator.connect(gain).connect(state.audioContext.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration + 0.04);
      });
    });
  }

  function getChordVoicing(symbol) {
    const firstPart = symbol.split("->")[0].trim();
    const main = firstPart.split("/")[0];
    const root = getRoot(main) || "C";
    const rootMidi = (NOTES[root] || 60) - 12;
    const lower = main.toLowerCase();
    let intervals = [0, 4, 7, 11];

    if (lower.includes("m7b5")) {
      intervals = [0, 3, 6, 10];
    } else if (lower.includes("dim")) {
      intervals = [0, 3, 6, 9];
    } else if (lower.includes("sus")) {
      intervals = [0, 5, 7, 10];
    } else if (lower.includes("m") && !lower.includes("maj")) {
      intervals = [0, 3, 7, 10];
    } else if (lower.includes("6/9") || lower.includes("6")) {
      intervals = [0, 4, 7, 9];
    } else if (lower.includes("alt")) {
      intervals = [0, 4, 8, 10];
    } else if (lower.includes("#11")) {
      intervals = [0, 4, 6, 10];
    } else if (lower.includes("7")) {
      intervals = [0, 4, 7, 10];
    }

    return { rootMidi, intervals };
  }

  function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function render() {
    const displaySteps = getDisplaySteps();
    ui.loopStatusPill.textContent = displaySteps.length ? "Loop loaded" : "Empty";
    ui.playbackStatusPill.textContent = state.isPlaying ? "Playing" : "Stopped";
    ui.playbackStatusPill.classList.toggle("muted", !state.isPlaying);
    renderSessionFeedback();
    syncSessionControls();
    renderOrbit(displaySteps);
    renderStepStrip(displaySteps);
    renderInspector();
    renderMirrors();
    renderTransport();
    renderAuditionTrail();
    renderSnapshots();
  }

  function renderOrbit(steps) {
    ui.orbitSteps.innerHTML = "";
    ui.orbitAnnotations.innerHTML = "";
    const hasLoop = steps.length > 0;
    const activeMirror = state.mirrors.find((mirror) => mirror.id === state.activeVariantId);
    const compareTarget = getCompareTarget();
    const diffIndexes = new Set(
      (compareTarget ? getVariantDiffs(compareTarget.steps) : []).map((item) => item.index)
    );
    ui.orbitEmptyState.classList.toggle("hidden", hasLoop);
    ui.playhead.classList.toggle("hidden", !hasLoop);
    ui.approachArc.classList.toggle("hidden", !(hasLoop && state.landingIndex !== null && state.zoneStart !== null && state.zoneEnd !== null));

    if (!hasLoop) {
      return;
    }

    if (state.zoneStart !== null && state.zoneEnd !== null && state.landingIndex !== null) {
      const path = describeArc(320, 320, 210, angleForIndex(state.zoneStart, steps.length), angleForIndex(state.zoneEnd, steps.length));
      ui.approachArc.setAttribute("d", path);

      const helper = document.createElementNS("http://www.w3.org/2000/svg", "text");
      helper.setAttribute("x", "320");
      helper.setAttribute("y", "320");
      helper.setAttribute("class", "annotation-text");
      helper.textContent = state.selectedStepIndex === null ? "Double-click any step to set or reset landing." : "Compare how the approach lands.";
      ui.orbitAnnotations.appendChild(helper);
    }

    steps.forEach((step, index) => {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const point = pointOnCircle(320, 320, 210, angleForIndex(index, steps.length));
      group.setAttribute("transform", `translate(${point.x}, ${point.y})`);
      group.classList.add("orbit-step");
      if (isIndexInZone(index)) group.classList.add("in-zone");
      if (index === state.selectedStepIndex) group.classList.add("selected");
      if (index === state.landingIndex) group.classList.add("landing");
      if (index === state.compareFocusStepIndex) group.classList.add("compare-focus");
      if (diffIndexes.has(index) && state.activeVariantId === "base" && !state.bypassEdits) {
        group.classList.add("changed");
      }

      if (activeMirror && diffIndexes.has(index)) {
        group.classList.add("mirror-current");
        group.classList.add(`mirror-${activeMirror.axis.toLowerCase()}`);
      }

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "0");
      circle.setAttribute("cy", "0");
      circle.setAttribute("r", "42");
      group.appendChild(circle);

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", "0");
      text.setAttribute("y", "-2");
      text.textContent = step.symbol;
      group.appendChild(text);

      const roleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      roleText.setAttribute("x", "0");
      roleText.setAttribute("y", "18");
      roleText.setAttribute("class", "step-role");
      roleText.textContent = state.landingIndex === null ? "double-click" : detectRole(getEditableSteps(), index);
      group.appendChild(roleText);

      group.addEventListener("click", () => {
        if (state.landingIndex === null) {
          return;
        }
        selectStep(index);
      });
      group.addEventListener("dblclick", () => setLanding(index));

      ui.orbitSteps.appendChild(group);
    });

    if (state.isPlaying) {
      const indexes = state.soloZone && state.zoneStart !== null && state.zoneEnd !== null
        ? steps.map((_, index) => index).filter((index) => isIndexInZone(index))
        : steps.map((_, index) => index);
      const activeIndex = indexes[(state.playheadIndex - 1 + indexes.length) % indexes.length] || 0;
      const point = pointOnCircle(320, 320, 210, angleForIndex(activeIndex, steps.length));
      ui.playhead.setAttribute("cx", point.x);
      ui.playhead.setAttribute("cy", point.y - 56);
    }
  }

  function renderStepStrip(steps) {
    ui.stepStrip.innerHTML = "";
    if (!steps.length) {
      return;
    }

    const compareTarget = getCompareTarget();
    const diffIndexes = new Set((compareTarget ? getVariantDiffs(compareTarget.steps) : []).map((item) => item.index));
    const activeMirror = state.mirrors.find((mirror) => mirror.id === state.activeVariantId);

    steps.forEach((step, index) => {
      const button = document.createElement("button");
      button.className = "step-chip";
      if (isIndexInZone(index)) button.classList.add("zone");
      if (index === state.landingIndex) button.classList.add("landing");
      if (index === state.selectedStepIndex) button.classList.add("selected");
      if (index === state.compareFocusStepIndex) button.classList.add("compare-focus");
      if (diffIndexes.has(index) && state.activeVariantId === "base" && !state.bypassEdits) {
        button.classList.add("changed");
      }
      if (activeMirror && diffIndexes.has(index)) {
        button.classList.add("mirror-current");
        button.classList.add(`mirror-${activeMirror.axis.toLowerCase()}`);
      }
      button.innerHTML = `
        <small>Step ${index + 1}</small>
        <strong>${step.symbol}</strong>
      `;
      button.addEventListener("click", () => {
        if (state.landingIndex === null) {
          return;
        }
        selectStep(index);
      });
      button.addEventListener("dblclick", () => setLanding(index));
      ui.stepStrip.appendChild(button);
    });
  }

  function renderInspector() {
    const hasLoop = state.baseSteps.length > 0;
    const hasLanding = state.landingIndex !== null;
    const steps = getEditableSteps();
    const selectedStep = state.selectedStepIndex !== null ? steps[state.selectedStepIndex] : null;
    const activeMirror = state.mirrors.find((mirror) => mirror.id === state.activeVariantId);

    ui.expandZoneButton.disabled = !hasLanding || !!activeMirror;
    ui.shrinkZoneButton.disabled = !hasLanding || state.zoneStart === state.zoneEnd || !!activeMirror;
    ui.excludeStepButton.disabled = !(state.selectedStepIndex !== null && isIndexInZone(state.selectedStepIndex)) || !!activeMirror;

    if (!hasLoop) {
      ui.inspectorTitle.textContent = "No step selected";
      ui.rolePill.textContent = "Role";
      ui.rolePill.className = "pill muted";
      ui.inspectorEmptyText.textContent = "Load a loop, then double-click a step to set the landing point.";
      ui.inspectorEmpty.classList.remove("hidden");
      ui.inspectorContent.classList.add("hidden");
      return;
    }

    if (!hasLanding) {
      ui.inspectorTitle.textContent = "Landing not set";
      ui.rolePill.textContent = "Waiting";
      ui.rolePill.className = "pill muted";
      ui.inspectorEmptyText.textContent = "Double-click a step in the orbit to set the landing point.";
      ui.inspectorEmpty.classList.remove("hidden");
      ui.inspectorContent.classList.add("hidden");
      return;
    }

    if (activeMirror) {
      ui.inspectorTitle.textContent = "Mirror locked";
      ui.rolePill.textContent = activeMirror.axis;
      ui.rolePill.className = "pill";
      ui.inspectorEmptyText.textContent = "Mirrors are compare-only in this MVP. Use Back to Base to keep editing.";
      ui.inspectorEmpty.classList.remove("hidden");
      ui.inspectorContent.classList.add("hidden");
      return;
    }

    if (!selectedStep) {
      ui.inspectorTitle.textContent = "Landing point set";
      ui.rolePill.textContent = "Suggested zone";
      ui.rolePill.className = "pill";
      ui.inspectorEmptyText.textContent = "Pick a step inside the approach zone to preview candidates.";
      ui.inspectorEmpty.classList.remove("hidden");
      ui.inspectorContent.classList.add("hidden");
      return;
    }

    ui.inspectorEmpty.classList.add("hidden");
    ui.inspectorContent.classList.remove("hidden");
    ui.inspectorTitle.textContent = "Current step";
    ui.rolePill.textContent = detectRole(steps, state.selectedStepIndex);
    ui.rolePill.className = "pill";
    ui.stepLabel.textContent = selectedStep.symbol;
    ui.landingLabel.textContent = steps[state.landingIndex]?.symbol || "-";
    ui.axisHelper.textContent = axisHelperCopy();

    Array.from(ui.axisTabs.querySelectorAll(".tab-button")).forEach((button) => {
      button.classList.toggle("active", button.dataset.axis === state.selectedAxis);
    });

    ui.candidateList.innerHTML = "";
    getCandidates().forEach((candidate) => {
      const card = document.createElement("article");
      card.className = "candidate-card";
      if (selectedStep.symbol === candidate.symbol) {
        card.classList.add("applied");
      }
      const impact = getCandidateImpact(candidate);

      card.innerHTML = `
        <div class="candidate-card-header">
          <div>
            <span class="meta-label">${candidate.label}</span>
            <strong>${candidate.symbol}</strong>
          </div>
          <span class="candidate-tag">${candidate.tag}</span>
        </div>
        <div class="candidate-impact">
          <p class="candidate-impact-meta">${impact.meta}</p>
          <p class="candidate-impact-note">${impact.nuance}</p>
        </div>
        <div class="button-row">
          <button class="ghost-button" data-action="preview">Play Cand.</button>
          <button class="ghost-button" data-action="compare">Before/After</button>
          <button class="ghost-button" data-action="context">To Landing</button>
          <button class="primary-button" data-action="apply">Apply</button>
        </div>
      `;

      card.querySelector('[data-action="preview"]').addEventListener("click", () => playChordPreview(candidate.symbol));
      card.querySelector('[data-action="compare"]').addEventListener("click", () => previewCandidateSwap(candidate));
      card.querySelector('[data-action="context"]').addEventListener("click", () => previewCandidateContext(candidate));
      card.querySelector('[data-action="apply"]').addEventListener("click", () => applyCandidate(candidate));
      ui.candidateList.appendChild(card);
    });
  }

  function axisHelperCopy() {
    if (state.selectedAxis === "Color") {
      return "Preview color-first alternatives without changing the landing time.";
    }
    if (state.selectedAxis === "Pull") {
      return "Explore stronger or later arrival. Pull changes normalize before mirror save.";
    }
    return "Preview connectors and side-slips that compare as link moves.";
  }

  function getCandidateImpact(candidate) {
    if (state.selectedStepIndex === null) {
      return {
        meta: "No step selected.",
        nuance: "Pick a step inside the approach zone to preview the effect.",
      };
    }

    const previewSteps = cloneSteps(getEditableSteps());
    const previewStep = previewSteps[state.selectedStepIndex];
    if (!previewStep) {
      return {
        meta: "No preview available.",
        nuance: "This candidate cannot be evaluated right now.",
      };
    }

    previewStep.symbol = candidate.symbol;
    previewStep.main = candidate.symbol.split("/")[0];
    previewStep.bass = candidate.symbol.includes("/") ? candidate.symbol.split("/")[1] : null;
    updateRoles(previewSteps);
    return summarizeStepImpact(getEditableSteps(), previewSteps, state.selectedStepIndex);
  }

  function buildCandidatePromotionPayload(candidate) {
    if (state.selectedStepIndex === null) {
      return null;
    }

    const baseSteps = cloneSteps(getEditableSteps());
    const previewSteps = cloneSteps(getEditableSteps());
    const previewStep = previewSteps[state.selectedStepIndex];
    const currentStep = baseSteps[state.selectedStepIndex];
    if (!previewStep || !currentStep) {
      return null;
    }

    previewStep.symbol = candidate.symbol;
    previewStep.main = candidate.symbol.split("/")[0];
    previewStep.bass = candidate.symbol.includes("/") ? candidate.symbol.split("/")[1] : null;
    updateRoles(previewSteps);
    const lastChange = buildLastChange(candidate, currentStep.symbol, candidate.symbol, state.selectedStepIndex);
    return {
      axis: lastChange.normalizedAxis,
      name: suggestMirrorNameForChange(lastChange),
      steps: previewSteps,
      lastChange,
    };
  }

  function buildDraftPromotionPayload(compareTarget, diff) {
    if (!compareTarget || compareTarget.kind !== "draft") {
      return null;
    }

    const fallbackChange = diff
      ? {
          stepIndex: diff.index,
          before: diff.before,
          after: diff.after,
          explorationAxis: compareTarget.axis || "Color",
          normalizedAxis: compareTarget.axis || "Color",
        }
      : state.lastChange;
    const axis = ["Color", "Timing", "Link"].includes(fallbackChange?.normalizedAxis)
      ? fallbackChange.normalizedAxis
      : "Color";
    return {
      axis,
      name: suggestMirrorNameForChange(fallbackChange),
      steps: cloneSteps(compareTarget.steps),
      lastChange: fallbackChange ? { ...fallbackChange } : null,
    };
  }

  function previewCandidateSwap(candidate) {
    if (state.selectedStepIndex === null) {
      return;
    }

    const steps = getEditableSteps();
    const step = steps[state.selectedStepIndex];
    if (!step || !candidate) {
      return;
    }

    previewSymbolSwap(step.symbol, candidate.symbol, state.selectedStepIndex, {
      label: "Before / After",
      detail: `Step ${state.selectedStepIndex + 1}: ${step.symbol} -> ${candidate.symbol}.`,
      promote: buildCandidatePromotionPayload(candidate),
    });
  }

  function previewCandidateContext(candidate) {
    if (state.selectedStepIndex === null || state.landingIndex === null) {
      return;
    }

    const steps = getEditableSteps();
    const step = steps[state.selectedStepIndex];
    const landingStep = steps[state.landingIndex];
    if (!step || !candidate || !landingStep) {
      return;
    }

    previewCadenceSwap(
      step.symbol,
      candidate.symbol,
      state.selectedStepIndex,
      landingStep.symbol,
      landingStep.symbol,
      {
        label: "Cadence Path",
        detail: `Step ${state.selectedStepIndex + 1} against landing step ${state.landingIndex + 1}.`,
        promote: buildCandidatePromotionPayload(candidate),
      }
    );
  }

  function renderMirrors() {
    Array.from(ui.mirrorList.querySelectorAll(".mirror-chip:not(.base-chip), .mirror-group")).forEach((node) => node.remove());
    const baseChip = ui.mirrorList.querySelector('[data-variant-id="base"]');
    baseChip.classList.toggle("active", state.activeVariantId === "base");

    buildMirrorGroups().forEach((group) => {
      const section = document.createElement("section");
      section.className = "mirror-group";
      const displayTitle = state.stackLabels[group.key] || group.title;
      const displaySubtitle = state.stackLabels[group.key] ? `${group.title} · ${group.subtitle}` : group.subtitle;
      const stackNote = state.stackNotes[group.key] || "";
      section.innerHTML = `
        <div class="mirror-group-title">
          <div>
            <strong>${displayTitle}</strong>
            <span>${displaySubtitle}</span>
          </div>
        </div>
        ${stackNote ? `<p class="mirror-group-note">${stackNote}</p>` : ""}
      `;
      const header = section.querySelector(".mirror-group-title");
      const labelButton = document.createElement("button");
      labelButton.className = "ghost-button";
      labelButton.textContent = state.stackLabels[group.key] ? "Edit Label" : "Label Stack";
      labelButton.addEventListener("click", () => editMirrorStackLabel(group));
      const noteButton = document.createElement("button");
      noteButton.className = "ghost-button";
      noteButton.textContent = stackNote ? "Edit Note" : "Add Note";
      noteButton.addEventListener("click", () => editMirrorStackNote(group));
      const groupPreviewButton = document.createElement("button");
      groupPreviewButton.className = "ghost-button";
      groupPreviewButton.textContent = "Cycle Stack";
      groupPreviewButton.disabled = group.mirrors.length < 2;
      groupPreviewButton.addEventListener("click", () => previewMirrorStack(group));
      const titleActions = document.createElement("div");
      titleActions.className = "mirror-group-actions";
      titleActions.appendChild(labelButton);
      titleActions.appendChild(noteButton);
      titleActions.appendChild(groupPreviewButton);
      header.appendChild(titleActions);
      const row = document.createElement("div");
      row.className = "mirror-group-row";

      group.mirrors.forEach((mirror) => {
        const chip = document.createElement("button");
        chip.className = "mirror-chip";
        chip.dataset.variantId = mirror.id;
        chip.textContent = `${mirror.axis}: ${mirror.name}`;
        if (mirror.provenance?.label) {
          chip.title = mirror.provenance.label;
        }
        if (state.activeVariantId === mirror.id) {
          chip.classList.add("active");
        }
        row.appendChild(chip);
      });

      section.appendChild(row);
      ui.mirrorList.appendChild(section);
    });

    ui.mirrorEmptyCopy.classList.toggle("hidden", state.mirrors.length > 0);
    const compareTarget = getCompareTarget();
    const diffItems = getActiveDiffItems(compareTarget);
    if (compareTarget?.kind === "mirror") {
      ui.compareSummaryText.textContent = `Editing: ${compareTarget.axis} mirror. ${diffItems.length} diff step(s) from base.`;
    } else if (compareTarget?.kind === "draft") {
      ui.compareSummaryText.textContent = `Current draft has ${diffItems.length} pending diff step(s) from base.`;
    } else {
      ui.compareSummaryText.textContent = "Start from a base loop, then store one focused change as a mirror.";
    }
    renderCompareProvenance(compareTarget);

    ui.newMirrorButton.disabled = !(state.lastChange && state.activeVariantId === "base" && !state.bypassEdits);
    ui.flashCompareButton.disabled = !compareTarget || !diffItems.length;
    ui.previewDiffButton.disabled = !compareTarget || !diffItems.length;
    ui.resetDraftButton.disabled = !(compareTarget?.kind === "draft");
    ui.renameMirrorButton.disabled = !(compareTarget?.kind === "mirror");
    ui.deleteMirrorButton.disabled = !(compareTarget?.kind === "mirror");
    renderDiffSummary(diffItems);
  }

  function buildMirrorGroups() {
    const groups = new Map();
    state.mirrors.forEach((mirror) => {
      const info = getMirrorStackInfo(mirror);
      if (!groups.has(info.key)) {
        groups.set(info.key, {
          key: info.key,
          title: info.title,
          sourceKinds: new Set(),
          stepIndex: info.stepIndex,
          axisOrder: info.axisOrder,
          mirrors: [],
        });
      }
      const group = groups.get(info.key);
      group.sourceKinds.add(info.sourceKind);
      group.mirrors.push(mirror);
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        subtitle:
          group.sourceKinds.size > 1
            ? "Mixed sources"
            : group.sourceKinds.has("audition")
              ? "Promoted auditions"
              : "Saved from draft",
      }))
      .sort((left, right) => {
        if (left.stepIndex !== right.stepIndex) {
          return left.stepIndex - right.stepIndex;
        }
        return left.axisOrder - right.axisOrder;
      });
  }

  function getMirrorStackInfo(mirror) {
    const stepIndex = typeof mirror.lastChange?.stepIndex === "number" ? mirror.lastChange.stepIndex : 999;
    const axisOrderMap = { Color: 0, Timing: 1, Link: 2 };
    const axisOrder = axisOrderMap[mirror.axis] ?? 9;
    const stepLabel = stepIndex === 999 ? "Orbit-wide" : `Step ${stepIndex + 1}`;
    return {
      key: `${stepLabel}-${mirror.axis}`,
      title: `${stepLabel} · ${mirror.axis}`,
      sourceKind: mirror.provenance?.kind === "audition" ? "audition" : "draft",
      stepIndex,
      axisOrder,
    };
  }

  function editMirrorStackLabel(group) {
    if (!group?.key) {
      return;
    }
    const currentLabel = state.stackLabels[group.key] || "";
    const nextLabel = window.prompt(`Label for ${group.title}`, currentLabel);
    if (nextLabel === null) {
      return;
    }

    const trimmed = nextLabel.trim();
    if (trimmed) {
      state.stackLabels[group.key] = trimmed;
      state.sessionMessage = `Labeled stack: ${trimmed}.`;
      showToast("Stack label saved");
    } else {
      delete state.stackLabels[group.key];
      state.sessionMessage = `Removed label from ${group.title}.`;
      showToast("Stack label removed");
    }
    persistSession();
    render();
  }

  function editMirrorStackNote(group) {
    if (!group?.key) {
      return;
    }
    const currentNote = state.stackNotes[group.key] || "";
    const nextNote = window.prompt(`One-line summary for ${group.title}`, currentNote);
    if (nextNote === null) {
      return;
    }

    const trimmed = nextNote.trim();
    if (trimmed) {
      state.stackNotes[group.key] = trimmed;
      state.sessionMessage = `Saved note for ${state.stackLabels[group.key] || group.title}.`;
      showToast("Stack note saved");
    } else {
      delete state.stackNotes[group.key];
      state.sessionMessage = `Removed note from ${state.stackLabels[group.key] || group.title}.`;
      showToast("Stack note removed");
    }
    persistSession();
    render();
  }

  function previewMirrorStack(group) {
    if (!group?.mirrors?.length) {
      return;
    }

    const frames = [];
    let offset = 0;
    const baseStepIndex = group.stepIndex !== 999 ? group.stepIndex : (group.mirrors[0].lastChange?.stepIndex ?? state.landingIndex ?? 0);
    const baseStepSymbol = state.baseSteps[baseStepIndex]?.symbol;
    const baseLandingSymbol = state.landingIndex !== null ? state.baseSteps[state.landingIndex]?.symbol : null;

    if (baseStepSymbol) {
      frames.push({ at: offset, focusIndex: baseStepIndex, symbol: baseStepSymbol });
      offset += 320;
      if (state.landingIndex !== null && state.landingIndex !== baseStepIndex && baseLandingSymbol) {
        frames.push({ at: offset, focusIndex: state.landingIndex, symbol: baseLandingSymbol });
        offset += 440;
      }
    }

    group.mirrors.forEach((mirror) => {
      const stepIndex = typeof mirror.lastChange?.stepIndex === "number" ? mirror.lastChange.stepIndex : baseStepIndex;
      const stepSymbol = mirror.steps[stepIndex]?.symbol;
      const landingSymbol = state.landingIndex !== null ? mirror.steps[state.landingIndex]?.symbol : null;
      if (stepSymbol) {
        frames.push({ at: offset, focusIndex: stepIndex, symbol: stepSymbol });
        offset += 320;
      }
      if (state.landingIndex !== null && state.landingIndex !== stepIndex && landingSymbol) {
        frames.push({ at: offset, focusIndex: state.landingIndex, symbol: landingSymbol });
        offset += 440;
      } else {
        offset += 180;
      }
    });

    runAuditionSequence(frames, {
      label: "Stack Compare",
      detail: `${group.title} cycling ${group.mirrors.length} mirrors.`,
      record: true,
    });
  }

  function renderCompareProvenance(compareTarget) {
    if (compareTarget?.kind !== "mirror") {
      ui.compareProvenanceText.classList.add("hidden");
      ui.compareProvenanceText.textContent = "";
      return;
    }
    const mirror = state.mirrors.find((item) => item.id === compareTarget.id);
    const provenance = mirror?.provenance?.label;
    if (!provenance) {
      ui.compareProvenanceText.classList.add("hidden");
      ui.compareProvenanceText.textContent = "";
      return;
    }
    ui.compareProvenanceText.textContent = provenance;
    ui.compareProvenanceText.classList.remove("hidden");
  }

  function getCompareTarget() {
    const activeMirror = state.mirrors.find((mirror) => mirror.id === state.activeVariantId);
    if (activeMirror) {
      return {
        kind: "mirror",
        id: activeMirror.id,
        axis: activeMirror.axis,
        label: `${activeMirror.axis} mirror`,
        steps: activeMirror.steps,
      };
    }
    if (state.activeVariantId === "base" && !state.bypassEdits) {
      const diffs = getVariantDiffs(state.currentSteps);
      if (diffs.length) {
        return {
          kind: "draft",
          id: "base",
          axis: state.lastChange?.normalizedAxis || "Draft",
          label: "Current draft",
          steps: state.currentSteps,
        };
      }
    }
    return null;
  }

  function getActiveDiffItems(compareTarget) {
    if (!compareTarget) {
      return [];
    }

    return getVariantDiffs(compareTarget.steps).map((diff) =>
      buildDiffItem(compareTarget, diff)
    );
  }

  function buildDiffItem(compareTarget, diff) {
    return {
      index: diff.index,
      title: `${compareTarget.kind === "mirror" ? compareTarget.axis : "Draft"} diff on step ${diff.index + 1}`,
      body: `${diff.before} -> ${diff.after}`,
      ...summarizeStepImpact(state.baseSteps, compareTarget.steps, diff.index),
    };
  }

  function summarizeStepImpact(beforeSteps, afterSteps, index) {
    const beforeRole = detectRole(beforeSteps, index);
    const afterRole = detectRole(afterSteps, index);
    return {
      meta: describeRoleTransition(beforeRole, afterRole),
      nuance: describeArrivalQuality(afterSteps, index),
    };
  }

  function describeRoleTransition(beforeRole, afterRole) {
    if (beforeRole === afterRole) {
      return `Role stays ${beforeRole}.`;
    }
    return `Role shifts ${beforeRole} -> ${afterRole}.`;
  }

  function describeArrivalQuality(steps, index) {
    const step = steps[index];
    if (!step) {
      return "No arrival note available.";
    }

    const role = detectRole(steps, index);
    const lower = step.symbol.toLowerCase();

    if (role === "tonic return") {
      if (lower.includes("6/9")) {
        return "Arrival softens into a more open tonic color.";
      }
      if (lower.includes("#11")) {
        return "Arrival stays tonic but opens into a brighter, airier top color.";
      }
      if (lower.includes("sus")) {
        return "Arrival holds tension a moment longer before settling.";
      }
      return "Arrival lands clearly on the target harmony.";
    }

    if (role === "dominant") {
      if (lower.includes("alt")) {
        return "Approach adds sharper bite before the landing.";
      }
      if (lower.includes("#11")) {
        return "Approach keeps the pull but sounds sleeker and less blunt.";
      }
      if (lower.includes("sus")) {
        return "Approach delays the release, making the cadence lean back.";
      }
      return "Approach points directly into the landing.";
    }

    if (role === "pre-dominant") {
      if (lower.includes("m9")) {
        return "Preparation widens out before the cadence tightens.";
      }
      if (lower.includes("m7b5") || lower.includes("dim")) {
        return "Preparation turns grainier and more fragile.";
      }
      return "Preparation sets up the dominant with more weight than a passing step.";
    }

    if (step.symbol.includes("->")) {
      return "This step now behaves like a moving connector instead of a held color.";
    }
    if (lower.includes("dim")) {
      return "Connector tightens with a more chromatic pull.";
    }
    if (lower.includes("sus")) {
      return "Connector relaxes and keeps the phrase slightly unresolved.";
    }
    return "This change mostly alters connective color rather than function.";
  }

  function getVariantDiffs(compareSteps) {
    const diffs = [];
    const total = Math.max(state.baseSteps.length, compareSteps ? compareSteps.length : 0);
    for (let index = 0; index < total; index += 1) {
      const before = state.baseSteps[index]?.symbol || "";
      const after = compareSteps?.[index]?.symbol || "";
      if (before !== after) {
        diffs.push({ index, before, after });
      }
    }
    return diffs;
  }

  function renderDiffSummary(diffItems) {
    ui.diffSummaryList.innerHTML = "";
    if (!diffItems.length) {
      ui.diffSummaryList.innerHTML = '<p class="dock-copy">No diff to summarize yet.</p>';
      return;
    }

    diffItems.forEach((item) => {
      const block = document.createElement("div");
      block.className = "diff-item";
      if (item.index === state.compareFocusStepIndex) {
        block.classList.add("compare-focus");
      }
      block.innerHTML = `
        <div>
          <strong>${item.title}</strong>
          <span>${item.body}</span>
          <p class="diff-meta">${item.meta}</p>
          <p class="diff-note">${item.nuance}</p>
        </div>
      `;
      const button = document.createElement("button");
      const actions = document.createElement("div");
      actions.className = "diff-actions";
      button.className = "ghost-button";
      button.textContent = "Play";
      button.addEventListener("click", () => previewDiffPair(item.index));
      actions.appendChild(button);
      const contextButton = document.createElement("button");
      contextButton.className = "ghost-button";
      contextButton.textContent = "Path";
      contextButton.addEventListener("click", () => previewDiffCadence(item.index));
      actions.appendChild(contextButton);
      block.appendChild(actions);
      ui.diffSummaryList.appendChild(block);
    });
  }

  function renderTransport() {
    const hasLoop = state.baseSteps.length > 0;
    const hasLanding = state.landingIndex !== null;
    ui.playLoopButton.disabled = !hasLoop || !ui.loopToggle.checked;
    ui.playLoopButton.textContent = state.isPlaying ? "Pause" : "Play Loop";
    ui.soloZoneButton.disabled = !hasLanding;
    ui.bypassEditsButton.disabled = !hasLoop;
    ui.backToBaseButton.disabled = state.activeVariantId === "base";
    ui.clearAuditionsButton.disabled = !state.auditionTrail.some((entry) => !entry.pinned);
    ui.soloZoneButton.className = state.soloZone ? "primary-button" : "ghost-button";
    ui.bypassEditsButton.className = state.bypassEdits ? "primary-button" : "ghost-button";
  }

  function renderAuditionTrail() {
    ui.auditionTrail.innerHTML = "";
    if (!state.auditionTrail.length) {
      ui.auditionTrail.innerHTML = '<p class="dock-copy">No audition history yet.</p>';
      return;
    }

    getSortedAuditionTrail().forEach((entry) => {
      const item = document.createElement("div");
      item.className = "audition-item";
      if (entry.pinned) {
        item.classList.add("pinned");
      }
      const pinMarkup = entry.pinned ? '<span class="pin-badge">Pinned</span>' : "";
      item.innerHTML = `
        <div>
          <div class="audition-headline">
            <strong>${entry.label}</strong>
            ${pinMarkup}
          </div>
          <span>${entry.detail}</span>
          ${entry.note ? `<p class="audition-note">${entry.note}</p>` : ""}
        </div>
      `;
      const actions = document.createElement("div");
      actions.className = "audition-actions";
      const replayButton = document.createElement("button");
      replayButton.className = "ghost-button";
      replayButton.textContent = "Replay";
      replayButton.addEventListener("click", () => replayAudition(entry.id));
      actions.appendChild(replayButton);
      const pinButton = document.createElement("button");
      pinButton.className = "ghost-button";
      pinButton.textContent = entry.pinned ? "Unpin" : "Pin";
      pinButton.addEventListener("click", () => togglePinAudition(entry.id));
      actions.appendChild(pinButton);
      const promoteButton = document.createElement("button");
      promoteButton.className = "ghost-button";
      promoteButton.textContent = "Promote";
      promoteButton.disabled = !(entry.pinned && entry.promote);
      promoteButton.addEventListener("click", () => promoteAuditionToMirror(entry.id));
      actions.appendChild(promoteButton);
      const noteButton = document.createElement("button");
      noteButton.className = "ghost-button";
      noteButton.textContent = entry.note ? "Edit Note" : "Add Note";
      noteButton.disabled = !entry.pinned;
      noteButton.addEventListener("click", () => editAuditionNote(entry.id));
      actions.appendChild(noteButton);
      item.appendChild(actions);
      ui.auditionTrail.appendChild(item);
    });
  }

  function getSortedAuditionTrail() {
    return [...state.auditionTrail].sort((left, right) => {
      if (left.pinned !== right.pinned) {
        return left.pinned ? -1 : 1;
      }
      return (right.createdAt || 0) - (left.createdAt || 0);
    });
  }

  function renderSnapshots() {
    ui.addSnapshotButton.disabled = !state.baseSteps.length;
    ui.undoButton.disabled = !state.historyStack.length;
    ui.redoButton.disabled = !state.futureStack.length;
    ui.historyFeedback.textContent = state.historyStack.length
      ? `${state.historyStack.length} undo step(s), ${state.futureStack.length} redo step(s).`
      : "No edits in history yet.";

    ui.snapshotList.innerHTML = "";
    if (!state.snapshots.length) {
      ui.snapshotList.innerHTML = '<p class="dock-copy">No snapshots yet.</p>';
      return;
    }

    state.snapshots.forEach((snapshot) => {
      const item = document.createElement("div");
      item.className = "snapshot-item";
      item.innerHTML = `
        <div>
          <strong>${snapshot.name}</strong>
          <span>${snapshot.createdAt}</span>
        </div>
      `;
      const button = document.createElement("button");
      button.className = "ghost-button";
      button.textContent = "Restore";
      button.addEventListener("click", () => restoreSnapshot(snapshot.id));
      const actions = document.createElement("div");
      actions.className = "snapshot-actions";
      actions.appendChild(button);
      const deleteButton = document.createElement("button");
      deleteButton.className = "ghost-button";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteSnapshot(snapshot.id));
      actions.appendChild(deleteButton);
      item.appendChild(actions);
      ui.snapshotList.appendChild(item);
    });
  }

  function deleteSnapshot(snapshotId) {
    const item = state.snapshots.find((snapshot) => snapshot.id === snapshotId);
    if (!item) {
      return;
    }
    const confirmed = window.confirm(`Delete snapshot "${item.name}"?`);
    if (!confirmed) {
      return;
    }

    state.snapshots = state.snapshots.filter((snapshot) => snapshot.id !== snapshotId);
    state.sessionMessage = `Deleted snapshot: ${item.name}.`;
    persistSession();
    render();
    showToast("Snapshot deleted");
  }

  function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 1800);
  }

  function clearCompareFlashTimers() {
    state.compareFlashTimers.forEach((timerId) => window.clearTimeout(timerId));
    state.compareFlashTimers = [];
    state.compareFocusStepIndex = null;
  }

  function addAuditionMemory(label, detail, frames, promote) {
    if (!frames.length) {
      return;
    }
    state.auditionTrail.unshift({
      id: `audition-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      label,
      detail,
      note: "",
      pinned: false,
      createdAt: Date.now(),
      promote: promote
        ? {
            ...promote,
            steps: cloneSteps(promote.steps || []),
            lastChange: promote.lastChange ? { ...promote.lastChange } : null,
          }
        : null,
      frames: frames.map((frame) => ({ ...frame })),
    });
    trimAuditionTrail();
    persistSession();
  }

  function clearAuditionTrail() {
    if (!state.auditionTrail.some((entry) => !entry.pinned)) {
      return;
    }
    state.auditionTrail = state.auditionTrail.filter((entry) => entry.pinned);
    state.sessionMessage = "Unpinned auditions cleared.";
    persistSession();
    render();
    showToast("Unpinned auditions cleared");
  }

  function replayAudition(entryId) {
    const entry = state.auditionTrail.find((item) => item.id === entryId);
    if (!entry) {
      return;
    }
    runAuditionSequence(entry.frames, { record: false });
  }

  function togglePinAudition(entryId) {
    const entry = state.auditionTrail.find((item) => item.id === entryId);
    if (!entry) {
      return;
    }
    entry.pinned = !entry.pinned;
    if (entry.pinned) {
      entry.pinnedAt = Date.now();
      state.sessionMessage = `Pinned audition: ${entry.label}.`;
      showToast("Audition pinned");
    } else {
      delete entry.pinnedAt;
      entry.note = "";
      state.sessionMessage = `Unpinned audition: ${entry.label}.`;
      showToast("Audition unpinned");
    }
    trimAuditionTrail();
    persistSession();
    render();
  }

  function promoteAuditionToMirror(entryId) {
    const entry = state.auditionTrail.find((item) => item.id === entryId);
    if (!entry || !entry.pinned || !entry.promote) {
      return;
    }

    pushHistory("promote audition");
    const promote = entry.promote;
    const mirror = createMirrorRecord(
      promote.axis || "Color",
      promote.name || entry.label.toLowerCase(),
      promote.steps || state.currentSteps,
      promote.lastChange || null,
      {
        kind: "audition",
        label: `Promoted from pinned audition: ${entry.label}.${entry.note ? ` ${entry.note}` : ""}`,
        auditionId: entry.id,
      }
    );
    state.mirrors.push(mirror);
    state.activeVariantId = mirror.id;
    state.bypassEdits = false;
    state.sessionMessage = `Promoted audition to mirror: ${mirror.axis}: ${mirror.name}.`;
    persistSession();
    render();
    showToast("Audition promoted");
  }

  function editAuditionNote(entryId) {
    const entry = state.auditionTrail.find((item) => item.id === entryId);
    if (!entry || !entry.pinned) {
      return;
    }

    const nextNote = window.prompt("Why keep this audition?", entry.note || "");
    if (nextNote === null) {
      return;
    }

    entry.note = nextNote.trim();
    state.sessionMessage = entry.note
      ? `Note saved for ${entry.label}.`
      : `Note cleared for ${entry.label}.`;
    persistSession();
    render();
    showToast(entry.note ? "Note saved" : "Note cleared");
  }

  function trimAuditionTrail() {
    const pinned = state.auditionTrail.filter((entry) => entry.pinned);
    const unpinned = state.auditionTrail.filter((entry) => !entry.pinned).slice(0, 8);
    state.auditionTrail = [...pinned, ...unpinned].slice(0, 12);
  }

  function flashCompare() {
    const compareTarget = getCompareTarget();
    const diffs = compareTarget ? getVariantDiffs(compareTarget.steps) : [];
    if (!compareTarget || !diffs.length) {
      return;
    }

    clearCompareFlashTimers();
    const originalVariantId = state.activeVariantId;
    const originalBypassEdits = state.bypassEdits;
    let offset = 0;

    diffs.forEach((diff) => {
      state.compareFlashTimers.push(
        window.setTimeout(() => {
          state.compareFocusStepIndex = diff.index;
          showBaseReferenceView();
          render();
          playChordPreview(diff.before);
        }, offset)
      );
      offset += 380;
      state.compareFlashTimers.push(
        window.setTimeout(() => {
          state.compareFocusStepIndex = diff.index;
          showCompareTargetView(compareTarget);
          render();
          playChordPreview(diff.after);
        }, offset)
      );
      offset += 460;
    });

    state.compareFlashTimers.push(
      window.setTimeout(() => {
        state.compareFocusStepIndex = null;
        state.activeVariantId = originalVariantId;
        state.bypassEdits = originalBypassEdits;
        render();
      }, offset)
    );
  }

  function previewCurrentDiff() {
    const compareTarget = getCompareTarget();
    const diffs = compareTarget ? getVariantDiffs(compareTarget.steps) : [];
    if (!compareTarget || !diffs.length) {
      return;
    }

    const frames = [];
    let offset = 0;
    diffs.forEach((diff) => {
      frames.push({ at: offset, focusIndex: diff.index, symbol: diff.before });
      offset += 320;
      frames.push({ at: offset, focusIndex: diff.index, symbol: diff.after });
      offset += 420;
    });
    runAuditionSequence(frames, {
      label: "Play Diff",
      detail: `${diffs.length} diff step(s) in sequence.`,
      promote: buildDraftPromotionPayload(compareTarget, diffs[diffs.length - 1]),
    });
  }

  function previewDiffPair(stepIndex) {
    const compareTarget = getCompareTarget();
    const diff = compareTarget ? getVariantDiffs(compareTarget.steps).find((item) => item.index === stepIndex) : null;
    if (!diff) {
      return;
    }

    previewSymbolSwap(diff.before, diff.after, diff.index, {
      label: "Before / After",
      detail: `Step ${diff.index + 1}: ${diff.before || "-"} -> ${diff.after || "-"}.`,
      promote: buildDraftPromotionPayload(compareTarget, diff),
    });
  }

  function previewDiffCadence(stepIndex) {
    const compareTarget = getCompareTarget();
    const diff = compareTarget ? getVariantDiffs(compareTarget.steps).find((item) => item.index === stepIndex) : null;
    if (!diff) {
      return;
    }

    const landingIndex = state.landingIndex;
    const baseLandingSymbol = landingIndex !== null ? state.baseSteps[landingIndex]?.symbol : null;
    const compareLandingSymbol = landingIndex !== null ? compareTarget.steps[landingIndex]?.symbol : null;

    previewCadenceSwap(
      diff.before,
      diff.after,
      diff.index,
      baseLandingSymbol,
      compareLandingSymbol,
      {
        label: "Cadence Path",
        detail: `Step ${diff.index + 1} against landing step ${state.landingIndex + 1}.`,
        promote: buildDraftPromotionPayload(compareTarget, diff),
      }
    );
  }

  function previewSymbolSwap(beforeSymbol, afterSymbol, stepIndex, options = {}) {
    if (!beforeSymbol && !afterSymbol) {
      return;
    }

    runAuditionSequence(
      [
        { at: 0, focusIndex: stepIndex, symbol: beforeSymbol },
        { at: 360, focusIndex: stepIndex, symbol: afterSymbol },
      ],
      {
        label: options.label || "Before / After",
        detail: options.detail || `Step ${stepIndex + 1}: ${beforeSymbol || "-"} -> ${afterSymbol || "-"}.`,
        promote: options.promote || null,
      }
    );
  }

  function previewCadenceSwap(beforeSymbol, afterSymbol, stepIndex, beforeLandingSymbol, afterLandingSymbol, options = {}) {
    if (state.landingIndex === null || stepIndex === state.landingIndex || (!beforeLandingSymbol && !afterLandingSymbol)) {
      previewSymbolSwap(beforeSymbol, afterSymbol, stepIndex, options);
      return;
    }

    runAuditionSequence(
      [
        { at: 0, focusIndex: stepIndex, symbol: beforeSymbol },
        { at: 320, focusIndex: state.landingIndex, symbol: beforeLandingSymbol },
        { at: 760, focusIndex: stepIndex, symbol: afterSymbol },
        { at: 1120, focusIndex: state.landingIndex, symbol: afterLandingSymbol },
      ],
      {
        label: options.label || "Cadence Path",
        detail: options.detail || `Step ${stepIndex + 1} against landing step ${state.landingIndex + 1}.`,
        promote: options.promote || null,
      }
    );
  }

  function runAuditionSequence(frames, options = {}) {
    const validFrames = frames.filter((frame) => frame && frame.symbol);
    if (!validFrames.length) {
      return;
    }

    clearCompareFlashTimers();
    stopPlayback();
    validFrames.forEach((frame) => {
      state.compareFlashTimers.push(
        window.setTimeout(() => {
          state.compareFocusStepIndex = typeof frame.focusIndex === "number" ? frame.focusIndex : null;
          render();
          playChordPreview(frame.symbol);
        }, frame.at)
      );
    });

    const finalTime = validFrames[validFrames.length - 1].at + 420;
    state.compareFlashTimers.push(
      window.setTimeout(() => {
        state.compareFocusStepIndex = null;
        render();
      }, finalTime)
    );

    if (options.record !== false) {
      addAuditionMemory(
        options.label || "Audition",
        options.detail || "Recent preview.",
        validFrames,
        options.promote || null
      );
      render();
    }
  }

  function showBaseReferenceView() {
    state.activeVariantId = "base";
    state.bypassEdits = true;
  }

  function showCompareTargetView(compareTarget) {
    state.activeVariantId = compareTarget.id;
    state.bypassEdits = false;
  }

  function saveSession() {
    if (!state.baseSteps.length) {
      state.sessionMessage = "Nothing to save yet.";
      render();
      return;
    }
    if (persistSession()) {
      state.sessionMessage = "Session saved locally.";
      showToast("Session saved");
      render();
    }
  }

  function restoreSession() {
    const storage = getStorage();
    if (!storage) {
      state.sessionMessage = "Local storage is unavailable in this browser.";
      render();
      return;
    }

    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      state.sessionMessage = "No saved session found.";
      render();
      return;
    }

    try {
      const data = JSON.parse(raw);
      applySessionData(data, "Saved session restored.");
      showToast("Session restored");
    } catch (error) {
      state.sessionMessage = "Saved session could not be restored.";
      render();
    }
  }

  function clearSavedSession() {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEY);
    }
    state.sessionMessage = "Saved session cleared.";
    syncSessionControls();
    render();
    showToast("Saved session cleared");
  }

  function exportSession() {
    if (!state.baseSteps.length) {
      state.sessionMessage = "Nothing to export yet.";
      render();
      return;
    }

    const payload = createSessionPayload();
    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.download = `harmonic-orbit-session-${stamp}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      state.sessionMessage = "Session exported as JSON.";
      render();
      showToast("Session exported");
    } catch (error) {
      state.sessionMessage = "Session export failed.";
      render();
    }
  }

  function triggerImportSession() {
    ui.importSessionInput.value = "";
    ui.importSessionInput.click();
  }

  function importSessionFromFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || ""));
        applySessionData(data, "Session imported from JSON.");
        showToast("Session imported");
      } catch (error) {
        state.sessionMessage = "Imported JSON could not be restored.";
        render();
      }
    };
    reader.onerror = () => {
      state.sessionMessage = "Session import failed.";
      render();
    };
    reader.readAsText(file);
  }

  function persistSession() {
    const storage = getStorage();
    if (!storage || !state.baseSteps.length) {
      return false;
    }

    const payload = createSessionPayload();

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (error) {
      return false;
    }
  }

  function getStorage() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  function syncSessionControls() {
    const storage = getStorage();
    const hasSaved = !!(storage && storage.getItem(STORAGE_KEY));
    ui.restoreSessionButton.disabled = !hasSaved;
    ui.clearSessionButton.disabled = !hasSaved;
    ui.exportSessionButton.disabled = !state.baseSteps.length;
  }

  function createSessionPayload() {
    return {
      loopInput: state.loopInput,
      baseSteps: state.baseSteps,
      currentSteps: state.currentSteps,
      landingIndex: state.landingIndex,
      zoneStart: state.zoneStart,
      zoneEnd: state.zoneEnd,
      selectedAxis: state.selectedAxis,
      activeVariantId: state.activeVariantId,
      mirrors: state.mirrors,
      stackLabels: state.stackLabels,
      stackNotes: state.stackNotes,
      auditionTrail: state.auditionTrail,
      snapshots: state.snapshots,
      lastChange: state.lastChange,
      bypassEdits: state.bypassEdits,
      soloZone: state.soloZone,
    };
  }

  function applySessionData(data, successMessage) {
    if (!data || !Array.isArray(data.baseSteps) || !data.baseSteps.length) {
      throw new Error("Invalid session");
    }

    state.loopInput = data.loopInput || DEMO_LOOP;
    ui.loopInput.value = state.loopInput;
    state.loopValidation = validateLoopInput(state.loopInput);
    state.baseSteps = cloneSteps(data.baseSteps);
    state.currentSteps = cloneSteps(data.currentSteps || data.baseSteps);
    state.landingIndex = typeof data.landingIndex === "number" ? data.landingIndex : null;
    state.zoneStart = typeof data.zoneStart === "number" ? data.zoneStart : null;
    state.zoneEnd = typeof data.zoneEnd === "number" ? data.zoneEnd : null;
    state.selectedStepIndex = null;
    state.selectedAxis = data.selectedAxis || "Color";
    state.activeVariantId = data.activeVariantId || "base";
    state.mirrors = Array.isArray(data.mirrors)
      ? data.mirrors.map((mirror) => ({
          ...mirror,
          steps: cloneSteps(mirror.steps || []),
          lastChange: mirror.lastChange || null,
        }))
      : [];
    state.stackLabels = data.stackLabels && typeof data.stackLabels === "object"
      ? { ...data.stackLabels }
      : {};
    state.stackNotes = data.stackNotes && typeof data.stackNotes === "object"
      ? { ...data.stackNotes }
      : {};
    state.auditionTrail = Array.isArray(data.auditionTrail)
      ? data.auditionTrail.map((entry) => ({
          ...entry,
          note: entry.note || "",
          pinned: Boolean(entry.pinned),
          createdAt: entry.createdAt || Date.now(),
          promote: entry.promote
            ? {
                ...entry.promote,
                steps: cloneSteps(entry.promote.steps || []),
                lastChange: entry.promote.lastChange ? { ...entry.promote.lastChange } : null,
              }
            : null,
          frames: Array.isArray(entry.frames) ? entry.frames.map((frame) => ({ ...frame })) : [],
        }))
      : [];
    state.snapshots = Array.isArray(data.snapshots)
      ? data.snapshots.map((snapshot) => ({
          ...snapshot,
          snapshot: snapshot.snapshot || captureEditableState(),
        }))
      : [];
    state.historyStack = [];
    state.futureStack = [];
    state.lastChange = data.lastChange || null;
    state.bypassEdits = Boolean(data.bypassEdits);
    state.soloZone = Boolean(data.soloZone);
    state.sessionMessage = successMessage;
    stopPlayback();
    updateRoles(state.currentSteps);
    persistSession();
    render();
  }

  function renderInputFeedback() {
    ui.loopFeedback.textContent = state.loopValidation.message;
    ui.loopFeedback.className = "feedback-text";
    if (state.loopValidation.valid) {
      ui.loopFeedback.classList.add("success");
    } else if (state.loopInput) {
      ui.loopFeedback.classList.add("error");
    }
  }

  function renderSessionFeedback() {
    ui.sessionFeedback.textContent = state.sessionMessage;
    ui.sessionFeedback.className = "feedback-text info";
  }
})();
