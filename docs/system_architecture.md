# System Architecture - Course & Program Information Portal

This document outlines the software components, network boundaries, and data flows of the Course & Program Information Portal, satisfying the Day 15 system architecture deliverables.

---

## 🏗️ Architecture Diagram

```mermaid
graph TD
    %% Frontend Boundaries
    subgraph SPA ["Frontend Client (React + Vite)"]
        UI["User Interface (Public Portal & Staff Dashboard)"]
        State["State Management & API Fetch Handler"]
        CSS["Vanilla CSS Style Modules"]
    end

    %% Backend Boundaries
    subgraph Server ["Backend API Server (Node.js + Express)"]
        Router["Express Route Middlewares"]
        Validator["Input Validation Middleware"]
        Workflow["Workflow Engine (Lead Scoring, Status Transitions)"]
        AIService["AI Service (Gemini API / Local Canned Fallback)"]
    end

    %% Database Boundaries
    subgraph DB ["Database Storage (SQLite / PostgreSQL)"]
        Prisma["Prisma Client ORM"]
        Tables["Relational Tables (16 Models)"]
    end

    %% External APIs
    Gemini["Google Gemini Generative AI Platform"]

    %% Connections
    UI --> State
    State -- "HTTP / JSON REST Requests" --> Router
    Router --> Validator
    Validator --> Workflow
    Workflow --> AIService
    AIService -- "REST API Queries" --> Gemini
    Workflow --> Prisma
    Prisma --> Tables
```

---

## ⚙️ Component Explanations

1. **Frontend Client**:
   - A single-page application built using React, Vite, and TypeScript.
   - Styled using custom vanilla CSS for modular themes and seamless transitions.
   - Communicates with the backend using the standard Javascript `fetch` API, automatically toggled between localhost and production domains.

2. **Backend API Server**:
   - A Node.js application built with Express and TypeScript.
   - Enforces validation checks on email formats, required string bounds, and phone numbers.
   - Automates workflow logic including lead prioritization, WhatsApp-style confirmation templates, and status tracking histories.

3. **Prisma ORM Database Layer**:
   - Uses Prisma Client to communicate with a local SQLite database during development and pushes schema migrations to hosted PostgreSQL during production.
   - Houses 16 models managing campus details, program catalogs, student admissions files, grades, fee payments, and system audit logs.

4. **Gemini AI Service Module**:
   - Interfaces with Google Gemini Developer SDK to generate personalized admissions advice, carrier options, and student progress reports.
   - Integrates rule-based keywords fallback routines to respond safely even when API keys are absent.
