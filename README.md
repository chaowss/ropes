# Assessment Platform Builder

## 🔍 Context

Welcome to your Ropes Test! This is a 90 minute assessment that will test your grit and agency in making a 0 to 1 product. 
We want to see how fast you can build a quality product from an ambigious set of requirements.

**Feel free to search up syntax, do research, and ask AI for help.**

You're building an MVP for a Kahoot-style assessment platform that helps companies evaluate candidates through multiple choice questions. Your goal is to create a system where hiring teams can create multiple choice questions, build assessments, and review candidate results. Unfortunately, the code is incomplete, and the style and feel isn't the best.

This challenge intentionally provides minimal direction - you'll need to make product and technical decisions based on what you think would be most valuable for users. Get through as many core requirements and written questions as you can. Correctness is key, make sure the product is properly QA'd and running correctly before submission.


## 📂 File Structure

```
assessment-platform/
├── frontend/           # React application  
├── backend/           # Node.js API server
└── README.md
```

## 🚀 Getting Started

```bash
# Backend
cd backend && npm install && npm start

# Frontend  
cd frontend && npm install && npm start
```

Test the complete workflow: create challenges → build assessment → take assessment → review results.

## ✅ Build These Core Features

### 1. Question Management
Build a way for users to create and organize multiple choice questions.

Consider: What information is essential for a multiple choice question? How should questions with options and correct answers be stored and retrieved?

### 2. Assessment Creation
Create a system to combine multiple choice questions into assessments that candidates can take.

Consider: How do you configure an assessment? What settings matter most to hiring teams for multiple choice assessments?

### 3. Candidate Interface
Build the experience where candidates answer multiple choice questions in an assessment.

Consider: What does a good multiple choice assessment-taking experience look like? How do you handle answer selection and submission?

### 4. Results Review
Create a way to view and analyze completed assessments with automatic scoring.

Consider: What information is most valuable when reviewing candidate performance on multiple choice questions? How should scoring work?

### 5. Extend the Assessment Platform Your Way (Bonus if AI/ML related)
Extend the assessment how you see fit. We want to see your product sense and creativity. Bonus if you use AI/ML! Feel free to install any extensions needed.



## 📄 Written Questions (~20 minutes total)

Answer in [QUESTIONS.md](QUESTIONS.md):

**Scrappy Building:** You need to add cheating detection in a **week** for a client demo, but have no existing tools. Describe how you would detect cheating, and your approach to shipping this quickly while maintaining quality. 

**System Design:** Your platform is growing fast with performance issues and requests for new features. Explain your philosophy on balancing technical debt, scalability, and feature velocity in a startup environment.

---

**Technical Stack:** React, Node.js/Express, standard web technologies. Use whatever data storage approach makes sense for an MVP.

**Success Criteria:** A working end-to-end system that demonstrates the core assessment platform workflow. Make architectural decisions that you can defend and explain.

**Time Management:** Aim to have a basic version of all 4 features working rather than perfecting individual features. The multiple choice format should make implementation faster than coding challenges.

_💡TIP: Feel free to create mock data as you complete core requirements, it'll make your iteration loop faster. The frontend has hot reload enabled, while the backend does not._
