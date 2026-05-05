<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
        }
        .header {
            background-color: #FF6B35;
            color: white;
            padding: 15px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 8px 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>📧 Mensaje de CineMatch</h2>
        </div>
        
        <div class="content">
            <p>Hola <strong>{{ $userName }}</strong>,</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #FF6B35; margin: 20px 0;">
                {!! nl2br($messageBody) !!}
            </div>
            
            <p>Gracias por ser parte de CineMatch.</p>
        </div>
        
        <div class="footer">
            <p>© 2026 CineMatch. Todos los derechos reservados.</p>
            <p>Este es un mensaje automático de tu equipo de administración.</p>
        </div>
    </div>
</body>
</html>
