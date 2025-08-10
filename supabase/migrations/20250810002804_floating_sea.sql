/*
  # Seed Initial Data

  1. Sample Users
    - Admin, Guru, Siswa, dan Orang Tua
  
  2. Sample Data
    - Students, Subjects, Grades, Attendance, Activities
*/

-- Insert sample users
INSERT INTO users (username, password, user_type, name, nisn, class, parent_name, subject, position) VALUES
  ('admin123', 'admin123', 'admin', 'Drs. H. Ahmad Suryadi, M.Pd', NULL, NULL, NULL, NULL, 'Kepala Sekolah'),
  ('guru123', 'guru123', 'guru', 'Siti Nurhaliza, S.Pd', NULL, NULL, NULL, 'Matematika', 'Guru Matematika'),
  ('siswa123', 'siswa123', 'siswa', 'Ahmad Rizki', '1234567890', '7A', NULL, NULL, NULL),
  ('orangtua123', 'orangtua123', 'orangtua', 'Budi Santoso', NULL, NULL, 'Budi Santoso', NULL, NULL);

-- Get user IDs for references
DO $$
DECLARE
  admin_id uuid;
  guru_id uuid;
  siswa_id uuid;
  orangtua_id uuid;
  student_id uuid;
  subject_math_id uuid;
  subject_indo_id uuid;
  subject_eng_id uuid;
  activity_pramuka_id uuid;
  activity_basket_id uuid;
BEGIN
  -- Get user IDs
  SELECT id INTO admin_id FROM users WHERE username = 'admin123';
  SELECT id INTO guru_id FROM users WHERE username = 'guru123';
  SELECT id INTO siswa_id FROM users WHERE username = 'siswa123';
  SELECT id INTO orangtua_id FROM users WHERE username = 'orangtua123';

  -- Insert students
  INSERT INTO students (user_id, name, nisn, class, email, phone, address, parent_user_id) VALUES
    (siswa_id, 'Ahmad Rizki', '1234567890', '7A', 'ahmad.rizki@email.com', '081234567890', 'Jl. Merdeka No. 123, Jakarta', orangtua_id);

  SELECT id INTO student_id FROM students WHERE nisn = '1234567890';

  -- Insert subjects
  INSERT INTO subjects (name, code, kkm, teacher_user_id, semester, credits, category) VALUES
    ('Matematika', 'MTK', 75, guru_id, 'Ganjil 2024/2025', 4, 'wajib'),
    ('Bahasa Indonesia', 'BIN', 70, guru_id, 'Ganjil 2024/2025', 4, 'wajib'),
    ('Bahasa Inggris', 'BIG', 70, guru_id, 'Ganjil 2024/2025', 3, 'wajib'),
    ('IPA (Ilmu Pengetahuan Alam)', 'IPA', 75, guru_id, 'Ganjil 2024/2025', 4, 'wajib'),
    ('IPS (Ilmu Pengetahuan Sosial)', 'IPS', 70, guru_id, 'Ganjil 2024/2025', 3, 'wajib'),
    ('Pendidikan Kewarganegaraan', 'PKN', 75, guru_id, 'Ganjil 2024/2025', 2, 'wajib'),
    ('Pendidikan Agama Islam', 'PAI', 75, guru_id, 'Ganjil 2024/2025', 2, 'wajib'),
    ('Seni Budaya', 'SBK', 70, guru_id, 'Ganjil 2024/2025', 2, 'wajib'),
    ('Pendidikan Jasmani', 'PJOK', 75, guru_id, 'Ganjil 2024/2025', 2, 'wajib'),
    ('Prakarya', 'PKY', 70, guru_id, 'Ganjil 2024/2025', 2, 'wajib'),
    ('Teknologi Informasi', 'TIK', 75, guru_id, 'Ganjil 2024/2025', 2, 'pilihan'),
    ('Bahasa Daerah', 'BD', 70, guru_id, 'Ganjil 2024/2025', 2, 'pilihan');

  -- Get subject IDs
  SELECT id INTO subject_math_id FROM subjects WHERE code = 'MTK';
  SELECT id INTO subject_indo_id FROM subjects WHERE code = 'BIN';
  SELECT id INTO subject_eng_id FROM subjects WHERE code = 'BIG';

  -- Insert sample grades UTS UAS
  INSERT INTO grades_uts_uas (student_id, subject_id, uts_score, uas_score) VALUES
    (student_id, subject_math_id, 85, 88),
    (student_id, subject_indo_id, 78, 82),
    (student_id, subject_eng_id, 82, 85);

  -- Insert sample daily grades
  INSERT INTO grades_daily (student_id, subject_id, category_name, score) VALUES
    (student_id, subject_math_id, 'Ulangan 1', 85),
    (student_id, subject_math_id, 'Ulangan 2', 88),
    (student_id, subject_indo_id, 'Ulangan 1', 75),
    (student_id, subject_indo_id, 'Ulangan 2', 80);

  -- Insert sample attendance
  INSERT INTO attendance (student_id, date, status) VALUES
    (student_id, CURRENT_DATE - INTERVAL '1 day', 'present'),
    (student_id, CURRENT_DATE - INTERVAL '2 days', 'present'),
    (student_id, CURRENT_DATE - INTERVAL '3 days', 'sick'),
    (student_id, CURRENT_DATE - INTERVAL '4 days', 'present'),
    (student_id, CURRENT_DATE - INTERVAL '5 days', 'present');

  -- Insert extracurricular activities
  INSERT INTO extracurricular_activities (name) VALUES
    ('Pramuka'),
    ('Basket'),
    ('Sepak Bola'),
    ('Voli'),
    ('Badminton'),
    ('Tenis Meja'),
    ('English Club'),
    ('Paduan Suara'),
    ('Tari'),
    ('Teater'),
    ('Robotika'),
    ('Komputer'),
    ('Seni Lukis'),
    ('Fotografi'),
    ('Jurnalistik'),
    ('PMR'),
    ('Paskibra');

  -- Get activity IDs
  SELECT id INTO activity_pramuka_id FROM extracurricular_activities WHERE name = 'Pramuka';
  SELECT id INTO activity_basket_id FROM extracurricular_activities WHERE name = 'Basket';

  -- Insert student extracurricular
  INSERT INTO student_extracurricular (student_id, activity_id) VALUES
    (student_id, activity_pramuka_id),
    (student_id, activity_basket_id);

  -- Insert sample parent checklist
  INSERT INTO parent_checklists (parent_user_id, item_id, is_checked) VALUES
    (orangtua_id, 'rapor-semester', true),
    (orangtua_id, 'pembayaran-spp', true),
    (orangtua_id, 'konsultasi-guru', false),
    (orangtua_id, 'izin-kegiatan', false),
    (orangtua_id, 'data-kesehatan', false),
    (orangtua_id, 'persetujuan-foto', false);

END $$;