---
title: My 20 Favorite ChatGPT Prompts for Coding in 2025
source: https://dev.to/therealmrmumba/my-20-favorite-chatgpt-prompts-for-coding-in-2025-5hk3
author:
  - "[[DEV Community]]"
published: 2025-07-25
created: 2025-07-25
description: I use ChatGPT almost every day as part of my coding workflow. Over time, I’ve learned that how you... Tagged with webdev, programming, java.
tags:
  - clippings
  - prompt
---
## I. Code Generation & Scaffolding

### 1\. Generate an Auth System Boilerplate

**Prompt:**

> Build a basic authentication system in \[framework\] using \[language\]. It should support login, logout, session/token management, and user registration. Use secure password hashing and include input validation.

### 2\. Create a CLI Tool Scaffold

**Prompt:**

> Generate a command-line interface tool in \[language\] that accepts flags for \[flag1\], \[flag2\], and performs \[task\]. Add helpful error messages and usage hints.

### 3\. API Endpoint with Validation

**Prompt:**

> Write a REST API endpoint using \[framework\] that accepts a POST request with \[fields\]. Validate input, handle errors, and respond with appropriate status codes.

### 4\. Code Generator for CRUD Operations

**Prompt:**

> Generate the full CRUD logic for managing a \[resource\] in \[framework\]. Include model definition, controller methods, and route setup.

### 5\. React Component with Props and State

**Prompt:**

> Create a React component named \[ComponentName\] that receives props \[prop1, prop2\], maintains local state \[state1\], and updates state based on user input. Include type annotations if using TypeScript.

---

## II. Code Debugging & Fix Suggestions

### 6\. Spot and Fix a Bug

**Prompt:**

> Here’s a snippet that isn’t working as expected:
> 
> `[insert code]`
> 
> Identify the bug, explain why it fails, and suggest a corrected version.

### 7\. Error Message Explanation

**Prompt:**

> I’m getting this error in \[language/framework\]:
> 
> `[paste error message]`
> 
> Based on this error and my stack, what’s likely causing it? Suggest at least one way to resolve it.

### 8\. Unexpected Output Diagnosis

**Prompt:**

> This function returns incorrect output:
> 
> `[insert function code]`
> 
> The expected result for input `[example input]` is `[expected output]`, but I get `[actual output]`. What might be wrong?

---

## III. Code Review & Refactoring

### 9\. Refactor for Readability and Best Practices

**Prompt:**

> Refactor the following code to be more readable, modular, and aligned with \[language\] best practices. Avoid redundant code and suggest naming improvements:
> 
> `[insert code]`

### 10\. Apply Design Patterns

**Prompt:**

> Rewrite this code using the \[pattern name\] design pattern. Explain the benefits of this pattern in this context:
> 
> `[insert code]`

### 11\. Convert Nested Logic into Smaller Functions

**Prompt:**

> Break this deeply nested logic into separate reusable functions, while preserving functionality and reducing cyclomatic complexity:
> 
> `[insert code]`

---

## IV. Learning & Documentation

### 12\. Explain What This Code Does

**Prompt:**

> Explain what this code does line-by-line. Include details on edge cases, performance bottlenecks, and suggest any improvements:
> 
> `[insert code]`

### 13\. Create Developer Documentation

**Prompt:**

> Document the following function with clear purpose, parameter details, return types, and usage example in Markdown format:
> 
> `[insert function]`

### 14\. Explain a Concept With Examples

**Prompt:**

> Explain the concept of \[e.g. memoization, currying, event loop\] in \[language\]. Include a short code example and discuss when and why to use it.

---

## V. Testing & Test Writing

### 15\. Generate Unit Tests

**Prompt:**

> Write unit tests in \[testing framework\] for this function:
> 
> `[insert function]`
> 
> Cover edge cases, invalid input, and normal operation.

### 16\. Convert Manual Test to Automated Test

**Prompt:**

> I currently test this manually:
> 
> - Step 1: Open the app
> - Step 2: Enter user input
> - Step 3: Verify result
> 
> Convert this into an automated test in \[framework\].

---

## VI. System Design & Architecture

### 17\. Suggest a Scalable Architecture

**Prompt:**

> I’m building a \[type of app: e.g. real-time chat, e-commerce store\]. Suggest a scalable architecture including frontend, backend, database, and any caching or queuing solutions. Use \[cloud provider\] as infrastructure.

### 18\. Evaluate My Architecture

**Prompt:**

> Here’s the current system design for my application:
> 
> `[Describe the architecture]`
> 
> Evaluate it for scalability, redundancy, and performance. Suggest improvements.

---

## VII. DevOps & Scripting

### 19\. Create a CI/CD Workflow

**Prompt:**

> Generate a GitHub Actions workflow that:
> 
> - Runs tests on push
> - Builds a Docker image
> - Deploys to \[hosting provider\] on success

### 20\. Bash Script for Environment Setup

**Prompt:**

> Write a Bash script that installs \[tools\], sets up environment variables, and configures Git for a new developer machine.

---
