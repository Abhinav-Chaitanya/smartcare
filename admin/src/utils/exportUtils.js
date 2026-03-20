/*import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

// Export Analytics to PDF
export const exportToPDF = async (data, period) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Title
    doc.setFontSize(20)
    doc.setTextColor(95, 111, 255) // Primary color
    doc.text('Analytics Report', pageWidth / 2, 20, { align: 'center' })
    
    // Period
    doc.setFontSize(12)
    doc.setTextColor(100)
    const periodLabels = {
        '7d': 'Last 7 Days',
        '30d': 'Last 30 Days',
        '6m': 'Last 6 Months',
        '1y': 'Last Year',
        'all': 'All Time'
    }
    doc.text(`Period: ${periodLabels[period] || period}`, pageWidth / 2, 28, { align: 'center' })
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth / 2, 35, { align: 'center' })
    
    // Overview Stats
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text('Overview Statistics', 14, 50)
    
    doc.autoTable({
        startY: 55,
        head: [['Metric', 'Value']],
        body: [
            ['Total Doctors', data.overviewStats.totalDoctors.toString()],
            ['Available Doctors', data.overviewStats.availableDoctors.toString()],
            ['Total Patients', data.overviewStats.totalPatients.toString()],
            ['Total Appointments', data.overviewStats.totalAppointments.toString()],
            ['Total Revenue', `Rs. ${data.overviewStats.totalRevenue.toLocaleString()}`],
            ["Today's Appointments", data.overviewStats.todaysAppointments.toString()],
            ['This Month Appointments', data.overviewStats.thisMonthAppointments.toString()]
        ],
        theme: 'striped',
        headStyles: { fillColor: [95, 111, 255] }
    })
    
    // Appointment Status Distribution
    doc.text('Appointment Status Distribution', 14, doc.lastAutoTable.finalY + 15)
    
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Status', 'Count']],
        body: [
            ['Confirmed', data.statusDistribution.confirmed.toString()],
            ['Completed', data.statusDistribution.completed.toString()],
            ['Cancelled', data.statusDistribution.cancelled.toString()],
            ['Expired', data.statusDistribution.expired.toString()],
            ['Pending', data.statusDistribution.pending.toString()]
        ],
        theme: 'striped',
        headStyles: { fillColor: [95, 111, 255] }
    })
    
    // Top Doctors
    if (data.topDoctors && data.topDoctors.length > 0) {
        doc.addPage()
        doc.text('Top 5 Doctors', 14, 20)
        
        doc.autoTable({
            startY: 25,
            head: [['Rank', 'Doctor Name', 'Speciality', 'Completed Appointments', 'Revenue']],
            body: data.topDoctors.map((doc, index) => [
                (index + 1).toString(),
                doc.name,
                doc.speciality,
                doc.completedAppointments.toString(),
                `Rs. ${doc.revenue.toLocaleString()}`
            ]),
            theme: 'striped',
            headStyles: { fillColor: [95, 111, 255] }
        })
    }
    
    // Doctors by Speciality
    if (data.doctorsBySpeciality && data.doctorsBySpeciality.length > 0) {
        doc.text('Doctors by Speciality', 14, doc.lastAutoTable.finalY + 15)
        
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Speciality', 'Count']],
            body: data.doctorsBySpeciality.map(spec => [spec.name, spec.value.toString()]),
            theme: 'striped',
            headStyles: { fillColor: [95, 111, 255] }
        })
    }
    
    // Recent Appointments
    if (data.recentAppointments && data.recentAppointments.length > 0) {
        doc.addPage()
        doc.text('Recent Appointments', 14, 20)
        
        doc.autoTable({
            startY: 25,
            head: [['Patient', 'Doctor', 'Date', 'Time', 'Amount', 'Status']],
            body: data.recentAppointments.map(apt => [
                apt.patientName,
                apt.doctorName,
                apt.date.split('_').join('/'),
                apt.time,
                `Rs. ${apt.amount}`,
                apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
            ]),
            theme: 'striped',
            headStyles: { fillColor: [95, 111, 255] },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 30 },
                2: { cellWidth: 25 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 },
                5: { cellWidth: 25 }
            }
        })
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.setTextColor(150)
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })
        doc.text('SmartCare Hospitals - Analytics Report', 14, doc.internal.pageSize.getHeight() - 10)
    }
    
    doc.save(`analytics-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`)
}

// Export Analytics to Excel
export const exportToExcel = async (data, period) => {
    const workbook = XLSX.utils.book_new()
    
    // Overview Sheet
    const overviewData = [
        ['Analytics Report - SmartCare Hospitals'],
        [''],
        ['Period', getPeriodLabel(period)],
        ['Generated', new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
        [''],
        ['Overview Statistics'],
        ['Metric', 'Value'],
        ['Total Doctors', data.overviewStats.totalDoctors],
        ['Available Doctors', data.overviewStats.availableDoctors],
        ['Unavailable Doctors', data.overviewStats.unavailableDoctors],
        ['Total Patients', data.overviewStats.totalPatients],
        ['Total Appointments', data.overviewStats.totalAppointments],
        ['Total Revenue (Rs.)', data.overviewStats.totalRevenue],
        ["Today's Appointments", data.overviewStats.todaysAppointments],
        ['This Month Appointments', data.overviewStats.thisMonthAppointments],
        [''],
        ['Appointment Status Distribution'],
        ['Status', 'Count'],
        ['Confirmed', data.statusDistribution.confirmed],
        ['Completed', data.statusDistribution.completed],
        ['Cancelled', data.statusDistribution.cancelled],
        ['Expired', data.statusDistribution.expired],
        ['Pending', data.statusDistribution.pending]
    ]
    
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview')
    
    // Appointments Over Time Sheet
    if (data.appointmentsOverTime && data.appointmentsOverTime.length > 0) {
        const appointmentsData = [
            ['Appointments Over Time'],
            ['Date', 'Total', 'Completed', 'Cancelled'],
            ...data.appointmentsOverTime.map(item => [item.date, item.total, item.completed, item.cancelled])
        ]
        const appointmentsSheet = XLSX.utils.aoa_to_sheet(appointmentsData)
        XLSX.utils.book_append_sheet(workbook, appointmentsSheet, 'Appointments Trend')
    }
    
    // Revenue Over Time Sheet
    if (data.revenueOverTime && data.revenueOverTime.length > 0) {
        const revenueData = [
            ['Revenue Over Time'],
            ['Date', 'Revenue (Rs.)'],
            ...data.revenueOverTime.map(item => [item.date, item.revenue])
        ]
        const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData)
        XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue Trend')
    }
    
    // Top Doctors Sheet
    if (data.topDoctors && data.topDoctors.length > 0) {
        const topDoctorsData = [
            ['Top Doctors'],
            ['Rank', 'Name', 'Speciality', 'Completed Appointments', 'Revenue (Rs.)'],
            ...data.topDoctors.map((doc, index) => [index + 1, doc.name, doc.speciality, doc.completedAppointments, doc.revenue])
        ]
        const topDoctorsSheet = XLSX.utils.aoa_to_sheet(topDoctorsData)
        XLSX.utils.book_append_sheet(workbook, topDoctorsSheet, 'Top Doctors')
    }
    
    // Doctors by Speciality Sheet
    if (data.doctorsBySpeciality && data.doctorsBySpeciality.length > 0) {
        const specialityData = [
            ['Doctors by Speciality'],
            ['Speciality', 'Count'],
            ...data.doctorsBySpeciality.map(item => [item.name, item.value])
        ]
        const specialitySheet = XLSX.utils.aoa_to_sheet(specialityData)
        XLSX.utils.book_append_sheet(workbook, specialitySheet, 'By Speciality')
    }
    
    // Patient Registrations Sheet
    if (data.patientRegistrations && data.patientRegistrations.length > 0) {
        const patientsData = [
            ['New Patient Registrations'],
            ['Date', 'New Patients'],
            ...data.patientRegistrations.map(item => [item.date, item.count])
        ]
        const patientsSheet = XLSX.utils.aoa_to_sheet(patientsData)
        XLSX.utils.book_append_sheet(workbook, patientsSheet, 'Patient Registrations')
    }
    
    // Recent Appointments Sheet
    if (data.recentAppointments && data.recentAppointments.length > 0) {
        const recentData = [
            ['Recent Appointments'],
            ['Patient Name', 'Doctor Name', 'Speciality', 'Date', 'Time', 'Amount (Rs.)', 'Status'],
            ...data.recentAppointments.map(apt => [
                apt.patientName,
                apt.doctorName,
                apt.speciality,
                apt.date.split('_').join('/'),
                apt.time,
                apt.amount,
                apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
            ])
        ]
        const recentSheet = XLSX.utils.aoa_to_sheet(recentData)
        XLSX.utils.book_append_sheet(workbook, recentSheet, 'Recent Appointments')
    }
    
    // Revenue by Doctor Sheet
    if (data.revenueByDoctor && data.revenueByDoctor.length > 0) {
        const revByDocData = [
            ['Revenue by Doctor'],
            ['Doctor Name', 'Revenue (Rs.)'],
            ...data.revenueByDoctor.map(item => [item.name, item.revenue])
        ]
        const revByDocSheet = XLSX.utils.aoa_to_sheet(revByDocData)
        XLSX.utils.book_append_sheet(workbook, revByDocSheet, 'Revenue by Doctor')
    }
    
    XLSX.writeFile(workbook, `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Helper function
const getPeriodLabel = (period) => {
    const labels = {
        '7d': 'Last 7 Days',
        '30d': 'Last 30 Days',
        '6m': 'Last 6 Months',
        '1y': 'Last Year',
        'all': 'All Time'
    }
    return labels[period] || period
}  */


