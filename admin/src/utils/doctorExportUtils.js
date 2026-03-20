import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// Export Doctor Analytics to PDF
export const exportDoctorToPDF = async (data, period) => {
    try {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()

        // Title
        doc.setFontSize(20)
        doc.setTextColor(95, 111, 255)
        doc.text('My Analytics Report', pageWidth / 2, 20, { align: 'center' })

        // Doctor Info
        doc.setFontSize(12)
        doc.setTextColor(100)
        doc.text(`Dr. ${data.doctorInfo.name} - ${data.doctorInfo.speciality}`, pageWidth / 2, 28, { align: 'center' })

        // Period
        const periodLabels = {
            '7d': 'Last 7 Days',
            '30d': 'Last 30 Days',
            '6m': 'Last 6 Months',
            '1y': 'Last Year',
            'all': 'All Time'
        }
        doc.text(`Period: ${periodLabels[period] || period}`, pageWidth / 2, 35, { align: 'center' })
        doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth / 2, 42, { align: 'center' })

        // Overview Stats
        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.text('Performance Overview', 14, 55)

        autoTable(doc, {
            startY: 60,
            head: [['Metric', 'Value']],
            body: [
                ['Total Appointments', data.overviewStats.totalAppointments.toString()],
                ['Total Patients', data.overviewStats.totalPatients.toString()],
                ['Total Revenue', `Rs. ${data.overviewStats.totalRevenue.toLocaleString()}`],
                ['Completed Appointments', data.overviewStats.completedAppointments.toString()],
                ['Cancelled Appointments', data.overviewStats.cancelledAppointments.toString()],
                ['Completion Rate', `${data.overviewStats.completionRate}%`],
                ["Today's Appointments", data.overviewStats.todaysAppointments.toString()],
                ['This Week Appointments', data.overviewStats.thisWeekAppointments.toString()]
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

        // Busiest Days
        doc.addPage()
        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.text('Busiest Days', 14, 20)

        autoTable(doc, {
            startY: 25,
            head: [['Day', 'Appointments']],
            body: data.busiestDays.map(d => [d.day, d.appointments.toString()]),
            theme: 'striped',
            headStyles: { fillColor: [95, 111, 255] }
        })

        // Popular Time Slots
        finalY = doc.lastAutoTable.finalY || 80
        doc.text('Popular Time Slots', 14, finalY + 15)

        autoTable(doc, {
            startY: finalY + 20,
            head: [['Time Slot', 'Appointments']],
            body: data.popularTimeSlots.map(t => [t.time, t.appointments.toString()]),
            theme: 'striped',
            headStyles: { fillColor: [95, 111, 255] }
        })

        // Frequent Patients
        if (data.frequentPatients && data.frequentPatients.length > 0) {
            doc.addPage()
            doc.text('Frequent Patients', 14, 20)

            autoTable(doc, {
                startY: 25,
                head: [['Rank', 'Patient Name', 'Visits', 'Total Spent']],
                body: data.frequentPatients.map((p, index) => [
                    (index + 1).toString(),
                    p.name,
                    p.count.toString(),
                    `Rs. ${p.totalSpent.toLocaleString()}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [95, 111, 255] }
            })
        }

        // Upcoming Appointments
        if (data.upcomingAppointments && data.upcomingAppointments.length > 0) {
            finalY = doc.lastAutoTable.finalY || 80
            
            if (finalY > 200) {
                doc.addPage()
                finalY = 5
            }
            
            doc.text('Upcoming Appointments', 14, finalY + 15)

            autoTable(doc, {
                startY: finalY + 20,
                head: [['Patient', 'Date', 'Time', 'Amount']],
                body: data.upcomingAppointments.map(apt => [
                    apt.patientName,
                    apt.date.split('_').join('/'),
                    apt.time,
                    `Rs. ${apt.amount}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [95, 111, 255] },
                styles: { fontSize: 9 }
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
                'SmartCare - Doctor Analytics Report',
                14,
                doc.internal.pageSize.getHeight() - 10
            )
        }

        const fileName = `doctor-analytics-${period}-${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(fileName)

        return true
    } catch (error) {
        console.error('PDF Export Error:', error)
        throw error
    }
}

// Export Doctor Analytics to Excel
export const exportDoctorToExcel = async (data, period) => {
    try {
        const workbook = XLSX.utils.book_new()

        // Overview Sheet
        const overviewData = [
            ['Doctor Analytics Report'],
            [''],
            ['Doctor', `Dr. ${data.doctorInfo.name}`],
            ['Speciality', data.doctorInfo.speciality],
            ['Period', getPeriodLabel(period)],
            ['Generated', new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
            [''],
            ['Performance Overview'],
            ['Metric', 'Value'],
            ['Total Appointments', data.overviewStats.totalAppointments],
            ['Total Patients', data.overviewStats.totalPatients],
            ['Total Revenue (Rs.)', data.overviewStats.totalRevenue],
            ['Completed Appointments', data.overviewStats.completedAppointments],
            ['Cancelled Appointments', data.overviewStats.cancelledAppointments],
            ['Completion Rate (%)', data.overviewStats.completionRate],
            ["Today's Appointments", data.overviewStats.todaysAppointments],
            ['This Week Appointments', data.overviewStats.thisWeekAppointments],
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

        // Busiest Days Sheet
        if (data.busiestDays && data.busiestDays.length > 0) {
            const busiestData = [
                ['Busiest Days'],
                ['Day', 'Appointments'],
                ...data.busiestDays.map(item => [item.day, item.appointments])
            ]
            const busiestSheet = XLSX.utils.aoa_to_sheet(busiestData)
            XLSX.utils.book_append_sheet(workbook, busiestSheet, 'Busiest Days')
        }

        // Popular Time Slots Sheet
        if (data.popularTimeSlots && data.popularTimeSlots.length > 0) {
            const timeSlotsData = [
                ['Popular Time Slots'],
                ['Time', 'Appointments'],
                ...data.popularTimeSlots.map(item => [item.time, item.appointments])
            ]
            const timeSlotsSheet = XLSX.utils.aoa_to_sheet(timeSlotsData)
            XLSX.utils.book_append_sheet(workbook, timeSlotsSheet, 'Time Slots')
        }

        // Frequent Patients Sheet
        if (data.frequentPatients && data.frequentPatients.length > 0) {
            const patientsData = [
                ['Frequent Patients'],
                ['Rank', 'Patient Name', 'Email', 'Visits', 'Total Spent (Rs.)'],
                ...data.frequentPatients.map((p, index) => [index + 1, p.name, p.email, p.count, p.totalSpent])
            ]
            const patientsSheet = XLSX.utils.aoa_to_sheet(patientsData)
            XLSX.utils.book_append_sheet(workbook, patientsSheet, 'Frequent Patients')
        }

        // Upcoming Appointments Sheet
        if (data.upcomingAppointments && data.upcomingAppointments.length > 0) {
            const upcomingData = [
                ['Upcoming Appointments'],
                ['Patient Name', 'Email', 'Date', 'Time', 'Amount (Rs.)', 'Status'],
                ...data.upcomingAppointments.map(apt => [
                    apt.patientName,
                    apt.patientEmail,
                    apt.date.split('_').join('/'),
                    apt.time,
                    apt.amount,
                    apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
                ])
            ]
            const upcomingSheet = XLSX.utils.aoa_to_sheet(upcomingData)
            XLSX.utils.book_append_sheet(workbook, upcomingSheet, 'Upcoming')
        }

        // Recent Appointments Sheet
        if (data.recentAppointments && data.recentAppointments.length > 0) {
            const recentData = [
                ['Recent Appointments'],
                ['Patient Name', 'Date', 'Time', 'Amount (Rs.)', 'Status', 'Diagnosis'],
                ...data.recentAppointments.map(apt => [
                    apt.patientName,
                    apt.date.split('_').join('/'),
                    apt.time,
                    apt.amount,
                    apt.status.charAt(0).toUpperCase() + apt.status.slice(1),
                    apt.diagnosis || '-'
                ])
            ]
            const recentSheet = XLSX.utils.aoa_to_sheet(recentData)
            XLSX.utils.book_append_sheet(workbook, recentSheet, 'Recent')
        }

        XLSX.writeFile(workbook, `doctor-analytics-${period}-${new Date().toISOString().split('T')[0]}.xlsx`)

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