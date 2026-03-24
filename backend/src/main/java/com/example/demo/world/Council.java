package com.example.demo.world;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Council: observer agents (Doctor, Psychologist, Judge) that evaluate and verify
 * the behavior of acting agents. Council members do not move; they analyze world
 * events and agent state and record diagnostics, behaviour notes, and conflicts.
 * This structure is designed to be extended later with LLM-powered council agents.
 */
public class Council {

    private static final int MAX_DIAGNOSTICS = 50;
    private static final int MAX_CONFLICTS = 100;

    /** Diagnostic observations from the Doctor (e.g. hallucination-style indicators). */
    private final List<String> diagnostics;
    /** Behaviour notes per agent (agentId -> note), updated by the Psychologist. */
    private final Map<String, String> behaviourNotes;
    /** Conflict log from the Judge (same-cell or rule violations). */
    private final List<String> conflicts;

    public Council() {
        this.diagnostics = new ArrayList<>();
        this.behaviourNotes = new HashMap<>();
        this.conflicts = new ArrayList<>();
    }

    public List<String> getDiagnostics() {
        return diagnostics;
    }

    /** Append a diagnostic note and cap list size. */
    public void addDiagnostic(String note) {
        diagnostics.add(note);
        while (diagnostics.size() > MAX_DIAGNOSTICS) {
            diagnostics.remove(0);
        }
    }

    public Map<String, String> getBehaviourNotes() {
        return behaviourNotes;
    }

    public List<String> getConflicts() {
        return conflicts;
    }

    /** Append a conflict entry and cap list size. */
    public void addConflict(String entry) {
        conflicts.add(entry);
        while (conflicts.size() > MAX_CONFLICTS) {
            conflicts.remove(0);
        }
    }

    /** Clear all council data (e.g. on world reset). */
    public void clear() {
        diagnostics.clear();
        behaviourNotes.clear();
        conflicts.clear();
    }
}
