-- Create learning_resources table
CREATE TABLE learning_resources (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    related_skills TEXT NOT NULL,
    cost_indicator TEXT CHECK (cost_indicator IN ('Free', 'Paid', 'Free (Audit) / Paid (Certificate)')) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data (20 rows)
INSERT INTO learning_resources (title, platform, url, related_skills, cost_indicator) VALUES
('HTML Full Course - Build a Website Tutorial', 'YouTube', 'https://www.youtube.com/watch?v=pQN-pnXPaVg', 'HTML, Web Development', 'Free'),
('JavaScript Tutorial for Beginners', 'YouTube', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 'JavaScript, Frontend Development', 'Free'),
('CSS Crash Course For Beginners', 'YouTube', 'https://www.youtube.com/watch?v=1Rs2ND1ryYc', 'CSS, Web Design', 'Free'),
('Python for Everybody Specialization', 'Coursera', 'https://www.coursera.org/specializations/python', 'Python, Programming', 'Free (Audit) / Paid (Certificate)'),
('The Complete JavaScript Course 2025', 'Udemy', 'https://www.udemy.com/course/the-complete-javascript-course/', 'JavaScript, ES6, Web Apps', 'Paid'),
('Excel for Beginners', 'YouTube', 'https://www.youtube.com/watch?v=Vl0H-qTclOg', 'Microsoft Excel, Data Entry', 'Free'),
('Mastering Data Analysis in Excel', 'Coursera', 'https://www.coursera.org/learn/analytics-excel', 'Excel, Data Analysis', 'Free (Audit) / Paid (Certificate)'),
('Effective Communication Skills', 'edX', 'https://www.edx.org/course/communication-skills', 'Communication, Leadership', 'Free (Audit) / Paid (Certificate)'),
('Figma for Beginners', 'YouTube', 'https://www.youtube.com/watch?v=HZuk6Wkx_Eg', 'UI/UX Design, Figma', 'Free'),
('React - The Complete Guide', 'Udemy', 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', 'React, Frontend Development', 'Paid'),
('Node.js Crash Course', 'YouTube', 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', 'Node.js, Backend Development', 'Free'),
('Learn Git and GitHub', 'YouTube', 'https://www.youtube.com/watch?v=RGOj5yH7evk', 'Git, Version Control', 'Free'),
('Machine Learning by Andrew Ng', 'Coursera', 'https://www.coursera.org/learn/machine-learning', 'Machine Learning, AI', 'Free (Audit) / Paid (Certificate)'),
('SQL Tutorial - Full Database Course for Beginners', 'YouTube', 'https://www.youtube.com/watch?v=HXV3zeQKqGY', 'SQL, Databases', 'Free'),
('Public Speaking Foundations', 'LinkedIn Learning', 'https://www.linkedin.com/learning/public-speaking-foundations', 'Public Speaking, Communication', 'Paid'),
('Power BI for Beginners', 'YouTube', 'https://www.youtube.com/watch?v=AGrl-H87pRU', 'Power BI, Data Visualization', 'Free'),
('Digital Marketing Specialization', 'Coursera', 'https://www.coursera.org/specializations/digital-marketing', 'Digital Marketing, SEO', 'Free (Audit) / Paid (Certificate)'),
('AWS Cloud Practitioner Essentials', 'AWS Training', 'https://www.aws.training/Details/Curriculum?id=20685', 'Cloud Computing, AWS', 'Free'),
('Docker and Kubernetes: The Complete Guide', 'Udemy', 'https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/', 'DevOps, Docker, Kubernetes', 'Paid'),
('Artificial Intelligence Full Course', 'YouTube', 'https://www.youtube.com/watch?v=JMUxmLyrhSk', 'Artificial Intelligence, Deep Learning', 'Free');







-- Create jobs table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    required_skills TEXT[] NOT NULL,
    experience_level TEXT CHECK (experience_level IN ('Intern', 'Entry', 'Mid')) NOT NULL,
    job_type TEXT CHECK (job_type IN ('Internship', 'Part-time', 'Full-time', 'Freelance')) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample job data
INSERT INTO jobs (job_title, company, location, required_skills, experience_level, job_type, description) VALUES
('Frontend Developer Intern', 'Google', 'Remote', ARRAY['HTML', 'CSS', 'JavaScript', 'React'], 'Intern', 'Internship', 'Assist in building user interfaces for Google web tools.'),
('Backend Developer Intern', 'Microsoft', 'Remote', ARRAY['Node.js', 'Express', 'SQL', 'API Development'], 'Intern', 'Internship', 'Work on backend microservices and database integration.'),
('Data Analyst Intern', 'Meta', 'London', ARRAY['Excel', 'Python', 'SQL', 'Power BI'], 'Intern', 'Internship', 'Analyze marketing datasets and provide insights.'),
('UI/UX Designer Intern', 'Adobe', 'Remote', ARRAY['Figma', 'UI Design', 'Prototyping'], 'Intern', 'Internship', 'Design creative prototypes and contribute to design systems.'),
('Junior Frontend Developer', 'Spotify', 'Stockholm', ARRAY['React', 'JavaScript', 'Next.js'], 'Entry', 'Full-time', 'Develop web-based tools and dashboards.'),
('Software Engineer Intern', 'Amazon', 'Berlin', ARRAY['Python', 'AWS', 'APIs'], 'Intern', 'Internship', 'Support cloud infrastructure and internal tools.'),
('Marketing Intern', 'HubSpot', 'Remote', ARRAY['Digital Marketing', 'SEO', 'Content Writing'], 'Intern', 'Internship', 'Assist in content creation and campaign analytics.'),
('Data Science Intern', 'Kaggle', 'Remote', ARRAY['Python', 'Pandas', 'Machine Learning'], 'Intern', 'Internship', 'Contribute to data analysis notebooks and projects.'),
('Full Stack Developer', 'Olyez', 'Dhaka', ARRAY['React', 'Node.js', 'MySQL'], 'Entry', 'Full-time', 'Work on SaaS education product features and maintenance.'),
('DevOps Engineer Intern', 'IBM', 'Remote', ARRAY['Docker', 'Kubernetes', 'Linux'], 'Intern', 'Internship', 'Help manage deployment pipelines and monitoring.'),
('Content Writer (Tech)', 'FreeCodeCamp', 'Remote', ARRAY['Writing', 'Markdown', 'Web Development'], 'Entry', 'Freelance', 'Write tutorials and coding guides for web learners.'),
('AI Research Assistant', 'OpenAI', 'Remote', ARRAY['Python', 'TensorFlow', 'LLMs'], 'Intern', 'Internship', 'Assist researchers in data preparation and model testing.'),
('QA Engineer Intern', 'Netflix', 'Los Angeles', ARRAY['Testing', 'Selenium', 'Python'], 'Intern', 'Internship', 'Work on automated testing of streaming services.'),
('Junior Data Engineer', 'Spotify', 'Remote', ARRAY['Python', 'ETL', 'SQL'], 'Entry', 'Full-time', 'Build and maintain data pipelines.'),
('Web Developer Intern', 'Coursera', 'Remote', ARRAY['React', 'Firebase', 'APIs'], 'Intern', 'Internship', 'Contribute to course platform improvements.'),
('Social Media Intern', 'LinkedIn', 'Singapore', ARRAY['Content Creation', 'Analytics', 'Canva'], 'Intern', 'Internship', 'Support social media campaigns and engagement tracking.'),
('Junior Cloud Engineer', 'Azure Academy', 'Remote', ARRAY['Azure', 'DevOps', 'Networking'], 'Entry', 'Full-time', 'Maintain cloud infrastructure for clients.'),
('Machine Learning Intern', 'Google DeepMind', 'London', ARRAY['Python', 'PyTorch', 'Data Analysis'], 'Intern', 'Internship', 'Work on AI model training and optimization.'),
('Technical Support Intern', 'Dell', 'Remote', ARRAY['Networking', 'Customer Service', 'Linux'], 'Intern', 'Internship', 'Provide remote technical assistance to users.'),
('Graphic Designer Intern', 'Canva', 'Sydney', ARRAY['Photoshop', 'Illustrator', 'Creativity'], 'Intern', 'Internship', 'Design templates and visuals for the global user base.');





 create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text check (role in ('job_seeker', 'company')) not null,
  created_at timestamp with time zone default now()
);


 create table public.job_seekers (
  id uuid primary key references users(id) on delete cascade,
  full_name text not null,
  education_level text,
  department text,
  resumelink text,
  experience_level text check (experience_level in ('Fresher', 'Junior', 'Mid', 'Senior')),
  preferred_career_track text,
  created_at timestamp with time zone default now()
);
alter table public.job_seekers
add column skills text[],
add column about text;
add column locations;


alter table public.job_seekers
add column location text;

-- Add skillgaps column to store detailed skill gap analysis
alter table public.job_seekers
add column skillgaps text;