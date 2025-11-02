#!/usr/bin/env python3
"""Complete fix for app.py to resolve all model import issues"""

# Read the file
with open('app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the active code section (around line 1118)
active_section_start = None
for i, line in enumerate(lines):
    if i > 1100 and line.strip() == 'import os':
        active_section_start = i
        break

if not active_section_start:
    print("❌ Could not find active code section")
    exit(1)

print(f"✅ Found active code section at line {active_section_start + 1}")

# Find where to insert the models import
# Look for the line with "from flask_socketio import SocketIO"
insert_position = None
for i in range(active_section_start, min(active_section_start + 50, len(lines))):
    if 'from flask_socketio import SocketIO' in lines[i]:
        insert_position = i + 1
        break

if not insert_position:
    print("❌ Could not find insertion point")
    exit(1)

# Check if models import already exists
models_import_exists = False
for i in range(active_section_start, insert_position + 10):
    if 'from services.models import' in lines[i]:
        models_import_exists = True
        print(f"✅ Models import already exists at line {i + 1}")
        break

# Add the import if it doesn't exist
if not models_import_exists:
    lines.insert(insert_position, 'from services.models import db, User, Story, Like, Comment, OrderRequest\n')
    print(f"✅ Added models import at line {insert_position + 1}")
    insert_position += 1  # Adjust for the new line

# Now find and comment out the duplicate db and bcrypt initialization
# Look for "db = SQLAlchemy(app)" and "bcrypt = Bcrypt(app)"
for i in range(insert_position, min(insert_position + 200, len(lines))):
    line = lines[i]
    if line.strip().startswith('db = SQLAlchemy(app)'):
        lines[i] = '# ' + line + '# DISABLED: Using db from services.models instead\n'
        print(f"✅ Commented out duplicate db initialization at line {i + 1}")
    elif line.strip().startswith('bcrypt = Bcrypt(app)'):
        lines[i] = '# ' + line + '# DISABLED: Using bcrypt from services.models instead\n'
        print(f"✅ Commented out duplicate bcrypt initialization at line {i + 1}")

# Write the fixed content
with open('app.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("\n✅ Fixed app.py successfully!")
print("   - Added models import from services.models")
print("   - Commented out duplicate db and bcrypt initialization")
