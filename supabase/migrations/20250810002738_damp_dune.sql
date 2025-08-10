/*
  # Initial Schema Setup for Academic Information System

  1. New Tables
    - `users` - User accounts with different roles
    - `students` - Student information
    - `subjects` - Subject/course information
    - `grades_uts_uas` - UTS and UAS grades
    - `grades_daily` - Daily test grades
    - `attendance` - Student attendance records
    - `extracurricular_activities` - Available extracurricular activities
    - `student_extracurricular` - Student-activity relationships
    - `parent_checklists` - Parent checklist items

  2. Security
    - Enable RLS on all tables
    - Add policies for different user roles
*/

-- Create custom types
CREATE TYPE user_type AS ENUM ('siswa', 'orangtua', 'guru', 'admin');
CREATE TYPE attendance_status AS ENUM ('present', 'sick', 'permission', 'absent');
CREATE TYPE subject_category AS ENUM ('wajib', 'pilihan');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  user_type user_type NOT NULL,
  name text NOT NULL,
  nisn text UNIQUE,
  class text,
  parent_name text,
  subject text,
  position text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  nisn text UNIQUE NOT NULL,
  class text NOT NULL,
  email text,
  phone text,
  address text,
  parent_user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  kkm integer NOT NULL,
  teacher_user_id uuid REFERENCES users(id) NOT NULL,
  semester text NOT NULL,
  credits integer NOT NULL,
  category subject_category NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Grades UTS UAS table
CREATE TABLE IF NOT EXISTS grades_uts_uas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  uts_score integer CHECK (uts_score >= 0 AND uts_score <= 100),
  uas_score integer CHECK (uas_score >= 0 AND uas_score <= 100),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

-- Grades Daily table
CREATE TABLE IF NOT EXISTS grades_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  category_name text NOT NULL,
  score integer CHECK (score >= 0 AND score <= 100),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id, category_name)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  status attendance_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Extracurricular activities table
CREATE TABLE IF NOT EXISTS extracurricular_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Student extracurricular junction table
CREATE TABLE IF NOT EXISTS student_extracurricular (
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  activity_id uuid REFERENCES extracurricular_activities(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (student_id, activity_id)
);

-- Parent checklists table
CREATE TABLE IF NOT EXISTS parent_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  item_id text NOT NULL,
  is_checked boolean NOT NULL DEFAULT false,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(parent_user_id, item_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades_uts_uas ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracurricular_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_extracurricular ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_checklists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type = 'admin'
    )
  );

-- RLS Policies for students table
CREATE POLICY "Students can read own data" ON students
  FOR SELECT USING (
    user_id = auth.uid() OR
    parent_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type IN ('guru', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can manage students" ON students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type IN ('guru', 'admin')
    )
  );

-- RLS Policies for subjects table
CREATE POLICY "Everyone can read subjects" ON subjects
  FOR SELECT USING (true);

CREATE POLICY "Teachers and admins can manage subjects" ON subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type IN ('guru', 'admin')
    )
  );

-- RLS Policies for grades tables
CREATE POLICY "Students and parents can read own grades" ON grades_uts_uas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = student_id AND (s.user_id = auth.uid() OR s.parent_user_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type IN ('guru', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can manage grades" ON grades_uts_uas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type IN ('guru', 'admin')
    )
  );

CREATE POLICY "Students and parents can read own daily grades" ON grades_daily
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = student_id AND (s.user_id = auth.uid() OR s.parent_user_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type IN ('guru', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can manage daily grades" ON grades_daily
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type IN ('guru', 'admin')
    )
  );

-- RLS Policies for attendance
CREATE POLICY "Students and parents can read own attendance" ON attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = student_id AND (s.user_id = auth.uid() OR s.parent_user_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type IN ('guru', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can manage attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type IN ('guru', 'admin')
    )
  );

-- RLS Policies for extracurricular activities
CREATE POLICY "Everyone can read activities" ON extracurricular_activities
  FOR SELECT USING (true);

CREATE POLICY "Teachers and admins can manage activities" ON extracurricular_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type IN ('guru', 'admin')
    )
  );

-- RLS Policies for student extracurricular
CREATE POLICY "Students and parents can read own activities" ON student_extracurricular
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = student_id AND (s.user_id = auth.uid() OR s.parent_user_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type IN ('guru', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can manage student activities" ON student_extracurricular
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type IN ('guru', 'admin')
    )
  );

-- RLS Policies for parent checklists
CREATE POLICY "Parents can manage own checklists" ON parent_checklists
  FOR ALL USING (parent_user_id = auth.uid());

CREATE POLICY "Admins can read all checklists" ON parent_checklists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.user_type = 'admin'
    )
  );