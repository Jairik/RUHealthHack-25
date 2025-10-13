# Lunara - Intelligent OB/GYN Triage System

> 💡 *Announcement:*
> Lunara **placed first** at RUHealthHacks, **winning** the Womens Health Category! 

A web-based platform that empowers call center agents with AI-powered triage, improving the accuracy of connections 
to subspecialists by almost 20%.

<p align="center">
  <a href="https://www.youtube.com/watch?v=ntU7dSQPw1w" target="_blank">
    <img src="https://img.shields.io/badge/▶️%20Watch%20Demo-YouTube-red?style=for-the-badge&logo=youtube" alt="Watch on YouTube">
  </a>
  &nbsp;&nbsp;
  <a href="https://devpost.com/software/lunara" target="_blank">
    <img src="https://img.shields.io/badge/View%20on%20Devpost-blue?style=for-the-badge&logo=devpost" alt="View on Devpost">
  </a>
</p>

<!-- TODO
---

## Features
- Feature 1  
- Feature 2  
- Feature 3  

---
-->

## Tech Stack

> *Note*: Our entire tech stack was developed with HIPAA compliance in mind!

**Frontend:** React / RadixUI 

**Backend:** FastAPI / Python

**ML/AI**: TF-IDF (NLP), SGD

**Database:** AWS Aurora Serverless v2 (Postgres Compatible)  

**Hosting:** Local + Terraform scripts for using AWS Cognito (user auth), Lambda (hosting backend), & S3 with CloudFront (hosting frontend)  

---

## Installation

1) Add applicable AWS keys to .env file (in project root directory)
2) Start a python virtual environment and download python dependencies
 
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install uv
uv pip install -r requirements.txt
```

3) Download node dependencies

```bash
cd frontend
npm i
```

4) Start the dev server
```bash
npm run devf
```

*The command ```devf``` runs ```dev``` (frontend) and ```dev:backend``` (backend) concurrently*. To deploy in production, use terraform scripts under /infra*
