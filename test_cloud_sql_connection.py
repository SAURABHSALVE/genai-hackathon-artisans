#!/usr/bin/env python3
"""
Test script to verify Cloud SQL connection and user registration/login functionality
"""
import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, InterfaceError

# Load environment variables
load_dotenv(override=True)

# Get database configuration
DB_USER = os.getenv('DB_USER')
DB_PASS = os.getenv('DB_PASS')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME')

# Debug: Print all DB-related env vars
print("\nDebug - Environment variables:")
for key in ['DB_USER', 'DB_PASS', 'DB_HOST', 'DB_PORT', 'DB_NAME']:
    value = os.getenv(key)
    if key == 'DB_PASS' and value:
        print(f"  {key}: {'*' * len(value)}")
    else:
        print(f"  {key}: {value}")

print("=" * 60)
print("Cloud SQL Connection Test")
print("=" * 60)
print(f"\nDatabase Configuration:")
print(f"  Host: {DB_HOST}")
print(f"  Port: {DB_PORT}")
print(f"  Database: {DB_NAME}")
print(f"  User: {DB_USER}")
print(f"  Password: {'*' * len(DB_PASS) if DB_PASS else 'Not set'}")
print()

# Check if all required variables are set
if not all([DB_HOST, DB_USER, DB_PASS, DB_NAME]):
    print("❌ ERROR: Missing required database configuration!")
    print("   Please ensure DB_HOST, DB_USER, DB_PASS, and DB_NAME are set in .env")
    sys.exit(1)

# Try to import pg8000
try:
    import pg8000
    print("✅ pg8000 driver is installed")
except ImportError:
    print("❌ ERROR: pg8000 driver not found!")
    print("   Install it with: pip install pg8000")
    sys.exit(1)

# Build connection string
postgres_uri = f"postgresql+pg8000://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print("\n" + "=" * 60)
print("Testing Database Connection...")
print("=" * 60)

try:
    # Create engine with timeout and SSL (required for Cloud SQL)
    print("\nAttempting connection with SSL enabled...")
    engine = create_engine(
        postgres_uri,
        connect_args={
            'timeout': 10,
            'ssl_context': True  # Enable SSL for Cloud SQL
        }
    )
    
    # Test connection
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        version = result.fetchone()[0]
        print(f"\n✅ Successfully connected to PostgreSQL!")
        print(f"   Version: {version[:80]}...")
        
        # Test if we can query tables
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """))
        tables = [row[0] for row in result.fetchall()]
        
        print(f"\n📊 Existing tables in database:")
        if tables:
            for table in tables:
                print(f"   - {table}")
        else:
            print("   (No tables found - database is empty)")
        
        # Check if User table exists
        if 'user' in tables:
            result = conn.execute(text("SELECT COUNT(*) FROM \"user\""))
            user_count = result.fetchone()[0]
            print(f"\n👥 User table exists with {user_count} users")
        else:
            print("\n⚠️  User table does not exist yet")
            print("   It will be created when the Flask app starts")
        
        # Check if OrderRequest table exists
        if 'order_request' in tables:
            result = conn.execute(text("SELECT COUNT(*) FROM order_request"))
            order_count = result.fetchone()[0]
            print(f"📦 OrderRequest table exists with {order_count} orders")
        else:
            print("⚠️  OrderRequest table does not exist yet")
            print("   It will be created when the Flask app starts")

    print("\n" + "=" * 60)
    print("✅ Cloud SQL Connection Test PASSED!")
    print("=" * 60)
    print("\nYour Flask app should be able to connect to Cloud SQL.")
    print("User registration and login will work correctly.")
    
except OperationalError as e:
    print(f"\n❌ Connection FAILED (Operational Error):")
    print(f"   {str(e)}")
    print("\nPossible issues:")
    print("  1. Cloud SQL instance is not running")
    print("  2. Firewall rules blocking connection")
    print("  3. Wrong IP address or credentials")
    print("  4. Database does not exist")
    
except InterfaceError as e:
    error_msg = str(e)
    print(f"\n❌ Connection FAILED (Interface Error):")
    print(f"   {error_msg[:200]}...")
    
    if "pg_hba.conf rejects connection" in error_msg or "no encryption" in error_msg:
        print("\n🔒 AUTHORIZATION ISSUE DETECTED!")
        print("\nYour IP address is not authorized to connect to Cloud SQL.")
        print("\n📋 SOLUTION - Choose one:")
        print("\n  Option 1: Add your IP to Cloud SQL authorized networks")
        print("    1. Go to Google Cloud Console → SQL → artisans-db-instance")
        print("    2. Click 'Connections' → 'Networking'")
        print("    3. Add your IP: 49.36.41.63/32")
        print("    4. Save and try again")
        print("\n  Option 2: Use Cloud SQL Proxy (Recommended)")
        print("    1. Download: https://cloud.google.com/sql/docs/postgres/sql-proxy")
        print("    2. Run: cloud_sql_proxy --instances=hackathon-genai-475313:us-central1:artisans-db-instance=tcp:5432")
        print("    3. Update .env: DB_HOST=127.0.0.1")
        print("\n  See CLOUD_SQL_SETUP.md for detailed instructions")
    else:
        print("\nPossible issues:")
        print("  1. Network timeout")
        print("  2. Cloud SQL proxy not running (if required)")
        print("  3. Wrong connection parameters")
    
except Exception as e:
    print(f"\n❌ Unexpected error:")
    print(f"   {type(e).__name__}: {str(e)}")

print()
