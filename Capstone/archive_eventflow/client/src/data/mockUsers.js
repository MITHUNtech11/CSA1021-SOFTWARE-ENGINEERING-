/**
 * Mock Users Dataset for EventFlow Platform
 * Comprehensive persona models representing Students, Student Leads, and Faculty Coordinators.
 */

export const MOCK_USERS = [
  {
    id: 'user_aditya',
    name: 'Aditya Nair',
    email: 'aditya.nair@college.edu',
    role: 'student',
    roleTitle: 'Student Attendee',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    roll: 'CS23B1042',
    college: 'Campus University of Technology',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'Full-stack & AI Developer • Active Member of ACM Campus Student Chapter',
    statusBadge: 'Verified Student ID',
    registeredEventsCount: 3
  },
  {
    id: 'user_sneha',
    name: 'Sneha Patel',
    email: 'sneha.patel@college.edu',
    role: 'student',
    roleTitle: 'Student Attendee',
    department: 'Electronics & Communication (ECE)',
    year: '2nd Year',
    roll: 'EC24B1089',
    college: 'Campus University of Technology',
    phone: '+91 98765 43211',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Robotics Enthusiast & Embedded Systems Engineer • IEEE Student Member',
    statusBadge: 'Verified Student ID',
    registeredEventsCount: 2
  },
  {
    id: 'user_aarav',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu',
    role: 'admin',
    roleTitle: 'Tech Club Lead',
    department: 'Computer Science & Engineering',
    year: '4th Year / Lead',
    roll: 'CS22B1008',
    college: 'Campus University of Technology',
    phone: '+91 98765 43220',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead Coordinator for Annual TechTrove Hackathon & Coding Society Head',
    statusBadge: 'Organizer Executive',
    managedEventsCount: 4
  },
  {
    id: 'user_raman',
    name: 'Dr. K. Raman',
    email: 'k.raman@college.edu',
    role: 'admin',
    roleTitle: 'Faculty Coordinator / Dean',
    department: 'Information Technology',
    year: 'Faculty / Administration',
    roll: 'FAC-IT-102',
    college: 'Campus University of Technology',
    phone: '+91 98765 43230',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Professor of Information Systems • Dean of Student Activities & Campus Events',
    statusBadge: 'Faculty Administrator',
    managedEventsCount: 12
  }
];

export const DEFAULT_USER = MOCK_USERS[0]; // Aditya Nair (Student)

export const getMockUserById = (id) => {
  return MOCK_USERS.find((u) => u.id === id) || null;
};

export const getMockUserByEmail = (email) => {
  if (!email) return null;
  return MOCK_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
};
