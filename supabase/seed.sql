-- ====================================================================
-- CampusHub Phase 1 Seed Data (MIT-ADT College Demo Records)
-- File: supabase/seed.sql
-- Idempotent script: Safe to run more than once (ON CONFLICT DO NOTHING)
-- ====================================================================

-- 1. PROFILES (Faculty Coordinators & Student Leaders)
INSERT INTO profiles (id, full_name, email, avatar_url, department, year_of_study, role) VALUES
-- Faculty Coordinators
('a1111111-1111-1111-1111-111111111101', 'Dr. Anand Deshmukh', 'anand.deshmukh@mituniversity.edu.in', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', 'School of Computing', 'Faculty', 'faculty_coordinator'),
('a1111111-1111-1111-1111-111111111102', 'Prof. Radhika Kulkarni', 'radhika.kulkarni@mituniversity.edu.in', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80', 'School of Design', 'Faculty', 'faculty_coordinator'),
('a1111111-1111-1111-1111-111111111103', 'Dr. Vikram Patil', 'vikram.patil@mituniversity.edu.in', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', 'School of Engineering', 'Faculty', 'faculty_coordinator'),

-- Student Leaders & Members
('b1111111-1111-1111-1111-111111111101', 'Aarav Sharma', 'aarav.sharma@campus.mit.edu', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80', 'Computer Science & Engineering', 'Year 3', 'club_lead'),
('b1111111-1111-1111-1111-111111111102', 'Ananya Iyer', 'ananya.iyer@campus.mit.edu', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', 'Artificial Intelligence & Data Science', 'Year 3', 'club_lead'),
('b1111111-1111-1111-1111-111111111103', 'Rohan Mehta', 'rohan.mehta@campus.mit.edu', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', 'User Experience Design', 'Year 4', 'club_lead'),
('b1111111-1111-1111-1111-111111111104', 'Sneha Nair', 'sneha.nair@campus.mit.edu', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80', 'Product Design', 'Year 3', 'club_lead'),
('b1111111-1111-1111-1111-111111111105', 'Kabir Joshi', 'kabir.joshi@campus.mit.edu', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80', 'Information Technology', 'Year 3', 'club_lead'),
('b1111111-1111-1111-1111-111111111106', 'Pooja Verma', 'pooja.verma@campus.mit.edu', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80', 'Cybersecurity', 'Year 2', 'club_lead'),
('b1111111-1111-1111-1111-111111111107', 'Aditya Kulkarni', 'aditya.kulkarni@campus.mit.edu', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80', 'Robotics & Automation', 'Year 4', 'club_lead'),
('b1111111-1111-1111-1111-111111111108', 'Tanvi Reddy', 'tanvi.reddy@campus.mit.edu', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80', 'Mechanical Engineering', 'Year 3', 'club_lead'),
('b1111111-1111-1111-1111-111111111109', 'Varun Kapoor', 'varun.kapoor@campus.mit.edu', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80', 'Business Administration', 'Year 3', 'club_lead'),
('b1111111-1111-1111-1111-111111111110', 'Meera Singhania', 'meera.singhania@campus.mit.edu', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', 'Finance & Economics', 'Year 2', 'club_lead'),
('b1111111-1111-1111-1111-111111111111', 'Devansh Bhatt', 'devansh.bhatt@campus.mit.edu', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', 'Performing Arts', 'Year 4', 'club_lead'),
('b1111111-1111-1111-1111-111111111112', 'Ishita Sengupta', 'ishita.sengupta@campus.mit.edu', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&auto=format&fit=crop&q=80', 'Fine Arts', 'Year 3', 'club_lead'),
('b1111111-1111-1111-1111-111111111113', 'Kunal Choudhury', 'kunal.choudhury@campus.mit.edu', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80', 'Film & Media Studies', 'Year 3', 'club_lead'),
('b1111111-1111-1111-1111-111111111114', 'Riya Saxena', 'riya.saxena@campus.mit.edu', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', 'Visual Communication', 'Year 2', 'club_lead'),
('b1111111-1111-1111-1111-111111111115', 'Nikhil Deshpande', 'nikhil.deshpande@campus.mit.edu', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80', 'Computer Science', 'Year 2', 'student'),
('b1111111-1111-1111-1111-111111111116', 'Shreya Banerjee', 'shreya.banerjee@campus.mit.edu', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80', 'Electronics & Telecom', 'Year 2', 'student'),
('b1111111-1111-1111-1111-111111111117', 'Arjun Nambiar', 'arjun.nambiar@campus.mit.edu', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80', 'Animation & VFX', 'Year 2', 'student')
ON CONFLICT (id) DO NOTHING;

-- 2. ORGANIZATIONS (3 Communities)
INSERT INTO organizations (id, name, slug, description, logo_url, parent_organization_id) VALUES
('c1111111-1111-1111-1111-111111111101', 'Student Council', 'student-council', 'The apex student governing body at MIT-ADT coordinating student welfare, leadership initiatives, and campus-wide governance.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&auto=format&fit=crop&q=80', NULL),
('c1111111-1111-1111-1111-111111111102', 'Technical and Innovation Community', 'technical-and-innovation-community', 'The umbrella organization fostering technological excellence, coding culture, robotics, and startup ventures across all engineering faculties.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80', NULL),
('c1111111-1111-1111-1111-111111111103', 'Cultural and Creative Community', 'cultural-and-creative-community', 'The vibrant creative collective powering cultural fests, visual arts, theatrical performances, and campus storytelling.', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=300&auto=format&fit=crop&q=80', NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. CLUBS (7 Chapters)
INSERT INTO clubs (id, organization_id, name, slug, description, category, logo_url, banner_url, faculty_coordinator_id, contact_email, contact_phone, is_active) VALUES
-- Impact MIT ADT
('d1111111-1111-1111-1111-111111111101', 'c1111111-1111-1111-1111-111111111101', 'Impact MIT ADT', 'impact-mit-adt', 'A student-driven leadership and social development initiative driving high-impact community projects, campus engagement, and student representation.', 'Leadership & Social Impact', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80', 'a1111111-1111-1111-1111-111111111101', 'impact@mitadt.edu.in', '+91 98230 11001', true),

-- Criya
('d1111111-1111-1111-1111-111111111102', 'c1111111-1111-1111-1111-111111111101', 'Criya', 'criya', 'The design and creative innovation collective dedicated to UI/UX, product thinking, graphic storytelling, and collaborative art.', 'Design & Innovation', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80', 'a1111111-1111-1111-1111-111111111102', 'criya.design@mitadt.edu.in', '+91 98230 11002', true),

-- Coding Club
('d1111111-1111-1111-1111-111111111103', 'c1111111-1111-1111-1111-111111111102', 'Coding Club', 'coding-club', 'The premier computer science community uniting competitive programmers, open source contributors, web architects, and AI enthusiasts.', 'Technical & Coding', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80', 'a1111111-1111-1111-1111-111111111101', 'codingclub@mitadt.edu.in', '+91 98230 11003', true),

-- Robotics Club
('d1111111-1111-1111-1111-111111111104', 'c1111111-1111-1111-1111-111111111102', 'Robotics Club', 'robotics-club', 'Pioneering hardware engineering, autonomous aerial drones, rover systems, and embedded IoT solutions with hands-on build sessions.', 'Engineering & Robotics', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80', 'a1111111-1111-1111-1111-111111111103', 'robotics@mitadt.edu.in', '+91 98230 11004', true),

-- Entrepreneurship Cell
('d1111111-1111-1111-1111-111111111105', 'c1111111-1111-1111-1111-111111111102', 'Entrepreneurship Cell', 'entrepreneurship-cell', 'Empowering aspiring campus founders through mentorship pipelines, angel pitch competitions, product incubation, and investor connects.', 'Entrepreneurship & Business', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80', 'a1111111-1111-1111-1111-111111111103', 'ecell@mitadt.edu.in', '+91 98230 11005', true),

-- Cultural Club
('d1111111-1111-1111-1111-111111111106', 'c1111111-1111-1111-1111-111111111103', 'Cultural Club', 'cultural-club', 'The cultural heartbeat of MIT-ADT organizing annual festivals, dramatic productions, musical showcases, and inter-collegiate performances.', 'Arts & Culture', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80', 'a1111111-1111-1111-1111-111111111102', 'cultural@mitadt.edu.in', '+91 98230 11006', true),

-- Photography Club
('d1111111-1111-1111-1111-111111111107', 'c1111111-1111-1111-1111-111111111103', 'Photography Club', 'photography-club', 'Capturing campus life, architecture, wildlife, and cinematic portraits while hosting photo walks, gallery exhibits, and gear workshops.', 'Media & Photography', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&auto=format&fit=crop&q=80', 'a1111111-1111-1111-1111-111111111102', 'photo@mitadt.edu.in', '+91 98230 11007', true)
ON CONFLICT (id) DO NOTHING;

-- 4. CLUB MEMBERS (Leadership Roles)
INSERT INTO club_members (id, club_id, profile_id, role, status, joined_at) VALUES
-- Impact MIT ADT
('01111111-1111-1111-1111-111111111101', 'd1111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111101', 'president', 'active', '2024-07-01'),
('01111111-1111-1111-1111-111111111102', 'd1111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111102', 'vice_president', 'active', '2024-07-01'),
('01111111-1111-1111-1111-111111111103', 'd1111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111115', 'core_member', 'active', '2024-08-15'),

-- Criya
('01111111-1111-1111-1111-111111111104', 'd1111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111103', 'president', 'active', '2024-07-01'),
('01111111-1111-1111-1111-111111111105', 'd1111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111104', 'vice_president', 'active', '2024-07-01'),
('01111111-1111-1111-1111-111111111106', 'd1111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111117', 'member', 'active', '2024-09-01'),

-- Coding Club
('01111111-1111-1111-1111-111111111107', 'd1111111-1111-1111-1111-111111111103', 'b1111111-1111-1111-1111-111111111105', 'president', 'active', '2024-06-15'),
('01111111-1111-1111-1111-111111111108', 'd1111111-1111-1111-1111-111111111103', 'b1111111-1111-1111-1111-111111111106', 'vice_president', 'active', '2024-07-01'),
('01111111-1111-1111-1111-111111111109', 'd1111111-1111-1111-1111-111111111103', 'b1111111-1111-1111-1111-111111111115', 'core_member', 'active', '2024-08-01'),

-- Robotics Club
('01111111-1111-1111-1111-111111111110', 'd1111111-1111-1111-1111-111111111104', 'b1111111-1111-1111-1111-111111111107', 'president', 'active', '2024-07-01'),
('01111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111104', 'b1111111-1111-1111-1111-111111111108', 'vice_president', 'active', '2024-07-01'),
('01111111-1111-1111-1111-111111111112', 'd1111111-1111-1111-1111-111111111104', 'b1111111-1111-1111-1111-111111111116', 'core_member', 'active', '2024-08-20'),

-- E-Cell
('01111111-1111-1111-1111-111111111113', 'd1111111-1111-1111-1111-111111111105', 'b1111111-1111-1111-1111-111111111109', 'president', 'active', '2024-07-01'),
('01111111-1111-1111-1111-111111111114', 'd1111111-1111-1111-1111-111111111105', 'b1111111-1111-1111-1111-111111111110', 'vice_president', 'active', '2024-07-01'),

-- Cultural Club
('01111111-1111-1111-1111-111111111115', 'd1111111-1111-1111-1111-111111111106', 'b1111111-1111-1111-1111-111111111111', 'president', 'active', '2024-07-01'),
('01111111-1111-1111-1111-111111111116', 'd1111111-1111-1111-1111-111111111106', 'b1111111-1111-1111-1111-111111111112', 'vice_president', 'active', '2024-07-01'),

-- Photography Club
('01111111-1111-1111-1111-111111111117', 'd1111111-1111-1111-1111-111111111107', 'b1111111-1111-1111-1111-111111111113', 'president', 'active', '2024-07-01'),
('01111111-1111-1111-1111-111111111118', 'd1111111-1111-1111-1111-111111111107', 'b1111111-1111-1111-1111-111111111114', 'vice_president', 'active', '2024-07-01'),
('01111111-1111-1111-1111-111111111119', 'd1111111-1111-1111-1111-111111111107', 'b1111111-1111-1111-1111-111111111117', 'core_member', 'active', '2024-08-10')
ON CONFLICT (id) DO NOTHING;

-- 5. TEAMS (15 Specialized Wings)
INSERT INTO teams (id, club_id, name, slug, description) VALUES
-- Impact MIT ADT Teams
('e1111111-1111-1111-1111-111111111101', 'd1111111-1111-1111-1111-111111111101', 'Community Outreach & PR', 'outreach-pr', 'Managing outreach with student batches, institutional bodies, and digital campaigns.'),
('e1111111-1111-1111-1111-111111111102', 'd1111111-1111-1111-1111-111111111101', 'Operations & Logistics', 'operations-logistics', 'Overseeing venue permissions, sound setups, and on-ground volunteer deployment.'),

-- Criya Teams
('e1111111-1111-1111-1111-111111111103', 'd1111111-1111-1111-1111-111111111102', 'UI/UX & Product Design', 'ui-ux-design', 'Prototyping digital experiences, wireframing interfaces, and user testing workshops.'),
('e1111111-1111-1111-1111-111111111104', 'd1111111-1111-1111-1111-111111111102', 'Brand Identity & Visuals', 'brand-visuals', 'Creating branding assets, motion graphics, and creative visual identities.'),

-- Coding Club Teams
('e1111111-1111-1111-1111-111111111105', 'd1111111-1111-1111-1111-111111111103', 'Competitive Programming Team', 'cp-team', 'Curating weekly algorithmic contests, LeetCode sprints, and ICPC practice tracks.'),
('e1111111-1111-1111-1111-111111111106', 'd1111111-1111-1111-1111-111111111103', 'Open Source & Web Systems', 'opensource-web', 'Building campus micro-services, open-source repositories, and developer hackathons.'),
('e1111111-1111-1111-1111-111111111107', 'd1111111-1111-1111-1111-111111111103', 'AI & Machine Learning Track', 'ai-ml-track', 'Hands-on exploration of LLMs, neural networks, computer vision, and Kaggle sprints.'),

-- Robotics Club Teams
('e1111111-1111-1111-1111-111111111108', 'd1111111-1111-1111-1111-111111111104', 'Hardware & Embedded Systems', 'hardware-embedded', 'Circuit schematic design, PCB manufacturing, Arduino/ESP32 microcontrollers.'),
('e1111111-1111-1111-1111-111111111109', 'd1111111-1111-1111-1111-111111111104', 'Autonomous Systems & Drones', 'drones-autonomy', 'ROS integration, computer vision navigation, and drone stabilization algorithms.'),

-- E-Cell Teams
('e1111111-1111-1111-1111-111111111110', 'd1111111-1111-1111-1111-111111111105', 'Startup Incubation Team', 'startup-incubation', 'Evaluating student startup concepts, business model canvases, and investor decks.'),
('e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111105', 'Corporate Relations & Sponsorship', 'corporate-sponsorship', 'Partnering with VCs, industry accelerators, and securing festival sponsorships.'),

-- Cultural Club Teams
('e1111111-1111-1111-1111-111111111112', 'd1111111-1111-1111-1111-111111111106', 'Dramatics & Theater Wing', 'dramatics-theater', 'Stage plays, street theatre (Nukkad Natak), scriptwriting, and performance coaching.'),
('e1111111-1111-1111-1111-111111111113', 'd1111111-1111-1111-1111-111111111106', 'Music & Band Ensemble', 'music-band', 'Campus acoustic band, classical orchestrations, vocal jams, and sound engineering.'),

-- Photography Club Teams
('e1111111-1111-1111-1111-111111111114', 'd1111111-1111-1111-1111-111111111107', 'Campus Photojournalism', 'photojournalism', 'Documentary photography capturing campus events, student sports, and varsity moments.'),
('e1111111-1111-1111-1111-111111111115', 'd1111111-1111-1111-1111-111111111107', 'Cinematography & Post-Processing', 'cinematography-editing', 'Short film production, color grading in Lightroom/DaVinci, and drone aerial framing.')
ON CONFLICT (id) DO NOTHING;

-- 6. TEAM MEMBERS & LEADS
INSERT INTO team_members (id, team_id, profile_id, is_lead, joined_at) VALUES
-- Impact PR
('02111111-1111-1111-1111-111111111101', 'e1111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111102', true, '2024-07-01'),
-- Impact Operations
('02111111-1111-1111-1111-111111111102', 'e1111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111115', true, '2024-08-15'),

-- Criya UI/UX
('02111111-1111-1111-1111-111111111103', 'e1111111-1111-1111-1111-111111111103', 'b1111111-1111-1111-1111-111111111104', true, '2024-07-01'),
-- Criya Brand
('02111111-1111-1111-1111-111111111104', 'e1111111-1111-1111-1111-111111111104', 'b1111111-1111-1111-1111-111111111117', true, '2024-09-01'),

-- Coding CP
('02111111-1111-1111-1111-111111111105', 'e1111111-1111-1111-1111-111111111105', 'b1111111-1111-1111-1111-111111111106', true, '2024-07-01'),
-- Coding Web
('02111111-1111-1111-1111-111111111106', 'e1111111-1111-1111-1111-111111111106', 'b1111111-1111-1111-1111-111111111115', true, '2024-08-01'),
-- Coding AI
('02111111-1111-1111-1111-111111111107', 'e1111111-1111-1111-1111-111111111107', 'b1111111-1111-1111-1111-111111111105', true, '2024-06-15'),

-- Robotics Hardware
('02111111-1111-1111-1111-111111111108', 'e1111111-1111-1111-1111-111111111108', 'b1111111-1111-1111-1111-111111111108', true, '2024-07-01'),
-- Robotics Drones
('02111111-1111-1111-1111-111111111109', 'e1111111-1111-1111-1111-111111111109', 'b1111111-1111-1111-1111-111111111116', true, '2024-08-20'),

-- E-Cell Incubation
('02111111-1111-1111-1111-111111111110', 'e1111111-1111-1111-1111-111111111110', 'b1111111-1111-1111-1111-111111111110', true, '2024-07-01'),
-- E-Cell Corporate
('02111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111109', true, '2024-07-01'),

-- Cultural Theater
('02111111-1111-1111-1111-111111111112', 'e1111111-1111-1111-1111-111111111112', 'b1111111-1111-1111-1111-111111111112', true, '2024-07-01'),
-- Cultural Music
('02111111-1111-1111-1111-111111111113', 'e1111111-1111-1111-1111-111111111113', 'b1111111-1111-1111-1111-111111111111', true, '2024-07-01'),

-- Photography Photojournalism
('02111111-1111-1111-1111-111111111114', 'e1111111-1111-1111-1111-111111111114', 'b1111111-1111-1111-1111-111111111114', true, '2024-07-01'),
-- Photography Cinema
('02111111-1111-1111-1111-111111111115', 'e1111111-1111-1111-1111-111111111115', 'b1111111-1111-1111-1111-111111111117', true, '2024-08-10')
ON CONFLICT (id) DO NOTHING;

-- 7. EVENTS (Published Upcoming & Past Events with future dates)
INSERT INTO events (id, club_id, title, slug, description, event_date, end_date, venue, capacity, banner_url, status, created_by) VALUES
-- Upcoming Event 1: HackMITADT 2026 (Coding Club)
('f1111111-1111-1111-1111-111111111101', 'd1111111-1111-1111-1111-111111111103', 'HackMITADT 2026: 36-Hour National Hackathon', 'hackmitadt-2026', 'Join 500+ builders, innovators, and designers for a 36-hour sprint tackling AI, Web3, FinTech, and GreenTech tracks with cash prizes worth Rs. 2,00,000.', NOW() + INTERVAL '12 days', NOW() + INTERVAL '14 days', 'Central Auditorium & Tech Labs, MIT-ADT Pune', 500, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80', 'published', 'b1111111-1111-1111-1111-111111111105'),

-- Upcoming Event 2: RoboWars & Drone Grand Prix (Robotics Club)
('f1111111-1111-1111-1111-111111111102', 'd1111111-1111-1111-1111-111111111104', 'RoboWars & Autonomous Drone Grand Prix', 'robowars-drone-grand-prix', 'Witness high-octane battlebot collisions in our steel combat arena and obstacle-course precision autonomous drone racing under night floodlights.', NOW() + INTERVAL '18 days', NOW() + INTERVAL '19 days', 'Innovation Amphitheater, Ground Level', 350, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&auto=format&fit=crop&q=80', 'published', 'b1111111-1111-1111-1111-111111111107'),

-- Upcoming Event 3: Campus E-Summit 2026: Idea to IPO (E-Cell)
('f1111111-1111-1111-1111-111111111103', 'd1111111-1111-1111-1111-111111111105', 'Campus E-Summit 2026: Idea to IPO', 'campus-e-summit-2026', 'A premier flagship startup conference featuring 10+ VC keynote speakers, a live Angel Investor Pitch tank for student founders, and founder bootcamps.', NOW() + INTERVAL '25 days', NOW() + INTERVAL '26 days', 'Convention Center Hall A', 400, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80', 'published', 'b1111111-1111-1111-1111-111111111109'),

-- Upcoming Event 4: Design Sprint & Figma Masterclass (Criya)
('f1111111-1111-1111-1111-111111111104', 'd1111111-1111-1111-1111-111111111102', 'Design Sprint & Advanced Figma Masterclass', 'design-sprint-figma-masterclass', 'Master design tokens, auto-layout dynamics, interactive components, and generative design heuristics in an intensive hands-on lab.', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 4 hours', 'Design Media Lab 304, School of Design', 80, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80', 'published', 'b1111111-1111-1111-1111-111111111103'),

-- Upcoming Event 5: Dhwani: Annual Inter-College Music Fest (Cultural Club)
('f1111111-1111-1111-1111-111111111105', 'd1111111-1111-1111-1111-111111111106', 'Dhwani: Annual Inter-College Music Fest', 'dhwani-music-fest', 'An electric evening of live band face-offs, fusion instrumental jams, vocal solos, and DJ closing set under open skies.', NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days 6 hours', 'Main University Lawns', 1200, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80', 'published', 'b1111111-1111-1111-1111-111111111111'),

-- Upcoming Event 6: Golden Hour Campus Photowalk & Exhibition (Photography Club)
('f1111111-1111-1111-1111-111111111106', 'd1111111-1111-1111-1111-111111111107', 'Golden Hour Campus Photowalk & Exhibition', 'golden-hour-photowalk', 'A sunset photo expedition across the scenic riverfront campus followed by an interactive critique session and photo print gallery showcase.', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 3 hours', 'Mula-Mutha Riverfront Promenade & Art Gallery', 60, 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&auto=format&fit=crop&q=80', 'published', 'b1111111-1111-1111-1111-111111111113'),

-- Upcoming Event 7: Youth Leadership & SDG Roundtables (Impact MIT ADT)
('f1111111-1111-1111-1111-111111111107', 'd1111111-1111-1111-1111-111111111101', 'Youth Leadership & SDG Action Roundtables', 'youth-leadership-sdg-roundtables', 'Empowering youth voices with policy simulations, civic sustainability tracks, and social innovation project funding opportunities.', NOW() + INTERVAL '15 days', NOW() + INTERVAL '15 days 5 hours', 'Council Chambers & Seminar Room 102', 150, 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&auto=format&fit=crop&q=80', 'published', 'b1111111-1111-1111-1111-111111111101'),

-- Past Event 8: Winter Code Sprint 2025 (Coding Club)
('f1111111-1111-1111-1111-111111111108', 'd1111111-1111-1111-1111-111111111103', 'Winter Code Sprint 2025: Speed Algorithmic Contest', 'winter-code-sprint-2025', 'A fast-paced 4-hour algorithmic showdown testing dynamic programming, graph theory, and greedy algorithms across 200 participants.', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days 4 hours', 'Computer Labs 1 & 2', 200, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80', 'completed', 'b1111111-1111-1111-1111-111111111105'),

-- Past Event 9: Canvas & Coffee: Art Workshop (Criya)
('f1111111-1111-1111-1111-111111111109', 'd1111111-1111-1111-1111-111111111102', 'Canvas & Coffee: Expressive Typography & Poster Art', 'canvas-coffee-poster-art', 'An open creative mixer exploring vintage poster aesthetics, typography composition, and screen-printing techniques over artisan coffee.', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days 4 hours', 'Design Open Studio Atrium', 75, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&auto=format&fit=crop&q=80', 'completed', 'b1111111-1111-1111-1111-111111111103'),

-- Past Event 10: Bot Builders Expo: Semester 1 (Robotics Club)
('f1111111-1111-1111-1111-111111111110', 'd1111111-1111-1111-1111-111111111104', 'Bot Builders Expo: Semester 1 Project Showcase', 'bot-builders-expo-sem1', 'Exhibition of first-year engineering line follower bots, robotic arms, and IoT weather monitoring stations built during the winter term.', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days 6 hours', 'Central Tech Foyer', 180, 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1200&auto=format&fit=crop&q=80', 'completed', 'b1111111-1111-1111-1111-111111111107')
ON CONFLICT (id) DO NOTHING;

-- 8. SAMPLE NOTIFICATIONS
INSERT INTO notifications (id, profile_id, title, message, type, is_read) VALUES
('03111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111101', 'Welcome to CampusHub Phase 1', 'Your leadership profile for Impact MIT ADT is now active on CampusHub directory.', 'system', false),
('03111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111105', 'HackMITADT 2026 Published', 'Your event listing HackMITADT 2026 has been published to the college events directory.', 'event', false),
('03111111-1111-1111-1111-111111111103', 'b1111111-1111-1111-1111-111111111107', 'RoboWars Venue Confirmed', 'The Innovation Amphitheater has been earmarked for the RoboWars arena.', 'event', true)
ON CONFLICT (id) DO NOTHING;
