# Cloud SQL Setup Guide

## Current Issue
Your Cloud SQL instance is rejecting connections because:
1. **Your IP address is not authorized** - Cloud SQL has firewall rules
2. **SSL encryption is required** - Cloud SQL requires secure connections

## Solution Options

### Option 1: Add Your IP to Authorized Networks (Recommended for Development)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **SQL** → **artisans-db-instance**
3. Click on **Connections** tab
4. Under **Authorized networks**, click **Add network**
5. Add your current IP: `49.36.41.63/32`
6. Name it something like "Development Machine"
7. Click **Done** and **Save**

**Note:** Your IP address may change if you're on a dynamic IP. You may need to update this periodically.

### Option 2: Use Cloud SQL Proxy (Recommended for Production)

The Cloud SQL Proxy provides secure access without opening firewall ports.

#### Install Cloud SQL Proxy:

**Windows:**
```powershell
# Download the proxy
Invoke-WebRequest -Uri https://dl.google.com/cloudsql/cloud_sql_proxy_x64.exe -OutFile cloud_sql_proxy.exe

# Run the proxy
.\cloud_sql_proxy.exe --instances=hackathon-genai-475313:us-central1:artisans-db-instance=tcp:5432
```

**Then update your .env:**
```env
DB_HOST=127.0.0.1
DB_PORT=5432
```

The proxy will handle SSL and authentication automatically.

### Option 3: Allow All IPs (NOT RECOMMENDED - Security Risk)

Only use this for testing:
1. In Cloud SQL Connections
2. Add network: `0.0.0.0/0`
3. This allows connections from anywhere (insecure!)

## Current Configuration

Your `.env` file is configured with:
```
DB_USER=postgres
DB_PASS=Artisans123#
DB_HOST=34.71.220.95
DB_PORT=5432
DB_NAME=artisans
```

## Testing the Connection

After setting up authorized networks or the proxy, run:
```bash
python test_cloud_sql_connection.py
```

## What Happens When Connected

Once connected, the Flask app will:
1. ✅ Create the `user` table for login/registration
2. ✅ Create the `order_request` table for orders
3. ✅ Store all user registrations in Cloud SQL
4. ✅ Handle login authentication from Cloud SQL
5. ✅ Save order requests to Cloud SQL

## Fallback Behavior

If Cloud SQL connection fails, the app automatically falls back to SQLite:
- Local database file: `data.db`
- All features work the same
- Data is stored locally instead of in the cloud

## Next Steps

1. **Choose Option 1 or 2 above**
2. **Run the test script** to verify connection
3. **Start your Flask app** - it will create the tables automatically
4. **Test registration and login** through your frontend

## Troubleshooting

### Error: "pg_hba.conf rejects connection"
- Your IP is not authorized
- Follow Option 1 or 2 above

### Error: "Connection timeout"
- Check if Cloud SQL instance is running
- Verify the IP address is correct
- Check your internet connection

### Error: "SSL required"
- The app now handles SSL automatically
- If using Cloud SQL Proxy, SSL is handled by the proxy

## Verifying Everything Works

1. Start the Flask app:
   ```bash
   python app.py
   ```

2. You should see:
   ```
   ✅ Successfully connected to Cloud SQL (PostgreSQL).
   ✅ Database tables ensured.
   ```

3. Test registration via API:
   ```bash
   curl -X POST http://localhost:3001/api/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"test123","role":"buyer"}'
   ```

4. Test login:
   ```bash
   curl -X POST http://localhost:3001/api/login \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"test123"}'
   ```

## Database Tables Created

### User Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password_hash` - Encrypted password
- `role` - 'buyer', 'artisan', or 'seller'

### OrderRequest Table
- `id` - Primary key
- `artisan_id` - Foreign key to User
- `story_id` - Story UUID
- `story_title` - Title of the craft
- `buyer_name` - Buyer's name
- `buyer_email` - Buyer's email
- `buyer_phone` - Buyer's phone (optional)
- `quantity` - Order quantity
- `customization` - Custom requests
- `timestamp` - When order was placed
- `is_read` - Whether artisan has seen it
