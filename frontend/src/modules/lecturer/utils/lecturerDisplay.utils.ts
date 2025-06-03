// Lecturer interface is now defined in @/shared/types/lecturer.ts
import type { Lecturer } from "@/shared/types/lecturer";

// Enhanced lecturer mock data with realistic course assignments
export const lecturers: Lecturer[] = [
  {
    id: "dr.smith@rmit.edu.au",
    name: "Dr. John Smith",
    title: "Senior Lecturer",
    specialization: "Full Stack Development & Software Engineering",
    bio: "Dr. Smith has over 15 years of experience in software development and education. He worked as a senior software engineer at Microsoft before joining RMIT. His research focuses on modern web development frameworks and software architecture patterns.",
    courses: "COSC2758 - Full Stack Development, COSC2671 - Database Systems",
    awards: "Excellence in Teaching Award 2023, Best Research Paper 2022",
    experience: "Microsoft, Google, Tech Startups (15+ years)",
    certifications: "AWS Solutions Architect, Azure DevOps Expert",
    contact: "dr.smith@rmit.edu.au",
    avatarPath: "/lecturers/lecturer-1.jpg",
  },
  {
    id: "prof.johnson@rmit.edu.au",
    name: "Prof. Sarah Johnson",
    title: "Professor",
    specialization: "Advanced Programming & Algorithms",
    bio: "Prof. Johnson is internationally recognized for her work in algorithm optimization and computational complexity. She has published over 50 research papers and authored two textbooks on advanced programming concepts.",
    courses: "COSC2938 - Further Web Programming, COSC2123 - Algorithms and Analysis",
    awards: "IEEE Computer Society Award 2021, Distinguished Professor 2020",
    publications: "2 textbooks, 50+ research papers in top journals",
    experience: "Amazon Research, IBM Watson (12 years)",
    contact: "prof.johnson@rmit.edu.au",
    avatarPath: "/lecturers/lecturer-2.jpg",
  },
  {
    id: "dr.williams@rmit.edu.au",
    name: "Dr. Michael Williams",
    title: "Associate Professor",
    specialization: "Systems Programming & DevOps",
    bio: "Dr. Williams specializes in systems programming and cloud infrastructure. He leads the DevOps research group and has extensive experience in building scalable distributed systems. His courses bridge theory with practical industry skills.",
    courses: "COSC1295 - Advanced Programming, COSC2767 - Systems Deployment and Operations",
    awards: "Innovation in Education Award 2022",
    experience: "Netflix Infrastructure Team, Spotify Backend (10 years)",
    certifications: "Kubernetes Certified Expert, Docker Certified Associate",
    contact: "dr.williams@rmit.edu.au",
    avatarPath: "/lecturers/lecturer-3.jpg",
  },
  {
    id: "prof.brown@rmit.edu.au",
    name: "Prof. Emily Brown",
    title: "Professor",
    specialization: "Web Technologies & User Experience",
    bio: "Prof. Brown is a pioneer in web development education and user experience design. She has consulted for major tech companies on UI/UX strategies and leads multiple research projects on modern web technologies and accessibility.",
    courses: "COSC2758 - Full Stack Development, COSC2938 - Further Web Programming",
    awards: "UX Innovation Award 2023, Web Accessibility Champion 2021",
    experience: "Adobe UX Team, Figma Design Systems (14 years)",
    certifications: "Google UX Design Certificate, Adobe Certified Expert",
    contact: "prof.brown@rmit.edu.au",
    avatarPath: "/lecturers/lecturer-4.jpg",
  },
  {
    id: "dr.davis@rmit.edu.au",
    name: "Dr. David Davis",
    title: "Senior Lecturer",
    specialization: "Computational Theory & Data Structures",
    bio: "Dr. Davis brings deep theoretical knowledge combined with practical programming experience. He spent 8 years at Oracle working on database optimization before transitioning to academia. His teaching emphasizes algorithmic thinking and efficient problem-solving.",
    courses: "COSC2123 - Algorithms and Analysis, COSC2671 - Database Systems",
    awards: "Outstanding Educator Award 2022",
    experience: "Oracle Database Team, PostgreSQL Core (8 years)",
    publications: "25+ papers on database optimization and algorithms",
    contact: "dr.davis@rmit.edu.au",
    avatarPath: "/lecturers/lecturer-1.jpg",
  },
  {
    id: "prof.wilson@rmit.edu.au",
    name: "Prof. Lisa Wilson",
    title: "Associate Professor",
    specialization: "Software Architecture & System Design",
    bio: "Prof. Wilson is an expert in large-scale software architecture and system design patterns. She has led architecture teams at several Fortune 500 companies and now teaches the next generation of software architects. Her courses focus on building maintainable, scalable systems.",
    courses: "COSC2767 - Systems Deployment and Operations, COSC1295 - Advanced Programming",
    awards: "Software Architecture Excellence Award 2021",
    experience: "Tesla Software Architecture, Apple Systems (11 years)",
    certifications: "TOGAF Certified, Solution Architecture Expert",
    contact: "prof.wilson@rmit.edu.au",
    avatarPath: "/lecturers/lecturer-2.jpg",
  },
];

