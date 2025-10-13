# Lunara - Intelligent OB/GYN Triage System

> 📢 *Announcement:*
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

---

## Inspiration

Every day, women’s health call centers face overwhelming complexity — agents must sort through mountains of patient histories, symptoms, and sub-specialty decisions. Misrouted referrals delay care, especially for high-risk pregnancies and cancer patients.  
We asked: **What if triage could be smarter, faster, and more accurate — from the very first call?**

---

## What It Does
**Lunara** is an **AI-powered triage assistant** built specifically for **women’s health**.  
It empowers call center agents to make evidence-based referral decisions in **under 30 seconds**.

Agents enter only minimal information (name, DOB, initial symptoms).  
Lunara then:
- Uses **Natural Language Processing (NLP)** to interpret patient-reported symptoms  
- References **prior medical history** for contextual accuracy  
- Generates a **ranked list of conditions, sub-specialties, and suitable doctors**  
- Displays **confidence scores**, **top recommendations**, and a **summary card** for transparency  

The result: faster, smarter, and more accurate triage — routing patients to the right provider the first time.

## Impact

- **25%** of women’s health calls are misrouted today — Lunara reduces this drastically.  
- Cuts **average triage time** from minutes to **under 30 seconds**.  
- Reduces **cost of care** and **wait times** for patients.  
- Improves **safety** by ensuring high-risk cases reach the right specialists immediately.  

---

## How We Built It

> *Note*: Our entire tech stack was developed with HIPAA compliance in mind!

**Tech Stack Overview**

  -**Frontend:** React / RadixUI
  
  -**Backend:** FastAPI / Python
  
  -**ML/AI**: TF-IDF (NLP), SGD
  
  -**Database:** AWS Aurora Serverless v2 (Postgres Compatible)
  
  -**Hosting:** Local + Terraform scripts for using AWS Cognito (user auth), Lambda (hosting backend), & S3 with CloudFront (hosting frontend)  


**Pipeline**
1. Agents input minimal information via the frontend.  
2. The backend processes the data and performs NLP-based symptom interpretation.  
3. The ML model ranks likely conditions and corresponding sub-specialties.  
4. Results, confidence scores, and doctor recommendations are sent back to the agent dashboard.  
5. All triages are logged with algorithm version, timestamp, and confidence — ensuring **auditability and HIPAA compliance**.

**Admin Tools**
- Modify or override mappings between symptoms and conditions  
- Review logs and monitor model performance across 140 tracked conditions  

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