import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// Export Analytics to PDF
export const exportToPDF = async (data, period) => {
    try {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        
        // Title
        doc.setFontSize(20)
        doc.setTextColor(95, 111, 255) // Primary color
        doc.text('Analytics Report', pageWidth / 2, 20, { align: 'center' })
        
        // Period
        doc.setFontSize(12)
        doc.setTextColor(100)
        const periodLabels = {
            '7d': 'Last 7 Days',
            '30d': 'Last 30 Days',
            '6m': 'Last 6 Months',
            '1y': 'Last Year',
            'all': 'All Time'
        }
        doc.text(`Period: ${periodLabels[period] || period}`, pageWidth / 2, 28, { align: 'center' })
        doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth / 2, 35, { align: 'center' })
        
        // Overview Stats
        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.text('Overview Statistics', 14, 50)
        
        autoTable(doc, {
            startY: 55,
            head: [['Metric', 'Value']],
            body: [
                ['Total Doctors', data.overviewStats.totalDoctors.toString()],
                ['Available Doctors', data.overviewStats.availableDoctors.toString()],
                ['Total Patients', data.overviewStats.totalPatients.toString()],
                ['Total Appointments', data.overviewStats.totalAppointments.toString()],
                ['Total Revenue', `Rs. ${data.overviewStats.totalRevenue.toLocaleString()}`],
                ["Today's Appointments", data.overviewStats.todaysAppointments.toString()],
                ['This Month Appointments', data.overviewStats.thisMonthAppointments.toString()]
            ],
            theme: 'striped',
            headStyles: { fillColor: [95, 111, 255] }
        })
        
        // Appointment Status Distribution
        let finalY = doc.lastAutoTable.finalY || 120
        doc.text('Appointment Status Distribution', 14, finalY + 15)
        
        autoTable(doc, {
            startY: finalY + 20,
            head: [['Status', 'Count']],
            body: [
                ['Confirmed', data.statusDistribution.confirmed.toString()],
                ['Completed', data.statusDistribution.completed.toString()],
                ['Cancelled', data.statusDistribution.cancelled.toString()],
                ['Expired', data.statusDistribution.expired.toString()],
                ['Pending', data.statusDistribution.pending.toString()]
            ],
            theme: 'striped',
            headStyles: { fillColor: [95, 111, 255] }
        })
        
        // Top Doctors
        if (data.topDoctors && data.topDoctors.length > 0) {
            doc.addPage()
            doc.setFontSize(14)
            doc.setTextColor(0)
            doc.text('Top 5 Doctors', 14, 20)
            
            autoTable(doc, {
                startY: 25,
                head: [['Rank', 'Doctor Name', 'Speciality', 'Completed Appointments', 'Revenue']],
                body: data.topDoctors.map((doctor, index) => [
                    (index + 1).toString(),
                    doctor.name,
                    doctor.speciality,
                    doctor.completedAppointments.toString(),
                    `Rs. ${doctor.revenue.toLocaleString()}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [95, 111, 255] }
            })
            
            // Doctors by Speciality
            if (data.doctorsBySpeciality && data.doctorsBySpeciality.length > 0) {
                finalY = doc.lastAutoTable.finalY || 80
                doc.text('Doctors by Speciality', 14, finalY + 15)
                
                autoTable(doc, {
                    startY: finalY + 20,
                    head: [['Speciality', 'Count']],
                    body: data.doctorsBySpeciality.map(spec => [spec.name, spec.value.toString()]),
                    theme: 'striped',
                    headStyles: { fillColor: [95, 111, 255] }
                })
            }
        }
        
        // Recent Appointments
        if (data.recentAppointments && data.recentAppointments.length > 0) {
            doc.addPage()
            doc.setFontSize(14)
            doc.setTextColor(0)
            doc.text('Recent Appointments', 14, 20)
            
            autoTable(doc, {
                startY: 25,
                head: [['Patient', 'Doctor', 'Date', 'Time', 'Amount', 'Status']],
                body: data.recentAppointments.map(apt => [
                    apt.patientName,
                    apt.doctorName,
                    apt.date.split('_').join('/'),
                    apt.time,
                    `Rs. ${apt.amount}`,
                    apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
                ]),
                theme: 'striped',
                headStyles: { fillColor: [95, 111, 255] },
                styles: { fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 20 },
                    4: { cellWidth: 22 },
                    5: { cellWidth: 22 }
                }
            })
        }
        
        // Revenue by Doctor
        if (data.revenueByDoctor && data.revenueByDoctor.length > 0) {
            finalY = doc.lastAutoTable.finalY || 80
            
            // Check if we need a new page
            if (finalY > 230) {
                doc.addPage()
                finalY = 5
            }
            
            doc.setFontSize(14)
            doc.setTextColor(0)
            doc.text('Revenue by Doctor (Top 5)', 14, finalY + 15)
            
            autoTable(doc, {
                startY: finalY + 20,
                head: [['Doctor Name', 'Revenue']],
                body: data.revenueByDoctor.map(item => [
                    item.name,
                    `Rs. ${item.revenue.toLocaleString()}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [95, 111, 255] }
            })
        }
        
        // Footer on all pages
        const pageCount = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(10)
            doc.setTextColor(150)
            doc.text(
                `Page ${i} of ${pageCount}`, 
                pageWidth / 2, 
                doc.internal.pageSize.getHeight() - 10, 
                { align: 'center' }
            )
            doc.text(
                'SmartCare Hospitals - Analytics Report', 
                14, 
                doc.internal.pageSize.getHeight() - 10
            )
        }
        
        // Save the PDF
        const fileName = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(fileName)
        
        return true
    } catch (error) {
        console.error('PDF Export Error:', error)
        throw error
    }
}