// Enhanced course assignment data showing multiple courses per lecturer
export const courseAssignments = {
  "dr.smith@rmit.edu.au": [
    { code: "COSC2758", name: "Full Stack Development", semester: "Semester 1 2025", students: 120, tutorsNeeded: 5, labAssistantsNeeded: 3 },
    { code: "COSC2671", name: "Database Systems", semester: "Semester 1 2025", students: 95, tutorsNeeded: 4, labAssistantsNeeded: 2 },
  ],
  "prof.johnson@rmit.edu.au": [
    { code: "COSC2938", name: "Further Web Programming", semester: "Semester 1 2025", students: 85, tutorsNeeded: 4, labAssistantsNeeded: 2 },
    { code: "COSC2123", name: "Algorithms and Analysis", semester: "Semester 1 2025", students: 110, tutorsNeeded: 4, labAssistantsNeeded: 3 },
  ],
  "dr.williams@rmit.edu.au": [
    { code: "COSC1295", name: "Advanced Programming", semester: "Semester 1 2025", students: 150, tutorsNeeded: 6, labAssistantsNeeded: 4 },
    { code: "COSC2767", name: "Systems Deployment and Operations", semester: "Semester 1 2025", students: 75, tutorsNeeded: 3, labAssistantsNeeded: 2 },
  ],
  "prof.brown@rmit.edu.au": [
    { code: "COSC2758", name: "Full Stack Development", semester: "Semester 1 2025", students: 120, tutorsNeeded: 5, labAssistantsNeeded: 3 },
    { code: "COSC2938", name: "Further Web Programming", semester: "Semester 1 2025", students: 85, tutorsNeeded: 4, labAssistantsNeeded: 2 },
  ],
  "dr.davis@rmit.edu.au": [
    { code: "COSC2123", name: "Algorithms and Analysis", semester: "Semester 1 2025", students: 110, tutorsNeeded: 4, labAssistantsNeeded: 3 },
    { code: "COSC2671", name: "Database Systems", semester: "Semester 1 2025", students: 95, tutorsNeeded: 4, labAssistantsNeeded: 2 },
  ],
  "prof.wilson@rmit.edu.au": [
    { code: "COSC2767", name: "Systems Deployment and Operations", semester: "Semester 1 2025", students: 75, tutorsNeeded: 3, labAssistantsNeeded: 2 },
    { code: "COSC1295", name: "Advanced Programming", semester: "Semester 1 2025", students: 150, tutorsNeeded: 6, labAssistantsNeeded: 4 },
  ],
};

// Function to get lecturer by ID (primarily for display purposes from local data)
export const getLecturerByIdForDisplay = (id: string): Lecturer | undefined => {
  return lecturers.find((lecturer) => lecturer.id === id);
};

// Format lecturer expertise for display
export const formatLecturerExpertise = (lecturer: Lecturer): string => {
  return `${lecturer.title} in ${lecturer.specialization}`;
};

// Get lecturer's assigned courses with details
export const getLecturerAssignedCourses = (lecturerId: string) => {
  return courseAssignments[lecturerId as keyof typeof courseAssignments] || [];
};

// Get lecturers with their course counts (demonstrates multiple course assignments)
export const getLecturersWithCourseLoad = () => {
  return lecturers.map(lecturer => ({
    ...lecturer,
    assignedCourses: getLecturerAssignedCourses(lecturer.id),
    courseCount: getLecturerAssignedCourses(lecturer.id).length,
    totalStudents: getLecturerAssignedCourses(lecturer.id).reduce((sum, course) => sum + course.students, 0),
  }));
};

// Get course distribution across lecturers
export const getCourseDistribution = () => {
  const distribution = new Map<string, string[]>();

  Object.entries(courseAssignments).forEach(([lecturerId, courses]) => {
    courses.forEach(course => {
      if (!distribution.has(course.code)) {
        distribution.set(course.code, []);
      }
      const lecturer = getLecturerByIdForDisplay(lecturerId);
      if (lecturer) {
        distribution.get(course.code)!.push(lecturer.name);
      }
    });
  });

  return Array.from(distribution.entries()).map(([courseCode, lecturerNames]) => ({
    courseCode,
    lecturerNames,
    lecturerCount: lecturerNames.length,
  }));
};

// Function to get lecturers by specialization
export const getLecturersBySpecialization = (
  specialization: string
): Lecturer[] => {
  return lecturers.filter((lecturer) =>
    lecturer.specialization.toLowerCase().includes(specialization.toLowerCase())
  );
};

// Get courses taught by lecturer (updated to use course assignments)
export const getLecturerCourses = (lecturerId: string): string[] => {
  const assignments = getLecturerAssignedCourses(lecturerId);
  return assignments.map(course => `${course.code} - ${course.name}`);
};

// TODO: Add other client-side lecturer display helpers here.
