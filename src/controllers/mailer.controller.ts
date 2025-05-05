import nodemailer from 'nodemailer';
import { Request, Response } from 'express';

// Crear transporter de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || '10.0.3.20',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.MAIL_USER || 'brisca@briqven.com.ve', 
    pass: process.env.MAIL_PASSWORD || 'matesi112022'
  },
  tls: {
    rejectUnauthorized: false,
  }
});

export const sendReunionNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reunionId, subject, recipients, content } = req.body;
    
    // Validaciones básicas
    if (!subject || !recipients || !recipients.length || !content) {
      res.status(400).json({ message: 'Faltan datos requeridos para enviar la notificación' });
      return;
    }
    
    // Crear el contenido del correo en HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3c4b64;">Notificación de Reunión</h2>
        <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin-top: 20px;">
          <h3 style="margin-top: 0;">${content.tema}</h3>
          <p><strong>Fecha:</strong> ${content.fecha}</p>
          <p><strong>Hora:</strong> ${content.hora}</p>
          <p><strong>Lugar:</strong> ${content.lugar}</p>
          <p><strong>Tipo:</strong> ${content.tipo}</p>
          <p><strong>Responsable:</strong> ${content.responsable}</p>
          
          <div style="margin-top: 20px;">
            <h4>Integrantes:</h4>
            <ul>
              ${content.integrantes.map((integrante: string) => `<li>${integrante}</li>`).join('')}
            </ul>
          </div>
          
          <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
            Este es un mensaje automático del Sistema Bitacora modulo Gestión de Reuniones.
          </p>
        </div>
      </div>
    `;

    // Enviar el correo
    const info = await transporter.sendMail({
      from: process.env.MAIL_USER  || 'brisca@briqven.com.ve',//`"Sistema de Bitácora" <${process.env.MAIL_USER}>`,
      to: recipients.join(', '),
      subject: subject,
      html: htmlContent
    });
    
    res.status(200).json({
      success: true,
      message: 'Notificación enviada exitosamente',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    res.status(500).json({ message: 'Error al enviar la notificación' });
  }
};

// Exportar otros controladores según sea necesario