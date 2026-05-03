<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar contraseña - CineMatch</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
            color: #333;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #555;
        }
        .message {
            font-size: 14px;
            line-height: 1.6;
            color: #666;
            margin-bottom: 30px;
        }
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        .reset-button {
            display: inline-block;
            padding: 14px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .token-section {
            background-color: #f9f9f9;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
        }
        .token-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .token-value {
            font-family: 'Courier New', monospace;
            font-size: 13px;
            color: #333;
            word-break: break-all;
            background-color: #fff;
            padding: 10px;
            border-radius: 3px;
            border: 1px solid #e0e0e0;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 30px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #856404;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #e0e0e0;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 CineMatch</h1>
        </div>
        
        <div class="content">
            <div class="greeting">
                ¡Hola {{ $userName }}!
            </div>
            
            <div class="message">
                Recibimos una solicitud para recuperar la contraseña de tu cuenta en CineMatch. 
                Si fuiste tú, haz clic en el botón de abajo para establecer una nueva contraseña.
            </div>
            
            <div class="button-container">
                <a href="{{ $resetUrl }}" class="reset-button">
                    Recuperar contraseña
                </a>
            </div>
            
            <div class="message" style="text-align: center; font-size: 13px; color: #999;">
                O copia este código en tu app:
            </div>
            
            <div class="token-section">
                <div class="token-label">Código de recuperación</div>
                <div class="token-value">{{ $resetToken }}</div>
            </div>
            
            <div class="warning">
                ⚠️ Este enlace expirará en <strong>1 hora</strong>. Si no solicitaste recuperar tu contraseña, 
                ignora este correo y tu contraseña permanecerá sin cambios.
            </div>
            
            <div class="message" style="margin-top: 40px; margin-bottom: 10px; font-size: 13px; color: #999;">
                Por seguridad, nunca compartas este código con nadie.
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0;">© 2024 CineMatch. Todos los derechos reservados.</p>
            <p style="margin: 5px 0 0 0; font-size: 11px;">
                Si tienes preguntas, <a href="mailto:support@cinematch.com">contáctanos aquí</a>
            </p>
        </div>
    </div>
</body>
</html>
