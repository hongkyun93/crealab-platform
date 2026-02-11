#!/usr/bin/env pwsh

# List of files that still need updating
$files = @(
    "c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\app\debug-notifications\page.tsx",
    "c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\app\brand\settings\page.tsx",
    "c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\app\creator\settings\page.tsx",
    "c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\app\creator\new\page.tsx",
    "c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\app\creator\products\page.tsx",
    "c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\app\creator\products\[id]\page.tsx",
    "c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\app\brand\new\page.tsx",
    "c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\app\creator\edit\[id]\page.tsx",
    "c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\app\brand\edit\[id]\page.tsx",
    "c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\app\brand\products\new\page.tsx",
     "c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\app\admin\page.tsx",
   "c:\Users\voibi\.gemini\antigravity\scratch\crealab-platform\components\dashboard\product-detail-view.tsx"
)

$updated = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $newContent = $content -replace '@/components/providers/platform-provider', '@/components/providers/legacy-platform-hook'
        
        if ($content -ne $newContent) {
            Set-Content -Path $file -Value $newContent -Encoding UTF8 -NoNewline
            Write-Host "Updated: $file"
            $updated++  
        }
    }
}

Write-Host "`nTotal files updated: $updated"
