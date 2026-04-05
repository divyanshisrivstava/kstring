export type KiitCourseOption = {
  value: string;
  label: string;
  branches?: string[];
};

export const KIIT_COURSES: KiitCourseOption[] = [
  {
    value: "btech",
    label: "B.Tech",
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
    branches: [
      "Electrical Engineering",
      "Computer Science & Engineering",
      "Electronics & Telecommunication Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
    ],
  },
  { value: "bca", label: "BCA" },
  { value: "mca", label: "MCA" },
  { value: "bba", label: "BBA" },
  { value: "mba", label: "MBA", branches: ["MBA", "MBA (Rural Management)"] },
  {
    value: "law",
    label: "Law",
    branches: ["BA LLB", "BBA LLB", "B.Sc LLB", "LLM"],
  },
  { value: "barch", label: "Bachelor of Architecture" },
  { value: "design", label: "Bachelor of Design (Fashion/Textile)" },
  { value: "film_tv", label: "Bachelor in Film and Television Production" },
  {
    value: "nursing",
    label: "Nursing",
    branches: ["B.Sc Nursing", "M.Sc Nursing"],
  },
  {
    value: "science",
    label: "Science",
    branches: ["M.Sc Biotechnology", "M.Sc Applied Microbiology"],
  },
  {
    value: "public_health",
    label: "Public Health & Hospital Administration",
    branches: ["Master of Public Health", "Master of Hospital Administration"],
  },
  { value: "mass_communication", label: "Master of Mass Communication (Integrated)" },
  { value: "phd", label: "Ph.D" },
];

export const getCourseByValue = (value: string) =>
  KIIT_COURSES.find((course) => course.value === value);
