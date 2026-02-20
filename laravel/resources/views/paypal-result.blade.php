<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resultado del Pago - CineMatch</title>
    <style>
        :root{
            --bg:#1a1a2e;
            --primary-1:#667eea;
            --primary-2:#764ba2;
            --card-gradient: linear-gradient(135deg,var(--primary-1),var(--primary-2));
            --muted:#9ca3af;
            --text-dark:#1f2937;
            --success:#10b981;
            --error:#ef4444;
        }
        *{margin:0;padding:0;box-sizing:border-box}
        body{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--bg);
            min-height:100vh;
            display:flex;align-items:center;justify-content:center;padding:20px;color:#fff
        }
        .container{
            background: var(--card-gradient);
            border-radius:20px;
            box-shadow:0 30px 80px rgba(0,0,0,0.45);
            max-width:520px;width:100%;padding:28px;text-align:center;color:#fff;position:relative;overflow:hidden
        }
        .brand {
            width:72px;height:72px;border-radius:16px;background:rgba(255,255,255,0.06);display:inline-flex;align-items:center;justify-content:center;margin:0 auto 14px;object-fit:contain
        }
        .icon{font-size:56px;margin-bottom:10px}
        .success{color:var(--success)}
        .error{color:var(--error)}
        h1{font-size:22px;margin-bottom:10px;color:#fff}
        p{font-size:15px;color:rgba(255,255,255,0.85);line-height:1.6;margin-bottom:18px}
        .order-id{background:rgba(255,255,255,0.08);padding:10px;border-radius:10px;font-family:monospace;font-size:13px;color:#fff;margin-bottom:18px;word-break:break-all}
        .btn{display:inline-block;background:linear-gradient(90deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06));color:#fff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 8px 24px rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08)}
        .btn:active{transform:translateY(1px)}
        .footer{margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.04);font-size:13px;color:var(--muted)}
        @media (max-width:420px){.container{padding:20px}}
    </style>
</head>
<body>
    <div class="container">
        <img class="brand" src="/assets/logo/LOGO_README.md" alt="CineMatch logo" onerror="this.style.display='none'" />
        @if($success)
            <div class="icon success">✓</div>
            <h1>¡Pago completado!</h1>
        @else
            <div class="icon error">✕</div>
            <h1>Pago no completado</h1>
        @endif

        <p>{{ $message }}</p>

        @if(isset($orderId))
            <div class="order-id">
                <strong>ID de Orden:</strong><br>
                {{ $orderId }}
            </div>
        @endif

        @if(isset($orderId) && $orderId)
            <button id="openAppBtn" class="btn" data-orderid="{{ $orderId }}" data-status="{{ $success ? 'success' : 'cancelled' }}">Volver a CineMatch</button>
        @else
            <a href="#" class="btn" onclick="window.close(); return false;">Cerrar ventana</a>
        @endif

        <div class="footer">
            @if($success)
                Tu suscripción Premium ya está activa.<br>
                <small>Si no abre la app automáticamente, pulsa "Volver a CineMatch"</small>
            @else
                Puedes cerrar esta ventana y volver a intentarlo
            @endif
        </div>
    </div>
    
    <script>
        // Auto-redirigir a la app usando múltiples métodos
        @if($success && isset($orderId))
        (function() {
            const orderId = '{{ $orderId }}';
            const status = 'success';
            const deepLink = `cinematch://payment/return?orderId=${orderId}&status=${status}`;
            
            console.log('Intentando abrir app con deep link:', deepLink);
            
            // Método 1: window.location (inmediato)
            setTimeout(function() {
                console.log('Ejecutando redirección a:', deepLink);
                window.location.href = deepLink;
            }, 800);
            
            // Método 2: Iframe invisible (mejor compatibilidad en algunos navegadores)
            setTimeout(function() {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = deepLink;
                document.body.appendChild(iframe);
                
                // Limpiar iframe después
                setTimeout(function() {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 800);
            
            // Método 3: Intent directo para Android (en navegador Chrome)
            if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
                setTimeout(function() {
                    const intentUrl = `intent://payment/return?orderId=${orderId}&status=${status}#Intent;scheme=cinematch;package=com.anonymous.CineMatchApp;end;`;
                    window.location.href = intentUrl;
                }, 1200);
            }
        })();
        @elseif(isset($orderId))
        // Pago cancelado o fallido
        (function() {
            const orderId = '{{ $orderId }}';
            const deepLink = `cinematch://payment/return?orderId=${orderId}&status=cancelled`;
            
            setTimeout(function() {
                window.location.href = deepLink;
            }, 500);
            
            setTimeout(function() {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = deepLink;
                document.body.appendChild(iframe);
                setTimeout(function() {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 800);
        })();
        @endif

        // Función para el botón manual: intenta abrir la app y ofrece copiado del enlace
        function tryOpenAppManual(orderId, status) {
            const deepLink = `cinematch://payment/return?orderId=${orderId}&status=${status}`;
            // Intentar abrir por varios métodos
            // 1) window.location
            window.location.href = deepLink;

            // 2) iframe (para navegadores que bloquean el cambio de location)
            setTimeout(function() {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = deepLink;
                document.body.appendChild(iframe);
                setTimeout(function() { try { document.body.removeChild(iframe); } catch(e){} }, 1000);
            }, 200);

            // 3) intent:android (Chrome on Android)
            setTimeout(function() {
                if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
                    const intentUrl = `intent://payment/return?orderId=${orderId}&status=${status}#Intent;scheme=cinematch;package=com.anonymous.CineMatchApp;end;`;
                    window.location.href = intentUrl;
                }
            }, 500);

            // 4) fallback visible: mostrar prompt con enlace para copiar si no abrió
            setTimeout(function() {
                const text = 'Si la app no se abrió, copia este enlace y pégalo en tu dispositivo:\n' + deepLink;
                // mostrar prompt para copiar en navegadores que lo permitan
                try {
                    navigator.clipboard && navigator.clipboard.writeText(deepLink).then(function(){
                        alert('Enlace copiado al portapapeles. Abre la app o pega el enlace.');
                    }).catch(function(){
                        alert(text);
                    });
                } catch (e) {
                    alert(text);
                }
            }, 1200);
        }

        // Conectar eventos de los botones cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', function() {
            const openBtn = document.getElementById('openAppBtn');
            const copyBtn = document.getElementById('copyLinkBtn');
            if (openBtn) {
                openBtn.addEventListener('click', function(e) {
                    const orderId = this.getAttribute('data-orderid');
                    const status = this.getAttribute('data-status');
                    tryOpenAppManual(orderId, status);
                });
            }
            if (copyBtn) {
                copyBtn.addEventListener('click', function(e) {
                    const orderId = openBtn && openBtn.getAttribute('data-orderid');
                    const status = openBtn && openBtn.getAttribute('data-status');
                    const deepLink = `cinematch://payment/return?orderId=${orderId}&status=${status}`;
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(deepLink).then(function(){
                            alert('Enlace copiado al portapapeles');
                        }, function(){
                            prompt('Copia manualmente este enlace:', deepLink);
                        });
                    } else {
                        prompt('Copia manualmente este enlace:', deepLink);
                    }
                });
            }
        });
    </script>
</body>
</html>
