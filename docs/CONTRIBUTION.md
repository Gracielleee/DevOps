# Development Workflow

## Overview
Our team of 4 uses **Google Space** for communication and task distribution. We follow a **milestone-based branching strategy** where tasks are self-selected, developed in feature branches, reviewed via PRs, and merged into a milestone branch before reaching `main`.

</br>

Here is a visual representation of our workflow:


```mermaid
graph TD
    subgraph "Main Branch"
        MAIN[main]
    end
    
    subgraph "Milestone Phase"
        MILESTONE[milestone-X]
    end
    
    subgraph "Feature Development"
        FEATURE1[feature/feature-name-1]
        FEATURE2[feature/feature-name-2]
        FEATURE3[feature/feature-name-3]
    end
    
    subgraph "Google Space"
        TASKS[ Task Distribution]
        SELECT[ Member Selection]
        REVIEW[ Code Review]
    end
    
    MAIN -->|Create| MILESTONE
    MILESTONE -->|Branch| FEATURE1
    MILESTONE -->|Branch| FEATURE2
    MILESTONE -->|Branch| FEATURE3
    
    TASKS --> SELECT
    SELECT --> FEATURE1
    SELECT --> FEATURE2
    SELECT --> FEATURE3
    
    FEATURE1 -->|PR| REVIEW
    FEATURE2 -->|PR| REVIEW
    FEATURE3 -->|PR| REVIEW
    
    REVIEW -->|Merge| MILESTONE
    MILESTONE -->|Merge| MAIN
    
    style MAIN fill:#2da44e,color:#fff
    style MILESTONE fill:#1f6feb,color:#fff
    style FEATURE1 fill:#76e3ea,color:#000
    style FEATURE2 fill:#76e3ea,color:#000
    style FEATURE3 fill:#76e3ea,color:#000
    style TASKS fill:#f0f6fc,color:#000
    style SELECT fill:#f0f6fc,color:#000
    style REVIEW fill:#f0f6fc,color:#000

```

### Process
#### 1. Communication & Task Distribution

  - Platform: Google Space
- Process:
        Tasks are posted in the space.
        Team members self-select tasks they wish to work on.


#### 2. Branching Strategy

We use a milestone-based model:
- Main Branch: `main`
- Milestone Branch: `milestone-X` (Created for each sprint/milestone)
- Feature Branches: `feature/<feature-name>` (Created from the milestone branch)


**Flow:**
  1. A new `milestone-X` branch is created from `main`.
  2. Developers branch off `milestone-X` to create `feature/...` branches.
  3. Once features are complete, they are merged back into `milestone-X`.
  4. Finally, `milestone-X` is merged into main.


#### 3. Pull Request (PR) Workflow

1. Develop: Work on your `feature/<name>` branch.
2. Submit PR: Open a Pull Request targeting the `milestone-X` branch.
3. Review: Team members review the code.
4. Merge: After approval and passing checks, merge into `milestone-X`.

#### 4. Code Quality Standards

All code must meet the following criteria before merging:
| Standard	| Requirement |
|---------|----------|
|Conflicts	|Branches must be rebased/merged cleanly.|
|Errors	|Browser console must be clean during testing.|
|Functionality|	All features must work as intended.|
|Peer Review	|At least one team member must approve the PR.|

> Note: If the errors are minor, the peer reviewer may correct and approve the merge. But if errors are significant, the submission will be returned to the team member for revision.
