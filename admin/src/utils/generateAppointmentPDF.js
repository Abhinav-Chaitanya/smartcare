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

// Format date helper
const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A'
    const date = new Date(dateValue)
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

// Format slot date (from "25_12_2024" to "25 December 2024")
const formatSlotDate = (slotDate) => {
    if (!slotDate) return 'N/A'
    const [day, month, year] = slotDate.split('_')
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${day} ${months[parseInt(month) - 1]} ${year}`
}

// Format short date
const formatShortDate = (slotDate) => {
    if (!slotDate) return 'N/A'
    const [day, month, year] = slotDate.split('_')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${day} ${months[parseInt(month) - 1]} ${year}`
}

// Calculate age from DOB
const calculateAge = (dob) => {
    if (!dob || dob === 'Not Selected') return 'N/A'
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }
    return age + ' yrs'
}

export const generateAppointmentPDF = async (appointment, logoUrl) => {
    const doc = new jsPDF()
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    let yPos = 10

    // Colors
    const primaryColor = [79, 70, 229]
    const grayColor = [107, 114, 128]
    const darkColor = [31, 41, 55]
    const lightGrayBg = [249, 250, 251]
    const greenColor = [22, 163, 74]

    // ==================== HEADER ====================
    try {
        const logoBase64 = await loadImageAsBase64(logoUrl)
        const logoWidth = 40
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

    // Tagline
    doc.setFontSize(9)
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'normal')
    doc.text('Healthcare Management System', pageWidth / 2, yPos, { align: 'center' })
    yPos += 5

    // Divider
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.6)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 10

    // ==================== TITLE ====================
    doc.setFontSize(16)
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.text('APPOINTMENT BOOKING RECEIPT', pageWidth / 2, yPos, { align: 'center' })
    yPos += 7

    // Appointment ID
    doc.setFontSize(10)
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'normal')
    doc.text(`Receipt No: SC-${appointment._id.slice(-8).toUpperCase()}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 10

    // ==================== APPOINTMENT SCHEDULE BOX ====================
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 22, 3, 3, 'F')

    doc.setFontSize(10)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('APPOINTMENT SCHEDULE', pageWidth / 2, yPos + 7, { align: 'center' })

    doc.setFontSize(14)
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.text(`${formatShortDate(appointment.slotDate)}  •  ${appointment.slotTime}`, pageWidth / 2, yPos + 16, { align: 'center' })

    yPos += 28

    // ==================== TWO COLUMN LAYOUT ====================
    const leftCol = margin
    const rightCol = pageWidth / 2 + 5
    const colWidth = (pageWidth - 2 * margin - 10) / 2

    // ----- PATIENT DETAILS (Left Column) -----
    doc.setFillColor(...lightGrayBg)
    doc.roundedRect(leftCol, yPos, colWidth, 52, 3, 3, 'F')

    doc.setFontSize(11)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('PATIENT DETAILS', leftCol + 6, yPos + 9)

    doc.setFontSize(10)
    doc.setTextColor(...darkColor)
    let patientY = yPos + 18

    const patientFields = [
        { label: 'Name', value: appointment.userData?.name || 'N/A' },
        { label: 'Phone', value: appointment.userData?.phone || 'N/A' },
        { label: 'Email', value: appointment.userData?.email || 'N/A', truncate: 20 },
        { label: 'Age/Gender', value: `${calculateAge(appointment.userData?.dob)} / ${(appointment.userData?.gender || 'N/A').charAt(0).toUpperCase() + (appointment.userData?.gender || '').slice(1)}` }
    ]

    patientFields.forEach(field => {
        doc.setFont('helvetica', 'bold')
        doc.text(`${field.label}:`, leftCol + 6, patientY)
        doc.setFont('helvetica', 'normal')
        let value = field.value
        if (field.truncate && value.length > field.truncate) {
            value = value.substring(0, field.truncate) + '...'
        }
        doc.text(value, leftCol + 32, patientY)
        patientY += 9
    })

    // ----- DOCTOR DETAILS (Right Column) -----
    doc.setFillColor(240, 253, 244)
    doc.roundedRect(rightCol, yPos, colWidth, 52, 3, 3, 'F')

    doc.setFontSize(11)
    doc.setTextColor(...greenColor)
    doc.setFont('helvetica', 'bold')
    doc.text('DOCTOR DETAILS', rightCol + 6, yPos + 9)

    doc.setFontSize(10)
    doc.setTextColor(...darkColor)
    let doctorY = yPos + 18

    const doctorFields = [
        { label: 'Doctor', value: `Dr. ${appointment.docData?.name || 'N/A'}` },
        { label: 'Speciality', value: appointment.docData?.speciality || 'N/A' },
        { label: 'Degree', value: appointment.docData?.degree || 'N/A' },
        { label: 'Experience', value: appointment.docData?.experience || 'N/A' }
    ]

    doctorFields.forEach(field => {
        doc.setFont('helvetica', 'bold')
        doc.text(`${field.label}:`, rightCol + 6, doctorY)
        doc.setFont('helvetica', 'normal')
        let value = field.value
        if (value.length > 18) {
            value = value.substring(0, 18) + '...'
        }
        doc.text(value, rightCol + 32, doctorY)
        doctorY += 9
    })

    yPos += 60

    // ==================== PAYMENT DETAILS ====================
    doc.setFillColor(254, 252, 232)
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 32, 3, 3, 'F')

    doc.setFontSize(11)
    doc.setTextColor(161, 98, 7)
    doc.setFont('helvetica', 'bold')
    doc.text('PAYMENT DETAILS', margin + 6, yPos + 9)

    doc.setFontSize(10)
    doc.setTextColor(...darkColor)

    // Row 1
    let payY = yPos + 18
    doc.setFont('helvetica', 'bold')
    doc.text('Consultation Fee:', margin + 6, payY)
    doc.setFont('helvetica', 'normal')
    doc.text(`Rs. ${appointment.amount || 'N/A'}`, margin + 45, payY)

    doc.setFont('helvetica', 'bold')
    doc.text('Payment Status:', rightCol, payY)
    doc.setFont('helvetica', 'normal')
    const isPaid = appointment.paymentStatus === 'paid'
    doc.setTextColor(isPaid ? 22 : 220, isPaid ? 163 : 38, isPaid ? 74 : 38)
    doc.text(isPaid ? 'PAID' : 'PENDING', rightCol + 38, payY)
    doc.setTextColor(...darkColor)

    // Row 2
    payY += 9
    doc.setFont('helvetica', 'bold')
    doc.text('Booked On:', margin + 6, payY)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(appointment.date), margin + 32, payY)

    if (appointment.razorpayPaymentId) {
        doc.setFont('helvetica', 'bold')
        doc.text('Payment ID:', rightCol, payY)
        doc.setFont('helvetica', 'normal')
        const payId = appointment.razorpayPaymentId
        doc.text(payId.length > 16 ? payId.substring(0, 16) + '...' : payId, rightCol + 28, payY)
    }

    yPos += 40

    // ==================== INSTRUCTIONS ====================
    doc.setFillColor(254, 242, 242)
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 3, 3, 'F')

    doc.setFontSize(10)
    doc.setTextColor(185, 28, 28)
    doc.setFont('helvetica', 'bold')
    doc.text('IMPORTANT INSTRUCTIONS', margin + 6, yPos + 8)

    doc.setFontSize(9)
    doc.setTextColor(75, 85, 99)
    doc.setFont('helvetica', 'normal')

    const instructions = [
        '• Please arrive 15 minutes before your scheduled appointment time.',
        '• Carry this receipt and a valid ID proof for verification.',
        '• Bring all relevant medical reports and previous prescriptions.'
    ]

    let instrY = yPos + 16
    instructions.forEach(instr => {
        doc.text(instr, margin + 6, instrY)
        instrY += 5
    })

    yPos += 38

    // ==================== REFERENCE BOX ====================
    doc.setDrawColor(...grayColor)
    doc.setLineWidth(0.4)
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 18, 3, 3, 'S')

    doc.setFontSize(9)
    doc.setTextColor(...grayColor)
    doc.text('Appointment Reference', margin + 6, yPos + 7)

    doc.setFontSize(12)
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.text(`SC-${appointment._id.slice(-8).toUpperCase()}`, margin + 6, yPos + 14)

    // Booked stamp on right
    doc.setFontSize(11)
    doc.setTextColor(...greenColor)
    doc.setFont('helvetica', 'bold')
    doc.text('BOOKED', pageWidth - margin - 6, yPos + 11, { align: 'right' })

    // ==================== FOOTER ====================
    const footerY = pageHeight - 15

    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

    doc.setFontSize(8)
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'normal')
    doc.text('This is a computer-generated booking receipt from SmartCare Hospitals. No signature required.', pageWidth / 2, footerY, { align: 'center' })
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, footerY + 5, { align: 'center' })

    // ==================== SAVE PDF ====================
    const patientName = appointment.userData?.name?.replace(/\s+/g, '_') || 'Patient'
    const dateStr = formatShortDate(appointment.slotDate).replace(/\s+/g, '-')
    const fileName = `SmartCare_Booking_${patientName}_${dateStr}.pdf`
    
    doc.save(fileName)
    
    return fileName
}

export default generateAppointmentPDF