# 🔍 Diagnóstico: Crash al Enviar Mensajes

## Cambios Implementados (Latest Commit)

He añadido **logging detallado** para diagnosticar exactamente dónde está el problema:

### Backend (Laravel)
- ✅ Tales de error en `MessageController` con stack traces completos
- ✅ Logs de todos los pasos importantes
- ✅ Manejo robusto de errores en notificaciones Push

### Frontend (React Native)
- ✅ Logs detallados en `ChatScreen.handleSend()`
- ✅ Logs en `chatService.sendMessage()`
- ✅ Captura de respuestas y errores con detalles

### Herramientas de Testing
- ✅ `test_message_api.php` para probar el endpoint manualmente

---

## 📋 Pasos para Diagnosticar

### Opción 1: Revisar Logs del Backend (Railway)
Necesito tu subscription ID de Azure, pero puedo verificar los logs directamente.

### Opción 2: Probar Manualmente el API
```bash
# 1. Obtén tu token de autenticación (desde la app o las respuestas anteriores)
# 2. Obtén un match_id válido (de un match existente)
# 3. Ejecuta el test desde CLI:

php test_message_api.php "Bearer YOUR_TOKEN" MATCH_ID RECEIVER_ID "Test message"
```

**Ejemplo:**
```bash
php test_message_api.php "Bearer 1|abc123..." 5 3 "¿Hola, cómo estás?"
```

### Opción 3: Ver Logs en la App Compilada
1. **Recompila la APK:**
   ```bash
   cd CineMatchApp
   eas build -p android --profile preview
   ```

2. **Instala la APK con logs:**
   - Usa `expo-pwa` o conecta fisica/emulador
   - Lee la consola cuando ocurra el crash

3. **Reproduce el error:** Intenta enviar un mensaje

4. **Busca en los logs:**
   - `📤 Enviando mensaje:`
   - `✅ Mensaje enviado exitosamente:`
   - `❌ Error sending message:`
   - `💥 Error in sendMessage:`

---

## 🎯 Información que Necesito

Para diagnosticar completamente, por favor:

1. **Comparte el error exacto** que ves en la consola (con los logs nuevos):
   ```
   ❌ Error sending message: [AQUI EL ERROR]
   Error details: {...}
   ```

2. **O ejecuta el test manual** y comparte la respuesta:
   ```bash
   php test_message_api.php "Bearer ..." 1 2 "Hola"
   ```

3. **Confirma:**
   - ¿La app mostró un Alert con "No se pudo enviar el mensaje"?
   - ¿O se cierra silenciosamente sin Alert?
   - ¿Ocurre con todos los mensajes o solo con algunos?

---

## 🔧 Posibles Causas Identificadas

### 1. **Validación de Match Fallida**
- El match_id o receiver_id no son válidos
- El usuario actual no es parte de ese match
- **Síntoma:** Error 403 "Match invalido o no tienes acceso"

### 2. **Token Expirado/Inválido**
- El token de autenticación expiró
- **Síntoma:** Error 401 "Unauthorized"

### 3. **Problema en Relaciones de BD**
- No se puede cargar `$message->sender->name`
- **Síntoma:** Error 500 con "Call to a member function on null"

### 4. **Error en Notificación Push**
- Expo Push Service falla (ya tiene try-catch ahora)
- **Síntoma:** Mensaje cread pero app pensó que falló

### 5. **Parse Error en Respuesta**
- La respuesta del servidor no es JSON válido
- **Síntoma:** Error de parseo en Axios

---

## ✅ Próximos Pasos

**Después de obtener el log de error exacto:**

1. Si es validación de match → Revisar qué usuario está intentando enviar
2. Si es token → Hacer refresh del token en la app
3. Si es relación BD → Revisar integridad de datos
4. Si es otro → Implementar fix específico

**¿Quieres:**
- Ejecutar el test manual y compartir resultado?
- Recompilar la APK para ver los logs en detalle?
- Compartir un comando curl manual para probar?
