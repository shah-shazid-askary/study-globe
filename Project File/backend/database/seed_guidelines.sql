-- ============================================================
-- Seed Genuine Visa and Work Guidelines for StudyGlobe
-- Run this in your Supabase SQL Editor
-- ============================================================

INSERT INTO country_guidelines (country_id, visa_rules, work_permit_rules, living_costs, general_requirements)
VALUES 
  (
    1, -- Canada
    '• Study Permit (IMM 1294): Required for courses longer than 6 months.
• Proof of Financial Support: You must prove you have at least $20,635 CAD per year (for 2026, excluding tuition fees) to cover living expenses.
• Provincial Attestation Letter (PAL): Most undergraduate students now require a PAL from the province where they plan to study before applying for a Study Permit.
• Processing Time: Generally 4 to 12 weeks depending on the application country.',
    
    '• Hours Limit: International students can work up to 24 hours per week off-campus during regular academic semesters (increased from 20 hours in late 2024).
• Scheduled Breaks: You can work full-time during official academic vacations (winter/summer holidays).
• PGWP (Post-Graduation Work Permit): Offers up to 3 years of post-study work authorization depending on the length and level of your program.',
    
    '• Rent & Housing: $800 - $1,500 CAD/month for shared apartments or homestays.
• Food & Groceries: $300 - $500 CAD/month.
• Transport: $100 - $150 CAD/month (many universities include a transit pass in student fees).
• Total Estimated Cost: $1,500 - $2,500 CAD per month depending on the city (Toronto/Vancouver are significantly higher).',
    
    '• Acceptance Letter: An official Letter of Acceptance (LOA) from a Designated Learning Institution (DLI).
• Language Test: IELTS Academic (minimum 6.0 overall, no band less than 6.0) or TOEFL equivalent.
• Medical Examination & Biometrics: Required for students from most countries.'
  ),
  (
    2, -- Germany
    '• National Visa (Type D): Required for long-term study programs.
• Blocked Account (Sperrkonto): You must deposit at least €11,904 (approx. €992/month for 2026) to prove you can support yourself.
• Health Insurance: Compulsory for all students. You must register with a public (e.g., TK, AOK) or private health insurance provider.',
    
    '• Days Limit: International students from non-EU countries are permitted to work 140 full days or 280 half days per calendar year.
• Campus Work: Working as an academic assistant (HiWi) generally does not count toward this limit.
• Job Search Visa: After graduation, you can extend your residence permit for up to 18 months to find a job matching your qualifications.',
    
    '• Tuition Fees: Public universities are tuition-free (except in the state of Baden-Württemberg, which charges €1,500/semester).
• Semester Contribution: €150 - €350 per semester (includes public transport ticket).
• Rent: €350 - €650/month (student halls are cheaper but have long waiting lists).
• Total Estimated Cost: €900 - €1,200 per month.',
    
    '• University Entrance Qualification: Higher education entrance qualification (Abitur equivalent or Studienkolleg preparatory course).
• Language Proof: TestDaF/DSH for German-taught courses; IELTS (6.5 overall) or TOEFL (80+) for English-taught courses.'
  ),
  (
    3, -- United States
    '• F-1 Student Visa: Most common visa for academic students.
• Form I-20: Issued by an SEVP-certified school showing estimated costs.
• SEVIS Fee: You must pay the $350 USD SEVIS I-901 fee prior to your embassy interview.
• Financial Proof: Demonstrating liquid funds sufficient to cover one full year of tuition and living expenses as stated on the I-20.',
    
    '• On-Campus Work: Limited to 20 hours per week during academic sessions; full-time during holidays.
• Off-Campus Work: Not permitted during the first academic year.
• Practical Training: Curricular Practical Training (CPT) during studies and Optional Practical Training (OPT) for 12 months post-graduation (extended by 24 months for STEM degrees).',
    
    '• Rent & Accommodation: $1,000 - $2,200 USD/month depending on location.
• Health Insurance: Highly recommended and often mandatory through your university ($1,500 - $3,500 USD per year).
• Miscellaneous: Books, supplies, utilities, and transport.
• Total Estimated Cost: $1,500 - $3,000 USD per month.',
    
    '• Standardized Tests: SAT/ACT (undergraduate) or GRE/GMAT (graduate) depending on school requirements.
• English Proficiency: TOEFL iBT (80+), IELTS Academic (6.5+), or Duolingo English Test (110+).
• Credential Evaluation: WES evaluation of academic transcripts.'
  ),
  (
    4, -- Switzerland
    '• National Visa (Type D): Required for residency and study.
• Financial Guarantee: Proof of at least CHF 21,000 - CHF 24,000 per year (bank statement from a Swiss-regulated bank or international branch).
• Residence Permit: You must apply for a L-type permit within 14 days of arrival in Switzerland.',
    
    '• Waiting Period: Non-EU students can start working only after living in Switzerland for 6 months.
• Hours Limit: Maximum 15 hours per week during semesters; full-time during semester breaks.
• Job Hunting: Graduates from Swiss universities can remain in the country for up to 6 months to search for a job.',
    
    '• Rent & Utilities: CHF 600 - CHF 1,200/month for student rooms.
• Health Insurance: Compulsory within 3 months of arrival (approx. CHF 80 - CHF 150/month with student discounts).
• Food: CHF 400 - CHF 600/month (eating out is very expensive).
• Total Estimated Cost: CHF 1,800 - CHF 2,800 per month.',
    
    '• Academic Recognition: Recognized high school diploma or Bachelor''s degree.
• Language Proficiency: German/French/Italian depending on the canton; IELTS (6.5+) or TOEFL (90+) for international programs.
• Exit Pledge: A written statement promising to leave Switzerland after graduation.'
  ),
  (
    5, -- United Kingdom
    '• Student Visa: Point-based immigration system (requires 70 points).
• CAS (Confirmation of Acceptance for Studies): A unique reference number issued by your UK sponsor university.
• Healthcare Charge: You must pay the Immigration Health Surcharge (IHS) of £776 per year to access the NHS.
• Financial Proof: £1,334/month (inside London) or £1,023/month (outside London) for up to 9 months.',
    
    '• Term Time Work: Up to 20 hours per week for degree-level courses; 10 hours for below degree-level.
• Holiday Work: Full-time work permitted during university vacations.
• Graduate Visa: Allows you to stay and work (or look for work) in the UK for 2 years (3 years for PhD graduates) after graduation.',
    
    '• Rent & Housing: £500 - £900/month (outside London) or £800 - £1,500/month (inside London).
• Groceries & Food: £200 - £350/month.
• Transport: £60 - £120/month.
• Total Estimated Cost: £1,100 - £1,700 per month.',
    
    '• CAS Eligibility: Satisfactory academic records matching the course requirements.
• English Level: SELT (Secure English Language Test) like IELTS Academic (usually minimum 6.0 overall) or provider-approved test.
• Tuberculosis (TB) Test: Required for residents of specific countries.'
  )
ON CONFLICT (country_id) 
DO UPDATE SET 
  visa_rules = EXCLUDED.visa_rules,
  work_permit_rules = EXCLUDED.work_permit_rules,
  living_costs = EXCLUDED.living_costs,
  general_requirements = EXCLUDED.general_requirements,
  updated_at = NOW();
