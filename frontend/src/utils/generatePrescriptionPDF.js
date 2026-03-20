import jsPDF from 'jspdf'

// Helper function to load image as base64
const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/png'))
        }
        img.onerror = reject
        img.src = url
    })
}

export const generatePrescriptionPDF = async (appointment, logoUrl) => {
    const doc = new jsPDF()
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    let yPos = 10

    // Colors
    const primaryColor = [95, 111, 255]
    const grayColor = [107, 114, 128]
    const darkColor = [31, 41, 55]
    const greenColor = [16, 185, 129]

    // ==================== HEADER WITH LOGO ====================
    try {
        const logoBase64 = await loadImageAsBase64(logoUrl)
        const logoWidth = 45
        const logoHeight = 12
        doc.addImage(logoBase64, 'PNG', (pageWidth - logoWidth) / 2, yPos, logoWidth, logoHeight)
        yPos += logoHeight + 3
    } catch (error) {
        doc.setFontSize(20)
        doc.setTextColor(...primaryColor)
        doc.setFont('helvetica', 'bold')
        doc.text('SmartCare', pageWidth / 2, yPos + 8, { align: 'center' })
        yPos += 12
    }

    // Hospital tagline
    doc.setFontSize(8)
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'normal')
    doc.text('Healthcare Management System', pageWidth / 2, yPos, { align: 'center' })
    yPos += 3

    // Divider line
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 15

    // ==================== PRESCRIPTION TITLE WITH STATUS ====================
    doc.setFontSize(16)
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.text('MEDICAL PRESCRIPTION', pageWidth / 2, yPos, { align: 'center' })

    // Status badge
    doc.setFillColor(...greenColor)
    doc.roundedRect(pageWidth - margin - 28, yPos - 6, 28, 8, 2, 2, 'F')
    doc.setFontSize(7)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('COMPLETED', pageWidth - margin - 14, yPos - 1, { align: 'center' })

    yPos += 6

    // Date of issue
    const completedDate = appointment.completedAt 
        ? new Date(appointment.completedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })

    doc.setFontSize(9)
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date of Issue: ${completedDate}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 8

    // ==================== PATIENT & DOCTOR INFO BOX ====================
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 40, 3, 3, 'F')

    const boxStartY = yPos + 6
    const leftCol = margin + 8
    const rightCol = pageWidth / 2 + 5

    // Patient Info (Left Column)
    doc.setFontSize(9)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('PATIENT DETAILS', leftCol, boxStartY)

    doc.setFontSize(8)
    doc.setTextColor(...darkColor)
    
    const patientDetails = [
        { label: 'Name:', value: appointment.userData?.name || 'N/A', labelWidth: 12 },
        { label: 'Email:', value: appointment.userData?.email || 'N/A', labelWidth: 12 },
        { label: 'Phone:', value: appointment.userData?.phone || 'N/A', labelWidth: 14 },
    ]

    const calculateAge = (dob) => {
        if (!dob || dob === 'Not Selected') return 'N/A'
        const today = new Date()
        const birthDate = new Date(dob)
        let age = today.getFullYear() - birthDate.getFullYear()
        return age + ' yrs'
    }

    const gender = appointment.userData?.gender || 'N/A'
    const ageGender = `${calculateAge(appointment.userData?.dob)} / ${gender.charAt(0).toUpperCase() + gender.slice(1)}`

    let detailY = boxStartY + 6
    patientDetails.forEach(detail => {
        doc.setFont('helvetica', 'bold')
        doc.text(detail.label, leftCol, detailY)
        doc.setFont('helvetica', 'normal')
        doc.text(detail.value, leftCol + detail.labelWidth, detailY)
        detailY += 5
    })

    doc.setFont('helvetica', 'bold')
    doc.text('Age/Gender:', leftCol, detailY)
    doc.setFont('helvetica', 'normal')
    doc.text(ageGender, leftCol + 22, detailY)

    // Doctor Info (Right Column)
    doc.setFontSize(9)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('DOCTOR DETAILS', rightCol, boxStartY)

    doc.setFontSize(8)
    doc.setTextColor(...darkColor)

    const formatSlotDate = (slotDate) => {
        if (!slotDate) return 'N/A'
        const [day, month, year] = slotDate.split('_')
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return `${day} ${months[parseInt(month) - 1]} ${year}`
    }

    const doctorDetails = [
        { label: 'Doctor:', value: `Dr. ${appointment.docData?.name || 'N/A'}`, labelWidth: 14 },
        { label: 'Speciality:', value: appointment.docData?.speciality || 'N/A', labelWidth: 18 },
        { label: 'Date:', value: formatSlotDate(appointment.slotDate), labelWidth: 12 },
        { label: 'Time:', value: appointment.slotTime || 'N/A', labelWidth: 12 },
    ]

    detailY = boxStartY + 6
    doctorDetails.forEach(detail => {
        doc.setFont('helvetica', 'bold')
        doc.text(detail.label, rightCol, detailY)
        doc.setFont('helvetica', 'normal')
        doc.text(detail.value, rightCol + detail.labelWidth, detailY)
        detailY += 5
    })

    doc.setFont('helvetica', 'bold')
    doc.text('Fees:', rightCol, detailY)
    doc.setFont('helvetica', 'normal')
    doc.text(`Rs. ${appointment.amount || 'N/A'}`, rightCol + 12, detailY)

    yPos += 45

    // ==================== DIAGNOSIS SECTION ====================
    doc.setFillColor(236, 253, 245)
    
    const diagnosis = appointment.diagnosis || 'No diagnosis recorded'
    const diagnosisLines = doc.splitTextToSize(diagnosis, pageWidth - 2 * margin - 20)
    const diagnosisHeight = 18 + (diagnosisLines.length * 4) // Increased height for line space
    
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, diagnosisHeight, 3, 3, 'F')

    doc.setFontSize(10)
    doc.setTextColor(...greenColor)
    doc.setFont('helvetica', 'bold')
    doc.text('DIAGNOSIS', margin + 8, yPos + 7)

    // Added line space before diagnosis text
    doc.setFontSize(9)
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'normal')
    doc.text(diagnosisLines, margin + 8, yPos + 16) // Moved down for line space

    yPos += diagnosisHeight + 10 // Increased space after diagnosis

    // ==================== PRESCRIPTION SECTION ====================
    doc.setFontSize(10)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('PRESCRIPTION', margin, yPos + 4)
    
    yPos += 12 // Added line space after heading (removed the blue line)

    if (appointment.prescription?.hasMedicines && appointment.prescription.medicines?.length > 0) {
        // Table header
        const tableHeaders = ['#', 'Medicine Name', 'Dosage', 'Timing', 'Duration']
        const colWidths = [8, 62, 28, 35, 32]
        let xPos = margin

        // Header background
        doc.setFillColor(...primaryColor)
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')

        doc.setFontSize(8)
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        
        tableHeaders.forEach((header, i) => {
            doc.text(header, xPos + 2, yPos + 5.5)
            xPos += colWidths[i]
        })

        yPos += 9

        // Table rows
        doc.setTextColor(...darkColor)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)

        appointment.prescription.medicines.forEach((med, index) => {
            if (index % 2 === 0) {
                doc.setFillColor(249, 250, 251)
                doc.rect(margin, yPos - 1, pageWidth - 2 * margin, 7, 'F')
            }

            xPos = margin
            const rowData = [
                (index + 1).toString(),
                med.name || 'N/A',
                `${med.timesPerDay || 1}x daily`,
                med.timing || 'After food',
                med.duration || 'N/A'
            ]

            rowData.forEach((data, i) => {
                const maxWidth = colWidths[i] - 4
                let text = data
                if (doc.getTextWidth(text) > maxWidth) {
                    while (doc.getTextWidth(text + '...') > maxWidth && text.length > 0) {
                        text = text.slice(0, -1)
                    }
                    text += '...'
                }
                doc.text(text, xPos + 2, yPos + 4)
                xPos += colWidths[i]
            })
            yPos += 7
        })

        // Table border
        doc.setDrawColor(229, 231, 235)
        doc.setLineWidth(0.3)
        const tableHeight = 8 + (appointment.prescription.medicines.length * 7)
        doc.rect(margin, yPos - tableHeight, pageWidth - 2 * margin, tableHeight)

    } else {
        doc.setFillColor(249, 250, 251)
        doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 3, 3, 'F')
        doc.setFontSize(9)
        doc.setTextColor(...grayColor)
        doc.setFont('helvetica', 'italic')
        doc.text('No medicines prescribed', pageWidth / 2, yPos + 8, { align: 'center' })
        yPos += 14
    }

    yPos += 12 // Increased space before Doctor's Instructions

    // ==================== DOCTOR'S NOTES ====================
    if (appointment.prescription?.notes) {
        doc.setFillColor(254, 243, 199)
        const notesLines = doc.splitTextToSize(appointment.prescription.notes, pageWidth - 2 * margin - 16)
        const notesHeight = 16 + notesLines.length * 4 // Increased height for line space
        
        doc.roundedRect(margin, yPos, pageWidth - 2 * margin, notesHeight, 3, 3, 'F')
        
        doc.setFontSize(8)
        doc.setTextColor(146, 64, 14)
        doc.setFont('helvetica', 'bold')
        doc.text("DOCTOR'S INSTRUCTIONS:", margin + 8, yPos + 6)
        
        // Added line space before notes text
        doc.setFont('helvetica', 'normal')
        doc.text(notesLines, margin + 8, yPos + 14) // Moved down for line space
        
        yPos += notesHeight + 5
    }

    // ==================== FOOTER ====================
    const footerY = pageHeight - 15

    // Footer divider
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

    // Footer text
    doc.setFontSize(7)
    doc.setTextColor(...grayColor)
    doc.text('This is a computer-generated prescription from SmartCare Hospitals.', pageWidth / 2, footerY, { align: 'center' })
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, footerY + 4, { align: 'center' })

    // ==================== SIGNATURE SECTION (Just above footer) ====================
    const signatureY = footerY - 18 // Positioned just above the footer line

    doc.setDrawColor(...grayColor)
    doc.setLineWidth(0.3)
    doc.line(pageWidth - margin - 50, signatureY, pageWidth - margin, signatureY)

    doc.setFontSize(8)
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'normal')
    doc.text("Doctor's Signature", pageWidth - margin - 25, signatureY + 5, { align: 'center' })

    // ==================== SAVE PDF ====================
    const fileName = `Prescription_${appointment.userData?.name?.replace(/\s+/g, '_') || 'Patient'}_${formatSlotDate(appointment.slotDate).replace(/\s+/g, '_')}.pdf`
    doc.save(fileName)
    
    return fileName
}

export default generatePrescriptionPDF