import re

file_path = '/Users/kimhongkyun/Crealab/crealab-platform/lib/mock-data.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update MOCK_EVENTS
# These are objects in a list: { id: "...", ... targetProduct: "...", eventDate: "...", postingDate: "..." }
# We'll search for 'postingDate: "..." }' or 'eventDate: "..." }'
content = re.sub(r'(postingDate: "[^"]+")(\s+})', r'\1, isMock: true\2', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
