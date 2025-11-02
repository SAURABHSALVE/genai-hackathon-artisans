with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the second occurrence of "import os" (the active one)
import_os_positions = []
lines = content.split('\n')
for i, line in enumerate(lines):
    if line.strip() == 'import os':
        import_os_positions.append(i)

if len(import_os_positions) < 2:
    print("Error: Could not find second 'import os'")
    exit(1)

active_start = import_os_positions[1]
print(f"Active code starts at line {active_start + 1}")

# Print lines around that position
print("\nLines around active code start:")
for i in range(max(0, active_start - 2), min(len(lines), active_start + 20)):
    print(f"{i+1}: {lines[i]}")
