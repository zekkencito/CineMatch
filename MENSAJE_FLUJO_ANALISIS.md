# 🔄 Análisis del Flujo de Mensajes - Crash Debug

## 🎯 Flujo Completo de Envío de Mensaje

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. ChatScreen.handleSend()                                          │
│    - Valida que el mensaje no esté vacío                            │
│    - Llama: chatService.sendMessage(matchId, receiverId, text)     │
│    - Espera respuesta                                               │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 2. chatService.sendMessage()                                        │
│    - Prepara payload: { match_id, receiver_id, message }           │
│    - Hace POST request a: /api/messages                             │
│    - axios interceptor: agreg token Bearer                          │
│    - Espera respuesta 201                                           │
└─────────────────────────────────────────────────────────────────────┘
                           ↓ HTTP POST
┌─────────────────────────────────────────────────────────────────────┐
│ 3. BackendAPI (HTTPS Railway)                                       │
│    URL: https://cinematch-production-7ba5.up.railway.app/api/messages │
│    Middleware: auth:sanctum (valida token)                          │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 4. MessageController@sendMessage()                                  │
│                                                                      │
│ a) Validación de entrada                                            │
│    ✓ match_id (exists:matches,id)                                  │
│    ✓ receiver_id (exists:users,id)                                 │
│    ✓ message (string, max 1000)                                    │
│    [ERROR POSIBLE: Validación falla]                                │
│                                                                      │
│ b) Auth::id() - Obtiene ID del usuario actual                       │
│    [ERROR POSIBLE: Token sin usuario válido]                        │
│                                                                      │
│ c) Búsqueda del Match                                               │
│    WHERE match_id = $matchId                                        │
│    AND (user_one_id = $userId AND user_two_id = $receiverId)       │
│       OR (user_one_id = $receiverId AND user_two_id = $userId)     │
│    [ERROR POSIBLE: Match no existe o user no es parte]              │
│                                                                      │
│ d) Crear mensaje                                                    │
│    Message::create([...])                                           │
│    [ERROR POSIBLE: Foreign key violation, DB error]                 │
│                                                                      │
│ e) Cargar relaciones                                                │
│    $message->load(['sender', 'receiver'])                           │
│    [ERROR POSIBLE: Sender no existe]                                │
│                                                                      │
│ f) Enviar notificación Push (En try-catch ahora)                    │
│    ExpoPushService::send(...)                                       │
│                                                                      │
│ g) Retornar respuesta JSON 201                                      │
└─────────────────────────────────────────────────────────────────────┘
                           ↓ JSON Response
┌─────────────────────────────────────────────────────────────────────┐
│ 5. chatService.sendMessage() - Recibe respuesta                     │
│    - Parse JSON: response.data.data                                 │
│    - Retorna message object                                         │
│    [ERROR POSIBLE: Parse fail si JSON inválido]                     │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 6. ChatScreen.handleSend() - Recibe objeto de mensaje               │
│    - Llama loadMessages(false) para refrescar                       │
│    [ERROR POSIBLE: loadMessages tiene un error]                     │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 7. loadMessages() → GET /api/matches/{matchId}/messages             │
│    - Retorna array de mensajes                                      │
│    [ERROR POSIBLE: Array corrupto]                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🚨 Puntos de Falla Críticos

### **1. Validación Falla (422)**
```
Causa: payload incorrecto
Response: {
  "success": false,
  "message": "Validación fallida",
  "errors": {...}
}
```
🔧 **Debug**: Check console para `errors` exacto

---

### **2. Usuario No Autenticado (401)**
```
Causa: Token expirado/inválido
Response: {
  "success": false,
  "message": "Unauthenticated"
}
```
🔧 **XFix**: Re-login desde la app

---

### **3. Match No Válido (403)**
```
Causa: El usuario actual NO es parte del match
O: receiver_id no es el otro usuario del match
Response: {
  "success": false,
  "message": "Match inválido o no tienes acceso"
}
```
🔧 **Debug**: Verifica que match_id y receiver_id sean correctos

---

### **4. Error en Base de Datos (500)**
```
Causa: SQL error, foreign key violation, etc.
Response: {
  "success": false,
  "message": "Error al enviar mensaje: [SQL ERROR TEXT]"
}
```
🔧 **Debug**: Revisa logs del servidor para stack trace completo

---

### **5. Error en Carga de Relaciones (500)**
```
Causa: $message->sender no existe
Error: "Call to a member function name() on null"
Response: {
  "success": false,
  "message": "Error al enviar mensaje: [ERROR TEXT]"
}
```
🔧 **Debug**: Verifica que sender_id y receiver_id existen en DB

---

### **6. JSON Parse Error en Cliente**
```
Causa: Respuesta no es JSON válido
Síntoma: Error de Axios parsing
Console: "SyntaxError: Unexpected token"
```
🔧 **Debug**: Usa test_message_api.php para ver respuesta raw

---

## 🧪 Como Probar Paso a Paso

### **Test 1: API Health Check**
```bash
curl https://cinematch-production-7ba5.up.railway.app/api/check-tables
```
✅ Debería retornar: `{"success": true, "message": "All tables exist"}`

---

### **Test 2: Validación de Credenciales**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://cinematch-production-7ba5.up.railway.app/api/me
```
✅ Debería retornar: `{"success": true, "data": {...user data...}}`

---

### **Test 3: Listar Matches
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://cinematch-production-7ba5.up.railway.app/api/matches
```
✅ Debería retornar array de matches con `id`, `user_one_id`, `user_two_id`

---

### **Test 4: Enviar Mensaje (El que falla)
```bash
curl -X POST https://cinematch-production-7ba5.up.railway.app/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "match_id": 1,
    "receiver_id": 2,
    "message": "Test"
  }'
```

**Posibles respuestas:**

| Código | Significado | Fix |
|--------|------------|-----|
| 201 ✅ | Éxito | N/A |
| 422 | Validación falla | Check payload |
| 401 | Token inválido | Re-login |
| 403 | No autorizado | Check match membership |
| 500 | Database error | Check server logs |

---

## 📊 Información a Recopilar

Cuando vuelvas a reportar el error, comparte:

```
📱 Frontend Logs (ChatScreen):
- ❌ Error sending message: [EXACT ERROR MESSAGE]
- Error details: {
    message: "...",
    response: {status: XXX, data: {...}},
    stack: "..."
  }

🖥️ Backend Logs:
- SERVER ERROR: [MESSAGE]
- File: [PATH]:LINE
- Stack trace: [...]

🔗 Request Details:
- HTTP Method: POST
- URL: /api/messages
- Payload: {match_id: X, receiver_id: Y, message: "..."}
- Response Status: XXX
- Response Body: {...}
```

---

## ✅ Próximas Acciones

**1. Inmediatamente:**
   - Compila APK con logs nuevos: `eas build -p android --profile preview`
   - Recompila con los cambios de debug

**2. Luego reproduce el error:**
   - Ve a Chat
   - Intenta enviar un mensaje
   - Abre Logcat/Console
   - Copia el log exacto

**3. Comparte el log:**
   - Paste aquí el error exacto
   - O ejecuta el test manual: `php test_message_api.php ...`

**4. Una vez tengamos el error exacto:**
   - Identificamos la causa
   - Aplicamos fix específico
   - Re-deploasamos

---

*Actualizado con logging mejorado - Commit: 2c164f7*
