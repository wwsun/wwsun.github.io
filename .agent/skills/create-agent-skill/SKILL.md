---
description: Create a new agent skill
---

# Create Agent Skill

This skill guides you through the process of creating a new agent skill.

## Steps

1.  **Ask for Skill Name**: Ask the user for the name of the new skill. Ensure it follows a kebab-case format (e.g., `my-new-skill`).
2.  **Ask for Description**: Ask the user for a brief description of what the skill does.
3.  **Create Directory**: Create a new directory for the skill at `.agent/skills/<skill-name>`.
4.  **Create SKILL.md**: Create a `SKILL.md` file inside the new directory with the following template:

    ```markdown
    ---
    description: <skill-description>
    ---

    # <skill-name-title-case>

    <skill-description>

    ## Instructions

    Add detailed instructions here.
    ```

5.  **Optional: Create Resources**: Ask the user if they want to create a `resources` or `scripts` directory. If yes, create them.
6.  **Confirmation**: confirm to the user that the skill has been created successfully.
