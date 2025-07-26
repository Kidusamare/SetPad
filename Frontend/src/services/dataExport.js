/**
 * Data Export Service
 * Handles CSV and PDF export of workout data
 */

export class DataExportService {
    
    /**
     * Export workout data to CSV format
     */
    static async exportToCSV(workoutData, filename = 'workout_data') {
        const csvContent = this.convertToCSV(workoutData);
        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    }

    /**
     * Export individual workout to CSV
     */
    static async exportWorkoutToCSV(workout, filename) {
        const rows = [
            ['Workout Name', workout.tableName],
            ['Date', workout.date],
            [''],
            ['Exercise', 'Muscle Group', 'Set #', 'Reps', 'Weight', 'Notes']
        ];

        workout.rows.forEach(row => {
            if (row.sets && row.sets.length > 0) {
                row.sets.forEach((set, setIndex) => {
                    rows.push([
                        setIndex === 0 ? row.exercise : '',
                        setIndex === 0 ? row.muscleGroup : '',
                        setIndex + 1,
                        set.reps || '',
                        set.weight || '',
                        setIndex === 0 ? row.notes || '' : ''
                    ]);
                });
            } else {
                rows.push([
                    row.exercise || '',
                    row.muscleGroup || '',
                    '',
                    '',
                    '',
                    row.notes || ''
                ]);
            }
        });

        const csvContent = rows.map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');

        this.downloadFile(csvContent, filename || `${workout.tableName.replace(/[^a-z0-9]/gi, '_')}.csv`, 'text/csv');
    }

    /**
     * Export multiple workouts to CSV
     */
    static async exportAllWorkoutsToCSV(workouts, filename = 'all_workouts') {
        const rows = [
            ['Date', 'Workout Name', 'Exercise', 'Muscle Group', 'Set #', 'Reps', 'Weight', 'Notes']
        ];

        workouts.forEach(workout => {
            workout.rows.forEach(row => {
                if (row.sets && row.sets.length > 0) {
                    row.sets.forEach((set, setIndex) => {
                        rows.push([
                            workout.date,
                            workout.tableName,
                            row.exercise || '',
                            row.muscleGroup || '',
                            setIndex + 1,
                            set.reps || '',
                            set.weight || '',
                            setIndex === 0 ? row.notes || '' : ''
                        ]);
                    });
                } else {
                    rows.push([
                        workout.date,
                        workout.tableName,
                        row.exercise || '',
                        row.muscleGroup || '',
                        '',
                        '',
                        '',
                        row.notes || ''
                    ]);
                }
            });
        });

        const csvContent = rows.map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');

        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    }

    /**
     * Export progress data to CSV
     */
    static async exportProgressToCSV(exerciseData, filename = 'progress_data') {
        const rows = [
            ['Exercise', 'Date', 'Best Weight', 'Best Reps', 'Total Sets', 'Volume (Weight × Reps)']
        ];

        Object.entries(exerciseData).forEach(([exercise, sessions]) => {
            sessions.forEach(session => {
                const volume = (parseFloat(session.weight) || 0) * (parseFloat(session.reps) || 0);
                rows.push([
                    exercise,
                    session.date,
                    session.weight || '',
                    session.reps || '',
                    session.sets || '',
                    volume.toFixed(2)
                ]);
            });
        });

        const csvContent = rows.map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');

        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    }

    /**
     * Create a simple PDF report (text-based)
     */
    static async exportToPDF(workoutData, filename = 'workout_report') {
        // Create a simple HTML document that can be printed as PDF
        const htmlContent = this.generateHTMLReport(workoutData);
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Add print styles and trigger print dialog
        setTimeout(() => {
            printWindow.print();
        }, 100);
    }

    /**
     * Generate HTML report for PDF export
     */
    static generateHTMLReport(workouts) {
        const totalWorkouts = workouts.length;
        const totalExercises = workouts.reduce((sum, w) => sum + w.rows.length, 0);
        const dateRange = workouts.length > 0 ? 
            `${workouts[workouts.length - 1].date} to ${workouts[0].date}` : 'No data';

        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>SetPad Workout Report</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 40px; 
                        line-height: 1.6;
                        color: #333;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 40px;
                        border-bottom: 2px solid #3b82f6;
                        padding-bottom: 20px;
                    }
                    .summary {
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                    }
                    .workout {
                        margin-bottom: 30px;
                        page-break-inside: avoid;
                    }
                    .workout-title {
                        background: #3b82f6;
                        color: white;
                        padding: 10px 15px;
                        border-radius: 5px;
                        margin-bottom: 15px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 10px;
                        text-align: left;
                    }
                    th {
                        background: #f5f5f5;
                        font-weight: bold;
                    }
                    .exercise-group {
                        background: #fafafa;
                    }
                    @media print {
                        body { margin: 20px; }
                        .header { break-after: page; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>SetPad Fitness Tracker</h1>
                    <h2>Workout Report</h2>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="summary">
                    <h3>Summary</h3>
                    <p><strong>Total Workouts:</strong> ${totalWorkouts}</p>
                    <p><strong>Total Exercises:</strong> ${totalExercises}</p>
                    <p><strong>Date Range:</strong> ${dateRange}</p>
                </div>
        `;

        workouts.forEach(workout => {
            html += `
                <div class="workout">
                    <div class="workout-title">
                        <h3>${workout.tableName} - ${workout.date}</h3>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Exercise</th>
                                <th>Muscle Group</th>
                                <th>Sets</th>
                                <th>Reps</th>
                                <th>Weight</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            workout.rows.forEach(row => {
                if (row.sets && row.sets.length > 0) {
                    row.sets.forEach((set, setIndex) => {
                        html += `
                            <tr>
                                <td>${setIndex === 0 ? row.exercise || '' : ''}</td>
                                <td>${setIndex === 0 ? row.muscleGroup || '' : ''}</td>
                                <td>${setIndex + 1}</td>
                                <td>${set.reps || ''}</td>
                                <td>${set.weight || ''}</td>
                                <td>${setIndex === 0 ? row.notes || '' : ''}</td>
                            </tr>
                        `;
                    });
                } else {
                    html += `
                        <tr>
                            <td>${row.exercise || ''}</td>
                            <td>${row.muscleGroup || ''}</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>${row.notes || ''}</td>
                        </tr>
                    `;
                }
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        });

        html += `
            </body>
            </html>
        `;

        return html;
    }

    /**
     * Download file helper
     */
    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Convert workout data to CSV format
     */
    static convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => `"${row[header] || ''}"`).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }

    /**
     * Generate workout statistics
     */
    static generateWorkoutStats(workouts) {
        const stats = {
            totalWorkouts: workouts.length,
            totalExercises: 0,
            uniqueExercises: new Set(),
            muscleGroups: new Set(),
            totalSets: 0,
            averageWorkoutDuration: 0, // TODO: implement when we track duration
            mostFrequentExercise: '',
            strengthProgression: {}
        };

        workouts.forEach(workout => {
            workout.rows.forEach(row => {
                if (row.exercise) {
                    stats.totalExercises++;
                    stats.uniqueExercises.add(row.exercise);
                    
                    if (row.muscleGroup) {
                        stats.muscleGroups.add(row.muscleGroup);
                    }
                    
                    if (row.sets) {
                        stats.totalSets += row.sets.length;
                    }
                }
            });
        });

        // Convert sets to arrays for JSON serialization
        stats.uniqueExercises = Array.from(stats.uniqueExercises);
        stats.muscleGroups = Array.from(stats.muscleGroups);

        return stats;
    }
}