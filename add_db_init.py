#!/usr/bin/env python3
"""Add database initialization on startup"""

with open('app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line after PORT = int(os.getenv("PORT", 3001))
new_lines = []
for i, line in enumerate(lines):
    new_lines.append(line)
    if 'PORT = int(os.getenv("PORT", 3001))' in line:
        # Add database initialization
        new_lines.append('\n')
        new_lines.append('# Initialize database tables on startup\n')
        new_lines.append('with app.app_context():\n')
        new_lines.append('    try:\n')
        new_lines.append('        db.create_all()\n')
        new_lines.append('        print("✅ Database tables created/verified")\n')
        new_lines.append('    except Exception as e:\n')
        new_lines.append('        print(f"❌ Database initialization error: {e}")\n')

with open('app.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✅ Added database initialization")