// Export Analytics to Excel
export const exportToExcel = async (data, period) => {
    try {
        const workbook = XLSX.utils.book_new()
        
        // Overview Sheet
        const overviewData = [
            ['Analytics Report - SmartCare Hospitals'],
            [''],
            ['Period', getPeriodLabel(period)],
            ['Generated', new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
            [''],
            ['Overview Statistics'],
            ['Metric', 'Value'],
            ['Total Doctors', data.overviewStats.totalDoctors],
            ['Available Doctors', data.overviewStats.availableDoctors],
            ['Unavailable Doctors', data.overviewStats.unavailableDoctors],
            ['Total Patients', data.overviewStats.totalPatients],
            ['Total Appointments', data.overviewStats.totalAppointments],
            ['Total Revenue (Rs.)', data.overviewStats.totalRevenue],
            ["Today's Appointments", data.overviewStats.todaysAppointments],
            ['This Month Appointments', data.overviewStats.thisMonthAppointments],
            [''],
            ['Appointment Status Distribution'],
            ['Status', 'Count'],
            ['Confirmed', data.statusDistribution.confirmed],
            ['Completed', data.statusDistribution.completed],
            ['Cancelled', data.statusDistribution.cancelled],
            ['Expired', data.statusDistribution.expired],
            ['Pending', data.statusDistribution.pending]
        ]
        
        const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)
        XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview')
        
        // Appointments Over Time Sheet
        if (data.appointmentsOverTime && data.appointmentsOverTime.length > 0) {
            const appointmentsData = [
                ['Appointments Over Time'],
                ['Date', 'Total', 'Completed', 'Cancelled'],
                ...data.appointmentsOverTime.map(item => [item.date, item.total, item.completed, item.cancelled])
            ]
            const appointmentsSheet = XLSX.utils.aoa_to_sheet(appointmentsData)
            XLSX.utils.book_append_sheet(workbook, appointmentsSheet, 'Appointments Trend')
        }
        
        // Revenue Over Time Sheet
        if (data.revenueOverTime && data.revenueOverTime.length > 0) {
            const revenueData = [
                ['Revenue Over Time'],
                ['Date', 'Revenue (Rs.)'],
                ...data.revenueOverTime.map(item => [item.date, item.revenue])
            ]
            const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData)
            XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue Trend')
        }
        
        // Top Doctors Sheet
        if (data.topDoctors && data.topDoctors.length > 0) {
            const topDoctorsData = [
                ['Top Doctors'],
                ['Rank', 'Name', 'Speciality', 'Completed Appointments', 'Revenue (Rs.)'],
                ...data.topDoctors.map((doc, index) => [index + 1, doc.name, doc.speciality, doc.completedAppointments, doc.revenue])
            ]
            const topDoctorsSheet = XLSX.utils.aoa_to_sheet(topDoctorsData)
            XLSX.utils.book_append_sheet(workbook, topDoctorsSheet, 'Top Doctors')
        }
        
        // Doctors by Speciality Sheet
        if (data.doctorsBySpeciality && data.doctorsBySpeciality.length > 0) {
            const specialityData = [
                ['Doctors by Speciality'],
                ['Speciality', 'Count'],
                ...data.doctorsBySpeciality.map(item => [item.name, item.value])
            ]
            const specialitySheet = XLSX.utils.aoa_to_sheet(specialityData)
            XLSX.utils.book_append_sheet(workbook, specialitySheet, 'By Speciality')
        }
        
        // Patient Registrations Sheet
        if (data.patientRegistrations && data.patientRegistrations.length > 0) {
            const patientsData = [
                ['New Patient Registrations'],
                ['Date', 'New Patients'],
                ...data.patientRegistrations.map(item => [item.date, item.count])
            ]
            const patientsSheet = XLSX.utils.aoa_to_sheet(patientsData)
            XLSX.utils.book_append_sheet(workbook, patientsSheet, 'Patient Registrations')
        }
        
        // Recent Appointments Sheet
        if (data.recentAppointments && data.recentAppointments.length > 0) {
            const recentData = [
                ['Recent Appointments'],
                ['Patient Name', 'Doctor Name', 'Speciality', 'Date', 'Time', 'Amount (Rs.)', 'Status'],
                ...data.recentAppointments.map(apt => [
                    apt.patientName,
                    apt.doctorName,
                    apt.speciality,
                    apt.date.split('_').join('/'),
                    apt.time,
                    apt.amount,
                    apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
                ])
            ]
            const recentSheet = XLSX.utils.aoa_to_sheet(recentData)
            XLSX.utils.book_append_sheet(workbook, recentSheet, 'Recent Appointments')
        }
        
        // Revenue by Doctor Sheet
        if (data.revenueByDoctor && data.revenueByDoctor.length > 0) {
            const revByDocData = [
                ['Revenue by Doctor'],
                ['Doctor Name', 'Revenue (Rs.)'],
                ...data.revenueByDoctor.map(item => [item.name, item.revenue])
            ]
            const revByDocSheet = XLSX.utils.aoa_to_sheet(revByDocData)
            XLSX.utils.book_append_sheet(workbook, revByDocSheet, 'Revenue by Doctor')
        }
        
        XLSX.writeFile(workbook, `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.xlsx`)
        
        return true
    } catch (error) {
        console.error('Excel Export Error:', error)
        throw error
    }
}

// Helper function
const getPeriodLabel = (period) => {
    const labels = {
        '7d': 'Last 7 Days',
        '30d': 'Last 30 Days',
        '6m': 'Last 6 Months',
        '1y': 'Last Year',
        'all': 'All Time'
    }
    return labels[period] || period
}