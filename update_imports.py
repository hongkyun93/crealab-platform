import os
import re

# Directories to search
search_dirs = [
    r'c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\app',
    r'c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\components',
    r'c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\lib'
]

updated_count = 0

for search_dir in search_dirs:
    for root, dirs, files in os.walk(search_dir):        
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                filepath = os.path.join(root, file)
                
                # Skip provider files themselves
                if 'providers' in filepath and (
                    'auth-provider' in file or
                    'campaign-provider' in file or
                    'event-provider' in file or
                    'product-provider' in file or
                    'proposal-provider' in file or
                    'message-provider' in file or
                    'favorite-provider' in file or
                    'unified-provider' in file or
                    'legacy-platform-hook' in file or
                    'platform-provider' in file
                ):
                    continue
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Replace the import
                    new_content = content.replace(
                        '@/components/providers/platform-provider',
                        '@/components/providers/legacy-platform-hook'
                    )
                    
                    if new_content != content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f'Updated: {filepath}')
                        updated_count += 1
                except Exception as e:
                    print(f' Error updating {filepath}: {e}')

print(f'\nTotal files updated: {updated_count}')
