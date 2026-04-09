export type KiitCourseOption = {
  value: string;
  label: string;
  durationYears: number;
  branches?: string[];
};

export const KIIT_COURSES: KiitCourseOption[] = [
  {
    value: "btech",
    label: "B.Tech",
    durationYears: 4,
    branches: [
      "Civil Engineering",
      "Mechanical Engineering",
      "Mechanical Engineering (Automobile)",
      "Electrical Engineering",
      "Electronics & Telecommunication Engineering",
      "Computer Science & Engineering",
      "Information Technology",
      "Electronics & Electrical Engineering",
      "Electronics and Instrumentation Engineering",
      "Aerospace Engineering",
      "Mechatronics Engineering",
      "Production Engineering",
      "Electronics and Computer Science Engineering",
      "Communication Engineering",
      "Medical Electronics Engineering",
      "Computer Science & Communication Engineering",
      "Computer Science & Systems Engineering",
      "Chemical Technology",
      "Biotechnology (Dual Degree B.Tech & M.Tech)",
    ],
  },
  {
    value: "mtech",
    label: "M.Tech",
    durationYears: 2,
    branches: [
      "Electrical Engineering",
      "Computer Science & Engineering",
      "Electronics & Telecommunication Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
    ],
  },
  { value: "bca", label: "BCA", durationYears: 3 },
  { value: "mca", label: "MCA", durationYears: 2 },
  { value: "bba", label: "BBA", durationYears: 3 },
  { value: "mba", label: "MBA", durationYears: 2, branches: ["MBA", "MBA (Rural Management)"] },
  {
    value: "law",
    label: "Law",
    durationYears: 5,
    branches: ["BA LLB", "BBA LLB", "B.Sc LLB", "LLM"],
  },
  { value: "barch", label: "Bachelor of Architecture", durationYears: 5 },
  { value: "design", label: "Bachelor of Design (Fashion/Textile)", durationYears: 4 },
  { value: "film_tv", label: "Bachelor in Film and Television Production", durationYears: 3 },
  {
    value: "nursing",
    label: "Nursing",
    durationYears: 4,
    branches: ["B.Sc Nursing", "M.Sc Nursing"],
  },
  {
    value: "science",
    label: "Science",
    durationYears: 2,
    branches: ["M.Sc Biotechnology", "M.Sc Applied Microbiology"],
  },
  {
    value: "public_health",
    label: "Public Health & Hospital Administration",
    durationYears: 2,
    branches: ["Master of Public Health", "Master of Hospital Administration"],
  },
  { value: "mass_communication", label: "Master of Mass Communication (Integrated)", durationYears: 5 },
  { value: "phd", label: "Ph.D", durationYears: 5 },
];

export const getCourseByValue = (value: string) =>
  KIIT_COURSES.find((course) => course.value === value);

export const getAdmissionYearFromKiitEmail = (email?: string | null) => {
  const normalized = email?.trim().toLowerCase() ?? "";
  const match = normalized.match(/^(\d{2})/);
  if (!match) return null;
  return 2000 + Number.parseInt(match[1], 10);
};
