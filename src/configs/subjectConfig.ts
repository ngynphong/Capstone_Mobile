/**
 * Configuration for subject-based input type detection.
 * Used to determine whether to show MathKeyboard (for STEM subjects)
 * or regular TextInput (for essay-based subjects).
 */

/**
 * Subject identifiers for LaTeX/Math keyboard mode.
 * Include both subject codes and names for flexible matching.
 * These subjects require mathematical formulas and special symbols.
 */
export const LATEX_SUBJECT_IDENTIFIERS: string[] = [
    // Codes
    "MATH",
    "PHY",
    "CHEM",
    "CALC",
    "ALG",
    "GEOM",
    "TRIG",
    "STAT",
    // Names (English)
    "Mathematics",
    "Physics",
    "Chemistry",
    "Calculus",
    "Algebra",
    "Geometry",
    "Trigonometry",
    "Statistics",
    // AP Courses
    "AP Calculus AB",
    "AP Calculus BC",
    "AP Statistics",
    "AP Physics",
    "AP Chemistry",
    // Vietnamese
    "Toán",
    "Vật lý",
    "Hóa học",
    "Hoá học",
];

/**
 * Subject identifiers for split screen / essay mode (long text answers).
 * Include both subject codes and names for flexible matching.
 * These subjects require long-form written responses.
 */
export const ESSAY_SUBJECT_IDENTIFIERS: string[] = [
    // Codes
    "AP 092",
    "HIST",
    "ENG",
    "LIT",
    "GEO",
    "SOC",
    "PHIL",
    // Names (English)
    "History",
    "AP English Language",
    "AP English Literature",
    "Literature",
    "English",
    "Geography",
    "Social Studies",
    "Philosophy",
    "Psychology",
    "Economics",
    "Government",
    "Art History",
    // Vietnamese
    "Văn học",
    "Lịch sử",
    "Địa lý",
    "Tiếng Anh",
    "Ngữ văn",
];

/**
 * Check if a subject name/code requires MathKeyboard input.
 * @param subjectName - The subject name or code to check
 * @returns true if the subject needs MathKeyboard, false otherwise
 */
export const needsMathKeyboard = (subjectName: string): boolean => {
    if (!subjectName) return false;

    const lowerName = subjectName.toLowerCase();

    return LATEX_SUBJECT_IDENTIFIERS.some(identifier =>
        lowerName.includes(identifier.toLowerCase())
    );
};

/**
 * Check if a subject name/code is an essay-based subject.
 * @param subjectName - The subject name or code to check
 * @returns true if the subject is essay-based, false otherwise
 */
export const isEssaySubject = (subjectName: string): boolean => {
    if (!subjectName) return false;

    const lowerName = subjectName.toLowerCase();

    return ESSAY_SUBJECT_IDENTIFIERS.some(identifier =>
        lowerName.includes(identifier.toLowerCase())
    );
};
