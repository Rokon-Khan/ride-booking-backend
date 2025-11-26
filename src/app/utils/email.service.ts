import { createTransport } from "../config/nodemailer";

const transporter = createTransport();

export async function sendEmailVerification(email: string, otp: string) {
  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Verify your email - Ride Sharing Pro",
    text: `Your one-time verification code is ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; text-align: center;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #003366; margin-bottom: 20px;">Ride Sharing Pro</h1>
          <p style="font-size: 16px; color: #333;">Your one-time verification code:</p>
          <h2 style="font-size: 32px; color: #000; letter-spacing: 2px; margin: 15px 0;">${otp}</h2>
          <p style="font-size: 14px; color: #555;">This code expires after <b>5 minutes</b>.  
          If you did not request this, please ignore this email or reset your password immediately.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">© 2025 Ride Sharing Pro. All rights reserved.</p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetOTP(email: string, otp: string) {
  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Password Reset OTP - Ride Sharing Pro",
    text: `Your password reset OTP is ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; text-align: center;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #003366; margin-bottom: 20px;">Ride Sharing Pro</h1>
          <p style="font-size: 16px; color: #333;">Your password reset code:</p>
          <h2 style="font-size: 32px; color: #000; letter-spacing: 2px; margin: 15px 0;">${otp}</h2>
          <p style="font-size: 14px; color: #555;">This code expires after <b>5 minutes</b>.  
          If you did not request this, please secure your account immediately.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">© 2025 Ride Sharing Pro. All rights reserved.</p>
        </div>
      </div>
    `,
  });
}

export async function sendSOSAlert(riderName: string, riderEmail: string, rideId: string, location?: { lat: number; lng: number }, message?: string) {
  const locationText = location ? `Latitude: ${location.lat}, Longitude: ${location.lng}` : "Location not available";
  const googleMapsLink = location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : "";
  
  await transporter.sendMail({
    to: process.env.ADMIN_EMAIL,
    from: process.env.EMAIL_FROM,
    subject: "🚨 EMERGENCY SOS ALERT - Ride Sharing Pro",
    text: `EMERGENCY SOS ALERT\n\nRider: ${riderName} (${riderEmail})\nRide ID: ${rideId}\nLocation: ${locationText}\nMessage: ${message || "No message provided"}\nTime: ${new Date().toISOString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #fff3cd; padding: 30px; border-left: 5px solid #dc3545;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 25px; box-shadow: 0 4px 12px rgba(220,53,69,0.2);">
          <h1 style="color: #dc3545; margin-bottom: 20px; text-align: center;">🚨 EMERGENCY SOS ALERT</h1>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #495057; margin-top: 0;">Rider Information</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${riderName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${riderEmail}</p>
            <p style="margin: 5px 0;"><strong>Ride ID:</strong> ${rideId}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="background: #fff3cd; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #856404; margin-top: 0;">Location Details</h3>
            <p style="margin: 5px 0;"><strong>Coordinates:</strong> ${locationText}</p>
            ${googleMapsLink ? `<p style="margin: 10px 0;"><a href="${googleMapsLink}" target="_blank" style="background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">View on Google Maps</a></p>` : ""}
          </div>
          ${message ? `<div style="background: #f1f3f4; padding: 20px; border-radius: 6px; margin-bottom: 20px;"><h3 style="color: #495057; margin-top: 0;">Message</h3><p style="font-style: italic;">${message}</p></div>` : ""}
          <div style="text-align: center; padding: 20px; background: #dc3545; color: white; border-radius: 6px;">
            <h3 style="margin: 0; color: white;">IMMEDIATE ACTION REQUIRED</h3>
            <p style="margin: 10px 0; color: white;">Please contact emergency services and the rider immediately.</p>
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999; text-align: center;">© 2025 Ride Sharing Pro - Emergency Alert System</p>
        </div>
      </div>
    `,
  });
}
