/**
 * Academic Grade Calculator Utility
 * Follows UGC / AICTE standard 10-point grading scale
 */

function calculateGrade(marksObtained, totalMarks = 100) {
    const percentage = (Number(marksObtained) / Number(totalMarks)) * 100;

    let grade = 'F';
    let gradePoint = 0.0;
    let remarks = 'Fail';

    if (percentage >= 90) {
        grade = 'O';
        gradePoint = 10.0;
        remarks = 'Outstanding';
    } else if (percentage >= 80) {
        grade = 'A+';
        gradePoint = 9.0;
        remarks = 'Excellent';
    } else if (percentage >= 70) {
        grade = 'A';
        gradePoint = 8.0;
        remarks = 'Very Good';
    } else if (percentage >= 60) {
        grade = 'B+';
        gradePoint = 7.0;
        remarks = 'Good';
    } else if (percentage >= 50) {
        grade = 'B';
        gradePoint = 6.0;
        remarks = 'Above Average';
    } else if (percentage >= 45) {
        grade = 'C';
        gradePoint = 5.0;
        remarks = 'Average';
    } else if (percentage >= 40) {
        grade = 'P';
        gradePoint = 4.0;
        remarks = 'Pass';
    } else {
        grade = 'F';
        gradePoint = 0.0;
        remarks = 'Fail / Re-appear';
    }

    return {
        percentage: Number(percentage.toFixed(2)),
        grade,
        gradePoint,
        remarks,
        isPassed: percentage >= 40
    };
}

module.exports = {
    calculateGrade
};

