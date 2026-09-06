# Grade 4 Master QA — Completion Gate v2

## Scope
- Mission completion gate
- `data-ok` choice handling
- Critical Thinking save/edit behavior
- DOM rerender resilience
- Mission 60 completion path

## Gate rules
1. Choice missions start locked.
2. Only a `.choice[data-ok="true"]` selection unlocks completion.
3. Selecting an incorrect choice removes any previous correct marker and relocks completion.
4. Critical Thinking requires a saved answer of at least 20 trimmed characters.
5. Editing the answer after save immediately invalidates the saved state and relocks completion.
6. DOM rerender re-arms the gate for the newly rendered mission task.
7. Existing `data-complete` blocking feedback remains active.

## QA result
PASS — hardening committed in `grade4/grade4-qa-hardening.js`.

Commit: 4dbd9e44cb3c8fa5e8e1da99c871db79139cfe69
