import nodemailer from 'nodemailer'

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

// Welcome email for new doctor
export const sendDoctorWelcomeEmail = async (doctorEmail, doctorName, password) => {
    try {
        const loginUrl = 'http://localhost:5174/login' // Change this to your actual doctor panel URL

        const mailOptions = {
            from: {
                name: 'SmartCare',
                address: process.env.EMAIL_USER
            },
            to: doctorEmail,
            subject: '🎉 Welcome to SmartCare - Your Account is Ready!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #5f6FFF 0%, #4650c4 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                                🏥 SmartCare
                            </h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
                                Healthcare Management System
                            </p>
                        </div>

                        <!-- Welcome Message -->
                        <div style="padding: 40px 30px;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 40px;">✓</span>
                                </div>
                                <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">
                                    Welcome, Dr. ${doctorName}!
                                </h2>
                                <p style="color: #6b7280; margin: 0; font-size: 16px;">
                                    Your account has been created successfully
                                </p>
                            </div>

                            <!-- Credentials Box -->
                            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                                <h3 style="color: #0369a1; margin: 0 0 20px 0; font-size: 16px; display: flex; align-items: center;">
                                    🔐 Your Login Credentials
                                </h3>
                                
                                <div style="background: #ffffff; border-radius: 8px; padding: 15px; margin-bottom: 12px; border-left: 4px solid #5f6FFF;">
                                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                                    <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${doctorEmail}</p>
                                </div>
                                
                                <div style="background: #ffffff; border-radius: 8px; padding: 15px; border-left: 4px solid #10b981;">
                                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Password</p>
                                    <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600; font-family: monospace; letter-spacing: 1px;">${password}</p>
                                </div>
                            </div>

                            <!-- Warning Box -->
                            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; display: flex; align-items: flex-start;">
                                    <span style="margin-right: 10px; font-size: 20px;">⚠️</span>
                                    <span><strong>Important:</strong> For security purposes, please change your password immediately after your first login.</span>
                                </p>
                            </div>

                            <!-- Login Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #5f6FFF 0%, #4650c4 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(95, 111, 255, 0.3);">
                                    Login to Your Account →
                                </a>
                            </div>

                            <!-- Features -->
                            <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 25px;">
                                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">
                                    What you can do with SmartCare:
                                </h3>
                                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                    <div style="background: #f3f4f6; padding: 10px 15px; border-radius: 20px; font-size: 13px; color: #4b5563;">
                                        📅 Manage Appointments
                                    </div>
                                    <div style="background: #f3f4f6; padding: 10px 15px; border-radius: 20px; font-size: 13px; color: #4b5563;">
                                        👥 View Patient Details
                                    </div>
                                    <div style="background: #f3f4f6; padding: 10px 15px; border-radius: 20px; font-size: 13px; color: #4b5563;">
                                        ✅ Mark Appointments Complete
                                    </div>
                                    <div style="background: #f3f4f6; padding: 10px 15px; border-radius: 20px; font-size: 13px; color: #4b5563;">
                                        📊 View Dashboard Analytics
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                Need help? Contact our support team
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © ${new Date().getFullYear()} SmartCare. All rights reserved.
                            </p>
                        </div>

                    </div>
                </body>
                </html>
            `
        }

        const info = await transporter.sendMail(mailOptions)
        console.log('Welcome email sent successfully:', info.messageId)
        return { success: true, messageId: info.messageId }

    } catch (error) {
        console.error('Error sending welcome email:', error)
        return { success: false, error: error.message }
    }
}

export default transporter